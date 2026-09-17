<!-- src/components/bills/AddParticipantButton.svelte -->
<script lang="ts">
    import { tick } from 'svelte';
    import gsap from 'gsap';
    import { Plus, Phone, X } from 'lucide-svelte';
    import type { Contact } from '$lib/types/bill';

    let { onAdded }: { onAdded: (contact: Contact) => void } = $props();

    let showForm = $state(false);
    let name = $state('');
    let whatsapp = $state('');
    let submitting = $state(false);
    let addError = $state<string | null>(null);

    let cardEl: HTMLDivElement;
    let nameInputEl: HTMLInputElement;

    let previewInitial = $derived(name.trim().charAt(0).toUpperCase());

    function normalizeWhatsapp(raw: string): string | undefined {
        const digits = raw.replace(/\D/g, '');
        return digits.length > 0 ? digits : undefined;
    }

    function openForm() {
        showForm = true;
        tick().then(() => nameInputEl?.focus());
    }

    function closeForm() {
        showForm = false;
        name = '';
        whatsapp = '';
        addError = null;
    }

    async function submit() {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        submitting = true;
        addError = null;
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: trimmedName,
                    whatsapp: normalizeWhatsapp(whatsapp)
                })
            });

            if (!res.ok) {
                addError = 'Gagal menambah participant';
                return;
            }

            const contact: Contact = await res.json();
            onAdded(contact);
            closeForm();
        } catch (err) {
            console.error('[AddParticipantButton] failed:', err);
            addError = 'Gagal terhubung ke server';
        } finally {
            submitting = false;
        }
    }

    $effect(() => {
        if (showForm && cardEl) {
            gsap.fromTo(
                cardEl,
                { opacity: 0, y: -6, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
            );
        }
    });
</script>

{#if !showForm}
    <button
        onclick={openForm}
        class="group flex w-full items-center gap-3.5 rounded-2xl border border-dashed border-fourth/30 bg-secondary/60 p-4 text-left transition hover:border-fourth/60 hover:bg-fourth/5"
    >
        <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-fourth/40 text-fourth transition group-hover:border-fourth group-hover:bg-fourth group-hover:text-secondary"
        >
            <Plus size={18} />
        </span>
        <span class="font-inter text-sm font-medium text-fourth">Tambah Participant Baru</span>
    </button>
{:else}
    <div
        bind:this={cardEl}
        class="relative flex flex-col gap-4 rounded-2xl bg-secondary p-4 shadow-[0_4px_16px_-8px_rgba(43,36,64,0.2)] ring-1 ring-fourth/15"
    >
        <button
            onclick={closeForm}
            aria-label="Batal"
            class="absolute right-3 top-3 rounded-full p-1 text-third/30 transition hover:bg-primary hover:text-third/60"
        >
            <X size={14} />
        </button>

        <div class="flex items-center gap-3.5 pr-6">
            <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fourth font-inter text-sm font-semibold text-secondary transition-all"
            >
                {#if previewInitial}
                    {previewInitial}
                {:else}
                    <Plus size={16} />
                {/if}
            </span>
            <input
                bind:this={nameInputEl}
                bind:value={name}
                type="text"
                placeholder="Nama participant"
                class="flex-1 bg-transparent font-inter text-sm font-medium text-third placeholder:text-third/40 placeholder:font-normal focus:outline-none"
                onkeydown={(e) => e.key === 'Enter' && submit()}
            />
        </div>

        <div class="flex items-center gap-2.5 rounded-xl bg-primary px-3.5 py-2.5">
            <Phone size={14} class="shrink-0 text-third/40" />
            <input
                bind:value={whatsapp}
                type="tel"
                placeholder="Nomor WhatsApp (opsional)"
                class="flex-1 bg-transparent font-inter text-xs text-third placeholder:text-third/40 focus:outline-none"
                onkeydown={(e) => e.key === 'Enter' && submit()}
            />
        </div>

        {#if addError}
            <p class="text-xs text-rose-600">{addError}</p>
        {/if}

        <div class="flex items-center justify-end gap-2 pt-1">
            <button
                onclick={closeForm}
                class="rounded-full px-3.5 py-2 font-inter text-xs font-medium text-third/50 transition hover:bg-primary"
            >
                Batal
            </button>
            <button
                onclick={submit}
                disabled={submitting || !name.trim()}
                class="rounded-full bg-fourth px-4 py-2 font-inter text-xs font-semibold text-secondary transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
            >
                {submitting ? 'Menyimpan...' : 'Tambah'}
            </button>
        </div>
    </div>
{/if}