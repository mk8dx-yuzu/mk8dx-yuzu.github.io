<template>
  <div>
    <div class="content">
      <div class="title">
        <h1 class="text-center">
          Season Statistics
        </h1>
        <div class="flex items-center justify-center">
          <p>
            Interesting stats from our Mario Kart 8 Deluxe Yuzu Lounge events!
          </p>
        </div>
        <SeasonSelector
          v-model="selectedSeason"
          @change="onSeasonChange"
        />
      </div>

      <Loader v-if="!hasMounted || !hasLoaded" />

      <!-- Show informative message when no mogi data exists for selected season -->
      <div
        v-else-if="hasMounted && hasLoaded && (!mogiData || !mogiData.length)"
        class="no-data-container"
      >
        <div class="no-data-content">
          <img
            src="/images/MK8D-PoliceRed.png"
            alt="no data icon"
            width="150"
            height="150"
          >
          <h2>No Statistics Available for Season {{ selectedSeason }}</h2>
          <p>Mogi statistics were only introduced starting from Season 3.</p>
          <p>Please select Season 3 or later above to view statistics.</p>
        </div>
      </div>

      <div
        v-else
        class="stats-container"
      >
        <div class="stats-grid">
          <div class="stat-card mogis-played-card">
            <h3>Total Mogis Played</h3>
            <p class="stat-value">
              {{ stats.totalMogis }}
            </p>
          </div>

          <div class="stat-card average-duration-card">
            <h3>Average Duration</h3>
            <p class="stat-value">
              {{ stats.averageDurationMinutes }} minutes
            </p>
          </div>

          <div class="stat-card average-dcs-card">
            <h3>Average DCs per Mogi</h3>
            <p class="stat-value">
              {{ stats.averageDisconnections }}
            </p>
          </div>

          <div class="stat-card max-dcs-card">
            <h3>Most DCs in a Mogi</h3>
            <p class="stat-value">
              {{ stats.maxDisconnections }}
            </p>
          </div>

          <div class="stat-card average-subs-card">
            <h3>Average Subs per Mogi</h3>
            <p class="stat-value">
              {{ stats.averageSubs }}
            </p>
          </div>

          <div class="stat-card average-players-card">
            <h3>Average Players per Mogi</h3>
            <p class="stat-value">
              {{ stats.averagePlayersPerMogi }}
            </p>
          </div>

          <div class="stat-card biggest-mmr-changes-card">
            <h3>Biggest MMR Changes</h3>
            <div class="mmr-changes">
              <p><span class="gain">📈 Gain:</span> {{ stats.biggestGain }}</p>
              <p><span class="loss">📉 Loss:</span> {{ stats.biggestLoss }}</p>
            </div>
          </div>

          <div class="stat-card wide most-active-players-card">
            <h3>Most Active Players</h3>
            <div
              v-if="stats.top3Players && stats.top3Players.length > 0"
              class="player-list"
            >
              <p
                v-for="([playerName, count], index) in stats.top3Players"
                :key="playerName"
              >
                <span class="rank-badge">{{ index + 1 }}</span>
                {{ playerName }}: <strong>{{ count }} mogis</strong>
              </p>
            </div>
            <p
              v-else
              class="no-data"
            >
              No player data available
            </p>
          </div>

          <div class="stat-card format-distribution-card">
            <h3>Format Distribution</h3>
            <div
              v-if="Object.keys(stats.formatsDict).length > 0"
              class="format-list"
            >
              <p
                v-for="(count, format) in stats.formatsDict"
                :key="format"
              >
                {{ format }}: <strong>{{ count }} mogis</strong>
                <span class="percentage">({{ ((count / stats.totalMogis) * 100).toFixed(1) }}%)</span>
              </p>
            </div>
            <!-- <PieChart v-if="formatChartData && Object.keys(stats.formatsDict).length > 0" :pieChartData="formatChartData" /> -->
            <p
              v-else
              class="no-data"
            >
              No format data available
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { useMogiData } from '~/composables/useMogiData'

const route = useRoute()
const hasMounted = useState('mounted', () => false)
const { mogiData, hasLoaded, isDataFromCache, loadMogiData, calculateStats }
  = useMogiData()
const selectedSeason = useState('selectedSeason', () =>
  [1, 2, 3].includes(Number(route.query.s)) ? Number(route.query.s) : 4
)

const formatChartData = ref(null)

const stats = ref({
  totalMogis: 0,
  averageDurationMinutes: '0.0',
  averageDisconnections: '0.0',
  maxDisconnections: 0,
  averageSubs: '0.0',
  averagePlayersPerMogi: '0.0',
  biggestGain: 0,
  biggestLoss: 0,
  top3Players: [],
  formatsDict: {}
})

async function updateStats() {
  if (!mogiData.value || mogiData.value.length === 0) {
    stats.value = {
      totalMogis: 0,
      averageDurationMinutes: '0.0',
      averageDisconnections: '0.0',
      maxDisconnections: 0,
      averageSubs: '0.0',
      averagePlayersPerMogi: '0.0',
      biggestGain: 0,
      biggestLoss: 0,
      top3Players: [],
      formatsDict: {}
    }
    formatChartData.value = null
  } else {
    stats.value = await calculateStats(mogiData.value, selectedSeason.value)
    await createFormatChart()
  }
}

