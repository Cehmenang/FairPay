<script lang="ts">
	import { Check } from 'lucide-svelte';

	let {
		steps,
		currentStep
	}: {
		steps: { label: string; icon: any }[];
		currentStep: number;
	} = $props();
</script>

<div class="flex items-center">
	{#each steps as step, i (step.label)}
		{@const Icon = step.icon}
		{@const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming'}

		<div class="flex flex-col items-center gap-2">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 {state ===
				'done'
					? 'bg-fourth text-secondary'
					: state === 'active'
						? 'bg-third text-secondary ring-4 ring-fourth/20'
						: 'bg-primary text-third/30'}"
			>
				{#if state === 'done'}
					<Check size={16} />
				{:else}
					<Icon size={16} />
				{/if}
			</div>
			<span
				class="font-inter text-xs font-medium whitespace-nowrap {state === 'upcoming'
					? 'text-third/30'
					: 'text-third'}"
			>
				{step.label}
			</span>
		</div>

		{#if i < steps.length - 1}
			<div class="mx-2 mb-5 h-0.5 w-10 overflow-hidden rounded-full bg-primary sm:w-20">
				<div
					class="h-full bg-fourth transition-all duration-500 ease-out"
					style="width: {i < currentStep ? '100%' : '0%'}"
				></div>
			</div>
		{/if}
	{/each}
</div>
