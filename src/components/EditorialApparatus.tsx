import { ExternalLink } from 'lucide-react';
import { LANGUAGES } from '../data/atlasCatalog';
import { EditorialContent, LangCode, UIStrings } from '../types';
import { ResearchGroundingPanel } from './ResearchGroundingPanel';

interface EditorialApparatusProps {
  lang: LangCode;
  editorial: EditorialContent;
  ui: UIStrings;
  canSaveToDrive?: boolean;
  onSaveNoteToDrive?: (
    title: string,
    synthesis: string,
    sources: { title: string; uri: string }[]
  ) => Promise<void>;
  onOpenDriveView?: () => void;
  onNotify?: (msg: string) => void;
  onChangeLang: (lang: LangCode) => void;
}

export function EditorialApparatus({
  lang,
  editorial,
  ui,
  canSaveToDrive = false,
  onSaveNoteToDrive,
  onOpenDriveView,
  onNotify,
  onChangeLang,
}: EditorialApparatusProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 lg:py-12 space-y-12">
      {/* Header & Language Switcher */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b-[1.5px] border-[#1c1c1c] pb-8">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
            APARATO CRÍTICO & METODOLÓGICO
          </p>
          <h1 className="font-serif font-light text-4xl sm:text-5xl text-[#1c1c1c]">
            {editorial.sourcesTitle}
          </h1>
          <p className="text-sm text-[#1c1c1c]/70">{ui.work}</p>
        </div>

        <div
          role="navigation"
          aria-label={ui.lang}
          className="flex items-center border border-[#1c1c1c]/40 bg-white/50 p-0.5"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onChangeLang(l.code)}
              className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                l.code === lang
                  ? 'bg-[#7e2a1f] text-[#f2efeb] font-bold'
                  : 'text-[#1c1c1c]/70 hover:text-[#1c1c1c]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* Two-Column Editorial Overview & C01 Contribution */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="p-7 bg-white/75 backdrop-blur-[4px] border border-[#1c1c1c] space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c]">
            {editorial.editionTitle}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85">
            {editorial.edition.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        <div className="p-7 bg-white/45 backdrop-blur-[4px] border border-[#1c1c1c]/40 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1c1c]">
            {editorial.contributionTitle}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85">
            {editorial.contribution.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Working Vocabulary / Glossary Table */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1c1c1c]">
          {editorial.glossaryTitle}
        </h2>
        <div className="bg-white/75 backdrop-blur-[4px] border border-[#1c1c1c] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#1c1c1c]/15">
              {editorial.glossary.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <th
                    scope="row"
                    className="w-full sm:w-56 px-6 py-4 font-serif text-lg font-medium text-[#7e2a1f] block sm:table-cell pb-1 sm:pb-4"
                  >
                    {item.term}
                  </th>
                  <td className="px-6 py-4 pt-1 sm:pt-4 text-sm leading-relaxed text-[#1c1c1c]/85 block sm:table-cell">
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
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1c1c1c]">
          {editorial.sourcesTitle}
        </h2>
        <div className="divide-y divide-[#1c1c1c]/20 border-y border-[#1c1c1c]">
          {editorial.sources.map((src, idx) => (
            <div key={idx} className="py-5 space-y-2">
              {src.url ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-serif text-xl font-medium text-[#7e2a1f] hover:underline"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              ) : (
                <h3 className="font-serif text-xl font-medium text-[#1c1c1c]">
                  {src.title}
                </h3>
              )}
              <p className="text-sm leading-relaxed text-[#1c1c1c]/80 max-w-3xl">
                {src.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pending Documentary Verifications */}
      <section className="p-7 bg-white/75 backdrop-blur-[4px] border border-[#7e2a1f] space-y-4">
        <h2 className="font-serif text-2xl font-medium text-[#7e2a1f]">
          {editorial.pendingTitle}
        </h2>
        <ul className="space-y-2.5 text-sm leading-relaxed text-[#1c1c1c]/85">
          {editorial.pending.map((item, idx) => (
            <li
              key={idx}
              className="flex items-baseline gap-3 pb-2 border-b border-[#1c1c1c]/12 last:border-b-0 last:pb-0"
            >
              <span className="font-mono text-xs tabular-nums text-[#7e2a1f] shrink-0">
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
        canSaveToDrive={canSaveToDrive}
        onSaveNoteToDrive={onSaveNoteToDrive}
        onRequestDriveView={onOpenDriveView}
        onNotify={onNotify}
      />
    </div>
  );
}
