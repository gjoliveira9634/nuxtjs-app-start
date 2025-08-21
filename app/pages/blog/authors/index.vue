<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { locale } = useI18n();
	const localePath = useLocalePath();
	const { data: authors } = await useAsyncData(
		() => `authors:${locale.value}`,
		async () => {
			return await queryCollection("authors").all();
		},
		{ watch: [locale] },
	);
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">Autores</h1>
		<div
			v-if="(authors || []).length"
			class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<BlogAuthorCard
				v-for="a in authors || []"
				:key="a.name"
				:item="a"
				:to="localePath(`/blog/authors/${encodeURIComponent(a.name)}`)" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			Nenhum autor encontrado.
		</div>
	</div>
</template>
