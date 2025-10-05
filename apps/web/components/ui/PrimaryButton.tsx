/**
 * Simpel primærknap der kan rendere som link eller button.
 */
import type { ComponentProps, ElementType, ReactNode } from 'react'

type PrimaryVariant = 'primary' | 'ghost'

type PolymorphicProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  className?: string
  variant?: PrimaryVariant
} & Omit<ComponentProps<T>, 'as' | 'children' | 'style'>

export function PrimaryButton<T extends ElementType = 'button'>(
  { as, children, className, variant = 'primary', ...rest }: PolymorphicProps<T>
): JSX.Element {
  const Component = (as ?? 'button') as ElementType

  const componentProps = {
    ...rest,
    className: ['ds-button', className].filter(Boolean).join(' '),
    'data-variant': variant === 'ghost' ? 'ghost' : undefined
  } as ComponentProps<T>

  if (Component === 'button' && !(componentProps as ComponentProps<'button'>).type) {
    (componentProps as ComponentProps<'button'>).type = 'button'
  }

  return <Component {...componentProps}>{children}</Component>
}
