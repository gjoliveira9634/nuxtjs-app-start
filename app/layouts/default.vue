<script setup lang="ts">
	const year = new Date().getFullYear();
	const { t, locale, locales } = useI18n();
	type LocaleCode = "pt-BR" | "es-MX" | "en-US";
	const switchLocalePath = useSwitchLocalePath();
	const localePath = useLocalePath();
	const availableLocales = computed(() =>
		(locales.value as Array<{ code: string; name?: string }>).map((l) => ({
			code: l.code,
			label: l.name || l.code,
		})),
	);

	async function switchLocale(code: LocaleCode) {
		if (code === locale.value) return;
		await navigateTo(switchLocalePath(code));
	}
</script>

<template>
	<div class="flex min-h-dvh flex-col">
		<header class="border-b bg-white/70 backdrop-blur dark:bg-gray-900/70">
			<div
				class="container mx-auto flex h-14 items-center justify-between px-4">
				<NuxtLink
					:to="localePath('/')"
					class="font-semibold"
					>{{ $t("site.name") }}</NuxtLink
				>
				<nav class="flex items-center gap-4">
					<NuxtLink
						:to="localePath('/')"
						class="hover:underline"
						>{{ $t("site.home") }}</NuxtLink
					>
					<NuxtLink
						:to="localePath('/blog')"
						class="hover:underline"
						>{{ $t("site.blog") }}</NuxtLink
					>
					<a
						href="https://nuxt.com"
						target="_blank"
						rel="noopener"
						class="hover:underline"
						>{{ $t("site.docs") }}</a
					>

					<div class="ml-4">
						<select
							:aria-label="$t('site.name') + ' language switcher'"
							class="rounded border bg-transparent px-2 py-1"
							:value="locale"
							@change="
								switchLocale(
									($event.target as HTMLSelectElement)
										.value as unknown as LocaleCode,
								)
							">
							<option
								v-for="l in availableLocales"
								:key="l.code"
								:value="l.code"
								>{{ l.label }}</option
							>
						</select>
					</div>
				</nav>
			</div>
		</header>

		<main class="flex-1">
			<NuxtPage />
		</main>

		<footer class="border-t text-sm text-gray-600 dark:text-gray-400">
			<div
				class="container mx-auto flex h-14 items-center justify-between px-4">
				<p>© {{ year }} {{ $t("site.name") }}</p>
				<p>
					<NuxtLink
						:to="localePath('/blog')"
						class="hover:underline"
						>{{ $t("site.footerBlog") }}</NuxtLink
					>
				</p>
			</div>
		</footer>
	</div>
</template>
