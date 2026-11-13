export type LangCode = 'pt' | 'en' | 'fr' | 'it' | 'nl';

export type DeckId = 'trajeto' | 'representacao';

export type ViewMode = 'home' | 'reader' | 'presenter' | 'atlas' | 'studio' | 'apparatus' | 'drive';

export type ReviewStatus = 'pending' | 'approved';

export interface SlideBlock {
  label: string;
  text: string;
}

export interface SlideItem {
  title: string;
  blocks: SlideBlock[];
  footer: string;
  source?: string;
}

export interface SlideOverride {
  title?: string;
  blocks?: SlideBlock[];
  footer?: string;
  status?: ReviewStatus;
  philologicalNote?: string;
  presenterNote?: string;
  updatedAt?: string;
}

export interface EditorialSource {
  title: string;
  detail: string;
  url: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface EditorialContent {
  editionTitle: string;
  edition: string[];
  contributionTitle: string;
  contribution: string[];
  sourcesTitle: string;
  sources: EditorialSource[];
  glossaryTitle: string;
  glossary: GlossaryEntry[];
  pendingTitle: string;
  pending: string[];
}

export interface UIStrings {
  home: string;
  toc: string;
  about: string;
  sources: string;
  work: string;
  previous: string;
  next: string;
  of: string;
  close: string;
  fullscreen: string;
  print: string;
  copy: string;
  copied: string;
  copyError: string;
  fullscreenError: string;
  loading: string;
  error: string;
  retry: string;
  skip: string;
  source: string;
  keys: string;
  lang: string;
  trajeto: string;
  representacao: string;
  trajetoSub: string;
  representacaoSub: string;
  trajectory: string;
  communication: string;
  open: string;
  title: string;
  description: string;
  date: string;
  notFound: string;
  printNote: string;
  number: string;
}

export interface CanonicalBundle {
  ui: Record<LangCode, UIStrings>;
  editorial: Record<LangCode, EditorialContent>;
  decks: Record<DeckId, Record<LangCode, SlideItem[]>>;
}

export type AtlasAxis = 'venda' | 'imperio' | 'republica';

export type EpistemicStatus = 'primary_verified' | 'study_plate' | 'locator_pending';

export interface SlideLinkRef {
  deck: DeckId;
  slideIndex: number; // 0-based
  contextLabel: string;
}

export interface AtlasEntry {
  id: string;
  accessionCode: string;
  axis: AtlasAxis;
  year: string;
  sortYear: number;
  title: string;
  creator: string;
  medium: string;
  repositoryOrContext: string;
  imageSrc: string;
  imageAlt: string;
  aspectClass: 'aspect-[4/3]' | 'aspect-[3/4]';
  epistemicStatus: EpistemicStatus;
  statusDetail: string;
  analyticalFunction: string;
  juridicalQuestion: string;
  verificationNotes: string;
  primarySourceUrl?: string;
  primarySourceLabel?: string;
  linkedSlides: SlideLinkRef[];
}

export type TimelineSourceKind = 'iconographic' | 'normative' | 'hybrid';

export type TimelineFilter = 'all' | AtlasAxis | DeckId;

export interface TimelinePole {
  tag: string;
  title: string;
  summary: string;
}

export interface TimelineLocalizedCopy {
  shortLabel: string;
  title: string;
  creatorOrIssuer: string;
  mediumOrNorm: string;
  repositoryOrContext: string;
  analyticalFunction: string;
  argumentSummary: string;
  keyFormulation: string;
  bibliographicRef: string;
  documentaryCaution: string;
  matrixPole: TimelinePole;
  casePole: TimelinePole;
}

export interface TimelineSlideCitation {
  deck: DeckId;
  slideIndex: number; // 0-based
  slideNum: string;
  titleByLang: Record<LangCode, string>;
}

export interface TimelineCompanionCrossRef {
  url: string;
  labelByLang: Record<LangCode, string>;
  noteByLang: Record<LangCode, string>;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  sortYear: number;
  accessionCode: string;
  axis: AtlasAxis;
  sourceKind: TimelineSourceKind;
  epistemicStatus: EpistemicStatus;
  atlasEntryId?: string;
  primarySourceUrl?: string;
  primarySourceLabel?: string;
  companionCrossRef?: TimelineCompanionCrossRef;
  copy: Record<LangCode, TimelineLocalizedCopy>;
  citedInSlides: TimelineSlideCitation[];
}


