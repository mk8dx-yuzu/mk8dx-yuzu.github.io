<template>
	<div>
		<Loader v-if="!hasMounted || !hasLoaded" />
		<ErrorTxt v-else-if="hasMounted && hasLoaded && !playerData.length" />
		<div v-else class="content">
			<!-- <NoticeBanner
				v-if="selectedSeason != 4" color="blue">
				<p>You are viewing historical player data from Season {{ selectedSeason }}. Select the current season on the leaderboard for up-to-date stats.</p>
			</NoticeBanner> -->
			<NoticeBanner v-if="player && suspended" color="red">
				<p>This player is currently suspended and may no longer participate in MK8DX-yuzu Lounge.</p>
			</NoticeBanner>
			<div class="profile-container">
				<div class="profile-container-inner">
                    <SeasonSelector v-model="selectedSeason" @change="onSeasonChange" />
					
					<!-- Player not found in selected season -->
					<div v-if="!player" class="player-not-found">
						<div class="player-not-found-content">
							<img src="/images/MK8D-PoliceRed.png" alt="error icon" width="150" height="150" />
							<h2>Player Not Found in Season {{ selectedSeason }}</h2>
							<p>Player {{ name }} does not have any recorded data in Season {{ selectedSeason }}.</p>
							<p>Please select a different season above to view their stats.<br>(Or they might not even exist altogether)</p>
						</div>
					</div>

					<!-- Player profile content -->
					<div v-if="player" class="player-profile-content">
					<div v-if="player" class="rank-icon-background">
						<img
							:src="`https://raw.githubusercontent.com/mk8dx-yuzu/ranks/refs/heads/main/${getRank(player.mmr, playerData.indexOf(player))}.png`"
							alt="rank icon" />
						<div class="gradient-blur">
							<div v-for="i in 3" :key="i"></div>
						</div>
                        <div class="gradient-rank" :style="{
							'--rank-primary': rankColors.primary,
							'--rank-secondary': rankColors.secondary
						}">
                        </div>
						<div class="overlay">
							<a class="player-name" :href="`https://discord.com/users/${player.discord}`">{{ player.name }}</a>
							<!-- <h2 class="season-number">Season {{ selectedSeason }}</h2> -->
							<div class="rank-info">
								<p :class="[getColor(player.mmr, playerData.indexOf(player))]">{{ player.mmr }} MMR</p>
								<p :class="[getColor(player.mmr, playerData.indexOf(player))]">●</p>
								<p :class="[getColor(player.mmr, playerData.indexOf(player))]">{{ getRank(player.mmr, playerData.indexOf(player)) }} Rank</p>
							</div>
							<p>Rank #{{ playerData.findIndex((obj) => obj.name === player.name) + 1 }} serverwide</p>
						</div>
					</div>
					<div class="stats">
						<div class="stat">
							<p class="stat-title">Your last 5 MMR changes:</p>
							<p class="stat-value">{{ player.history.length != 0 ? player.history.slice(-5).join(", ") : "None" }}</p>
						</div>
						<div class="stat">
							<p class="stat-value">
								<b>{{ player.wins }}</b> total wins
							</p>
							<p class="stat-title">
								and <b>{{ player.losses }}</b> total losses
							</p>
						</div>
						<div class="stat">
							<p class="stat-value">
								<b>{{ player.wins + player.losses === 0 ? 0 : Math.round((player.wins / (player.wins + player.losses)) * 100) }}%</b> Winrate
							</p>
							<p class="stat-title">
								out of <b>{{ player.wins + player.losses }}</b> total mogis
							</p>
						</div>
						<div class="stat">
							<p class="stat-title">With an average of 69 minutes per mogi</p>
							<p class="stat-value">
								<b>{{ (player.wins + player.losses) * 69 }} minutes</b> wasted
							</p>
						</div>
						<div class="stat">
							<p class="stat-value">
								<b>{{ player.disconnects }}</b> disconnects
							</p>
							<p class="stat-title">
								<b>{{ player.disconnects * 3 }}</b> minutes wasted for others
							</p>
						</div>
					</div>
					<!-- Guild Section -->
					<div v-if="playerGuild" class="guild-section">
						<div class="guild-section-header">
							<h3>Guild Affiliation</h3>
						</div>
						<div class="player-guild-card" :class="getColor(playerGuild.mmr)" @click="navToGuilds">
							<div class="player-guild-header">
								<div class="player-guild-rank-section">
									<div class="player-guild-rank">#{{ guildRank }}</div>
								</div>
								<div class="player-guild-logo-section">
									<img :src="getGuildIcon(playerGuild)" alt="Guild Logo" class="player-guild-logo" />
								</div>
								<div class="player-guild-main-info">
									<div class="player-guild-title-section">
										<h3 class="player-guild-name">{{ playerGuild.name }}</h3>
										<span class="player-guild-tag">{{ getGuildTag(playerGuild.name) }}</span>
										<span class="player-role-badge" :class="isGuildOwner ? 'owner' : 'member'">
											{{ isGuildOwner ? 'Owner' : 'Member' }}
										</span>
									</div>
									<div class="player-guild-stats">
										<div class="player-guild-stat-item">
											<span class="player-guild-stat-label">MMR</span>
											<span class="player-guild-stat-value" :class="getColor(playerGuild.mmr)">{{ playerGuild.mmr }}</span>
										</div>
										<div class="player-guild-stat-item">
											<span class="player-guild-stat-label">Wins</span>
											<span class="player-guild-stat-value">{{ playerGuild.wins }}</span>
										</div>
										<div class="player-guild-stat-item">
											<span class="player-guild-stat-label">Losses</span>
											<span class="player-guild-stat-value">{{ playerGuild.losses }}</span>
										</div>
										<!-- <div class="player-guild-stat-item">
											<span class="player-guild-stat-label">Members</span>
											<span class="player-guild-stat-value">{{ playerGuild.players.length }}</span>
										</div> -->
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="history-container">
						<highchart v-if="player?.name" :options="chartOptions" class="overflow-x-auto" />
					</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import SeasonSelector from "~/components/SeasonSelector.vue";
    import { useRank } from "~/composables/useRank";
    import { useRouter } from 'vue-router';

	const route = useRoute();
	const router = useRouter();
	const name = route.params.name;

	const { playerData, hasLoaded, loadPlayerData } = usePlayerData();
	const { guildData, hasLoaded: guildHasLoaded, loadGuildData } = useGuildData();
	const selectedSeason = useState("selectedSeason", () => ([1, 2, 3].includes(Number(route.query.s)) ? Number(route.query.s) : 4));
	const hasMounted = useState("mounted", () => false);

	const player = computed(() => playerData.value.filter((player) => player.name == name)[0]);
	const suspended = computed(() => player.value?.suspended == true);

	const { getColor } = useColor();
	const { getRank } = useRank();

	const rankColors = computed(() => {
		if (!player.value) return { primary: '#CAF0F8', secondary: '#03045E' };
		
		const rank = getRank(player.value.mmr, playerData.value.indexOf(player.value));
		const colorMap = {
            'Wood': { primary: '#023B3B', secondary: '#06B2B2' },
			'Bronze': { primary: '#763A00', secondary: '#F57600' },
			'Silver': { primary: '#343A40', secondary: '#ADB5BD' },
			'Gold': { primary: '#76520E', secondary: '#DB971A' },
			'Platinum': { primary: '#140524', secondary: '#4E148C' },
			'Diamond': { primary: '#03045E', secondary: '#2529F8' },
			'Master': { primary: '#1B1E22', secondary: '#CED4DA' },
			'Grandmaster': { primary: '#D51C5E', secondary: '#48091F' }
		};
		
		return colorMap[rank] || { primary: '#CAF0F8', secondary: '#03045E' };  
	});

	// Guild-related computed properties
	const playerGuild = computed(() => {
		if (!guildData.value || !player.value) return null;
		return guildData.value.find(guild => 
			guild.players.some(p => p.name === player.value.name)
		);
	});

	const isGuildOwner = computed(() => {
		if (!playerGuild.value || !player.value) return false;
		// First player in the players array is the owner
        // FIXME: The order of players is not always have the owner first
		return playerGuild.value.players[0]?.name === player.value.name;
	});

	const guildRank = computed(() => {
		if (!playerGuild.value || !guildData.value) return 0;
		return guildData.value.findIndex(g => g.name === playerGuild.value.name) + 1;
	});

	function getGuildIcon(guild) {
		if (guild?.icon) {
			return guild.icon;
		}
		return '/images/Guild No Icon.png';
	}

	function getGuildTag(guildName) {
		return guildName
			.split(' ')
			.map(word => word.charAt(0).toUpperCase())
			.join('');
	}

	function navToGuilds() {
		router.push({ path: '/guilds', query: route.query });
	}

	// Handle season change - reload both player and guild data
	async function onSeasonChange(season) {
		selectedSeason.value = season;
		await Promise.all([
			loadPlayerData(selectedSeason.value),
			loadGuildData(selectedSeason.value)
		]);
	}

	// Load player and guild data on mount
	onMounted(async () => {
		await Promise.all([
			loadPlayerData(selectedSeason.value),
			loadGuildData(selectedSeason.value)
		]);
	});

	const history = computed(() => {
		let scores = [player.value?.mmr];
		for (let i = player.value?.history.length - 1; i >= 0; i--) {
			const change = player.value?.history[i];
			scores.push(scores[scores.length - 1] - change);
		}
		return scores.reverse();
	});

	const chartOptions = computed(() => {
		if (!player.value) return {};

		return {
			chart: {
				type: "spline",
				styledMode: true,
			},
			title: {
				text: "MMR History",
			},
			subtitle: {
				text: `Player: ${player.value?.name}`,
			},
			xAxis: {
				title: {
					text: "Mogis",
				},
				categories: history.value.map((x, index) => `${index + 1}`),
				accessibility: {
					description: "Time",
				},
			},
			yAxis: {
				title: {
					text: "MMR",
				},
			},
			tooltip: {
				crosshairs: true,
				shared: true,
			},
			plotOptions: {
				spline: {
					marker: {
						radius: 4,
						lineColor: "#666666",
						lineWidth: 1,
					},
				},
			},
			series: [
				{
					name: `${player.value?.name}'s MMR developement'`,
					marker: {
						symbol: "square",
					},
					data: history.value,
				},
			],
		};
	});

    useSeoMeta({
        title: computed(() => `${player.value ? `${player.value.name}'s ` : ''}Player Profile - MK8DX-yuzu Lounge`),
        description: computed(() => `View ${player.value ? `the profile of ${player.value.name}, including` : 'player profiles including'} MMR, wins, losses, and guild affiliation${player.value ? '' : 's'} in the MK8DX-yuzu Lounge.`),
        ogTitle: computed(() => `${player.value ? `${player.value.name}'s ` : ''}Player Profile - MK8DX-yuzu Lounge`),
        ogDescription: computed(() => `View ${player.value ? `the profile of ${player.value.name}, including` : 'player profiles including'} MMR, wins, losses, and guild affiliation${player.value ? '' : 's'} in the MK8DX-yuzu Lounge.`)
    });
</script>

<style scoped>
.content {
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.profile-container {
    display: flex;
    justify-content: center;
    padding: 0% 8%;
    margin: 20px 0px;
    width: 100%;
}

.profile-container-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 100%;
    max-width: 1800px;
}

.season-selector {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    margin: 0;
}

.player-not-found {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 20px;
    margin-top: 40px;
}

.player-not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
    max-width: 600px;
    animation: reveal 0.70s 1 cubic-bezier(0.17, 0.84, 0.44, 1)
}

.player-not-found-content h2 {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-weight: bold;
    color: #ff6b6b;
    margin: 0;
}

.player-not-found-content p {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.6;
}

.player-profile-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.rank-icon-background {
    z-index: 0;
    position: relative;
    width: 30%;
    max-width: 1800px;
}

.rank-icon-background img {
    width: 100%;
    aspect-ratio: 1 / 1;
    -webkit-mask-image: linear-gradient(to bottom,black 10%,transparent 70%); /* Original value 80% */
    mask-image: linear-gradient(to bottom,black 10%,transparent 70%);
}

.overlay {
    z-index: 10;
    position: absolute;
    /* margin-top: 18%; */
    left: 0; 
    right: 0;
    bottom: 5%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: fit-content;
}

.overlay p {
    font-size: clamp(1rem, 1.25vw, 2rem);
}

.season-number {
    font-size: 1vw;
}

.player-name {
    font-size: 4vw;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.rank-info {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.rank-info p {
    font-size: clamp(1rem, 1.25vw, 2rem);
}

.stats {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-around;
    /* gap: 10vw; */
}

.stat {
    display: flex;
    flex-direction: column;
    padding: 10px 10px;
}

.stat-title {
    font-size: clamp(1rem, 0.75vw, 2rem);
}

.stat-value {
    font-size: clamp(1.25rem, 1.25vw, 2rem);
}

.history-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 40px;
}

.gradient-blur {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
}
.gradient-blur > div,
.gradient-blur::before,
.gradient-blur::after {
    position: absolute;
    inset: 0;
}
.gradient-blur::before {
    content: "";
    z-index: 1;
    backdrop-filter: blur(1px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 1) 12.5%,
      rgba(0, 0, 0, 1) 25%,
      rgba(0, 0, 0, 0) 37.5%
    );
}
.gradient-blur > div:nth-of-type(1) {
    z-index: 2;
    backdrop-filter: blur(2px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 12.5%,
      rgba(0, 0, 0, 1) 25%,
      rgba(0, 0, 0, 1) 37.5%,
      rgba(0, 0, 0, 0) 50%
    );
}
.gradient-blur > div:nth-of-type(2) {
    z-index: 3;
    backdrop-filter: blur(4px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 25%,
      rgba(0, 0, 0, 1) 37.5%,
      rgba(0, 0, 0, 1) 50%,
      rgba(0, 0, 0, 0) 62.5%
    );
}
.gradient-blur > div:nth-of-type(3) {
    z-index: 4;
    backdrop-filter: blur(8px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 37.5%,
      rgba(0, 0, 0, 1) 50%,
      rgba(0, 0, 0, 1) 62.5%,
      rgba(0, 0, 0, 0) 75%
    );
}
.gradient-blur > div:nth-of-type(4) {
    z-index: 5;
    backdrop-filter: blur(16px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 1) 62.5%,
      rgba(0, 0, 0, 1) 75%,
      rgba(0, 0, 0, 0) 87.5%
    );
}
.gradient-blur > div:nth-of-type(5) {
    z-index: 6;
    backdrop-filter: blur(32px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 62.5%,
      rgba(0, 0, 0, 1) 75%,
      rgba(0, 0, 0, 1) 87.5%,
      rgba(0, 0, 0, 0) 100%
    );
}
.gradient-blur > div:nth-of-type(6) {
    z-index: 7;
    backdrop-filter: blur(64px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 75%,
      rgba(0, 0, 0, 1) 87.5%,
      rgba(0, 0, 0, 1) 100%
    );
}
.gradient-blur::after {
    content: "";
    z-index: 8;
    backdrop-filter: blur(128px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 87.5%,
      rgba(0, 0, 0, 1) 100%
    );
}

