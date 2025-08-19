---
title: "Consejos para Nuxt Content"
seo:
  slug: nuxt-content-consejos
  twitterCard: summary_large_image
  keywords: ["nuxt", "content", "consejos"]
  ogImage: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
  canonical: "https://example.com/es/blog/nuxt-content-consejos"
cover:
  image: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
  alt: "Ilustración de consejos para Nuxt Content"
author:
  name: "Equipo"
  bio: "Contenido de demostración."
description:
  "Cómo organizar tus posts, configurar frontmatter con SEO y renderizar el
  cuerpo con ContentRenderer, siguiendo el esquema del proyecto."
excerpt:
  "Esta guía muestra cómo organizar tus posts, definir frontmatter con SEO y
  renderizar el cuerpo con <ContentRenderer />, siguiendo el esquema del
  proyecto de principio a fin."
date: 2025-08-05
categories: ["nuxt", "content"]
tags: ["nuxt", "content"]
layout: default
toc: true
comments: true
sharing: true
priority: normal
language: es
---

## Organización

- Coloca tus posts en `content/<locale>/posts/`
- Usa frontmatter para título, fecha, tags y campos de SEO

## Renderizado

Usa el componente `<ContentRenderer />` para renderizar el cuerpo del post:

```vue
<ContentRenderer :value="doc" />
```
