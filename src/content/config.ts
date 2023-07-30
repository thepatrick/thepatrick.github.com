import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updatedDate: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    heroImage: z.string().optional()
  })
});

const talk = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    event: z.object({
      name: z.string(),
      link: z.string()
    }),
    links: z.array(
      z.object({
        title: z.string(),
        href: z.string()
      })
    )
  })
});

const decadeImage = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    large: z.string(),
    small: z.string(),
    smallRetina: z.string(),
    flickrUrl: z.string().or(z.null()).optional(),
    photoId: z.string().or(z.null()).optional(),
    createdAt: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updatedAt: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
  })
});

export const collections = { blog, talk, decadeImage };
