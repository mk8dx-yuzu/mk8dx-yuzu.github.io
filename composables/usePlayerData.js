export const usePlayerData = () => {
	const playerData = useState("data", () => []);
	const hasLoaded = useState("loaded", () => false);
	const isDataFromCache = useState("isDataFromCache", () => false);

	// Cache for storing fetched data by season
	const dataCache = useState("dataCache", () => new Map());
	const cacheTimestamps = useState("cacheTimestamps", () => new Map());

	// Cache duration in milliseconds (5 minutes)
	const CACHE_DURATION = 5 * 60 * 1000;

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

	function processPlayerData(data) {
		return sortByMMR(
			data.map((player) => ({
				name: player.name || player.Player,
				mmr: player.mmr || player.MMR,
				history: player.history || [],
				wins: player.history.filter((delta) => delta >= 0).length,
				losses: player.history.filter((delta) => delta < 0).length,
				discord: player.discord_id || undefined,
				disconnects: player.disconnects || 0,
				suspended: player.suspended || false,
			}))
		).reverse();
	}

	function isCacheValid(season) {
		const timestamp = cacheTimestamps.value.get(season);
		if (!timestamp) return false;

		const now = Date.now();
		return now - timestamp < CACHE_DURATION;
	}

	function setCacheData(season, data) {
		dataCache.value.set(season, data);
		cacheTimestamps.value.set(season, Date.now());
	}

	function getCacheData(season) {
		return dataCache.value.get(season);
	}

	function getCacheExpiryTime(season) {
		const timestamp = cacheTimestamps.value.get(season);
		if (!timestamp) return null;

		const expiryTime = timestamp + CACHE_DURATION;
		return new Date(expiryTime);
	}

	function clearCache() {
		console.log("Clearing all cached data");
		dataCache.value.clear();
		cacheTimestamps.value.clear();
	}

	async function loadPlayerData(season = null, forceRefresh = false) {
		// Reset loading state
		hasLoaded.value = false;

		// Use provided season or fall back to the global selected season
		const currentSeason = season !== null ? season : route.query.s ? route.query.s : 4;

		// Check if we have valid cached data and not forcing a refresh
		if (!forceRefresh && isCacheValid(currentSeason)) {
			const cachedData = getCacheData(currentSeason);
			if (cachedData && cachedData.length > 0) {
				console.log(`Loading Season ${currentSeason} data from cache`);
				playerData.value = cachedData;
				isDataFromCache.value = true;
				hasLoaded.value = true;
				return playerData.value;
			}
		}

		// If no valid cache or forcing refresh, fetch from API
		console.log(`Fetching Season ${currentSeason} data from API${forceRefresh ? " (forced refresh)" : ""}`);
		playerData.value = [];
		isDataFromCache.value = false;

		// Determine the API endpoint based on season
		const url = currentSeason === 4 ? "https://mk8dx-yuzu.kevnkkm.de/api/leaderboard?season=4" : "https://mk8dx-yuzu.kevnkkm.de/api/leaderboard";

		try {
			const data = await $fetch(url);
			const processedData = processPlayerData(data);

			// Store in cache only if we got valid data
			if (processedData && processedData.length > 0) {
				setCacheData(currentSeason, processedData);
				console.log(`Successfully cached ${processedData.length} players for Season ${currentSeason}`);
			}

			playerData.value = processedData;
		} catch (e) {
			console.error("Error fetching player data:", e);

			// If API fails, try to use expired cache as fallback
			const fallbackData = getCacheData(currentSeason);
			if (fallbackData && fallbackData.length > 0) {
				console.log(`API failed, using expired cache for Season ${currentSeason}`);
				playerData.value = fallbackData;
				isDataFromCache.value = true;
			} else {
				playerData.value = [];
			}
		}

		hasLoaded.value = true;
		return playerData.value;
	}

	function animateTable() {
		nextTick(() => {
			const cells = document.querySelectorAll("#leaderboard-table td");
			cells.forEach((cell, index) => {
				cell.style.opacity = 0;
				cell.style.animation = "tiltanimation 0.75s forwards";
				cell.style.animationDelay = index * 0.005 + "s";
			});
		});
	}

	return {
		playerData: readonly(playerData),
		hasLoaded: readonly(hasLoaded),
		isDataFromCache: readonly(isDataFromCache),
		loadPlayerData,
		animateTable,
		processPlayerData,
		sortByMMR,
		clearCache,
		isCacheValid,
		getCacheExpiryTime,
	};
};
