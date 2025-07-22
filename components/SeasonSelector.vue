<template>
	<div class="season-selector">
		<fieldset class="season-tabs" role="radiogroup" aria-labelledby="season-selector-label">
			<legend id="season-selector-label" class="sr-only">Select Season</legend>
			<label 
				v-for="season in availableSeasons" 
				:key="season.value" 
				class="season-tab"
			>
				<input 
					type="radio" 
					:value="season.value" 
					v-model="selectedSeasonModel"
					@change="handleSeasonChange"
					name="season"
					:aria-label="`Season ${season.value}`"
				/>
				<span>{{ season.label }}</span>
			</label>
		</fieldset>
	</div>
</template>

<script setup>
	const props = defineProps({
		modelValue: {
			type: Number,
			default: 4
		},
		seasons: {
			type: Array,
			default: () => [
				{ value: 4, label: 'Season 4' },
				{ value: 3, label: 'Season 3' }
			]
		}
	})

	const emit = defineEmits(['update:modelValue', 'change'])

	const availableSeasons = computed(() => props.seasons)

	const selectedSeasonModel = computed({
		get: () => props.modelValue,
		set: (value) => emit('update:modelValue', value)
	})

	function handleSeasonChange() {
		emit('change', selectedSeasonModel.value)
	}
</script>
