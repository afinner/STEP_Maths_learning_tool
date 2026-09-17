import { useId, type ReactNode } from 'react';

export interface SliderProps {
  label: ReactNode;
  /** The value as the reader should read it — the slider carries an index, this carries the meaning. */
  display: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

/**
 * A native range input with a label and a live value. Native, so it works from
 * the keyboard for free; integer-valued wherever a control has to land exactly
 * on a special point, with the module doing the conversion.
 */
export function Slider({ label, display, value, min, max, step = 1, onChange }: SliderProps) {
  const id = useId();
  return (
    <label className="control" htmlFor={id}>
      <span className="control-row">
        <span className="control-label">{label}</span>
        <span className="control-value">{display}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

export interface ChoiceProps<T extends string | number> {
  label: ReactNode;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
}

/** A choice between a few values, as a segmented row of buttons. */
export function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: ChoiceProps<T>) {
  const id = useId();
  return (
    <div className="control" role="group" aria-labelledby={id}>
      <span className="control-row">
        <span className="control-label" id={id}>
          {label}
        </span>
      </span>
      <div className="segmented">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className="segment"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface SelectProps<T extends string> {
  label: ReactNode;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
}

/** A choice between many values, or long ones: a native select. */
export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  const id = useId();
  return (
    <label className="control control-wide" htmlFor={id}>
      <span className="control-row">
        <span className="control-label">{label}</span>
      </span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The row every panel's controls sit in. */
export function Controls({ children }: { children: ReactNode }) {
  return <div className="controls">{children}</div>;
}
