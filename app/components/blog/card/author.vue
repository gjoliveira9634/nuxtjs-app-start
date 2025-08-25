<script setup lang="ts">
	defineProps<{ item: any; to: string }>();
</script>

<template>
	<NuxtLink
		:to="to"
		class="flex items-center gap-3 rounded-lg border bg-white p-3 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
		<img
			v-if="item.avatar"
			:src="item.avatar"
			:alt="item.name"
			class="h-12 w-12 rounded-full object-cover" />
		<div class="min-w-0">
			<p class="truncate text-sm font-semibold">{{ item.name }}</p>
			<p
				v-if="item.bio"
				class="truncate text-xs text-gray-600 dark:text-gray-400"
				>{{ item.bio }}</p
			>
			<div
				v-if="item.social"
				class="mt-1 flex gap-2 text-xs text-gray-500">
				<span v-if="item.social.twitter">X</span>
				<span v-if="item.social.github">GitHub</span>
				<span v-if="item.social.website">Website</span>
			</div>
		</div>
	</NuxtLink>
</template>
