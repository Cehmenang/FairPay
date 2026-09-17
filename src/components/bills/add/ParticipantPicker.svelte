<script lang="ts">
    import { onMount } from 'svelte';
    import gsap from 'gsap';
    import { Check, Users2, UserPlus, X } from 'lucide-svelte';
    import type { DraftContact, DraftParticipant } from '$lib/types/billDraft';

    let { selected = $bindable([]) }: { selected: DraftParticipant[] } = $props();

    let contacts: DraftContact[] | [] = $state([]);
    let loading = $state(true);

    async function loadData() {
        loading = true;
        const res = await fetch('/api/contacts', {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        });
        contacts = await res.json();
        loading = false;
    }

    $effect(() => {
        loadData();
    });

    let showAddForm = $state(false);
    let newName = $state('');
    let newWhatsapp = $state('');
    let addError = $state<string | null>(null);
    let listEl: HTMLDivElement;

    function initials(name: string) {
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    }

    function isSelected(id: string) {
        return selected.some((p) => p.id === id);
    }

    function toggle(id: string, name: string) {
        selected = isSelected(id)
            ? selected.filter((p) => p.id !== id)
            : [...selected, { id, name, shareAmount: 0 }];
    }

    async function addNewParticipant() {
        const name = newName.trim();
        if (!name) return;

        addError = null;
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    whatsapp: newWhatsapp
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                addError = 'Gagal menambah participant';
                return;
            }

            const data = await response.json() as DraftContact;
            contacts = [...contacts, data];
            newName = '';
            newWhatsapp = '';
            showAddForm = false;
        } catch (err) {
            console.error('[addNewParticipant] failed:', err);
            addError = 'Gagal terhubung ke server';
        }
    }

    onMount(() => {
        gsap.fromTo(
            listEl?.children ?? [],
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
        );
    });
</script>

<div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
        <Users2 size={16} class="text-fourth" />
        <h3 class="font-momo text-base text-third">Siapa aja yang ikut?</h3>
    </div>

    <div bind:this={listEl} class="flex flex-col gap-2">
        {#if contacts && contacts.length > 0}
            {#each contacts as person (person.id)}
                {@const active = isSelected(person.id)}
                <button
                    onclick={() => toggle(person.id, person.name)}
                    class="flex items-center gap-3 rounded-2xl border p-3 text-left transition {active
                        ? 'border-fourth bg-fourth/5'
                        : 'border-third/10 bg-secondary hover:border-fourth/30'}"
                >
                    <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fourth font-inter text-xs font-semibold text-secondary"
                    >
                        {initials(person.name)}
                    </span>
                    <span class="flex-1 font-inter text-sm text-third">{person.name}</span>
                    {#if active}<Check size={14} class="text-fourth" />{/if}
                </button>
            {/each}
        {/if}
    </div>

    {#if showAddForm}
        <div class="flex flex-col gap-2 rounded-2xl bg-primary p-3">
            <input
                bind:value={newName}
                type="text"
                placeholder="Nama participant baru"
                class="flex-1 bg-transparent font-inter text-sm text-third placeholder:text-third/40 focus:outline-none"
                onkeydown={(e) => e.key === 'Enter' && addNewParticipant()}
            />
            <input
                bind:value={newWhatsapp}
                type="tel"
                placeholder="Nomor WhatsApp (opsional), mis. 0812xxxxxxx"
                class="flex-1 bg-transparent font-inter text-sm text-third placeholder:text-third/40 focus:outline-none"
                onkeydown={(e) => e.key === 'Enter' && addNewParticipant()}
            />
            {#if addError}
                <p class="text-xs text-rose-600">{addError}</p>
            {/if}
            <div class="flex items-center gap-2">
                <button
                    onclick={addNewParticipant}
                    class="rounded-full bg-fourth px-3 py-1.5 font-inter text-xs font-medium text-secondary"
                >
                    Tambah
                </button>
                <button
                    onclick={() => (showAddForm = false)}
                    aria-label="Batal"
                    class="rounded-full p-1.5 text-third/40 hover:bg-secondary"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    {:else}
        <button
            onclick={() => (showAddForm = true)}
            class="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-fourth/40 py-3 font-inter text-sm font-medium text-fourth transition hover:bg-fourth/5"
        >
            <UserPlus size={15} />
            Tambah Participant Baru
        </button>
    {/if}
</div>