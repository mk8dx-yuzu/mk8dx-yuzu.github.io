<template>
	<div>
		<div v-if="player" class="md:p-10 space-y-2">
			<div class="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 py-8">
				<div>
					<a class="text-5xl py-8" :href="`https://discord.com/users/${player.discord}`">{{ player.name }}</a>
					<div class="text-3xl">
						<p :class="[getColor(player.mmr, playerData.indexOf(player))]">{{ player.mmr }} MMR</p>
						<p :class="[getColor(player.mmr, playerData.indexOf(player))]">{{ getRank(player.mmr, playerData.indexOf(player)) }} Rank</p>
					</div>
				</div>
				<p class="text-4xl py-8">Rank #{{ playerData.findIndex((obj) => obj.name === player.name) + 1 }} serverwide</p>
				<img class="w-48 h-48" :src="`https://github.com/mk8dx-yuzu/ranks/blob/main/${getRank(player.mmr, playerData.indexOf(player)).png`" alt="rank icon" />
			</div>
			<div>
				<p class="text-2xl">Your last 5 MMR changes:</p>
				<p>{{ player.history.slice(-5).join(", ") }}</p>
			</div>
			<div>
				<p class="text-2xl">{{ Math.round((player.wins / (player.wins + player.losses)) * 100) }}% Winrate</p>
				<p>out of {{ player.wins + player.losses }} total mogis</p>
			</div>
			<div>
				<p class="text-4xl">Extended History:</p>
				<highchart :options="chartOptions" />
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

	const { getColor } = useColor();
	const { getRank } = useRank();

	const scores = [player.value?.mmr];
	for (let i = player.value?.history.length - 1; i >= 0; i--) {
		const change = player.value?.history[i];
		scores.push(scores[scores.length - 1] - change);
	}
	const history = scores.reverse();

	const chartOptions = {
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
			categories: scores.map((x, index) => `${index + 1} mogis ago`).reverse(),
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
				data: history,
			},
		],
	};
</script>
