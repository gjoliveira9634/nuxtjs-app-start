<script setup lang="ts">
	import { usePagination } from "~/composables/usePagination";
	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const title = computed(() => `${t("site.blog")} — Posts`);
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

	const { data: posts } = await useAsyncData(
		() => `posts:all:${locale.value}`,
		async () => {
			const all = await queryCollection("posts").all();
			const base = `/posts/${locale.value.toLowerCase()}/`;
			return all
				.filter(
					(p: any) => !p.draft && ((p.path as string) || "").startsWith(base),
				)
				.sort(
					(a: any, b: any) =>
						new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
		},
		{ watch: [locale] },
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

	const {
		page,
		perPage,
		totalItems,
		totalPages,
		pagedItems,
		setPage,
		setPerPage,
	} = usePagination(() => filtered.value, { defaultPerPage: 9 });

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
		return { query, hash: "#posts-list" } as any;
	}

	function toBlogPostPathFromDoc(p: any) {
		// Usa sempre o basename do arquivo (em inglês) como slug canônico
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("site.blog") }}</h1>
		<div
			v-if="(pagedItems || []).length && totalPages > 1"
			class="mb-3 flex flex-wrap items-center justify-between gap-3">
			<div class="text-xs text-gray-600 dark:text-gray-400">
				{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}
			</div>
			<div class="flex items-center gap-3">
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

		<div
			v-if="(pagedItems || []).length"
			id="posts-list"
			class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<BlogCardPost
				v-for="post in pagedItems || []"
				:key="post.path"
				:item="post"
				:to="toBlogPostPathFromDoc(post)" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			{{ $t("blog.noResults") }}
		</div>
		<div
			v-if="(pagedItems || []).length && totalPages > 1"
			class="mt-4 flex flex-wrap items-center justify-between gap-3">
			<div class="text-xs text-gray-600 dark:text-gray-400">
				{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}
			</div>
			<div class="flex items-center gap-3">
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
	</div>
</template>
