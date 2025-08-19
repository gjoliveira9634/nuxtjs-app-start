---
title: "Dicas de Nuxt Content"
seo:
  slug: dicas-nuxt-content
  twitterCard: summary_large_image
  keywords: ["nuxt", "content", "dicas"]
  ogImage: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
  canonical: "https://example.com/pt/blog/dicas-nuxt-content"
cover:
  image: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
  alt: "Ilustração de dicas para Nuxt Content"
author:
  name: "Equipe"
  bio: "Conteúdo de demonstração."
description:
  "Como organizar seus posts, configurar frontmatter com SEO e renderizar o
  corpo com ContentRenderer, seguindo o schema do projeto."
excerpt:
  "Guia prático: organize posts, defina frontmatter de SEO e renderize com
  <ContentRenderer />, seguindo o schema do projeto do início ao fim."
date: 2025-08-05
categories: ["nuxt", "content"]
tags: ["nuxt", "content"]
layout: default
toc: true
comments: true
sharing: true
priority: normal
language: pt
---

## Organização

- Coloque seus posts em `content/<locale>/posts/`
- Use o frontmatter para título, data, tags e campos de SEO

## Renderização

Use o componente `<ContentRenderer />` para renderizar o corpo do post:

```vue
<ContentRenderer :value="doc" />
```
