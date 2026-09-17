<script lang="ts">
	import type { Participant } from '$lib/types/bill';

	let { items, max = 4, size = 30 }: { items: Participant[]; max?: number; size?: number } =
		$props();

	let visible = $derived(items.slice(0, max));
	let extra = $derived(Math.max(items.length - max, 0));

	function initials(name: string) {
		const firstWord = name.trim().split(/\s+/)[0] ?? '';
		return firstWord.slice(0, 2).toUpperCase();
	}
</script>

<div class="flex items-center" style="--avatar-size: {size}px;">
	{#each visible as p, i (p.id)}
		<div
			class="avatar-circle flex shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-fourth font-inter text-[11px] font-semibold text-secondary"
			style="width: var(--avatar-size); height: var(--avatar-size); margin-left: {i === 0
				? '0'
				: '-8px'}; z-index: {visible.length - i};"
			title={p.contact.name}
		>
			{initials(p.contact.name)}
		</div>
	{/each}
	{#if extra > 0}
		<div
			class="avatar-circle flex shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-primary font-inter text-[11px] font-semibold text-third"
			style="width: var(--avatar-size); height: var(--avatar-size); margin-left: -8px; z-index: 0;"
		>
			+{extra}
		</div>
	{/if}
</div>

<style>
	.avatar-circle {
		position: relative;
	}
</style>