.gradient-rank {
    z-index: 10;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100dvw;
    height: 100%;
    /* background: linear-gradient(to left, #ff5770, #e4428d, #c42da8, #9e16c3, #6501de, #9e16c3, #c42da8, #e4428d, #ff5770); */
    /* background: linear-gradient(to left, var(--rank-primary), var(--rank-secondary), var(--rank-primary)); */
    background: linear-gradient(to left,
        color-mix(in srgb, var(--rank-primary) 60%, transparent),
        color-mix(in srgb, var(--rank-secondary) 70%, transparent),
        color-mix(in srgb, var(--rank-primary) 60%, transparent));
    background-size: 200% 200%;
    filter: blur(12px);
    /* transform: scale(0.9); */
    animation: 
        animate-gradient-start-1 2s ease-out 1s 1 forwards,
        animate-gradient 2s linear 1s infinite;
    -webkit-mask-image: 
        linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%),
        linear-gradient(to top, 
            rgba(0, 0, 0, 1) 0%, 
            rgba(0, 0, 0, 0.5) 15%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.05) 50%,
            rgba(0, 0, 0, 0) 70%
        ),
        linear-gradient(to bottom, black 0%, black 98%, transparent 100%); /* To prevent a hard cutoff at the bottom of the gradient, tweaking might be needed */
    mask-image: 
        linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%),
        linear-gradient(to top, 
            rgba(0, 0, 0, 1) 0%, 
            rgba(0, 0, 0, 0.5) 15%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.05) 50%,
            rgba(0, 0, 0, 0) 70%
        ),
        linear-gradient(to bottom, black 0%, black 98%, transparent 100%); /* To prevent a hard cutoff at the bottom of the gradient, tweaking might be needed */
    mask-composite: intersect;
    opacity: 0;
}

