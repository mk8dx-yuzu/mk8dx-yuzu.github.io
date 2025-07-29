export const useMogiData = () => {
	const mogiData = useState("mogiData", () => []);
	const hasLoaded = useState("mogiLoaded", () => false);
	const isDataFromCache = useState("isMogiDataFromCache", () => false);
	
	// Cache for storing fetched data
	const dataCache = useState("mogiDataCache", () => new Map());
	const cacheTimestamps = useState("mogiCacheTimestamps", () => new Map());
	
	// Cache duration in milliseconds (10 minutes for mogi data)
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

	async function loadMogiData(season = null, forceRefresh = false) {
		// Reset loading state
		hasLoaded.value = false;

		// Use provided season or fall back to 4
		const currentSeason = season !== null ? season : 4;

		// Check if we have valid cached data and not forcing a refresh
		if (!forceRefresh && isCacheValid(currentSeason)) {
			const cachedData = getCacheData(currentSeason);
			if (cachedData && cachedData.length > 0) {
				console.log(`Loading Season ${currentSeason} mogi data from cache`);
				mogiData.value = cachedData;
				isDataFromCache.value = true;
				hasLoaded.value = true;
				return mogiData.value;
			}
		}

		// If no valid cache or forcing refresh, fetch from API
		console.log(`Fetching Season ${currentSeason} mogi data from API${forceRefresh ? " (forced refresh)" : ""}`);
		mogiData.value = [];
		isDataFromCache.value = false;

		// Determine the API endpoint based on season
		const url = currentSeason === 4 
			? "https://mk8dx-yuzu.kevnkkm.de/api/mogis?season=4" 
			: "https://mk8dx-yuzu.kevnkkm.de/api/mogis";

		try {
			const data = await $fetch(url);
			
			// Store in cache only if we got valid data
			if (data && data.length > 0) {
				setCacheData(currentSeason, data);
				console.log(`Successfully cached ${data.length} mogis for Season ${currentSeason}`);
			}

			mogiData.value = data || [];
		} catch (e) {
			console.error("Error fetching mogi data:", e);

			// If API fails, try to use expired cache as fallback
			const fallbackData = getCacheData(currentSeason);
			if (fallbackData && fallbackData.length > 0) {
				console.log(`API failed, using expired cache for Season ${currentSeason} mogi data`);
				mogiData.value = fallbackData;
				isDataFromCache.value = true;
			} else {
				mogiData.value = [];
			}
		}

		hasLoaded.value = true;
		return mogiData.value;
	}

	async function getPlayerNames(playerIds, season = 4) {
		try {
			const url = season === 4 
				? "https://mk8dx-yuzu.kevnkkm.de/api/leaderboard?season=4" 
				: "https://mk8dx-yuzu.kevnkkm.de/api/leaderboard";
			
			const leaderboardData = await $fetch(url);
			const playerMap = {};
			
			leaderboardData.forEach(player => {
				if (player.discord_id) {
					playerMap[player.discord_id] = player.name || player.Player;
				}
			});
			
			return playerIds.map(id => ({
				id,
				name: playerMap[id] || `Player ${id}`
			}));
		} catch (error) {
			console.error("Error fetching player names:", error);
			return playerIds.map(id => ({
				id,
				name: `Player ${id}`
			}));
		}
	}

	async function calculateStats(mogis, season = 4) {
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

		// Count player occurrences
		const playerIdCounts = {};
		mogis.forEach(mogi => {
			mogi.player_ids.forEach(playerId => {
				playerIdCounts[playerId] = (playerIdCounts[playerId] || 0) + 1;
			});
		});

		// Get top 3 most active players
		const top3PlayerIds = Object.entries(playerIdCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 3)
			.map(([id, count]) => ({ id, count }));

		// Get player names for top 3
		const top3PlayersWithNames = await getPlayerNames(
			top3PlayerIds.map(p => p.id), 
			season
		);

		const top3Players = top3PlayerIds.map(({ id, count }, index) => [
			top3PlayersWithNames[index].name,
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

		// Calculate average players per mogi
		const averagePlayersPerMogi = mogis.reduce((sum, mogi) => sum + mogi.player_ids.length, 0) / mogis.length;

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
		calculateStats
	};
};
