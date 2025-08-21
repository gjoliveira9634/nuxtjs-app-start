<script setup lang="ts">
	definePageMeta({ layout: "blog" });
	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	const slug = computed(() => (route.params.slug as string[]).join("/"));

	const { data: serie } = await useAsyncData(
		() => `serie:${locale.value}:${slug.value}`,
		async () => {
			const loc = locale.value.toLowerCase();
			const all = (await queryCollection("series").all()) as any[];
			const list = all.filter((s: any) =>
				((s.id as string) || (s.path as string) || "")
					.replace(/^\//, "")
					.startsWith(`series/${loc}/`),
			);
			const bySlug = (list as any[]).find((s: any) => {
				const base = (s.id as string) || (s.path as string) || "";
				return base.replace(/\.[^/.]+$/, "").endsWith(`/${slug.value}`);
			});
			if (bySlug) return bySlug;
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return (
				(list as any[]).find(
					(s: any) => s.title?.toLowerCase().replace(/\s+/g, "-") === norm,
				) || null
			);
		},
		{ watch: [locale, slug] },
	);

	const { data: posts } = await useAsyncData(
		() => `seriePosts:${locale.value}:${slug.value}`,
		async () => {
			const all = await queryCollection("posts").all();
			const base = `/posts/${locale.value.toLowerCase()}/`;
			const list = all
				.filter(
					(p: any) => !p.draft && ((p.path as string) || "").startsWith(base),
				)
				.sort(
					(a: any, b: any) =>
						new Date(a.date).getTime() - new Date(b.date).getTime(),
				);
			const norm = slug.value.toLowerCase().replace(/\s+/g, "-");
			return list
				.filter((p: any) => {
					if (p.draft) return false;
					if (serie.value?.title) return p.series === serie.value.title;
					return (
						p.series && p.series.toLowerCase().replace(/\s+/g, "-") === norm
					);
				})
				.sort(
					(a: any, b: any) => (a.seriesOrder || 9999) - (b.seriesOrder || 9999),
				);
		},
		{ watch: [locale, slug, serie] },
	);

	function toBlogPostPathFromDoc(p: any) {
		const raw =
			p?.seo?.slug || (p?.path as string)?.replace(/^\/posts\/[^/]+\//, "");
		return localePath(`/blog/posts/${raw}`);
	}

	const pageTitle = computed(
		() => `${serie.value?.title || slug.value} — ${t("post.series")}`,
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
		<div
			v-if="serie"
			class="mb-6">
			<h1 class="text-2xl font-semibold">{{ serie.title }}</h1>
			<p
				v-if="serie.description"
				class="text-sm text-gray-600 dark:text-gray-400"
				>{{ serie.description }}</p
			>
		</div>

		<ol class="space-y-3">
			<li
				v-for="post in posts || []"
				:key="post.path"
				class="rounded-md border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
				<NuxtLink
					:to="toBlogPostPathFromDoc(post)"
					class="font-medium hover:underline"
					>{{ post.title }}</NuxtLink
				>
				<span
					v-if="post.seriesOrder"
					class="ml-2 text-xs text-gray-500"
					>#{{ post.seriesOrder }}</span
				>
			</li>
		</ol>
	</div>
</template>
