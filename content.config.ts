import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      source: '2.blog/**/*.md',
      type: 'page',
      schema: z.object({
        draft: z.boolean(),
        created: z.string(),
        updated: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()),
        icons: z.array(z.string()),
      }),
    }),
    career: defineCollection({
      source: '3.career/**/*.md',
      type: 'page',
      schema: z.object({
        unique_code: z.string(),
        title: z.string(),
        description: z.string(),
        date_start: z.string(),
        date_end: z.string(),
        draft: z.boolean(),
        image: z.string(),
        link: z.string(),
        tags: z.array(z.string()),
        icons: z.array(z.string()),
      }),
    }),
    project: defineCollection({
      source: '4.project/*.md',
      type: 'page',
      schema: z.object({
        career_unique_code: z.string(),
        title: z.string(),
        description: z.string(),
        draft: z.boolean(),
        image: z.string(),
        icon: z.string(),
        tags: z.array(z.string()),
        stacks: z.array(z.string()),
        overview: z.array(z.string()),
        tasks: z.array(z.string()),
        team: z.string(),
        role: z.string(),
        period_start: z.string(),
        period_end: z.string().optional(),
        pinned: z.boolean(),
        status: z.string(), // planning, in_progress, on_hold, completed, cancelled
        links: z.array(z.object({
          label: z.string(),
          url: z.string(),
        })),
      }),
    }),
  },
})
