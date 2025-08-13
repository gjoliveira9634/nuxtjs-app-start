<script setup lang="ts">
	const { t } = useI18n();
	const localePath = useLocalePath();

	const title = computed(() => t("site.name"));
	const description = computed(() => t("site.tagline"));

	useSeoMeta({
		title,
		description,
		ogTitle: title,
		ogDescription: description,
		ogImage: "/og.jpg",
		twitterCard: "summary_large_image",
	});
</script>

<template>
	<section class="container mx-auto px-4 py-16 text-center">
		<h1 class="text-4xl font-bold tracking-tight">{{ $t("hero.title") }}</h1>
		<p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
			{{ $t("site.tagline") }}
		</p>
		<div class="mt-8 flex justify-center gap-4">
			<NuxtLink
				:to="localePath('/blog')"
				class="rounded bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
				>{{ $t("site.goToBlog") }}</NuxtLink
			>
			<a
				href="https://nuxt.com"
				target="_blank"
				rel="noopener"
				class="rounded border px-5 py-2"
				>{{ $t("site.docs") }}</a
			>
		</div>
	</section>
</template>
