<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	const route = useRoute();

	const title = computed(() => t("site.blog"));
	const description = computed(() => t("site.tagline"));
	useSeoMeta({
		title,
		description,
		ogTitle: title,
		ogDescription: description,
		twitterCard: "summary_large_image",
		twitterSite: "@nuxt_js",
		ogImage: "/og.jpg",
	});

	// i18n SEO alternates
	const i18nHead = useLocaleHead({ addSeoAttributes: true } as any);
	watchEffect(() => {
		const v = (i18nHead as any).value || {};
		useHead({
			htmlAttrs: v.htmlAttrs || {},
			link: v.link || [],
			meta: v.meta || [],
		});
	});

	// Query params
	const q = computed(() => (route.query.q as string) || "");
	const cat = computed(() => (route.query.cat as string) || "");
	const tag = computed(() => (route.query.tag as string) || "");

	const { data: posts } = await useAsyncData(
		() => `posts:list:${locale.value}`,
		async () => {
			try {
				const all = await queryCollection("posts").all();
				const base = `/posts/${locale.value.toLowerCase()}/`;
				return all
					.filter(
						(p: any) => !p.draft && ((p.path as string) || "").startsWith(base),
					)
					.sort(
						(a: any, b: any) =>
							new Date(b.date).getTime() - new Date(a.date).getTime(),
					);
			} catch (error) {
				console.error("Erro ao buscar posts:", error);
				return [];
			}
		},
		{ watch: [locale] },
	);

	const filtered = computed(() => {
		let arr = (posts.value as any[]) || [];
		if (q.value) {
			const s = q.value.toLowerCase();
			arr = arr.filter(
				(p) =>
					(p.title || "").toLowerCase().includes(s)
					|| (p.description || "").toLowerCase().includes(s)
					|| (p.excerpt || "").toLowerCase().includes(s)
					|| (p.tags || []).join(" ").toLowerCase().includes(s),
			);
		}
		if (cat.value) {
			const c = cat.value;
			arr = arr.filter((p) => {
				const cats = (p.categories || []) as string[];
				// Suporte a slug e nome: se categoria do post vier como nome, normaliza para kabab-case
				const asSlug = cats.map((x) => x.toLowerCase().replace(/\s+/g, "-"));
				return cats.includes(c) || asSlug.includes(c.toLowerCase());
			});
		}
		if (tag.value) {
			arr = arr.filter((p) => (p.tags || []).includes(tag.value));
		}
		return arr;
	});

	const featured = computed(() =>
		filtered.value.filter((p: any) => p.featured),
	);
	const others = computed(() => filtered.value.filter((p: any) => !p.featured));

	function toBlogPath(p: string) {
		// Remove o prefixo do idioma e substitui /posts por /blog
		// Exemplo: /posts/pt/hello-world -> /blog/hello-world
		return p.replace(/^\/posts\/[^/]+/, "/blog");
	}

	function toBlogPostPathFromDoc(p: any) {
		const raw =
			p?.seo?.slug || (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	function formatDate(d: string | number | Date) {
		try {
			return new Intl.DateTimeFormat(locale.value, {
				dateStyle: "medium",
			}).format(new Date(d));
		} catch {
			return new Date(d).toLocaleDateString();
		}
	}
	// Visual helpers
	function tagColor(tag: string) {
		let hash = 0;
		for (let i = 0; i < tag.length; i++)
			hash = (hash << 5) - hash + tag.charCodeAt(i);
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue} 70% 45%)`;
	}
</script>

<template>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("site.blog") }}</h1>

		<!-- Destaques -->
		<div
			v-if="featured.length"
			class="mb-10 grid gap-6 md:grid-cols-2">
			<article
				v-for="post in featured"
				:key="post.path"
				class="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
					<div class="p-5">
						<div class="mb-2 flex flex-wrap gap-1">
							<span
								v-for="tg in post.tags || []"
								:key="tg"
								class="rounded px-2 py-0.5 text-[10px] font-medium text-white"
								:style="{ backgroundColor: tagColor(tg) }"
								>#{{ tg }}</span
							>
						</div>
						<h2 class="mb-1 line-clamp-2 text-xl font-semibold">{{
							post.title || post.path.split("/").pop()
						}}</h2>
						<p class="mt-0 text-xs text-gray-500">{{
							post.date ? formatDate(post.date) : ""
						}}</p>
						<p
							v-if="post.excerpt || post.description"
							class="mt-2 line-clamp-3 text-sm text-gray-700 dark:text-gray-300"
							>{{ post.excerpt || post.description }}</p
						>
					</div>
				</NuxtLink>
			</article>
		</div>

		<!-- Lista -->
		<div
			v-if="others.length"
			class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<article
				v-for="post in others"
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
						<div class="mb-1 flex flex-wrap gap-1">
							<span
								v-for="tg in post.tags || []"
								:key="tg"
								class="rounded px-2 py-0.5 text-[10px] font-medium text-white"
								:style="{ backgroundColor: tagColor(tg) }"
								>#{{ tg }}</span
							>
						</div>
						<h2 class="line-clamp-2 text-lg font-semibold">{{
							post.title || post.path.split("/").pop()
						}}</h2>
						<p class="mt-1 text-xs text-gray-500">{{
							post.date ? formatDate(post.date) : ""
						}}</p>
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
	</div>
</template>
