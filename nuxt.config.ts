import { defineNuxtConfig } from "nuxt/config";

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
			{
				code: "en-US",
				name: "English (United States)",
				language: "en-US",
				file: "en-US.json",
			},
			{
				code: "es-MX",
				name: "Español (México)",
				language: "es-MX",
				file: "es-MX.json",
			},
			{
				code: "fr-CA",
				name: "Français (Canada)",
				language: "fr-CA",
				file: "fr-CA.json",
			},
			{
				code: "pt-BR",
				name: "Português (Brasil)",
				language: "pt-BR",
				file: "pt-BR.json",
			},
		],
		defaultLocale: "en-US",
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
						throw new Error("POSTGRES_URL has not been defined!");
					})()),
		},
	},
});
