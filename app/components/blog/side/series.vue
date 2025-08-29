<script setup lang="ts">
	// Sidebar card: Series list with limit and view all
	const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const { data: series } = await useAsyncData(
		() => `side:series:${locale.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const list = await queryCollection("series").all();
			return (list as any[])
				.filter((s: any) =>
					((s?.path as string) || "").startsWith(`/series/${loc}/`),
				)
				.map((s: any) => {
					const base = (s.path as string) || (s.id as string) || "";
					const last = base.split("/").pop() || "";
					const slug = last.replace(/\.[^/.]+$/, "");
					return { ...s, slug };
				});
		},
		{ watch: [locale] },
	);

	const items = computed(() =>
		((series.value as any[]) || []).slice(0, props.limit),
	);
</script>

<template>
	<section
		class="mb-6 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="text-sm font-semibold">{{ t("post.series") }}</h3>
			<NuxtLink
				:to="localePath('/blog/series')"
				class="text-xs text-gray-600 underline-offset-2 hover:underline dark:text-gray-400">
				{{ t("blog.viewAll") || "Ver todos" }}
			</NuxtLink>
		</div>
		<ul class="flex flex-col gap-2">
			<li
				v-for="s in items"
				:key="s.slug || s.title">
				<NuxtLink
					:to="
						localePath({
							name: 'blog-series-slug',
							params: { slug: s.slug || s.title },
						})
					"
					class="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800">
					<span class="truncate">{{ s.title || s.name }}</span>
				</NuxtLink>
			</li>
		</ul>
	</section>
</template>
