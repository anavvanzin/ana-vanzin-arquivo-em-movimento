import { LangCode } from '../types';

export interface PortalLocaleStrings {
  railTitle: string;
  brandSubtitle: string;
  heroTitleAccent: string;
  navPresentations: string;
  navAtlas: string;
  navTranslations: string;
  navSources: string;
  navDrive: string;
  presenterCta: string;
  backToReaderCta: string;
  langBarLabel: string;
  connectDriveLabel: string;
  driveConnectedFallback: string;
  footerStudio: string;
  footerStamp: string;

  // HomePortal Lead-In Gateway for DOC. 01 ("Entre representação e autenticação")
  leadKicker: string;
  leadScopeBadge: string;
  leadSummary: string;
  leadEditionsLabel: string;
  leadPresentPrimary: string;
  leadOpenSlides: string;
  leadQuickPresenterHint: string;

  // HomePortal Archive Cards & Atlas Preview
  presentBtn: string;
  openDocBtn: string;
  slidesCountLabel: (n: number) => string;
  atlasKicker: string;
  atlasHeading: string;
  compareBrantRipa: string;
  viewFullCatalog: string;
  lightTableBadge: string;

  // SlideReader Chrome
  deck01Short: string;
  deck02Short: string;
  translationReviewed: string;
  reviewPending: string;
  authorialEditActive: string;
  platesHeading: (n: number) => string;
  compareBtn: string;
  loupeBadge: string;
  reviewSlideBtn: string;
  presenterShortBtn: string;
  shortcutsSuffix: (hasAtlas: boolean) => string;

  // PresenterStage Chrome
  stageModeTitle: string;
  overTimeWarning: string;
  exitStageBtn: string;
  projectPlateBtn: (n: number) => string;
  stageKeyHint: string;
  nextSlideHeading: string;
  lastSlideSummary: string;
  speakerNotesLabel: (slideNum: string) => string;
  autosavedBadge: string;
  speakerNotesPlaceholder: string;
}

