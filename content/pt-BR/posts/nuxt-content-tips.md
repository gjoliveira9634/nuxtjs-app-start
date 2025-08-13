---
title: "Dicas de Nuxt Content"
date: 2025-08-05
excerpt: "Como organizar seus posts e renderizar conteúdo."
categories: ["nuxt", "content"]
tags: [nuxt, content]
---

## Organização

- Coloque seus posts em `content/posts/`
- Use o frontmatter para título, data, tags

## Renderização

Use o componente `<ContentRenderer />` para renderizar o corpo do post:

```vue
<ContentRenderer :value="doc" />
```
