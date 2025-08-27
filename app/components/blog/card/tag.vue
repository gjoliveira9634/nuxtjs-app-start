<script setup lang="ts">
	defineProps<{ item: any; to: string }>();
</script>

<template>
	<NuxtLink
		:to="to"
		class="block overflow-hidden rounded-lg border bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
		<div class="flex items-stretch">
			<div
				class="w-1"
				:style="{ backgroundColor: item.color || '#64748b' }" />
			<div class="flex-1 p-4">
				<h3 class="text-base font-semibold">#{{ item.name }}</h3>
				<p
					v-if="item.description"
					class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
					>{{ item.description }}</p
				>
			</div>
		</div>
	</NuxtLink>
</template>
