import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'ghost' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconPosition = 'start' | 'end';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  className?: string;
  children: ReactNode;
};

type ButtonAsButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };

type ButtonAsAnchorProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a';
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'ds-btn-primary',
  ghost: 'ds-btn-ghost',
  secondary: 'ds-btn-secondary',
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'ds-btn-sm',
  md: 'ds-btn-md',
  lg: 'ds-btn-lg',
};

function ButtonContent({
  loading,
  icon,
  iconPosition,
  children,
}: Pick<BaseProps, 'loading' | 'icon' | 'iconPosition' | 'children'>) {
  const resolvedIcon = loading ? (
    <LoaderCircle className="h-[1em] w-[1em] animate-spin" aria-hidden="true" />
  ) : (
    icon
  );

  return (
    <>
      {resolvedIcon && iconPosition === 'start' ? resolvedIcon : null}
      <span>{children}</span>
      {resolvedIcon && iconPosition === 'end' ? resolvedIcon : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    as = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'end',
    className,
    children,
    ...restProps
  } = props;

  const classes = cn('ds-btn', variantClassMap[variant], sizeClassMap[size], className);

  if (as === 'a') {
    const anchorProps = restProps as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        {...anchorProps}
        aria-disabled={loading || anchorProps['aria-disabled']}
        className={classes}
      >
        <ButtonContent
          loading={loading}
          icon={icon}
          iconPosition={iconPosition}
        >
          {children}
        </ButtonContent>
      </a>
    );
  }

  const buttonProps = restProps as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...buttonProps} disabled={loading || buttonProps.disabled} className={classes}>
      <ButtonContent
        loading={loading}
        icon={icon}
        iconPosition={iconPosition}
      >
        {children}
      </ButtonContent>
    </button>
  );
}
