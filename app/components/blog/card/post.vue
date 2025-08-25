<script setup lang="ts">
	defineProps<{ item: any; to: string }>();
</script>

<template>
	<NuxtLink
		:to="to"
		class="block overflow-hidden rounded-lg border bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
		<div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
			<img
				v-if="item.cover?.image"
				:src="item.cover.image"
				:alt="item.cover?.alt || item.title"
				class="h-full w-full object-cover" />
		</div>
		<div class="p-4">
			<div class="mb-1 flex flex-wrap gap-1">
				<span
					v-for="tg in item.tags || []"
					:key="tg"
					class="rounded px-2 py-0.5 text-[10px] font-medium text-white"
					:style="{ backgroundColor: '#64748b' }"
					>#{{ tg }}</span
				>
			</div>
			<h3 class="line-clamp-2 text-base font-semibold">
				{{ item.title || (item.path || "").split("/").pop() }}
			</h3>
			<p
				v-if="item.excerpt || item.description"
				class="mt-2 line-clamp-3 text-sm text-gray-700 dark:text-gray-300"
				>{{ item.excerpt || item.description }}</p
			>
		</div>
	</NuxtLink>
</template>
