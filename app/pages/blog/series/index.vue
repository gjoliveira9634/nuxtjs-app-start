<script setup lang="ts">
	import { useAsyncData, useHead, useSeoMeta } from "nuxt/app";
	import { computed, watchEffect } from "vue";

	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath() as any;

	const title = computed(() => t("post.series"));
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
	const { data: series } = await useAsyncData(
		() => `series:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const all = (await queryCollection("series").all()) as any[];
			return all.filter((s: any) => {
				const p = (s?.id as string) || (s?.path as string) || "";
				return p.replace(/^\//, "").startsWith(`series/${loc}/`);
			});
		},
		{ watch: [locale] },
	);

	function seriesSlug(s: any) {
		const p = (s?.id as string) || (s?.path as string) || "";
		if (p) return p.replace(/^\/?series\/[^/]+\//, "").replace(/\.[^/.]+$/, "");
		return (s?.title || "").toLowerCase().replace(/\s+/g, "-");
	}
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ t("post.series") }}</h1>
		<div
			v-if="(series || []).length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogSeriesCard
				v-for="s in series || []"
				:key="s.title"
				:item="s"
				:to="localePath(`/blog/series/${encodeURIComponent(seriesSlug(s))}`)" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			{{ t("blog.noResults") }}
		</div>
	</div>
</template>
