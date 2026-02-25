import { lessons } from "@/components/training/client-resources-content"

export interface ClientResourceSearchItem {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  href: string
}

export const clientResourceSearchData: ClientResourceSearchItem[] = lessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  description: lesson.content.intro,
  category: lesson.type,
  tags: [
    lesson.type,
    ...lesson.content.sections.map((section) => section.title).slice(0, 6),
    ...lesson.content.keyTakeaways.slice(0, 4),
  ],
  href: "/training/client-resources",
}))

