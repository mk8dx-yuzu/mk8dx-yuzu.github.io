export const useGuildData = () => {
	const route = useRoute();
	const guildData = useState("guildData", () => []);
	const hasLoaded = useState("guildLoaded", () => false);
	const isDataFromCache = useState("guildIsDataFromCache", () => false);

	// Cache for storing fetched data by season
	const dataCache = useState("guildDataCache", () => new Map());
	const cacheTimestamps = useState("guildCacheTimestamps", () => new Map());

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

	function processGuildData(data) {
		return sortByMMR(
			data.map((guild) => ({
				name: guild?.name ?? "Unnamed Guild",
				icon: guild?.icon ?? null,
				mmr: Number.isFinite(guild?.mmr) ? guild.mmr : 0,
				// members: playerIds.length,
				player_ids: Array.isArray(guild?.player_ids) ? guild.player_ids : [],
				players: Array.isArray(guild?.players) ? guild.players : [],
				history: Array.isArray(guild?.history) ? guild.history : [],
				wins: guild.history.filter((delta) => delta >= 0).length,
				losses: guild.history.filter((delta) => delta < 0).length,
				creation_date: guild.creation_date,
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
		console.log("Clearing all cached guild data");
		dataCache.value.clear();
		cacheTimestamps.value.clear();
	}

	async function loadGuildData(season = 4, forceRefresh = false) {
		// Reset loading state
		hasLoaded.value = false;

		// Use provided season parameter (defaults to 4 if not provided)
		const currentSeason = season;

		// Check if we have valid cached data and not forcing a refresh
		if (!forceRefresh && isCacheValid(currentSeason)) {
			const cachedData = getCacheData(currentSeason);
			if (cachedData && cachedData.length > 0) {
				console.log(`Loading season ${currentSeason} guild data from cache`);
				guildData.value = cachedData;
				isDataFromCache.value = true;
				hasLoaded.value = true;
				return guildData.value;
			}
		}

		// If no valid cache or forcing refresh, fetch from API
		console.log(`Fetching season ${currentSeason} guild data from API${forceRefresh ? " (forced refresh)" : ""}`);
		guildData.value = [];
		isDataFromCache.value = false;

		// Determine the API endpoint based on season
		const url = `https://mk8dx-yuzu.kevnkkm.de/api/guilds?season=${currentSeason}`;

		try {
			const data = await $fetch(url);
			const processedData = processGuildData(data);

			// Store in cache only if we got valid data
			if (processedData && processedData.length > 0) {
				setCacheData(currentSeason, processedData);
				console.log(`Successfully cached ${processedData.length} guilds for season ${currentSeason}`);
			}

			guildData.value = processedData;
		} catch (e) {
			console.error("Error fetching guild data:", e);

			// If API fails, try to use expired cache as fallback
			const fallbackData = getCacheData(currentSeason);
			if (fallbackData && fallbackData.length > 0) {
				console.log(`API failed, using expired cache for season ${currentSeason}`);
				guildData.value = fallbackData;
				isDataFromCache.value = true;
			} else {
				guildData.value = [];
			}
		}

		hasLoaded.value = true;
		return guildData.value;
	}

	function animateTable() {
		nextTick(() => {
			const cards = document.querySelectorAll(".guild-card");
			cards.forEach((card, index) => {
				card.style.opacity = 0;
				card.style.animation = "tiltanimation 0.75s forwards";
				card.style.animationDelay = index * 0.100 + "s";
			});
		});
	}

	return {
		guildData: readonly(guildData),
		hasLoaded: readonly(hasLoaded),
		isDataFromCache: readonly(isDataFromCache),
		loadGuildData,
		animateTable,
		processGuildData,
		sortByMMR,
		clearCache,
		isCacheValid,
		getCacheExpiryTime,
	};
};
