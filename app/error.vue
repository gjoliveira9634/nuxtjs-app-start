<script setup lang="ts">
	const error = useError();
	const { t } = useI18n();
	const localePath = useLocalePath() as unknown as (path: string) => string;

	// SEO: título e descrição baseados no status
	const title = computed(() => {
		const code = Number(error.value?.statusCode || 0);
		const base = t("errors.error");
		if (code === 404) return `${t("errors.pageNotFound")} · ${t("site.name")}`;
		if (code >= 500)
			return `${t("errors.internalServerError")} · ${t("site.name")}`;
		return `${base} · ${t("site.name")}`;
	});
	const description = computed(
		() =>
			(error.value?.statusMessage as string)
			|| (Number(error.value?.statusCode) === 404 ?
				t("errors.pageNotFound")
			:	t("errors.unexpected")),
	);

	useSeoMeta({
		title,
		description,
		robots: "noindex, nofollow",
	});

	function goHome() {
		clearError({ redirect: localePath("/") });
	}
</script>

<template>
	<main
		class="container mx-auto flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
		<h1 class="sr-only">{{ $t("errors.error") }}</h1>
		<div
			class="mb-6 rounded-xl border bg-white/60 p-6 backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
			<div class="text-6xl font-bold text-gray-900 dark:text-white">{{
				error?.statusCode
			}}</div>
			<p class="mt-3 text-lg text-gray-700 dark:text-gray-300">
				{{
					error?.statusMessage
					|| (Number(error?.statusCode) === 404 ?
						$t("errors.pageNotFound")
					:	$t("errors.unexpected"))
				}}
			</p>
		</div>

		<NuxtLink
			:to="localePath('/')"
			class="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
			@click.prevent="goHome">
			{{ $t("errors.goHome") }}
		</NuxtLink>
	</main>
</template>
