<template>
  <div
    id="loader-container"
    class="loader-container"
  >
    <div class="loader-image">
      <img src="/images/MK8_Slim_Tire_Artwork.svg">
    </div>
    <div class="loader-text">
      <p id="loader-p">
        {{ displayText }}
      </p>
    </div>
  </div>
</template>

<script setup>
const texts = [
  'Throwing green shells...',
  'Outrunning blue shells...',
  'Using shortcut...',
  'Dodging bananas...',
  'Blocking red shells...'
]

const displayText = ref(texts[0])

onMounted(() => {
  displayText.value = texts[Math.floor(Math.random() * texts.length)]
})
</script>
