<script lang="ts">
    import { onMount, tick } from 'svelte';
    import gsap from 'gsap';
    import TopMenu from '../../components/bills/TopMenu.svelte';
    import type { Contact } from '$lib/types/bill';
    import ParticipantSkeleton from '../../components/participants/ParticipantSkeleton.svelte';
    import ParticipantList from '../../components/participants/ParticipantList.svelte';
    import ParticipantAddButton from '../../components/participants/ParticipantAddButton.svelte';
    import ParticipantSummary from '../../components/participants/ParticipantSummary.svelte';

    let contacts = $state<Contact[]>([]);
    let isLoading = $state(true);
    let showSkeleton = $state(true);

    async function fetchContacts() {
        try {
            const response = await fetch('/api/contacts', { method: 'GET' });
            if (response.ok) {
                contacts = await response.json();
            }
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        fetchContacts();
    });

    function handleAdded(contact: Contact) {
        contacts = [...contacts, contact];
    }

    let headerEl: HTMLDivElement;
    let skeletonEl: HTMLDivElement;
    let contentEl: HTMLDivElement;

    onMount(() => {
        gsap.fromTo(
            headerEl,
            { opacity: 0, y: -12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
    });

    $effect(() => {
        if (!isLoading) {
            tick().then(() => {
                const tl = gsap.timeline({
                    onComplete: () => {
                        showSkeleton = false;
                    }
                });
                if (skeletonEl) {
                    tl.to(skeletonEl, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' });
                }
                if (contentEl) {
                    tl.fromTo(
                        contentEl,
                        { opacity: 0, y: 16 },
                        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                        skeletonEl ? '-=0.1' : 0
                    );
                }
            });
        }
    });
</script>

<div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pt-20 sm:px-8 sm:py-10 md:pt-[100px]">
    <div bind:this={headerEl} class="flex flex-col gap-4">
        <h1 class="font-momo text-3xl text-third sm:text-4xl">Participants</h1>
        <TopMenu />
    </div>

    {#if showSkeleton}
        <div bind:this={skeletonEl}>
            <ParticipantSkeleton />
        </div>
    {/if}

    {#if !isLoading}
        <div bind:this={contentEl} class="flex flex-col gap-6 opacity-0">
            <ParticipantSummary {contacts} />
            <ParticipantAddButton onAdded={handleAdded} />
            <ParticipantList {contacts} />
        </div>
    {/if}
</div>