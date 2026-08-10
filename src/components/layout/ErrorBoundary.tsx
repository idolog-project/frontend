import { Component, type ErrorInfo, type ReactNode } from 'react'

import { useLocaleStore } from '@/features/locale/store'
import { translate } from '@/features/locale/useT'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Without this, a render crash unmounts the whole tree and the near-black theme
 * makes the resulting blank page look like a freeze. Class component because
 * React still has no hook for error boundaries.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[idolog] render crash:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    // getState(), not a hook — class components cannot use hooks.
    const locale = useLocaleStore.getState().locale

    return (
      <div className="flex h-full flex-col items-start justify-center gap-4 px-16">
        <h1 className="font-display text-title-md">
          {translate(locale, 'state.crashTitle')}
        </h1>
        <p className="max-w-prose text-body-md text-text-muted">
          {translate(locale, 'state.crashBody')}
        </p>
        <pre className="max-w-full overflow-x-auto rounded border border-danger/40 bg-surface px-4 py-3 text-caption text-danger">
          {this.state.error.message}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-primary px-6 py-3 text-body-sm text-primary transition-colors hover:bg-primary/10"
        >
          {translate(locale, 'state.reload')}
        </button>
      </div>
    )
  }
}
