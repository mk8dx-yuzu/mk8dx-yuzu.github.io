<template>
	<div>
		<div class="title">
			<h1 class="text-center">Guild Leaderboard</h1>
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
			<!-- <SeasonSelector v-model="selectedSeason" @change="onSeasonChange" /> -->
		</div>
		<Loader v-if="!hasMounted || !hasLoaded" />
		<ErrorTxt v-else-if="hasMounted && hasLoaded && !guilds.length" />
		<div v-else class="guilds-container">
			<!-- For dynamic data -->
			<div
				v-for="(guild, index) in guilds"
				:key="guild.name"
				class="guild-card"
				:class="getColor(guild.mmr)"
				@click="navToGuild(guild.name)">
				<div class="guild-header">
					<div class="guild-rank-section">
						<div class="guild-rank">#{{ index + 1 }}</div>
					</div>
					<div class="guild-logo-section">
						<img :src="getGuildIcon(guild)" alt="Guild Logo" class="guild-logo" />
					</div>
					<div class="guild-main-info">
						<div class="guild-title-section">
							<h3 class="guild-name">{{ guild.name }}</h3>
							<span class="guild-tag">{{ getGuildTag(guild.name) }}</span>
						</div>
						<div class="guild-stats">
							<div class="stat-item">
								<span class="stat-label">MMR</span>
								<span
								class="stat-value"
								:class="getColor(guild.mmr)">{{ guild.mmr }}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Wins</span>
								<span class="stat-value">{{ guild.wins }}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Losses</span>
								<span class="stat-value">{{ guild.losses }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="guild-members">
					<div class="members-header">
						<span class="members-title">Members</span>
						<span class="members-count">{{ getGuildMemberCount(guild) }}</span>
					</div>
					<div class="members-list">
						<span 
							v-for="(member, memberIndex) in getGuildMembers(guild)" 
							:key="memberIndex" 
							class="member-tag"
							@click="navToPlayer(member)">
							{{ member }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.guilds-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 10px;
	max-width: 1800px;
	margin: 0 auto;
}

.guild-card {
	background: rgba(41, 41, 41, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	overflow: hidden;
	transition: all 0.3s ease;
	cursor: pointer;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.guild-card:hover {
	background: rgba(70, 70, 70, 0.3);
	border-color: rgba(255, 255, 255, 0.2);
	transform: translateY(-2px);
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.guild-header {
	display: flex;
	align-items: center;
	padding: 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	gap: 20px;
}

.guild-rank-section {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 60px;
}

.guild-rank {
	font-size: 1.5rem;
	font-weight: bold;
	color: #02bae7;
	background: rgba(2, 186, 231, 0.1);
	padding: 8px 16px;
	border-radius: 8px;
	border: 1px solid rgba(2, 186, 231, 0.3);
}

.guild-logo-section {
	display: flex;
	align-items: center;
	justify-content: center;
}

.guild-logo {
	width: 80px;
	height: 80px;
	object-fit: contain;
	border-radius: 12px;
	border: 2px solid rgba(255, 255, 255, 0.2);
	background: rgba(0, 0, 0, 0.2);
	padding: 4px;
}

.guild-main-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.guild-title-section {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.guild-name {
	font-size: 1.5rem;
	font-weight: bold;
	color: #ffffff;
	margin: 0;
}

.guild-tag {
	background: rgba(255, 255, 255, 0.1);
	/* color: #02bae7; */
	padding: 4px 12px;
	border-radius: 8px;
	font-size: 0.9rem;
	font-weight: bold;
	border: 1px solid rgba(255, 255, 255, 0.2);
	letter-spacing: 0.5px;
	text-transform: uppercase;
}

.guild-stats {
	display: flex;
	gap: 24px;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.stat-label {
	font-size: 0.85rem;
	color: rgba(255, 255, 255, 0.7);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	font-weight: 500;
}

.stat-value {
	font-size: 1.25rem;
	font-weight: bold;
}

.guild-members {
	padding: 20px;
	background: rgba(0, 0, 0, 0.1);
}

.members-header {
	display: flex;
	align-items: center;
	/* justify-content: space-between; */
	gap: 10px;
	margin-bottom: 12px;
}

.members-title {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.members-count {
	background: rgba(2, 186, 231, 0.2);
	color: #02bae7;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 0.85rem;
	font-weight: bold;
	border: 1px solid rgba(2, 186, 231, 0.3);
}

.members-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.member-tag {
	background: rgba(255, 255, 255, 0.1);
	color: #ffffff;
	padding: 8px 16px;
	border-radius: 5px;
	font-size: 0.9rem;
	font-weight: 500;
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.2s ease;
}

.member-tag:hover {
	background: rgba(255, 255, 255, 0.2);
	border-color: rgba(255, 255, 255, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
	.guilds-container {
		padding: 0 15px;
		gap: 15px;
	}
	
	.guild-header {
		padding: 16px;
		flex-wrap: wrap;
		gap: 16px;
	}
	
	.guild-rank {
		font-size: 1.2rem;
		padding: 6px 12px;
	}
	
	.guild-logo {
		width: 60px;
		height: 60px;
	}
	
	.guild-name {
		font-size: 1.25rem;
	}
	
	.guild-tag {
		font-size: 0.8rem;
		padding: 3px 10px;
	}
	
	.guild-stats {
		gap: 16px;
	}
	
	.stat-value {
		font-size: 1.1rem;
	}
	
	.guild-members {
		padding: 16px;
	}
}

@media (max-width: 480px) {
	.guild-header {
		flex-direction: column;
		text-align: center;
		gap: 12px;
	}
	
	.guild-rank-section {
		min-width: auto;
	}
	
	.guild-rank {
		font-size: 1rem;
		padding: 4px 10px;
	}
	
	.guild-logo {
		width: 50px;
		height: 50px;
	}
	
	.guild-name {
		font-size: 1.1rem;
	}
	
	.guild-title-section {
		justify-content: center;
		flex-direction: column;
		gap: 8px;
	}
	
	.guild-tag {
		font-size: 0.75rem;
		padding: 2px 8px;
	}
	
	.guild-stats {
		justify-content: center;
		gap: 20px;
	}
	
	.members-list {
		justify-content: center;
	}
	
	.member-tag {
		padding: 6px 12px;
		font-size: 0.85rem;
	}
}
</style>

<script setup lang="js">
	import Fuse from 'fuse.js'
	import { useRouter } from 'vue-router'
	import { useColor } from '~/composables/useColor'
	import { useState } from '#app'

	const router = useRouter()
	const route = useRoute()
	const { getColor } = useColor()

	const hasMounted = useState("guildsMounted", () => false);
	const { guildData, hasLoaded, isDataFromCache, loadGuildData, animateTable } = useGuildData()

	// Use guild data from the composable
	const guilds = computed(() => guildData.value || [])

	// Season management
	const selectedSeason = ref(route.query.s ? parseInt(route.query.s) : 4)

	// Load guild data on component mount
	onMounted(async () => {
		hasMounted.value = true;
		await Promise.all([
			loadGuildData(selectedSeason.value),
		]);
		animateTable();
	})

	// Handle season change
	async function onSeasonChange(newSeason) {
		selectedSeason.value = newSeason;
		
		// Update URL query parameter
		await navigateTo({
			path: route.path,
			query: { ...route.query, s: newSeason }
		});

		// Load new season data and
		await Promise.all([
			loadGuildData(newSeason),
		]);
		animateTable();
	}

	function navToPlayer(playerName) {
		router.push({path: `/${playerName}`, query: route.query})
	}

	function navToGuild(guildName) {
		// TODO: navigation logic for guilds if needed
		console.log(`Navigating to guild: ${guildName}`);
	}

	function getGuildTag(guildName) {
		// Split the guild name into words and take the first letter of each word
		return guildName
			.split(' ')
			.map(word => word.charAt(0).toUpperCase())
			.join('')
	}

	function getGuildIcon(guild) {
		// If guild has an icon property, use it; otherwise empty
		if (guild.icon) {
			return guild.icon;
		}
		return '/images/Guild No Icon.png';
	}

	function getGuildMembers(guild) {
		const names = [];
		for (const player of guild.players) {
			names.push(player.name);
		}
		return names;
	}

	function getGuildMemberCount(guild) {

		return guild.players.length;
	}
</script>
