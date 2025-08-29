# TODOs

- [x] Implementar content/tags/[locale]/\*.md, index.vue e [...slug].vue para
      tags, assim como demais conteúdos;
- [x] Implementar busca por texto corretamente em cada index do blog (autores,
      séries, categorias, posts e tags) e em cada página [...slug].vue;
- [x] Implementar paginação corretamente para cada index do blog (autores,
      séries, categorias, posts e tags) e em cada página [...slug].vue;
- [x] Se usuário estiver dentro de um post/artigo individual em
      "pages/blog/posts/[...slug].vue", e digitar algo no campo de busca, o app
      deve redirecionar para o index geral dos posts
      (pages/blog/posts/index.vue) e mostrar os resultados da busca lá;
- [ ] Corrigir e melhorar os cards laterais de categorias e tags, adicionar
      cards laterais também para autores, posts e séries. Ao clicar em algum
      filtro dos cards laterais o app deve redirecionar o resultado para o index
      correto, por exemplo: - Se o usuário clicar em uma categoria, redirecionar
      para (pages/blog/categories/[...slug].vue); - Se o usuário clicar em uma
      tag, redirecionar para (pages/blog/tags/[...slug].vue); - Se o usuário
      clicar em um autor, redirecionar para
      (pages/blog/authors/[...slug].vue); - Se o usuário clicar em um post,
      redirecionar para (pages/blog/posts/[...slug].vue); - Se o usuário clicar
      em uma série, redirecionar para (pages/blog/series/[...slug].vue);
- [ ] Cada card lateral deve ter um limite de itens, por exemplo, 10 itens. Deve
      haver um botão "Ver mais" ou "Ver todos" que redirecione para o index
      completo daquele filtro. Exemplo: - Se o usuário clicar em "Ver mais"
      dentro do card lateral de categorias, deve ser redirecionado para
      (pages/blog/categories/index.vue) onde verá todas as categorias e assim
      por diante;
