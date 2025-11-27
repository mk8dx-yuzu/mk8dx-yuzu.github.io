<template>
	<div>
		<NoticeBanner color="purple">
			<p>Season 4 released! Check out the changes <a href="https://github.com/probablyjassin/bot-mk8dx-public/blob/main/README.md#the-4th-season-of-mk8dx-lounge-on-yuzu-online" target="_blank">here!</a></p>
		</NoticeBanner>
		<div class="title">
			<h1 class="text-center">Leaderboard</h1>
			<div class="flex items-center justify-between">
				<!-- <h2>Season {{ selectedSeason }}</h2> -->
			</div>
			<div class="flex">
				<p>Here you can view your stats from our Mario Kart 8 Deluxe Yuzu Lounge!</p>
				<UTooltip text="How to register" :popper="{ placement: 'right' }">
					<UButton
						class="h-6 w-6"
						style="background-color: transparent !important"
						icon="heroicons-question-mark-circle"
						to="https://discord.com/channels/1084911987626094654/1181312934803144724" />
				</UTooltip>
			</div>
			<SeasonSelector v-model="selectedSeason" @change="onSeasonChange" />
		</div>
		<Loader v-if="!hasMounted || !hasLoaded" />
		<ErrorTxt v-else-if="hasMounted && hasLoaded && !playerData.length" />
		<div v-else class="leaderboard-container">
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
					<tr
						v-for="(player, index) in filteredPlayers"
						:key="index"
						class="cursor-pointer"
						:class="[getColor(player.mmr, playerData.indexOf(player))]"
						@click="navTo(player.name)">
						<td class="rank">{{ playerData.indexOf(player) + 1 }}</td>
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
	import Fuse from 'fuse.js'
	import { useRouter } from 'vue-router'
	import { useColor } from '~/composables/useColor'
	import { useState } from '#app'

	const router = useRouter()
	const route = useRoute()

	const hasMounted = useState("mounted", () => false);
	const { playerData, hasLoaded, isDataFromCache, loadPlayerData, animateTable } = usePlayerData()
	const selectedSeason = useState("selectedSeason", () => (route.query.s == 3 ? 3 : 4));
	const searchQuery = useState('searchQuery')

	const fuseOptions = {
		keys: [
			"name",
			"mmr"
		]
	};

	const filteredPlayers = computed(() => {
		if (!playerData.value) return []

		const fuse = new Fuse(playerData.value, fuseOptions);

		if (!searchQuery.value) {
			return playerData.value.filter((player) => !(player["mmr"] == 2000 && player["wins"] == 0))
		}
		return fuse.search(searchQuery.value).map(result => result.item)
	})

	const { getColor } = useColor()

	function navTo(playerName) {
		router.push({path: `/${playerName}`, query: route.query})
	}

	async function onSeasonChange() {
		await loadPlayerData(selectedSeason.value)
		animateTable()
	}

	async function refreshData() {
		await loadPlayerData(selectedSeason.value, true) // Force refresh
		animateTable()
	}

	// Load Season 4 data by default when component mounts
	onMounted(() => {
		onSeasonChange()
	})
</script>
