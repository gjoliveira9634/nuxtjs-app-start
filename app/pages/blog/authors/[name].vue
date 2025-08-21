<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { locale } = useI18n();
	const localePath = useLocalePath();
	const name = computed(() => decodeURIComponent(route.params.name as string));
	const { data: author } = await useAsyncData(
		() => `author:${locale.value}:${name.value}`,
		async () => {
			const all = await queryCollection("authors").all();
			return all.find((a: any) => a.name === name.value) || null;
		},
		{ watch: [locale, name] },
	);

	const { data: posts } = await useAsyncData(
		() => `authorPosts:${locale.value}:${name.value}`,
		async () => {
			const list = await queryCollection("posts")
				.where("path", "LIKE", `/posts/${locale.value.toLowerCase()}/%`)
				.order("date", "DESC")
				.all();
			return list.filter((p: any) => !p.draft && p.author?.name === name.value);
		},
		{ watch: [locale, name] },
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
			v-if="author"
			class="mb-6 flex items-center gap-3">
			<img
				v-if="author.avatar"
				:src="author.avatar"
				:alt="author.name"
				class="h-16 w-16 rounded-full object-cover" />
			<div>
				<h1 class="text-2xl font-semibold">{{ author.name }}</h1>
				<p
					v-if="author.bio"
					class="text-sm text-gray-600 dark:text-gray-400"
					>{{ author.bio }}</p
				>
			</div>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<article
				v-for="post in posts || []"
				:key="post.path"
				class="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900">
				<NuxtLink
					:to="toBlogPathFromDoc(post)"
					class="block">
					<div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
						<img
							v-if="post.cover?.image"
							:src="post.cover.image"
							:alt="post.cover?.alt || post.title"
							class="h-full w-full object-cover" />
					</div>
					<div class="p-4">
						<h3 class="line-clamp-2 text-base font-semibold">{{
							post.title
						}}</h3>
						<p
							v-if="post.excerpt || post.description"
							class="mt-2 line-clamp-3 text-sm text-gray-700 dark:text-gray-300"
							>{{ post.excerpt || post.description }}</p
						>
					</div>
				</NuxtLink>
			</article>
		</div>
	</div>
</template>