export const PORTAL_COPY: Record<LangCode, PortalLocaleStrings> = {
  pt: {
    railTitle: 'HISTÓRIA DO DIREITO — UFSC — 2026',
    brandSubtitle: 'MENDES — ARQUIVO EM MOVIMENTO',
    heroTitleAccent: 'Movimento',
    navPresentations: 'Apresentações',
    navAtlas: 'Atlas',
    navTranslations: 'Traduções',
    navSources: 'Fontes & Glossário',
    navDrive: 'Google Drive',
    presenterCta: 'Modo Apresentador',
    backToReaderCta: 'Voltar ao Leitor',
    langBarLabel: 'Idioma:',
    connectDriveLabel: 'Conectar Google Drive',
    driveConnectedFallback: 'conectado',
    footerStudio: 'Estúdio',
    footerStamp: 'ARQUIVO EM MOVIMENTO',

    leadKicker: 'COMUNICAÇÃO DE ABERTURA · [ DOC. 01 ] · SABERES FRANÇA–BRASIL',
    leadScopeBadge: '13 SLIDES · PT · EN · FR',
    leadSummary:
      'Alegoria feminina e autoridade jurídica na circulação França–Brasil (1822–1906). Edição completa sincronizada em português, inglês e francês para apresentação oral e leitura documental.',
    leadEditionsLabel: 'Iniciar ou alternar idioma:',
    leadPresentPrimary: 'Apresentar [ DOC. 01 ]',
    leadOpenSlides: 'Abrir 13 slides',
    leadQuickPresenterHint: 'Pronta em Português, English e Français',

    presentBtn: 'Apresentar',
    openDocBtn: 'Abrir Documento',
    slidesCountLabel: (n) => `${n} slides`,
    atlasKicker: 'GABINETE DE ESTUDO · 1494–1906',
    atlasHeading: 'Atlas iconográfico & inspeção ampliada',
    compareBrantRipa: 'Cotejar Brant (1494) e Ripa (1603)',
    viewFullCatalog: 'Ver catálogo completo',
    lightTableBadge: 'Mesa de luz',

    deck01Short: '01. Comunicação (13)',
    deck02Short: '02. Percurso (14)',
    translationReviewed: 'Tradução revisada',
    reviewPending: 'Revisão pendente',
    authorialEditActive: 'Edição autoral ativa',
    platesHeading: (n) => `Pranchas (${n})`,
    compareBtn: 'Comparar',
    loupeBadge: 'Lupa (Z)',
    reviewSlideBtn: 'Revisar slide',
    presenterShortBtn: 'Apresentador',
    shortcutsSuffix: (hasAtlas) => `P apresentador · T sumário${hasAtlas ? ' · Z lupa' : ''}`,

    stageModeTitle: 'MODO APRESENTADOR',
    overTimeWarning: '(tempo excedido)',
    exitStageBtn: 'Sair do palco',
    projectPlateBtn: (n) => `Projetar prancha (${n}) · tecla Z`,
    stageKeyHint: 'Espaço ou → avança · ← recua',
    nextSlideHeading: 'PRÓXIMO SLIDE',
    lastSlideSummary: 'Último slide desta apresentação — encerramento e abertura para debate.',
    speakerNotesLabel: (s) => `Notas de condução oral (Slide ${s})`,
    autosavedBadge: 'Salvo automaticamente',
    speakerNotesPlaceholder:
      'Escreva lembretes de fala, ênfases conceituais, tempo estimado ou referências para o debate...',
  },

  en: {
    railTitle: 'LEGAL HISTORY — UFSC — 2026',
    brandSubtitle: 'MENDES — ARCHIVE IN MOTION',
    heroTitleAccent: 'In Motion',
    navPresentations: 'Presentations',
    navAtlas: 'Atlas',
    navTranslations: 'Translations',
    navSources: 'Sources & Glossary',
    navDrive: 'Google Drive',
    presenterCta: 'Presenter Mode',
    backToReaderCta: 'Back to Reader',
    langBarLabel: 'Language:',
    connectDriveLabel: 'Connect Google Drive',
    driveConnectedFallback: 'connected',
    footerStudio: 'Studio',
    footerStamp: 'ARCHIVE IN MOTION',

    leadKicker: 'OPENING PAPER · [ DOC. 01 ] · SABERES FRANÇA–BRASIL',
    leadScopeBadge: '13 SLIDES · PT · EN · FR',
    leadSummary:
      'Female allegory and legal authority in France–Brazil circulation (1822–1906). All 13 slides are prepared in English, French and Portuguese for live presentation and source verification.',
    leadEditionsLabel: 'Select presentation language:',
    leadPresentPrimary: 'Present [ DOC. 01 ]',
    leadOpenSlides: 'Open 13 slides',
    leadQuickPresenterHint: 'Complete deck in English, Français & Português',

    presentBtn: 'Present',
    openDocBtn: 'Open Document',
    slidesCountLabel: (n) => `${n} slides`,
    atlasKicker: 'STUDY CABINET · 1494–1906',
    atlasHeading: 'Iconographic atlas & close inspection',
    compareBrantRipa: 'Compare Brant (1494) & Ripa (1603)',
    viewFullCatalog: 'View full catalogue',
    lightTableBadge: 'Light table',

    deck01Short: '01. Paper (13)',
    deck02Short: '02. Trajectory (14)',
    translationReviewed: 'Translation reviewed',
    reviewPending: 'Review pending',
    authorialEditActive: 'Authorial edit active',
    platesHeading: (n) => `Study plates (${n})`,
    compareBtn: 'Compare',
    loupeBadge: 'Loupe (Z)',
    reviewSlideBtn: 'Review slide',
    presenterShortBtn: 'Presenter',
    shortcutsSuffix: (hasAtlas) => `P presenter · T contents${hasAtlas ? ' · Z loupe' : ''}`,

    stageModeTitle: 'PRESENTER STAGE',
    overTimeWarning: '(over time)',
    exitStageBtn: 'Exit stage',
    projectPlateBtn: (n) => `Project plate (${n}) · Z key`,
    stageKeyHint: 'Space or → next · ← previous',
    nextSlideHeading: 'NEXT SLIDE',
    lastSlideSummary: 'Final slide of this presentation — conclusion and open discussion.',
    speakerNotesLabel: (s) => `Speaker notes (Slide ${s})`,
    autosavedBadge: 'Saved automatically',
    speakerNotesPlaceholder:
      'Write speaking cues, conceptual emphases, pacing targets or source locators for Q&A...',
  },

  fr: {
    railTitle: 'HISTOIRE DU DROIT — UFSC — 2026',
    brandSubtitle: 'MENDES — ARCHIVES EN MOUVEMENT',
    heroTitleAccent: 'Mouvement',
    navPresentations: 'Présentations',
    navAtlas: 'Atlas',
    navTranslations: 'Traductions',
    navSources: 'Sources & Glossaire',
    navDrive: 'Google Drive',
    presenterCta: 'Mode Présentateur',
    backToReaderCta: 'Retour au Lecteur',
    langBarLabel: 'Langue :',
    connectDriveLabel: 'Connecter Google Drive',
    driveConnectedFallback: 'connecté',
    footerStudio: 'Atelier',
    footerStamp: 'ARCHIVES EN MOUVEMENT',

    leadKicker: 'COMMUNICATION D’OUVERTURE · [ DOC. 01 ] · SABERES FRANÇA–BRASIL',
    leadScopeBadge: '13 DIAPOSITIVES · PT · EN · FR',
    leadSummary:
      'Allégorie féminine et autorité juridique dans la circulation France–Brésil (1822–1906). Les 13 diapositives sont intégralement établies en français, anglais et portugais.',
    leadEditionsLabel: 'Choisir la langue de présentation :',
    leadPresentPrimary: 'Présenter [ DOC. 01 ]',
    leadOpenSlides: 'Ouvrir les 13 diapositives',
    leadQuickPresenterHint: 'Texte intégral en Français, English et Português',

    presentBtn: 'Présenter',
    openDocBtn: 'Ouvrir le Document',
    slidesCountLabel: (n) => `${n} diapositives`,
    atlasKicker: 'CABINET D’ÉTUDE · 1494–1906',
    atlasHeading: 'Atlas iconographique & inspection rapprochée',
    compareBrantRipa: 'Confronter Brant (1494) et Ripa (1603)',
    viewFullCatalog: 'Voir le catalogue complet',
    lightTableBadge: 'Table lumineuse',

    deck01Short: '01. Communication (13)',
    deck02Short: '02. Parcours (14)',
    translationReviewed: 'Traduction relue',
    reviewPending: 'Relecture en attente',
    authorialEditActive: 'Édition d’autrice active',
    platesHeading: (n) => `Planches (${n})`,
    compareBtn: 'Comparer',
    loupeBadge: 'Loupe (Z)',
    reviewSlideBtn: 'Réviser la diapo',
    presenterShortBtn: 'Présentateur',
    shortcutsSuffix: (hasAtlas) => `P présentateur · T sommaire${hasAtlas ? ' · Z loupe' : ''}`,

    stageModeTitle: 'MODE PRÉSENTATEUR',
    overTimeWarning: '(temps dépassé)',
    exitStageBtn: 'Quitter la scène',
    projectPlateBtn: (n) => `Projeter la planche (${n}) · touche Z`,
    stageKeyHint: 'Espace ou → suivant · ← précédent',
    nextSlideHeading: 'DIAPOSITIVE SUIVANTE',
    lastSlideSummary: 'Dernière diapositive de cette communication — conclusion et discussion.',
    speakerNotesLabel: (s) => `Notes d’intervention orale (Diapo ${s})`,
    autosavedBadge: 'Enregistré automatiquement',
    speakerNotesPlaceholder:
      'Notez vos repères oraux, distinctions conceptuelles, temps de parole ou références pour le débat...',
  },

  it: {
    railTitle: 'STORIA DEL DIRITTO — UFSC — 2026',
    brandSubtitle: 'MENDES — ARCHIVIO IN MOVIMENTO',
    heroTitleAccent: 'Movimento',
    navPresentations: 'Presentazioni',
    navAtlas: 'Atlante',
    navTranslations: 'Traduzioni',
    navSources: 'Fonti & Glossario',
    navDrive: 'Google Drive',
    presenterCta: 'Modalità Relatrice',
    backToReaderCta: 'Torna al Lettore',
    langBarLabel: 'Lingua:',
    connectDriveLabel: 'Connetti Google Drive',
    driveConnectedFallback: 'connesso',
    footerStudio: 'Studio',
    footerStamp: 'ARCHIVIO IN MOVIMENTO',

    leadKicker: 'COMUNICAZIONE D’APERTURA · [ DOC. 01 ] · SABERES FRANÇA–BRASIL',
    leadScopeBadge: '13 DIAPOSITIVE · PT · EN · FR',
    leadSummary:
      'Allegoria femminile e autorità giuridica nella circolazione Francia–Brasile (1822–1906). Edizione sincronizzata in portoghese, inglese, francese, italiano e neerlandese.',
    leadEditionsLabel: 'Seleziona lingua di presentazione:',
    leadPresentPrimary: 'Presenta [ DOC. 01 ]',
    leadOpenSlides: 'Apri 13 diapositive',
    leadQuickPresenterHint: 'Disponibile in PT, EN, FR, IT e NL',

    presentBtn: 'Presenta',
    openDocBtn: 'Apri Documento',
    slidesCountLabel: (n) => `${n} diapositive`,
    atlasKicker: 'GABINETTO DI STUDIO · 1494–1906',
    atlasHeading: 'Atlante iconografico & ispezione ravvicinata',
    compareBrantRipa: 'Confronta Brant (1494) e Ripa (1603)',
    viewFullCatalog: 'Vedi catalogo completo',
    lightTableBadge: 'Tavolo luminoso',

    deck01Short: '01. Comunicazione (13)',
    deck02Short: '02. Percorso (14)',
    translationReviewed: 'Traduzione rivista',
    reviewPending: 'Revisione in attesa',
    authorialEditActive: 'Modifica autoriale attiva',
    platesHeading: (n) => `Tavole (${n})`,
    compareBtn: 'Confronta',
    loupeBadge: 'Lente (Z)',
    reviewSlideBtn: 'Rivedi diapositiva',
    presenterShortBtn: 'Relatrice',
    shortcutsSuffix: (hasAtlas) => `P relatrice · T indice${hasAtlas ? ' · Z lente' : ''}`,

    stageModeTitle: 'MODALITÀ RELATRICE',
    overTimeWarning: '(tempo superato)',
    exitStageBtn: 'Esci dal palco',
    projectPlateBtn: (n) => `Proietta tavola (${n}) · tasto Z`,
    stageKeyHint: 'Spazio o → avanti · ← indietro',
    nextSlideHeading: 'PROSSIMA DIAPOSITIVA',
    lastSlideSummary: 'Ultima diapositiva della presentazione — conclusione e discussione.',
    speakerNotesLabel: (s) => `Note per l’esposizione orale (Diapo ${s})`,
    autosavedBadge: 'Salvato automaticamente',
    speakerNotesPlaceholder:
      'Annota spunti orali, distinzioni concettuali, tempi o riferimenti per la discussione...',
  },

  nl: {
    railTitle: 'RECHTSGESCHIEDENIS — UFSC — 2026',
    brandSubtitle: 'MENDES — ARCHIEF IN BEWEGING',
    heroTitleAccent: 'Beweging',
    navPresentations: 'Presentaties',
    navAtlas: 'Atlas',
    navTranslations: 'Vertalingen',
    navSources: 'Bronnen & Begrippen',
    navDrive: 'Google Drive',
    presenterCta: 'Sprekersmodus',
    backToReaderCta: 'Terug naar Lezer',
    langBarLabel: 'Taal:',
    connectDriveLabel: 'Google Drive koppelen',
    driveConnectedFallback: 'gekoppeld',
    footerStudio: 'Studio',
    footerStamp: 'ARCHIEF IN BEWEGING',

    leadKicker: 'OPENINGSVOORDRACHT · [ DOC. 01 ] · SABERES FRANÇA–BRASIL',
    leadScopeBadge: '13 DIA’S · PT · EN · FR',
    leadSummary:
      'Vrouwelijke allegorie en juridisch gezag in de circulatie tussen Frankrijk en Brazilië (1822–1906). Volledige reeks van 13 dia’s beschikbaar in PT, EN, FR, IT en NL.',
    leadEditionsLabel: 'Kies presentatietaal:',
    leadPresentPrimary: 'Presenteer [ DOC. 01 ]',
    leadOpenSlides: 'Open 13 dia’s',
    leadQuickPresenterHint: 'Volledig beschikbaar in PT, EN, FR, IT en NL',

    presentBtn: 'Presenteer',
    openDocBtn: 'Document Openen',
    slidesCountLabel: (n) => `${n} dia’s`,
    atlasKicker: 'STUDIEKABINET · 1494–1906',
    atlasHeading: 'Iconografische atlas & detailinspectie',
    compareBrantRipa: 'Vergelijk Brant (1494) & Ripa (1603)',
    viewFullCatalog: 'Volledige catalogus bekijken',
    lightTableBadge: 'Lichttafel',

    deck01Short: '01. Voordracht (13)',
    deck02Short: '02. Traject (14)',
    translationReviewed: 'Vertaling gecontroleerd',
    reviewPending: 'Controle openstaand',
    authorialEditActive: 'Auteursbewerking actief',
    platesHeading: (n) => `Studieplaten (${n})`,
    compareBtn: 'Vergelijk',
    loupeBadge: 'Loep (Z)',
    reviewSlideBtn: 'Dia nakijken',
    presenterShortBtn: 'Spreker',
    shortcutsSuffix: (hasAtlas) => `P spreker · T inhoud${hasAtlas ? ' · Z loep' : ''}`,

    stageModeTitle: 'SPREKERSMODUS',
    overTimeWarning: '(tijd overschreden)',
    exitStageBtn: 'Podium verlaten',
    projectPlateBtn: (n) => `Projecteer plaat (${n}) · toets Z`,
    stageKeyHint: 'Spatie of → volgende · ← vorige',
    nextSlideHeading: 'VOLGENDE DIA',
    lastSlideSummary: 'Laatste dia van deze voordracht — afsluiting en discussie.',
    speakerNotesLabel: (s) => `Spreeknotities (Dia ${s})`,
    autosavedBadge: 'Automatisch opgeslagen',
    speakerNotesPlaceholder:
      'Noteer spreekpunten, begripsonderscheidingen, tijdsindeling of bronverwijzingen...',
  },
};
