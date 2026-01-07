const Card = ({ children, className = "" }) => (
  <div
    className={`w-full rounded-2xl border border-border bg-surface p-6 shadow-card ${className}`}
  >
    {children}
  </div>
);

export default Card;
