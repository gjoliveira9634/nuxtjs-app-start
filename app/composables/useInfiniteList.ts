import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

export interface UseInfiniteListOptions {
	initial?: number; // initial number of items
	step?: number; // how many to load per intersection
	resetOnSourceChange?: boolean; // reset when source list changes
}

export function useInfiniteList<T>(
	items: () => T[] | undefined | null,
	opts: UseInfiniteListOptions = {},
) {
	const initial = opts.initial ?? 18;
	const step = opts.step ?? 9;
	const resetOnSourceChange = opts.resetOnSourceChange ?? true;

	const sentinel = ref<HTMLElement | null>(null);
	const visibleCount = ref(initial);
	const list = computed(() => (items() || []) as T[]);
	const total = computed(() => list.value.length);
	const visibleItems = computed(() => list.value.slice(0, visibleCount.value));
	const canLoadMore = computed(() => visibleCount.value < total.value);

	function loadMore() {
		if (!canLoadMore.value) return;
		visibleCount.value = Math.min(total.value, visibleCount.value + step);
	}

	let observer: IntersectionObserver | null = null;
	onMounted(() => {
		if (!("IntersectionObserver" in window)) return;
		observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) loadMore();
				}
			},
			{ root: null, rootMargin: "200px", threshold: 0 },
		);
		if (sentinel.value) observer.observe(sentinel.value);
	});

	onBeforeUnmount(() => {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	});

	// Re-observe sentinel if it changes
	watch(sentinel, (el, prev) => {
		if (!observer) return;
		if (prev) observer.unobserve(prev);
		if (el) observer.observe(el);
	});

	// Reset when source changes (e.g., search query)
	watch(list, () => {
		if (!resetOnSourceChange) return;
		visibleCount.value = Math.min(initial, total.value || initial);
	});

	return {
		sentinel,
		visibleItems,
		visibleCount,
		canLoadMore,
		loadMore,
		total,
	};
}
