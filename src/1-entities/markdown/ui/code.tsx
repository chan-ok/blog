interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Code({ children, className }: CodeProps) {
  const isInline = !className;
  return isInline ? (
    <code className="rounded bg-bg2 px-1.5 py-0.5 font-mono text-sm text-ink border border-rule">
      {children}
    </code>
  ) : (
    <code className={`font-mono text-sm ${className || ""}`}>{children}</code>
  );
}
