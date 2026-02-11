interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Code({ children, className }: CodeProps) {
  const isInline = !className;
  return isInline ? (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200">
      {children}
    </code>
  ) : (
    <code className={`font-mono text-sm ${className || ''}`}>{children}</code>
  );
}
