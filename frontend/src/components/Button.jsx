const variants = {
  primary: "bg-accent text-white hover:bg-accent/90",
  secondary: "border border-border text-text hover:bg-surface",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  disabled,
  isLoading,
  onClick,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60 ${
      variants[variant]
    }`}
  >
    {isLoading ? (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
    ) : null}
    {children}
  </button>
);

export default Button;
