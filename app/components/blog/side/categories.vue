<script setup lang="ts">
	// Sidebar card: Categories with limit and "view all"
	const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const { data: categories } = await useAsyncData(
		() => `side:categories:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const list = await queryCollection("categories").all();
			return (list as any[])
				.filter((c: any) =>
					((c?.path as string) || "").startsWith(`/categories/${loc}/`),
				)
				.map((c: any) => {
					const base = (c.path as string) || (c.id as string) || "";
					const last = base.split("/").pop() || "";
					const slug = last.replace(/\.[^/.]+$/, "");
					return { ...c, slug };
				});
		},
		{ watch: [locale] },
	);

	const items = computed(() =>
		((categories.value as any[]) || []).slice(0, props.limit),
	);
</script>

<template>
	<section
		class="mb-6 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="text-sm font-semibold">{{ t("blog.categories") }}</h3>
			<NuxtLink
				:to="localePath('/blog/categories')"
				class="text-xs text-gray-600 underline-offset-2 hover:underline dark:text-gray-400">
				{{ t("blog.viewAll") || "Ver todos" }}
			</NuxtLink>
		</div>
		<ul class="flex flex-col gap-2">
			<li
				v-for="c in items"
				:key="c.slug || c.name">
				<NuxtLink
					:to="
						localePath({
							name: 'blog-categories-slug',
							params: { slug: c.slug || c.name },
						})
					"
					class="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800">
					<span
						class="inline-block h-2 w-2 rounded-full"
						:style="{ backgroundColor: c.color || '#6b7280' }" />
					<span class="truncate">{{ c.name }}</span>
				</NuxtLink>
			</li>
		</ul>
	</section>
</template>
