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
	],
	content: {
		database: {
			type: "postgres",
			url:
				process.env.POSTGRES_URL
				?? "postgresql://user:password@127.0.0.1:5432/postgres",
		},
	},
});
