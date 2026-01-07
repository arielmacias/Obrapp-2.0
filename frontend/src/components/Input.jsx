const Input = ({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  helper,
  autoComplete,
  autoFocus,
  required,
  rightElement,
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium text-text">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        className={`h-12 w-full rounded-xl border bg-surface px-4 pr-12 text-sm text-text shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
          error ? "border-red-400" : "border-border"
        }`}
      />
      {rightElement ? (
        <div className="absolute inset-y-0 right-3 flex items-center text-muted">
          {rightElement}
        </div>
      ) : null}
    </div>
    {helper ? <p className="text-xs text-muted">{helper}</p> : null}
    {error ? <p className="text-xs text-red-500">{error}</p> : null}
  </div>
);

export default Input;
