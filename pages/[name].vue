<template>
    <div v-if="player" class="p-10">
        <p class="text-5xl py-8">{{ player.name }}</p>

        <span class="md:flex space-y-6 justify-between">
            <div class="text-3xl">
                <p :class="[getColor(player.mmr)]">{{ player.mmr }} MMR</p>
                <p :class="[getColor(player.mmr)]">{{ getRank(player.mmr) }} Rank</p>
            </div>
            <img class="w-48 h-48" :src="`/images/ranks/${getRank(player.mmr).toLowerCase()}.webp`" alt="rank icon">
        </span>
        <p class="text-4xl">History:</p>
        <p>{{ player.history.join(", ") }}</p>
    </div>
    <div v-else>
        <p>This player does not exist</p>
    </div>
</template>

<script setup>
    const route = useRoute()
    const name = route.params.name

    const playerData = useState('data')
    const player = computed(() => playerData.value.filter((player) => player.name == name)[0])

    const { getColor } = useColor()

    function getRank(mmr) {
		if (mmr < 0) {
			return 'Wood';
		} else if (mmr >= 0 && mmr <= 1499) {
			return 'Bronze';
		} else if (mmr >= 1500 && mmr <= 2999) {
			return 'Silver';
		} else if (mmr >= 3000 && mmr <= 5099) {
			return 'Gold';
		} else if (mmr >= 5100 && mmr <= 6999) {
			return 'Platinum';
		} else if (mmr >= 7000 && mmr <= 9499) {
			return 'Diamond';
		} else if (mmr >= 9500) {
			return 'Master';
		}
	}
</script>

<style>
.rank10wood {
    color: rgb(102, 56, 18);
}
.rank09bronze {
    color: #cd7f32;
}
.rank08silver {
    color: #C0C0C0;
}
.rank07gold {
    color: #FFD700;
}
.rank06platinum {
    color: #3a7bae;
}
.rank03diamond {
    color: #B9F2FF;
}
.rank02master {
    color: #000000;
}
.rank01grandmaster {
    color: #570F21;
}
</style>