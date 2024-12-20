// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
 devtools: { enabled: true },
 css: ["~/assets/css/main.css", "~/assets/css/ranks.css", "~/assets/css/chart.css", "~/assets/css/profile.css"],
 modules: ['nuxt-highcharts', "@nuxt/ui"],
 ssr: false,

 postcss: {
					plugins: {
									tailwindcss: {},
									autoprefixer: {},
					},
	},

 app: {
					pageTransition: { name: 'page', mode: 'out-in' },
					head: {
									link: [
													{ rel: "apple-touch-icon", sizes: "57x57", href: "/favicon/apple-icon-57x57.png" },
													{ rel: "apple-touch-icon", sizes: "60x60", href: "/favicon/apple-icon-60x60.png" },
													{ rel: "apple-touch-icon", sizes: "72x72", href: "/favicon/apple-icon-72x72.png" },
													{ rel: "apple-touch-icon", sizes: "76x76", href: "/favicon/apple-icon-76x76.png" },
													{ rel: "apple-touch-icon", sizes: "114x114", href: "/favicon/apple-icon-114x114.png" },
													{ rel: "apple-touch-icon", sizes: "120x120", href: "/favicon/apple-icon-120x120.png" },
													{ rel: "apple-touch-icon", sizes: "144x144", href: "/favicon/apple-icon-144x144.png" },
													{ rel: "apple-touch-icon", sizes: "152x152", href: "/favicon/apple-icon-152x152.png" },
													{ rel: "apple-touch-icon", sizes: "180x180", href: "/favicon/apple-icon-180x180.png" },

													{ rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon/favicon-16x16.png" },
													{ rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon/favicon-32x32.png" },
													{ rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon/favicon/favicon-96x96.png" },
													{ rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon/android-icon-192x192.png" },

													{ rel: "manifest", href: "/favicon/manifest.json" },
									],

									meta: [
													{ name: "msapplication-TileColor", content: "#ffffff" },
													{ name: "theme-color", content: "#ffffff" },
													{ name: "msapplication-TileImage", content: "favicon/ms-icon-144x144.png" },
													{
																	name: "viewport",
																	content: "width=device-width, initial-scale=1.0",
													},
													{
																	name: "description",
																	content: "Here you can view your stats from our Mario Kart 8 Deluxe Yuzu Lounge! dsc.gg/yuzuonline",
													},
													{
																	property: "og:title",
																	content: "MK8DX-Yuzu Leaderboard",
													},
													{
																	property: "og:site_name",
																	content: "dsc.gg/yuzuonline",
													},
													{
																	property: "al:web:url",
																	content: "https://dsc.gg/yuzuonline",
													},
													{
																	property: "og:description",
																	content: "Here you can view your stats from our Mario Kart 8 Deluxe Yuzu Lounge!",
													},
													{
																	property: "og:type",
																	content: "website",
													},
													{
																	property: "og:url",
																	content: "https://mk8dx-yuzu.github.io/",
													},
													{
																	property: "og:image",
																	content: "https://mk8dx-yuzu.github.io/images/kawaii_icon_by_kevnkkm.png",
													},
									],
					},
	},

 compatibilityDate: "2024-08-14",
});