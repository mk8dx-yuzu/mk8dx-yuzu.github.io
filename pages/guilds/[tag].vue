<template>
    <div>
        <Loader v-if="!hasMounted || !hasLoaded" />
        <ErrorTxt v-else-if="hasMounted && hasLoaded && !guildData.length" />
        <div v-else-if="targetGuild" class="content">
            <!-- TODO implement this before season 4 ends -->
            <!-- <NoticeBanner v-if="selectedSeason != 4" color="blue">
                <p>You are viewing historical guild data from Season {{ selectedSeason }}. Select the current season on
                    the leaderboard for up-to-date stats.</p>
            </NoticeBanner> -->
            <div class="profile-container">
                <div class="profile-container-inner">
                    <div class="rank-icon-background">
                        <img :src="`https://raw.githubusercontent.com/mk8dx-yuzu/ranks/refs/heads/main/${getRank(targetGuild.mmr, guildData.indexOf(targetGuild))}.png`"
                            alt="rank icon" />
                        <div class="gradient-blur">
                            <div v-for="i in 3" :key="i"></div>
                        </div>
                        <div class="overlay">
                            <p class="player-name">{{ targetGuild.name }}</p>
                            <div class="rank-info">
                                <p :class="[getColor(targetGuild.mmr, guildData.indexOf(targetGuild))]">
                                    {{ targetGuild.mmr }} MMR
                                </p>
                                <p :class="[getColor(targetGuild.mmr, guildData.indexOf(targetGuild))]">●</p>
                                <p :class="[getColor(targetGuild.mmr, guildData.indexOf(targetGuild))]">
                                    {{ getRank(targetGuild.mmr, guildData.indexOf(targetGuild)) }} Rank
                                </p>
                            </div>
                            <p>Rank #{{guildData.findIndex((obj) => obj.name === targetGuild.name) + 1}} serverwide</p>
                        </div>
                    </div>
                    <div class="stats">
                        <div class="stat">
                            <p class="stat-title">Your last 5 MMR changes:</p>
                            <p class="stat-value">
                                {{ targetGuild.history.length != 0 ? targetGuild.history.slice(-5).join(", ") : "None"
                                }}</p>
                        </div>
                        <div class="stat">
                            <p class="stat-value">
                                <b>{{ targetGuild.wins }}</b> total wins
                            </p>
                            <p class="stat-title">
                                and <b>{{ targetGuild.losses }}</b> total losses
                            </p>
                        </div>
                        <div class="stat">
                            <p class="stat-value">
                                <b>{{ targetGuild.wins + targetGuild.losses === 0 ? 0 : Math.round((targetGuild.wins /
                                    (targetGuild.wins +
                                        targetGuild.losses)) * 100) }}%</b> Winrate
                            </p>
                            <!-- <p class="stat-title">
                                out of <b>{{ targetGuild.wins + targetGuild.losses }}</b> total mogis
                            </p> -->
                        </div>
                    </div>
                    <div class="history-container">
                        <!-- <p v-if="player?.name">Extended History:</p> -->
                        <!-- FIXME: highchart has weird width behavior, making everything else displayed wrong. Why? idfk-->
                        <highchart v-if="targetGuild?.name" :options="chartOptions" class="overflow-x-auto" />
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-5xl flex flex-col items-center py-10">
            <p>This guild does not exist</p>
            <img src="/images/MK8D-PoliceRed.png" alt="error icon" width="200" height="200" />
        </div>
    </div>
</template>

<script setup>
const route = useRoute()
const { guildData, hasLoaded, loadGuildData } = useGuildData()
const { getColor } = useColor();
const { getRank } = useRank();

const hasMounted = useState("guildsMounted", () => false);

const guildTag = route.path.split("/").slice(-1)[0]

// Load guild data on component mount
onMounted(async () => {
    hasMounted.value = true;
    await Promise.all([
        loadGuildData(4),
    ]);
})

// Find the requested guild based on it's tag (filter name for capital letters)
const targetGuild = computed(() => {
    return guildData.value?.find(guild => {
        const capitalLetters = guild.name?.replace(/[^A-Z]/g, '') || '';
        return capitalLetters === guildTag;
    });
});

const history = computed(() => {
    let scores = [targetGuild.value?.mmr];
    for (let i = targetGuild.value?.history.length - 1; i >= 0; i--) {
        const change = targetGuild.value?.history[i];
        scores.push(scores[scores.length - 1] - change);
    }
    return scores.reverse();
});

const chartOptions = computed(() => {
    if (!targetGuild.value) return {};

    return {
        chart: {
            type: "spline",
            styledMode: true,
        },
        title: {
            text: "MMR History",
        },
        subtitle: {
            text: `Guild: ${targetGuild.value?.name}`,
        },
        xAxis: {
            title: {
                text: "Mogis",
            },
            categories: history.value.map((x, index) => `${index + 1}`),
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
                name: `${targetGuild.value?.name}'s MMR developement'`,
                marker: {
                    symbol: "square",
                },
                data: history.value,
            },
        ],
    };
});
</script>