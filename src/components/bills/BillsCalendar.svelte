<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-svelte';
	import gsap from 'gsap';
	import { toDateKey, type Bill } from '$lib/types/bill';

	let { bills, onSelectDate }: { bills: Bill[]; onSelectDate?: (iso: string) => void } = $props();

	const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
	const monthNames = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];

	let cursor = $state(new Date(2026, 7, 1)); // Agustus 2026
	let selected = $state<string | null>(null);
	let gridEl: HTMLDivElement;

	function toISO(y: number, m: number, d: number) {
		return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	}

	// toDateKey diimpor dari $lib/types/bill supaya cara normalisasi
	// tanggal sama persis dengan yang dipakai di halaman Bills untuk
	// filter selectedDate — dua implementasi lokal terpisah sebelumnya
	// yang bikin gampang out-of-sync.
	let billCountByDate = $derived.by(() => {
		const map = new Map<string, number>();
		for (const bill of bills) {
			const key = toDateKey(bill.createdAt);
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	});

	let cells = $derived.by(() => {
		const y = cursor.getFullYear();
		const m = cursor.getMonth();
		const firstDay = new Date(y, m, 1).getDay();
		const daysInMonth = new Date(y, m + 1, 0).getDate();

		const result: { day: number | null; iso: string | null; count: number }[] = [];
		for (let i = 0; i < firstDay; i++) result.push({ day: null, iso: null, count: 0 });
		for (let d = 1; d <= daysInMonth; d++) {
			const iso = toISO(y, m, d);
			result.push({ day: d, iso, count: billCountByDate.get(iso) ?? 0 });
		}
		return result;
	});

	function changeMonth(dir: 1 | -1) {
		cursor = new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1);
	}

	function pick(iso: string | null) {
		if (!iso) return;
		selected = selected === iso ? null : iso;
		onSelectDate?.(iso);
	}

	function animateGrid() {
		const items = gridEl?.querySelectorAll('.cal-cell');
		if (!items) return;
		gsap.fromTo(
			items,
			{ opacity: 0, y: 8 },
			{ opacity: 1, y: 0, duration: 0.35, stagger: 0.012, ease: 'power2.out' }
		);
	}

	onMount(animateGrid);
	$effect(() => {
		cursor;
		animateGrid();
	});
</script>

<div class="flex flex-col gap-5 rounded-3xl bg-secondary p-6 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-8">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<CalendarDays size={18} class="text-fourth" />
			<h2 class="font-momo text-lg text-third">
				{monthNames[cursor.getMonth()]} {cursor.getFullYear()}
			</h2>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => changeMonth(-1)}
				aria-label="Bulan sebelumnya"
				class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-third transition hover:bg-fourth hover:text-secondary"
			>
				<ChevronLeft size={16} />
			</button>
			<button
				onclick={() => changeMonth(1)}
				aria-label="Bulan berikutnya"
				class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-third transition hover:bg-fourth hover:text-secondary"
			>
				<ChevronRight size={16} />
			</button>
		</div>
	</div>

	<div class="grid grid-cols-7 gap-1 text-center font-inter text-xs text-third/40">
		{#each weekdays as wd (wd)}
			<span class="py-1">{wd}</span>
		{/each}
	</div>

	<div bind:this={gridEl} class="grid grid-cols-7 gap-1">
		{#each cells as cell, i (i)}
			{#if cell.day === null}
				<div class="cal-cell aspect-square"></div>
			{:else}
				<button
					onclick={() => pick(cell.iso)}
					class="cal-cell relative flex aspect-square flex-col items-center justify-center rounded-xl font-inter text-sm transition {selected ===
					cell.iso
						? 'bg-fourth text-secondary'
						: cell.count > 0
							? 'bg-primary text-third hover:bg-fourth/20'
							: 'text-third/60 hover:bg-primary'}"
				>
					{cell.day}
					{#if cell.count > 0}
						<span
							class="absolute bottom-1.5 h-1 w-1 rounded-full {selected === cell.iso
								? 'bg-secondary'
								: 'bg-fourth'}"
						></span>
					{/if}
				</button>
			{/if}
		{/each}
	</div>

	<p class="font-inter text-xs text-third/40">Titik ungu menandakan ada bill yang dibuat di tanggal tersebut.</p>
</div>