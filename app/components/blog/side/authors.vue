<script setup lang="ts">
	// Sidebar card: Authors list with limit and "view all"
	const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const { data: authors } = await useAsyncData(
		() => `side:authors:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const docs = await queryCollection("authors").all();
			return (docs as any[])
				.filter((a: any) =>
					((a?.path as string) || "").startsWith(`/authors/${loc}/`),
				)
				.map((a: any) => {
					const base = (a.path as string) || (a.id as string) || "";
					const last = base.split("/").pop() || "";
					const slug = last.replace(/\.[^/.]+$/, "");
					return { ...a, slug };
				});
		},
		{ watch: [locale] },
	);

	const items = computed(() =>
		((authors.value as any[]) || []).slice(0, props.limit),
	);
</script>

<template>
	<section
		class="mb-6 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="text-sm font-semibold">{{ t("post.author") || "Autores" }}</h3>
			<NuxtLink
				:to="localePath('/blog/authors')"
				class="text-xs text-gray-600 underline-offset-2 hover:underline dark:text-gray-400">
				{{ t("blog.viewAll") || "Ver todos" }}
			</NuxtLink>
		</div>
		<ul class="flex flex-col gap-2">
			<li
				v-for="a in items"
				:key="a.slug || a.name">
				<NuxtLink
					:to="
						localePath({
							name: 'blog-authors-slug',
							params: { slug: a.slug || a.name },
						})
					"
					class="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800">
					<img
						v-if="a.avatar"
						:src="a.avatar"
						:alt="a.name"
						class="h-6 w-6 rounded-full object-cover" />
					<span class="truncate">{{ a.name }}</span>
				</NuxtLink>
			</li>
		</ul>
	</section>
</template>
