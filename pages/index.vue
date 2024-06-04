<template>
	<div>
		<div class="title">
			<h1>Leaderboard</h1>
			<p>Here you can view your stats from our Mario Kart 8 Deluxe Yuzu Lounge!</p>
		</div>
	
		<Loader v-if="!hasLoaded"/>
		<ErrorTxt v-if="hasLoaded && !playerData.length"/>
	
		<div class="leaderboard-container">
			<table class="leaderboard-table" id="leaderboard-table">
				<thead>
					<tr>
						<th class="rank">Rank</th>
						<th>Player Name</th>
						<th>MMR</th>
						<th>Wins</th>
						<th>Losses</th>
					</tr>
				</thead>
				<tbody id="leaderboard-body">
					<tr v-for="(player, index) in playerData" :key="index" class="cursor-pointer" :class="[getColor(player.mmr)]" @click="navTo(player.name)">
						<td class="rank">{{ index + 1 }}</td>
						<td class="truncate max-w-24">{{ player.name }}</td>
						<td>{{ player.mmr }}</td>
						<td>{{ player.wins }}</td>
						<td>{{ player.losses }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="js">
	const router = useRouter()

	const url = useState("url")
	const hasLoaded = useState("loaded")

	const playerData = useState("data")

	const { getColor } = useColor()

	function navTo(playerName) {
		router.push(`/${playerName}`)
	}
</script>
