<template>
	<div>
		<div class="title">
			<h1 class="text-center">Leaderboard</h1>
			<h2>Season 3</h2>
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

	const hasLoaded = useState("loaded")
	const hasMounted = useState("mounted", () => false);

	const playerData = useState("data")
	const searchQuery = useState('searchQuery')

	const fuseOptions = {
		keys: [
			"name",
			"mmr"
		]
	};
	const fuse = new Fuse(playerData.value, fuseOptions);
	const filteredPlayers = computed(() => {
		if (searchQuery.value) return fuse.search(searchQuery.value).map((item) => item.item)
		return playerData.value.filter((item) => !(item["wins"] == 0 && item["mmr"] == 2000))
	})

	const { getColor } = useColor()

	function navTo(playerName) {
		router.push(`/${playerName}`)
	}
</script>
