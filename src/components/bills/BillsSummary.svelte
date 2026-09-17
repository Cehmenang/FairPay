<script lang="ts">
    import { Plus, Wallet } from 'lucide-svelte';
    import gsap from 'gsap';
    import { getBillStatus, type Bill } from '$lib/types/bill';

    let { bills }: { bills: Bill[] } = $props();

    let total = $derived(bills.length);
    let completed = $derived(bills.filter((b) => getBillStatus(b) === 'completed').length);
    let pending = $derived(total - completed);

    let counter = { value: 0 };
    let displayTotal = $state(0);

    $effect(() => {
        gsap.to(counter, {
            value: total,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => {
                displayTotal = Math.round(counter.value);
            }
        });
    });
</script>

<div class="flex flex-col gap-6 rounded-3xl bg-secondary p-6 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-fourth">
				<Wallet size={22} />
			</div>
			<div>
				<p class="font-inter text-sm text-third/50">Total Bills</p>
				<p class="font-momo text-4xl text-third">{displayTotal}</p>
			</div>
		</div>

		<a
			href="/bills/add"
			class="flex items-center gap-2 rounded-full bg-fourth px-5 py-3 font-inter text-sm font-medium text-secondary shadow-sm transition hover:brightness-110 active:scale-[0.97]"
		>
			<Plus size={16} />
			Add New Bill
		</a>
	</div>

	<div class="flex flex-wrap gap-3">
		<div class="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3">
			<span class="h-2 w-2 rounded-full bg-fourth"></span>
			<span class="font-inter text-sm text-third">
				<strong class="font-momo">{completed}</strong> Selesai
			</span>
		</div>
		<div class="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3">
			<span class="h-2 w-2 rounded-full bg-[#D97757]"></span>
			<span class="font-inter text-sm text-third">
				<strong class="font-momo">{pending}</strong> Menunggak
			</span>
		</div>
	</div>
</div>
