---
title: "Dicas de Nuxt Content"
seo:
  slug: dicas-nuxt-content
  twitterCard: summary_large_image
  keywords: ["nuxt", "content", "dicas"]
  ogImage: "https://example.com/images/nuxt-content-tips-og.jpg"
  canonical: "https://example.com/pt/blog/dicas-nuxt-content"
cover:
  image: "https://example.com/images/nuxt-content-tips-cover.jpg"
  alt: "Ilustração de dicas para Nuxt Content"

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
