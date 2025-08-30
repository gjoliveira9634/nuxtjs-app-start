<script setup lang="ts">
	definePageMeta({ layout: "blog" });

	const route = useRoute();
	const { t, locale } = useI18n();
	const localePath = useLocalePath();

	// Parâmetros da query
	const slug = route.query.slug as string;
	const targetLocale = route.query.locale as string;
	const authorName = route.query.author as string;

	// Busca o autor para exibir o card
	const { data: author } = await useAsyncData(
		() => `author:${authorName}`,
		async () => {
			if (!authorName) return null;
			const authors = await queryCollection("authors").all();
			return authors.find((a: any) => a.name === authorName) || null;
		},
	);

	// Função para voltar à home
	function goHome() {
		navigateTo(localePath("/blog"));
	}

	// Função para enviar mensagem ao autor (placeholder - pode integrar com email ou form)
	function contactAuthor() {
		if (author.value?.email) {
			window.location.href = `mailto:${author.value.email}?subject=Tradução pendente: ${slug}&body=Olá ${author.value.name}, ainda não há tradução para "${slug}" em ${targetLocale}.`;
		} else {
			alert(t("missingTranslation.contactFallback"));
		}
	}

	// Função para ver posts do autor
	function viewAuthorPosts() {
		if (author.value) {
			const primaryLang = author.value.primaryLanguage || "en";
			const authorSlug = author.value.name.toLowerCase().replace(/\s+/g, "-");

			// Gerar URL no idioma do autor
			const authorPath = localePath(`/blog/authors/${authorSlug}`, primaryLang);

			navigateTo(authorPath);
		}
	}
</script>

<template>
	<div class="mx-auto max-w-2xl py-10 text-center">
		<div class="mb-8">
			<h1 class="mb-4 text-3xl font-semibold text-gray-900 dark:text-white">
				{{ t("missingTranslation.title") }}
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300">
				{{ t("missingTranslation.message", { slug, locale: targetLocale }) }}
			</p>
		</div>

		<!-- Card do Autor -->
		<div
			v-if="author"
			class="mb-8 rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
			<div class="flex items-center gap-4">
				<img
					v-if="author.avatar"
					:src="author.avatar"
					:alt="author.name"
					class="h-16 w-16 rounded-full object-cover" />
				<div class="text-left">
					<h2 class="text-xl font-semibold">{{ author.name }}</h2>
					<p
						v-if="author.bio"
						class="text-sm text-gray-600 dark:text-gray-300">
						{{ author.bio }}
					</p>
					<p class="text-xs text-gray-500">
						{{ t("missingTranslation.authorSince") }}
						{{ new Date(author.joinDate).toLocaleDateString(locale) }}
					</p>
				</div>
			</div>
			<div class="mt-4 flex gap-2">
				<button
					@click="contactAuthor"
					class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
					{{ t("missingTranslation.contactAuthor") }}
				</button>
				<button
					@click="viewAuthorPosts"
					class="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
					{{ t("missingTranslation.viewAuthorPosts") }}
				</button>
			</div>
		</div>

		<!-- Ações -->
		<div class="flex justify-center gap-4">
			<button
				@click="goHome"
				class="rounded border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
				{{ t("missingTranslation.goHome") }}
			</button>
		</div>
	</div>
</template>
