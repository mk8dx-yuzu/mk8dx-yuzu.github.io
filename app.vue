<template>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="Here you can view your stats from our Mario Kart 8 Deluxe Yuzu Lounge! dsc.gg/yuzuonline" />
	<meta property="og:title" content="MK8DX-Yuzu Leaderboard" />
	<meta property="og:site_name" content="dsc.gg/yuzuonline" />
	<meta property="al:web:url" content="https://dsc.gg/yuzuonline" />
	<meta property="og:description" content="Here you can view your stats from our Mario Kart 8 Deluxe Yuzu Lounge!" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://mk8dx-yuzu.github.io/" />
	<meta property="og:image" content="https://mk8dx-yuzu.github.io/favicon/ms-icon-310x310.png" />
	<div>
		<div class="gradient-bg"></div>
		<div class="navigation-container">
			<div class="navigation-container-inner">
				<div class="navigation-image">
					<nuxt-link to="/">
						<img :src="!uwu ? '/images/Yuzu Online Lounge Logo v2.png' : '/images/Yuzu Online Lounge Logo v2 uwu.png'" alt="Yuzu Online Lounge Logo" />
					</nuxt-link>
				</div>
				<div class="hamburger" :class="{ open: isMenuOpen }" @click="toggleMenu">
					<span class="bun bun-top">
						<span class="bun-crust bun-crust-top"></span>
					</span>
					<span class="bun bun-bottom">
						<span class="bun-crust bun-crust-bottom"></span>
					</span>
				</div>
				<nav :class="{ open: isMenuOpen }">
					<ul>
						<li class="search-icon">
							<UPopover v-model:open="isSearchOpen" v-if="route.path === '/' || route.path === '/season-3'">
								<UTooltip text="Search" :shortcuts="['CTRL', 'K']" :popper="{ placement: 'left' }">
									<UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
								</UTooltip>

								<template #panel>
									<div class="p-4">
										<p class="text-2xl text-center pb-2">Search players</p>
										<div class="flex space-x-4">
											<div class="flex text-center items-center">
												<UInput v-model="searchQuery" />
												<UIcon name="i-heroicons-x-mark" class="absolute right-5 cursor-pointer" @click="searchQuery = ''" />
											</div>
										</div>
									</div>
								</template>
							</UPopover>
						</li>
						<li>
							<nuxt-link to="/" class="nav-link" @click="closeMenu">Leaderboard</nuxt-link>
						</li>
						<li>
							<nuxt-link to="https://dsc.gg/yuzuonline" class="nav-link">Discord</nuxt-link>
						</li>
						<li>
							<nuxt-link to="https://github.com/probablyjassin/bot-mk8dx-public" class="nav-link">Lounge-Bot</nuxt-link>
						</li>
						<li>
							<a href="#" @click="downloadSheet">Download JSON</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>

<script setup>
	const uwu = useCookie("uwu", { maxAge: 31536000000 });
	const route = useRoute();
	if (route.query.uwu === "true") {
		uwu.value = true;
	} else if (route.query.uwu === "false") {
		uwu.value = false;
	}

	const url = useState("url", () => "https://mk8dx-yuzu.kevnkkm.de/api/leaderboard");
	const hasLoaded = useState("loaded", () => false);
	const hasMounted = useState("mounted", () => false);
	const playerData = useState("data", () => []);

	function sortByMMR(data) {
		// 1. Create a new array to store sorted objects
		const sortedData = [];

		// 2. Loop through the original data
		for (const item of data) {
			// 3. Find the appropriate insertion point in the sorted array
			let insertionIndex = 0;
			while (insertionIndex < sortedData.length && item.mmr >= sortedData[insertionIndex].mmr) {
				insertionIndex++;
			}

			// 4. Insert the object at the found position
			sortedData.splice(insertionIndex, 0, item);
		}

		// 5. Return the sorted array
		return sortedData;
	}
	onMounted(async () => {
		hasMounted.value = true;
		try {
			var data = await $fetch(url.value);
		} catch (e) {
			console.log(e);
			var data = [];
		}

		playerData.value = sortByMMR(
			data.map((player) => ({
				name: player.name || player.Player,
				mmr: player.mmr || player.MMR,
				history: player.history || [],
				wins: player.history.filter((delta) => delta >= 0).length,
				losses: player.history.filter((delta) => delta < 0).length,
				discord: player.discord_id || undefined,
				disconnects: player.disconnects || 0,
			}))
		).reverse();

		hasLoaded.value = true;

		// ANIMATION
		nextTick(() => {
			const cells = document.querySelectorAll("#leaderboard-table td");
			cells.forEach((cell, index) => {
				cell.style.opacity = 0;
				cell.style.animation = "tiltanimation 0.75s forwards";
				cell.style.animationDelay = index * 0.005 + "s";
			});
		});
	});

	async function downloadSheet() {
		try {
			const response = await fetch(url.value);
			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}
			const data = await response.json();

			let date = new Date();

			const filename = `leaderboard-${date.toISOString().split("T")[0]}.json`;
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

			if (window.navigator.webkitURL) {
				// Chrome and Safari
				const link = document.createElement("a");
				link.href = window.navigator.webkitURL.createObjectURL(blob);
				link.download = filename;
				link.click();
			} else {
				// Firefox
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = filename;
				link.style.display = "none";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch (error) {
			console.error("Error downloading JSON:", error);
		}
	}

	const ranks = ["any", "wood", "bronze", "silver", "gold", "platinum", "diamond", "master"];

	const searchQuery = useState("searchQuery", () => "");
	const selectedRank = ref(ranks[0]);
	const isSearchOpen = ref(false);
	const isMenuOpen = ref(false);

	function toggleMenu() {
		isMenuOpen.value = !isMenuOpen.value;
	}

	function closeMenu() {
		isMenuOpen.value = false;
	}

	defineShortcuts({
		meta_k: {
			usingInput: true,
			handler: () => {
				isSearchOpen.value = !isSearchOpen.value;
			},
		},
	});

	useHead({
		title: "MK8DX-Yuzu Leaderboard",
		meta: [
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
	});
</script>

<style>
	.page-enter-active,
	.page-leave-active {
		transition: all 0.4s;
	}
	.page-enter-from,
	.page-leave-to {
		opacity: 0;
		filter: blur(1rem);
		transform: rotate3d(1, 1, 1, 2deg);
	}
</style>