.gradient-rank::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    /* background: linear-gradient(to left, #ff5770, #e4428d, #c42da8, #9e16c3, #6501de, #9e16c3, #c42da8, #e4428d, #ff5770); */
    /* background: linear-gradient(to left, var(--rank-primary), var(--rank-secondary), var(--rank-primary)); */
    background: linear-gradient(to left, color-mix(in srgb, var(--rank-primary) 60%, transparent),
        color-mix(in srgb, var(--rank-secondary) 70%, transparent),
        color-mix(in srgb, var(--rank-primary) 60%, transparent));
    background-size: 200% 200%;
    filter: blur(12px);
    /* transform: scale(0.9); */
    animation: animate-gradient-start-2 2s ease-out 1s 1 forwards, animate-gradient 2s linear 1s infinite reverse;
    mask-composite: intersect;
    opacity: 0.8;
}

.gradient-rank::after {
    content: "";
    z-index: 10;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to left, #fff 0%, transparent 3%, transparent 42%, #fff 44%, transparent 46%, transparent 83%, #fff 85%, transparent 88%, transparent 95%, #fff 100%);
    background-size: 200% 200%;
    filter: blur(12px);
    /* transform: scale(1, 3); */
    animation: animate-gradient-start-3 2s ease-out 1s 1 forwards, animate-gradient 8s linear 1s infinite;
    mask-composite: intersect;
    opacity: 0.2;
}

