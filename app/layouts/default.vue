<script setup lang="ts">
	const year = new Date().getFullYear();
	const { t, locale, locales } = useI18n();
	const route = useRoute();
	const router = useRouter();
	// Códigos de idioma agora são genéricos (en, es, fr, pt)
	type LocaleCode = string;
	const switchLocalePath = useSwitchLocalePath() as unknown as (
		code: string,
	) => string;
	const localePath = useLocalePath() as unknown as (
		path: string,
		code?: string,
	) => string;
	// SEO multilíngue: adiciona html lang/dir, alternates e metatags do i18n
	const i18nHead = useLocaleHead({
		addDirAttribute: true,
		addSeoAttributes: true,
		identifierAttribute: "hid",
	} as any);
	watchEffect(() => {
		const v = (i18nHead as any).value || {};
		useHead({
			htmlAttrs: v.htmlAttrs || {},
			link: v.link || [],
			meta: v.meta || [],
		});
	});
	const availableLocales = computed(() =>
		(locales.value as Array<{ code: string; name?: string }>).map((l) => ({
			code: l.code,
			label: l.name || l.code,
		})),
	);

	async function switchLocale(code: LocaleCode) {
		if (code === locale.value) return;

		// Se estiver em uma página de post do blog, tenta navegar para o slug equivalente no idioma alvo
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

				// 1) Descobre o documento atual para obter o nome base do arquivo
				const currentCandidates = await queryCollection("posts")
					.where("id", "LIKE", `posts/${curLocale}/%`)
					.all();
				const currentDoc =
					currentCandidates.find((p: any) => p?.seo?.slug === currentSlug)
					|| currentCandidates.find(
						(p: any) =>
							(p?.id as string)?.replace(/\.md$/, "")
							=== `posts/${curLocale}/${currentSlug}`,
					);
				const baseName =
					((currentDoc?.id as string) || (currentDoc?.path as string) || "")
						.replace(/^\/?posts\/[^/]+\//, "")
						.replace(/(\/index)?\.md$/, "") || currentSlug;

				// 2) Busca no idioma alvo por arquivo com mesmo nome base
				const targetCandidates = await queryCollection("posts")
					.where("id", "LIKE", `posts/${targetLocale}/%`)
					.all();
				const targetDoc = targetCandidates.find((p: any) =>
					((p?.id as string) || (p?.path as string) || "")
						.replace(/(\/index)?\.md$/, "")
						.endsWith(`/${baseName}`),
				);
				// Prefixo correto para o locale alvo baseado na estratégia do i18n
				const baseForLocale = switchLocalePath(code) || "/";
				const prefix = baseForLocale.split("/blog/")[0]; // "" ou "/es"

				if (!targetDoc) {
					// Se não houver equivalente, ir para a lista do blog no idioma alvo
					const listPath = `${prefix}/blog`;
					await router.replace(listPath);
					return;
				}

				const targetSlug = targetDoc?.seo?.slug || baseName;
				const targetPath = `${prefix}/blog/posts/${targetSlug}`;
				await router.replace(targetPath);
				return;
			} catch {
				// Fallback para comportamento padrão caso algo falhe
			}
		}

		// Navegação suave mantendo SPA
		await router.replace(switchLocalePath(code));
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
