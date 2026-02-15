import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  id?: string;
}

function h1({ children, id, ...rest }: HeadingProps) {
  return (
    <h1
      id={id}
      className="group border-b border-gray-200 pb-2 pt-12 mb-4 text-4xl font-bold dark:border-gray-700"
      {...rest}
    >
      {children}
    </h1>
  );
}

function h2({ children, id, ...rest }: HeadingProps) {
  return (
    <h2
      id={id}
      className="group border-b border-gray-200 pb-2 pt-10 mb-4 text-3xl font-bold dark:border-gray-700"
      {...rest}
    >
      {children}
    </h2>
  );
}

function h3({ children, id, ...rest }: HeadingProps) {
  return (
    <h3 id={id} className="group pt-8 text-2xl font-bold" {...rest}>
      {children}
    </h3>
  );
}

function h4({ children, id, ...rest }: HeadingProps) {
  return (
    <h4 id={id} className="group pt-6 mb-3 text-xl font-semibold" {...rest}>
      {children}
    </h4>
  );
}

function h5({ children, id, ...rest }: HeadingProps) {
  return (
    <h5 id={id} className="group pt-4 mb-3 text-lg font-semibold" {...rest}>
      {children}
    </h5>
  );
}

function h6({ children, id, ...rest }: HeadingProps) {
  return (
    <h6 id={id} className="group pt-3 mb-2 text-base font-semibold" {...rest}>
      {children}
    </h6>
  );
}

const Typography = {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
};

export default Typography;
