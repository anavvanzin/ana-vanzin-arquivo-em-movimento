import React, { useCallback, useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ChevronRight,
  CloudUpload,
  ExternalLink,
  Eye,
  FileJson,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Pencil,
  Presentation,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { LANGUAGES } from '../data/atlasCatalog';
import {
  buildPresentationGoogleDocHtml,
  createDriveFolder,
  downloadDriveFileText,
  DriveActivityEntry,
  DriveAuthRequiredError,
  DriveFileItem,
  DriveFilterCategory,
  fetchRecentDriveActivity,
  findDriveFolderByName,
  findExistingFileByName,
  listDriveFiles,
  renameDriveFile,
  trashDriveFile,
  uploadBinaryFileToDrive,
  uploadTextOrDocToDrive,
} from '../services/googleDrive';
import { DeckId, LangCode, SlideItem, UIStrings } from '../types';
import { DriveConfirmAction, DriveConfirmModal } from './DriveConfirmModal';
import { GoogleSignInButton } from './GoogleSignInButton';
import { buildGroundedNoteHtml, ResearchGroundingPanel } from './ResearchGroundingPanel';

const DEFAULT_DOSSIER_FOLDER = 'ICONOCRACIA — Dossiê Doutoral';
const WORKSPACE_BACKUP_FILENAME = 'iconocracia-revisoes-autorais.json';

interface FolderCrumb {
  id: string | null;
  name: string;
}

interface DriveWorkspaceProps {
  lang: LangCode;
  ui: UIStrings;
  user: User | null;
  needsAuth: boolean;
  isSigningIn: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  getMergedSlides: (deck: DeckId, lang: LangCode) => SlideItem[];
  getPresenterNote: (deck: DeckId, index: number) => string;
  buildDeckExportJson: (deck: DeckId, lang: LangCode) => string;
  buildWorkspaceBackupJson: () => string;
  onImportJson: (
    jsonText: string,
    targetDeck?: DeckId,
    targetLang?: LangCode
  ) => { ok: boolean; message: string };
  onOpenPresentation?: (presentationId: string) => void;
  onOpenGoogleSlidesView?: () => void;
  onOpenDoc?: (docId: string) => void;
  onOpenGoogleDocsView?: () => void;
  onNotify: (msg: string) => void;
}

function formatBytes(raw?: string): string {
  if (!raw) return '';
  const bytes = Number(raw);
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatModifiedDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function describeMimeType(mime: string): string {
  if (mime === 'application/vnd.google-apps.folder') return 'Pasta';
  if (mime === 'application/vnd.google-apps.document') return 'Google Docs';
  if (mime === 'application/vnd.google-apps.presentation') return 'Google Slides';
  if (mime === 'application/vnd.google-apps.spreadsheet') return 'Google Sheets';
  if (mime === 'application/json') return 'JSON';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/')) return 'Imagem';
  return mime.split('/').pop() || 'Arquivo';
}

export function DriveWorkspace({
  lang,
  ui,
  user,
  needsAuth,
  isSigningIn,
  onSignIn,
  onSignOut,
  getMergedSlides,
  getPresenterNote,
  buildDeckExportJson,
  buildWorkspaceBackupJson,
  onImportJson,
  onOpenPresentation,
  onOpenGoogleSlidesView,
  onOpenDoc,
  onOpenGoogleDocsView,
  onNotify,
}: DriveWorkspaceProps) {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [activities, setActivities] = useState<DriveActivityEntry[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [busyOperation, setBusyOperation] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [searchInput, setSearchInput] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [category, setCategory] = useState<DriveFilterCategory>('all');
  const [folderStack, setFolderStack] = useState<FolderCrumb[]>([
    { id: null, name: 'Meu Drive' },
  ]);
  const [projectFolder, setProjectFolder] = useState<DriveFileItem | null>(null);

  const [exportDeck, setExportDeck] = useState<DeckId>('representacao');
  const [exportLang, setExportLang] = useState<LangCode>(lang);

  const [confirmAction, setConfirmAction] = useState<DriveConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState<boolean>(false);

  const [previewItem, setPreviewItem] = useState<{
    file: DriveFileItem;
    content: string;
  } | null>(null);

  const [renameDraft, setRenameDraft] = useState<{
    file: DriveFileItem;
    nextName: string;
  } | null>(null);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const activeFolderId = folderStack[folderStack.length - 1]?.id || null;

  const refreshDrive = useCallback(async () => {
    if (needsAuth) return;
    setLoadingFiles(true);
    setError('');
    try {
      const [listResult, folderFound, recentAct] = await Promise.all([
        listDriveFiles({
          searchQuery: appliedSearch,
          folderId: appliedSearch ? null : activeFolderId,
          category,
          pageSize: 35,
        }),
        findDriveFolderByName(DEFAULT_DOSSIER_FOLDER),
        fetchRecentDriveActivity(6),
      ]);
      setFiles(listResult.files);
      setProjectFolder(folderFound);
      setActivities(recentAct);
    } catch (err: unknown) {
      if (err instanceof DriveAuthRequiredError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : 'Não foi possível listar os arquivos do Google Drive.'
        );
      }
    } finally {
      setLoadingFiles(false);
    }
  }, [activeFolderId, appliedSearch, category, needsAuth]);

  useEffect(() => {
    if (!needsAuth) {
      refreshDrive();
    } else {
      setFiles([]);
      setActivities([]);
      setProjectFolder(null);
    }
  }, [needsAuth, refreshDrive]);

  const executeConfirmed = async (fn: () => Promise<void>) => {
    setConfirmBusy(true);
    try {
      await fn();
      setConfirmAction(null);
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Falha ao concluir operação no Google Drive.');
    } finally {
      setConfirmBusy(false);
    }
  };

  const handleOpenOrCreateDossierFolder = async () => {
    setBusyOperation(true);
    try {
      let folder = projectFolder || (await findDriveFolderByName(DEFAULT_DOSSIER_FOLDER));
      if (!folder) {
        folder = await createDriveFolder(DEFAULT_DOSSIER_FOLDER);
        onNotify(`Pasta "${DEFAULT_DOSSIER_FOLDER}" criada no Google Drive.`);
      }
      setProjectFolder(folder);
      setAppliedSearch('');
      setSearchInput('');
      setFolderStack([
        { id: null, name: 'Meu Drive' },
        { id: folder.id, name: folder.name },
      ]);
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao preparar a pasta do dossiê.');
    } finally {
      setBusyOperation(false);
    }
  };

  const handleSaveBackupToDrive = async () => {
    setBusyOperation(true);
    try {
      const targetParent = activeFolderId || projectFolder?.id || null;
      const existing = await findExistingFileByName(WORKSPACE_BACKUP_FILENAME, targetParent);
      const jsonContent = buildWorkspaceBackupJson();

      const performUpload = async (existingId?: string) => {
        const saved = await uploadTextOrDocToDrive({
          name: WORKSPACE_BACKUP_FILENAME,
          content: jsonContent,
          contentMimeType: 'application/json',
          parentId: targetParent,
          existingFileId: existingId,
          description: 'Pacote autoral de revisões e notas de apresentador — ICONOCRACIA',
        });
        onNotify(
          existingId
            ? `Backup "${saved.name}" atualizado no Google Drive.`
            : `Backup "${saved.name}" salvo no Google Drive.`
        );
        await refreshDrive();
      };

      if (existing) {
        setConfirmAction({
          title: 'Substituir backup existente no Google Drive?',
          description:
            'Já existe um arquivo de revisões autorais com este nome na localização selecionada. Confirmar irá atualizar o conteúdo do arquivo existente com suas edições atuais.',
          affectedItem: `${existing.name} (modificado em ${formatModifiedDate(
            existing.modifiedTime
          )})`,
          confirmLabel: 'Substituir arquivo',
          tone: 'primary',
          onConfirm: () => executeConfirmed(() => performUpload(existing.id)),
        });
      } else {
        await performUpload();
      }
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao salvar backup no Google Drive.');
    } finally {
      setBusyOperation(false);
    }
  };

  const handleExportDeckJsonToDrive = async () => {
    const fileName = `${exportDeck}-${exportLang}.json`;
    setBusyOperation(true);
    try {
      const targetParent = activeFolderId || projectFolder?.id || null;
      const existing = await findExistingFileByName(fileName, targetParent);
      const jsonContent = buildDeckExportJson(exportDeck, exportLang);

      const performUpload = async (existingId?: string) => {
        const saved = await uploadTextOrDocToDrive({
          name: fileName,
          content: jsonContent,
          contentMimeType: 'application/json',
          parentId: targetParent,
          existingFileId: existingId,
          description: `Edição sincronizada ${exportDeck.toUpperCase()} (${exportLang.toUpperCase()}) — ICONOCRACIA`,
        });
        onNotify(
          existingId
            ? `Edição "${saved.name}" atualizada no Google Drive.`
            : `Edição "${saved.name}" exportada para o Google Drive.`
        );
        await refreshDrive();
      };

      if (existing) {
        setConfirmAction({
          title: `Atualizar "${fileName}" no Google Drive?`,
          description:
            'Um arquivo JSON desta edição linguística já existe na pasta selecionada. Deseja sobrescrever o conteúdo com os slides atuais?',
          affectedItem: existing.name,
          confirmLabel: 'Atualizar JSON',
          tone: 'primary',
          onConfirm: () => executeConfirmed(() => performUpload(existing.id)),
        });
      } else {
        await performUpload();
      }
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao exportar JSON para o Google Drive.');
    } finally {
      setBusyOperation(false);
    }
  };

  const handleExportGoogleDoc = async () => {
    const deckTitle = exportDeck === 'trajeto' ? ui.trajeto : ui.representacao;
    const docName = `ICONOCRACIA — ${deckTitle} (${exportLang.toUpperCase()})`;
    setBusyOperation(true);
    try {
      const targetParent = activeFolderId || projectFolder?.id || null;
      const slides = getMergedSlides(exportDeck, exportLang);
      const html = buildPresentationGoogleDocHtml({
        deck: exportDeck,
        deckTitle,
        lang: exportLang,
        slides,
        getPresenterNote,
      });

      const created = await uploadTextOrDocToDrive({
        name: docName,
        content: html,
        contentMimeType: 'text/html',
        targetDriveMimeType: 'application/vnd.google-apps.document',
        parentId: targetParent,
        description: `Manuscrito editável exportado do dossiê ICONOCRACIA (${exportLang.toUpperCase()})`,
      });

      onNotify(`Documento Google "${created.name}" criado no Google Drive.`);
      await refreshDrive();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao gerar Google Doc no Drive.');
    } finally {
      setBusyOperation(false);
    }
  };

  const handleLocalFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBusyOperation(true);
    try {
      const targetParent = activeFolderId || projectFolder?.id || null;
      const existing = await findExistingFileByName(file.name, targetParent);

      const performUpload = async (existingId?: string) => {
        const uploaded = await uploadBinaryFileToDrive({
          file,
          parentId: targetParent,
          existingFileId: existingId,
          description: 'Arquivo documental enviado pelo portal ICONOCRACIA',
        });
        onNotify(
          existingId
            ? `Arquivo "${uploaded.name}" substituído no Google Drive.`
            : `Arquivo "${uploaded.name}" enviado ao Google Drive.`
        );
        await refreshDrive();
      };

      if (existing) {
        setConfirmAction({
          title: 'Substituir arquivo existente no Google Drive?',
          description:
            'Já existe um arquivo com o mesmo nome na pasta atual do Google Drive. Deseja substituir seu conteúdo pela nova versão selecionada?',
          affectedItem: `${file.name} (${formatBytes(String(file.size))})`,
          confirmLabel: 'Substituir no Drive',
          tone: 'primary',
          onConfirm: () => executeConfirmed(() => performUpload(existing.id)),
        });
      } else {
        await performUpload();
      }
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Falha ao enviar arquivo ao Google Drive.');
    } finally {
      setBusyOperation(false);
    }
  };

  const handlePreviewFile = async (file: DriveFileItem) => {
    setBusyOperation(true);
    try {
      const text = await downloadDriveFileText(file.id, file.mimeType);
      setPreviewItem({
        file,
        content: text.slice(0, 18000),
      });
    } catch (err: unknown) {
      onNotify(
        err instanceof Error
          ? err.message
          : 'Este formato de arquivo deve ser aberto diretamente no Google Drive.'
      );
    } finally {
      setBusyOperation(false);
    }
  };

  const handleRequestRestoreJson = (file: DriveFileItem) => {
    const matchDeckLang = file.name.match(/^(trajeto|representacao)-(pt|en|fr|it|nl)\.json$/i);
    const inferredDeck = matchDeckLang ? (matchDeckLang[1].toLowerCase() as DeckId) : undefined;
    const inferredLang = matchDeckLang ? (matchDeckLang[2].toLowerCase() as LangCode) : undefined;

    setConfirmAction({
      title: 'Importar arquivo do Google Drive no Estúdio?',
      description: inferredDeck
        ? `O arquivo será lido do Google Drive e aplicado sobre a edição local de ${inferredDeck.toUpperCase()} (${inferredLang?.toUpperCase()}).`
        : 'O pacote de revisões será lido do Google Drive e mesclado às revisões autorais deste navegador.',
      affectedItem: file.name,
      confirmLabel: 'Importar no Estúdio',
      tone: 'primary',
      onConfirm: () =>
        executeConfirmed(async () => {
          const text = await downloadDriveFileText(file.id, file.mimeType);
          const res = onImportJson(
            text,
            inferredDeck || exportDeck,
            inferredLang || exportLang
          );
          onNotify(res.message);
        }),
    });
  };

  const handleRequestTrash = (file: DriveFileItem) => {
    setConfirmAction({
      title: 'Mover arquivo para a lixeira do Google Drive?',
      description:
        'O item selecionado será movido para a lixeira da sua conta Google Drive. Você poderá restaurá-lo na lixeira do Drive se necessário.',
      affectedItem: file.name,
      confirmLabel: 'Mover para lixeira',
      tone: 'danger',
      onConfirm: () =>
        executeConfirmed(async () => {
          await trashDriveFile(file.id);
          onNotify(`"${file.name}" movido para a lixeira do Google Drive.`);
          await refreshDrive();
        }),
    });
  };

  const handleSubmitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameDraft) return;
    const trimmed = renameDraft.nextName.trim();
    if (!trimmed || trimmed === renameDraft.file.name) {
      setRenameDraft(null);
      return;
    }

    const targetFile = renameDraft.file;
    setRenameDraft(null);

    setConfirmAction({
      title: 'Renomear arquivo no Google Drive?',
      description: `Confirmar alterará o nome do arquivo no Google Drive de "${targetFile.name}" para "${trimmed}".`,
      affectedItem: `${targetFile.name} → ${trimmed}`,
      confirmLabel: 'Confirmar novo nome',
      tone: 'primary',
      onConfirm: () =>
        executeConfirmed(async () => {
          await renameDriveFile(targetFile.id, trimmed);
          onNotify(`Arquivo renomeado para "${trimmed}".`);
          await refreshDrive();
        }),
    });
  };

  const handleSaveGroundedNote = async (
    queryTitle: string,
    synthesis: string,
    sources: { title: string; uri: string }[]
  ) => {
    const targetParent = activeFolderId || projectFolder?.id || null;
    const shortTitle = queryTitle.slice(0, 58).trim();
    const docName = `Ficha Documental — ${shortTitle}`;
    const html = buildGroundedNoteHtml(queryTitle, synthesis, sources);

    const saved = await uploadTextOrDocToDrive({
      name: docName,
      content: html,
      contentMimeType: 'text/html',
      targetDriveMimeType: 'application/vnd.google-apps.document',
      parentId: targetParent,
      description: 'Ficha de verificação documental fundamentada no Google Search — ICONOCRACIA',
    });

    onNotify(`Ficha "${saved.name}" arquivada no Google Drive.`);
    await refreshDrive();
  };

  const categoryTabs: { id: DriveFilterCategory; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'slides', label: 'Google Slides' },
    { id: 'docs', label: 'Docs & PDFs' },
    { id: 'json', label: 'Pacotes JSON' },
    { id: 'images', label: 'Pranchas & Imagens' },
    { id: 'folders', label: 'Pastas' },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 lg:py-12 space-y-10">
      {/* Archival Header */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b-[1.5px] border-[#1c1c1c] pb-8">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
            REPOSITÓRIO EM NUVEM · SINCRONIZAÇÃO AUTORAL & MANUSCRITOS
          </p>
          <h1 className="font-serif font-light text-4xl sm:text-5xl text-[#1c1c1c]">
            Acervo Google Drive
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-[#1c1c1c]/80 max-w-2xl">
            Arquive revisões das cinco edições linguísticas, exporte apresentações como manuscritos
            Google Docs para leitura orientadora e organize pranchas e PDFs diretamente no seu
            Google Drive.
          </p>
        </div>

        {!needsAuth && user && (
          <div className="flex flex-wrap items-center gap-4 p-3.5 bg-white/60 backdrop-blur-[4px] border border-[#1c1c1c]">
            <div className="text-xs">
              <p className="font-medium text-[#1c1c1c]">
                {user.displayName || 'Conta Google conectada'}
              </p>
              <p className="font-mono text-[11px] text-[#7e2a1f]">
                {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          </div>
        )}
      </header>

      {/* Unauthenticated Gate */}
      {needsAuth ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 bg-white/75 backdrop-blur-[4px] border-[1.5px] border-[#1c1c1c] items-center">
          <div className="lg:col-span-8 space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f]">
              Acesso autorizado pela usuária
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c]">
              Conecte sua conta Google para sincronizar o dossiê ICONOCRACIA
            </h2>
            <p className="text-sm leading-relaxed text-[#1c1c1c]/80 max-w-2xl">
              Com sua permissão, o portal permite salvar e restaurar pacotes JSON de revisão
              autoral, gerar documentos editáveis no Google Docs a partir de qualquer idioma (PT,
              EN, FR, IT, NL) e consultar pranchas ou PDFs arquivados no seu Google Drive.
            </p>
            <div className="pt-2">
              <GoogleSignInButton
                onClick={onSignIn}
                disabled={isSigningIn}
                label={isSigningIn ? 'Autenticando...' : 'Sign in with Google'}
              />
            </div>
          </div>

          <div className="lg:col-span-4 p-6 bg-[#f2efeb]/85 border border-[#1c1c1c]/35 space-y-3 text-xs leading-relaxed text-[#1c1c1c]/80">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7e2a1f]">
              Protocolo de segurança
            </p>
            <p>
              A credencial de acesso permanece exclusivamente em memória durante a sessão ativa do
              navegador.
            </p>
            <p>
              Nenhuma substituição de arquivo ou exclusão no Google Drive ocorre sem confirmação
              explícita em tela.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Scholarly Cloud Synchronization Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Action Card: Backup & Folder Management */}
            <div className="lg:col-span-6 p-6 bg-white/75 backdrop-blur-[4px] border border-[#1c1c1c] flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f]">
                  01. Preservação do Estúdio Autoral
                </p>
                <h2 className="font-serif text-2xl font-medium text-[#1c1c1c]">
                  Backup de revisões e pasta dedicada
                </h2>
                <p className="text-xs leading-relaxed text-[#1c1c1c]/75">
                  Salve todas as traduções revisadas, status de aprovação e notas de apresentador em{' '}
                  <span className="font-mono text-[#1c1c1c]">{WORKSPACE_BACKUP_FILENAME}</span> ou envie pranchas e
                  PDFs do computador para a pasta ativa.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={busyOperation}
                  onClick={handleSaveBackupToDrive}
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Salvar revisões no Drive</span>
                </button>

                <button
                  type="button"
                  disabled={busyOperation}
                  onClick={handleOpenOrCreateDossierFolder}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>
                    {projectFolder ? 'Abrir pasta ICONOCRACIA' : 'Criar pasta ICONOCRACIA'}
                  </span>
                </button>

                <input
                  ref={uploadInputRef}
                  type="file"
                  onChange={handleLocalFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={busyOperation}
                  onClick={() => uploadInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c]/40 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Enviar arquivo local</span>
                </button>
              </div>
            </div>

            {/* Right Action Card: Export Presentation as Google Doc or JSON */}
            <div className="lg:col-span-6 p-6 bg-white/45 backdrop-blur-[4px] border border-[#1c1c1c]/45 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f]">
                  02. Publicação em Google Docs & JSON
                </p>
                <h2 className="font-serif text-2xl font-medium text-[#1c1c1c]">
                  Exportar manuscrito de apresentação
                </h2>
                <p className="text-xs leading-relaxed text-[#1c1c1c]/75">
                  Gere um documento nativo do Google Docs com todos os slides, rótulos, notas
                  metodológicas e roteiro de fala para compartilhamento acadêmico.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label htmlFor="drive-deck-select" className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65">
                    Dossiê:
                  </label>
                  <select
                    id="drive-deck-select"
                    value={exportDeck}
                    onChange={(e) => setExportDeck(e.target.value as DeckId)}
                    className="bg-white border border-[#1c1c1c]/40 px-2.5 py-1.5 text-xs font-medium text-[#1c1c1c]"
                  >
                    <option value="representacao">01. {ui.representacao}</option>
                    <option value="trajeto">02. {ui.trajeto}</option>
                  </select>

                  <label htmlFor="drive-lang-select" className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/65">
                    Idioma:
                  </label>
                  <select
                    id="drive-lang-select"
                    value={exportLang}
                    onChange={(e) => setExportLang(e.target.value as LangCode)}
                    className="bg-white border border-[#1c1c1c]/40 px-2.5 py-1.5 text-xs font-mono font-medium text-[#1c1c1c]"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label} — {l.nativeLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={busyOperation}
                    onClick={handleExportGoogleDoc}
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#7e2a1f] bg-[#7e2a1f] text-[#f2efeb] hover:bg-[#1c1c1c] hover:border-[#1c1c1c] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Criar Google Doc ({exportLang.toUpperCase()})</span>
                  </button>

                  <button
                    type="button"
                    disabled={busyOperation}
                    onClick={handleExportDeckJsonToDrive}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>
                      Exportar {exportDeck}-{exportLang}.json
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Browser + Activity Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Drive File Browser (8 columns) */}
            <div className="lg:col-span-8 bg-white/75 backdrop-blur-[4px] border border-[#1c1c1c] p-6 space-y-5">
              {/* Breadcrumbs + Refresh */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c1c]/15 pb-4">
                <nav
                  aria-label="Localização no Google Drive"
                  className="flex flex-wrap items-center gap-1 text-xs font-mono"
                >
                  {folderStack.map((crumb, idx) => {
                    const isLast = idx === folderStack.length - 1;
                    return (
                      <span key={`${crumb.id || 'root'}-${idx}`} className="inline-flex items-center gap-1">
                        {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#1c1c1c]/40" />}
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedSearch('');
                            setSearchInput('');
                            setFolderStack((prev) => prev.slice(0, idx + 1));
                          }}
                          className={`hover:underline ${
                            isLast ? 'font-bold text-[#1c1c1c]' : 'text-[#1c1c1c]/65'
                          }`}
                        >
                          {crumb.name}
                        </button>
                      </span>
                    );
                  })}
                  {appliedSearch && (
                    <span className="ml-2 text-[#7e2a1f]">
                      · Busca: &ldquo;{appliedSearch}&rdquo;
                    </span>
                  )}
                </nav>

                <button
                  type="button"
                  disabled={loadingFiles}
                  onClick={refreshDrive}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]/35 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {/* Search & Segmented Category Filter */}
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAppliedSearch(searchInput.trim());
                  }}
                  className="flex gap-2"
                >
                  <label htmlFor="drive-search-input" className="sr-only">
                    Pesquisar arquivos no Google Drive
                  </label>
                  <input
                    id="drive-search-input"
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por título no Google Drive..."
                    className="flex-1 px-3 py-2 text-xs bg-[#f2efeb] border border-[#1c1c1c]/40 text-[#1c1c1c] focus:outline-none focus:border-[#7e2a1f]"
                  />
                  {appliedSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setAppliedSearch('');
                      }}
                      className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]/35 text-[#1c1c1c]/75 hover:border-[#1c1c1c] hover:text-[#1c1c1c]"
                    >
                      Limpar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar</span>
                  </button>
                </form>

                <div
                  role="group"
                  aria-label="Filtrar tipos de arquivo no Google Drive"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCategory(tab.id)}
                      className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border transition-colors whitespace-nowrap shrink-0 ${
                        category === tab.id
                          ? 'bg-[#1c1c1c] text-[#f2efeb] border-[#1c1c1c]'
                          : 'bg-[#f2efeb]/80 text-[#1c1c1c]/75 border-[#1c1c1c]/25 hover:border-[#1c1c1c] hover:text-[#1c1c1c]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-[#7e2a1f]/10 border border-[#7e2a1f] text-xs text-[#7e2a1f]">
                  {error}
                </div>
              )}

              {/* Inline Rename Form when active */}
              {renameDraft && (
                <form
                  onSubmit={handleSubmitRename}
                  className="p-4 bg-[#f2efeb] border border-[#1c1c1c] flex flex-wrap items-center gap-2.5"
                >
                  <label htmlFor="drive-rename-input" className="font-mono text-[10px] uppercase tracking-wider shrink-0">
                    Novo nome:
                  </label>
                  <input
                    id="drive-rename-input"
                    type="text"
                    value={renameDraft.nextName}
                    onChange={(e) =>
                      setRenameDraft((prev) =>
                        prev ? { ...prev, nextName: e.target.value } : null
                      )
                    }
                    className="flex-1 min-w-[200px] px-2.5 py-1.5 text-xs bg-white border border-[#1c1c1c]/40 focus:outline-none focus:border-[#7e2a1f]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-[#7e2a1f] text-[#f2efeb] whitespace-nowrap"
                  >
                    Revisar alteração
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenameDraft(null)}
                    className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]"
                  >
                    Cancelar
                  </button>
                </form>
              )}

              {/* Files Table / List */}
              {loadingFiles ? (
                <div className="py-14 flex items-center justify-center gap-2 font-mono text-xs text-[#1c1c1c]/65">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Carregando acervo do Google Drive...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-[#1c1c1c]/30">
                  <p className="font-serif text-xl text-[#1c1c1c]">
                    Nenhum arquivo encontrado neste recorte
                  </p>
                  <p className="text-xs text-[#1c1c1c]/65">
                    Salve um backup das revisões autorais ou exporte uma apresentação como Google
                    Doc acima.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#1c1c1c]/15">
                  {files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isJson =
                      file.mimeType === 'application/json' ||
                      file.name.toLowerCase().endsWith('.json');
                    const isReadableText =
                      isJson ||
                      file.mimeType === 'application/vnd.google-apps.document' ||
                      file.mimeType.startsWith('text/');
                    const sizeStr = formatBytes(file.size);
                    const modStr = formatModifiedDate(file.modifiedTime);

                    return (
                      <li
                        key={file.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mt-0.5 text-[#1c1c1c]/65 shrink-0">
                            {isFolder ? (
                              <Folder className="w-4 h-4 text-[#7e2a1f]" />
                            ) : file.mimeType === 'application/vnd.google-apps.presentation' ? (
                              <Presentation className="w-4 h-4 text-[#7e2a1f]" />
                            ) : isJson ? (
                              <FileJson className="w-4 h-4" />
                            ) : file.mimeType.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </span>

                          <div className="min-w-0 space-y-0.5">
                            {isFolder ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setAppliedSearch('');
                                  setSearchInput('');
                                  setFolderStack((prev) => [
                                    ...prev,
                                    { id: file.id, name: file.name },
                                  ]);
                                }}
                                className="text-sm font-medium text-left text-[#7e2a1f] hover:underline truncate block max-w-full"
                              >
                                {file.name}
                              </button>
                            ) : (
                              <p className="text-sm font-medium text-[#1c1c1c] truncate">
                                {file.name}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums text-[#1c1c1c]/60">
                              <span>{describeMimeType(file.mimeType)}</span>
                              {sizeStr && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{sizeStr}</span>
                                </>
                              )}
                              {modStr && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{modStr}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* File Affordances */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {file.mimeType === 'application/vnd.google-apps.presentation' && onOpenPresentation && (
                            <button
                              type="button"
                              onClick={() => onOpenPresentation(file.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[#7e2a1f] bg-[#7e2a1f] text-[#f2efeb] hover:bg-[#1c1c1c] hover:border-[#1c1c1c] transition-colors whitespace-nowrap"
                            >
                              <Presentation className="w-3 h-3" />
                              <span>Apresentar</span>
                            </button>
                          )}

                          {file.mimeType === 'application/vnd.google-apps.document' && onOpenDoc && (
                            <button
                              type="button"
                              onClick={() => onOpenDoc(file.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors whitespace-nowrap"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Abrir Doc</span>
                            </button>
                          )}

                          {isJson && (
                            <button
                              type="button"
                              disabled={busyOperation}
                              onClick={() => handleRequestRestoreJson(file)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[#7e2a1f] text-[#7e2a1f] hover:bg-[#7e2a1f] hover:text-[#f2efeb] transition-colors whitespace-nowrap"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restaurar</span>
                            </button>
                          )}

                          {isReadableText && !isFolder && (
                            <button
                              type="button"
                              disabled={busyOperation}
                              onClick={() => handlePreviewFile(file)}
                              aria-label={`Inspecionar ${file.name}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]/35 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ler</span>
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Abrir ${file.name} no Google Drive`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]/35 text-[#1c1c1c] hover:border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap"
                            >
                              <span>Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setRenameDraft({ file, nextName: file.name })}
                            aria-label={`Renomear ${file.name}`}
                            className="p-1.5 border border-[#1c1c1c]/35 text-[#1c1c1c]/75 hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRequestTrash(file)}
                            aria-label={`Mover ${file.name} para a lixeira`}
                            className="p-1.5 border border-[#1c1c1c]/35 text-[#7e2a1f] hover:border-[#7e2a1f] hover:bg-[#7e2a1f] hover:text-[#f2efeb] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right Rail: Recent Drive Activity & Preview Inspector (4 columns) */}
            <aside className="lg:col-span-4 space-y-6">
              {previewItem && (
                <div className="p-5 bg-white/80 backdrop-blur-[4px] border border-[#1c1c1c] space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[#1c1c1c]/15 pb-2.5">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#7e2a1f]">
                        Leitura de conteúdo
                      </p>
                      <h3 className="font-serif text-lg font-medium text-[#1c1c1c] truncate">
                        {previewItem.file.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewItem(null)}
                      aria-label="Fechar pré-visualização"
                      className="p-1 text-[#1c1c1c]/65 hover:text-[#1c1c1c]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="max-h-72 overflow-auto text-[11px] leading-relaxed font-mono text-[#1c1c1c]/85 whitespace-pre-wrap break-words">
                    {previewItem.content}
                  </pre>
                </div>
              )}

              <div className="p-6 bg-white/45 backdrop-blur-[4px] border border-[#1c1c1c]/40 space-y-4">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f]">
                    Registro Recente · Drive Activity
                  </p>
                  <h2 className="font-serif text-2xl font-medium text-[#1c1c1c]">
                    Movimentação no acervo
                  </h2>
                </div>

                {activities.length === 0 ? (
                  <p className="text-xs leading-relaxed text-[#1c1c1c]/65">
                    Nenhuma atividade recente retornada para este perfil no momento.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#1c1c1c]/15 text-xs">
                    {activities.map((act) => (
                      <li key={act.id} className="py-2.5 space-y-0.5">
                        <p className="font-medium text-[#1c1c1c] truncate">
                          {act.targetTitle}
                        </p>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-[#1c1c1c]/60">
                          <span>{act.actionLabel}</span>
                          {act.timestamp && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{formatModifiedDate(act.timestamp)}</span>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </section>
        </>
      )}

      {/* Grounded Documentary Research + Direct Save to Drive */}
      <ResearchGroundingPanel
        lang={lang}
        canSaveToDrive={!needsAuth}
        onSaveNoteToDrive={handleSaveGroundedNote}
        onNotify={onNotify}
      />

      {/* Explicit Mandatory Confirmation Dialog */}
      <DriveConfirmModal
        action={confirmAction}
        busy={confirmBusy}
        onCancel={() => {
          if (!confirmBusy) setConfirmAction(null);
        }}
      />
    </div>
  );
}
