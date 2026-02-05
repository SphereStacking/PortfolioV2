import { cva, type VariantProps } from 'class-variance-authority'

export { default as Card } from './Card.vue'
export { default as CardAction } from './CardAction.vue'
export { default as CardContent } from './CardContent.vue'
export { default as CardDescription } from './CardDescription.vue'
export { default as CardFooter } from './CardFooter.vue'
export { default as CardHeader } from './CardHeader.vue'
export { default as CardTitle } from './CardTitle.vue'

export const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
  {
    variants: {
      variant: {
        default:
          'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        outline:
          'border bg-background flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        ghost:
          'hover:bg-accent hover:text-accent-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
      },
      size: {
        default: 'p-4',
        sm: 'p-2',
        xs: 'p-1',
        lg: 'p-6',
      },
      rounded: {
        default: 'rounded-md',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  },
)

export type CardVariants = VariantProps<typeof cardVariants>