async function createFormatChart() {
  // Create pie chart data structure for format distribution
  if (
    !stats.value.formatsDict
    || Object.keys(stats.value.formatsDict).length === 0
  ) {
    formatChartData.value = null
    return
  }

  const formatLabels = Object.keys(stats.value.formatsDict)
  const formatCounts = Object.values(stats.value.formatsDict)
  const formatPercentages = formatCounts.map(count =>
    ((count / stats.value.totalMogis) * 100).toFixed(1)
  )

  // Generate colors for each format
  const formatColors = [
    'rgb(46,176,250)',
    'rgb(240,163,196)',
    'rgb(179,185,201)',
    'rgb(255,193,7)',
    'rgb(40,167,69)',
    'rgb(220,53,69)',
    'rgb(111,66,193)',
    'rgb(253,126,20)'
  ]

  formatChartData.value = {
    type: 'pie',
    data: {
      labels: formatLabels,
      datasets: [
        {
          data: formatPercentages.map(p => parseFloat(p)),
          backgroundColor: formatColors.slice(0, formatLabels.length),
          hoverOffset: 5
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Format Distribution'
        }
      }
    }
  }
}

async function onSeasonChange(season) {
  selectedSeason.value = season
  await loadMogiData(selectedSeason.value)
  await updateStats()
}

onMounted(async () => {
  hasMounted.value = true
  await onSeasonChange(selectedSeason.value)
})

// Watch for changes in mogiData and update stats
watch(mogiData, async () => {
  await updateStats()
})

useSeoMeta({
  title: 'Season Statistics - MK8DX-yuzu Lounge',
  description:
    'View detailed seasonal statistics from our Mario Kart 8 Deluxe Yuzu Lounge events.',
  ogTitle: 'Season Statistics - MK8DX-yuzu Lounge',
  ogDescription:
    'View detailed seasonal statistics from our Mario Kart 8 Deluxe Yuzu Lounge events.'
})
</script>

<style scoped>
.content {
  /* not needed after footer fix from a while ago */
  /* min-height: 100dvh; */
}

.stats-container {
  display: flex;
  justify-content: center;
  padding: 0 20px;
  max-width: 1800px;
  margin: 0 auto 20px auto;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  animation: cardAppear 0.6s ease-out forwards;
  opacity: 0;
  flex: 1;
  min-width: 300px;
}

/* TODO: Season-Stats Design Update */
/* .stat-card::after {
  content: "";
  width: 90px;
  height: 90px;
  background-size: contain;
  position: absolute;
  bottom: 0;
  right: 0;
  filter: invert();
  opacity: 0.2;
}

.stat-card.mogis-played-card::after {
  background-image: url(/images/stats/Equal%20Sign.svg);
  right: 10px;
}

.stat-card.average-duration-card::after {
  background-image: url(/images/stats/Timer.svg);
}

.stat-card.average-dcs-card::after {
  background-image: url(/images/stats/Disconnection.svg);
  transform: none;
}

.stat-card.max-dcs-card::after {
  background-image: url(/images/stats/Disconnection.svg);
  transform: none;
}

.stat-card.average-subs-card::after {
  background-image: url(/images/stats/Substitute.svg);
  right: 10px;
}

.stat-card.average-players-card::after {
  background-image: url(/images/stats/Players.svg);
  right: 10px;
}

.stat-card.biggest-mmr-changes-card::after {
  background-image: url(/images/stats/Plus%20Sign.svg);
  right: 10px;
}

.stat-card.most-active-players-card::after {
  background-image: url(/images/stats/Shower.svg);
  right: 10px;
}

.stat-card.format-distribution-card::after {
  background-image: url(/images/stats/Pie%20Chart.svg);
  right: 10px;
} */

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}
.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}
.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}
.stat-card:nth-child(4) {
  animation-delay: 0.4s;
}
.stat-card:nth-child(5) {
  animation-delay: 0.5s;
}
.stat-card:nth-child(6) {
  animation-delay: 0.6s;
}
.stat-card:nth-child(7) {
  animation-delay: 0.7s;
}
.stat-card:nth-child(8) {
  animation-delay: 0.8s;
}
.stat-card:nth-child(9) {
  animation-delay: 0.9s;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card.wide {
  flex: 2;
  min-width: 600px;
}

.stat-card:hover {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-card h3 {
  margin-bottom: 15px;
  /* color: #02bae7; */
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  font-weight: 600;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mmr-changes p {
  margin: 8px 0;
  font-size: 18px;
}

.gain {
  color: #4ade80;
  font-weight: bold;
}

.loss {
  color: #f87171;
  font-weight: bold;
}

.player-list p,
.format-list p {
  margin: 8px 0;
  font-size: 16px;
  text-align: left;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-list p:last-child,
.format-list p:last-child {
  border-bottom: none;
}

.rank-badge {
  background: #02bae7;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 10px;
  flex-shrink: 0;
}

.percentage {
  color: #02bae7;
  font-size: 14px;
}

.no-data {
  color: #888;
  font-style: italic;
  text-align: center;
  margin: 20px 0;
}

.no-data-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  margin: 40px 0;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  max-width: 600px;
  animation: reveal 0.7s 1 cubic-bezier(0.17, 0.84, 0.44, 1);
}

.no-data-content h2 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: bold;
  color: #ff6b6b;
  margin: 0;
}

.no-data-content p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.player-list {
  max-height: 200px;
  overflow-y: auto;
}

.format-list {
  max-height: 200px;
  overflow-y: auto;
}

/* Scrollbar styling */
.player-list::-webkit-scrollbar,
.format-list::-webkit-scrollbar {
  width: 8px;
}

.player-list::-webkit-scrollbar-track,
.format-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.player-list::-webkit-scrollbar-thumb,
.format-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.player-list::-webkit-scrollbar-thumb:hover,
.format-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .stat-card.wide {
    flex: 1;
    min-width: 300px;
  }

  .stats-grid {
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
  }

  .no-data-container {
    padding: 40px 15px;
    margin: 20px 0;
  }

  .no-data-content h2 {
    font-size: 1.5rem;
  }

  .no-data-content p {
    font-size: 1rem;
  }

  .no-data-content img {
    width: 120px;
    height: 120px;
  }
}
</style>
