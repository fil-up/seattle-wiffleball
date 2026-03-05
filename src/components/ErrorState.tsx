interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = "Couldn't grab the stats. Try again?",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="w-12 h-12 text-brand-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
        <p className="text-content-primary font-medium text-lg">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-brand-navy text-white px-6 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
