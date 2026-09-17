<script lang="ts">
	import { onMount, tick } from 'svelte';
	import gsap from 'gsap';
	import { Plus, Trash2, Package } from 'lucide-svelte';
	import type { DraftItem } from '$lib/types/billDraft';
	import { itemSubtotal, itemsGross, newEmptyItem } from '$lib/types/billDraft';
	import { formatCurrency } from '$lib/data/mockBills';

	let { items = $bindable([]), currency = 'IDR' }: { items: DraftItem[]; currency?: string } = $props();

	let listEl: HTMLDivElement;
	let gross = $derived(itemsGross(items));

	async function addItem() {
		items = [...items, newEmptyItem()];
		await tick();
		const rows = listEl?.querySelectorAll('.item-row');
		const last = rows?.[rows.length - 1];
		if (last) {
			gsap.fromTo(last, { opacity: 0, height: 0, y: -8 }, { opacity: 1, height: 'auto', y: 0, duration: 0.3, ease: 'power2.out' });
			(last.querySelector('input') as HTMLInputElement | null)?.focus();
		}
	}

	function removeItem(id: string) {
		const row = listEl?.querySelector(`[data-id="${id}"]`);
		if (row) {
			gsap.to(row, {
				opacity: 0,
				height: 0,
				duration: 0.25,
				ease: 'power2.in',
				onComplete: () => {
					items = items.filter((it) => it.id !== id);
				}
			});
		} else {
			items = items.filter((it) => it.id !== id);
		}
	}

	onMount(() => {
		if (items.length === 0) addItem();
	});
</script>

<div class="flex flex-col gap-3">
	<div bind:this={listEl} class="flex flex-col gap-2">
		{#each items as item (item.id)}
			<div data-id={item.id} class="item-row flex items-center gap-2 rounded-2xl bg-primary p-3">
				<Package size={15} class="shrink-0 text-fourth" />
				<input
					bind:value={item.name}
					type="text"
					placeholder="Nama item"
					class="min-w-0 flex-1 bg-transparent font-inter text-sm text-third placeholder:text-third/40 focus:outline-none"
				/>
				<input
					bind:value={item.qty}
					type="number"
					min="1"
					class="w-12 shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-center font-inter text-sm text-third focus:outline-none"
				/>
				<span class="shrink-0 font-inter text-xs text-third/40">×</span>
				<input
					bind:value={item.unitPrice}
					type="number"
					min="0"
					placeholder="Harga"
					class="w-24 shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-right font-inter text-sm text-third focus:outline-none"
				/>
				<span class="hidden w-24 shrink-0 text-right font-momo text-sm text-third sm:block">
					{formatCurrency(itemSubtotal(item), currency)}
				</span>
				<button
					onclick={() => removeItem(item.id)}
					aria-label="Hapus item"
					class="shrink-0 rounded-full p-1.5 text-third/40 transition hover:bg-secondary hover:text-[#D97757]"
				>
					<Trash2 size={15} />
				</button>
			</div>
		{/each}
	</div>

	<button
		onclick={addItem}
		class="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-fourth/40 py-3 font-inter text-sm font-medium text-fourth transition hover:bg-fourth/5"
	>
		<Plus size={15} />
		Tambah Item
	</button>

	<div class="flex items-center justify-between border-t border-third/10 pt-3">
		<span class="font-inter text-sm text-third/60">Subtotal</span>
		<span class="font-momo text-xl text-third">{formatCurrency(gross, currency)}</span>
	</div>
</div>