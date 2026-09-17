<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { Menu, X, MousePointer2, Receipt, LogOut } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let mobileOpen = $state(false);
	let navEl: HTMLElement;
	let menuEl: HTMLElement;

	let isLoggedIn = $derived(!!$page.data.user);

	async function handleLogout() {
		try {
			const res = await fetch('http://localhost:3000/user', {
				method: 'DELETE',
				credentials: 'include'
			});
			if (res.ok) return await goto($page.url.pathname, { invalidateAll: true });
		} catch (err) {
			console.log(err);
		}
	}

	onMount(() => {
		gsap.from(navEl, {
			y: -24,
			opacity: 0,
			duration: 0.6,
			ease: 'power3.out'
		});

		gsap.from(menuEl.querySelectorAll('a, button'), {
			y: -8,
			opacity: 0,
			duration: 0.5,
			stagger: 0.08,
			delay: 0.2,
			ease: 'power2.out'
		});
	});

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function animateMobileMenu(node: HTMLElement) {
		gsap.set(node, { height: 0, opacity: 0 });
		gsap.to(node, {
			height: 'auto',
			opacity: 1,
			duration: 0.35,
			ease: 'power2.out'
		});

		gsap.from(node.querySelectorAll('a, button'), {
			x: -12,
			opacity: 0,
			duration: 0.3,
			stagger: 0.06,
			delay: 0.1,
			ease: 'power2.out'
		});

		return {
			destroy() {
				gsap.killTweensOf(node);
			}
		};
	}

	const focusRing =
		'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fourth/60';
</script>

<header bind:this={navEl} class="fixed z-50 w-full px-4 pt-4 sm:px-6 lg:px-10">
	<div
		class="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-third/10 bg-secondary/75 px-4 py-3 backdrop-blur-xl sm:px-5"
	>
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2 rounded-full {focusRing}">
			<Receipt size={22} class="text-fourth" strokeWidth={2} />
			<span class="font-momo text-lg text-third">FairPay</span>
		</a>

		<!-- Desktop -->
		<div bind:this={menuEl} class="hidden items-center gap-3 md:flex">
			<a
				href="/how"
				class="rounded-full px-4 py-2 font-inter text-sm transition-colors {focusRing} {$page.url
					.pathname === '/how'
					? 'bg-fourth/10 text-fourth'
					: 'text-third/60 hover:bg-third/5 hover:text-third'}"
			>
				How to use
			</a>

			{#if isLoggedIn}
				<button
					onclick={handleLogout}
					class="group flex items-center gap-2 rounded-full border border-third/10 px-4 py-2 font-inter text-sm text-third/70 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 {focusRing}"
				>
					<LogOut size={15} class="transition-transform group-hover:translate-x-0.5" />
					Logout
				</button>
			{:else}
				<a
					href="/login"
					class="rounded-full bg-fourth px-4 py-2 font-inter text-sm font-medium text-secondary transition-colors hover:bg-fourth/90 {focusRing}"
				>
					Try for free
				</a>
			{/if}
		</div>

		<!-- Mobile toggle -->
		<button
			type="button"
			class="flex h-9 w-9 items-center justify-center rounded-full border border-third/10 text-third transition-colors hover:bg-third/5 md:hidden {focusRing}"
			aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={mobileOpen}
			onclick={toggleMobile}
		>
			{#if mobileOpen}
				<X size={16} />
			{:else}
				<Menu size={16} />
			{/if}
		</button>
	</div>

	{#if mobileOpen}
		<nav
			use:animateMobileMenu
			class="mx-auto mt-2 flex max-w-6xl flex-col gap-1 overflow-hidden rounded-2xl border border-third/10 bg-secondary/95 p-2 backdrop-blur-xl md:hidden"
		>
			<a
				href="/how"
				class="group flex items-center justify-between rounded-xl px-4 py-3 font-inter text-sm transition-colors {focusRing} {$page
					.url.pathname === '/how'
					? 'bg-fourth/10 text-fourth'
					: 'text-third hover:bg-third/5'}"
				onclick={() => (mobileOpen = false)}
			>
				How to use
				<MousePointer2 size={18} class="hidden opacity-60 group-hover:block" />
			</a>

			{#if isLoggedIn}
				<button
					onclick={() => {
						mobileOpen = false;
						handleLogout();
					}}
					class="flex items-center justify-between rounded-xl px-4 py-3 font-inter text-sm text-third transition-colors hover:bg-red-50 hover:text-red-600 {focusRing}"
				>
					Logout
					<LogOut size={18} class="opacity-60" />
				</button>
			{:else}
				<a
					href="/login"
					class="group flex items-center justify-between rounded-xl bg-fourth px-4 py-3 font-inter text-sm font-medium text-secondary transition-colors hover:bg-fourth/90 {focusRing}"
					onclick={() => (mobileOpen = false)}
				>
					Try for free
					<MousePointer2 size={18} class="hidden group-hover:block" />
				</a>
			{/if}
		</nav>
	{/if}
</header>