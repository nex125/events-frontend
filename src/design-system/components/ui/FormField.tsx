import { cloneElement, isValidElement, type InputHTMLAttributes, type ReactElement } from 'react';
import { cn } from '../../utils/cn';

type InputLikeProps = InputHTMLAttributes<HTMLInputElement>;

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactElement<InputLikeProps>;
}

export function FormField({ id, label, error, className, children }: FormFieldProps) {
  if (!isValidElement<InputLikeProps>(children)) {
    return null;
  }

  const errorId = `${id}-error`;
  const existingDescribedBy = children.props['aria-describedby'];
  const describedBy = [existingDescribedBy, error ? errorId : undefined]
    .filter(Boolean)
    .join(' ')
    .trim();

  const input = cloneElement(children, {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy || undefined,
    className: cn('ds-input-field', children.props.className),
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block ds-label text-[var(--ds-on-surface-variant)]">
        {label}
      </label>
      {input}
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-[var(--ds-secondary)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
