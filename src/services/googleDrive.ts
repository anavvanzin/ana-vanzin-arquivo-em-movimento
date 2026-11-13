import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { DeckId, LangCode, SlideItem } from '../types';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/presentations.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token strictly in memory (never localStorage or sessionStorage).
let cachedAccessToken: string | null = null;

type AuthListener = (state: { user: User | null; accessToken: string | null; needsAuth: boolean }) => void;
const authListeners = new Set<AuthListener>();

function notifyListeners() {
  const user = auth.currentUser;
  const needsAuth = !user || !cachedAccessToken;
  authListeners.forEach((fn) =>
    fn({
      user,
      accessToken: cachedAccessToken,
      needsAuth,
    })
  );
}

export const subscribeDriveAuth = (listener: AuthListener) => {
  authListeners.add(listener);
  listener({
    user: auth.currentUser,
    accessToken: cachedAccessToken,
    needsAuth: !auth.currentUser || !cachedAccessToken,
  });
  return () => {
    authListeners.delete(listener);
  };
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
    notifyListeners();
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    notifyListeners();
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      // User closed the popup window deliberately - not an error
      return null;
    }
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const clearAccessToken = () => {
  cachedAccessToken = null;
  notifyListeners();
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  notifyListeners();
};

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  description?: string;
  parents?: string[];
  owners?: { displayName?: string; emailAddress?: string }[];
}

export interface DriveActivityEntry {
  id: string;
  timestamp: string;
  actionLabel: string;
  targetTitle: string;
  actorName?: string;
}

export type DriveFilterCategory = 'all' | 'slides' | 'docs' | 'json' | 'images' | 'folders';

export class DriveAuthRequiredError extends Error {
  constructor(message = 'Autenticação com Google necessária para acessar o Google Drive.') {
    super(message);
    this.name = 'DriveAuthRequiredError';
  }
}

export async function driveFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new DriveAuthRequiredError();
  }

  const headers = new Headers(init?.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearAccessToken();
    throw new DriveAuthRequiredError('Sua sessão do Google Drive expirou. Entre novamente com o Google.');
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errJson = await response.json();
      detail = errJson?.error?.message || '';
    } catch {
      // ignore json parse error
    }
    throw new Error(detail || `Erro na API do Google Drive (${response.status}).`);
  }

  return response;
}

function escapeDriveQueryValue(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function listDriveFiles(options: {
  searchQuery?: string;
  folderId?: string | null;
  category?: DriveFilterCategory;
  pageSize?: number;
  pageToken?: string;
}): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  const clauses: string[] = ['trashed = false'];

  if (options.folderId) {
    clauses.push(`'${escapeDriveQueryValue(options.folderId)}' in parents`);
  }

  if (options.searchQuery && options.searchQuery.trim()) {
    const q = escapeDriveQueryValue(options.searchQuery.trim());
    clauses.push(`name contains '${q}'`);
  }

  switch (options.category) {
    case 'slides':
      clauses.push(
        `(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.ms-powerpoint' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`
      );
      break;
    case 'json':
      clauses.push(`(mimeType = 'application/json' or name contains '.json')`);
      break;
    case 'docs':
      clauses.push(
        `(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType = 'text/plain' or mimeType = 'text/markdown')`
      );
      break;
    case 'images':
      clauses.push(`mimeType contains 'image/'`);
      break;
    case 'folders':
      clauses.push(`mimeType = 'application/vnd.google-apps.folder'`);
      break;
    default:
      break;
  }

  const params = new URLSearchParams({
    q: clauses.join(' and '),
    pageSize: String(options.pageSize || 30),
    orderBy: 'folder,modifiedTime desc',
    fields:
      'nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,description,parents,owners(displayName,emailAddress))',
  });

  if (options.pageToken) {
    params.set('pageToken', options.pageToken);
  }

  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
  const data = await res.json();
  return {
    files: (data.files as DriveFileItem[]) || [],
    nextPageToken: data.nextPageToken,
  };
}

