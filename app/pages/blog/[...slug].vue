<script setup lang="ts">
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	const requestURL = useRequestURL();

	// Resolve o caminho do documento conforme o locale atual
	const path = computed(() => {
		const slug = (route.params.slug as string[]).join("/");
		// No conteúdo, usamos códigos genéricos em minúsculas (en, es, fr, pt)
		const localeLower = locale.value.toLowerCase();
		// Conteúdo fica em /posts/<locale>/<slug>
		return `/posts/${localeLower}/${slug}`;
	});

	const {
		data: doc,
		pending,
		error,
	} = await useAsyncData(
		() => `post:${path.value}`,
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
		// Aguarda a busca terminar antes de decidir 404
		if (pending.value) return;
		if (!doc.value) {
			throw createError({
				statusCode: 404,
				message: t("errors.postNotFound") as string,
			});
		}

		// SEO por post (executa somente se doc existir)
		useSeoMeta({
			title: doc.value.title,
			description: doc.value.excerpt || doc.value.description || undefined,
			ogTitle: doc.value.title,
			ogDescription: doc.value.excerpt || doc.value.description || undefined,
			ogImage: doc.value.seo?.ogImage,
			twitterCard: doc.value.seo?.twitterCard,
			robots: doc.value.seo?.noindex ? "noindex, nofollow" : undefined,
		});

		// Link canônico (usa seo.canonical se existir, senão gera a partir da rota atual)
		const canonical =
			doc.value.seo?.canonical
			|| new URL(
				localePath(
					(doc.value.path as string).replace(/^\/posts\/[^/]+/, "/blog"),
				),
				requestURL.origin,
			).toString();

		// JSON-LD Article básico com URL canônica do locale
		useHead({
			link: [{ rel: "canonical", href: canonical }],
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
							"@id": canonical,
						},
					}),
				},
			],
		});
	});

	// Evita exibir conteúdo de rascunho diretamente pela rota
	watchEffect(() => {
		if (pending.value) return;
		if (doc.value && doc.value.draft) {
			throw createError({
				statusCode: 404,
				message: t("errors.postNotFound") as string,
			});
		}
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
		<header class="not-prose mb-6">
			<h1 class="mb-2 text-3xl font-semibold">{{ doc.title }}</h1>
			<p class="mt-0 text-sm text-gray-500">
				{{ formatDate(doc.date as string) }}
			</p>
			<div
				v-if="doc.cover"
				class="mt-4">
				<img
					:src="doc.cover.image"
					:alt="doc.cover.alt"
					class="w-full rounded" />
				<p
					v-if="doc.cover.caption"
					class="mt-1 text-xs text-gray-500">
					{{ doc.cover.caption }}
					<span v-if="doc.cover.credit"> · {{ doc.cover.credit }}</span>
				</p>
			</div>
			<div
				v-if="doc.author"
				class="mt-4 flex items-center gap-3">
				<img
					v-if="doc.author.avatar"
					:src="doc.author.avatar"
					:alt="doc.author.name"
					class="h-10 w-10 rounded-full object-cover" />
				<div>
					<p class="text-sm font-medium">{{ doc.author.name }}</p>
					<p
						v-if="doc.author.bio"
						class="text-xs text-gray-500">
						{{ doc.author.bio }}
					</p>
				</div>
			</div>
		</header>

		<ContentRenderer :value="doc" />

		<footer class="not-prose mt-8 space-y-4">
			<div
				v-if="doc.tags?.length"
				class="flex flex-wrap gap-2">
				<span
					v-for="tag in doc.tags"
					:key="tag"
					class="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
					#{{ tag }}
				</span>
			</div>
			<div
				v-if="doc.categories?.length"
				class="text-sm text-gray-600">
				<strong>Categories:</strong> {{ doc.categories.join(", ") }}
			</div>
			<div
				v-if="doc.series"
				class="text-sm text-gray-600">
				<strong>Series:</strong> {{ doc.series }}
				<span v-if="doc.seriesOrder"> · #{{ doc.seriesOrder }}</span>
			</div>
		</footer>
	</article>
</template>
