import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		posts: defineCollection({
			type: "page",
			source: "**/*.md",
			schema: z.object({
				title: z.string().describe("Título do post"),
				description: z.string().optional().describe("Descrição do post"),
				excerpt: z.string().optional().describe("Resumo do post"),
				date: z.coerce.date().optional().describe("Data de publicação"),
				draft: z.boolean().default(false).optional().describe("Rascunho"),
				tags: z
					.array(z.string())
					.default([])
					.optional()
					.describe("Tags do post"),
				cover: z.string().optional().describe("Imagem de capa"),
			}),
		}),
	},
});
