<script setup lang="ts">
	const { t, locale } = useI18n();
	const localePath = useLocalePath();
	const title = computed(() => t("site.blog"));
	const description = computed(() => t("site.tagline"));
	useSeoMeta({
		title,
		description,
		ogTitle: title,
		ogDescription: description,
	});

	const { data: posts } = await useAsyncData(
		`posts:list:${locale.value}`,
		async () => {
			try {
				// Consulta todos os posts do locale atual usando queryCollection e ordena por data (desc)
				const all = await queryCollection("posts")
					.where("path", "LIKE", `/posts/${locale.value.toLowerCase()}/%`)
					.order("date", "DESC")
					.all();
				// Oculta posts marcados como rascunho
				return all.filter((p: any) => !p.draft);
			} catch (error) {
				console.error("Erro ao buscar posts:", error);
				return [];
			}
		},
		{ watch: [locale] },
	);

	function toBlogPath(p: string) {
		// Remove o prefixo do idioma e substitui /posts por /blog
		// Exemplo: /posts/pt-BR/hello-world -> /blog/hello-world
		return p.replace(/^\/posts\/[^/]+/, "/blog");
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
</script>

<template>
	<div class="container mx-auto py-10">
		<h1 class="mb-6 text-3xl font-semibold">{{ $t("site.blog") }}</h1>
		<ul class="space-y-4">
			<li
				v-for="post in posts"
				:key="post.path"
				class="border-b pb-4">
				<NuxtLink
					:to="localePath(toBlogPath(post.path))"
					class="text-xl font-medium hover:underline">
					{{ post.title || post.path.split("/").pop() }}
				</NuxtLink>
				<div class="text-sm text-gray-500">
					{{ post.date ? formatDate(post.date) : "" }}
				</div>
				<p
					v-if="post.excerpt || post.description"
					class="mt-2 text-gray-700"
					>{{ post.excerpt || post.description }}</p
				>
			</li>
		</ul>
	</div>
</template>
