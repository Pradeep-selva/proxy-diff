function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="pd-state">
      <div className="pd-state-icon">⚠️</div>
      <p className="pd-state-title">Something went wrong</p>
      <p className="pd-state-sub">{message}</p>
      <button type="button" className="pd-btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

export default ErrorState
