<template>
	<div class="season-selector">
		<fieldset class="season-tabs" role="radiogroup" aria-labelledby="season-selector-label">
			<legend id="season-selector-label" class="sr-only">Select Season</legend>
			<label v-for="season in availableSeasons" :key="season.value" class="season-tab">
				<input type="radio" :value="season.value" v-model="modelValue" @change="handleSeasonChange" name="season" :aria-label="`Season ${season.value}`" />
				<span>{{ season.label }}</span>
			</label>
		</fieldset>
	</div>
</template>

<script setup>
	const route = useRoute();
	const router = useRouter();

	const modelValue = ref(route.query.s == 3 ? 3 : 4);

	const seasons = [
		{ value: 4, label: "Season 4" },
		{ value: 3, label: "Season 3" },
		{ value: 2, label: "Season 2" },
		{ value: 1, label: "Season 1" },
	];

	const emit = defineEmits(["update:modelValue", "change"]);

	const availableSeasons = computed(() => seasons);

	const selectedSeasonModel = computed({
		get: () => modelValue.value,
		set: (value) => emit("update:modelValue", value),
	});

	function handleSeasonChange() {
		selectedSeasonModel.value = modelValue.value;
		emit("change", selectedSeasonModel.value);

		if (modelValue.value == 3) {
			router.push({ path: route.path, query: { ...route.query, s: 3 } });
		} else if (modelValue.value == 4) {
			const newQuery = { ...route.query };
			delete newQuery["s"];
			router.push({ path: route.path, query: newQuery });
		}
	}
</script>
