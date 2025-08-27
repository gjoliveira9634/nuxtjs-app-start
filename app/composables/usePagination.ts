import { useRoute, useRouter } from "nuxt/app";
import { computed, watch } from "vue";

export interface UsePaginationOptions {
	pageParam?: string;
	perPageParam?: string;
	defaultPerPage?: number;
}

export function usePagination<T>(
	items: () => T[] | undefined | null,
	opts: UsePaginationOptions = {},
) {
	const route = useRoute();
	const router = useRouter();
	const pageParam = opts.pageParam || "page";
	const perPageParam = opts.perPageParam || "perPage";
	const defaultPerPage = opts.defaultPerPage ?? 12;

	const totalItems = computed(() => (items() || []).length);

	const perPage = computed(() => {
		const qp = Number(route.query[perPageParam]);
		return Number.isFinite(qp) && qp > 0 ? qp : defaultPerPage;
	});

	const totalPages = computed(() => {
		const pp = perPage.value || defaultPerPage;
		const n = Math.ceil(totalItems.value / pp);
		return n > 0 ? n : 1;
	});

	const page = computed(() => {
		const qp = Number(route.query[pageParam]);
		const current = Number.isFinite(qp) && qp >= 1 ? qp : 1;
		return Math.min(Math.max(1, current), totalPages.value);
	});

	const start = computed(() => (page.value - 1) * perPage.value);
	const end = computed(() => start.value + perPage.value);
	const pagedItems = computed(() =>
		(items() || []).slice(start.value, end.value),
	);

	function updateQuery(next: Record<string, any>) {
		const query = { ...route.query, ...next } as Record<string, any>;
		Object.keys(query).forEach((k) => {
			if (query[k] === "" || query[k] == null) delete query[k];
		});
		router.replace({ query });
	}

	function setPage(n: number) {
		const clamped = Math.min(Math.max(1, Math.floor(n)), totalPages.value);
		updateQuery({ [pageParam]: clamped });
	}

	function setPerPage(n: number) {
		const v = Math.max(1, Math.floor(n));
		updateQuery({ [perPageParam]: v, [pageParam]: 1 });
	}

	// Se a quantidade de itens ou perPage mudarem e a página ficar fora do range, volta para 1
	watch([totalItems, perPage], () => {
		if (page.value > totalPages.value) setPage(1);
	});

	return {
		page,
		perPage,
		totalItems,
		totalPages,
		pagedItems,
		setPage,
		setPerPage,
	};
}
