<template>
	<Leaderboard :data="data || []"></Leaderboard>
</template>

<script setup lang="js">
	const { data, pending } = await useLazyAsyncData('season-3-data', async () => {
	       const response = await $fetch('https://mk8dx-yuzu.kevnkkm.de/api/leaderboard?season=4')
	       return response.data
	   })

	definePageMeta({
		layout: 'default'
	})
</script>
