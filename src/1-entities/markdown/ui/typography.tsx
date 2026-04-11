import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  id?: string;
}

function h1({ children, id, ...rest }: HeadingProps) {
  return (
    <h1
      id={id}
      className="group border-b border-ink pb-3 pt-16 mb-6 text-[28px] font-bold leading-tight dark:border-ink"
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
      className="group border-b border-rule pb-2 pt-12 mb-4 text-[22px] font-bold"
      {...rest}
    >
      {children}
    </h2>
  );
}

function h3({ children, id, ...rest }: HeadingProps) {
  return (
    <h3 id={id} className="group pt-10 mb-4 text-[18px] font-bold" {...rest}>
      {children}
    </h3>
  );
}

function h4({ children, id, ...rest }: HeadingProps) {
  return (
    <h4 id={id} className="group pt-7 mb-3 text-[16px] font-semibold" {...rest}>
      {children}
    </h4>
  );
}

function h5({ children, id, ...rest }: HeadingProps) {
  return (
    <h5 id={id} className="group pt-5 mb-3 text-[15px] font-semibold" {...rest}>
      {children}
    </h5>
  );
}

function h6({ children, id, ...rest }: HeadingProps) {
  return (
    <h6
      id={id}
      className="group pt-4 mb-2 text-[14px] font-semibold text-ink2"
      {...rest}
    >
      {children}
    </h6>
  );
}

const Typography = { h1, h2, h3, h4, h5, h6 };

export default Typography;
