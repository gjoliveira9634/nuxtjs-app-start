<script setup lang="ts">
	// Head i18n global: html[lang], alternates hreflang, canonical, etc.
	const i18nHead = useLocaleHead({ addSeoAttributes: true } as any);
	useHead(i18nHead);
</script>

<template>
	<NuxtApp>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</NuxtApp>
</template>
