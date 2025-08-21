<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { locale } = useI18n();
	const localePath = useLocalePath();
	const { data: series } = await useAsyncData(
		() => `series:${locale.value}`,
		async () => {
			return await queryCollection("series").all();
		},
		{ watch: [locale] },
	);
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">Séries</h1>
		<div
			v-if="(series || []).length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogSeriesCard
				v-for="s in series || []"
				:key="s.title"
				:item="s"
				:to="localePath(`/blog/series/${encodeURIComponent(s.title)}`)" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			Nenhuma série encontrada.
		</div>
	</div>
</template>
