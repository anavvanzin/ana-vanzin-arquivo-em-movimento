import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';
import { LANGUAGES } from '../data/atlasCatalog';
import { SavedResearchNote } from '../hooks/useArchiveStore';
import { EditorialContent, LangCode, UIStrings } from '../types';
import { ResearchGroundingPanel } from './ResearchGroundingPanel';

interface EditorialApparatusProps {
  lang: LangCode;
  editorial: EditorialContent;
  ui: UIStrings;
  savedResearchNotes?: SavedResearchNote[];
  onSaveResearchNote?: (
    title: string,
    synthesis: string,
    sources: { title: string; uri: string }[]
  ) => Promise<void>;
  onDeleteResearchNote?: (noteId: string) => Promise<void>;
  onNotify?: (msg: string) => void;
  onChangeLang: (lang: LangCode) => void;
}

export function EditorialApparatus({
  lang,
  editorial,
  ui,
  savedResearchNotes = [],
  onSaveResearchNote,
  onDeleteResearchNote,
  onNotify,
  onChangeLang,
}: EditorialApparatusProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 lg:py-12 space-y-12">
      {/* Header & Language Switcher */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b-[1.5px] border-[#1c1c1c] dark:border-[#f2efeb]/65 pb-8">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b]">
            APARATO CRÍTICO & METODOLÓGICO
          </p>
          <h1 className="font-serif font-light text-4xl sm:text-5xl text-[#1c1c1c] dark:text-[#f2efeb]">
            {editorial.sourcesTitle}
          </h1>
          <p className="text-sm text-[#1c1c1c]/70 dark:text-[#f2efeb]/75">{ui.work}</p>
        </div>

        <div
          role="navigation"
          aria-label={ui.lang}
          className="flex items-center border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 bg-white/50 dark:bg-[#1a1a1a] p-0.5"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onChangeLang(l.code)}
              className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                l.code === lang
                  ? 'bg-[#7e2a1f] dark:bg-[#e5988b] text-[#f2efeb] dark:text-[#0d0d0d] font-bold'
                  : 'text-[#1c1c1c]/70 dark:text-[#f2efeb]/75 hover:text-[#1c1c1c] dark:hover:text-[#f2efeb]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* Two-Column Editorial Overview & C01 Contribution */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="p-7 bg-white/75 dark:bg-[#161616] backdrop-blur-[4px] border border-[#1c1c1c] dark:border-[#f2efeb]/65 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
            {editorial.editionTitle}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
            {editorial.edition.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        <div className="p-7 bg-white/45 dark:bg-[#1a1a1a] backdrop-blur-[4px] border border-[#1c1c1c]/40 dark:border-[#f2efeb]/45 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
            {editorial.contributionTitle}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
            {editorial.contribution.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Working Vocabulary / Glossary Table */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1c1c1c] dark:text-[#f2efeb]">
          {editorial.glossaryTitle}
        </h2>
        <div className="bg-white/75 dark:bg-[#161616] backdrop-blur-[4px] border border-[#1c1c1c] dark:border-[#f2efeb]/65 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#1c1c1c]/15 dark:divide-[#f2efeb]/15">
              {editorial.glossary.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <th
                    scope="row"
                    className="w-full sm:w-56 px-6 py-4 font-serif text-lg font-medium text-[#7e2a1f] dark:text-[#e5988b] block sm:table-cell pb-1 sm:pb-4"
                  >
                    {item.term}
                  </th>
                  <td className="px-6 py-4 pt-1 sm:pt-4 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85 block sm:table-cell">
                    {item.definition}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Primary Sources & Reading Scope */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1c1c1c] dark:text-[#f2efeb]">
          {editorial.sourcesTitle}
        </h2>
        <div className="divide-y divide-[#1c1c1c]/20 dark:divide-[#f2efeb]/20 border-y border-[#1c1c1c] dark:border-[#f2efeb]/65">
          {editorial.sources.map((src, idx) => (
            <div key={idx} className="py-5 space-y-2">
              {src.url ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-serif text-xl font-medium text-[#7e2a1f] dark:text-[#e5988b] hover:underline"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              ) : (
                <h3 className="font-serif text-xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
                  {src.title}
                </h3>
              )}
              <p className="text-sm leading-relaxed text-[#1c1c1c]/80 dark:text-[#f2efeb]/85 max-w-3xl">
                {src.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pending Documentary Verifications */}
      <section className="p-7 bg-white/75 dark:bg-[#161616] backdrop-blur-[4px] border border-[#7e2a1f] dark:border-[#e5988b] space-y-4">
        <h2 className="font-serif text-2xl font-medium text-[#7e2a1f] dark:text-[#e5988b]">
          {editorial.pendingTitle}
        </h2>
        <ul className="space-y-2.5 text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85">
          {editorial.pending.map((item, idx) => (
            <li
              key={idx}
              className="flex items-baseline gap-3 pb-2 border-b border-[#1c1c1c]/12 dark:border-[#f2efeb]/15 last:border-b-0 last:pb-0"
            >
              <span className="font-mono text-xs tabular-nums text-[#7e2a1f] dark:text-[#e5988b] shrink-0">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Live Documentary & Bibliographic Search Grounding */}
      <ResearchGroundingPanel
        lang={lang}
        onSaveNoteLocal={onSaveResearchNote}
        onNotify={onNotify}
      />

      {/* Local Archived Documentary Verification Notes */}
      {savedResearchNotes.length > 0 && (
        <section className="p-7 bg-white/75 dark:bg-[#161616] backdrop-blur-[4px] border border-[#1c1c1c] dark:border-[#f2efeb]/65 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 pb-4">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f] dark:text-[#e5988b] inline-flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span>CADERNO LOCAL DE PESQUISA</span>
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
                Fichas de verificação documental arquivadas ({savedResearchNotes.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#1c1c1c]/15 dark:divide-[#f2efeb]/15">
            {savedResearchNotes.map((note) => (
              <article key={note.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#1c1c1c]/60 dark:text-[#f2efeb]/70 tabular-nums">
                      {note.deck === 'representacao' ? '[ DOC. 01 ]' : '[ DOC. 02 ]'} ·{' '}
                      {new Date(note.updatedAtIso).toLocaleDateString('pt-BR')}
                    </p>
                    <h3 className="font-serif text-xl font-medium text-[#1c1c1c] dark:text-[#f2efeb]">
                      {note.queryTitle}
                    </h3>
                  </div>

                  {onDeleteResearchNote && note.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => {
                        void onDeleteResearchNote(note.id).then(() => {
                          onNotify?.('Ficha removida do caderno local.');
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[#1c1c1c]/35 dark:border-[#f2efeb]/40 text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 hover:border-[#7e2a1f] dark:hover:border-[#e5988b] hover:text-[#7e2a1f] dark:hover:text-[#e5988b] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-[#1c1c1c]/85 dark:text-[#f2efeb]/85 whitespace-pre-line max-w-3xl">
                  {note.synthesis}
                </p>

                {note.sourcesSummary && (
                  <pre className="p-3 bg-[#f2efeb]/85 dark:bg-[#1e1e1e] border border-[#1c1c1c]/15 dark:border-[#f2efeb]/20 font-mono text-[11px] leading-relaxed text-[#1c1c1c]/75 dark:text-[#f2efeb]/80 whitespace-pre-wrap overflow-x-auto">
                    {note.sourcesSummary}
                  </pre>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
