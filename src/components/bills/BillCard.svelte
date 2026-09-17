<script lang="ts">
	import { CheckCircle2, Clock } from 'lucide-svelte';
	import AvatarStack from './AvatarStack.svelte';
	import { formatCurrency, formatDate } from '../../data/mockBills';
	import { getBillStatus, getPaidCount, type Bill } from '$lib/types/bill';

	let { bill }: { bill: Bill } = $props();

	let status = $derived(getBillStatus(bill));
	let paidCount = $derived(getPaidCount(bill));
	let total = $derived(bill.participants.length);
	let progress = $derived(total === 0 ? 0 : Math.round((paidCount / total) * 100));

	let el: HTMLDivElement;

	function onEnter() {
		el?.animate(
			[{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }],
			{ duration: 200, fill: 'forwards', easing: 'ease-out' }
		);
	}
	function onLeave() {
		el?.animate(
			[{ transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }],
			{ duration: 200, fill: 'forwards', easing: 'ease-out' }
		);
	}
</script>

<div
	bind:this={el}
	role="group"
	onmouseenter={onEnter}
	onmouseleave={onLeave}
	class="bill-card flex w-64 shrink-0 flex-col justify-between gap-4 rounded-3xl bg-secondary p-5 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:w-72"
>
	<div class="flex items-start justify-between gap-3">
		<h3 class="font-momo text-base leading-snug text-third">{bill.title}</h3>
		{#if status === 'completed'}
			<span class="flex items-center gap-1 rounded-full bg-[#EDE9FF] px-2 py-1 font-inter text-[11px] font-medium text-fourth">
				<CheckCircle2 size={12} /> Lunas
			</span>
		{:else}
			<span class="flex items-center gap-1 rounded-full bg-[#FFF1EC] px-2 py-1 font-inter text-[11px] font-medium text-[#D97757]">
				<Clock size={12} /> Menunggak
			</span>
		{/if}
	</div>

	<p class="font-momo text-2xl text-third">{formatCurrency(bill.grossAmount ?? 0, bill.currency)}</p>

	<div class="flex items-center justify-between">
		<AvatarStack items={bill.participants} max={4} size={30} />
		<span class="font-inter text-xs text-third/50">{formatDate(bill.createdAt)}</span>
	</div>

	<div class="flex flex-col gap-1.5">
		<div class="h-1.5 w-full overflow-hidden rounded-full bg-primary">
			<div
				class="h-full rounded-full bg-fourth transition-all duration-500"
				style="width: {progress}%"
			></div>
		</div>
		<span class="font-inter text-[11px] text-third/50">{paidCount}/{total} sudah bayar</span>
	</div>

	<a href={`/bills/${bill.id}`}>Lihat Detail</a>
</div>

<style>
	.bill-card {
		will-change: transform;
	}
</style>