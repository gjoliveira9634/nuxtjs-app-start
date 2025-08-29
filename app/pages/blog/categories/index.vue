<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	import { usePagination } from "~/composables/usePagination";

	const title = computed(() => t("blog.categories"));
	const description = computed(() => t("site.tagline"));
	useSeoMeta({
		title,
		description,
		ogTitle: title,
		ogDescription: description,
		twitterCard: "summary_large_image",
		ogImage: "/og.jpg",
	});

	const i18nHead = useLocaleHead({ addSeoAttributes: true } as any);
	watchEffect(() => {
		const v = (i18nHead as any).value || {};
		useHead({
			htmlAttrs: v.htmlAttrs || {},
			link: v.link || [],
			meta: v.meta || [],
		});
	});

	const route = useRoute();
	const q = computed(() => (route.query.q as string) || "");

	const { data: categories } = await useAsyncData(
		() => `categories:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase().split("-")[0];
			const all = (await queryCollection("categories").all()) as any[];
			return all
				.filter((c: any) =>
					((c?.path as string) || "").startsWith(`/categories/${loc}/`),
				)
				.map((c: any) => ({
					...c,
					slug: (c.path as string).replace(/^\/?categories\/[^/]+\//, ""),
				}));
		},
		{ watch: [locale] },
	);

	const categoriesList = computed(() => {
		const list = (categories.value as any[]) || [];
		if (!q.value) return list;
		const s = q.value.toLowerCase();
		return list.filter(
			(c) =>
				(c.name || "").toLowerCase().includes(s)
				|| (c.description || "").toLowerCase().includes(s),
		);
	});

	const {
		page,
		perPage,
		totalItems,
		totalPages,
		pagedItems,
		setPage,
		setPerPage,
	} = usePagination(() => categoriesList.value, { defaultPerPage: 9 });

	// Enforce 9 items per page always
	watch(
		() => perPage.value,
		(v) => {
			if (v !== 9) setPerPage(9);
		},
		{ immediate: true },
	);

	const showingFrom = computed(() =>
		totalItems.value ? (page.value - 1) * perPage.value + 1 : 0,
	);
	const showingTo = computed(() =>
		Math.min(totalItems.value, page.value * perPage.value),
	);

	function toPage(p: number) {
		const query: Record<string, any> = { ...route.query, page: p };
		return { query, hash: "#categories-list" } as any;
	}
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("blog.categories") }}</h1>
		<div
			class="mb-3 flex flex-wrap items-center justify-between gap-3"
			v-if="(pagedItems || []).length && totalPages > 1">
			<div class="text-xs text-gray-600 dark:text-gray-400"
				>{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}</div
			>
			<NuxtPagination
				:page="page"
				:total="totalItems"
				:items-per-page="perPage"
				:sibling-count="1"
				show-edges
				:to="toPage"
				@update:page="setPage" />
		</div>
		<div
			v-if="(pagedItems || []).length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
			id="categories-list">
			<BlogCardCategory
				v-for="c in pagedItems || []"
				:key="c.slug || c.name"
				:item="c"
				:to="
					localePath(`/blog/categories/${encodeURIComponent(c.slug || c.name)}`)
				" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			{{ $t("blog.noResults") }}
		</div>
		<div
			class="mt-4 flex flex-wrap items-center justify-between gap-3"
			v-if="(pagedItems || []).length && totalPages > 1">
			<div class="text-xs text-gray-600 dark:text-gray-400"
				>{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}</div
			>
			<NuxtPagination
				:page="page"
				:total="totalItems"
				:items-per-page="perPage"
				:sibling-count="1"
				show-edges
				:to="toPage"
				@update:page="setPage" />
		</div>
	</div>
</template>
