import {
	defineCollection,
	defineContentConfig,
	z as type,
} from "@nuxt/content";

// 🎯 Tipos avançados e reutilizáveis
const TagSchema = type
	.string()
	.min(1, "Tag não pode ser vazia")
	.max(30, "Tag muito longa")
	.regex(/^[a-zA-Z0-9\-\s]+$/, "Tag contém caracteres inválidos");

const UrlSchema = type
	.string()
	.url("URL inválida")
	.refine((url) => {
		try {
			const parsed = new URL(url);
			return ["http:", "https:"].includes(parsed.protocol);
		} catch {
			return false;
		}
	}, "URL deve usar protocolo HTTP/HTTPS");

const SlugSchema = type
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve seguir formato kebab-case")
	.min(3, "Slug muito curto")
	.max(100, "Slug muito longo");

// 🚀 Schema principal otimizado
export default defineContentConfig({
	collections: {
		posts: defineCollection({
			type: "page",
			source: "posts/*/*.md",
			schema: type.object({
				// 📝 Conteúdo Principal
				title: type
					.string()
					.min(10, "Título muito curto para SEO")
					.max(70, "Título pode ser truncado no Google")
					.describe("Título otimizado para SEO"),

				description: type
					.string()
					.min(120, "Descrição muito curta para SEO")
					.max(160, "Descrição muito longa para meta tag")
					.describe("Meta descrição SEO"),

				excerpt: type
					.string()
					.min(100, "Resumo muito curto")
					.max(300, "Resumo muito longo")
					.optional()
					.describe("Resumo executivo do post"),

				// 🗓️ Datas e Status
				date: type.coerce.date().describe("Data de publicação"),

				updatedAt: type.coerce.date().optional().describe("Última atualização"),

				publishedAt: type.coerce
					.date()
					.optional()
					.describe("Data de publicação efetiva"),

				draft: type.boolean().default(false).describe("Status de rascunho"),

				featured: type.boolean().default(false).describe("Post em destaque"),

				// 🏷️ Taxonomia Avançada
				tags: type
					.array(TagSchema)
					.max(10, "Máximo de 10 tags")
					.default([])
					.describe("Tags do post"),

				categories: type
					.array(type.string().min(1))
					.max(3, "Máximo de 3 categorias")
					.default([])
					.describe("Categorias do post"),

				series: type
					.string()
					.min(3)
					.max(50)
					.optional()
					.describe("Nome da série de posts"),

				seriesOrder: type
					.number()
					.int()
					.positive()
					.optional()
					.describe("Ordem na série"),

				// 🖼️ Mídia e Visual
				cover: type
					.object({
						image: UrlSchema.describe("URL da imagem de capa"),
						alt: type
							.string()
							.min(10, "Alt text muito curto")
							.max(120, "Alt text muito longo")
							.describe("Texto alternativo da imagem"),
						caption: type
							.string()
							.max(200)
							.optional()
							.describe("Legenda da imagem"),
						credit: type
							.string()
							.max(100)
							.optional()
							.describe("Créditos da imagem"),
					})
					.optional(),

				// 👤 Autoria e Social
				author: type
					.object({
						name: type.string().min(2, "Nome muito curto"),
						avatar: UrlSchema.optional(),
						bio: type.string().max(200).optional(),
						social: type
							.object({
								twitter: type.string().optional(),
								github: type.string().optional(),
								linkedin: type.string().optional(),
								website: UrlSchema.optional(),
							})
							.optional(),
					})
					.optional(),

				// 🔗 SEO e Meta
				seo: type.object({
					slug: SlugSchema.describe("URL slug personalizada (obrigatória)"),
					canonical: UrlSchema.optional().describe("URL canônica"),
					noindex: type
						.boolean()
						.default(false)
						.describe("Não indexar no Google"),
					keywords: type
						.array(type.string().min(2).max(30))
						.max(15, "Máximo de 15 palavras-chave")
						.default([])
						.describe("Palavras-chave SEO"),
					ogImage: UrlSchema.optional().describe("Imagem Open Graph"),
					twitterCard: type
						.enum(["summary", "summary_large_image", "app", "player"])
						.default("summary_large_image")
						.describe("Tipo do Twitter Card"),
				}),

				// 📊 Métricas e Engagement
				readingTime: type
					.number()
					.int()
					.positive()
					.optional()
					.describe("Tempo de leitura em minutos"),

				difficulty: type
					.enum(["iniciante", "intermediario", "avancado", "expert"])
					.optional()
					.describe("Nível de dificuldade"),

				language: type
					.string()
					.min(2)
					.max(10)
					.default("pt")
					.describe("Locale do post (ex.: en, pt)"),

				// 🔧 Técnico e Funcionalidades
				toc: type.boolean().default(true).describe("Exibir índice"),

				comments: type.boolean().default(true).describe("Permitir comentários"),

				sharing: type
					.boolean()
					.default(true)
					.describe("Permitir compartilhamento"),

				relatedPosts: type
					.array(SlugSchema)
					.max(5, "Máximo de 5 posts relacionados")
					.default([])
					.describe("Posts relacionados"),

				// 🎨 Layout e Apresentação
				layout: type
					.enum(["default", "minimal", "featured", "wide", "newsletter"])
					.default("default")
					.describe("Layout do post"),

				theme: type
					.enum(["light", "dark", "auto"])
					.default("auto")
					.describe("Tema de cores"),

				// 📱 PWA e Performance
				preload: type
					.array(UrlSchema)
					.default([])
					.describe("Recursos para pré-carregamento"),

				priority: type
					.enum(["low", "normal", "high", "critical"])
					.default("normal")
					.describe("Prioridade de carregamento"),

				// 🔒 Controle de Acesso
				premium: type.boolean().default(false).describe("Conteúdo premium"),

				membersOnly: type
					.boolean()
					.default(false)
					.describe("Apenas para membros"),
			}),
		}),

		// 🏷️ Coleção de Categorias
		categories: defineCollection({
			type: "data",
			source: "categories/*/*.json",
			schema: type.object({
				name: type.string().min(2, "Nome muito curto"),
				description: type.string().max(300),
				color: type
					.string()
					.regex(/^#[0-9A-F]{6}$/i, "Cor deve estar em formato hex"),
				icon: type.string().optional(),
				parent: type.string().optional(),
				featured: type.boolean().default(false),
			}),
		}),

		// 👤 Coleção de Autores
		authors: defineCollection({
			type: "data",
			source: "authors/*/*.json",
			schema: type.object({
				name: type.string().min(2),
				email: type.string().email(),
				bio: type.string().max(500),
				avatar: UrlSchema.optional(),
				social: type
					.object({
						twitter: type.string().optional(),
						github: type.string().optional(),
						linkedin: type.string().optional(),
						website: UrlSchema.optional(),
					})
					.optional(),
				featured: type.boolean().default(false),
				joinDate: type.coerce.date(),
			}),
		}),

		// 📚 Coleção de Séries
		series: defineCollection({
			type: "data",
			source: "series/*/*.json",
			schema: type.object({
				title: type.string().min(3),
				description: type.string().max(300),
				cover: UrlSchema.optional(),
				posts: type.array(SlugSchema),
				difficulty: type.enum([
					"iniciante",
					"intermediario",
					"avancado",
					"expert",
				]),
				featured: type.boolean().default(false),
			}),
		}),
	},
});
