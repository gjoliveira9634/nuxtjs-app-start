---
seo:
  slug: nuxt-content-tips
  twitterCard: summary_large_image
  keywords: ["nuxt", "content", "tips"]
  ogImage: "https://example.com/images/nuxt-content-tips-og.jpg"
  canonical: "https://example.com/en/blog/nuxt-content-tips"
cover:
  image: "https://example.com/images/nuxt-content-tips-cover.jpg"
  alt: "Illustration of tips for Nuxt Content"

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
