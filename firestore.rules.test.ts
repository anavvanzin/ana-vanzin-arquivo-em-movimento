import fs from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('ICONOCRACIA Firestore Security Rules — Dirty Dozen Suite', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-iconocracia-rules-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  function verifiedDb(uid: string): Firestore {
    return testEnv.authenticatedContext(uid, { email_verified: true }).firestore() as unknown as Firestore;
  }

  function unverifiedDb(uid: string): Firestore {
    return testEnv.authenticatedContext(uid, { email_verified: false }).firestore() as unknown as Firestore;
  }

  async function seedValidWorkspace(uid: string) {
    const db = verifiedDb(uid);
    await assertSucceeds(
      setDoc(doc(db, 'users', uid), {
        ownerId: uid,
        displayName: 'Ana Vitória Vanzin Mendes',
        preferredDeck: 'representacao',
        preferredLang: 'fr',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  }

  it('01. Denies identity spoofing (ownerId mismatch on workspace create)', async () => {
    const dbA = verifiedDb('user_A');
    await assertFails(
      setDoc(doc(dbA, 'users', 'user_A'), {
        ownerId: 'user_B',
        displayName: 'Spoofer',
        preferredDeck: 'representacao',
        preferredLang: 'pt',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('02. Denies cross-tenant subcollection write', async () => {
    await seedValidWorkspace('user_B');
    const dbA = verifiedDb('user_A');
    await assertFails(
      setDoc(doc(dbA, 'users', 'user_B', 'slideRevisions', 'representacao_fr_00'), {
        ownerId: 'user_A',
        deck: 'representacao',
        lang: 'fr',
        slideIndex: 0,
        reviewStatus: 'approved',
        blockCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('03. Denies unverified email write spoof', async () => {
    const dbUnverified = unverifiedDb('user_A');
    await assertFails(
      setDoc(doc(dbUnverified, 'users', 'user_A'), {
        ownerId: 'user_A',
        displayName: 'Unverified Account',
        preferredDeck: 'representacao',
        preferredLang: 'en',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('04. Denies orphaned subcollection write without parent workspace', async () => {
    const dbOrphan = verifiedDb('user_orphan');
    await assertFails(
      setDoc(doc(dbOrphan, 'users', 'user_orphan', 'slideRevisions', 'representacao_en_00'), {
        ownerId: 'user_orphan',
        deck: 'representacao',
        lang: 'en',
        slideIndex: 0,
        reviewStatus: 'pending',
        blockCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('05. Denies shadow/ghost field injection on create', async () => {
    const dbA = verifiedDb('user_A');
    await assertFails(
      setDoc(doc(dbA, 'users', 'user_A'), {
        ownerId: 'user_A',
        displayName: 'Researcher',
        preferredDeck: 'representacao',
        preferredLang: 'pt',
        isAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('06. Denies shadow/ghost field injection on update', async () => {
    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    const revRef = doc(dbA, 'users', 'user_A', 'slideRevisions', 'representacao_en_00');
    await assertSucceeds(
      setDoc(revRef, {
        ownerId: 'user_A',
        deck: 'representacao',
        lang: 'en',
        slideIndex: 0,
        reviewStatus: 'pending',
        blockCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    await assertFails(
      updateDoc(revRef, {
        isVerified: true,
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('07. Denies value poisoning on whitelisted update key (oversized presenterNote)', async () => {
    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    const revRef = doc(dbA, 'users', 'user_A', 'slideRevisions', 'representacao_fr_01');
    await assertSucceeds(
      setDoc(revRef, {
        ownerId: 'user_A',
        deck: 'representacao',
        lang: 'fr',
        slideIndex: 1,
        reviewStatus: 'pending',
        blockCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    await assertFails(
      updateDoc(revRef, {
        presenterNote: 'X'.repeat(3500),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('08. Denies ID poisoning on path variable', async () => {
    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    await assertFails(
      setDoc(doc(dbA, 'users', 'user_A', 'researchNotes', 'bad$id with spaces!'), {
        ownerId: 'user_A',
        queryTitle: 'Art. 239',
        synthesis: 'Valid text',
        sourcesSummary: '',
        deck: 'representacao',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('09. Denies client-forged past/future timestamps', async () => {
    const dbA = verifiedDb('user_A');
    await assertFails(
      setDoc(doc(dbA, 'users', 'user_A'), {
        ownerId: 'user_A',
        displayName: 'Forged Time',
        preferredDeck: 'representacao',
        preferredLang: 'pt',
        createdAt: Timestamp.fromMillis(1000000),
        updatedAt: Timestamp.fromMillis(1000000),
      })
    );
  });

  it('10. Denies mutating immortal fields (deck or createdAt) on update', async () => {
    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    const revRef = doc(dbA, 'users', 'user_A', 'slideRevisions', 'representacao_pt_02');
    await assertSucceeds(
      setDoc(revRef, {
        ownerId: 'user_A',
        deck: 'representacao',
        lang: 'pt',
        slideIndex: 2,
        reviewStatus: 'pending',
        blockCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    await assertFails(
      updateDoc(revRef, {
        deck: 'trajeto',
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('11. Denies updates once terminal state (locked / archived) is reached', async () => {
    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    const noteRef = doc(dbA, 'users', 'user_A', 'researchNotes', 'note_1890');
    await assertSucceeds(
      setDoc(noteRef, {
        ownerId: 'user_A',
        queryTitle: 'Decreto 1.227/1890',
        synthesis: 'Análise do art. 10 dos estatutos anexos.',
        sourcesSummary: 'https://www2.camara.leg.br',
        deck: 'representacao',
        status: 'archived',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    await assertFails(
      updateDoc(noteRef, {
        synthesis: 'Tentativa de alteração após arquivamento',
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('12. Denies cross-user get and list queries', async () => {
    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    await assertSucceeds(
      setDoc(doc(dbA, 'users', 'user_A', 'researchNotes', 'note_01'), {
        ownerId: 'user_A',
        queryTitle: 'Ripa 1603',
        synthesis: 'Cotejo iconológico.',
        sourcesSummary: '',
        deck: 'representacao',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    const dbB = verifiedDb('user_B');
    await assertFails(getDoc(doc(dbB, 'users', 'user_A', 'researchNotes', 'note_01')));
    await assertFails(
      getDocs(
        query(
          collection(dbB, 'users', 'user_A', 'researchNotes'),
          where('ownerId', '==', 'user_A')
        )
      )
    );
  });

  it('13. Enforces Master Gate, size caps, and terminal archive lock on atelierRecords', async () => {
    const dbOrphan = verifiedDb('user_orphan_atelier');
    await assertFails(
      setDoc(doc(dbOrphan, 'users', 'user_orphan_atelier', 'atelierRecords', 'plate_01'), {
        ownerId: 'user_orphan_atelier',
        kind: 'image_plate',
        title: 'Estudo de gravura',
        promptOrSummary: 'Xilogravura renascentista',
        axis: 'venda',
        specSummary: '4:3 · 1K',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    await seedValidWorkspace('user_A');
    const dbA = verifiedDb('user_A');
    const recRef = doc(dbA, 'users', 'user_A', 'atelierRecords', 'plate_1603');
    await assertSucceeds(
      setDoc(recRef, {
        ownerId: 'user_A',
        kind: 'image_plate',
        title: 'Estudo Ripa 1603',
        promptOrSummary: 'Alegoria da Iustitia com venda e balança.',
        axis: 'venda',
        specSummary: '4:3 · 2K · Grounded',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // Reject oversized base64/text injection (>2000 chars)
    await assertFails(
      updateDoc(recRef, {
        promptOrSummary: 'B'.repeat(2400),
        updatedAt: serverTimestamp(),
      })
    );

    // Archive transition succeeds once, then locks further updates
    await assertSucceeds(
      updateDoc(recRef, {
        status: 'archived',
        updatedAt: serverTimestamp(),
      })
    );
    await assertFails(
      updateDoc(recRef, {
        title: 'Tentativa pós-arquivo',
        updatedAt: serverTimestamp(),
      })
    );
  });
});
