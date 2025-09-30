/**
 * Simpel primærknap der kan rendere som link eller button.
 */
import type { ComponentProps, CSSProperties, ElementType, ReactNode } from 'react'

type PolymorphicProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  style?: CSSProperties
} & Omit<ComponentProps<T>, 'as' | 'children' | 'style'>

export function PrimaryButton<T extends ElementType = 'button'>(
  { as, children, style, ...rest }: PolymorphicProps<T>
): JSX.Element {
  const Component = (as ?? 'button') as ElementType
  const baseStyle: CSSProperties = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0a7d55',
    color: '#fff',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    border: 'none',
    display: 'inline-block',
    cursor: 'pointer'
  }

  const componentProps = {
    ...rest,
    style: { ...baseStyle, ...(style ?? {}) }
  } as ComponentProps<T>

  if (Component === 'button' && !(componentProps as ComponentProps<'button'>).type) {
    (componentProps as ComponentProps<'button'>).type = 'button'
  }

  return <Component {...componentProps}>{children}</Component>
}
