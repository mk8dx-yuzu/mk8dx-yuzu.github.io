<template>
	<div
		class="notice-banner"
		:style="{
			backgroundColor: backgroundColor,
			background: backgroundPattern,
			borderColor: borderColor,
		}">
		<slot></slot>
	</div>
</template>

<script setup>
	const props = defineProps({
		color: {
			type: String,
			default: "red",
			validator: (value) => ["red", "yellow", "blue", "green", "orange", "purple"].includes(value),
		},
	});

	const colorSchemes = {
		red: {
			backgroundColor: "#520000",
			borderColor: "#A30000",
			stripeColor1: "#660000",
			stripeColor2: "#520000",
		},
		yellow: {
			backgroundColor: "#525200",
			borderColor: "#A3A300",
			stripeColor1: "#666600",
			stripeColor2: "#525200",
		},
		blue: {
			backgroundColor: "#000052",
			borderColor: "#0000A3",
			stripeColor1: "#000066",
			stripeColor2: "#000052",
		},
		green: {
			backgroundColor: "#005200",
			borderColor: "#00A300",
			stripeColor1: "#006600",
			stripeColor2: "#005200",
		},
		orange: {
			backgroundColor: "#523300",
			borderColor: "#A36600",
			stripeColor1: "#664400",
			stripeColor2: "#523300",
		},
		purple: {
			backgroundColor: "#330052",
			borderColor: "#6600A3",
			stripeColor1: "#440066",
			stripeColor2: "#330052",
		},
	};

	const currentScheme = computed(() => colorSchemes[props.color]);

	const backgroundColor = computed(() => currentScheme.value.backgroundColor);
	const borderColor = computed(() => currentScheme.value.borderColor);
	const backgroundPattern = computed(
		() =>
			`repeating-linear-gradient(-45deg, ${currentScheme.value.stripeColor1} 0, ${currentScheme.value.stripeColor1}, 6px, ${currentScheme.value.stripeColor2} 6px, ${currentScheme.value.stripeColor2} 12px)`
	);
</script>

<style>
	.notice-banner {
		border: 1px solid;
		border-right: none;
		border-left: none;
		margin-bottom: 10px;
		padding: 10px 20px;
		z-index: 1000;
	}

	.notice-banner p {
		text-align: center;
		font-weight: bold;
	}

    .notice-banner p a {
        text-decoration: underline;
        text-decoration-style: dashed;
        color: #FA8334;
    }
</style>