@keyframes animate-gradient-start-1 {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes animate-gradient-start-2 {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 0.6;
    }
}

@keyframes animate-gradient-start-3 {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 0.2;
    }
}

@keyframes animate-gradient {
    0% {
        background-position: 0% 50%;
    }
    100% {
        background-position: 200% 50%;
    }
}

/* Guild Section Styles */
.guild-section {
    width: 100%;
    margin-top: 30px;
}

.guild-section-header {
    margin-bottom: 15px;
}

.guild-section-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
}

.player-guild-card {
    background: rgba(41, 41, 41, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
}

.player-guild-card:hover {
    background: rgba(70, 70, 70, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
}

.player-guild-header {
    display: flex;
    align-items: center;
    padding: 20px;
    gap: 20px;
}

.player-guild-rank-section {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 60px;
}

.player-guild-rank {
    font-size: 1.5rem;
    font-weight: bold;
    color: #02bae7;
    background: rgba(2, 186, 231, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(2, 186, 231, 0.3);
}

.player-guild-logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
}

.player-guild-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    padding: 4px;
}

.player-guild-main-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.player-guild-title-section {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.player-guild-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
    margin: 0;
}

.player-guild-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: bold;
    border: 1px solid rgba(255, 255, 255, 0.2);
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.player-role-badge {
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: bold;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.player-role-badge.owner {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.4);
}

.player-role-badge.member {
    background: rgba(2, 186, 231, 0.2);
    color: #02bae7;
    border: 1px solid rgba(2, 186, 231, 0.4);
}

.player-guild-stats {
    display: flex;
    gap: 24px;
}

.player-guild-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.player-guild-stat-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.player-guild-stat-value {
    font-size: 1.25rem;
    font-weight: bold;
}

@media only screen and (max-width:767px) {
    .profile-container {
        padding: 0% 4%;
    }

    .rank-icon-background {
        width: 100%;
    }

    .season-selector {
        position: initial;
        margin-bottom: 10px;
    }

    .player-not-found {
        padding: 40px 15px;
        margin-top: 20px;
    }

    .player-not-found-content h2 {
        font-size: 1.5rem;
    }

    .player-not-found-content p {
        font-size: 1rem;
    }

    .player-not-found-content img {
        width: 120px;
        height: 120px;
    }

    .overlay p {
        font-size: 16px;
    }

    .player-name {
        font-size: 44px;
    }

    /* .rank-info p {
        font-size: 16px;
    } */

    /* .stats {
        gap: 5vw;
    } */

    .stat-title {
        font-size: 16px;
    }
    
    .stat-value {
        font-size: 20px;
    }

    .guild-section {
        margin-top: 20px;
    }

    .guild-section-header h3 {
        font-size: 1.25rem;
    }

    .player-guild-header {
        padding: 16px;
        flex-wrap: wrap;
        gap: 16px;
    }

    .player-guild-rank {
        font-size: 1.2rem;
        padding: 6px 12px;
    }

    .player-guild-logo {
        width: 60px;
        height: 60px;
    }

    .player-guild-name {
        font-size: 1.25rem;
    }

    .player-guild-tag {
        font-size: 0.8rem;
        padding: 3px 10px;
    }

    .player-role-badge {
        font-size: 0.75rem;
        padding: 3px 10px;
    }

    .player-guild-stats {
        gap: 16px;
        flex-wrap: wrap;
    }

    .player-guild-stat-value {
        font-size: 1.1rem;
    }
}

@media only screen and (max-width:480px) {
    .player-guild-header {
        flex-direction: row;
        text-align: left;
        gap: 10px;
        padding: 10px;
    }

    .player-guild-rank-section {
        min-width: 40px;
        justify-content: flex-start;
    }

    .player-guild-rank {
        font-size: 1.1rem;
        padding: 4px 10px;
    }

    .player-guild-logo-section {
        min-width: 60px;
    }

    .player-guild-logo {
        width: 60px;
        height: 60px;
    }

    .player-guild-main-info {
        gap: 8px;
    }

    .player-guild-name {
        font-size: 1.15rem;
    }

    .player-guild-title-section {
        flex-direction: row;
        gap: 6px;
        flex-wrap: wrap;
    }

    .player-guild-tag {
        font-size: 0.8rem;
        padding: 2px 8px;
    }

    .player-guild-stats {
        gap: 10px;
        flex-wrap: wrap;
    }

    .player-guild-stat-value {
        font-size: 1rem;
    }
}
</style>