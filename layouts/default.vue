<template>
	<div>
		<div class="title">
			<h1 class="text-center">Leaderboard</h1>
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
			<UTabs v-model="active" :items="season_items" />
		</div>
		<Loader v-if="!hasMounted || !hasLoaded" />
		<ErrorTxt v-else-if="hasMounted && hasLoaded && !playerData.length" />
		<div v-else class="leaderboard-container">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="js">
	import { useRouter } from 'vue-router'

	import { useState } from '#app'

	const router = useRouter()
	const route = useRoute()


	const hasLoaded = useState("loaded")
	const hasMounted = useState("mounted", () => false);

	const playerData = useState("data")


	const season_items = [
	{
		label: 'Season 4',
		value: 's4',
	},
	{
		label: 'Season 3',
		value: 's3'
	}
	]
	const active = computed({
	get() {
		if (route.fullPath == "/") return 0
		if (route.fullPath == "/season-3") return 1
	},
	set(tab) {
		if (tab == 0) {
			router.push({
				path: '/',
			})
			return 0
		}
		if (tab == 1) {
			router.push({
				path: '/season-3',
			})
		}
		else {
			router.push({
				path: '/season-3',
			})
		}
	}
	})
</script>
