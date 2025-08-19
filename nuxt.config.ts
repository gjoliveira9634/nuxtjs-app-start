export default defineNuxtConfig({
	compatibilityDate: "9999-12-31",
	devtools: { enabled: true },
	typescript: {
		typeCheck: true,
	},
	modules: [
		"@nuxt/devtools",
		"@nuxt/eslint",
		"@nuxt/test-utils",
		"@nuxt/image",
		"@nuxt/icon",
		"@nuxt/fonts",
		"@nuxt/ui",
		"@nuxt/scripts",
		"@nuxt/content",
		"@nuxtjs/seo",
		"@nuxtjs/i18n",
	],
	css: ["~/assets/css/index.css"],
	ui: {
		prefix: "Nuxt",
	},
	i18n: {
		locales: [
			{ code: "en", name: "English", language: "en", file: "en.json" },
			{ code: "es", name: "Español", language: "es", file: "es.json" },
			{ code: "fr", name: "Français", language: "fr", file: "fr.json" },
			{ code: "pt", name: "Português", language: "pt", file: "pt.json" },
		],
		defaultLocale: "en",
		// Necessário para gerar links absolutos válidos nos hreflang/canonical via useLocaleHead
		baseUrl:
			(process.env.NUXT_PUBLIC_SITE_URL as string)
			|| (process.env.SITE_URL as string)
			|| "http://localhost:3000",
		langDir: "../app/assets/i18n",
	},
	content: {
		database: {
			type: "postgres",
			url:
				(process.env.POSTGRES_URL as string)
				|| ((process.env.NODE_ENV as string) === "development" ?
					"postgresql://user:password@127.0.0.1:5432/postgres"
				:	(() => {
						throw new Error(
							`Warning: "POSTGRES_URL" has not been defined!
              Please, set it in your environment variables.`,
						);
					})()),
		},
	},
});
