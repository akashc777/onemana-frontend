/** Three-dot typing indicator for AI / chat demos. */
export function TypingIndicator({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      <span className="typing-dot" />
      <span className="typing-dot typing-dot-2" />
      <span className="typing-dot typing-dot-3" />
    </span>
  );
}