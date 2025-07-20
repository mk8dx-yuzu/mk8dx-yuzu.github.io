<template>
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
		{{
			"hi"
		}}
		{{
			props.data
		}}
		<tbody id="leaderboard-body">
			<tr
				v-for="(player, index) in filteredPlayers"
				:key="index"
				class="cursor-pointer"
				:class="[getColor(player.mmr, playerDataToUse.indexOf(player))]"
				@click="navTo(player.name)">
				<td class="rank">{{ playerDataToUse.indexOf(player) + 1 }}</td>
				<td class="truncate max-w-24">{{ player.name }}</td>
				<td>{{ player.mmr }}</td>
				<td>{{ player.wins }}</td>
				<td>{{ player.losses }}</td>
			</tr>
		</tbody>
	</table>
</template>

<script setup>
	import Fuse from "fuse.js";
	import { useColor } from "~/composables/useColor";
	const searchQuery = useState("searchQuery");
	const globalPlayerData = useState("data");
	const router = useRouter();

	const props = defineProps({
		data: {
			type: Array,
			default: () => [],
		},
	});

	const playerDataToUse = computed(() => {
		if (props.data.length) return props.data;
		return globalPlayerData.value;
	});

	const fuseOptions = {
		keys: ["name", "mmr"],
	};

	const filteredPlayers = computed(() => {
		if (!playerDataToUse.value) return [];

		const fuse = new Fuse(playerDataToUse.value, fuseOptions);

		if (!searchQuery.value) {
			return playerDataToUse.value.filter((player) => !(player["mmr"] == 2000 && player["wins"] == 0));
		}
		return fuse.search(searchQuery.value).map((result) => result.item);
	});

	const { getColor } = useColor();

	function navTo(playerName) {
		router.push(`/${playerName}`);
	}
</script>
