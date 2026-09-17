<script lang="ts">
    import { onMount, tick } from 'svelte';
    import gsap from 'gsap';
    import { goto } from '$app/navigation';
    import { ArrowLeft, ArrowRight, PenLine, Camera, ReceiptText, Users2, Scale, Check } from 'lucide-svelte';
    // TAMBAHAN: Import assignedQtyForItem kesini
    import { itemsGross, newEmptyItem, computeShares, buildItemsPayload, buildParticipantsPayload, assignedQtyForItem } from '$lib/types/billDraft';
    import type { DraftItem, DraftParticipant, ScanResult, SplitMethod, ItemAssignments } from '$lib/types/billDraft';
    import { formatCurrency } from '$lib/data/mockBills';
    import StepProgress from '../../../components/bills/add/StepProgress.svelte';
    import ManualItemsForm from '../../../components/bills/add/ManualItemsForm.svelte';
    import ReceiptScanner from '../../../components/bills/add/ReceiptScanner.svelte';
    import ParticipantPicker from '../../../components/bills/add/ParticipantPicker.svelte';
    import ItemSplitStep from '../../../components/bills/add/ItemSplitStep.svelte';

    const steps = [
        { label: 'Item Bill', icon: ReceiptText },
        { label: 'Participants', icon: Users2 },
        { label: 'Split & Review', icon: Scale }
    ];

    let currentStep = $state(0);
    let inputMode = $state<'manual' | 'scan'>('manual');

    let title = $state('');
    let currency = $state('IDR');
    let items = $state<DraftItem[]>([newEmptyItem()]);
    let tax = $state(0);
    let participants = $state<DraftParticipant[]>([]);
    let splitMethod = $state<SplitMethod>('even');
    let assignments = $state<ItemAssignments>({});

    let stageEl: HTMLDivElement;

    let gross = $derived(itemsGross(items));
    let grandTotal = $derived(gross + tax);

    // --- TAMBAHAN LOGIC VALIDASI ---
    // Cek apakah pembagian item udah komplit
    let isFullyAssigned = $derived(
        splitMethod === 'even' || items.every(item => assignedQtyForItem(assignments, item.id) === item.qty)
    );
    let showErrorNotif = $state(false);
    // -------------------------------

    let canGoNext = $derived(
        currentStep === 0
            ? title.trim().length > 0 && items.some((it) => it.name.trim() && it.unitPrice > 0)
            : currentStep === 1
                ? participants.length > 0
                : true
    );

    function handleScanned(result: ScanResult) {
        if (result.title) title = result.title;
        if (result.currency) currency = result.currency;
        items = result.items.map((it) => ({
            id: crypto.randomUUID(),
            name: it.name,
            qty: it.qty,
            unitPrice: it.unitPrice
        }));
        if (result.tax) tax = result.tax;
        inputMode = 'manual';
    }

    async function animateTransition(dir: 1 | -1, after: () => void) {
        await gsap.to(stageEl, { opacity: 0, x: -20 * dir, duration: 0.2, ease: 'power2.in' });
        after();
        await tick();
        gsap.fromTo(stageEl, { opacity: 0, x: 20 * dir }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    }

    function goNext() {
        if (!canGoNext || currentStep >= steps.length - 1) return;
        animateTransition(1, () => (currentStep += 1));
    }

    function goBack() {
        if (currentStep === 0) return;
        animateTransition(-1, () => (currentStep -= 1));
    }

    async function saveBill() {
        // --- TAMBAHAN PROTEKSI SAVE ---
        if (!isFullyAssigned) {
            showErrorNotif = true;
            setTimeout(() => (showErrorNotif = false), 3500);
            return; // Gagalkan proses save kalau masih ada item sisa
        }
        // ------------------------------

        const finalParticipants = computeShares(items, participants, assignments, tax, splitMethod);
        const itemsPayload = buildItemsPayload(items, assignments);
        const participantsPayload = buildParticipantsPayload(finalParticipants);

        try {
            await fetch('/api/bills', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    items: itemsPayload,
                    tax,
                    grossAmount: gross,
                    currency,
                    participants: participantsPayload
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            
        } catch (err) {
            console.log(err);
        }
        goto('/bills');
    }

    onMount(() => {
        gsap.fromTo(stageEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    });
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
    <!-- Header -->
    <div class="flex items-center gap-3">
        <a
            href="/bills"
            aria-label="Kembali"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-third shadow-sm transition hover:bg-fourth hover:text-secondary"
        >
            <ArrowLeft size={16} />
        </a>
        <h1 class="font-momo text-2xl text-third sm:text-3xl">Bill Baru</h1>
    </div>

    <!-- Stepper -->
    <div class="flex justify-center overflow-x-auto rounded-3xl bg-secondary p-4 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)]">
        <StepProgress {steps} {currentStep} />
    </div>

    <!-- Stage Content -->
    <div bind:this={stageEl}>
        {#if currentStep === 0}
            <!-- Step 0 Content (Tetap Sama) -->
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-4 rounded-3xl bg-secondary p-5 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-6">
                    <div class="flex gap-2">
                        <input bind:value={title} type="text" placeholder="Judul bill, misal: Makan Malam Tim" class="flex-1 rounded-2xl bg-primary px-4 py-3 font-inter text-sm text-third placeholder:text-third/40 focus:outline-none" />
                        <select bind:value={currency} class="rounded-2xl bg-primary px-3 py-3 font-inter text-sm text-third focus:outline-none">
                            <option value="IDR">IDR</option>
                            <option value="USD">USD</option>
                            <option value="SGD">SGD</option>
                            <option value="MYR">MYR</option>
                            <option value="EUR">EUR</option>
                            <option value="JPY">JPY</option>
                            <option value="GBP">GBP</option>
                            <option value="AUD">AUD</option>
                        </select>
                    </div>

                    <div class="flex w-fit gap-1 rounded-full bg-primary p-1">
                        <button onclick={() => (inputMode = 'manual')} class="flex items-center gap-2 rounded-full px-4 py-2 font-inter text-sm font-medium transition {inputMode === 'manual' ? 'bg-third text-secondary' : 'text-third/60 hover:text-third'}"><PenLine size={14} />Input Manual</button>
                        <button onclick={() => (inputMode = 'scan')} class="flex items-center gap-2 rounded-full px-4 py-2 font-inter text-sm font-medium transition {inputMode === 'scan' ? 'bg-third text-secondary' : 'text-third/60 hover:text-third'}"><Camera size={14} />Scan Struk</button>
                    </div>
                </div>

                {#if inputMode === 'manual'}
                    <div class="flex flex-col gap-4 rounded-3xl bg-secondary p-5 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-6">
                        <ManualItemsForm bind:items {currency} />
                        <label class="flex items-center justify-between rounded-2xl bg-primary p-3">
                            <span class="font-inter text-sm text-third/60">Pajak / Service (opsional)</span>
                            <input bind:value={tax} type="number" min="0" placeholder="0" class="w-28 rounded-lg bg-secondary px-2 py-1.5 text-right font-inter text-sm text-third focus:outline-none" />
                        </label>
                        <div class="flex items-center justify-between border-t border-third/10 pt-3">
                            <span class="font-inter text-sm font-medium text-third">Total</span>
                            <span class="font-momo text-xl text-third">{formatCurrency(grandTotal, currency)}</span>
                        </div>
                    </div>
                {:else}
                    <ReceiptScanner onScanned={handleScanned} />
                    <p class="font-inter text-xs text-third/40">Setelah discan, hasilnya bisa dikoreksi lagi di tab Input Manual sebelum lanjut.</p>
                {/if}
            </div>
        {:else if currentStep === 1}
            <!-- Step 1 Content (Tetap Sama) -->
            <div class="flex flex-col gap-4 rounded-3xl bg-secondary p-5 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-6">
                <ParticipantPicker bind:selected={participants} />
            </div>
        {:else}
            <!-- Step 2 Content (ItemSplitStep) -->
            <div class="flex flex-col gap-4 rounded-3xl bg-secondary p-5 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)] sm:p-6">
                <ItemSplitStep {items} {participants} {tax} {currency} bind:method={splitMethod} bind:assignments />
            </div>
        {/if}
    </div>

    <!-- Container Tombol Navigasi Bawah -->
    <div class="flex flex-col gap-4">
        
        <!-- --- TAMBAHAN NOTIFIKASI UI --- -->
        {#if showErrorNotif}
            <div class="flex items-center gap-2 rounded-xl border border-[#D97757]/30 bg-[#D97757]/10 p-3 text-sm text-[#D97757] transition-all">
                <span class="font-inter font-medium">
                    Gagal menyimpan! Masih ada sisa item yang belum dialokasikan ke partisipan.
                </span>
            </div>
        {/if}
        <!-- ------------------------------ -->

        <div class="flex items-center gap-3">
            {#if currentStep > 0}
                <button
                    onclick={goBack}
                    class="flex items-center gap-2 rounded-full bg-secondary px-5 py-3 font-inter text-sm font-medium text-third shadow-sm transition hover:bg-primary"
                >
                    <ArrowLeft size={16} />
                    Kembali
                </button>
            {/if}

            {#if currentStep < steps.length - 1}
                <button
                    onclick={goNext}
                    disabled={!canGoNext}
                    class="flex flex-1 items-center justify-center gap-2 rounded-full bg-fourth py-3 font-inter text-sm font-semibold text-secondary shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                >
                    Lanjut
                    <ArrowRight size={16} />
                </button>
            {:else}
                <button
                    onclick={saveBill}
                    class="flex flex-1 items-center justify-center gap-2 rounded-full bg-fourth py-3 font-inter text-sm font-semibold text-secondary shadow-sm transition hover:brightness-110 active:scale-[0.98]"
                >
                    <Check size={16} />
                    Simpan Bill
                </button>
            {/if}
        </div>
    </div>
</div>