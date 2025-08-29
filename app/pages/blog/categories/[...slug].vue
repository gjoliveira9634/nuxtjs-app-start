<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	import { usePagination } from "~/composables/usePagination";

	const slug = computed(() => (route.params.slug as string[]).join("/"));

	const { data: category } = await useAsyncData(
		() => `category:${locale.value}:${slug.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const all = (await queryCollection("categories").all()) as any[];
			const list = all.filter((c: any) =>
				((c?.path as string) || "").startsWith(`/categories/${loc}/`),
			);
			const bySlug = list.find((c: any) =>
				(c.path as string).endsWith(`/${slug.value}`),
			);
			if (bySlug) return bySlug as any;
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return (
				list.find(
					(c: any) => c.name?.toLowerCase().replace(/\s+/g, "-") === norm,
				) || null
			);
		},
		{ watch: [locale, slug] },
	);

	const route2 = useRoute();
	const q = computed(() => (route2.query.q as string) || "");

	const { data: posts } = await useAsyncData(
		() => `categoryPosts:${locale.value}:${slug.value}`,
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
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return list.filter((p: any) => {
				if (p.draft) return false;
				const cats = (p.categories || []) as string[];
				const asSlug = cats.map((x) => x.toLowerCase().replace(/\s+/g, "-"));
				return cats.includes(slug.value) || asSlug.includes(norm);
			});
		},
		{ watch: [locale, slug] },
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

	const {
		page,
		perPage,
		totalItems,
		totalPages,
		pagedItems,
		setPage,
		setPerPage,
	} = usePagination(() => filtered.value, { defaultPerPage: 9 });
	watch(
		() => perPage.value,
		(v) => {
			if (v !== 9) setPerPage(9);
		},
		{ immediate: true },
	);
	const showingFrom = computed(() =>
		totalItems.value ? (page.value - 1) * perPage.value + 1 : 0,
	);
	const showingTo = computed(() =>
		Math.min(totalItems.value, page.value * perPage.value),
	);
	function toPage(p: number) {
		const query: Record<string, any> = { ...route.query, page: p };
		return { query, hash: "#category-posts" } as any;
	}

	function toBlogPostPathFromDoc(p: any) {
		// Usa sempre o basename do arquivo (em inglês) como slug canônico
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	const pageTitle = computed(
		() => `${category.value?.name || slug.value} — ${t("blog.categories")}`,
	);
	useSeoMeta({ title: pageTitle, ogTitle: pageTitle });
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
		<div class="mb-6">
			<h1 class="text-2xl font-semibold">{{
				(category && category.name) || slug
			}}</h1>
			<p
				v-if="category?.description"
				class="text-sm text-gray-600 dark:text-gray-400"
				>{{ category.description }}</p
			>
		</div>

		<!-- Corpo em Markdown da categoria -->
		<div
			v-if="category"
			class="prose dark:prose-invert mx-auto mb-8 max-w-3xl">
			<ContentRenderer :value="category" />
		</div>

		<div
			class="mb-3 flex flex-wrap items-center justify-between gap-3"
			v-if="(pagedItems || []).length && totalPages > 1">
			<div class="text-xs text-gray-600 dark:text-gray-400"
				>{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}</div
			>
			<NuxtPagination
				:page="page"
				:total="totalItems"
				:items-per-page="perPage"
				:sibling-count="1"
				show-edges
				:to="toPage"
				@update:page="setPage" />
		</div>
		<div
			v-if="(pagedItems || []).length"
			class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
			id="category-posts">
			<BlogCardPost
				v-for="post in pagedItems || []"
				:key="post.path"
				:item="post"
				:to="toBlogPostPathFromDoc(post)" />
		</div>
		<div
			v-else
			class="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
			{{ $t("blog.noResults") }}
		</div>
		<div
			class="mt-4 flex flex-wrap items-center justify-between gap-3"
			v-if="(pagedItems || []).length && totalPages > 1">
			<div class="text-xs text-gray-600 dark:text-gray-400"
				>{{ showingFrom }}–{{ showingTo }} / {{ totalItems }}</div
			>
			<NuxtPagination
				:page="page"
				:total="totalItems"
				:items-per-page="perPage"
				:sibling-count="1"
				show-edges
				:to="toPage"
				@update:page="setPage" />
		</div>
	</div>
</template>
