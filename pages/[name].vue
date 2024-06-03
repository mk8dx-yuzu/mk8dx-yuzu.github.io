<template>
	<div v-if="player" class="p-10">
		<p class="text-5xl py-8">{{ player.name }}</p>

		<span class="md:flex space-y-6 justify-between">
			<div class="text-3xl">
				<p :class="[getColor(player.mmr)]">{{ player.mmr }} MMR</p>
				<p :class="[getColor(player.mmr)]">{{ getRank(player.mmr) }} Rank</p>
			</div>
			<img class="w-48 h-48" :src="`/images/ranks/${getRank(player.mmr).toLowerCase()}.webp`" alt="rank icon" />
		</span>
		<p class="text-4xl">History:</p>
		<p>{{ player.history.join(", ") }}</p>
        <p>{{ history }}</p>

		<highchart :options="chartOptions" />
	</div>
	<div v-else>
		<p>This player does not exist</p>
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

	const scores = [player.value.mmr];
	for (let i = player.value.history.length - 1; i >= 0; i--) {
	    const change = player.value.history[i];
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
			text: `Player: ${player.value.name}`,
		},
		xAxis: {
			categories: ["11 mogis ago", "10 mogis ago", "9 mogis ago", "8 mogis ago", "7 mogis ago", "6 mogis ago", "5 mogis ago", "4 mogis ago", "3 mogis ago", "2 mogis ago", "latest mogi"],
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
				name: `${player.value.name}'s MMR developement'`,
				marker: {
					symbol: "square",
				},
				data: history
			},
		],
	};
</script>

<style>
	.rank10wood {
		color: rgb(102, 56, 18);
	}
	.rank09bronze {
		color: #cd7f32;
	}
	.rank08silver {
		color: #c0c0c0;
	}
	.rank07gold {
		color: #ffd700;
	}
	.rank06platinum {
		color: #3a7bae;
	}
	.rank03diamond {
		color: #b9f2ff;
	}
	.rank02master {
		color: #000000;
	}
	.rank01grandmaster {
		color: #570f21;
	}
</style>
