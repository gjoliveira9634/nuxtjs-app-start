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
				code: "pt-BR",
				name: "Português (Brasil)",
				language: "pt-BR",
				file: "pt-BR.json",
			},
			{
				code: "es-MX",
				name: "Español (México)",
				language: "es-MX",
				file: "es-MX.json",
			},
			{
				code: "en-US",
				name: "English (United States)",
				language: "en-US",
				file: "en-US.json",
			},
		],
		defaultLocale: "pt-BR",
		strategy: "prefix",
		baseUrl: process.env.SITE_URL || "http://localhost:3000",
		langDir: "../app/assets/i18n/locales",
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: "i18n_redirected",
			alwaysRedirect: false,
			redirectOn: "root",
		},
	},
	content: {
		database: {
			type: "postgres",
			url:
				process.env.POSTGRES_URL
				|| "postgresql://user:password@127.0.0.1:5432/postgres",
		},
	},
	runtimeConfig: {
		public: {
			siteUrl: process.env.SITE_URL || "http://localhost:3000",
			siteName: "Nuxt App Starter",
			siteDescription:
				"Starter Nuxt com blog via @nuxt/content, @nuxt/ui e SEO pronto.",
		},
	},
	app: {
		head: {
			meta: [
				{ name: "theme-color", content: "#000000" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "format-detection", content: "telephone=no" },
			],
			link: [{ rel: "icon", href: "/favicon.ico" }],
		},
	},
});
