import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary',
  danger: 'bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent',
  ghost: 'border border-slate-200 bg-white text-foreground hover:bg-slate-50 focus-visible:ring-secondary'
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>): JSX.Element {
  return (
    <button
      className={[
        'inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-md transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
