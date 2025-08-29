<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	import { usePagination } from "~/composables/usePagination";

	const slug = computed(() => (route.params.slug as string[]).join("/"));

	const { data: serie } = await useAsyncData(
		() => `serie:${locale.value}:${slug.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const all = (await queryCollection("series").all()) as any[];
			const list = all.filter((s: any) =>
				((s?.path as string) || "").startsWith(`/series/${loc}/`),
			);
			const bySlug = list.find((s: any) => (s.path as string).endsWith(`/${slug.value}`));
			if (bySlug) return bySlug as any;
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return list.find(
				(s: any) => s.title?.toLowerCase().replace(/\s+/g, "-") === norm,
			) || null;
		},
		{ watch: [locale, slug] },
	);

	const route2 = useRoute();
	const q = computed(() => (route2.query.q as string) || "");

	const { data: posts } = await useAsyncData(
		() => `seriePosts:${locale.value}:${slug.value}`,
		async () => {
			const all = await queryCollection("posts").all();
			const base = `/posts/${locale.value.toLowerCase()}/`;
			const list = all
				.filter(
					(p: any) => !p.draft && ((p.path as string) || "").startsWith(base),
				)
				.sort(
					(a: any, b: any) =>
						new Date(a.date).getTime() - new Date(b.date).getTime(),
				);
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return list
				.filter((p: any) => {
					if (p.draft) return false;
					if (serie.value?.title) return p.series === serie.value.title;
					return (
						p.series && p.series.toLowerCase().replace(/\s+/g, "-") === norm
					);
				})
				.sort(
					(a: any, b: any) => (a.seriesOrder || 9999) - (b.seriesOrder || 9999),
				);
		},
		{ watch: [locale, slug, serie] },
	);

	const filtered = computed(() => {
		const list = (posts.value as any[]) || [];
		if (!q.value) return list;
		const s = q.value.toLowerCase();
		return list.filter(
			(p) =>
				(p.title || "").toLowerCase().includes(s)
				|| (p.description || "").toLowerCase().includes(s)
				|| (p.excerpt || "").toLowerCase().includes(s)
				|| (p.tags || []).join(" ").toLowerCase().includes(s),
		);
	});

	const { page, perPage, totalItems, totalPages, pagedItems, setPage, setPerPage } = usePagination(
		() => filtered.value,
		{ defaultPerPage: 9 },
	);
	watch(() => perPage.value, (v) => { if (v !== 9) setPerPage(9); }, { immediate: true });
	const showingFrom = computed(() => totalItems.value ? (page.value - 1) * perPage.value + 1 : 0);
	const showingTo = computed(() => Math.min(totalItems.value, page.value * perPage.value));
	function toPage(p: number) {
		const query: Record<string, any> = { ...route.query, page: p };
		return { query, hash: '#series-posts' } as any;
	}

	function toBlogPostPathFromDoc(p: any) {
		// Usa sempre o basename do arquivo (em inglês) como slug canônico
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	const pageTitle = computed(
		() => `${serie.value?.title || slug.value} — ${t("post.series")}`,
	);
	useSeoMeta({ title: pageTitle, ogTitle: pageTitle });
	const i18nHead = useLocaleHead({ addSeoAttributes: true } as any);
	watchEffect(() => {
		const v = (i18nHead as any).value || {};
		useHead({
			htmlAttrs: v.htmlAttrs || {},
			link: v.link || [],
			meta: v.meta || [],
		});
	});
</script>

<template>
	<div class="py-8">
		<div
			v-if="serie"
			class="mb-6">
			<h1 class="text-2xl font-semibold">{{ serie.title }}</h1>
			<p
				v-if="serie.description"
				class="text-sm text-gray-600 dark:text-gray-400"
				>{{ serie.description }}</p
			>
			<!-- Corpo em Markdown da série -->
			<div class="prose dark:prose-invert mx-auto mt-4 max-w-3xl">
				<ContentRenderer :value="serie" />
			</div>
		</div>

		<div class="mb-3 flex flex-wrap items-center justify-between gap-3" v-if="(pagedItems || []).length && totalPages > 1">
			<div class="text-xs text-gray-600 dark:text-gray-400">{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}</div>
			<NuxtPagination :page="page" :total="totalItems" :items-per-page="perPage" :sibling-count="1" show-edges :to="toPage" @update:page="setPage" />
		</div>
		<ol v-if="(pagedItems || []).length" class="space-y-3" id="series-posts">
			<li
			v-for="post in pagedItems || []"
				:key="post.path"
				class="rounded-md border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
				<NuxtLink
					:to="toBlogPostPathFromDoc(post)"
					class="font-medium hover:underline"
					>{{ post.title }}</NuxtLink
				>
				<span
			<!-- Corpo em Markdown da série -->
			<div v-if="serie" class="prose dark:prose-invert mx-auto mt-4 max-w-3xl">
				<ContentRenderer :value="serie" />
			</div>
					v-if="post.seriesOrder"
					class="ml-2 text-xs text-gray-500"
					>#{{ post.seriesOrder }}</span
				>
			</li>
			</ol>
			<div
				v-else
				class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
				{{ $t("blog.noResults") }}
			</div>
			<div class="mt-4 flex flex-wrap items-center justify-between gap-3" v-if="(pagedItems || []).length && totalPages > 1">
				<div class="text-xs text-gray-600 dark:text-gray-400">{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}</div>
				<NuxtPagination :page="page" :total="totalItems" :items-per-page="perPage" :sibling-count="1" show-edges :to="toPage" @update:page="setPage" />
			</div>
	</div>
</template>
