<script lang="ts">
	import { page } from '$app/stores';

	const tabs = [
		{ label: 'Bills', href: '/bills' },
		{ label: 'Contacts', href: '/contacts' },
		{ label: 'History', href: '/history' }
	];

	let activePath = $derived($page.url.pathname);
	let activeIndex = $derived(
		Math.max(
			tabs.findIndex((t) => activePath.startsWith(t.href)),
			0
		)
	);
</script>

<nav class="relative flex w-fit gap-1 rounded-full bg-secondary p-1 shadow-sm">

	{#each tabs as tab, i (tab.href)}
		<a
			href={tab.href}
			class="relative z-10 flex-1 rounded-full px-4 py-2 text-center font-inter text-sm font-medium whitespace-nowrap transition-colors duration-200 {i === activeIndex
				? 'text-fourth'
				: 'text-third/60 hover:text-third'}"
		>
			{tab.label}
		</a>
	{/each}
</nav>
