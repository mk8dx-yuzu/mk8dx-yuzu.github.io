<template>
	<div>
		<div class="gradient-bg"></div>
		<nav class="h-14 bg-slate-950 flex justify-between">
			<nuxt-link to="/">
				<img src="/favicon/android-icon-192x192.png" alt="icon" class="w-14 h-14" />
			</nuxt-link>
			<div class="mr-48 self-center text-center">
				<UPopover v-model:open="isSearchOpen">
					<UTooltip text="Search" :shortcuts="['CTRL', 'K']" :popper="{ placement: 'left' }">
						<UButton class="h-6 w-6 i-heroicons-magnifying-glass" />
					</UTooltip>

					<template #panel>
						<div class="p-4">
							<p class="text-2xl">Search players</p>
							<UInput v-model="searchQuery" />
						</div>
					</template>
				</UPopover>
			</div>
			<DownloadBtn @click="downloadSheet" />
		</nav>
		<NuxtPage />
	</div>
</template>

<script setup>
	const url = useState("url", () => "https://mk8dx-yuzu.kevnkkm.de/api/leaderboard");
	const hasLoaded = useState("loaded", () => false);

	const data = await $fetch(url.value).then((hasLoaded.value = true));

	const playerData = useState("data", (() =>
		sortByMMR(
			data
				.map((player) => ({
					name: player.name || player.Player,
					mmr: player.mmr || player.MMR,
					wins: player.wins || 0,
					losses: player.losses || 0,
					history: player.history || []
				}))
				.filter((item) => !(item["wins"] == 0 && item["mmr"] == 2000))
		).reverse()
	));

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

	async function downloadSheet() {
	    try {
	    const response = await fetch(url.value);
	    if (!response.ok) {
	      throw new Error(`API request failed with status ${response.status}`);
	    }
	    const data = await response.json();

	    let date = new Date()

	    const filename = `leaderboard-${date.toISOString().split('T')[0]}.json`;
	    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

	    if (window.navigator.webkitURL) { // Chrome and Safari
	      const link = document.createElement('a');
	      link.href = window.navigator.webkitURL.createObjectURL(blob);
	      link.download = filename;
	      link.click();
	    } else { // Firefox
	      const link = document.createElement('a');
	      link.href = URL.createObjectURL(blob);
	      link.download = filename;
	      link.style.display = 'none';
	      document.body.appendChild(link);
	      link.click();
	      document.body.removeChild(link);
	    }

	  } catch (error) {
	    console.error('Error downloading JSON:', error);
	  }
	}

	const searchQuery = useState('searchQuery', (() => ""))
	const isSearchOpen = ref(false)
	defineShortcuts({
		meta_k: {
			usingInput: true,
			handler: () => {
				isSearchOpen.value = !isSearchOpen.value
			}
		}
	})
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
