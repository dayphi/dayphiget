interface Props {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

function formatDots(val: string): string {
  const num = val.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function stripDots(val: string): string {
  return val.replace(/\./g, '');
}

export function RupiahInput({ value, onChange, placeholder = '0', required, className, autoFocus, onKeyDown }: Props) {
  const display = formatDots(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripDots(e.target.value);
    if (raw === '' || /^\d+$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      className={className}
    />
  );
}
