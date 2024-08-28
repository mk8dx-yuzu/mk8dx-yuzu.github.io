<template>
	<div id="api-error" class="api-error">
		<img src="/images/MK8D-PoliceRed.png" />
		<div class="error-text">
			<p>{{ error || "Error!\nThere was a problem getting the data.\nPlease try again later"}}</p>
			<p>Our Discord-Bot works independently from this website, so try using it instead until this is fixed.</p>
		</div>
	</div>
</template>

<script setup>
const error = useState("error")
</script>