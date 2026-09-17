<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import gsap from 'gsap';

	let skeletonBlocks: HTMLDivElement[] = [];
	let tween: gsap.core.Tween;

	onMount(() => {
		tween = gsap.to(skeletonBlocks, {
			opacity: 0.4,
			duration: 0.8,
			repeat: -1,
			yoyo: true,
			ease: 'sine.inOut',
			stagger: 0.1
		});
	});

	onDestroy(() => {
		tween?.kill();
	});
</script>

<div class="flex flex-col gap-6">
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
		{#each Array(3) as _, i}
			<div bind:this={skeletonBlocks[i]} class="h-20 rounded-3xl bg-secondary"></div>
		{/each}
	</div>

	<!-- carousel skeleton -->
	<div class="flex gap-4 overflow-hidden">
		{#each Array(3) as _, i}
			<div
				bind:this={skeletonBlocks[i + 3]}
				class="h-48 w-64 shrink-0 rounded-3xl bg-secondary sm:w-72"
			></div>
		{/each}
	</div>

	<!-- calendar skeleton -->
	<div bind:this={skeletonBlocks[6]} class="h-64 rounded-3xl bg-secondary"></div>
</div>