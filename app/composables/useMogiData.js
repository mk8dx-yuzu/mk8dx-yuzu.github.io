export const useMogiData = () => {
	const mogiData = useState("mogiData", () => []);
	const hasLoaded = useState("mogiLoaded", () => false);
	const isDataFromCache = useState("isMogiDataFromCache", () => false);

	// Cache for storing fetched data by season
	const dataCache = useState("mogiDataCache", () => new Map());
	const cacheTimestamps = useState("mogiCacheTimestamps", () => new Map());

	// Cache duration in milliseconds (10 minutes)
	const CACHE_DURATION = 10 * 60 * 1000;

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
		console.log("Clearing all cached mogi data");
		dataCache.value.clear();
		cacheTimestamps.value.clear();
	}

	async function loadMogiData(season = 4, forceRefresh = false) {
		// Reset loading state
		hasLoaded.value = false;

		// Use provided season parameter (defaults to 4 if not provided)
		const currentSeason = season;

		// Check if we have valid cached data and not forcing a refresh
		if (!forceRefresh && isCacheValid(currentSeason)) {
			const cachedData = getCacheData(currentSeason);
			if (cachedData && cachedData.length > 0) {
				console.log(`Loading season ${currentSeason} mogi data from cache`);
				mogiData.value = cachedData;
				isDataFromCache.value = true;
				hasLoaded.value = true;
				return mogiData.value;
			}
		}

		// If no valid cache or forcing refresh, fetch from API
		console.log(`Fetching season ${currentSeason} mogi data from API${forceRefresh ? " (forced refresh)" : ""}`);
		mogiData.value = [];
		isDataFromCache.value = false;

		// Determine the API endpoint based on season
		const url = `https://mk8dx-yuzu.kevnkkm.de/api/mogis?season=${currentSeason}`;

		try {
			const data = await $fetch(url);
			
			// Store in cache only if we got valid data
			if (data && data.length > 0) {
				setCacheData(currentSeason, data);
				console.log(`Successfully cached ${data.length} mogis for season ${currentSeason}`);
			}
			mogiData.value = data || [];
		} catch (e) {
			console.error("Error fetching mogi data:", e);

			// If API fails, try to use expired cache as fallback
			const fallbackData = getCacheData(currentSeason);
			if (fallbackData && fallbackData.length > 0) {
				console.log(`API failed, using expired cache for season ${currentSeason} mogi data`);
				mogiData.value = fallbackData;
				isDataFromCache.value = true;
			} else {
				mogiData.value = [];
			}
		}
		hasLoaded.value = true;
		return mogiData.value;
	}

	function getPlayerNameMap() {
		// Build a map of player_id to name from all mogis
		const playerMap = {};
		mogiData.value.forEach(mogi => {
			mogi.players?.forEach(({ player_id, name }) => {
				playerMap[player_id] = name;
			});
		});
		return playerMap;
	}

	function calculateStats(mogis) {
		if (!mogis || mogis.length === 0) {
			return {};
		}

		// Calculate durations
		const durations = mogis.map(mogi => mogi.finished_at - mogi.started_at);
		const averageDurationMinutes = (durations.reduce((sum, duration) => sum + duration, 0) / durations.length) / 60;

		// Calculate disconnections
		const averageDisconnections = mogis.reduce((sum, mogi) => sum + mogi.disconnections, 0) / mogis.length;
		const maxDisconnections = Math.max(...mogis.map(mogi => mogi.disconnections));

		// Calculate subs
		const averageSubs = mogis.reduce((sum, mogi) => sum + mogi.subs, 0) / mogis.length;

		// Get all results
		const allResults = mogis.flatMap(mogi => mogi.results);

		// Count player occurrences using new players array
		const playerIdCounts = {};
		mogis.forEach(mogi => {
			if (Array.isArray(mogi.players)) {
				mogi.players.forEach(player => {
					const id = player.player_id;
					playerIdCounts[id] = (playerIdCounts[id] || 0) + 1;
				});
			}
		});

		// Get top 3 most active players
		const top3PlayerIds = Object.entries(playerIdCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([id, count]) => ({ id, count }));

		// Get player names for top 3
		const playerMap = getPlayerNameMap();
		const top3Players = top3PlayerIds.map(({ id, count }) => [
			playerMap[id] || `Player ${id}`,
			count
		]);

		// Format mapping
		const keyToFormat = {
			0: "mini",
			1: "FFA",
			2: "2v2",
			3: "3v3",
			4: "4v4",
			6: "6v6"
		};

		// Count formats
		const formatsDict = {};
		mogis.forEach(mogi => {
			const formatName = keyToFormat[mogi.format] || `${mogi.format}v${mogi.format}`;
			formatsDict[formatName] = (formatsDict[formatName] || 0) + 1;
		});

		// Calculate average players per mogi using mogi.players
		const averagePlayersPerMogi = mogis.reduce((sum, mogi) => sum + (Array.isArray(mogi.players) ? mogi.players.length : 0), 0) / mogis.length;

		return {
			totalMogis: mogis.length,
			averageDurationMinutes: averageDurationMinutes.toFixed(1),
			averageDisconnections: averageDisconnections.toFixed(1),
			maxDisconnections,
			averageSubs: averageSubs.toFixed(1),
			averagePlayersPerMogi: averagePlayersPerMogi.toFixed(1),
			biggestGain: Math.max(...allResults),
			biggestLoss: Math.min(...allResults),
			top3Players,
			formatsDict
		};
	}

	return {
		mogiData: readonly(mogiData),
		hasLoaded: readonly(hasLoaded),
		isDataFromCache: readonly(isDataFromCache),
		loadMogiData,
		calculateStats,
		clearCache,
		isCacheValid,
		getCacheExpiryTime,
	};
};
