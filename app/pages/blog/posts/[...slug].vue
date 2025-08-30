<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const router = useRouter();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	const requestURL = useRequestURL();

	// Flag para transições de rota/idioma a fim de evitar 404 durante trocas
	const isNavigating = ref(false);
	if (import.meta.client) {
		// Marca início da troca de rota
		onBeforeRouteUpdate(() => {
			isNavigating.value = true;
		});
		// Desmarca ao finalizar
		const removeAfterEach = router.afterEach(() => {
			isNavigating.value = false;
		});
		onUnmounted(() => {
			removeAfterEach && removeAfterEach();
		});
	}

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
			// Estratégia robusta: carrega todos os posts e filtra por locale + path/slug em memória
			const slug = (route.params.slug as string[]).join("/");
			const localeLower = locale.value.toLowerCase();
			const base = `/posts/${localeLower}/`;
			const posts = await queryCollection("posts").all();
			// Restringe àquele locale
			const candidates = posts.filter((p: any) =>
				(p?.path as string)?.startsWith(base),
			);
			// 1) Match por path exato (não tem extensão no path)
			const byPath = candidates.find((p: any) => p.path === `${base}${slug}`);
			if (byPath) return byPath;
			// 2) Match por seo.slug (fallback)
			const bySlug = candidates.find((p: any) => p?.seo?.slug === slug);
			if (bySlug) return bySlug;
			// 3) Último recurso: nome do arquivo (parte final do path)
			const byFile = candidates.find(
				(p: any) => (p.path as string).split("/").pop() === slug,
			);
			return byFile || null;
		},
		{ watch: [path] },
	);

	// Carrega posts relacionados, se definidos no frontmatter (relatedPosts)
	const { data: related } = await useAsyncData(
		() => `post:related:${locale.value}:${doc.value?.path || "none"}`,
		async () => {
			if (!doc.value?.relatedPosts?.length) return [] as any[];
			const localeLower = locale.value.toLowerCase();
			const base = `/posts/${localeLower}/`;
			const slugs = (doc.value.relatedPosts as string[]) || [];
			const posts = await queryCollection("posts").all();
			const candidates = posts.filter((p: any) =>
				(p?.path as string)?.startsWith(base),
			);
			const items = slugs
				.map(
					(s) =>
						candidates.find((p: any) => p.path === `${base}${s}`)
						|| candidates.find((p: any) => p?.seo?.slug === s),
				)
				.filter(Boolean) as any[];
			return items.filter((p: any) => !p.draft);
		},
		{ watch: [doc, locale] },
	);

	function toRelatedBlogPath(p: any) {
		// Usa sempre o basename do arquivo (em inglês) como slug canônico
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	watchEffect(() => {
		// Aguarda a busca terminar antes de decidir 404
		if (pending.value || isNavigating.value) return;
		if (!doc.value) {
			// Redireciona de forma suave para a listagem no mesmo locale se não encontrar
			navigateTo(localePath("/blog"), { replace: true });
			return;
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
					(doc.value.path as string).replace(/^\/posts\/[^/]+/, "/blog/posts"),
				),
				requestURL.origin,
			).toString();

		// JSON-LD Article + BreadcrumbList com URL canônica do locale
		const scripts = [] as any[];
		scripts.push({
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "Article",
				"headline": doc.value.title,
				"datePublished": doc.value.date,
				"image": doc.value.cover?.image,
				"author":
					doc.value.author ?
						{
							"@type": "Person",
							"name": doc.value.author.name,
							"sameAs": [
								doc.value.author.social?.twitter,
								doc.value.author.social?.github,
								doc.value.author.social?.linkedin,
								doc.value.author.social?.website,
							].filter(Boolean),
						}
					:	undefined,
				"mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
			}),
		});

		const homeUrl = new URL(localePath("/"), requestURL.origin).toString();
		const blogUrl = new URL(localePath("/blog"), requestURL.origin).toString();
		const thisUrl = canonical;
		scripts.push({
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				"itemListElement": [
					{
						"@type": "ListItem",
						"position": 1,
						"name": t("site.home"),
						"item": homeUrl,
					},
					{
						"@type": "ListItem",
						"position": 2,
						"name": t("site.blog"),
						"item": blogUrl,
					},
					{
						"@type": "ListItem",
						"position": 3,
						"name": doc.value.title,
						"item": thisUrl,
					},
				],
			}),
		});

		useHead({ link: [{ rel: "canonical", href: canonical }], script: scripts });
	});

	// Evita exibir conteúdo de rascunho diretamente pela rota
	watchEffect(() => {
		if (pending.value) return;
		if (isNavigating.value) return;
		if (doc.value && doc.value.draft) {
			// Evita exibir rascunho: envia para listagem
			navigateTo(localePath("/blog"), { replace: true });
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

	// Visual helpers
	function tagColor(tag: string) {
		let hash = 0;
		for (let i = 0; i < tag.length; i++)
			hash = (hash << 5) - hash + tag.charCodeAt(i);
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue} 70% 45%)`;
	}

	function toTagLink(tag: string) {
		return `${localePath("/blog")}?tag=${encodeURIComponent(tag)}`;
	}
	function toCatLink(cat: string) {
		return `${localePath("/blog")}?cat=${encodeURIComponent(cat)}`;
	}

	// Prev/Next within locale
	const { data: neighbors } = await useAsyncData(
		() => `post:neighbors:${locale.value}:${path.value}`,
		async () => {
			const localeLower = locale.value.toLowerCase();
			const base = `/posts/${localeLower}/`;
			const posts = await queryCollection("posts").all();
			const list = posts
				.filter((p: any) => (p?.path as string)?.startsWith(base) && !p.draft)
				.sort(
					(a: any, b: any) =>
						new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
			const currentSlug = (route.params.slug as string[]).join("/");
			const idx = list.findIndex(
				(p: any) =>
					p.path === path.value
					|| (p.path as string).endsWith(`/${currentSlug}`),
			);
			return {
				prev: idx > 0 ? list[idx - 1] : null,
				next: idx >= 0 && idx + 1 < list.length ? list[idx + 1] : null,
			};
		},
		{ watch: [locale, path] },
	);
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
					<NuxtLink
						:to="
							localePath(`/blog/authors/${encodeURIComponent(doc.author.name)}`)
						"
						class="text-sm font-medium underline-offset-2 hover:underline"
						>{{ doc.author.name }}</NuxtLink
					>
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
				<NuxtLink
					v-for="tag in doc.tags"
					:key="tag"
					class="rounded px-2 py-1 text-xs font-medium text-white"
					:style="{ backgroundColor: tagColor(tag) }"
					:to="toTagLink(tag)">
					#{{ tag }}
				</NuxtLink>
			</div>
			<div
				v-if="doc.categories?.length"
				class="text-sm text-gray-600">
				<strong>{{ $t("post.categories") }}:</strong>
				<span class="inline-flex flex-wrap gap-2">
					<NuxtLink
						v-for="c in doc.categories"
						:key="c"
						:to="toCatLink(c)"
						class="underline-offset-2 hover:underline"
						>{{ c }}</NuxtLink
					>
				</span>
			</div>
			<div
				v-if="doc.series"
				class="text-sm text-gray-600">
				<strong>{{ $t("post.series") }}:</strong>
				<NuxtLink
					:to="localePath(`/blog/series/${encodeURIComponent(doc.series)}`)"
					class="underline-offset-2 hover:underline"
					>{{ doc.series }}</NuxtLink
				>
				<span v-if="doc.seriesOrder"> · #{{ doc.seriesOrder }}</span>
			</div>

			<div
				v-if="related?.length"
				class="mt-8">
				<h2 class="mb-4 text-lg font-semibold">{{ $t("post.related") }}</h2>
				<div class="grid gap-6 sm:grid-cols-2">
					<article
						v-for="p in related"
						:key="p.path"
						class="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900">
						<NuxtLink
							:to="toRelatedBlogPath(p)"
							class="block">
							<div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
								<img
									v-if="p.cover?.image"
									:src="p.cover.image"
									:alt="p.cover?.alt || p.title"
									class="h-full w-full object-cover" />
							</div>
							<div class="p-4">
								<h3 class="line-clamp-2 text-base font-semibold">
									{{ p.title || p.path.split("/").pop() }}
								</h3>
								<p class="mt-1 text-xs text-gray-500">
									{{ p.date ? formatDate(p.date) : "" }}
								</p>
								<p
									v-if="p.excerpt || p.description"
									class="mt-2 line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
									{{ p.excerpt || p.description }}
								</p>
							</div>
						</NuxtLink>
					</article>
				</div>
			</div>

			<!-- Prev / Next navigation -->
			<div class="mt-8 flex gap-3">
				<NuxtLink
					v-if="neighbors?.prev"
					:to="toRelatedBlogPath(neighbors.prev)"
					class="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
					← {{ neighbors.prev.title || neighbors.prev.path.split("/").pop() }}
				</NuxtLink>
				<NuxtLink
					v-if="neighbors?.next"
					:to="toRelatedBlogPath(neighbors.next)"
					class="ml-auto rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
					{{ neighbors.next.title || neighbors.next.path.split("/").pop() }} →
				</NuxtLink>
			</div>
		</footer>
	</article>
</template>
