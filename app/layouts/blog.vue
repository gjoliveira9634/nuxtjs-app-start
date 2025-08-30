<script setup lang="ts">
	const route = useRoute();
	const router = useRouter();
	const { t, locale, locales } = useI18n();
	const localePath = useLocalePath();
	const switchLocalePath = useSwitchLocalePath() as unknown as (
		code: string,
	) => string;

	// Query helpers
	function updateQuery(next: Record<string, any>) {
		const query = { ...route.query, ...next } as Record<string, any>;
		Object.keys(query).forEach((k) => {
			if (query[k] === "" || query[k] == null) delete query[k];
		});
		router.replace({ query });
	}

	// Search sync
	const q = ref<string>((route.query.q as string) || "");
	watch(
		() => route.query.q,
		(val) => {
			if ((val || "") !== q.value) q.value = (val as string) || "";
		},
	);
	function onSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		const isBlogPost = (route.name?.toString() || "").startsWith(
			"blog-posts-slug",
		);
		if (isBlogPost) {
			// Se estiver em um post individual, redireciona para a listagem de posts
			// preservando a busca digitada no query param `q`.
			const target = localePath("/blog/posts");
			router.replace({ path: target, query: value ? { q: value } : {} });
			return;
		}
		updateQuery({ q: value });
	}

	// Active filters
	const activeCat = computed<string | undefined>(
		() => (route.query.cat as string) || undefined,
	);
	const activeTag = computed<string | undefined>(
		() => (route.query.tag as string) || undefined,
	);

	function clearFilters() {
		updateQuery({ q: undefined, cat: undefined, tag: undefined });
	}

	// Sidebar data now moved into dedicated components under components/blog/side

	// Locale switcher (try to keep equivalent post)
	const availableLocales = computed(() =>
		(locales.value as Array<{ code: string; name?: string }>).map((l) => ({
			code: l.code,
			label: l.name || l.code,
		})),
	);

	async function switchLocale(code: string) {
		if (code === locale.value) return;

		const isBlogPost = (route.name?.toString() || "").startsWith(
			"blog-posts-slug",
		);
		if (isBlogPost) {
			try {
				const currentSlug =
					Array.isArray(route.params.slug) ?
						(route.params.slug as string[]).join("/")
					:	(route.params.slug as string) || "";
				const curLocale = locale.value.toLowerCase();
				const targetLocale = code.toLowerCase();

				// Find current doc to get basename (fetch all, filter in JS to avoid connector differences)
				const allCurrent = await queryCollection("posts").all();
				const currentBase = `/posts/${curLocale}/`;
				const currentCandidates = allCurrent.filter((p: any) =>
					(p?.path as string)?.startsWith(currentBase),
				);
				const currentDoc =
					currentCandidates.find((p: any) => p?.seo?.slug === currentSlug)
					|| currentCandidates.find(
						(p: any) => (p?.path as string) === `${currentBase}${currentSlug}`,
					);
				const baseName =
					((currentDoc?.path as string) || "").replace(/^\/posts\/[^/]+\//, "")
					|| currentSlug;

				// Find target doc with same basename
				const allTarget = await queryCollection("posts").all();
				const targetBase = `/posts/${targetLocale}/`;
				const targetCandidates = allTarget.filter((p: any) =>
					(p?.path as string)?.startsWith(targetBase),
				);
				const targetDoc = targetCandidates.find((p: any) =>
					(p?.path as string)?.endsWith(`/${baseName}`),
				);

				// Compute locale prefix from switchLocalePath once (no navigation yet)
				const baseForLocale = switchLocalePath(code) || "/";
				const prefix = baseForLocale.split("/blog/")[0]; // e.g. '', '/es'

				if (!targetDoc) {
					await router.replace(`${prefix}/blog`);
					return;
				}
				// Usa sempre o basename em inglês do arquivo como slug canônico
				const targetSlug = baseName;
				await router.replace(`${prefix}/blog/posts/${targetSlug}`);
				return;
			} catch (e) {
				// If anything fails while on a post, prefer sending user to the blog home of the target locale
				const baseForLocale = switchLocalePath(code) || "/";
				const prefix = baseForLocale.split("/blog/")[0];
				await router.replace(`${prefix}/blog`);
				return;
			}
		}

		await router.replace(switchLocalePath(code));
	}
</script>

<template>
	<div
		class="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white">
		<header
			class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
			<div class="container mx-auto flex items-center gap-4 px-4 py-3">
				<NuxtLink
					:to="localePath('/')"
					class="text-sm hover:underline"
					>{{ t("site.home") }}</NuxtLink
				>
				<NuxtLink
					:to="localePath('/blog')"
					class="shrink-0 text-lg font-semibold"
					>{{ t("site.blog") }}</NuxtLink
				>
				<div class="relative ml-auto w-full max-w-xl">
					<input
						:value="q"
						:placeholder="t('blog.searchPlaceholder')"
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 text-sm transition outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
						type="search"
						aria-label="Search"
						@input="onSearchInput" />
					<span
						class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
						>Ctrl K</span
					>
				</div>

				<div class="ml-3">
					<NuxtLink
						:to="localePath('/blog/authors')"
						class="underline-offset-2 hover:underline"
						>{{ t("post.author") || "Autores" }}</NuxtLink
					>
					<NuxtLink
						:to="localePath('/blog/series')"
						class="underline-offset-2 hover:underline"
						>{{ t("post.series") }}</NuxtLink
					>
					<NuxtLink
						:to="localePath('/blog/categories')"
						class="underline-offset-2 hover:underline"
						>{{ t("blog.categories") }}</NuxtLink
					>
					<NuxtLink
						:to="localePath('/blog/tags')"
						class="underline-offset-2 hover:underline"
						>{{ t("blog.tags") }}</NuxtLink
					>

					<NuxtLink
						:to="localePath('/blog/posts')"
						class="underline-offset-2 hover:underline"
						>Posts</NuxtLink
					>
					<select
						:value="locale"
						class="rounded border bg-transparent px-2 py-1 text-sm dark:border-gray-700"
						@change="switchLocale(($event.target as HTMLSelectElement).value)">
						<option
							v-for="l in availableLocales"
							:key="l.code"
							:value="l.code"
							>{{ l.label }}</option
						>
					</select>
				</div>
			</div>
		</header>

		<main class="container mx-auto px-4">
			<div class="grid gap-8 md:grid-cols-[1fr_280px]">
				<div>
					<slot />
				</div>
				<aside class="md:sticky md:top-16">
					<div class="mb-4 flex gap-3 text-sm">
						<NuxtLink
							:to="localePath('/blog/authors')"
							class="underline-offset-2 hover:underline"
							>{{ t("post.author") || "Autores" }}</NuxtLink
						>
						<NuxtLink
							:to="localePath('/blog/series')"
							class="underline-offset-2 hover:underline"
							>{{ t("post.series") }}</NuxtLink
						>
						<NuxtLink
							:to="localePath('/blog/categories')"
							class="underline-offset-2 hover:underline"
							>{{ t("blog.categories") }}</NuxtLink
						>
						<NuxtLink
							:to="localePath('/blog/tags')"
							class="underline-offset-2 hover:underline"
							>{{ t("blog.tags") }}</NuxtLink
						>
						<NuxtLink
							:to="localePath('/blog/posts')"
							class="underline-offset-2 hover:underline"
							>Posts</NuxtLink
						>
					</div>
					<div
						class="mb-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
						<span v-if="q">{{ t("blog.search") }}: "{{ q }}"</span>
						<span v-if="activeCat"
							>· {{ t("blog.category") }}: {{ activeCat }}</span
						>
						<span v-if="activeTag"
							>· {{ t("blog.tag") }}: #{{ activeTag }}</span
						>
						<button
							v-if="q || activeCat || activeTag"
							class="ml-auto rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
							@click="clearFilters"
							>{{ t("blog.clearFilters") }}</button
						>
					</div>

					<BlogSideAuthors :limit="10" />
					<BlogSideSeries :limit="10" />
					<BlogSideCategories :limit="10" />
					<BlogSideTags :limit="10" />
					<BlogSidePosts :limit="10" />
				</aside>
			</div>
		</main>

		<footer
			class="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-500 dark:border-gray-800">
			<p>© {{ new Date().getFullYear() }} — {{ t("site.blog") }}</p>
		</footer>
	</div>
</template>
