<script lang="ts">
	import { onMount, tick } from 'svelte';
	import gsap from 'gsap';
	import BillsCarousel from '../../components/bills/BillsCarousel.svelte';
	import BillsSummary from '../../components/bills/BillsSummary.svelte';
	import TopMenu from '../../components/bills/TopMenu.svelte';
	import BillsCalendar from '../../components/bills/BillsCalendar.svelte';
	import BillsSkeleton from '../../components/bills/BillsSkeleton.svelte';
	import { formatDate } from '../../data/mockBills';
	import { toDateKey, type Bill } from '$lib/types/bill';

	let bills = $state<Bill[]>([]);
	let sortedBills = $state<Bill[]>([]);
	let isLoading = $state(true);
	let showSkeleton = $state(true);

	async function fetchBills() {
		try {
			const response = await fetch('/api/bills', { method: 'GET' });
			if (response.ok) {
				bills = await response.json();
				sortedBills = [...bills].sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			}
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		fetchBills();
	});

	let selectedDate = $state<string | null>(null);
	let headerEl: HTMLDivElement;
	let skeletonEl: HTMLDivElement;
	let contentEl: HTMLDivElement;

	let visibleBills = $derived(
		selectedDate ? sortedBills.filter((b) => toDateKey(b.createdAt) === selectedDate) : sortedBills
	);

	onMount(() => {
		gsap.fromTo(
			headerEl,
			{ opacity: 0, y: -12 },
			{ opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
		);
	});

	// begitu fetch selesai, crossfade dari skeleton ke konten asli
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

<div class="mx-auto pt-20 md:pt-[100px] flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
	<div bind:this={headerEl} class="flex flex-col gap-4">
		<h1 class="font-momo text-3xl text-third sm:text-4xl">Bills</h1>
		<TopMenu />
	</div>

	{#if showSkeleton}
		<div bind:this={skeletonEl}>
			<BillsSkeleton />
		</div>
	{/if}

	{#if !isLoading}
		<div bind:this={contentEl} class="flex flex-col gap-6 opacity-0">
			<BillsSummary bills={bills} />

			{#if selectedDate}
				<div class="flex items-center gap-2 font-inter text-sm text-third/60">
					<span>Menampilkan bills tanggal {formatDate(selectedDate)}</span>
					<button class="font-medium text-fourth underline" onclick={() => (selectedDate = null)}>
						Reset
					</button>
				</div>
			{/if}

			{#if visibleBills.length > 0}
				<BillsCarousel bills={visibleBills} />
			{:else}
				<p class="rounded-3xl bg-secondary p-6 text-center font-inter text-sm text-third/50">
					Belum ada bill di tanggal ini.
				</p>
			{/if}

			<BillsCalendar bills={bills} onSelectDate={(iso) => (selectedDate = iso)} />
		</div>
	{/if}
</div>