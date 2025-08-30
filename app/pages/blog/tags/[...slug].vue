<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const slug = computed(() => (route.params.slug as string[]).join("/"));

	const { data: tag } = await useAsyncData(
		() => `tag:${locale.value}:${slug.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const all = (await (queryCollection as any)("tags").all()) as any[];
			const list = all.filter((c: any) =>
				((c?.path as string) || "").startsWith(`/tags/${loc}/`),
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
		() => `tagPosts:${locale.value}:${slug.value}`,
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
				const tgs = (p.tags || []) as string[];
				const asSlug = tgs.map((x) => x.toLowerCase().replace(/\s+/g, "-"));
				return tgs.includes(slug.value) || asSlug.includes(norm);
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
		return { query, hash: "#tag-posts" } as any;
	}

	function toBlogPostPathFromDoc(p: any) {
		// Usa sempre o basename do arquivo (em inglês) como slug canônico
		const raw = (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	const pageTitle = computed(
		() => `${tag.value?.name || slug.value} — ${t("blog.tags")}`,
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
			<h1 class="text-2xl font-semibold">{{ (tag && tag.name) || slug }}</h1>
			<p
				v-if="tag?.description"
				class="text-sm text-gray-600 dark:text-gray-400"
				>{{ tag.description }}</p
			>
		</div>

		<!-- Corpo em Markdown da tag -->
		<div
			v-if="tag"
			class="prose dark:prose-invert mx-auto mb-8 max-w-3xl">
			<ContentRenderer :value="tag" />
		</div>

		<div
			v-if="(pagedItems || []).length && totalPages > 1"
			class="mb-3 flex flex-wrap items-center justify-between gap-3">
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
			id="tag-posts"
			class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
			v-if="(pagedItems || []).length && totalPages > 1"
			class="mt-4 flex flex-wrap items-center justify-between gap-3">
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
