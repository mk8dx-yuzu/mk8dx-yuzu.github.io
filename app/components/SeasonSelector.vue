<template>
  <div class="season-selector-outer">
    <div class="season-selector">
      <fieldset
        class="season-tabs"
        role="radiogroup"
        aria-labelledby="season-selector-label"
      >
        <legend
          id="season-selector-label"
          class="sr-only"
        >
          Select Season
        </legend>
        <label
          v-for="season in availableSeasons"
          :key="season.value"
          class="season-tab"
        >
          <input
            v-model="modelValue"
            type="radio"
            :value="season.value"
            name="season"
            :aria-label="`Season ${season.value}`"
            @change="handleSeasonChange"
          >
          <span>{{ season.label }}</span>
        </label>
      </fieldset>
    </div>
    <Transition name="season-info">
      <div
        v-if="modelValue === 1"
        class="season-1-info"
      >
        <p>
          Season 1 data might contain inaccuracies or be incomplete because the
          data was stored on a broken Google Sheets file.
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const modelValue = ref(
  [1, 2, 3].includes(Number(route.query.s)) ? Number(route.query.s) : 4
)

const emit = defineEmits(['update:modelValue', 'change'])

// Emit initial season on mount to trigger data load
onMounted(() => {
  emit('change', modelValue.value)
  emit('update:modelValue', modelValue.value)
})

watch(
  () => route.query.s,
  (newSeason) => {
    const season = [1, 2, 3].includes(Number(newSeason))
      ? Number(newSeason)
      : 4

    if (modelValue.value !== season) {
      modelValue.value = season
      emit('change', season)
    }
  }
)

const seasons = [
  { value: 4, label: 'Season 4' },
  { value: 3, label: 'Season 3' },
  { value: 2, label: 'Season 2' },
  { value: 1, label: 'Season 1' }
]

const availableSeasons = computed(() => seasons)

const selectedSeasonModel = computed({
  get: () => modelValue.value,
  set: value => emit('update:modelValue', value)
})

function handleSeasonChange() {
  selectedSeasonModel.value = modelValue.value
  emit('change', selectedSeasonModel.value)

  const newQuery = { ...route.query }

  if (modelValue.value == 4) {
    delete newQuery.s
  } else {
    newQuery.s = modelValue.value
  }

  router.push({ path: route.path, query: newQuery })
}
</script>
