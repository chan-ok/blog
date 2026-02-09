function h1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-8 pt-12 text-4xl font-bold border-b border-gray-200 dark:border-gray-700">
      {children}
    </h1>
  );
}

function h2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 pt-10 text-3xl font-bold border-b border-gray-200 dark:border-gray-700">
      {children}
    </h2>
  );
}

function h3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 pt-8 text-2xl font-bold">{children}</h3>;
}

function h4({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-3 pt-6 text-xl font-semibold">{children}</h4>;
}

function h5({ children }: { children: React.ReactNode }) {
  return <h5 className="mb-3 pt-4 text-lg font-semibold">{children}</h5>;
}

const Typography = {
  h1,
  h2,
  h3,
  h4,
  h5,
};

export default Typography;
