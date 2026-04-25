import type { HTMLAttributes, PropsWithChildren } from 'react';

export function Card({
  children,
  className = '',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>): JSX.Element {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
