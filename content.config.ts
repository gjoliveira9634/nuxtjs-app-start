import {
	defineCollection,
	defineContentConfig,
	z as type,
} from "@nuxt/content";

export default defineContentConfig({
	collections: {
		posts: defineCollection({
			type: "page",
			source: "**/*.md",
			schema: type.object({
				title: type.string().describe("Título do post"),
				description: type.string().optional().describe("Descrição do post"),
				excerpt: type.string().optional().describe("Resumo do post"),
				date: type.coerce.date().optional().describe("Data de publicação"),
				draft: type.boolean().default(false).optional().describe("Rascunho"),
				tags: type
					.array(type.string())
					.default([])
					.optional()
					.describe("Tags do post"),
				cover: type.string().optional().describe("Imagem de capa"),
			}),
		}),
	},
});
