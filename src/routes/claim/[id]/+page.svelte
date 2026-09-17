<!-- src/routes/bills/claim/[shareToken]/[participantSlug]/+page.svelte -->
<script lang="ts">
    import { tick } from 'svelte';
    import { page } from '$app/stores';
    import gsap from 'gsap';
    import { formatCurrency, formatDate } from '$lib/data/mockBills';
    import { getParticipantStatus, type Bill, type Participant } from '$lib/types/bill';

    let bill = $state<Bill | null>(null);
    let participant = $state<Participant | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let submitting = $state(false);

    async function loadBill() {
        loading = true;
        error = null;
        try {
            const shareToken = $page.params.id as string;
            const participantId = $page.url.searchParams.get('participant') as string;

            const res = await fetch(`/api/bills/claim/${shareToken}`, { method: 'GET' });
            if (!res.ok) {
                error = 'Link tidak valid atau tagihan tidak ditemukan';
                return;
            }
            const data: Bill = await res.json();
            const found = data.participants.find((p) => p.id === participantId);
            if (!found) {
                error = 'Peserta tidak ditemukan di tagihan ini';
                return;
            }
            bill = data;
            participant = found;

        } catch (e) {
            console.error('[loadBill] failed:', e);
            error = 'Link tidak valid';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        loadBill();
    });

    let status = $derived(participant ? getParticipantStatus(participant) : 'pending');

    const statusLabel: Record<string, string> = {
        completed: 'Sudah Dibayar',
        pending: 'Menunggu Konfirmasi',
        unpaid: 'Belum Dibayar'
    };

    // --- Alur bayar ---
    let showPaymentOptions = $state(false);
    let selectedMethod = $state<string | null>(null);

    const paymentMethods = [
        { id: 'transfer_bank', label: 'Transfer Bank' },
        { id: 'qris', label: 'QRIS' },
        { id: 'e_wallet', label: 'E-Wallet (OVO / GoPay / DANA)' }
    ];

    async function submitPayment() {
        if (!bill || !participant || !selectedMethod) return;
        submitting = true;
        try {
            const res = await fetch(
                `/api/bills/claim/${bill.shareToken}/participant/${participant.id}`,
                {
                    method: 'GET',
                    // headers: { 'Content-Type': 'application/json' },
                    // body: JSON.stringify({ paymentMethod: selectedMethod })
                }
            );
            if (res.ok) {
                showPaymentOptions = false;
                selectedMethod = null;

                await loadBill();
            }
        } catch (err) {
            console.error('[submitPayment] failed:', err);
        } finally {
            submitting = false;
        }
    }

    // --- GSAP ---
    let cardEl: HTMLDivElement;
    let paymentPanelEl: HTMLDivElement;

    $effect(() => {
        if (!bill) return;
        tick().then(() => {
            gsap.fromTo(
                cardEl,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
            );
        });
    });

    $effect(() => {
        if (showPaymentOptions && paymentPanelEl) {
            gsap.fromTo(
                paymentPanelEl,
                { opacity: 0, height: 0 },
                { opacity: 1, height: 'auto', duration: 0.3, ease: 'power2.out' }
            );
        }
    });
</script>

{#if loading}
    <div class="flex min-h-screen items-center justify-center">
        <p class="text-sm text-third/50">Memuat...</p>
    </div>
{:else if error}
    <div class="flex min-h-screen items-center justify-center px-4">
        <p class="text-sm font-medium text-rose-600">{error}</p>
    </div>
{:else if bill && participant}
    <main class="mx-auto max-w-md space-y-6 px-4 py-10 pt-28">
        <div bind:this={cardEl} class="space-y-6">
            <!-- Header info bill -->
            <div class="space-y-2 rounded-3xl bg-third p-6 text-white">
                <span
                    class="inline-block rounded-full px-3 py-1 text-xs font-semibold
                    {status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : ''}
                    {status === 'pending' ? 'bg-indigo-300/20 text-indigo-200' : ''}
                    {status === 'unpaid' ? 'bg-red-500/20 text-red-300' : ''}
                "
                >
                    {statusLabel[status]}
                </span>
                <h1 class="font-momo text-xl font-bold">{bill.title}</h1>
                <p class="text-xs text-white/60">
                    Dibuat oleh {bill.owner!.username ?? bill.owner!.email} • {formatDate(bill.createdAt)}
                </p>
            </div>

            <div class="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
                <p class="text-sm text-gray-500">Bagian kamu, {participant.contact.name}:</p>
                <p class="text-3xl font-extrabold text-third">
                    {formatCurrency(participant.shareAmount, bill.currency)}
                </p>

                {#if participant.items && participant.items.length > 0}
                    <div class="space-y-1.5 border-t border-gray-100 pt-3 text-xs">
                        {#each participant.items as item (item.id)}
                            <div class="flex justify-between text-gray-600">
                                <span>{item.qty}x {item.name}</span>
                                <span class="font-medium text-third">
                                    {formatCurrency(item.subTotal, bill.currency)}
                                </span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Aksi bayar -->
            {#if status === 'completed'}
                <div class="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-700">
                    Pembayaran kamu sudah diverifikasi. Terima kasih!
                </div>
            {:else if status === 'pending'}
                <div class="rounded-2xl bg-indigo-100 p-4 text-center text-sm font-medium text-indigo-800">
                    Klaim kamu sedang menunggu verifikasi dari pembuat tagihan.
                </div>
            {:else}
                {#if !showPaymentOptions}
                    <button
                        class="w-full rounded-2xl bg-fourth py-3.5 text-sm font-bold text-white"
                        onclick={() => (showPaymentOptions = true)}
                    >
                        Bayar Sekarang
                    </button>
                {:else}
                    <div bind:this={paymentPanelEl} class="space-y-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
                        <p class="text-sm font-semibold text-third">Pilih metode pembayaran</p>
                        <div class="space-y-2">
                            {#each paymentMethods as method (method.id)}
                                <button
                                    class="flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition {selectedMethod === method.id
                                        ? 'border-fourth bg-fourth/5 text-third'
                                        : 'border-gray-200 text-gray-600 hover:border-fourth/30'}"
                                    onclick={() => (selectedMethod = method.id)}
                                >
                                    {method.label}
                                </button>
                            {/each}
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button
                                class="flex-1 rounded-xl py-2.5 text-sm font-medium text-gray-500"
                                onclick={() => {
                                    showPaymentOptions = false;
                                    selectedMethod = null;
                                }}
                            >
                                Batal
                            </button>
                            <button
                                class="flex-1 rounded-xl bg-fourth py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                onclick={submitPayment}
                                disabled={!selectedMethod || submitting}
                            >
                                {submitting ? 'Memproses...' : 'Selesaikan'}
                            </button>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </main>
{/if}