import React from 'react';
import firebaseConfig from '../../firebase-applet-config.json';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  isQuotaError: boolean;
  isFreeReadQuota: boolean;
}

export class FirestoreErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      isQuotaError: false,
      isFreeReadQuota: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const raw = error?.message || 'Erro inesperado na sincronização com o banco de dados.';
    let parsedMessage = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.error === 'string') {
        parsedMessage = `${parsed.error} (${parsed.operationType || 'firestore'}: ${
          parsed.path || 'root'
        })`;
      }
    } catch {
      // Non-JSON error message
    }

    const isFreeReadQuota = parsedMessage.includes(
      "Quota exceeded for quota metric 'Free daily read units per project (free tier database)'"
    );
    const isQuotaError = isFreeReadQuota || parsedMessage.includes('Quota exceeded.');

    return {
      hasError: true,
      message: parsedMessage,
      isQuotaError,
      isFreeReadQuota,
    };
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const dbId =
      (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || '(default)';
    const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${dbId}/data?openUpgradeDialog=true`;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f2efeb] text-[#1c1c1c]">
        <div className="max-w-xl w-full p-8 bg-white/85 border-[1.5px] border-[#1c1c1c] space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e2a1f]">
            ICONOCRACIA · SINCRONIZAÇÃO FIREBASE
          </p>
          <h1 className="font-serif text-3xl font-medium text-[#1c1c1c]">
            {this.state.isQuotaError
              ? 'Limite diário de leituras do Firestore atingido'
              : 'Aviso de permissão ou comunicação com o Firestore'}
          </h1>
          <p className="text-sm leading-relaxed text-[#1c1c1c]/80 font-mono break-words">
            {this.state.message}
          </p>

          {this.state.isQuotaError && (
            <p className="text-xs leading-relaxed text-[#1c1c1c]/75">
              A cota gratuita diária será renovada automaticamente no próximo dia. Detalhes
              disponíveis na coluna Spark (Enterprise edition) em{' '}
              <a
                href="https://firebase.google.com/pricing#cloud-firestore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7e2a1f] underline"
              >
                firebase.google.com/pricing
              </a>
              {this.state.isFreeReadQuota && (
                <>
                  {' '}
                  ou{' '}
                  <a
                    href={upgradeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7e2a1f] underline"
                  >
                    no console do banco de dados
                  </a>
                </>
              )}
              .
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              this.setState({
                hasError: false,
                message: '',
                isQuotaError: false,
                isFreeReadQuota: false,
              })
            }
            className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efeb] hover:bg-[#7e2a1f] hover:border-[#7e2a1f] transition-colors"
          >
            Continuar no modo local
          </button>
        </div>
      </div>
    );
  }
}
