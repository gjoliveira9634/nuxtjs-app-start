<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

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

	const { data: categories } = await useAsyncData(
		() => `categories:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase().split("-")[0];
			// Filtra em memória considerando múltiplos campos possíveis
			const all = (await queryCollection("categories").all()) as any[];
			const re = new RegExp(`(^|\\/)categories\\/${loc}\\/`);
			const list = all.filter((c: any) => {
				const candidates = [
					(c as any)?.id,
					(c as any)?._path,
					(c as any)?.path,
					(c as any)?._file,
					(c as any)?._source,
					(c as any)?._id,
				]
					.map((v) => (typeof v === "string" ? v : ""))
					.filter(Boolean);
				return candidates.some((str) => re.test(str));
			});
			return list.map((c: any) => {
				const base = (c.id as string) || (c.path as string) || "";
				return {
					...c,
					slug: base
						.replace(/^\/?categories\/[^/]+\//, "")
						.replace(/\.[^/.]+$/, ""),
				};
			});
		},
		{ watch: [locale] },
	);

	const categoriesList = computed(() => (categories.value as any[]) || []);
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("blog.categories") }}</h1>
		<div
			v-if="categoriesList.length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogCategoryCard
				v-for="c in categoriesList"
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
	</div>
</template>
