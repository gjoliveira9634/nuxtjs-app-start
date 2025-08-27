<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	import { usePagination } from "~/composables/usePagination";

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

	const { page, totalPages, pagedItems, setPage } = usePagination(
		() => filtered.value,
		{ defaultPerPage: 12 },
	);

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
			v-if="(pagedItems || []).length"
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
		<BlogPagination
			v-if="(pagedItems || []).length"
			:page="page"
			:total-pages="totalPages"
			@update:page="setPage" />
	</div>
</template>
