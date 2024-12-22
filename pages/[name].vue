<template>
	<div>
		<Loader v-if="!hasMounted || !hasLoaded" />
		<ErrorTxt v-else-if="hasMounted && hasLoaded && !playerData.length" />
		<div v-if="player" class="content">
			<div class="profile-container">
				<div class="rank-icon-background">
					<img
						:src="`https://raw.githubusercontent.com/mk8dx-yuzu/ranks/refs/heads/main/${getRank(player.mmr, playerData.indexOf(player))}.png`"
						alt="rank icon" />
					<div class="gradient-blur">
						<div v-for="i in 3" :key="i"></div>
					</div>
					<div class="overlay">
					<a class="player-name" :href="`https://discord.com/users/${player.discord}`">{{ player.name }}</a>
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
						<p class="stat-value">{{ player.history.slice(-5).join(", ") }}</p>
					</div>
					<div class="stat">
						<p class="stat-value"><b>{{ player.wins }}</b> total wins</p>
						<p class="stat-title">and <b>{{ player.losses }}</b> total losses</p>
					</div>
					<div class="stat">
						<p class="stat-value"><b>{{ Math.round((player.wins / (player.wins + player.losses)) * 100) }}%</b> Winrate</p>
						<p class="stat-title">out of <b>{{ player.wins + player.losses }}</b> total mogis</p>
					</div>
					<div class="stat">
						<p class="stat-title">With an average of 68 minutes per mogi</p>
						<p class="stat-value"><b>{{ (player.wins + player.losses) * 68 }} minutes</b> wasted</p>
					</div>
					<div class="stat">
						<p class="stat-value"><b>{{ player.disconnects }}</b> disconnects</p>
						<p class="stat-title">in this season</p>
					</div>
				</div>
				<div class="history-container">
					<!-- <p v-if="player?.name">Extended History:</p> -->
					 <!-- FIXME: highchart has weird width behavior, making everything else displayed wrong. Why? idfk-->
					<highchart v-if="player?.name" :options="chartOptions" />
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

	const playerData = useState("data");
	const player = computed(() => playerData.value.filter((player) => player.name == name)[0]);

	const hasLoaded = useState("loaded");
	const hasMounted = useState("mounted", () => false);

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
