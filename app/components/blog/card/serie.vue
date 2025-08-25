<script setup lang="ts">
	defineProps<{ item: any; to: string }>();
</script>

<template>
	<NuxtLink
		:to="to"
		class="block overflow-hidden rounded-lg border bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
		<div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
			<img
				v-if="item.cover"
				:src="item.cover"
				:alt="item.title"
				class="h-full w-full object-cover" />
		</div>
		<div class="p-4">
			<h3 class="text-base font-semibold">{{ item.title }}</h3>
			<p
				v-if="item.description"
				class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
				>{{ item.description }}</p
			>
		</div>
	</NuxtLink>
</template>
