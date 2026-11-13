import { LangCode, TimelineFilter, TimelineMilestone } from '../types';

export interface CompanionInterventionCopy {
  kicker: string;
  dateCode: string;
  title: string;
  subtitle: string;
  venueLine: string;
  summary: string;
  metaItems: string[];
  openLabel: string;
  copyCitationLabel: string;
  copiedLabel: string;
  copiedToast: string;
  academicCitation: string;
}

export const MONTESQUIEU_COMPANION_URL = 'https://anavanzin.com/montesquieu/';

export const COMPANION_INTERVENTION_BY_LANG: Record<LangCode, CompanionInterventionCopy> = {
  pt: {
    kicker: 'Intervenção associada no mesmo colóquio França–Brasil',
    dateCode: '11.11.2026',
    title: 'Whose Liberty? Montesquieu in Brazil — Discussing Dauchy’s Montesquieu',
    subtitle:
      'Debate à conferência de Serge Dauchy (CNRS / Université de Lille) · PPGD/UFSC, 11 de novembro de 2026 · 15h10',
    venueLine: 'A circulação das ideias e saberes franceses na ciência jurídica brasileira · CCJ/UFSC',
    summary:
      'Recepção, contexto e representação dos poderes: intervenção documentada em 7 slides interativos com linha do tempo França ⇄ Brasil (1748, Carta de 1824 art. 10, 1891/1896, Código Civil de 1916 e A Justiça de 1961), fontes verificadas e anotações críticas.',
    metaItems: ['7 slides · EN · PT · FR', 'Debatedoras: Ana Vitória Vanzin Mendes & Marja Mangili'],
    openLabel: 'Abrir apresentação (11/11)',
    copyCitationLabel: 'Copiar citação',
    copiedLabel: 'Citação copiada',
    copiedToast: 'Citação da intervenção de 11/11/2026 (Montesquieu / Dauchy) copiada.',
    academicCitation:
      'MENDES, Ana Vitória Vanzin. Whose Liberty? Montesquieu in Brazil: Discussing Serge Dauchy’s Montesquieu — Context, reception and the representation of powers. Intervenção como debatedora após conferência de Serge Dauchy (CNRS/Université de Lille). Florianópolis: PPGD/UFSC, Auditório do CCJ, 11 nov. 2026. Disponível em: https://anavanzin.com/montesquieu/.',
  },
  en: {
    kicker: 'Companion intervention in the same France–Brazil colloquium',
    dateCode: '11.11.2026',
    title: 'Whose Liberty? Montesquieu in Brazil — Discussing Dauchy’s Montesquieu',
    subtitle:
      'Discussant response to Keynote Serge Dauchy (CNRS / Université de Lille) · PPGD/UFSC, 11 November 2026 · 15h10',
    venueLine: 'The circulation of French ideas and knowledge in Brazilian legal scholarship · CCJ/UFSC',
    summary:
      'Context, reception and the representation of powers: archival 7-slide intervention featuring a parallel France ⇄ Brazil timeline (1748, 1824 Const. Art. 10, 1891/1896, 1916 Civil Code, and 1961 Stone Justice), primary source check, and critical marginalia.',
    metaItems: ['7 slides · EN · PT · FR', 'Discussants: Ana Vitória Vanzin Mendes & Marja Mangili'],
    openLabel: 'Open presentation (11 Nov)',
    copyCitationLabel: 'Copy citation',
    copiedLabel: 'Citation copied',
    copiedToast: 'Citation for the 11 Nov 2026 intervention (Montesquieu / Dauchy) copied.',
    academicCitation:
      'MENDES, Ana Vitória Vanzin. Whose Liberty? Montesquieu in Brazil: Discussing Serge Dauchy’s Montesquieu — Context, reception and the representation of powers. Discussant intervention following Keynote Serge Dauchy (CNRS/Université de Lille). Florianópolis: PPGD/UFSC, CCJ Auditorium, 11 Nov. 2026. Available at: https://anavanzin.com/montesquieu/.',
  },
  fr: {
    kicker: 'Intervention associée du même cycle France–Brésil',
    dateCode: '11.11.2026',
    title: 'Whose Liberty? Montesquieu in Brazil — Discussing Dauchy’s Montesquieu',
    subtitle:
      'Discussion de la conférence de Serge Dauchy (CNRS / Université de Lille) · PPGD/UFSC, 11 novembre 2026 · 15h10',
    venueLine: 'La circulation des idées et savoirs français dans la science juridique brésilienne · CCJ/UFSC',
    summary:
      'Contexte, réception et représentation des pouvoirs : intervention documentée en 7 diapositives avec chronologie parallèle France ⇄ Brésil (1748, Charte de 1824 art. 10, 1891/1896, Code civil de 1916 et La Justice de 1961), sources vérifiées et notes critiques.',
    metaItems: ['7 diapositives · EN · PT · FR', 'Discutantes : Ana Vitória Vanzin Mendes & Marja Mangili'],
    openLabel: 'Ouvrir la présentation (11/11)',
    copyCitationLabel: 'Copier la citation',
    copiedLabel: 'Citation copiée',
    copiedToast: 'Citation de l’intervention du 11/11/2026 (Montesquieu / Dauchy) copiée.',
    academicCitation:
      'MENDES, Ana Vitória Vanzin. Whose Liberty? Montesquieu in Brazil: Discussing Serge Dauchy’s Montesquieu — Context, reception and the representation of powers. Intervention comme discutante après la conférence de Serge Dauchy (CNRS/Université de Lille). Florianópolis : PPGD/UFSC, CCJ, 11 nov. 2026. Disponible sur : https://anavanzin.com/montesquieu/.',
  },
  it: {
    kicker: 'Intervento associato nello stesso colloquio Francia–Brasile',
    dateCode: '11.11.2026',
    title: 'Whose Liberty? Montesquieu in Brazil — Discussing Dauchy’s Montesquieu',
    subtitle:
      'Discussione della conferenza di Serge Dauchy (CNRS / Université de Lille) · PPGD/UFSC, 11 novembre 2026 · 15h10',
    venueLine: 'La circolazione delle idee e dei saperi francesi nella scienza giuridica brasiliana · CCJ/UFSC',
    summary:
      'Contesto, ricezione e rappresentazione dei poteri: intervento documentato in 7 diapositive con cronologia Francia ⇄ Brasile (1748, Costituzione del 1824 art. 10, 1891/1896, Codice civile del 1916 e La Giustizia del 1961), verifica delle fonti e note critiche.',
    metaItems: ['7 diapositive · EN · PT · FR', 'Discussant: Ana Vitória Vanzin Mendes & Marja Mangili'],
    openLabel: 'Apri presentazione (11/11)',
    copyCitationLabel: 'Copia citazione',
    copiedLabel: 'Citazione copiata',
    copiedToast: 'Citazione dell’intervento dell’11/11/2026 (Montesquieu / Dauchy) copiata.',
    academicCitation:
      'MENDES, Ana Vitória Vanzin. Whose Liberty? Montesquieu in Brazil: Discussing Serge Dauchy’s Montesquieu — Context, reception and the representation of powers. Intervento come discussant alla conferenza di Serge Dauchy (CNRS/Université de Lille). Florianópolis: PPGD/UFSC, CCJ, 11 nov. 2026. Disponibile su: https://anavanzin.com/montesquieu/.',
  },
  nl: {
    kicker: 'Verwante bijdrage in hetzelfde colloquium Frankrijk–Brazilië',
    dateCode: '11.11.2026',
    title: 'Whose Liberty? Montesquieu in Brazil — Discussing Dauchy’s Montesquieu',
    subtitle:
      'Debatbijdrage bij de lezing van Serge Dauchy (CNRS / Université de Lille) · PPGD/UFSC, 11 november 2026 · 15u10',
    venueLine: 'De circulatie van Franse ideeën en kennis in de Braziliaanse rechtswetenschap · CCJ/UFSC',
    summary:
      'Context, receptie en representatie van machten: gedocumenteerde bijdrage in 7 dia’s met parallelle tijdlijn Frankrijk ⇄ Brazilië (1748, Grondwet van 1824 art. 10, 1891/1896, Burgerlijk Wetboek van 1916 en A Justiça uit 1961) en bronverificatie.',
    metaItems: ['7 dia’s · EN · PT · FR', 'Referenten: Ana Vitória Vanzin Mendes & Marja Mangili'],
    openLabel: 'Presentatie openen (11/11)',
    copyCitationLabel: 'Citaat kopiëren',
    copiedLabel: 'Citaat gekopieerd',
    copiedToast: 'Citaat van de bijdrage van 11/11/2026 (Montesquieu / Dauchy) gekopieerd.',
    academicCitation:
      'MENDES, Ana Vitória Vanzin. Whose Liberty? Montesquieu in Brazil: Discussing Serge Dauchy’s Montesquieu — Context, reception and the representation of powers. Debatbijdrage na de lezing van Serge Dauchy (CNRS/Université de Lille). Florianópolis: PPGD/UFSC, CCJ, 11 nov. 2026. Beschikbaar via: https://anavanzin.com/montesquieu/.',
  },
};

export interface TimelineUIStrings {
  kicker: string;
  heading: string;
  methodNote: string;
  verificationLegendVerified: string;
  verificationLegendPending: string;
  trackAriaLabel: string;
  previousMilestone: string;
  nextMilestone: string;
  filters: { id: TimelineFilter; label: string }[];
  sourceKindLabels: Record<'iconographic' | 'normative' | 'hybrid', string>;
  epistemicLabels: Record<'primary_verified' | 'study_plate' | 'locator_pending', string>;
  hiatusLabels: {
    earlyModernToEmpire: string;
    empireToRepublic: string;
  };
  axisBridgeHeaderLeft: string;
  axisBridgeHeaderRight: string;
  bibliographicRefLabel: string;
  qualificationLabel: string;
  citedSlidesLabel: string;
  copyCitationLabel: string;
  copiedCitationLabel: string;
  citationCopiedToast: string;
  deckNames: {
    trajeto: string;
    representacao: string;
  };
  openSlidePrefix: string;
  openLightbox: string;
  openPrimarySource: string;
  openApparatus: string;
  platePreviewAltSuffix: string;
}

