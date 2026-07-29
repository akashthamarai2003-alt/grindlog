import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.14)] hover:bg-zinc-800',
  secondary:
    'border border-black/10 bg-white/70 text-black shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:bg-white',
  ghost: 'bg-transparent text-black hover:bg-black/[0.045]',
  light: 'bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:bg-zinc-100',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-[transform,background-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:scale-[0.98] hover:scale-[1.03]',
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
