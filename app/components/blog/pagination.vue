<script setup lang="ts">
	const props = defineProps<{
		page: number;
		totalPages: number;
	}>();
	const emits = defineEmits<{
		(e: "update:page", v: number): void;
	}>();

	function go(n: number) {
		if (n < 1 || n > props.totalPages) return;
		emits("update:page", n);
	}
</script>

<template>
	<nav
		v-if="totalPages > 1"
		class="mt-6 flex items-center justify-center gap-2 text-sm">
		<button
			class="rounded border px-2 py-1 disabled:opacity-50 dark:border-gray-800"
			:disabled="page <= 1"
			@click="go(page - 1)"
			>←</button
		>
		<span class="px-2">{{ page }} / {{ totalPages }}</span>
		<button
			class="rounded border px-2 py-1 disabled:opacity-50 dark:border-gray-800"
			:disabled="page >= totalPages"
			@click="go(page + 1)"
			>→</button
		>
	</nav>
</template>
