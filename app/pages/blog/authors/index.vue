<script setup lang="ts">
	import { useAsyncData, useHead, useSeoMeta } from "nuxt/app";
	import { computed, watchEffect } from "vue";

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
	const { data: authors } = await useAsyncData(
		() => `authors:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase().split("-")[0];
			// Busca todos e filtra em memória considerando múltiplos campos possíveis
			const all = (await queryCollection("authors").all()) as any[];
			const re = new RegExp(`(^|\\/)authors\\/${loc}\\/`);
			const list = all.filter((a: any) => {
				const candidates = [
					(a as any)?.id,
					(a as any)?._path,
					(a as any)?.path,
					(a as any)?._file,
					(a as any)?._source,
					(a as any)?._id,
				]
					.map((v) => (typeof v === "string" ? v : ""))
					.filter(Boolean);
				return candidates.some((s) => re.test(s));
			});
			return list;
		},
		{ watch: [locale] },
	);

	const authorsList = computed(() => (authors.value as any[]) || []);

	function authorSlug(a: any) {
		const p =
			(a?._path as string) || (a?.path as string) || (a?.id as string) || "";
		if (p)
			return p.replace(/^\/?authors\/[^/]+\//, "").replace(/\.[^/.]+$/, "");
		return (a?.name || "").toLowerCase().replace(/\s+/g, "-");
	}
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ t("post.author") }}</h1>
		<div
			v-if="authorsList.length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogAuthorCard
				v-for="a in authorsList"
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
	</div>
</template>
