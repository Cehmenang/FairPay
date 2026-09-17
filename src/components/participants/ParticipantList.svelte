<script lang="ts">
    import { tick } from 'svelte';
    import gsap from 'gsap';
    import { getInitial, type Contact } from '$lib/types/bill';

    let { contacts }: { contacts: Contact[] } = $props();

    let listEl: HTMLDivElement;
    let itemEls: HTMLDivElement[] = [];

    $effect(() => {
        contacts; // dependency: re-run tiap kali list berubah (misal ada tambahan baru)

        tick().then(() => {
            if (itemEls.length === 0) return;
            gsap.fromTo(
                itemEls,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
            );
        });
    });
</script>

<div bind:this={listEl} class="flex flex-col gap-2">
    {#if contacts.length === 0}
        <p class="rounded-3xl bg-secondary p-6 text-center font-inter text-sm text-third/50">
            Belum ada participant. Tambah dulu yuk.
        </p>
    {:else}
        {#each contacts as person, i (person.id)}
            <div
                bind:this={itemEls[i]}
                class="flex items-center gap-3.5 rounded-2xl bg-secondary p-4 shadow-[0_4px_16px_-8px_rgba(43,36,64,0.15)]"
            >
                <span
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fourth font-inter text-sm font-semibold text-secondary"
                >
                    {getInitial(person.name)}
                </span>
                <div class="flex flex-col">
                    <span class="font-inter text-sm font-medium text-third">{person.name}</span>
                    <span class="font-inter text-xs text-third/50">
                        {person.whatsapp ?? 'Belum ada nomor'}
                    </span>
                </div>
            </div>
        {/each}
    {/if}
</div>