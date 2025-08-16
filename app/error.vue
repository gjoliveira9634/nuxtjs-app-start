<script setup lang="ts">
	const error = useError();
</script>

<template>
	<main>
		<h1>{{ error?.statusCode }}</h1>
		<p>{{ error?.statusMessage ?? "An unexpected error occurred" }}</p>
		<NuxtLink
			to="/"
			class="home-link">
			Go back home
		</NuxtLink>
	</main>
</template>
