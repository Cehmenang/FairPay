<script lang="ts">
    import { onMount } from 'svelte';
    import gsap from 'gsap';
    import { Scale, ListChecks, Minus, Plus, Wand2 } from 'lucide-svelte';
    import type { DraftItem, DraftParticipant, ItemAssignments, SplitMethod } from '$lib/types/billDraft';
    import { computeShares, assignedQtyForItem } from '$lib/types/billDraft';
    import { formatCurrency } from '$lib/data/mockBills';

    let {
        items,
        participants,
        tax,
        currency = 'IDR',
        method = $bindable('even'),
        assignments = $bindable({})
    }: {
        items: DraftItem[];
        participants: DraftParticipant[];
        tax: number;
        currency?: string;
        method: SplitMethod;
        assignments: ItemAssignments;
    } = $props();

    let listEl: HTMLDivElement;

    function qtyFor(itemId: string, participantId: string): number {
        return assignments[itemId]?.[participantId] ?? 0;
    }

    function setQty(item: DraftItem, participantId: string, next: number) {
        const currentForItem = assignments[item.id] ?? {};
        const othersTotal = Object.entries(currentForItem)
            .filter(([pid]) => pid !== participantId)
            .reduce((sum, [, q]) => sum + q, 0);
        const clamped = Math.max(0, Math.min(next, item.qty - othersTotal));
        assignments = { ...assignments, [item.id]: { ...currentForItem, [participantId]: clamped } };
    }

    function adjust(item: DraftItem, participantId: string, delta: number) {
        setQty(item, participantId, qtyFor(item.id, participantId) + delta);
    }

    function splitEvenly(item: DraftItem) {
        if (participants.length === 0) return;
        const base = Math.floor(item.qty / participants.length);
        const remainder = item.qty - base * participants.length;
        const next: Record<string, number> = {};
        participants.forEach((p, i) => {
            next[p.id] = base + (i < remainder ? 1 : 0); // sisa pembagian ke orang pertama-pertama
        });
        assignments = { ...assignments, [item.id]: next };
    }

    let computed = $derived(computeShares(items, participants, assignments, tax, method));

    // Kalkulasi Total dan Sisa (Untuk UI Ringkasan)
    let totalBillAmount = $derived(items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0) + tax);
    let totalAssignedAmount = $derived(computed.reduce((sum, p) => sum + p.shareAmount, 0));
    let unassignedAmount = $derived(totalBillAmount - totalAssignedAmount);

    onMount(() => {
        gsap.fromTo(
            listEl?.children ?? [],
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }
        );
    });
</script>

<div class="flex flex-col gap-4">
    <!-- Toggle Method -->
    <div class="flex w-fit gap-1 rounded-full bg-primary p-1">
        <button
            onclick={() => (method = 'even')}
            class="flex items-center gap-2 rounded-full px-4 py-2 font-inter text-sm font-medium transition {method === 'even'
                ? 'bg-third text-secondary'
                : 'text-third/60 hover:text-third'}"
        >
            <Scale size={14} />
            Bagi Rata
        </button>
        <button
            onclick={() => (method = 'perItem')}
            class="flex items-center gap-2 rounded-full px-4 py-2 font-inter text-sm font-medium transition {method === 'perItem'
                ? 'bg-third text-secondary'
                : 'text-third/60 hover:text-third'}"
        >
            <ListChecks size={14} />
            Per Item
        </button>
    </div>

    <!-- List Items kalau method Per Item -->
    {#if method === 'perItem'}
        <div bind:this={listEl} class="flex flex-col gap-3">
            {#each items as item (item.id)}
                {@const assignedQty = assignedQtyForItem(assignments, item.id)}
                {@const isBalanced = assignedQty === item.qty}
                <div class="flex flex-col gap-2 rounded-2xl bg-primary p-3">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-inter text-sm text-third">{item.name || '(tanpa nama)'}</p>
                            <p class="font-inter text-[11px] text-third/40">{item.qty}x @ {formatCurrency(item.unitPrice, currency)}</p>
                        </div>
                        <button
                            onclick={() => splitEvenly(item)}
                            class="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-inter text-[11px] text-third/60 transition hover:text-fourth"
                        >
                            <Wand2 size={11} />
                            Bagi rata
                        </button>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        {#each participants as p (p.id)}
                            <div class="flex items-center justify-between gap-2">
                                <span class="truncate font-inter text-xs text-third">{p.name}</span>
                                <div class="flex items-center gap-1.5">
                                    <button
                                        onclick={() => adjust(item, p.id, -1)}
                                        aria-label="Kurangi"
                                        class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-third/60 transition hover:text-fourth"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span class="w-5 text-center font-momo text-xs text-third">{qtyFor(item.id, p.id)}</span>
                                    <button
                                        onclick={() => adjust(item, p.id, 1)}
                                        aria-label="Tambah"
                                        class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-third/60 transition hover:text-fourth"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <p class="font-inter text-[11px] {isBalanced ? 'text-fourth' : 'text-[#D97757]'}">
                        {assignedQty}/{item.qty} unit sudah dibagi{isBalanced ? '' : ' — masih ada sisa'}
                    </p>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Ringkasan Hasil Kalkulasi -->
    <div class="flex flex-col gap-2 rounded-2xl bg-primary p-4">
        <span class="font-inter text-xs text-third/50">Ringkasan per orang</span>
        {#each computed as p (p.id)}
            <div class="flex items-center justify-between">
                <span class="font-inter text-sm text-third">{p.name}</span>
                <span class="font-momo text-sm text-third">{formatCurrency(p.shareAmount, currency)}</span>
            </div>
        {/each}

        <!-- Info Sisa Belum Dibagi (Hanya muncul jika ada sisa dan method perItem) -->
        {#if method === 'perItem' && unassignedAmount > 0}
            <div class="mt-2 flex items-center justify-between border-t border-third/10 pt-2">
                <span class="font-inter text-sm font-semibold text-[#D97757]">Sisa Belum Dibagi</span>
                <span class="font-momo text-sm font-semibold text-[#D97757]">
                    {formatCurrency(unassignedAmount, currency)}
                </span>
            </div>
        {/if}

        <!-- Total Keseluruhan Bill -->
        <div class="mt-2 flex items-center justify-between border-t border-third/20 pt-2">
            <span class="font-inter text-sm font-bold text-third">Total Bill</span>
            <span class="font-momo text-sm font-bold text-third">
                {formatCurrency(totalBillAmount, currency)}
            </span>
        </div>
    </div>
</div>