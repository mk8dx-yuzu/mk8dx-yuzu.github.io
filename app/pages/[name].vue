<template>
	<div>
		<Loader v-if="!hasMounted || !hasLoaded" />
		<ErrorTxt v-else-if="hasMounted && hasLoaded && !playerData.length" />
		<div v-else-if="player" class="content">
			<NoticeBanner
				v-if="selectedSeason != 4" color="blue">
				<p>You are viewing historical player data from Season {{ selectedSeason }}. Select the current season on the leaderboard for up-to-date stats.</p>
			</NoticeBanner>
			<NoticeBanner v-else-if="suspended" color="red">
				<p>This player is currently suspended and may no longer participate in MK8DX-yuzu Lounge.</p>
			</NoticeBanner>
			<div class="profile-container">
				<div class="profile-container-inner">
					<div class="rank-icon-background">
						<img
							:src="`https://raw.githubusercontent.com/mk8dx-yuzu/ranks/refs/heads/main/${getRank(player.mmr, playerData.indexOf(player))}.png`"
							alt="rank icon" />
						<div class="gradient-blur">
							<div v-for="i in 3" :key="i"></div>
						</div>
						<div class="overlay">
							<a class="player-name" :href="`https://discord.com/users/${player.discord}`">{{ player.name }}</a>
							<!-- <h2>Season {{ selectedSeason }}</h2> -->
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
					<div class="history-container">
						<!-- <p v-if="player?.name">Extended History:</p> -->
						<!-- FIXME: highchart has weird width behavior, making everything else displayed wrong. Why? idfk-->
						<highchart v-if="player?.name" :options="chartOptions" class="overflow-x-auto" />
					</div>
				</div>
			</div>
		</div>
		<div v-else class="text-5xl flex flex-col items-center py-10">
			<p>This player does not exist</p>
			<img src="/images/MK8D-PoliceRed.png" alt="error icon" width="200" height="200" />
		</div>
	</div>
</template>

<script setup>
	import { useRank } from "~/composables/useRank";

	const route = useRoute();
	const name = route.params.name;

	const { playerData, hasLoaded } = usePlayerData();
	const selectedSeason = useState("selectedSeason", () => (route.query.s == 3 ? 3 : 4));
	const hasMounted = useState("mounted", () => false);

	const player = computed(() => playerData.value.filter((player) => player.name == name)[0]);
	const suspended = computed(() => player.value?.suspended == true);

	const { getColor } = useColor();
	const { getRank } = useRank();

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
</script>

<style>
.content {
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.profile-container {
    display: flex;
    justify-content: center;
    padding: 0% 8%;
    margin: 60px 0px;
}

.profile-container-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
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

@media only screen and (max-width:767px) {
    .rank-icon-background {
        width: 100%;
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
}
</style>