import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface DriveConfirmAction {
  title: string;
  description: string;
  affectedItem?: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
}

interface DriveConfirmModalProps {
  action: DriveConfirmAction | null;
  busy?: boolean;
  onCancel: () => void;
}

export function DriveConfirmModal({
  action,
  busy = false,
  onCancel,
}: DriveConfirmModalProps) {
  useEffect(() => {
    if (!action) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [action, busy, onCancel]);

  if (!action) return null;

  const isDanger = action.tone === 'danger';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1c1c]/70 backdrop-blur-[2px]"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        className="w-full max-w-md bg-[#f2efeb] border-[1.5px] border-[#1c1c1c] p-6 space-y-5 shadow-[6px_6px_0px_#1c1c1c]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-[#7e2a1f]" />
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e2a1f]">
                Confirmação de operação
              </p>
              <h2
                id="drive-confirm-title"
                className="font-serif text-2xl font-medium text-[#1c1c1c]"
              >
                {action.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Fechar diálogo"
            className="p-1.5 text-[#1c1c1c]/70 hover:text-[#1c1c1c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-[#1c1c1c]/85">
          <p>{action.description}</p>
          {action.affectedItem && (
            <div className="p-3 bg-white/75 border border-[#1c1c1c]/30 font-mono text-xs text-[#1c1c1c] break-all">
              Item afetado: {action.affectedItem}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c1c1c]/15">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#f2efeb] transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => action.onConfirm()}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border text-[#f2efeb] transition-colors whitespace-nowrap ${
              isDanger
                ? 'bg-[#7e2a1f] border-[#7e2a1f] hover:bg-[#1c1c1c] hover:border-[#1c1c1c]'
                : 'bg-[#1c1c1c] border-[#1c1c1c] hover:bg-[#7e2a1f] hover:border-[#7e2a1f]'
            } disabled:opacity-60`}
          >
            {busy ? 'Processando...' : action.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
