function h1({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-4 text-4xl font-bold">{children}</h1>;
}

function h2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 mb-3 text-3xl font-bold">{children}</h2>;
}

function h3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-4 mb-2 text-2xl font-semibold">{children}</h3>;
}

function h4({ children }: { children: React.ReactNode }) {
  return <h4 className="mt-3 mb-2 text-xl font-semibold">{children}</h4>;
}

function h5({ children }: { children: React.ReactNode }) {
  return <h5 className="mt-3 mb-2 text-lg font-semibold">{children}</h5>;
}

const Typography = {
  h1,
  h2,
  h3,
  h4,
  h5,
};

export default Typography;
