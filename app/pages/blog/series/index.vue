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
			const loc = locale.value.toLowerCase().split("-")[0];
			// Filtra em memória considerando múltiplos campos possíveis
			const all = (await queryCollection("series").all()) as any[];
			const re = new RegExp(`(^|\\/)series\\/${loc}\\/`);
			const list = all.filter((s: any) => {
				const candidates = [
					(s as any)?.id,
					(s as any)?._path,
					(s as any)?.path,
					(s as any)?._file,
					(s as any)?._source,
					(s as any)?._id,
				]
					.map((v) => (typeof v === "string" ? v : ""))
					.filter(Boolean);
				return candidates.some((str) => re.test(str));
			});
			return list;
		},
		{ watch: [locale] },
	);

	const seriesList = computed(() => (series.value as any[]) || []);

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
			v-if="seriesList.length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogSeriesCard
				v-for="s in seriesList"
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
