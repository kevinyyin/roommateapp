export function Checkbox({
  checked,
  onChange,
  color,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  color: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={label}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition duration-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      style={{
        borderColor: checked ? color : "var(--color-rule)",
        backgroundColor: checked ? color : "transparent",
      }}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-white stroke-[2.5]">
          <path d="M3 8.5L6.2 12L13 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
