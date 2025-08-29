<script setup lang="ts">
	// Sidebar card: Tags cloud with limit and link to view all
	const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const { data: tagCloud } = await useAsyncData(
		() => `side:tagCloud:${locale.value}`,
		async () => {
			const posts = await queryCollection("posts").all();
			const base = `/posts/${locale.value.toLowerCase()}/`;
			const scoped = posts.filter(
				(p: any) => ((p.path as string) || "").startsWith(base) && !p.draft,
			);
			const freq = new Map<string, number>();
			for (const p of scoped) {
				for (const tag of (p.tags as string[]) || [])
					freq.set(tag, (freq.get(tag) || 0) + 1);
			}
			return Array.from(freq.entries())
				.sort((a, b) => b[1] - a[1])
				.map(([tag, count]) => ({ tag, count }));
		},
		{ watch: [locale] },
	);

	function tagColor(tag: string) {
		let hash = 0;
		for (let i = 0; i < tag.length; i++)
			hash = (hash << 5) - hash + tag.charCodeAt(i);
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue} 70% 45%)`;
	}

	const items = computed(() =>
		((tagCloud.value as any[]) || []).slice(0, props.limit),
	);
</script>

<template>
	<section
		class="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="text-sm font-semibold">{{ t("blog.tags") }}</h3>
			<NuxtLink
				:to="localePath('/blog/tags')"
				class="text-xs text-gray-600 underline-offset-2 hover:underline dark:text-gray-400">
				{{ t("blog.viewAll") || "Ver todos" }}
			</NuxtLink>
		</div>
		<div class="flex flex-wrap gap-2">
			<NuxtLink
				v-for="item in items || []"
				:key="item.tag"
				:to="localePath({ name: 'blog-tags-slug', params: { slug: item.tag } })"
				class="rounded px-2 py-1 text-xs text-white hover:opacity-90"
				:style="{ backgroundColor: tagColor(item.tag) }"
				:title="`${item.count} ${t('blog.occurrences')}`">
				#{{ item.tag }}
			</NuxtLink>
		</div>
	</section>
</template>
