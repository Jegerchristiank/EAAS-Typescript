/**
 * Simpel primærknap der kan rendere som link eller button.
 */
import type { ComponentProps, ElementType, ReactNode } from 'react'

type PolymorphicProps<T extends ElementType> = {
  as?: T
  children: ReactNode
} & Omit<ComponentProps<T>, 'as' | 'children'>

export function PrimaryButton<T extends ElementType = 'button'>(
  { as, children, ...rest }: PolymorphicProps<T>
): JSX.Element {
  const Component = (as ?? 'button') as ElementType
  return (
    <Component
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#0a7d55',
        color: '#fff',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        border: 'none',
        display: 'inline-block'
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
