<template>
	<div>
		<div v-if="player" class="md:p-10">
			<div class="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 py-8">
				<div>
					<p class="text-5xl py-8">{{ player.name }}</p>
					<div class="text-3xl">
						<p :class="[getColor(player.mmr)]">{{ player.mmr }} MMR</p>
						<p :class="[getColor(player.mmr)]">{{ getRank(player.mmr) }} Rank</p>
					</div>
				</div>
				<p class="text-4xl py-8">Rank #{{ playerData.findIndex(obj => obj.name === player.name)+1 }} serverwide</p>
				<img class="w-48 h-48" :src="`/images/ranks/${getRank(player.mmr).toLowerCase()}.webp`" alt="rank icon" />
			</div>
			<p class="text-4xl">History:</p>
			<p>{{ player.history.join(", ") }}</p>
	
			<highchart :options="chartOptions" />
		</div>
		<div v-else class="text-5xl flex flex-col items-center py-10">
			<p>This player does not exist</p>
			<img src="/images/MK8D-PoliceRed.png" alt="error icon" width="200" height="200">
		</div>
	</div>
</template>

<script setup>
	const route = useRoute();
	const name = route.params.name;

	const playerData = useState("data");
	const player = computed(() => playerData.value.filter((player) => player.name == name)[0]);

	const { getColor } = useColor();

	function getRank(mmr) {
		if (mmr < 0) {
			return "Wood";
		} else if (mmr >= 0 && mmr <= 1499) {
			return "Bronze";
		} else if (mmr >= 1500 && mmr <= 2999) {
			return "Silver";
		} else if (mmr >= 3000 && mmr <= 5099) {
			return "Gold";
		} else if (mmr >= 5100 && mmr <= 6999) {
			return "Platinum";
		} else if (mmr >= 7000 && mmr <= 9499) {
			return "Diamond";
		} else if (mmr >= 9500) {
			return "Master";
		}
	}

	const scores = [player.value?.mmr];
	for (let i = player.value?.history.length - 1; i >= 0; i--) {
	    const change = player.value?.history[i];
	    scores.push(scores[scores.length - 1] - change);
	}
	const history = scores.reverse();


	const chartOptions = {
		chart: {
			type: "spline",
            styledMode: true
		},
		title: {
			text: "MMR History",
		},
		subtitle: {
			text: `Player: ${player.value?.name}`,
		},
		xAxis: {
			categories: scores.map((x, index) => `${index+1} mogis ago`).reverse(),
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
				data: history
			},
		],
	};
</script>
