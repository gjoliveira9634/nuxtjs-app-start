<script setup lang="ts">
	import { queryContent } from "#content";

	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	const config = useRuntimeConfig();

	// Resolve o caminho do documento conforme o locale atual
	const path = computed(() => {
		const slug = (route.params.slug as string[]).join("/");
		// Agora todos os conteúdos ficam em /<locale>/posts
		return `/${locale.value}/posts/${slug}`;
	});

	const { data: doc } = await useAsyncData(
		`post:${path.value}`,
		() => queryContent(path.value).findOne(),
		{ watch: [path] },
	);

	watchEffect(() => {
		if (!doc.value) {
			throw createError({
				statusCode: 404,
				statusMessage: t("errors.postNotFound") as string,
			});
		}

		// SEO por post
		useSeoMeta({
			title: (doc.value as any).title,
			description:
				(doc.value as any).excerpt
				|| (doc.value as any).description
				|| undefined,
			ogTitle: (doc.value as any).title,
			ogDescription:
				(doc.value as any).excerpt
				|| (doc.value as any).description
				|| undefined,
		});

		// JSON-LD Article básico com URL canônica do locale
		useHead({
			script: [
				{
					type: "application/ld+json",
					innerHTML: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Article",
						"headline": (doc.value as any).title,
						"datePublished": (doc.value as any).date,
						"mainEntityOfPage": {
							"@type": "WebPage",
							"@id": new URL(
								localePath(
									((doc.value as any)._path as string).replace(
										`/${locale.value}/posts`,
										"/blog",
									),
								),
								config.public.siteUrl,
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
			return new Date(d as any).toLocaleDateString();
		}
	}
</script>

<template>
	<article
		v-if="doc"
		class="prose dark:prose-invert mx-auto max-w-3xl py-10">
		<h1 class="mb-2">{{ (doc as any).title }}</h1>
		<p class="mt-0 text-sm text-gray-500">
			{{ formatDate((doc as any).date) }}
		</p>
		<ContentRenderer :value="doc" />
	</article>
</template>
