<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	import { usePagination } from "~/composables/usePagination";

	const slug = computed(() => (route.params.slug as string[]).join("/"));

	// Autor a partir de arquivos .md em /authors/<locale>/*.md
	const { data: author } = await useAsyncData(
		() => `author:${locale.value}:${slug.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const all = (await queryCollection("authors").all()) as any[];
			const list = all.filter((a: any) =>
				((a?.path as string) || "").startsWith(`/authors/${loc}/`),
			);
			const byPath = list.find((a: any) =>
				(a.path as string).endsWith(`/${slug.value}`),
			);
			if (byPath) return byPath;
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return (
				list.find(
					(a: any) => a.name?.toLowerCase().replace(/\s+/g, "-") === norm,
				) || null
			);
		},
		{ watch: [locale, slug] },
	);

	// Posts do autor no locale atual
	const route2 = useRoute();
	const q = computed(() => (route2.query.q as string) || "");

	const { data: posts } = await useAsyncData(
		() => `authorPosts:${locale.value}:${slug.value}`,
		async () => {
			const all = await queryCollection("posts").all();
			const base = `/posts/${locale.value.toLowerCase()}/`;
			const list = all
				.filter(
					(p: any) => !p.draft && ((p.path as string) || "").startsWith(base),
				)
				.sort(
					(a: any, b: any) =>
						new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
			if (author.value?.name) {
				return list.filter((p: any) => p.author?.name === author.value.name);
			}
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return list.filter(
				(p: any) =>
					p.author?.name
					&& p.author.name.toLowerCase().replace(/\s+/g, "-") === norm,
			);
		},
		{ watch: [locale, slug, author] },
	);

	const filtered = computed(() => {
		const list = (posts.value as any[]) || [];
		if (!q.value) return list;
		const s = q.value.toLowerCase();
		return list.filter(
			(p) =>
				(p.title || "").toLowerCase().includes(s)
				|| (p.description || "").toLowerCase().includes(s)
				|| (p.excerpt || "").toLowerCase().includes(s)
				|| (p.tags || []).join(" ").toLowerCase().includes(s),
		);
	});

	const { page, totalPages, pagedItems, setPage } = usePagination(
		() => filtered.value,
		{ defaultPerPage: 12 },
	);

	function toBlogPostPathFromDoc(p: any) {
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	const title = computed(
		() => `${author.value?.name || slug.value} — ${t("post.author")}`,
	);
	useSeoMeta({ title, ogTitle: title });
	const i18nHead = useLocaleHead({ addSeoAttributes: true } as any);
	watchEffect(() => {
		const v = (i18nHead as any).value || {};
		useHead({
			htmlAttrs: v.htmlAttrs || {},
			link: v.link || [],
			meta: v.meta || [],
		});
	});
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

		<!-- Corpo em Markdown do autor -->
		<div
			v-if="author"
			class="prose dark:prose-invert mx-auto mb-8 max-w-3xl">
			<ContentRenderer :value="author" />
		</div>

		<div
			v-if="(pagedItems || []).length"
			class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<article
				v-for="post in pagedItems || []"
				:key="post.path"
				class="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900">
				<NuxtLink
					:to="toBlogPostPathFromDoc(post)"
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
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			{{ $t("blog.noResults") }}
		</div>
		<BlogPagination
			v-if="(pagedItems || []).length"
			:page="page"
			:total-pages="totalPages"
			@update:page="setPage" />
	</div>
</template>