export async function findDriveFolderByName(folderName: string): Promise<DriveFileItem | null> {
  const q = [
    `trashed = false`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `name = '${escapeDriveQueryValue(folderName)}'`,
  ].join(' and ');

  const params = new URLSearchParams({
    q,
    pageSize: '5',
    fields: 'files(id,name,mimeType,webViewLink,modifiedTime)',
  });

  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
  const data = await res.json();
  return (data.files?.[0] as DriveFileItem) || null;
}

export async function createDriveFolder(
  folderName: string,
  description?: string
): Promise<DriveFileItem> {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    description:
      description || 'Repositório documental e edições multilíngues do projeto ICONOCRACIA (PPGD/UFSC)',
  };

  const res = await driveFetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink,modifiedTime',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    }
  );
  return (await res.json()) as DriveFileItem;
}

export async function findExistingFileByName(
  fileName: string,
  parentId?: string | null
): Promise<DriveFileItem | null> {
  const clauses = [
    `trashed = false`,
    `mimeType != 'application/vnd.google-apps.folder'`,
    `name = '${escapeDriveQueryValue(fileName)}'`,
  ];
  if (parentId) {
    clauses.push(`'${escapeDriveQueryValue(parentId)}' in parents`);
  }

  const params = new URLSearchParams({
    q: clauses.join(' and '),
    pageSize: '3',
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink,size)',
  });

  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
  const data = await res.json();
  return (data.files?.[0] as DriveFileItem) || null;
}

