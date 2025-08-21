<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { locale } = useI18n();
	const localePath = useLocalePath();
	const title = computed(() =>
		decodeURIComponent(route.params.title as string),
	);

	const { data: serie } = await useAsyncData(
		() => `serie:${locale.value}:${title.value}`,
		async () => {
			const all = await queryCollection("series").all();
			return all.find((a: any) => a.title === title.value) || null;
		},
		{ watch: [locale, title] },
	);

	const { data: posts } = await useAsyncData(
		() => `seriePosts:${locale.value}:${title.value}`,
		async () => {
			const list = await queryCollection("posts")
				.where("path", "LIKE", `/posts/${locale.value.toLowerCase()}/%`)
				.order("date", "ASC")
				.all();
			return list
				.filter((p: any) => !p.draft && p.series === title.value)
				.sort(
					(a: any, b: any) => (a.seriesOrder || 9999) - (b.seriesOrder || 9999),
				);
		},
		{ watch: [locale, title] },
	);

	function toBlogPathFromDoc(p: any) {
		const raw =
			p?.seo?.slug || (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/${raw}`);
	}
</script>

<template>
	<div class="py-8">
		<div
			v-if="serie"
			class="mb-6">
			<h1 class="text-2xl font-semibold">{{ serie.title }}</h1>
			<p
				v-if="serie.description"
				class="text-sm text-gray-600 dark:text-gray-400"
				>{{ serie.description }}</p
			>
		</div>

		<ol class="space-y-3">
			<li
				v-for="post in posts || []"
				:key="post.path"
				class="rounded-md border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
				<NuxtLink
					:to="toBlogPathFromDoc(post)"
					class="font-medium hover:underline"
					>{{ post.title }}</NuxtLink
				>
				<span
					v-if="post.seriesOrder"
					class="ml-2 text-xs text-gray-500"
					>#{{ post.seriesOrder }}</span
				>
			</li>
		</ol>
	</div>
</template>
