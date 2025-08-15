<script setup lang="ts">
	import type { NuxtError } from "#app";
	import { NuxtLink } from "#components";

	const props = defineProps<{ error: NuxtError }>();
	const { error } = props;
</script>

<template>
	<main>
		<h1>{{ error.statusCode }}</h1>
		<p>{{ error.statusMessage ?? "An unexpected error occurred" }}</p>
		<NuxtLink
			to="/"
			class="home-link">
			Go back home
		</NuxtLink>
	</main>
</template>
