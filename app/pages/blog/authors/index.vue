<script setup lang="ts">
	import { useAsyncData, useHead, useSeoMeta } from "nuxt/app";
	import { computed, watchEffect } from "vue";

	import { usePagination } from "~/composables/usePagination";

	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath() as any;

	// SEO básico + alternates i18n
	const title = computed(() => t("post.author"));
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

	const { data: authors } = await useAsyncData(
		() => `authors:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase().split("-")[0];
			const all = (await queryCollection("authors").all()) as any[];
			return all.filter((a: any) =>
				((a?.path as string) || "").startsWith(`/authors/${loc}/`),
			);
		},
		{ watch: [locale] },
	);

	const authorsList = computed(() => {
		const list = (authors.value as any[]) || [];
		if (!q.value) return list;
		const s = q.value.toLowerCase();
		return list.filter(
			(a) =>
				(a.name || "").toLowerCase().includes(s)
				|| (a.bio || "").toLowerCase().includes(s),
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
	} = usePagination(() => authorsList.value, { defaultPerPage: 9 });
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
		return { query, hash: "#authors-list" } as any;
	}

	function authorSlug(a: any) {
		const p = (a?.path as string) || "";
		if (p) return p.replace(/^\/?authors\/[^/]+\//, "");
		return (a?.name || "").toLowerCase().replace(/\s+/g, "-");
	}
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ t("post.author") }}</h1>
		<div
			v-if="(pagedItems || []).length && totalPages > 1"
			class="mb-3 flex flex-wrap items-center justify-between gap-3">
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
			id="authors-list"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogCardAuthor
				v-for="a in pagedItems || []"
				:key="a.name"
				:item="a"
				:to="
					localePath(`/blog/authors/${encodeURIComponent(authorSlug(a))}`)
				" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			{{ t("blog.noResults") }}
		</div>
		<div
			v-if="(pagedItems || []).length && totalPages > 1"
			class="mt-4 flex flex-wrap items-center justify-between gap-3">
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
