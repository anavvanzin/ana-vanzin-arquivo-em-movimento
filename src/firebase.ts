import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DeckId, LangCode } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

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
} as const;

export function sanitizeBoundedString(val: string | undefined, maxLen: number): string {
  if (!val) return '';
  return val.slice(0, maxLen);
}

export function makeFirestoreRevisionId(deck: DeckId, lang: LangCode, slideIndex: number): string {
  const safeIdx = Math.max(0, Math.min(13, Math.floor(slideIndex)));
  return `${deck}_${lang}_${String(safeIdx).padStart(2, '0')}`;
}

export async function signInWithFirebaseGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, basicGoogleProvider);
  return result.user;
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
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
