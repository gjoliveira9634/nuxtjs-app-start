<script setup lang="ts">
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const title = computed(() => t("site.blog"));
	const description = computed(() => t("site.tagline"));
	useSeoMeta({
		title,
		description,
		ogTitle: title,
		ogDescription: description,
		twitterCard: "summary_large_image",
		twitterSite: "@nuxt_js",
		ogImage: "/og.jpg",
	});

	// i18n SEO alternates
	const i18nHead = useLocaleHead({ addSeoAttributes: true } as any);
	watchEffect(() => {
		const v = (i18nHead as any).value || {};
		useHead({
			htmlAttrs: v.htmlAttrs || {},
			link: v.link || [],
			meta: v.meta || [],
		});
	});

	const { data: posts } = await useAsyncData(
		`posts:list:${locale.value}`,
		async () => {
			try {
				// Consulta todos os posts do locale atual usando queryCollection e ordena por data (desc)
				const all = await queryCollection("posts")
					.where("path", "LIKE", `/posts/${locale.value.toLowerCase()}/%`)
					.order("date", "DESC")
					.all();
				// Oculta posts marcados como rascunho
				return all.filter((p: any) => !p.draft);
			} catch (error) {
				console.error("Erro ao buscar posts:", error);
				return [];
			}
		},
		{ watch: [locale] },
	);

	function toBlogPath(p: string) {
		// Remove o prefixo do idioma e substitui /posts por /blog
		// Exemplo: /posts/pt/hello-world -> /blog/hello-world
		return p.replace(/^\/posts\/[^/]+/, "/blog");
	}

	function toBlogPathFromDoc(p: any) {
		const raw =
			p?.seo?.slug || (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/${raw}`);
	}

	function formatDate(d: string | number | Date) {
		try {
			return new Intl.DateTimeFormat(locale.value, {
				dateStyle: "medium",
			}).format(new Date(d));
		} catch {
			return new Date(d).toLocaleDateString();
		}
	}
</script>

<template>
	<div class="container mx-auto py-10">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("site.blog") }}</h1>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<article
				v-for="post in posts"
				:key="post.path"
				class="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900">
				<NuxtLink
					:to="toBlogPathFromDoc(post)"
					class="block">
					<div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
						<img
							v-if="post.cover?.image"
							:src="post.cover.image"
							:alt="post.cover?.alt || post.title"
							class="h-full w-full object-cover" />
					</div>
					<div class="p-4">
						<h2 class="line-clamp-2 text-lg font-semibold">
							{{ post.title || post.path.split("/").pop() }}
						</h2>
						<p class="mt-1 text-xs text-gray-500">
							{{ post.date ? formatDate(post.date) : "" }}
						</p>
						<p
							v-if="post.excerpt || post.description"
							class="mt-2 line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
							{{ post.excerpt || post.description }}
						</p>
					</div>
				</NuxtLink>
			</article>
		</div>
	</div>
</template>