export const TIMELINE_UI: Record<LangCode, TimelineUIStrings> = {
  pt: {
    kicker: 'Cronologia de Circulação & Fontes Citadas · 1494–1906',
    heading: 'Linha do tempo documental e iconográfica',
    methodNote:
      'Paralelo cronológico dos marcos visuais e normativos examinados nas apresentações. A sequência situa pontos de cotejo entre matrizes europeias e casos brasileiros sem pressupor cadeia causal automática.',
    verificationLegendVerified: 'Conferido em texto primário online',
    verificationLegendPending: 'Localizador, edição ou atribuição em conferência',
    trackAriaLabel: 'Marcos documentais de 1494 a 1906',
    previousMilestone: 'Marco anterior',
    nextMilestone: 'Próximo marco',
    filters: [
      { id: 'all', label: 'Todos os marcos (8)' },
      { id: 'venda', label: 'Venda · 1494–1603 (3)' },
      { id: 'imperio', label: 'Império · 1822–1839 (1)' },
      { id: 'republica', label: 'República · 1889–1906 (4)' },
      { id: 'representacao', label: 'Citados na Comunicação (01)' },
      { id: 'trajeto', label: 'Citados no Trajeto (02)' },
    ],
    sourceKindLabels: {
      iconographic: 'Fonte iconográfica',
      normative: 'Diploma normativo',
      hybrid: 'Fonte mista · Norma & objeto',
    },
    epistemicLabels: {
      primary_verified: 'Fonte primária consultada online',
      study_plate: 'Prancha de estudo em cotejo',
      locator_pending: 'Localizador ou edição a conferir',
    },
    hiatusLabels: {
      earlyModernToEmpire: '1603 → 1822 · Atlântico',
      empireToRepublic: '1839 → 1889 · República',
    },
    axisBridgeHeaderLeft: 'MATRIZ EUROPEIA / REPERTÓRIO OU NORMA',
    axisBridgeHeaderRight: 'CASO EXAMINADO / RECEPÇÃO & OPERAÇÃO JURÍDICA',
    bibliographicRefLabel: 'Referência documental:',
    qualificationLabel: 'Qualificação metodológica:',
    citedSlidesLabel: 'Passagens das apresentações que examinam este marco',
    copyCitationLabel: 'Copiar citação',
    copiedCitationLabel: 'Copiado',
    citationCopiedToast: 'Ficha citacional copiada para a área de transferência.',
    deckNames: {
      representacao: '01 · Comunicação',
      trajeto: '02 · Trajeto',
    },
    openSlidePrefix: 'Abrir',
    openLightbox: 'Inspecionar na Mesa de Luz',
    openPrimarySource: 'Consultar texto oficial',
    openApparatus: 'Ver aparato completo',
    platePreviewAltSuffix: 'Miniatura da prancha de estudo vinculada',
  },
  en: {
    kicker: 'Circulation Chronology & Cited Sources · 1494–1906',
    heading: 'Documentary and iconographic timeline',
    methodNote:
      'Chronological parallel of visual and statutory milestones examined across the presentations. Ordering in time situates points of comparison between European repertoires and Brazilian cases without implying an automatic causal chain.',
    verificationLegendVerified: 'Checked against primary text online',
    verificationLegendPending: 'Locator, edition or attribution under check',
    trackAriaLabel: 'Documentary milestones from 1494 to 1906',
    previousMilestone: 'Previous milestone',
    nextMilestone: 'Next milestone',
    filters: [
      { id: 'all', label: 'All milestones (8)' },
      { id: 'venda', label: 'Blindfold · 1494–1603 (3)' },
      { id: 'imperio', label: 'Empire · 1822–1839 (1)' },
      { id: 'republica', label: 'Republic · 1889–1906 (4)' },
      { id: 'representacao', label: 'Cited in Paper (01)' },
      { id: 'trajeto', label: 'Cited in Trajectory (02)' },
    ],
    sourceKindLabels: {
      iconographic: 'Iconographic source',
      normative: 'Statutory instrument',
      hybrid: 'Mixed source · Statute & object',
    },
    epistemicLabels: {
      primary_verified: 'Primary text checked online',
      study_plate: 'Study plate under review',
      locator_pending: 'Locator or edition pending',
    },
    hiatusLabels: {
      earlyModernToEmpire: '1603 → 1822 · Atlantic',
      empireToRepublic: '1839 → 1889 · Republic',
    },
    axisBridgeHeaderLeft: 'EUROPEAN REPERTOIRE / STATUTORY MATRIX',
    axisBridgeHeaderRight: 'EXAMINED CASE / RECEPTION & LEGAL OPERATION',
    bibliographicRefLabel: 'Source Citation:',
    qualificationLabel: 'Qualification:',
    citedSlidesLabel: 'Presentation slides examining this milestone',
    copyCitationLabel: 'Copy citation',
    copiedCitationLabel: 'Copied',
    citationCopiedToast: 'Scholarly citation note copied to clipboard.',
    deckNames: {
      representacao: '01 · Paper',
      trajeto: '02 · Trajectory',
    },
    openSlidePrefix: 'Open',
    openLightbox: 'Inspect on Light Table',
    openPrimarySource: 'Consult official text',
    openApparatus: 'View full apparatus',
    platePreviewAltSuffix: 'Linked study plate thumbnail',
  },
  fr: {
    kicker: 'Chronologie de Circulation & Sources Citées · 1494–1906',
    heading: 'Chronologie documentaire et iconographique',
    methodNote:
      'Parallèle chronologique des jalons visuels et normatifs examinés dans les présentations. L’ordre temporel situe les comparaisons entre répertoires européens et cas brésiliens sans présumer de chaîne causale automatique.',
    verificationLegendVerified: 'Vérifié sur le texte primaire en ligne',
    verificationLegendPending: 'Localisateur, édition ou attribution à vérifier',
    trackAriaLabel: 'Jalons documentaires de 1494 à 1906',
    previousMilestone: 'Jalon précédent',
    nextMilestone: 'Jalon suivant',
    filters: [
      { id: 'all', label: 'Tous les jalons (8)' },
      { id: 'venda', label: 'Bandeau · 1494–1603 (3)' },
      { id: 'imperio', label: 'Empire · 1822–1839 (1)' },
      { id: 'republica', label: 'République · 1889–1906 (4)' },
      { id: 'representacao', label: 'Cités dans Communication (01)' },
      { id: 'trajeto', label: 'Cités dans Parcours (02)' },
    ],
    sourceKindLabels: {
      iconographic: 'Source iconographique',
      normative: 'Acte normatif',
      hybrid: 'Source mixte · Norme & objet',
    },
    epistemicLabels: {
      primary_verified: 'Source primaire vérifiée en ligne',
      study_plate: 'Planche d’étude en confrontation',
      locator_pending: 'Localisateur ou édition à vérifier',
    },
    hiatusLabels: {
      earlyModernToEmpire: '1603 → 1822 · Atlantique',
      empireToRepublic: '1839 → 1889 · République',
    },
    axisBridgeHeaderLeft: 'RÉPERTOIRE EUROPÉEN / MATRICE NORMATIVE',
    axisBridgeHeaderRight: 'CAS EXAMINÉ / RÉCEPTION & OPÉRATION JURIDIQUE',
    bibliographicRefLabel: 'Référence documentaire :',
    qualificationLabel: 'Qualification méthodologique :',
    citedSlidesLabel: 'Diapositives examinant ce jalon',
    copyCitationLabel: 'Copier la citation',
    copiedCitationLabel: 'Copié',
    citationCopiedToast: 'Notice de citation copiée dans le presse-papiers.',
    deckNames: {
      representacao: '01 · Communication',
      trajeto: '02 · Parcours',
    },
    openSlidePrefix: 'Ouvrir',
    openLightbox: 'Inspecter sur la Table lumineuse',
    openPrimarySource: 'Consulter le texte officiel',
    openApparatus: 'Voir l’appareil critique',
    platePreviewAltSuffix: 'Vignette de la planche d’étude associée',
  },
  it: {
    kicker: 'Cronologia di Circolazione & Fonti Citate · 1494–1906',
    heading: 'Cronologia documentaria e iconografica',
    methodNote:
      'Parallelo cronologico dei riferimenti visivi e normativi esaminati nelle presentazioni. L’ordine temporale colloca i confronti tra repertori europei e casi brasiliani senza postulare catene causali automatiche.',
    verificationLegendVerified: 'Riscontrato sul testo primario online',
    verificationLegendPending: 'Localizzatore, edizione o attribuzione in verifica',
    trackAriaLabel: 'Tappe documentarie dal 1494 al 1906',
    previousMilestone: 'Tappa precedente',
    nextMilestone: 'Tappa successiva',
    filters: [
      { id: 'all', label: 'Tutte le tappe (8)' },
      { id: 'venda', label: 'Benda · 1494–1603 (3)' },
      { id: 'imperio', label: 'Impero · 1822–1839 (1)' },
      { id: 'republica', label: 'Repubblica · 1889–1906 (4)' },
      { id: 'representacao', label: 'Citati nella Comunicazione (01)' },
      { id: 'trajeto', label: 'Citati nel Percorso (02)' },
    ],
    sourceKindLabels: {
      iconographic: 'Fonte iconografica',
      normative: 'Atto normativo',
      hybrid: 'Fonte mista · Norma & oggetto',
    },
    epistemicLabels: {
      primary_verified: 'Fonte primaria verificata online',
      study_plate: 'Tavola di studio a confronto',
      locator_pending: 'Localizzatore o edizione da verificare',
    },
    hiatusLabels: {
      earlyModernToEmpire: '1603 → 1822 · Atlantico',
      empireToRepublic: '1839 → 1889 · Repubblica',
    },
    axisBridgeHeaderLeft: 'REPERTORIO EUROPEO / MATRICE NORMATIVA',
    axisBridgeHeaderRight: 'CASO ESAMINATO / RICEZIONE & OPERAZIONE GIURIDICA',
    bibliographicRefLabel: 'Riferimento documentario:',
    qualificationLabel: 'Qualificazione metodologica:',
    citedSlidesLabel: 'Diapositive che esaminano questa tappa',
    copyCitationLabel: 'Copia citazione',
    copiedCitationLabel: 'Copiato',
    citationCopiedToast: 'Nota di citazione copiata negli appunti.',
    deckNames: {
      representacao: '01 · Comunicazione',
      trajeto: '02 · Percorso',
    },
    openSlidePrefix: 'Aprire',
    openLightbox: 'Ispeziona sul Tavolo luminoso',
    openPrimarySource: 'Consulta il testo ufficiale',
    openApparatus: 'Vedi apparato completo',
    platePreviewAltSuffix: 'Miniatura della tavola di studio collegata',
  },
  nl: {
    kicker: 'Circulatiechronologie & Geciteerde Bronnen · 1494–1906',
    heading: 'Documentaire en iconografische tijdlijn',
    methodNote:
      'Chronologische parallel van de visuele en normatieve ijkpunten uit de presentaties. Tijdordening markeert vergelijkingspunten tussen Europese repertoria en Braziliaanse casussen zonder automatische causaliteit.',
    verificationLegendVerified: 'Gecontroleerd aan de hand van primaire tekst online',
    verificationLegendPending: 'Vindplaats, editie of toeschrijving in controle',
    trackAriaLabel: 'Documentaire ijkpunten van 1494 tot 1906',
    previousMilestone: 'Vorig ijkpunt',
    nextMilestone: 'Volgend ijkpunt',
    filters: [
      { id: 'all', label: 'Alle ijkpunten (8)' },
      { id: 'venda', label: 'Blinddoek · 1494–1603 (3)' },
      { id: 'imperio', label: 'Keizerrijk · 1822–1839 (1)' },
      { id: 'republica', label: 'Republiek · 1889–1906 (4)' },
      { id: 'representacao', label: 'Geciteerd in Voordracht (01)' },
      { id: 'trajeto', label: 'Geciteerd in Traject (02)' },
    ],
    sourceKindLabels: {
      iconographic: 'Iconografische bron',
      normative: 'Normatief besluit',
      hybrid: 'Gemengde bron · Norm & object',
    },
    epistemicLabels: {
      primary_verified: 'Primaire tekst online geverifieerd',
      study_plate: 'Studieplaat in vergelijking',
      locator_pending: 'Vindplaats of editie te controleren',
    },
    hiatusLabels: {
      earlyModernToEmpire: '1603 → 1822 · Atlantisch',
      empireToRepublic: '1839 → 1889 · Republiek',
    },
    axisBridgeHeaderLeft: 'EUROPEES REPERTORIUM / NORMATIEVE MATRIX',
    axisBridgeHeaderRight: 'ONDERZOCHTE CASUS / RECEPTIE & JURIDISCHE WERKING',
    bibliographicRefLabel: 'Bronverwijzing:',
    qualificationLabel: 'Methodologische kwalificatie:',
    citedSlidesLabel: 'Dia’s waarin dit ijkpunt wordt besproken',
    copyCitationLabel: 'Citaat kopiëren',
    copiedCitationLabel: 'Gekopieerd',
    citationCopiedToast: 'Broncitaat gekopieerd naar het klembord.',
    deckNames: {
      representacao: '01 · Voordracht',
      trajeto: '02 · Traject',
    },
    openSlidePrefix: 'Open',
    openLightbox: 'Inspecteer op de Lichttafel',
    openPrimarySource: 'Raadpleeg officiële tekst',
    openApparatus: 'Volledig apparaat bekijken',
    platePreviewAltSuffix: 'Miniatuur van de gekoppelde studieplaat',
  },
};

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'brant-1494',
    year: '1494',
    sortYear: 1494,
    accessionCode: 'CAT. 1494.BRANT',
    axis: 'venda',
    sourceKind: 'iconographic',
    epistemicStatus: 'locator_pending',
    atlasEntryId: 'brant-1494',
    copy: {
      pt: {
        shortLabel: 'Brant · Das Narrenschiff',
        title: 'Das Narrenschiff — Cena do louco que venda a Justiça',
        creatorOrIssuer: 'Sebastian Brant (oficina da Basileia / Mestre de Bergmann)',
        mediumOrNorm: 'Xilogravura impressa em livro satírico',
        repositoryOrContext: 'Basileia, Johann Bergmann von Olpe, 1494',
        analyticalFunction: 'Intervenção satírica narrativa sobre o atributo',
        argumentSummary:
          'Permite observar a venda antes de sua estabilização emblemática como imparcialidade, situando o gesto em chave crítica.',
        keyFormulation:
          'O bufão ata a venda sobre os olhos da Justiça entronizada: a cegueira surge como intervenção narrativa satírica sobre o julgamento, não ainda como virtude institucional.',
        bibliographicRef:
          'BRANT, Sebastian. Das Narrenschiff. Basileia: Johann Bergmann von Olpe, 1494 [xilogravura; edição e fólio exatos sob conferência].',
        documentaryCaution:
          'Antecedente comparativo europeu; exige fixação de edição/fólio e não demonstra evolução linear até a iconografia oitocentista.',
        matrixPole: {
          tag: 'BASILEIA · 1494 · XILOGRAVURA SATÍRICA',
          title: 'Sebastian Brant, Das Narrenschiff',
          summary: 'Cena narrativa em que um louco venda a figura feminina da Justiça munida de espada e balança.',
        },
        casePole: {
          tag: 'OPERAÇÃO COMPARATIVA · ICONOCRACIA',
          title: 'Desnaturalização do atributo da venda',
          summary: 'Testa a passagem entre gesto crítico-narrativo e atributo normativo na montagem comparada (1494–1603).',
        },
      },
      en: {
        shortLabel: 'Brant · Das Narrenschiff',
        title: 'Das Narrenschiff — The fool blindfolding Justice',
        creatorOrIssuer: 'Sebastian Brant (Basel workshop / Master of Bergmann)',
        mediumOrNorm: 'Woodcut in printed satirical book',
        repositoryOrContext: 'Basel, Johann Bergmann von Olpe, 1494',
        analyticalFunction: 'Satirical narrative intervention on the attribute',
        argumentSummary:
          'Allows examining the blindfold prior to its emblematic stabilisation as impartiality.',
        keyFormulation:
          'A fool ties a blindfold over enthroned Justice’s eyes: blindness appears as a satirical narrative obstruction of judgment rather than an institutional virtue.',
        bibliographicRef:
          'BRANT, Sebastian. Das Narrenschiff. Basel: Johann Bergmann von Olpe, 1494 [woodcut; exact edition and folio pending check].',
        documentaryCaution:
          'Comparative European antecedent; requires exact folio verification and does not imply linear evolution.',
        matrixPole: {
          tag: 'BASEL · 1494 · SATIRICAL WOODCUT',
          title: 'Sebastian Brant, Das Narrenschiff',
          summary: 'Narrative scene in which a fool blindfolds the female figure of Justice holding sword and scales.',
        },
        casePole: {
          tag: 'COMPARATIVE OPERATION · ICONOCRACIA',
          title: 'Denaturalising the blindfold attribute',
          summary: 'Tests the shift from critical narrative gesture to normative emblem in situated comparison (1494–1603).',
        },
      },
      fr: {
        shortLabel: 'Brant · Das Narrenschiff',
        title: 'Das Narrenschiff — Le fou qui bande les yeux de la Justice',
        creatorOrIssuer: 'Sebastian Brant (atelier de Bâle / Maître de Bergmann)',
        mediumOrNorm: 'Gravure sur bois dans un ouvrage satirique imprimé',
        repositoryOrContext: 'Bâle, Johann Bergmann von Olpe, 1494',
        analyticalFunction: 'Intervention satirique narrative sur l’attribut',
        argumentSummary:
          'Permet d’observer le bandeau avant sa stabilisation en attribut d’impartialité.',
        keyFormulation:
          'Le bouffon noue un bandeau sur les yeux de la Justice : l’aveuglement apparaît comme entrave satirique au jugement et non encore comme vertu.',
        bibliographicRef:
          'BRANT, Sebastian. Das Narrenschiff. Bâle : Johann Bergmann von Olpe, 1494 [gravure sur bois ; édition et folio à préciser].',
        documentaryCaution:
          'Antécédent comparatif européen ; ne démontre aucune évolution universelle ou linéaire.',
        matrixPole: {
          tag: 'BÂLE · 1494 · GRAVURE SATIRIQUE',
          title: 'Sebastian Brant, Das Narrenschiff',
          summary: 'Scène narrative où un fou bande les yeux de la figure féminine de la Justice.',
        },
        casePole: {
          tag: 'OPÉRATION COMPARATIVE · ICONOCRACIA',
          title: 'Dénaturalisation de l’attribut du bandeau',
          summary: 'Interroge le passage d’une scène critique à un attribut normatif (1494–1603).',
        },
      },
      it: {
        shortLabel: 'Brant · Das Narrenschiff',
        title: 'Das Narrenschiff — Il folle che benda la Giustizia',
        creatorOrIssuer: 'Sebastian Brant (officina di Basilea / Maestro di Bergmann)',
        mediumOrNorm: 'Xilografia in libro satirico a stampa',
        repositoryOrContext: 'Basilea, Johann Bergmann von Olpe, 1494',
        analyticalFunction: 'Intervento satirico narrativo sull’attributo',
        argumentSummary:
          'Consente di osservare la benda prima della sua stabilizzazione come imparzialità.',
        keyFormulation:
          'Il buffone lega la benda sugli occhi della Giustizia: la cecità emerge come ostacolo satirico al giudizio, non ancora come virtù istituzionale.',
        bibliographicRef:
          'BRANT, Sebastian. Das Narrenschiff. Basilea: Johann Bergmann von Olpe, 1494 [xilografia; edizione e folio in verifica].',
        documentaryCaution:
          'Antecedente comparativo europeo; non dimostra un’evoluzione lineare o universale.',
        matrixPole: {
          tag: 'BASILEA · 1494 · XILOGRAFIA SATIRICA',
          title: 'Sebastian Brant, Das Narrenschiff',
          summary: 'Scena narrativa in cui un folle benda la figura femminile della Giustizia.',
        },
        casePole: {
          tag: 'OPERAZIONE COMPARATIVA · ICONOCRACIA',
          title: 'Denaturalizzazione della benda',
          summary: 'Esamina il passaggio da gesto narrativo critico ad attributo normativo (1494–1603).',
        },
      },
      nl: {
        shortLabel: 'Brant · Das Narrenschiff',
        title: 'Das Narrenschiff — De dwaas die Gerechtigheid blinddoekt',
        creatorOrIssuer: 'Sebastian Brant (atelier van Bazel / Meester van Bergmann)',
        mediumOrNorm: 'Houtsnede in gedrukt satirisch boek',
        repositoryOrContext: 'Bazel, Johann Bergmann von Olpe, 1494',
        analyticalFunction: 'Satirische narratieve interventie op het attribuut',
        argumentSummary:
          'Maakt het mogelijk de blinddoek te bestuderen vóór de stabilisatie als onpartijdigheid.',
        keyFormulation:
          'Een nar bindt een blinddoek voor de ogen van Gerechtigheid: blindheid verschijnt als satirische belemmering van het oordeel.',
        bibliographicRef:
          'BRANT, Sebastian. Das Narrenschiff. Bazel: Johann Bergmann von Olpe, 1494 [houtsnede; editie en folio in controle].',
        documentaryCaution:
          'Europees vergelijkingspunt; impliceert geen lineaire ontwikkeling.',
        matrixPole: {
          tag: 'BAZEL · 1494 · SATIRISCHE HOUTSNEDE',
          title: 'Sebastian Brant, Das Narrenschiff',
          summary: 'Narratief tafereel waarin een dwaas Vrouwe Justitia blinddoekt.',
        },
        casePole: {
          tag: 'VERGELIJKENDE OPERATIE · ICONOCRACIA',
          title: 'Historisering van het blinddoek-attribuut',
          summary: 'Onderzoekt de verschuiving van kritische scène naar normatief kenmerk (1494–1603).',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 5,
        slideNum: '06',
        titleByLang: {
          pt: 'A venda em comparação, 1494–1603',
          en: 'The blindfold in comparison, 1494–1603',
          fr: 'Le bandeau en comparaison, 1494–1603',
          it: 'La benda a confronto, 1494–1603',
          nl: 'De blinddoek vergeleken, 1494–1603',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 6,
        slideNum: '07',
        titleByLang: {
          pt: 'Zwischenraum: uma hipótese sob exame',
          en: 'Zwischenraum: a hypothesis under examination',
          fr: 'Zwischenraum : une hypothèse à l’examen',
          it: 'Zwischenraum: un’ipotesi sotto esame',
          nl: 'Zwischenraum: een hypothese onder onderzoek',
        },
      },
      {
        deck: 'trajeto',
        slideIndex: 5,
        slideNum: '06',
        titleByLang: {
          pt: '2. Warburg contra Panofsky?',
          en: '2. Warburg against Panofsky?',
          fr: '2. Warburg contre Panofsky ?',
          it: '2. Warburg contro Panofsky?',
          nl: '2. Warburg tegenover Panofsky?',
        },
      },
    ],
  },
  {
    id: 'gieng-1543',
    year: '1543',
    sortYear: 1543,
    accessionCode: 'CAT. 1543.GIENG',
    axis: 'venda',
    sourceKind: 'iconographic',
    epistemicStatus: 'study_plate',
    atlasEntryId: 'gieng-1543',
    copy: {
      pt: {
        shortLabel: 'Gieng · Fonte da Justiça',
        title: 'Gerechtigkeitsbrunnen (Fonte da Justiça de Berna)',
        creatorOrIssuer: 'Hans Gieng',
        mediumOrNorm: 'Escultura cívica policromada sobre coluna coríntia',
        repositoryOrContext: 'Gerechtigkeitsgasse, Berna (original no Bernisches Historisches Museum)',
        analyticalFunction: 'Integração da venda em figura cívica no espaço urbano',
        argumentSummary:
          'Apresenta outra situação histórica: a venda integrada a um monumento de jurisdição municipal.',
        keyFormulation:
          'Acima dos poderes terrenos na base da coluna, a Justiça policromada porta espada, balança e venda em pleno espaço cívico de Berna.',
        bibliographicRef:
          'GIENG, Hans. Gerechtigkeitsbrunnen, 1543. Calcário policromado. Berna: Gerechtigkeitsgasse / Bernisches Historisches Museum.',
        documentaryCaution:
          'A leitura formal requer documentação sobre os usos cívicos do monumento e distinção entre o original musealizado e a réplica de rua.',
        matrixPole: {
          tag: 'BERNA · 1543 · MONUMENTO CÍVICO',
          title: 'Hans Gieng, Gerechtigkeitsbrunnen',
          summary: 'Estátua urbana policromada na qual a venda já integra a composição monumental da Justiça.',
        },
        casePole: {
          tag: 'EXIGÊNCIA METODOLÓGICA · ZWISCHENRAUM',
          title: 'Contexto institucional vs. forma isolada',
          summary: 'Mostra que a mudança de suporte (livro satírico → fonte pública) altera o regime de apresentação da norma.',
        },
      },
      en: {
        shortLabel: 'Gieng · Justice Fountain',
        title: 'Gerechtigkeitsbrunnen (Fountain of Justice, Bern)',
        creatorOrIssuer: 'Hans Gieng',
        mediumOrNorm: 'Polychrome stone civic sculpture on Corinthian column',
        repositoryOrContext: 'Gerechtigkeitsgasse, Bern (original in Bernisches Historisches Museum)',
        analyticalFunction: 'Integration of the blindfold in a public civic monument',
        argumentSummary:
          'Offers a distinct historical setting where the blindfold forms part of a municipal jurisdiction monument.',
        keyFormulation:
          'Standing atop a Corinthian column above earthly rulers, polychrome Justice bears sword, scales, and blindfold in Bern’s civic space.',
        bibliographicRef:
          'GIENG, Hans. Gerechtigkeitsbrunnen, 1543. Polychrome limestone. Bern: Gerechtigkeitsgasse / Bernisches Historisches Museum.',
        documentaryCaution:
          'Formal analysis must be paired with municipal context and distinguish the museum original from the street replica.',
        matrixPole: {
          tag: 'BERN · 1543 · CIVIC MONUMENT',
          title: 'Hans Gieng, Gerechtigkeitsbrunnen',
          summary: 'Polychrome urban statue integrating the blindfold into a public figure of civic authority.',
        },
        casePole: {
          tag: 'METHODOLOGICAL DEMAND · ZWISCHENRAUM',
          title: 'Institutional setting vs. isolated form',
          summary: 'Demonstrates that shifting medium (satirical print → civic fountain) alters how normativity is staged.',
        },
      },
      fr: {
        shortLabel: 'Gieng · Fontaine de la Justice',
        title: 'Gerechtigkeitsbrunnen (Fontaine de la Justice de Berne)',
        creatorOrIssuer: 'Hans Gieng',
        mediumOrNorm: 'Sculpture civique polychrome sur colonne corinthienne',
        repositoryOrContext: 'Gerechtigkeitsgasse, Berne (original au Bernisches Historisches Museum)',
        analyticalFunction: 'Intégration du bandeau dans une figure civique urbaine',
        argumentSummary:
          'Présente une autre situation historique : le bandeau intégré à un monument de juridiction municipale.',
        keyFormulation:
          'Au sommet de la colonne civique de Berne, la Justice polychrome porte l’épée, la balance et le bandeau dans l’espace public.',
        bibliographicRef:
          'GIENG, Hans. Gerechtigkeitsbrunnen, 1543. Pierre polychrome. Berne : Gerechtigkeitsgasse / Bernisches Historisches Museum.',
        documentaryCaution:
          'La lecture formelle doit être accompagnée des usages du monument et distinguer l’original du musée de la copie urbaine.',
        matrixPole: {
          tag: 'BERNE · 1543 · MONUMENT CIVIQUE',
          title: 'Hans Gieng, Gerechtigkeitsbrunnen',
          summary: 'Statue urbaine polychrome intégrant le bandeau à une figure civique.',
        },
        casePole: {
          tag: 'EXIGENCE MÉTHODOLOGIQUE · ZWISCHENRAUM',
          title: 'Cadre institutionnel vs forme isolée',
          summary: 'Le passage du livre satirique à la fontaine publique modifie le régime de présentation de la norme.',
        },
      },
      it: {
        shortLabel: 'Gieng · Fontana della Giustizia',
        title: 'Gerechtigkeitsbrunnen (Fontana della Giustizia di Berna)',
        creatorOrIssuer: 'Hans Gieng',
        mediumOrNorm: 'Scultura civica policroma su colonna corinzia',
        repositoryOrContext: 'Gerechtigkeitsgasse, Berna (originale al Bernisches Historisches Museum)',
        analyticalFunction: 'Integrazione della benda in una figura civica urbana',
        argumentSummary:
          'Offre un’altra situazione storica in cui la benda fa parte di un monumento civico municipale.',
        keyFormulation:
          'Sulla colonna civica di Berna, la Giustizia policroma reca spada, bilancia e benda nello spazio urbano.',
        bibliographicRef:
          'GIENG, Hans. Gerechtigkeitsbrunnen, 1543. Pietra policroma. Berna: Gerechtigkeitsgasse / Bernisches Historisches Museum.',
        documentaryCaution:
          'La lettura formale richiede il contesto degli usi municipali e la distinzione tra originale museale e copia stradale.',
        matrixPole: {
          tag: 'BERNA · 1543 · MONUMENTO CIVICO',
          title: 'Hans Gieng, Gerechtigkeitsbrunnen',
          summary: 'Statua policroma urbana in cui la benda è integrata nella figura civica.',
        },
        casePole: {
          tag: 'ESIGENZA METODOLOGICA · ZWISCHENRAUM',
          title: 'Contesto istituzionale vs forma isolata',
          summary: 'Il passaggio dalla stampa satirica alla fontana civica muta la presentazione della norma.',
        },
      },
      nl: {
        shortLabel: 'Gieng · Gerechtigheidsfontein',
        title: 'Gerechtigkeitsbrunnen (Fontein van de Gerechtigheid, Bern)',
        creatorOrIssuer: 'Hans Gieng',
        mediumOrNorm: 'Polychroom stedelijk beeldhouwwerk op Korinthische zuil',
        repositoryOrContext: 'Gerechtigkeitsgasse, Bern (origineel in Bernisches Historisches Museum)',
        analyticalFunction: 'Integratie van de blinddoek in een stedelijk monument',
        argumentSummary:
          'Biedt een andere historische situatie waarin de blinddoek deel uitmaakt van een stedelijk monument.',
        keyFormulation:
          'Boven op de Korinthische zuil in Bern draagt de polychrome Gerechtigheid zwaard, weegschaal en blinddoek in de publieke ruimte.',
        bibliographicRef:
          'GIENG, Hans. Gerechtigkeitsbrunnen, 1543. Polychrome kalksteen. Bern: Gerechtigkeitsgasse / Bernisches Historisches Museum.',
        documentaryCaution:
          'Vormanalyse vereist documentatie van stedelijk gebruik en onderscheid tussen museumorigineel en straatkopie.',
        matrixPole: {
          tag: 'BERN · 1543 · STEDELIJK MONUMENT',
          title: 'Hans Gieng, Gerechtigkeitsbrunnen',
          summary: 'Polychroom stadsbeeld waarin de blinddoek deel uitmaakt van de publieke figuur.',
        },
        casePole: {
          tag: 'METHODOLOGISCHE EIS · ZWISCHENRAUM',
          title: 'Institutionele context vs. losse vorm',
          summary: 'De overgang van satirische prent naar stadsfontein verandert de presentatie van de norm.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 5,
        slideNum: '06',
        titleByLang: {
          pt: 'A venda em comparação, 1494–1603',
          en: 'The blindfold in comparison, 1494–1603',
          fr: 'Le bandeau en comparaison, 1494–1603',
          it: 'La benda a confronto, 1494–1603',
          nl: 'De blinddoek vergeleken, 1494–1603',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 6,
        slideNum: '07',
        titleByLang: {
          pt: 'Zwischenraum: uma hipótese sob exame',
          en: 'Zwischenraum: a hypothesis under examination',
          fr: 'Zwischenraum : une hypothèse à l’examen',
          it: 'Zwischenraum: un’ipotesi sotto esame',
          nl: 'Zwischenraum: een hypothese onder onderzoek',
        },
      },
    ],
  },
  {
    id: 'ripa-1603',
    year: '1593 / 1603',
    sortYear: 1603,
    accessionCode: 'CAT. 1603.RIPA',
    axis: 'venda',
    sourceKind: 'iconographic',
    epistemicStatus: 'locator_pending',
    atlasEntryId: 'ripa-1603',
    copy: {
      pt: {
        shortLabel: 'Ripa · Iconologia',
        title: 'Iconologia — Verbete Giustizia',
        creatorOrIssuer: 'Cesare Ripa',
        mediumOrNorm: 'Repertório emblemático (1593 sem gravuras; 1603 1ª ed. ilustrada)',
        repositoryOrContext: 'Roma, 1593 / Roma, Lepido Facii, 1603',
        analyticalFunction: 'Codificação repertorial e rigor filológico entre edições',
        argumentSummary:
          'Obriga a identificar edição e variante de Giustizia antes de atribuir sentido à venda ou postular transmissão a Debret.',
        keyFormulation:
          'A edição romana de 1593 (sem gravuras) não se confunde com a de 1603 (ilustrada), e Giustizia comporta subtipos distintos quanto ao uso da venda.',
        bibliographicRef:
          'RIPA, Cesare. Iconologia. Roma: Heredi di Giovanni Gigliotti, 1593; Roma: Lepido Facii, 1603 [página e subtipo de Giustizia a fixar].',
        documentaryCaution:
          'A aproximação com Debret propõe comparação; demonstrar transmissão exige provar edições consultadas, acesso e usos no espaço luso-brasileiro.',
        matrixPole: {
          tag: 'ROMA · 1593 / 1603 · REPERTÓRIO',
          title: 'Cesare Ripa, Iconologia (Giustizia)',
          summary: 'Manual de personificações alegóricas cujas edições e gravuras estabilizam atributos visuais na Europa moderna.',
        },
        casePole: {
          tag: 'CIRCULAÇÃO FRANÇA–BRASIL · COTEJO',
          title: 'Filologia das edições antes da recepção',
          summary: 'Articula Warburg e Panofsky: identificar edição e figura precede qualquer hipótese sobre uso oitocentista no Brasil.',
        },
      },
      en: {
        shortLabel: 'Ripa · Iconologia',
        title: 'Iconologia — Entry Giustizia',
        creatorOrIssuer: 'Cesare Ripa',
        mediumOrNorm: 'Emblematic repertoire (1593 unillustrated; 1603 first illustrated ed.)',
        repositoryOrContext: 'Rome, 1593 / Rome, Lepido Facii, 1603',
        analyticalFunction: 'Repertorial codification and philological distinction across editions',
        argumentSummary:
          'Requires identifying the exact edition and figure of Giustizia before attributing meaning to the blindfold or linking it to Debret.',
        keyFormulation:
          'Rome’s unillustrated 1593 edition cannot be conflated with the 1603 illustrated edition, and Giustizia comprises distinct variants regarding the blindfold.',
        bibliographicRef:
          'RIPA, Cesare. Iconologia. Rome: Gigliotti, 1593; Rome: Lepido Facii, 1603 [exact page and Giustizia subtype pending].',
        documentaryCaution:
          'Pairing Ripa with Debret proposes a comparison; proving transmission requires documenting editions, access, and uses.',
        matrixPole: {
          tag: 'ROME · 1593 / 1603 · REPERTOIRE',
          title: 'Cesare Ripa, Iconologia (Giustizia)',
          summary: 'Handbook of allegorical personifications whose editions codified visual attributes across early modern Europe.',
        },
        casePole: {
          tag: 'FRANCE–BRAZIL CIRCULATION · CHECK',
          title: 'Edition philology prior to reception claims',
          summary: 'Bridges Warburg and Panofsky: identifying edition and subtype precedes any claim of nineteenth-century Brazilian uptake.',
        },
      },
      fr: {
        shortLabel: 'Ripa · Iconologia',
        title: 'Iconologia — Entrée Giustizia',
        creatorOrIssuer: 'Cesare Ripa',
        mediumOrNorm: 'Répertoire emblématique (1593 sans gravures ; 1603 1re éd. illustrée)',
        repositoryOrContext: 'Rome, 1593 / Rome, Lepido Facii, 1603',
        analyticalFunction: 'Codification répertoriale et distinction philologique des éditions',
        argumentSummary:
          'Exige d’identifier l’édition et la variante de Giustizia avant toute comparaison avec Debret.',
        keyFormulation:
          'L’édition romaine de 1593 (sans gravures) ne se confond pas avec celle de 1603 (illustrée), et Giustizia compte plusieurs variantes.',
        bibliographicRef:
          'RIPA, Cesare. Iconologia. Rome : Gigliotti, 1593 ; Rome : Lepido Facii, 1603 [page et variante à préciser].',
        documentaryCaution:
          'Rapprocher Ripa et Debret propose une comparaison ; prouver la transmission exige d’établir éditions, accès et usages.',
        matrixPole: {
          tag: 'ROME · 1593 / 1603 · RÉPERTOIRE',
          title: 'Cesare Ripa, Iconologia (Giustizia)',
          summary: 'Répertoire d’allégories codifiant les attributs visuels dans l’Europe moderne.',
        },
        casePole: {
          tag: 'CIRCULATION FRANCE–BRÉSIL · CONTRÔLE',
          title: 'Philologie des éditions avant la réception',
          summary: 'Identifier l’édition et la figure précède toute hypothèse de transmission au Brésil.',
        },
      },
      it: {
        shortLabel: 'Ripa · Iconologia',
        title: 'Iconologia — Voce Giustizia',
        creatorOrIssuer: 'Cesare Ripa',
        mediumOrNorm: 'Repertorio emblematico (1593 senza incisioni; 1603 1ª ed. illustrata)',
        repositoryOrContext: 'Roma, 1593 / Roma, Lepido Facii, 1603',
        analyticalFunction: 'Codificazione repertoriale e rigore filologico tra edizioni',
        argumentSummary:
          'Impone di identificare edizione e variante di Giustizia prima di postulare trasmissioni verso Debret.',
        keyFormulation:
          'L’edizione romana del 1593 (senza incisioni) non va confusa con quella illustrata del 1603, e Giustizia presenta sottotipi distinti.',
        bibliographicRef:
          'RIPA, Cesare. Iconologia. Roma: Gigliotti, 1593; Roma: Lepido Facii, 1603 [pagina e variante da fissare].',
        documentaryCaution:
          'Accostare Ripa e Debret propone un confronto; dimostrare la trasmissione richiede edizioni, accessi e usi documentati.',
        matrixPole: {
          tag: 'ROMA · 1593 / 1603 · REPERTORIO',
          title: 'Cesare Ripa, Iconologia (Giustizia)',
          summary: 'Repertorio di personificazioni allegoriche nella cultura europea moderna.',
        },
        casePole: {
          tag: 'CIRCOLAZIONE FRANCIA–BRASILE',
          title: 'Filologia delle edizioni prima della ricezione',
          summary: 'Identificare edizione e figura precede ogni ipotesi di riuso ottocentesco in Brasile.',
        },
      },
      nl: {
        shortLabel: 'Ripa · Iconologia',
        title: 'Iconologia — Lemma Giustizia',
        creatorOrIssuer: 'Cesare Ripa',
        mediumOrNorm: 'Emblematisch repertorium (1593 zonder prenten; 1603 1e geïllustreerde druk)',
        repositoryOrContext: 'Rome, 1593 / Rome, Lepido Facii, 1603',
        analyticalFunction: 'Codificatie en filologisch onderscheid tussen edities',
        argumentSummary:
          'Vereist identificatie van editie en variant van Giustizia vóór elke vergelijking met Debret.',
        keyFormulation:
          'De onverluchte druk van 1593 mag niet worden verward met de geïllustreerde uitgave van 1603.',
        bibliographicRef:
          'RIPA, Cesare. Iconologia. Rome: Gigliotti, 1593; Rome: Lepido Facii, 1603 [pagina en variant in controle].',
        documentaryCaution:
          'Vergelijking met Debret bewijst nog geen overdracht zonder documentatie van edities en gebruik.',
        matrixPole: {
          tag: 'ROME · 1593 / 1603 · REPERTORIUM',
          title: 'Cesare Ripa, Iconologia (Giustizia)',
          summary: 'Handboek van allegorische personificaties in vroegmodern Europa.',
        },
        casePole: {
          tag: 'CIRCULATIE FRANKRIJK–BRAZILIË',
          title: 'Editiefilologie vóór receptieclaims',
          summary: 'Identificatie van druk en figuur gaat vooraf aan uitspraken over Braziliaanse receptie.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 3,
        slideNum: '04',
        titleByLang: {
          pt: 'Circulação França–Brasil: objetos e percursos',
          en: 'France–Brazil circulation: objects and trajectories',
          fr: 'Circulation France–Brésil : objets et parcours',
          it: 'Circolazione Francia–Brasile: oggetti e percorsi',
          nl: 'Circulatie Frankrijk–Brazilië: objecten en trajecten',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 5,
        slideNum: '06',
        titleByLang: {
          pt: 'A venda em comparação, 1494–1603',
          en: 'The blindfold in comparison, 1494–1603',
          fr: 'Le bandeau en comparaison, 1494–1603',
          it: 'La benda a confronto, 1494–1603',
          nl: 'De blinddoek vergeleken, 1494–1603',
        },
      },
      {
        deck: 'trajeto',
        slideIndex: 5,
        slideNum: '06',
        titleByLang: {
          pt: '2. Warburg contra Panofsky?',
          en: '2. Warburg against Panofsky?',
          fr: '2. Warburg contre Panofsky ?',
          it: '2. Warburg contro Panofsky?',
          nl: '2. Warburg tegenover Panofsky?',
        },
      },
    ],
  },
  {
    id: 'debret-1822',
    year: '1822 / 1839',
    sortYear: 1822,
    accessionCode: 'CAT. 1822.DEBRET',
    axis: 'imperio',
    sourceKind: 'iconographic',
    epistemicStatus: 'locator_pending',
    atlasEntryId: 'debret-1822',
    companionCrossRef: {
      url: 'https://anavanzin.com/montesquieu/#slide-3',
      labelByLang: {
        pt: 'Ver paralelo sobre 1824 (Art. 10 & Dauchy §6) na intervenção de 11/11',
        en: 'See parallel on 1824 (Art. 10 & Dauchy ¶6) in the 11 Nov intervention',
        fr: 'Voir le parallèle sur 1824 (Art. 10 & Dauchy §6) dans l’intervention du 11/11',
        it: 'Vedi il parallelo sul 1824 (Art. 10 & Dauchy §6) nell’intervento dell’11/11',
        nl: 'Zie parallel over 1824 (Art. 10 & Dauchy §6) in de bijdrage van 11/11',
      },
      noteByLang: {
        pt: 'Conecta-se diretamente ao Slide 03 de Whose Liberty? Montesquieu in Brazil (11/11/2026), onde o art. 10 da Constituição de 1824 (Legislativo, Moderador, Executivo, Judicial) é cotejado com o §6 de Serge Dauchy.',
        en: 'Connects directly to Slide 03 of Whose Liberty? Montesquieu in Brazil (11 Nov 2026), examining Article 10 of the 1824 Constitution (four powers) alongside Serge Dauchy ¶6.',
        fr: 'Relié directement à la diapositive 03 de Whose Liberty? Montesquieu in Brazil (11/11/2026) sur l’art. 10 de la Charte de 1824 (quatre pouvoirs) et Serge Dauchy §6.',
        it: 'Collegato direttamente alla diapositiva 03 di Whose Liberty? Montesquieu in Brazil (11/11/2026) sull’art. 10 della Carta del 1824 e Serge Dauchy §6.',
        nl: 'Sluit direct aan bij dia 03 van Whose Liberty? Montesquieu in Brazil (11/11/2026) over art. 10 van de Grondwet van 1824 en Serge Dauchy §6.',
      },
    },
    copy: {
      pt: {
        shortLabel: 'Debret · Constituição em cena',
        title: 'Alegoria do Governo Imperial e tábuas da Constituição (1822 / 1824 / 1839)',
        creatorOrIssuer: 'Jean-Baptiste Debret',
        mediumOrNorm: 'Cenografia da coroação (1822) e litografia em Voyage pittoresque, t. III, pr. 49 (1839)',
        repositoryOrContext: 'Rio de Janeiro, 1822 · Carta de 1824 · Edição parisiense de 1839',
        analyticalFunction: 'Defasagem temporal entre cena cerimonial (1822), Carta outorgada (1824) e edição (1839)',
        argumentSummary:
          'A alegoria feminina coroada empunha espada e tábuas da Constituição antes da outorga de 1824, sendo reimpressa e descrita em Paris em 1839.',
        keyFormulation:
          'Figura feminina sentada e coroada com espada e tábuas da Constituição, identificada como Governo Imperial: encenação de 1822 anterior à Carta de 1824 e publicada na prancha 49 (vol. III) em 1839.',
        bibliographicRef:
          'DEBRET, Jean-Baptiste. Voyage pittoresque et historique au Brésil, t. III, pr. 49. Paris: Firmin Didot, 1839 [cotejo com Silva, 2017, p. 32; Lima Junior, 2020, p. 136–139; Rosa, Rodrigues e Abraham, 2020, p. 71–72].',
        documentaryCaution:
          'Conferência direta da prancha 49, identificação do original, encomenda e eventual intervenção de José Bonifácio permanecem pendentes.',
        matrixPole: {
          tag: 'MISSÃO FRANCESA & EDIÇÃO PARISIENSE · 1839',
          title: 'Debret, Voyage pittoresque (t. III, pr. 49)',
          summary: 'Repertório alegórico neoclássico francês recodificado editorialmente em Paris dezessete anos após a coroação.',
        },
        casePole: {
          tag: 'RIO DE JANEIRO · 1822 ANTES DE 1824',
          title: 'A Constituição em cena antes da Carta outorgada',
          summary: 'Separa três tempos distintos: o programa efêmero de 1822, a Constituição imperial de 1824 (4 poderes) e o livro de 1839.',
        },
      },
      en: {
        shortLabel: 'Debret · Constitution on stage',
        title: 'Allegory of the Imperial Government and tablets of the Constitution (1822 / 1824 / 1839)',
        creatorOrIssuer: 'Jean-Baptiste Debret',
        mediumOrNorm: 'Coronation composition (1822) and lithograph in Voyage pittoresque, vol. III, pl. 49 (1839)',
        repositoryOrContext: 'Rio de Janeiro, 1822 · 1824 Charter · Paris edition, 1839',
        analyticalFunction: 'Temporal gap between 1822 ceremony, 1824 Charter, and 1839 Paris publication',
        argumentSummary:
          'Crowned female allegory holding sword and constitutional tablets predates Brazil’s 1824 Constitution and circulates in print in 1839.',
        keyFormulation:
          'Seated crowned female figure with sword and tablets of the Constitution, described as Imperial Government: staged in 1822 prior to the 1824 Charter and published as plate 49 (vol. III) in 1839.',
        bibliographicRef:
          'DEBRET, Jean-Baptiste. Voyage pittoresque et historique au Brésil, vol. III, pl. 49. Paris: Firmin Didot, 1839 [cf. Silva, 2017, p. 32; Lima Junior, 2020, p. 136–139].',
        documentaryCaution:
          'Direct check of plate 49, original artwork location, commission details, and José Bonifácio’s role remain pending.',
        matrixPole: {
          tag: 'FRENCH ARTISTIC TRAINING & PARIS · 1839',
          title: 'Debret, Voyage pittoresque (vol. III, pl. 49)',
          summary: 'French neoclassical allegorical vocabulary editorially framed in Paris seventeen years after the Rio ceremony.',
        },
        casePole: {
          tag: 'RIO DE JANEIRO · 1822 PRIOR TO 1824',
          title: 'Staging the Constitution before the 1824 Charter',
          summary: 'Distinguishes three moments: the 1822 coronation design, the 1824 four-power Constitution, and the 1839 volume.',
        },
      },
      fr: {
        shortLabel: 'Debret · Constitution en scène',
        title: 'Allégorie du Gouvernement impérial et tables de la Constitution (1822 / 1824 / 1839)',
        creatorOrIssuer: 'Jean-Baptiste Debret',
        mediumOrNorm: 'Scénographie du sacre (1822) et lithographie du Voyage pittoresque, t. III, pl. 49 (1839)',
        repositoryOrContext: 'Rio de Janeiro, 1822 · Charte de 1824 · Édition parisienne, 1839',
        analyticalFunction: 'Écart temporel entre la scène de 1822, la Charte de 1824 et l’édition de 1839',
        argumentSummary:
          'L’allégorie féminine couronnée tenant l’épée et les tables de la Constitution précède la Charte de 1824 et paraît à Paris en 1839.',
        keyFormulation:
          'Figure féminine assise et couronnée avec épée et tables de la Constitution, identifiée comme Gouvernement impérial : scène de 1822 antérieure à 1824, publiée pl. 49 (t. III) en 1839.',
        bibliographicRef:
          'DEBRET, Jean-Baptiste. Voyage pittoresque et historique au Brésil, t. III, pl. 49. Paris : Firmin Didot, 1839 [cf. Silva, 2017 ; Lima Junior, 2020].',
        documentaryCaution:
          'Vérification directe de la planche 49, de l’original, de la commande et du rôle de José Bonifácio en attente.',
        matrixPole: {
          tag: 'FORMATION FRANÇAISE & ÉDITION PARISIENNE · 1839',
          title: 'Debret, Voyage pittoresque (t. III, pl. 49)',
          summary: 'Vocabulaire allégorique néoclassique français republié et commenté à Paris en 1839.',
        },
        casePole: {
          tag: 'RIO DE JANEIRO · 1822 AVANT 1824',
          title: 'La Constitution en scène avant la Charte octroyée',
          summary: 'Sépare le décor de 1822, la Constitution impériale de 1824 et le commentaire éditorial de 1839.',
        },
      },
      it: {
        shortLabel: 'Debret · Costituzione in scena',
        title: 'Allegoria del Governo Imperiale e tavole della Costituzione (1822 / 1824 / 1839)',
        creatorOrIssuer: 'Jean-Baptiste Debret',
        mediumOrNorm: 'Composizione del 1822 e litografia in Voyage pittoresque, t. III, tav. 49 (1839)',
        repositoryOrContext: 'Rio de Janeiro, 1822 · Carta del 1824 · Edizione parigina, 1839',
        analyticalFunction: 'Scarto temporale tra scena del 1822, Carta del 1824 ed edizione del 1839',
        argumentSummary:
          'La figura femminile incoronata con spada e tavole della Costituzione precede la Carta del 1824 e viene pubblicata a Parigi nel 1839.',
        keyFormulation:
          'Figura femminile seduta e incoronata con spada e tavole della Costituzione (Governo Imperiale): scena del 1822 anteriore al 1824, edita nella tav. 49 (vol. III) nel 1839.',
        bibliographicRef:
          'DEBRET, Jean-Baptiste. Voyage pittoresque et historique au Brésil, t. III, tav. 49. Parigi: Firmin Didot, 1839.',
        documentaryCaution:
          'Riscontro diretto della tavola 49, dell’originale e dell’intervento di José Bonifácio in sospeso.',
        matrixPole: {
          tag: 'FORMAZIONE FRANCESE & PARIGI · 1839',
          title: 'Debret, Voyage pittoresque (t. III, tav. 49)',
          summary: 'Lessico allegorico neoclassico francese rielaborato editorialmente a Parigi nel 1839.',
        },
        casePole: {
          tag: 'RIO DE JANEIRO · 1822 PRIMA DEL 1824',
          title: 'La Costituzione in scena prima della Carta del 1824',
          summary: 'Distingue la scena del 1822, la Costituzione imperiale del 1824 e il volume parigino del 1839.',
        },
      },
      nl: {
        shortLabel: 'Debret · Grondwet in beeld',
        title: 'Allegorie van het Keizerlijk Bestuur en tafelen van de Grondwet (1822 / 1824 / 1839)',
        creatorOrIssuer: 'Jean-Baptiste Debret',
        mediumOrNorm: 'Kroningsontwerp (1822) en lithografie in Voyage pittoresque, dl. III, pl. 49 (1839)',
        repositoryOrContext: 'Rio de Janeiro, 1822 · Grondwet 1824 · Parijse druk, 1839',
        analyticalFunction: 'Tijdsverschil tussen 1822, de Grondwet van 1824 en de uitgave van 1839',
        argumentSummary:
          'De gekroonde vrouwelijke allegorie met zwaard en grondwetstafelen gaat vooraf aan de Grondwet van 1824.',
        keyFormulation:
          'Zittende gekroonde vrouwenfiguur met zwaard en grondwetstafelen (Keizerlijk Bestuur): ontworpen in 1822 vóór 1824 en gepubliceerd als plaat 49 in 1839.',
        bibliographicRef:
          'DEBRET, Jean-Baptiste. Voyage pittoresque et historique au Brésil, dl. III, pl. 49. Parijs: Firmin Didot, 1839.',
        documentaryCaution:
          'Rechtstreekse controle van plaat 49, het origineel en de rol van José Bonifácio staan nog open.',
        matrixPole: {
          tag: 'FRANSE OPLEIDING & PARIJS · 1839',
          title: 'Debret, Voyage pittoresque (dl. III, pl. 49)',
          summary: 'Frans neoclassicistisch allegorisch idioom, redactioneel uitgegeven in Parijs in 1839.',
        },
        casePole: {
          tag: 'RIO DE JANEIRO · 1822 VÓÓR 1824',
          title: 'De Grondwet opgevoerd vóór het Charter van 1824',
          summary: 'Scheidt het ontwerp uit 1822, de Grondwet van 1824 en de Parijse publicatie uit 1839.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 7,
        slideNum: '08',
        titleByLang: {
          pt: 'Debret: a Constituição em cena',
          en: 'Debret: the Constitution on stage',
          fr: 'Debret : la Constitution en scène',
          it: 'Debret: la Costituzione in scena',
          nl: 'Debret: de Grondwet in beeld',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 3,
        slideNum: '04',
        titleByLang: {
          pt: 'Circulação França–Brasil: objetos e percursos',
          en: 'France–Brazil circulation: objects and trajectories',
          fr: 'Circulation France–Brésil : objets et parcours',
          it: 'Circolazione Francia–Brasile: oggetti e percorsi',
          nl: 'Circulatie Frankrijk–Brazilië: objecten en trajecten',
        },
      },
      {
        deck: 'trajeto',
        slideIndex: 7,
        slideNum: '08',
        titleByLang: {
          pt: '3. Reunir imagens e sustentar uma tese',
          en: '3. Collecting images and supporting a thesis',
          fr: '3. Réunir des images et étayer une thèse',
          it: '3. Riunire immagini e sostenere una tesi',
          nl: '3. Beelden verzamelen en een proefschrift onderbouwen',
        },
      },
    ],
  },
  {
    id: 'decreto-4-1889',
    year: '19 nov. 1889',
    sortYear: 1889.88,
    accessionCode: 'DOC. 1889.0004',
    axis: 'republica',
    sourceKind: 'normative',
    epistemicStatus: 'locator_pending',
    copy: {
      pt: {
        shortLabel: 'Decreto nº 4 · Selos e bandeira',
        title: 'Decreto nº 4, de 19 de novembro de 1889 — Bandeira, armas e selos nacionais',
        creatorOrIssuer: 'Governo Provisório da República dos Estados Unidos do Brasil',
        mediumOrNorm: 'Ato normativo sobre símbolos não antropomórficos & percurso de Décio Villares',
        repositoryOrContext: 'Primeira República · Formação francesa de Décio Villares',
        analyticalFunction: 'Separar a fixação normativa de um desenho da disciplina jurídica de uso do selo',
        argumentSummary:
          'Contrasta emblemas oficiais não antropomórficos (esfera, estrelas, armas) com alegorias femininas da República, exigindo documentação específica para cada suporte.',
        keyFormulation:
          'Fixar normativamente o desenho da bandeira, das armas e do selo nacional e disciplinar o uso jurídico autenticador de um selo constituem operações distintas.',
        bibliographicRef:
          'BRASIL. Decreto nº 4, de 19 de novembro de 1889 [normas correlatas de uso jurídico dos selos e datação da tela A República de Décio Villares a verificar].',
        documentaryCaution:
          'A participação de Décio Villares na bandeira de 1889 não basta para datar a pintura A República; identidade material da tela e normas de uso dos selos pendentes.',
        matrixPole: {
          tag: 'FORMAÇÃO FRANCESA & POSITIVISMO · 1889',
          title: 'Percurso francês de Décio Villares & alegoria republicana',
          summary: 'Circulação artística entre Paris e o apostolado positivista no Rio de Janeiro na virada de 1889.',
        },
        casePole: {
          tag: 'BRASIL · DECRETO Nº 4 (19 NOV. 1889)',
          title: 'Símbolos oficiais não antropomórficos vs. alegoria',
          summary: 'Testa os limites da hipótese quando o próprio decreto fundacional dos símbolos opta por figuras geométricas e astrais.',
        },
      },
      en: {
        shortLabel: 'Decree no. 4 · Seals & flag',
        title: 'Decree no. 4 of 19 November 1889 — National flag, arms and seals',
        creatorOrIssuer: 'Provisional Government of the Republic of the United States of Brazil',
        mediumOrNorm: 'Statutory act on non-anthropomorphic emblems & Décio Villares’s trajectory',
        repositoryOrContext: 'Early Republic · French artistic training of Décio Villares',
        analyticalFunction: 'Separates fixing an emblem’s design from regulating the legal use of a seal',
        argumentSummary:
          'Contrasts official non-anthropomorphic symbols with female allegories of the Republic, requiring separate proof for each medium.',
        keyFormulation:
          'Establishing the graphic design of the national flag, arms, and seal by decree and regulating the authenticating legal use of a seal are distinct operations.',
        bibliographicRef:
          'BRAZIL. Decree no. 4 of 19 November 1889 [specific seal-use provisions and material dating of Décio Villares’s painting A República pending check].',
        documentaryCaution:
          'Villares’s role in the 1889 flag does not suffice to date the painting A República; canvas identity and seal regulations remain under check.',
        matrixPole: {
          tag: 'FRENCH TRAINING & POSITIVISM · 1889',
          title: 'Décio Villares’s French path & republican allegory',
          summary: 'Artistic and positivist circulation between France and Rio de Janeiro around 1889.',
        },
        casePole: {
          tag: 'BRAZIL · DECREE NO. 4 (19 NOV 1889)',
          title: 'Non-anthropomorphic state emblems vs. female allegory',
          summary: 'Tests the hypothesis where official state symbols adopt non-human geometric and celestial motifs.',
        },
      },
      fr: {
        shortLabel: 'Décret n° 4 · Sceaux & drapeau',
        title: 'Décret n° 4 du 19 novembre 1889 — Drapeau, armes et sceaux nationaux',
        creatorOrIssuer: 'Gouvernement provisoire de la République des États-Unis du Brésil',
        mediumOrNorm: 'Acte normatif sur les symboles non anthropomorphes & parcours de Décio Villares',
        repositoryOrContext: 'Première République · Formation française de Décio Villares',
        analyticalFunction: 'Distinguer la fixation d’un dessin et l’usage juridique d’un sceau',
        argumentSummary:
          'Met en regard les emblèmes officiels non anthropomorphes et les allégories féminines républicaines.',
        keyFormulation:
          'Fixer le dessin du drapeau et des sceaux nationaux et discipliner l’usage juridique d’un sceau sont deux opérations distinctes.',
        bibliographicRef:
          'BRÉSIL. Décret n° 4 du 19 novembre 1889 [règles d’usage des sceaux et datation du tableau A República de Décio Villares à vérifier].',
        documentaryCaution:
          'La participation de Villares au drapeau de 1889 ne suffit pas à dater la toile A República.',
        matrixPole: {
          tag: 'FORMATION FRANÇAISE & POSITIVISME · 1889',
          title: 'Parcours français de Décio Villares',
          summary: 'Circulation artistique et positiviste entre la France et Rio de Janeiro en 1889.',
        },
        casePole: {
          tag: 'BRÉSIL · DÉCRET N° 4 (19 NOV. 1889)',
          title: 'Symboles officiels non anthropomorphes vs allégorie',
          summary: 'Éprouve l’hypothèse lorsque les sceaux officiels adoptent des motifs non anthropomorphes.',
        },
      },
      it: {
        shortLabel: 'Decreto n. 4 · Sigilli e bandiera',
        title: 'Decreto n. 4 del 19 novembre 1889 — Bandiera, stemma e sigilli nazionali',
        creatorOrIssuer: 'Governo Provvisorio della Repubblica degli Stati Uniti del Brasile',
        mediumOrNorm: 'Atto normativo sui simboli non antropomorfi & percorso di Décio Villares',
        repositoryOrContext: 'Prima Repubblica · Formazione francese di Décio Villares',
        analyticalFunction: 'Distinguere la fissazione di un disegno dalla disciplina giuridica del sigillo',
        argumentSummary:
          'Confronta emblemi ufficiali non antropomorfi e allegorie femminili della Repubblica.',
        keyFormulation:
          'Fissare il disegno di un emblema nazionale e disciplinare l’uso giuridico di un sigillo sono operazioni distinte.',
        bibliographicRef:
          'BRASILE. Decreto n. 4 del 19 novembre 1889 [norme d’uso dei sigilli e datazione della tela A República da verificare].',
        documentaryCaution:
          'La partecipazione di Villares alla bandiera del 1889 non basta a datare il dipinto A República.',
        matrixPole: {
          tag: 'FORMAZIONE FRANCESE & POSITIVISMO · 1889',
          title: 'Percorso francese di Décio Villares',
          summary: 'Circolazione artistica e positivista tra Francia e Rio de Janeiro nel 1889.',
        },
        casePole: {
          tag: 'BRASILE · DECRETO N. 4 (19 NOV. 1889)',
          title: 'Simboli non antropomorfi vs allegoria femminile',
          summary: 'Mette alla prova l’ipotesi di fronte a sigilli ufficiali privi di figura umana.',
        },
      },
      nl: {
        shortLabel: 'Decreet nr. 4 · Zegels & vlag',
        title: 'Decreet nr. 4 van 19 november 1889 — Nationale vlag, wapen en zegels',
        creatorOrIssuer: 'Voorlopige Regering van de Republiek der Verenigde Staten van Brazilië',
        mediumOrNorm: 'Besluit over niet-antropomorfe symbolen & traject van Décio Villares',
        repositoryOrContext: 'Vroege Republiek · Franse opleiding van Décio Villares',
        analyticalFunction: 'Onderscheid tussen ontwerp en juridisch zegelgebruik',
        argumentSummary:
          'plaatst niet-antropomorfe staatssymbolen naast vrouwelijke republikeinse allegorieën.',
        keyFormulation:
          'Het vaststellen van een ontwerp en het normeren van het juridisch gebruik van een zegel zijn afzonderlijke handelingen.',
        bibliographicRef:
          'BRAZILIË. Decreet nr. 4 van 19 november 1889 [zegelregels en datering van A República in controle].',
        documentaryCaution:
          'Villares’ bijdrage aan de vlag van 1889 bewijst niet de datering van het schilderij A República.',
        matrixPole: {
          tag: 'FRANSE OPLEIDING & POSITIVISME · 1889',
          title: 'Frans traject van Décio Villares',
          summary: 'Artistieke en positivistische circulatie tussen Frankrijk en Rio de Janeiro.',
        },
        casePole: {
          tag: 'BRAZILIË · DECREET NR. 4 (19 NOV. 1889)',
          title: 'Niet-antropomorfe tekens vs. vrouwelijke allegorie',
          summary: 'Toetst de hypothese aan officiële emblemen zonder menselijke gedaante.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 10,
        slideNum: '11',
        titleByLang: {
          pt: 'De volta à escada: figura e uso jurídico',
          en: 'Back to the staircase: figure and legal use',
          fr: 'Retour à l’escalier : figure et usage juridique',
          it: 'Ritorno alla scala: figura e uso giuridico',
          nl: 'Terug naar de trap: figuur en juridisch gebruik',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 3,
        slideNum: '04',
        titleByLang: {
          pt: 'Circulação França–Brasil: objetos e percursos',
          en: 'France–Brazil circulation: objects and trajectories',
          fr: 'Circulation France–Brésil : objets et parcours',
          it: 'Circolazione Francia–Brasile: oggetti e percorsi',
          nl: 'Circulatie Frankrijk–Brazilië: objecten en trajecten',
        },
      },
    ],
  },
  {
    id: 'decreto-847-1890',
    year: '11 out. 1890',
    sortYear: 1890.77,
    accessionCode: 'DOC. 1890.0847',
    axis: 'republica',
    sourceKind: 'normative',
    epistemicStatus: 'primary_verified',
    atlasEntryId: 'numismatica-1890',
    primarySourceUrl:
      'https://www2.camara.leg.br/legin/fed/decret/1824-1899/decreto-847-11-outubro-1890-503086-publicacaooriginal-1-pe.html',
    primarySourceLabel: 'Decreto nº 847, de 11 out. 1890 (Câmara dos Deputados)',
    copy: {
      pt: {
        shortLabel: 'Código Penal · Art. 239',
        title: 'Decreto nº 847, de 11 de outubro de 1890 — Código Penal, art. 239',
        creatorOrIssuer: 'Governo Provisório · Legislação Penal da Primeira República',
        mediumOrNorm: ' Crime de moeda falsa fabricada “sem autoridade legitima”',
        repositoryOrContext: 'Câmara dos Deputados · Publicação original',
        analyticalFunction: 'Virada jurídica central: equivalência material não gera autorização jurídica',
        argumentSummary:
          'Pune a fabricação não autorizada mesmo quando matéria, forma, peso e valor intrínseco correspondem aos da moeda verdadeira.',
        keyFormulation:
          '« sem autoridade legitima » — Decreto nº 847, de 11 de outubro de 1890 (Código Penal, art. 239): mesmo com idêntica matéria, forma, peso e valor intrínseco, a cópia não autorizada é ilícita.',
        bibliographicRef:
          'BRASIL. Decreto nº 847, de 11 de outubro de 1890. Promulga o Código Penal, art. 239. Câmara dos Deputados, Publicação Original.',
        documentaryCaution:
          'A insuficiência da equivalência material é demonstrada; porém o silêncio nominal sobre a efígie não autoriza concluir que a lei ignora a forma visual.',
        matrixPole: {
          tag: 'FORMA, CUNHO & EFÍGIE MONETÁRIA',
          title: 'Equivalência material e visual (matéria, forma, peso)',
          summary: 'Hipótese anterior nos rascunhos reduzia a autenticação monetária aos atributos físicos e formais do espécime.',
        },
        casePole: {
          tag: 'BRASIL · CÓDIGO PENAL DE 1890, ART. 239',
          title: 'Competência normativa (“sem autoridade legitima”)',
          summary: 'Desloca a pergunta da simples semelhança visual para os procedimentos que tornam a fabricação juridicamente autorizada.',
        },
      },
      en: {
        shortLabel: 'Penal Code · Art. 239',
        title: 'Decree no. 847 of 11 October 1890 — Penal Code, article 239',
        creatorOrIssuer: 'Provisional Government · First Republic Penal Legislation',
        mediumOrNorm: 'Offence of counterfeiting coin “sem autoridade legitima”',
        repositoryOrContext: 'Chamber of Deputies · Original publication',
        analyticalFunction: 'Core legal turn: material equivalence does not establish legal authorisation',
        argumentSummary:
          'Punishes unauthorised minting even when matter, form, weight, and intrinsic value match genuine coin.',
        keyFormulation:
          '“sem autoridade legitima” — Decree no. 847 of 11 October 1890 (Penal Code, art. 239): even with identical matter, form, weight, and intrinsic value, an unauthorised copy is unlawful.',
        bibliographicRef:
          'BRAZIL. Decree no. 847 of 11 October 1890. Penal Code, art. 239. Chamber of Deputies, Original Publication.',
        documentaryCaution:
          'Demonstrates the insufficiency of material equivalence; neither proves law ignores visual form nor yields a general theory of validity.',
        matrixPole: {
          tag: 'COINAGE FORM, DIE & EFFIGY',
          title: 'Material and visual equivalence (matter, form, weight)',
          summary: 'Earlier draft formulation treated authentication primarily through physical and formal equivalence.',
        },
        casePole: {
          tag: 'BRAZIL · 1890 PENAL CODE, ART. 239',
          title: 'Legal competence (“sem autoridade legitima”)',
          summary: 'Shifts the inquiry from visual resemblance alone to the rules and acts that authorise fabrication.',
        },
      },
      fr: {
        shortLabel: 'Code pénal · Art. 239',
        title: 'Décret n° 847 du 11 octobre 1890 — Code pénal, article 239',
        creatorOrIssuer: 'Gouvernement provisoire · Législation pénale républicaine',
        mediumOrNorm: 'Fabrication de monnaie « sem autoridade legitima »',
        repositoryOrContext: 'Chambre des députés · Publication originale',
        analyticalFunction: 'Tournant juridique : l’équivalence matérielle ne crée pas l’autorisation',
        argumentSummary:
          'Punit la fabrication non autorisée même lorsque matière, forme, poids et valeur intrinsèque correspondent à la vraie monnaie.',
        keyFormulation:
          '« sem autoridade legitima » — Décret n° 847 du 11 octobre 1890 (Code pénal, art. 239) : même matériellement identique, une copie sans autorité légitime demeure illicite.',
        bibliographicRef:
          'BRÉSIL. Décret n° 847 du 11 octobre 1890. Code pénal, art. 239. Chambre des députés.',
        documentaryCaution:
          'Démontre l’insuffisance de l’équivalence matérielle sans autoriser à conclure que la loi ignore la forme visuelle.',
        matrixPole: {
          tag: 'FORME, COIN & EFFIGIE MONÉTAIRE',
          title: 'Équivalence matérielle et formelle',
          summary: 'Une formulation antérieure rattachait l’authentification à la matière, la forme et le poids.',
        },
        casePole: {
          tag: 'BRÉSIL · CODE PÉNAL DE 1890, ART. 239',
          title: 'Autorité légitime d’émission',
          summary: 'Déplace la question vers les règles et compétences qui rendent la fabrication juridiquement autorisée.',
        },
      },
      it: {
        shortLabel: 'Codice Penale · Art. 239',
        title: 'Decreto n. 847 dell’11 ottobre 1890 — Codice penale, articolo 239',
        creatorOrIssuer: 'Governo Provvisorio · Legislazione penale della Prima Repubblica',
        mediumOrNorm: 'Fabbricazione di moneta «sem autoridade legitima»',
        repositoryOrContext: 'Camera dei Deputati · Pubblicazione originale',
        analyticalFunction: 'Svolta giuridica: l’equivalenza materiale non produce autorizzazione',
        argumentSummary:
          'Punisce la coniazione non autorizzata anche con identici materia, forma, peso e valore intrinseco.',
        keyFormulation:
          '«sem autoridade legitima» — Decreto n. 847 dell’11 ottobre 1890 (Codice penale, art. 239): anche una copia materialmente identica è illecita senza autorità legittima.',
        bibliographicRef:
          'BRASILE. Decreto n. 847 dell’11 ottobre 1890. Codice penale, art. 239. Camera dei Deputati.',
        documentaryCaution:
          'Dimostra l’insufficienza dell’equivalenza materiale, ma non prova l’irrilevanza della forma visiva.',
        matrixPole: {
          tag: 'FORMA, CONIO & EFFIGIE MONETARIA',
          title: 'Equivalenza materiale e formale',
          summary: 'La formulazione precedente legava l’autenticazione a materia, forma e peso.',
        },
        casePole: {
          tag: 'BRASILE · CODICE PENALE 1890, ART. 239',
          title: 'Competenza normativa («sem autoridade legitima»)',
          summary: 'Sposta l’indagine sulle regole che rendono giuridicamente autorizzata la fabbricazione.',
        },
      },
      nl: {
        shortLabel: 'Wetboek van Strafrecht · Art. 239',
        title: 'Decreet nr. 847 van 11 oktober 1890 — Wetboek van Strafrecht, artikel 239',
        creatorOrIssuer: 'Voorlopige Regering · Strafwetgeving Eerste Republiek',
        mediumOrNorm: 'Vervaardiging van munt “sem autoridade legitima”',
        repositoryOrContext: 'Kamer van Afgevaardigden · Oorspronkelijke uitgave',
        analyticalFunction: 'Juridisch keerpunt: materiële gelijkheid schept geen bevoegdheid',
        argumentSummary:
          'Stelt ongeautoriseerde aanmunting strafbaar ook bij identiek materiaal, vorm, gewicht en waarde.',
        keyFormulation:
          '“sem autoridade legitima” — Decreet nr. 847 van 11 oktober 1890 (art. 239): ook een materieel identieke kopie is onwettig zonder wettig gezag.',
        bibliographicRef:
          'BRAZILIË. Decreet nr. 847 van 11 oktober 1890. Wetboek van Strafrecht, art. 239.',
        documentaryCaution:
          'Bewijst het tekortschieten van materiële gelijkwaardigheid, niet dat het recht vorm negeert.',
        matrixPole: {
          tag: 'VORM, STEMPEL & MUNTBEELTENIS',
          title: 'Materiële en formele gelijkwaardigheid',
          summary: 'Eerdere schetsen verbonden authenticatie direct aan materiaal, vorm en gewicht.',
        },
        casePole: {
          tag: 'BRAZILIË · STRAFWETBOEK 1890, ART. 239',
          title: 'Wettige bevoegdheid (“sem autoridade legitima”)',
          summary: 'Verlegt de vraag naar de regels die vervaardiging juridisch geautoriseerd maken.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 9,
        slideNum: '10',
        titleByLang: {
          pt: 'Uma cópia perfeita pode ser ilícita',
          en: 'A perfect copy can be unlawful',
          fr: 'Une copie parfaite peut être illicite',
          it: 'Una copia perfetta può essere illecita',
          nl: 'Een volmaakte kopie kan onwettig zijn',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 2,
        slideNum: '03',
        titleByLang: {
          pt: 'A pergunta',
          en: 'The question',
          fr: 'La question',
          it: 'La domanda',
          nl: 'De vraag',
        },
      },
      {
        deck: 'trajeto',
        slideIndex: 9,
        slideNum: '10',
        titleByLang: {
          pt: '5. Uma cópia perfeita pode ser ilícita',
          en: '5. A perfect copy can be unlawful',
          fr: '5. Une copie parfaite peut être illicite',
          it: '5. Una copia perfetta può essere illecita',
          nl: '5. Een volmaakte kopie kan onwettig zijn',
        },
      },
      {
        deck: 'trajeto',
        slideIndex: 10,
        slideNum: '11',
        titleByLang: {
          pt: 'O que essa leitura mudou',
          en: 'What this reading changed',
          fr: 'Ce que cette lecture a changé',
          it: 'Ciò che questa lettura ha cambiato',
          nl: 'Wat deze lezing veranderde',
        },
      },
    ],
  },
  {
    id: 'decreto-1227-1890',
    year: '30 dez. 1890',
    sortYear: 1890.99,
    accessionCode: 'DOC. 1890.1227',
    axis: 'republica',
    sourceKind: 'hybrid',
    epistemicStatus: 'primary_verified',
    atlasEntryId: 'numismatica-1890',
    primarySourceUrl:
      'https://www2.camara.leg.br/legin/fed/decret/1824-1899/decreto-1227-30-dezembro-1890-522863-anexo-pe.pdf',
    primarySourceLabel: 'Decreto nº 1.227, de 30 dez. 1890 (Câmara dos Deputados)',
    copy: {
      pt: {
        shortLabel: 'Decreto nº 1.227 · Ouro francês',
        title: 'Decreto nº 1.227, de 30 de dezembro de 1890 — Estatutos anexos, art. 10',
        creatorOrIssuer: 'Governo Provisório · Estatutos Bancários & Casa da Moeda de Paris',
        mediumOrNorm: 'Admissão de moedas francesas de ouro (20 e 10 francos) no depósito metálico',
        repositoryOrContext: 'Câmara dos Deputados · Anexo integral consultado',
        analyticalFunction: 'Distinguir reserva metálica bancária, curso legal geral e tipo iconográfico',
        argumentSummary:
          'Admite moedas francesas de ouro de 20 e 10 francos no lastro de emissão e troco de notas, sem especificar os cunhos depositados.',
        keyFormulation:
          'Art. 10 dos estatutos anexos ao Decreto nº 1.227/1890: admissão de moedas francesas de ouro de 20 e 10 francos no depósito destinado à garantia da emissão e ao troco das notas.',
        bibliographicRef:
          'BRASIL. Decreto nº 1.227, de 30 de dezembro de 1890. Estatutos anexos, art. 10. Câmara dos Deputados (PDF integral consultado).',
        documentaryCaution:
          'A disposição não demonstra curso legal geral nem circulação cotidiana, e não identifica se os exemplares em cofre traziam o tipo Génie ou Marianne.',
        matrixPole: {
          tag: 'FRANÇA · OURO DE 20 E 10 FRANCOS',
          title: 'Moedas francesas de ouro (tipos Génie / Marianne)',
          summary: 'Cunhagens áureas da Casa da Moeda de Paris portadoras de iconografia constitucional e republicana francesa.',
        },
        casePole: {
          tag: 'BRASIL · DECRETO Nº 1.227/1890, ART. 10',
          title: 'Garantia metálica da emissão bancária',
          summary: 'A norma reconhece denominações estrangeiras na reserva metálica sem descrever efígies nem outorgar curso legal automático.',
        },
      },
      en: {
        shortLabel: 'Decree no. 1,227 · French gold',
        title: 'Decree no. 1,227 of 30 December 1890 — Annexed statutes, article 10',
        creatorOrIssuer: 'Provisional Government · Banking Statutes & Monnaie de Paris',
        mediumOrNorm: 'Admission of 20- and 10-franc French gold coins into metallic deposit',
        repositoryOrContext: 'Chamber of Deputies · Full annex consulted',
        analyticalFunction: 'Separates metallic bank reserve, general legal tender, and iconographic type',
        argumentSummary:
          'Admits 20- and 10-franc French gold coins as backing for banknote issuance and redemption without naming coin dies.',
        keyFormulation:
          'Article 10 of the statutes annexed to Decree no. 1,227/1890: admits 20- and 10-franc French gold coins into the metallic deposit guaranteeing note issuance and conversion.',
        bibliographicRef:
          'BRAZIL. Decree no. 1,227 of 30 December 1890. Annexed statutes, art. 10. Chamber of Deputies (full passage consulted).',
        documentaryCaution:
          'Does not establish general legal tender, actual street circulation, or whether deposited coins bore the Génie or Marianne type.',
        matrixPole: {
          tag: 'FRANCE · 20- & 10-FRANC GOLD COINAGE',
          title: 'French gold coins (Génie / Marianne types)',
          summary: 'Paris Mint gold denominations carrying French constitutional and republican iconography.',
        },
        casePole: {
          tag: 'BRAZIL · DECREE NO. 1,227/1890, ART. 10',
          title: 'Metallic reserve backing banknote issuance',
          summary: 'Admits specified denominations into bank vaults without identifying effigies or conferring general legal tender.',
        },
      },
      fr: {
        shortLabel: 'Décret n° 1.227 · Or français',
        title: 'Décret n° 1.227 du 30 décembre 1890 — Statuts annexés, article 10',
        creatorOrIssuer: 'Gouvernement provisoire · Statuts bancaires & Monnaie de Paris',
        mediumOrNorm: 'Admission des pièces d’or françaises (20 et 10 francs) au dépôt métallique',
        repositoryOrContext: 'Chambre des députés · Annexe intégrale consultée',
        analyticalFunction: 'Distinguer réserve métallique, cours légal général et type iconographique',
        argumentSummary:
          'Admet les pièces d’or françaises de 20 et 10 francs dans le dépôt garantissant l’émission bancaire.',
        keyFormulation:
          'Art. 10 des statuts annexés au Décret n° 1.227/1890 : admission des monnaies d’or françaises de 20 et 10 francs dans le dépôt destiné à la garantie de l’émission.',
        bibliographicRef:
          'BRÉSIL. Décret n° 1.227 du 30 décembre 1890. Statuts annexés, art. 10. Chambre des députés.',
        documentaryCaution:
          'N’établit ni le cours légal général ni le type iconographique (Génie ou Marianne) des exemplaires déposés.',
        matrixPole: {
          tag: 'FRANCE · PIÈCES D’OR DE 20 ET 10 FRANCS',
          title: 'Monnaies d’or françaises (types Génie / Marianne)',
          summary: 'Frappes de la Monnaie de Paris portant l’iconographie constitutionnelle et républicaine.',
        },
        casePole: {
          tag: 'BRÉSIL · DÉCRET N° 1.227/1890, ART. 10',
          title: 'Réserve métallique d’émission bancaire',
          summary: 'La norme vise les dénominations admises en garantie sans identifier les effigies déposées.',
        },
      },
      it: {
        shortLabel: 'Decreto n. 1.227 · Oro francese',
        title: 'Decreto n. 1.227 del 30 dicembre 1890 — Statuti allegati, articolo 10',
        creatorOrIssuer: 'Governo Provvisorio · Statuti bancari & Monnaie de Paris',
        mediumOrNorm: 'Ammissione di monete d’oro francesi (20 e 10 franchi) nel deposito metallico',
        repositoryOrContext: 'Camera dei Deputati · Allegato integrale consultato',
        analyticalFunction: 'Distinguere riserva metallica, corso legale e tipo iconografico',
        argumentSummary:
          'Ammette monete d’oro francesi da 20 e 10 franchi a garanzia dell’emissione bancaria.',
        keyFormulation:
          'Art. 10 degli statuti allegati al Decreto n. 1.227/1890: ammissione di monete d’oro francesi da 20 e 10 franchi nel deposito di garanzia.',
        bibliographicRef:
          'BRASILE. Decreto n. 1.227 del 30 dicembre 1890. Statuti allegati, art. 10. Camera dei Deputati.',
        documentaryCaution:
          'Non dimostra il corso legale generale né il tipo iconografico degli esemplari depositati.',
        matrixPole: {
          tag: 'FRANCIA · MONETE D’ORO DA 20 E 10 FRANCHI',
          title: 'Coniazioni auree francesi (Génie / Marianne)',
          summary: 'Esemplari della Monnaie de Paris con iconografia costituzionale e repubblicana.',
        },
        casePole: {
          tag: 'BRASILE · DECRETO N. 1.227/1890, ART. 10',
          title: 'Riserva metallica per l’emissione bancaria',
          summary: 'Riconosce le denominazioni nel deposito senza specificare i coni né attribuire corso legale.',
        },
      },
      nl: {
        shortLabel: 'Decreet nr. 1.227 · Frans goud',
        title: 'Decreet nr. 1.227 van 30 december 1890 — Bijgevoegde statuten, artikel 10',
        creatorOrIssuer: 'Voorlopige Regering · Bankstatuten & Monnaie de Paris',
        mediumOrNorm: 'Toelating van Franse gouden munten (20 en 10 frank) tot het metaaldepot',
        repositoryOrContext: 'Kamer van Afgevaardigden · Volledige bijlage geraadpleegd',
        analyticalFunction: 'Onderscheid tussen metaalreserve, wettig betaalmiddel en beeldenaar',
        argumentSummary:
          'Laat Franse gouden munten van 20 en 10 frank toe als dekking voor bankbiljettenuitgifte.',
        keyFormulation:
          'Art. 10 van de statuten bij Decreet nr. 1.227/1890: toelating van Franse gouden munten van 20 en 10 frank tot het garantiedepot.',
        bibliographicRef:
          'BRAZILIË. Decreet nr. 1.227 van 30 december 1890. Bijgevoegde statuten, art. 10.',
        documentaryCaution:
          'Bewijst geen algemeen wettig betaalmiddel of welk munttype (Génie of Marianne) feitelijk gedeponeerd werd.',
        matrixPole: {
          tag: 'FRANKRIJK · GOUDEN 20 EN 10 FRANK',
          title: 'Franse gouden munten (Génie / Marianne)',
          summary: 'Goudmunten van de Monnaie de Paris met Franse constitutionele en republikeinse iconografie.',
        },
        casePole: {
          tag: 'BRAZILIË · DECREET NR. 1.227/1890, ART. 10',
          title: 'Metaalreserve voor bankbiljettenuitgifte',
          summary: 'Laat denominaties toe in het bankdepot zonder beeldenaar te noemen of wettig betaalmiddel te verlenen.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 8,
        slideNum: '09',
        titleByLang: {
          pt: 'Dezembro de 1890: ouro e emissão',
          en: 'December 1890: gold and issuance',
          fr: 'Décembre 1890 : or et émission',
          it: 'Dicembre 1890: oro ed emissione',
          nl: 'December 1890: goud en uitgifte',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 3,
        slideNum: '04',
        titleByLang: {
          pt: 'Circulação França–Brasil: objetos e percursos',
          en: 'France–Brazil circulation: objects and trajectories',
          fr: 'Circulation France–Brésil : objets et parcours',
          it: 'Circolazione Francia–Brasile: oggetti e percorsi',
          nl: 'Circulatie Frankrijk–Brazilië: objecten en trajecten',
        },
      },
    ],
  },
  {
    id: 'mhsc-1906',
    year: 'c. 1906',
    sortYear: 1906,
    accessionCode: 'CAT. 1906.MHSC',
    axis: 'republica',
    sourceKind: 'hybrid',
    epistemicStatus: 'locator_pending',
    atlasEntryId: 'busto-palacio-1906',
    copy: {
      pt: {
        shortLabel: 'MHSC & 1.000 réis · c. 1906',
        title: 'Busto Marianne–République (Palácio Cruz e Sousa) & Moeda de 1.000 réis (1906)',
        creatorOrIssuer: 'Fundição Val d’Osne (atrib.) · Casa da Moeda do Rio de Janeiro',
        mediumOrNorm: 'Ferro fundido patinado em hall palaciano & moeda republicana de prata',
        repositoryOrContext: 'MHSC (Florianópolis) · Cotas fotográficas IHG-FOT-2460 / IHG-FOT-2579',
        analyticalFunction: 'Separar atribuição de fabrico industrial de rota de aquisição e uso jurídico',
        argumentSummary:
          'Confronta o busto palaciano em Florianópolis e a efígie da República na moeda de 1.000 réis de 1906, demarcando a renúncia à frase sobre “compra de catálogo” sem fonte.',
        keyFormulation:
          'O catálogo do MHSC atribui Marianne–République à Val d’Osne (Makowiecky et al., 2023, p. 195), mas atribuir fabricação não estabelece comprador, data nem rota de aquisição.',
        bibliographicRef:
          'MAKOWIECKY, Sandra et al. Acervos & coleções: MHSC, Palácio Cruz e Sousa, 2023, p. 195 · Fotografias IHGSC (IHG-FOT-2460 vs. IHG-FOT-2579) · Moeda de 1.000 réis (1906).',
        documentaryCaution:
          'Fixar se IHG-FOT-2460 e IHG-FOT-2579 designam imagens distintas; exemplos posteriores (Código Civil de 1916/1917 e sufrágio de 1932) não descrevem automaticamente 1906.',
        matrixPole: {
          tag: 'FRANÇA · FUNDIÇÃO VAL D’OSNE',
          title: 'Modelo industrial francês Marianne–République',
          summary: 'Fundição artística francesa cujos repertórios alegóricos circularam internacionalmente em ferro fundido.',
        },
        casePole: {
          tag: 'FLORIANÓPOLIS & MOEDA · C. 1906',
          title: 'Escadaria do Palácio Cruz e Sousa & 1.000 réis',
          summary: 'Articula presença alegórica palaciana e cunhagem federal, exigindo prova documental própria sobre encomenda e recepção.',
        },
      },
      en: {
        shortLabel: 'MHSC & 1,000 réis · c. 1906',
        title: 'Marianne–République Bust (Palácio Cruz e Sousa) & 1,000-réis Coin (1906)',
        creatorOrIssuer: 'Val d’Osne Foundry (attrib.) · Casa da Moeda do Rio de Janeiro',
        mediumOrNorm: 'Cast-iron palace bust & silver republican coinage',
        repositoryOrContext: 'MHSC (Florianópolis) · Photo call numbers IHG-FOT-2460 / IHG-FOT-2579',
        analyticalFunction: 'Separates industrial foundry attribution from acquisition route and legal use',
        argumentSummary:
          'Pairs the Florianópolis palace bust with the 1906 1,000-réis effigy, explaining why the unverified “bought from a Paris catalogue” claim was abandoned.',
        keyFormulation:
          'The MHSC catalogue attributes Marianne–République to Val d’Osne (Makowiecky et al., 2023, p. 195), yet foundry attribution does not establish buyer, date, or acquisition route.',
        bibliographicRef:
          'MAKOWIECKY, Sandra et al. Acervos & coleções: MHSC, Palácio Cruz e Sousa, 2023, p. 195 · IHGSC Photos (IHG-FOT-2460 vs. IHG-FOT-2579) · 1,000-réis coin (1906).',
        documentaryCaution:
          'Verify whether IHG-FOT-2460 and IHG-FOT-2579 designate distinct photographs; later milestones (1916 Civil Code, 1932 suffrage) cannot be projected backward onto 1906.',
        matrixPole: {
          tag: 'FRANCE · VAL D’OSNE FOUNDRY',
          title: 'French industrial cast-iron Marianne–République',
          summary: 'French ornamental foundry model circulating transnationally at the turn of the twentieth century.',
        },
        casePole: {
          tag: 'FLORIANÓPOLIS & COINAGE · C. 1906',
          title: 'Palácio Cruz e Sousa staircase & 1,000-réis effigy',
          summary: 'Juxtaposes state palace display and federal coinage while demanding archival proof of purchase and institutional use.',
        },
      },
      fr: {
        shortLabel: 'MHSC & 1.000 réis · v. 1906',
        title: 'Buste Marianne–République (Palácio Cruz e Sousa) & Pièce de 1.000 réis (1906)',
        creatorOrIssuer: 'Fonderie du Val d’Osne (attr.) · Monnaie de Rio de Janeiro',
        mediumOrNorm: 'Fonte patinée dans le hall du palais & monnaie républicaine en argent',
        repositoryOrContext: 'MHSC (Florianópolis) · Cotes IHG-FOT-2460 / IHG-FOT-2579',
        analyticalFunction: 'Séparer l’attribution de fonderie de la preuve d’achat et de l’usage juridique',
        argumentSummary:
          'Met en regard le buste du palais à Florianópolis et la pièce de 1.000 réis de 1906, en écartant toute route d’achat présumée sans source.',
        keyFormulation:
          'Le catalogue du MHSC attribue Marianne–République au Val d’Osne (Makowiecky et al., 2023, p. 195), mais attribuer la fabrication n’établit ni l’acheteur ni la date d’acquisition.',
        bibliographicRef:
          'MAKOWIECKY, Sandra et al. Acervos & coleções: MHSC, Palácio Cruz e Sousa, 2023, p. 195 · Photographies IHGSC · Pièce de 1.000 réis (1906).',
        documentaryCaution:
          'Vérifier l’identité entre IHG-FOT-2460 et IHG-FOT-2579 ; le Code civil de 1916 et le suffrage de 1932 ne décrivent pas automatiquement 1906.',
        matrixPole: {
          tag: 'FRANCE · FONDERIE DU VAL D’OSNE',
          title: 'Modèle industriel français Marianne–République',
          summary: 'Fonderie d’art française dont les fontes allégoriques ont circulé à l’échelle transnationale.',
        },
        casePole: {
          tag: 'FLORIANÓPOLIS & MONNAIE · V. 1906',
          title: 'Escalier du Palácio Cruz e Sousa & 1.000 réis',
          summary: 'Croise figure palatiale et effigie monétaire tout en exigeant une documentation propre sur l’acquisition.',
        },
      },
      it: {
        shortLabel: 'MHSC & 1.000 réis · c. 1906',
        title: 'Busto Marianne–République (Palácio Cruz e Sousa) & Moneta da 1.000 réis (1906)',
        creatorOrIssuer: 'Fonderia Val d’Osne (attr.) · Zecca di Rio de Janeiro',
        mediumOrNorm: 'Ghisa patinata nello scalone del palazzo & moneta repubblicana',
        repositoryOrContext: 'MHSC (Florianópolis) · Segnature IHG-FOT-2460 / IHG-FOT-2579',
        analyticalFunction: 'Separare attribuzione di fabbrica da prova d’acquisto e uso giuridico',
        argumentSummary:
          'Confronta il busto a Florianópolis con l’effigie sulla moneta da 1.000 réis del 1906.',
        keyFormulation:
          'Il catalogo del MHSC attribuisce Marianne–République a Val d’Osne (Makowiecky et al., 2023, p. 195), ma l’attribuzione non stabilisce acquirente né data.',
        bibliographicRef:
          'MAKOWIECKY, Sandra et al. Acervos & coleções: MHSC, Palácio Cruz e Sousa, 2023, p. 195 · Fotografie IHGSC · Moneta da 1.000 réis (1906).',
        documentaryCaution:
          'Verificare IHG-FOT-2460 vs. IHG-FOT-2579; Codice civile del 1916 e suffragio del 1932 sono esempi successivi.',
        matrixPole: {
          tag: 'FRANCIA · FONDERIA VAL D’OSNE',
          title: 'Modello industriale francese Marianne–République',
          summary: 'Fonderia artistica francese diffusa nei palazzi pubblici tra Otto e Novecento.',
        },
        casePole: {
          tag: 'FLORIANÓPOLIS & MONETA · C. 1906',
          title: 'Scalone del Palácio Cruz e Sousa & 1.000 réis',
          summary: 'Accosta allegoria palaziale e coniazione federale richiedendo prove documentali sull’acquisto.',
        },
      },
      nl: {
        shortLabel: 'MHSC & 1.000 réis · ca. 1906',
        title: 'Buste Marianne–République (Palácio Cruz e Sousa) & Munt van 1.000 réis (1906)',
        creatorOrIssuer: 'Gieterij Val d’Osne (toeschr.) · Munt van Rio de Janeiro',
        mediumOrNorm: 'Gepatineerd gietijzeren paleisbuste & zilveren munt',
        repositoryOrContext: 'MHSC (Florianópolis) · Fotocodes IHG-FOT-2460 / IHG-FOT-2579',
        analyticalFunction: 'Toeschrijving van fabricage scheiden van verwervingsroute en juridisch gebruik',
        argumentSummary:
          'Vergelijkt het borstbeeld in Florianópolis met de munt van 1.000 réis uit 1906.',
        keyFormulation:
          'De MHSC-catalogus schrijft Marianne–République toe aan Val d’Osne (Makowiecky et al., 2023, p. 195), maar dat bewijst koper noch aankooproute.',
        bibliographicRef:
          'MAKOWIECKY, Sandra et al. Acervos & coleções: MHSC, Palácio Cruz e Sousa, 2023, p. 195 · IHGSC-foto’s · Munt van 1.000 réis (1906).',
        documentaryCaution:
          'Controleer IHG-FOT-2460 tegenover IHG-FOT-2579; latere mijlpalen (1916, 1932) beschrijven niet automatisch 1906.',
        matrixPole: {
          tag: 'FRANKRIJK · GIETERIJ VAL D’OSNE',
          title: 'Frans gietijzeren model Marianne–République',
          summary: 'Franse kunstgieterij waarvan allegorische modellen transnationaal circuleerden.',
        },
        casePole: {
          tag: 'FLORIANÓPOLIS & MUNTWEZEN · CA. 1906',
          title: 'Trap van Palácio Cruz e Sousa & 1.000 réis',
          summary: 'Verbindt paleisopstelling en federale muntslag met strikte eis van archiefbewijs.',
        },
      },
    },
    citedInSlides: [
      {
        deck: 'representacao',
        slideIndex: 1,
        slideNum: '02',
        titleByLang: {
          pt: 'Uma francesa ao pé da escada',
          en: 'A Frenchwoman at the foot of the stairs',
          fr: 'Une Française au pied de l’escalier',
          it: 'Una francese ai piedi della scala',
          nl: 'Een Française onder aan de trap',
        },
      },
      {
        deck: 'representacao',
        slideIndex: 10,
        slideNum: '11',
        titleByLang: {
          pt: 'De volta à escada: figura e uso jurídico',
          en: 'Back to the staircase: figure and legal use',
          fr: 'Retour à l’escalier : figure et usage juridique',
          it: 'Ritorno alla scala: figura e uso giuridico',
          nl: 'Terug naar de trap: figuur en juridisch gebruik',
        },
      },
      {
        deck: 'trajeto',
        slideIndex: 8,
        slideNum: '09',
        titleByLang: {
          pt: '4. A frase que dizia mais do que a fonte',
          en: '4. The sentence that said more than its source',
          fr: '4. La phrase qui disait plus que sa source',
          it: '4. La frase che diceva più della fonte',
          nl: '4. De zin die meer zei dan de bron',
        },
      },
    ],
  },
];

export function formatTimelineCitationNote(milestone: TimelineMilestone, lang: LangCode): string {
  const c = milestone.copy[lang] || milestone.copy.pt;
  const ui = TIMELINE_UI[lang] || TIMELINE_UI.pt;
  const slidesLine = milestone.citedInSlides
    .map((s) => `${ui.deckNames[s.deck]} · Slide ${s.slideNum} (${s.titleByLang[lang] || s.titleByLang.pt})`)
    .join('; ');

  return [
    `${milestone.year} · ${milestone.accessionCode} — ${c.title}`,
    `${c.matrixPole.tag}: ${c.matrixPole.title} — ${c.matrixPole.summary}`,
    `${c.casePole.tag}: ${c.casePole.title} — ${c.casePole.summary}`,
    `« ${c.keyFormulation} »`,
    `${ui.bibliographicRefLabel} ${c.bibliographicRef}`,
    `${ui.qualificationLabel} ${c.documentaryCaution}`,
    `ICONOCRACIA (${slidesLine})`,
  ].join('\n\n');
}
