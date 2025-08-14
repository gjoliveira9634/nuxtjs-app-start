<script setup lang="ts">
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	const requestURL = useRequestURL();

	// Resolve o caminho do documento conforme o locale atual
	const path = computed(() => {
		const slug = (route.params.slug as string[]).join("/");
		// Agora todos os conteúdos ficam em /<locale>/posts (locale salvo em minúsculas no BD)
		return `/${locale.value.toLowerCase()}/posts/${slug}`;
	});

	const { data: doc } = await useAsyncData(
		`post:${path.value}`,
		async () => {
			// Busca o item da coleção "posts" pelo path resolvido
			const item = await queryCollection("posts")
				.where("path", "=", path.value)
				.first();
			return item;
		},
		{ watch: [path] },
	);

	watchEffect(() => {
		if (!doc.value) {
			throw createError({
				statusCode: 404,
				message: t("errors.postNotFound") as string,
			});
		}

		// SEO por post
		useSeoMeta({
			title: doc.value.title,
			description: doc.value.excerpt || doc.value.description || undefined,
			ogTitle: doc.value.title,
			ogDescription: doc.value.excerpt || doc.value.description || undefined,
		});

		// JSON-LD Article básico com URL canônica do locale
		useHead({
			script: [
				{
					type: "application/ld+json",
					innerHTML: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Article",
						"headline": doc.value.title,
						"datePublished": doc.value.date,
						"mainEntityOfPage": {
							"@type": "WebPage",
							"@id": new URL(
								localePath(
									(doc.value.path as string).replace(
										/^\/[^/]+\/posts/,
										"/blog",
									),
								),
								requestURL.origin,
							).toString(),
						},
					}),
				},
			],
		});
	});

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
	<article
		v-if="doc"
		class="prose dark:prose-invert mx-auto max-w-3xl py-10">
		<h1 class="mb-2">{{ doc.title }}</h1>
		<p class="mt-0 text-sm text-gray-500">
			{{ formatDate(doc.date as string) }}
		</p>
		<!-- O body já vem renderizável via ContentRenderer se presente -->
		<ContentRenderer :value="doc" />
	</article>
</template>
