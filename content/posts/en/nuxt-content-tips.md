---
title: "Tips for Nuxt Content"
seo:
  slug: nuxt-content-tips
  twitterCard: summary_large_image
  keywords: ["nuxt", "content", "tips"]
  ogImage: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
  canonical: "https://example.com/en/blog/nuxt-content-tips"
cover:
  image: "https://images.unsplash.com/photo-1729575846511-f499d2e17d79?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
  alt: "Illustration of tips for Nuxt Content"
author:
  name: "Team"
  bio: "Demo content."
description:
  "How to organize your posts, set frontmatter with SEO, and render the body
  with ContentRenderer, following the project schema."
excerpt:
  "This guide shows how to organize posts, define SEO-friendly frontmatter and
  render the body with <ContentRenderer />, following the project schema
  end-to-end."
date: 2025-08-05
categories: ["nuxt", "content"]
tags: ["nuxt", "content"]
layout: default
toc: true
comments: true
sharing: true
priority: normal
language: en
---

## Organization

- Put your posts into `content/<locale>/posts/`
- Use frontmatter for title, date, tags and SEO fields

## Rendering

Use the `<ContentRenderer />` component to render the post body:

```vue
<ContentRenderer :value="doc" />
```
