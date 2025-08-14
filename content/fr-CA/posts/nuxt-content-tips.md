---
title: "Astuces Nuxt Content"
date: 2025-08-05
excerpt: "Comment organiser vos articles et rendre le contenu."
categories: ["nuxt", "content"]
tags: [nuxt, content]
---

## Organisation

- Placez vos articles dans `content/posts/`
- Utilisez le frontmatter pour le titre, la date et les tags

## Rendu

Utilisez le composant `<ContentRenderer />` pour afficher le corps de l'article
:

```vue
<ContentRenderer :value="doc" />
```
