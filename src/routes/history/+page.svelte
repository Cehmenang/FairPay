<script lang="ts">
	import { onMount, tick } from 'svelte';
	import gsap from 'gsap';
	import TopMenu from '../../components/bills/TopMenu.svelte';
	import BillsSkeleton from '../../components/bills/BillsSkeleton.svelte';
	import HistoryCard from '../../components/history/HistoryCard.svelte';
	import { toHistoryBill, type HistoryBill, type HistoryFilter } from '$lib/types/history';

	const HISTORY_ENDPOINT = '/api/bills';

	let bills = $state<HistoryBill[]>([]);
	let isLoading = $state(true);
	let showSkeleton = $state(true);
	let errorMessage = $state<string | null>(null);
	let filter = $state<HistoryFilter>('all');

	let headerEl: HTMLDivElement;
	let skeletonEl: HTMLDivElement;
	let contentEl: HTMLDivElement;

	const filters: { value: HistoryFilter; label: string }[] = [
		{ value: 'all', label: 'Semua' },
		{ value: 'ongoing', label: 'Belum lunas' },
		{ value: 'settled', label: 'Sudah lunas' }
	];

	let ongoingCount = $derived(bills.filter((b) => !b.isSettled).length);
	let settledCount = $derived(bills.filter((b) => b.isSettled).length);

	let visibleBills = $derived(
		filter === 'ongoing'
			? bills.filter((b) => !b.isSettled)
			: filter === 'settled'
				? // yang paling baru lunas duluan
					bills
						.filter((b) => b.isSettled)
						.toSorted(
							(a, b) =>
								new Date(b.settledAt as string).getTime() -
								new Date(a.settledAt as string).getTime()
						)
				: bills
	);

	async function fetchHistory() {
		try {
			const response = await fetch(HISTORY_ENDPOINT, { credentials: 'include' });
			if (!response.ok) throw new Error('fetch failed');
			const raw = await response.json();
			bills = raw
				.map(toHistoryBill)
				.sort(
					(a: HistoryBill, b: HistoryBill) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
		} catch {
			errorMessage = 'History gagal dimuat. Muat ulang halaman untuk mencoba lagi.';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		gsap.fromTo(
			headerEl,
			{ opacity: 0, y: -12 },
			{ opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
		);
		fetchHistory();
	});

	// crossfade skeleton -> konten, sama seperti di halaman bills
	$effect(() => {
		if (!isLoading) {
			tick().then(() => {
				const tl = gsap.timeline({
					onComplete: () => {
						showSkeleton = false;
					}
				});
				if (skeletonEl) {
					tl.to(skeletonEl, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' });
				}
				if (contentEl) {
					tl.fromTo(
						contentEl,
						{ opacity: 0, y: 16 },
						{ opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
						skeletonEl ? '-=0.1' : 0
					);
				}
			});
		}
	});
</script>

<div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pt-20 sm:px-8 sm:py-10 md:pt-[100px]">
	<div bind:this={headerEl} class="flex flex-col gap-4">
		<h1 class="font-momo text-3xl text-third sm:text-4xl">History</h1>
		<TopMenu />
	</div>

	{#if showSkeleton}
		<div bind:this={skeletonEl}>
			<BillsSkeleton />
		</div>
	{/if}

	{#if !isLoading}
		<div bind:this={contentEl} class="flex flex-col gap-6 opacity-0">
			<div class="flex flex-wrap gap-2">
				{#each filters as item (item.value)}
					<button
						class="rounded-full px-4 py-1.5 font-inter text-sm transition-colors {filter ===
						item.value
							? 'bg-fourth text-secondary'
							: 'bg-secondary text-third/60'}"
						onclick={() => (filter = item.value)}
					>
						{item.label}
						{#if item.value === 'ongoing' && ongoingCount > 0}
							({ongoingCount})
						{:else if item.value === 'settled' && settledCount > 0}
							({settledCount})
						{/if}
					</button>
				{/each}
			</div>

			{#if errorMessage}
				<p class="rounded-3xl bg-secondary p-4 font-inter text-sm text-red-500">{errorMessage}</p>
			{/if}

			{#if visibleBills.length > 0}
				<div class="flex flex-col gap-4">
					{#each visibleBills as bill (bill.id)}
						<HistoryCard {bill} />
					{/each}
				</div>
			{:else}
				<p class="rounded-3xl bg-secondary p-6 text-center font-inter text-sm text-third/50">
					{filter === 'settled'
						? 'Belum ada bill yang lunas.'
						: filter === 'ongoing'
							? 'Semua bill sudah lunas.'
							: 'Belum ada history pembayaran.'}
				</p>
			{/if}
		</div>
	{/if}
</div>