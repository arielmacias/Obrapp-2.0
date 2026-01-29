const Card = ({ children, className = "", ...props }) => (
  <div
    className={`w-full rounded-2xl border border-border bg-surface p-6 shadow-card ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
