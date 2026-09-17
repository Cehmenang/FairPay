<script lang="ts">
    import gsap from 'gsap';
    import { Users2 } from 'lucide-svelte';
    import type { Contact } from '$lib/types/bill';

    let { contacts }: { contacts: Contact[] } = $props();

    let total = $derived(contacts.length);
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

<div class="flex items-center gap-4 rounded-3xl bg-secondary p-6 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-8">
    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-fourth">
        <Users2 size={22} />
    </div>
    <div>
        <p class="font-inter text-sm text-third/50">Total Participant</p>
        <p class="font-momo text-4xl text-third">{displayTotal}</p>
    </div>
</div>