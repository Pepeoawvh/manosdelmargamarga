'use client';
import Link from 'next/link';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  href,
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText = 'Cargando...',
  onClick,
  ...props
}) => {
  // Base accesible con ring y buen contraste sobre fondos claros del proyecto
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5e8c30] ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

  // Paleta del proyecto
  // Verde principal: #5e8c30, verde oscuro: #46621f, borde tierra: #ece7d2, fondos cálidos: #faf8ee / #f5f3e6
  const variants = {
    primary:
      'bg-[#5e8c30] text-white hover:bg-[#4d7528] active:bg-[#46621f] ' +
      'focus-visible:ring-offset-white',
    secondary:
      'bg-[#faf8ee] text-[#3f4f1c] border border-[#ece7d2] hover:bg-[#f3efdf] active:bg-[#ece7d2] ' +
      'focus-visible:ring-offset-white',
    outline:
      'bg-transparent text-[#46621f] border border-[#46621f] hover:bg-[#eaf1e0] active:bg-[#dce8cd] ' +
      'focus-visible:ring-offset-white',
    ghost:
      'bg-transparent text-[#5e8c30] hover:bg-[#f5f3e6] active:bg-[#ece7d2] ' +
      'focus-visible:ring-offset-white',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 ' +
      'focus-visible:ring-offset-white',
  };

  const sizes = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const cls = [
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Loader SVG
  const Loader = (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${cls} ${disabled ? 'pointer-events-none' : ''}`}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
        {isLoading ? loadingText : children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && Loader}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {isLoading ? loadingText : children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
