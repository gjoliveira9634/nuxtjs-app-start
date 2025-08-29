<script setup lang="ts">
	// Sidebar card: Recent posts list with limit and view all
	const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const { data: posts } = await useAsyncData(
		() => `side:posts:${locale.value}`,
		async () => {
			const all = await queryCollection("posts").all();
			const base = `/posts/${locale.value.toLowerCase()}/`;
			return all
				.filter(
					(p: any) => ((p.path as string) || "").startsWith(base) && !p.draft,
				)
				.sort(
					(a: any, b: any) =>
						new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
		},
		{ watch: [locale] },
	);

	function toBlogPostPathFromDoc(p: any) {
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath({ name: "blog-posts-slug", params: { slug: raw } });
	}

	const items = computed(() =>
		((posts.value as any[]) || []).slice(0, props.limit),
	);
</script>

<template>
	<section
		class="mb-6 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="text-sm font-semibold">Posts</h3>
			<NuxtLink
				:to="localePath('/blog/posts')"
				class="text-xs text-gray-600 underline-offset-2 hover:underline dark:text-gray-400">
				{{ t("blog.viewAll") || "Ver todos" }}
			</NuxtLink>
		</div>
		<ul class="flex flex-col gap-2">
			<li
				v-for="p in items"
				:key="p.path">
				<NuxtLink
					:to="toBlogPostPathFromDoc(p)"
					class="block rounded px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800">
					<span class="line-clamp-2">{{
						p.title || (p.path || "").split("/").pop()
					}}</span>
				</NuxtLink>
			</li>
		</ul>
	</section>
</template>
