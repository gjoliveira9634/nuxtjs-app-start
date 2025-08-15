---
seo:
  slug: astuces-nuxt-content
  twitterCard: summary_large_image
  keywords: ["nuxt", "content", "astuces"]
  ogImage: "https://example.com/images/nuxt-content-tips-og.jpg"
  canonical: "https://example.com/fr/blog/astuces-nuxt-content"
cover:
  image: "https://example.com/images/nuxt-content-tips-cover.jpg"
  alt: "Illustration d'astuces pour Nuxt Content"

description:
  "Comment organiser vos articles, configurer le frontmatter avec SEO et
  afficher le corps avec ContentRenderer, en suivant le schéma du projet."
excerpt:
  "Ce guide montre comment organiser vos articles, définir un frontmatter SEO et
  afficher le corps avec <ContentRenderer />, en suivant le schéma du projet de
  bout en bout."
date: 2025-08-05
categories: ["nuxt", "content"]
tags: ["nuxt", "content"]
layout: default
toc: true
comments: true
sharing: true
priority: normal
language: fr
---

## Organisation

- Placez vos articles dans `content/<locale>/posts/`
- Utilisez le frontmatter pour le titre, la date, les tags et les champs SEO

## Rendu

Utilisez le composant `<ContentRenderer />` pour afficher le corps de l'article
:

```vue
<ContentRenderer :value="doc" />
```