export async function uploadTextOrDocToDrive(options: {
  name: string;
  content: string;
  contentMimeType: string;
  targetDriveMimeType?: string;
  parentId?: string | null;
  existingFileId?: string;
  description?: string;
}): Promise<DriveFileItem> {
  const metadata: Record<string, unknown> = {
    name: options.name,
  };
  if (options.description) {
    metadata.description = options.description;
  }
  if (options.targetDriveMimeType && !options.existingFileId) {
    metadata.mimeType = options.targetDriveMimeType;
  }
  if (options.parentId && !options.existingFileId) {
    metadata.parents = [options.parentId];
  }

  const boundary = 'iconocracia_drive_boundary_' + Date.now().toString(36);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${options.contentMimeType}; charset=UTF-8\r\n\r\n` +
    options.content +
    closeDelim;

  const endpoint = options.existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
        options.existingFileId
      )}?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`;

  const res = await driveFetch(endpoint, {
    method: options.existingFileId ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  return (await res.json()) as DriveFileItem;
}

export async function uploadBinaryFileToDrive(options: {
  file: File;
  parentId?: string | null;
  existingFileId?: string;
  description?: string;
}): Promise<DriveFileItem> {
  const metadata: Record<string, unknown> = {
    name: options.file.name,
  };
  if (options.description) {
    metadata.description = options.description;
  }
  if (options.parentId && !options.existingFileId) {
    metadata.parents = [options.parentId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', options.file);

  const endpoint = options.existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
        options.existingFileId
      )}?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`;

  const res = await driveFetch(endpoint, {
    method: options.existingFileId ? 'PATCH' : 'POST',
    body: form,
  });

  return (await res.json()) as DriveFileItem;
}

export async function downloadDriveFileText(
  fileId: string,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await driveFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId
      )}/export?mimeType=text/plain`
    );
    return await res.text();
  }

  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`
  );
  return await res.text();
}

export async function renameDriveFile(
  fileId: string,
  newName: string
): Promise<DriveFileItem> {
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    }
  );
  return (await res.json()) as DriveFileItem;
}

export async function trashDriveFile(fileId: string): Promise<void> {
  await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trashed: true }),
    }
  );
}

export async function fetchRecentDriveActivity(
  pageSize = 6
): Promise<DriveActivityEntry[]> {
  try {
    const res = await driveFetch('https://driveactivity.googleapis.com/v2/activity:query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSize }),
    });
    const data = await res.json();
    const activities = Array.isArray(data.activities) ? data.activities : [];

    return activities.map((act: Record<string, unknown>, idx: number) => {
      const primary = (act.primaryActionDetail || {}) as Record<string, unknown>;
      let actionLabel = 'Atividade registrada';
      if ('create' in primary) actionLabel = 'Criado';
      else if ('edit' in primary) actionLabel = 'Editado';
      else if ('rename' in primary) actionLabel = 'Renomeado';
      else if ('move' in primary) actionLabel = 'Movido';
      else if ('delete' in primary) actionLabel = 'Movido para lixeira';
      else if ('restore' in primary) actionLabel = 'Restaurado';
      else if ('permissionChange' in primary) actionLabel = 'Permissões alteradas';

      const targets = Array.isArray(act.targets) ? act.targets : [];
      const firstTarget = (targets[0] || {}) as {
        driveItem?: { title?: string };
      };
      const targetTitle = firstTarget.driveItem?.title || 'Item do Google Drive';

      const timestamp =
        typeof act.timestamp === 'string'
          ? act.timestamp
          : ((act.timeRange as { endTime?: string } | undefined)?.endTime ?? '');

      return {
        id: `${timestamp || idx}-${idx}`,
        timestamp,
        actionLabel,
        targetTitle,
      };
    });
  } catch {
    return [];
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPresentationGoogleDocHtml(options: {
  deck: DeckId;
  deckTitle: string;
  lang: LangCode;
  slides: SlideItem[];
  getPresenterNote?: (deck: DeckId, index: number) => string;
}): string {
  const rows = options.slides
    .map((slide, idx) => {
      const slideNum = String(idx + 1).padStart(2, '0');
      const blocksHtml = slide.blocks
        .map(
          (b) =>
            `<p style="margin:6px 0 10px 0;line-height:1.55;">${
              b.label
                ? `<strong style="text-transform:uppercase;font-size:10pt;color:#1e3a8a;">[${escapeHtml(
                    b.label
                  )}]</strong> `
                : ''
            }${escapeHtml(b.text).replace(/\n/g, '<br/>')}</p>`
        )
        .join('');

      const note = options.getPresenterNote ? options.getPresenterNote(options.deck, idx) : '';

      return `
        <hr style="border:none;border-top:1px solid #d6cebe;margin:20px 0;"/>
        <h2 style="font-family:Georgia,serif;font-size:15pt;color:#181615;margin-bottom:6px;">
          Slide ${slideNum} — ${escapeHtml(slide.title).replace(/\n/g, ' ')}
        </h2>
        ${blocksHtml}
        ${
          slide.footer
            ? `<p style="font-family:Georgia,serif;font-style:italic;font-size:10pt;color:#524d46;">Nota metodológica: ${escapeHtml(
                slide.footer
              )}</p>`
            : ''
        }
        ${
          note
            ? `<p style="font-size:9.5pt;color:#68625b;background:#f6f3ec;padding:8px;">Roteiro de fala (PT): ${escapeHtml(
                note
              )}</p>`
            : ''
        }
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${options.lang}">
<head><meta charset="UTF-8"><title>${escapeHtml(options.deckTitle)} (${options.lang.toUpperCase()})</title></head>
<body style="font-family:Arial,sans-serif;color:#181615;max-width:720px;margin:0 auto;">
  <p style="font-size:9.5pt;letter-spacing:1px;text-transform:uppercase;color:#68625b;">
    ICONOCRACIA · PPGD/UFSC · Ana Vitória Vanzin Mendes
  </p>
  <h1 style="font-family:Georgia,serif;font-size:22pt;color:#181615;margin-top:4px;">
    ${escapeHtml(options.deckTitle)} — Edição ${options.lang.toUpperCase()}
  </h1>
  <p style="font-size:10pt;color:#524d46;">
    Manuscrito exportado em ${new Date().toLocaleDateString('pt-BR')} (${options.slides.length} slides).
  </p>
  ${rows}
</body>
</html>`;
}
