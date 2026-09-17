<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
    import Navbar from '../components/navbar/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main class="bg-primary">
	<Navbar/>
	{@render children()}
</main>
