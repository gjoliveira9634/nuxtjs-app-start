---
title: "Consejos de Nuxt Content"
date: 2025-08-05
excerpt: "Cómo organizar tus posts y renderizar contenido."
categories: ["nuxt", "content"]
tags: [nuxt, content]
---

## Organización

- Coloca tus posts en `content/posts/`
- Usa frontmatter para título, fecha y tags

## Renderizado

Usa el componente `<ContentRenderer />` para renderizar el cuerpo del post:

```vue
<ContentRenderer :value="doc" />
```
