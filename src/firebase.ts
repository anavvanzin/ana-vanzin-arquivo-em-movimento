import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DeckId, LangCode } from './types';

const app = initializeApp(firebaseConfig);
const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);

const basicGoogleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errStr = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const WORKSPACE_CONSTRAINTS = {
  ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  MAX_ID_LEN: 128,
  MAX_DISPLAY_NAME_LEN: 120,
  MAX_TITLE_LEN: 300,
  MAX_FOOTER_LEN: 600,
  MAX_BLOCK_LABEL_LEN: 160,
  MAX_BLOCK_TEXT_LEN: 1500,
  MAX_PHILOLOGY_LEN: 1000,
  MAX_PRESENTER_NOTE_LEN: 3000,
  MAX_QUERY_TITLE_LEN: 300,
  MAX_SYNTHESIS_LEN: 8000,
  MAX_SOURCES_SUMMARY_LEN: 3000,
  MAX_ATELIER_TITLE_LEN: 240,
  MAX_ATELIER_PROMPT_LEN: 2000,
  MAX_ATELIER_SPEC_LEN: 240,
} as const;

export function sanitizeBoundedString(val: string | undefined, maxLen: number): string {
  if (!val) return '';
  return val.slice(0, maxLen);
}

export function makeFirestoreRevisionId(deck: DeckId, lang: LangCode, slideIndex: number): string {
  const safeIdx = Math.max(0, Math.min(13, Math.floor(slideIndex)));
  return `${deck}_${lang}_${String(safeIdx).padStart(2, '0')}`;
}

export async function signInWithFirebaseGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, basicGoogleProvider);
    return result.user;
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return null;
    }
    console.warn('Autenticação Google cancelada ou interrompida:', error);
    return null;
  }
}

export async function ensureUserWorkspaceDocument(
  user: User,
  preferredDeck: DeckId = 'representacao',
  preferredLang: LangCode = 'pt'
): Promise<boolean> {
  if (!user?.uid || !WORKSPACE_CONSTRAINTS.ID_REGEX.test(user.uid)) {
    return false;
  }
  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  let exists = false;
  try {
    const snap = await getDoc(userRef);
    exists = snap.exists();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('offline') || msg.includes('unavailable') || msg.includes('network')) {
      console.warn('Firestore offline:', msg);
      return false;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return false;
  }

  if (exists) {
    return true;
  }

  if (!user.emailVerified) {
    return false;
  }

  const displayName =
    sanitizeBoundedString(
      (user.displayName || 'Pesquisadora ICONOCRACIA').trim(),
      WORKSPACE_CONSTRAINTS.MAX_DISPLAY_NAME_LEN
    ) || 'Pesquisadora ICONOCRACIA';

  try {
    await setDoc(userRef, {
      ownerId: user.uid,
      displayName,
      preferredDeck,
      preferredLang,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('offline') || msg.includes('unavailable') || msg.includes('network')) {
      console.warn('Firestore offline ao criar workspace:', msg);
      return false;
    }
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}
