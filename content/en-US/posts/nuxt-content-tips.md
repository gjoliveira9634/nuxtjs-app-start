---
title: "Nuxt Content Tips"
date: 2025-08-05
excerpt: "How to organize your posts and render content."
categories: ["nuxt", "content"]
tags: [nuxt, content]
---

## Organization

- Put your posts into `content/posts/`
- Use frontmatter for title, date and tags

## Rendering

Use the `<ContentRenderer />` component to render the post body:

```vue
<ContentRenderer :value="doc" />
```
