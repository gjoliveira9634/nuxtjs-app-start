<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const title = computed(() => t("blog.tags"));
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

	const { data: tags } = await useAsyncData(
		() => `tags:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase().split("-")[0];
			const all = (await (queryCollection as any)("tags").all()) as any[];
			return all
				.filter((c: any) =>
					((c?.path as string) || "").startsWith(`/tags/${loc}/`),
				)
				.map((c: any) => ({
					...c,
					slug: (c.path as string).replace(/^\/?tags\/[^/]+\//, ""),
				}));
		},
		{ watch: [locale] },
	);

	const tagsList = computed(() => {
		const list = (tags.value as any[]) || [];
		if (!q.value) return list;
		const s = q.value.toLowerCase();
		return list.filter(
			(c) =>
				(c.name || "").toLowerCase().includes(s)
				|| (c.description || "").toLowerCase().includes(s),
		);
	});

	const { page, totalPages, pagedItems, setPage } = usePagination(
		() => tagsList.value,
		{ defaultPerPage: 12 },
	);
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("blog.tags") }}</h1>
		<div
			v-if="(pagedItems || []).length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogCardTag
				v-for="c in pagedItems || []"
				:key="c.slug || c.name"
				:item="c"
				:to="
					localePath(`/blog/tags/${encodeURIComponent(c.slug || c.name)}`)
				" />
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
