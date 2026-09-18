<script lang="ts">
    import { tick } from 'svelte';
    import { page } from '$app/stores';
    import gsap from 'gsap';
    import { getBillSubtotal, getBillTotal, getInitial, getParticipantStatus, type Bill, type Participant } from '$lib/types/bill';
    import { formatCurrency, formatDate } from '$lib/data/mockBills';
    import { Check, CircleAlert, Clock } from 'lucide-svelte';
    import TopMenu from '../../../components/bills/TopMenu.svelte';

    let bill = $state<Bill | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    let copiedParticipantId = $state<string | null>(null);

async function copyLink(p: Participant) {
    if (!bill) return;
    const link = buildClaimLink(bill, p.id);

    try {
        await navigator.clipboard.writeText(link);
        copiedParticipantId = p.id;
        setTimeout(() => {
            if (copiedParticipantId === p.id) copiedParticipantId = null;
        }, 2000);
    } catch (err) {
        console.error('[copyLink] failed:', err);
        alert(`Gagal menyalin otomatis. Copy manual link ini:\n${link}`);
    }
}

    async function fetchBill(id: string) {
        loading = true;
        error = null;
        try {
            const res = await fetch(`/api/bills/${id}`, { method: 'GET' });
            if (!res.ok) {
                error = `Gagal memuat tagihan (status ${res.status})`;
                return;
            }
            bill = await res.json();
            console.log(bill, 'billnya')
        } catch (e) {
            console.error('[fetchBill] failed:', e);
            error = 'Gagal terhubung ke server';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        const { url } = $page.params as { url: string };
        fetchBill(url);
    });

    let subtotal = $derived(bill ? getBillSubtotal(bill) : 0);
    let totalAmount = $derived(bill ? getBillTotal(bill) : 0);
    let totalCollected = $derived(
        bill
            ? bill.participants
                  .filter((p) => p.paidAt !== null)
                  .reduce((sum, p) => sum + p.shareAmount, 0)
            : 0
    );
    let totalRemaining = $derived(totalAmount - totalCollected);
    let progressPercent = $derived(
        totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 1000) / 10 : 0
    );
    let paidCount = $derived(
        bill ? bill.participants.filter((p) => p.paidAt !== null).length : 0
    );
    let totalParticipants = $derived(bill?.participants.length ?? 0);

    const statusLabel: Record<string, string> = {
        completed: 'Lunas',
        pending: 'Menunggu Konfirmasi'
    };

    async function verifyParticipant(participantId: string, shareToken: string) {
        const res = await fetch(`/api/bills/verify/${shareToken}/participant/${participantId}`, {
            method: 'GET'
        });
        if (res.ok && bill) await fetchBill(bill.id);
    }

    let confirmTarget = $state<Participant | null>(null);

    function askVerify(p: Participant) {
        confirmTarget = p;
    }

    async function confirmVerify() {
        if (!confirmTarget) return;
        await verifyParticipant(confirmTarget.id, bill!.shareToken!);
        confirmTarget = null;
    }

    // --- Kirim link klaim via WhatsApp ---
    function toWhatsAppNumber(phone: string): string {
        const digits = phone.replace(/\D/g, '');
        return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    }

    function buildClaimLink(currentBill: Bill, participantId: string): string {
        return `${window.location.origin}/claim/${currentBill.shareToken}?participant=${participantId}`;
    }

    function sendWhatsAppLink(p: Participant) {
        if (!bill) return;
        if (!p.contact.whatsapp) {
            alert(`${p.contact.name} belum punya nomor WhatsApp tersimpan.`);
            return;
        }
        const link = buildClaimLink(bill, p.id);
        const message = `Halo ${p.contact.name}, ini link buat cek & konfirmasi pembayaran tagihan "${bill.title}": ${link}`;
        const waNumber = toWhatsAppNumber(p.contact.whatsapp);
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }

    let headerEl: HTMLDivElement;
    let cardEls: any[] = [];
    let progressBarEl: HTMLDivElement;
    let counter = { value: 0 };
    let displayCollected = $state(0);

    $effect(() => {
        if (!bill) return;

        tick().then(() => {
            gsap.fromTo(
                headerEl,
                { opacity: 0, y: -12 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );

            if (cardEls.length > 0) {
                gsap.fromTo(
                    cardEls,
                    { opacity: 0, y: 24, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.5,
                        stagger: 0.08,
                        ease: 'power3.out'
                    }
                );
            }
        });
    });

    $effect(() => {
        const targetPercent = progressPercent;
        const targetValue = totalCollected;

        if (progressBarEl) {
            gsap.to(progressBarEl, {
                width: `${targetPercent}%`,
                duration: 0.8,
                ease: 'power2.out'
            });
        }

        gsap.to(counter, {
            value: targetValue,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => {
                displayCollected = Math.round(counter.value);
            }
        });
    });
</script>

{#if loading}
    <div class="flex min-h-[50vh] items-center justify-center">
        <p class="text-sm text-third/50">Memuat tagihan...</p>
    </div>
{:else if error}
    <div class="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <p class="text-sm font-medium text-rose-600">{error}</p>
        <button
            class="text-xs underline text-fourth"
            onclick={() => fetchBill($page.params.url!)}
        >
            Coba lagi
        </button>
    </div>
{:else if bill}
    <main class="mx-auto max-w-5xl px-4 py-6 sm:px-8 space-y-6 pt-24 md:pt-30">
        
        <div bind:this={headerEl} class="flex flex-col gap-4">
		<h1 class="font-momo text-3xl text-third sm:text-4xl">Bills</h1>
		    <TopMenu />
	    </div>
        <!-- Header -->
        <div bind:this={headerEl} class="rounded-3xl bg-third p-6 text-white sm:p-8 space-y-2">
            <span class="text-xs text-white/60">
                {formatDate(bill.createdAt)} • Dibuat oleh {bill.owner!.username ?? bill.owner!.email}
            </span>
            <h1 class="font-momo text-2xl font-bold sm:text-3xl">{bill.title}</h1>
            <p class="text-sm text-white/70">
                {paidCount} dari {totalParticipants} peserta lunas
            </p>
        </div>

        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <!-- Participants -->
            <div class="space-y-4 lg:col-span-8">
                {#each bill.participants as p, i (p.id)}
                    {@const status = getParticipantStatus(p)}
                    <article
                        bind:this={cardEls[i]}
                        class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
                    >
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3.5">
                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-fourth relative">
                                    {getInitial(p.contact.name)}
                                    {#if p.paidAt}
                                        <Check size={18} class="rounded-full bg-green-200 text-green-800 p-1 border border-green-800 absolute bottom-[-6px] right-0"/>
                                    {:else if p.claimedAt}
                                        <Clock size={18} class="rounded-full bg-indigo-100 text-indigo-800 absolute bottom-[-6px] right-0"/>
                                    {:else}
                                        <CircleAlert size={18} class="rounded-full bg-red-200 text-red-800 absolute bottom-[-6px] right-0"/>
                                    {/if}
                                </div>
                                <div>
    <h2 class="text-base font-bold text-third">{p.contact.name}</h2>
    {#if status === 'completed'}
        <p class="text-xs text-gray-400">
            Dibayar pada {formatDate(p.paidAt!)}
        </p>
    {:else if status === 'pending'}
        <p class="text-xs text-indigo-900">
            Klaim pada {formatDate(p.claimedAt!)}
        </p>
    {:else}
        <p class="text-xs text-amber-700">
            Belum diselesaikan
        </p>
    {/if}

    {#if p.claimedAt && p.paymentMethod}
        <p class="text-xs text-gray-500">
            Metode: <span class="font-medium text-third">{p.paymentMethod}</span>
        </p>
    {/if}
</div>                          
                            </div>
                            <div class="text-right">
                                <div class="text-lg font-extrabold text-third">
                                    {formatCurrency(p.shareAmount, bill.currency)}
                                </div>
                                <div
                                    class="inline-block rounded-full px-3 py-1 text-xs font-semibold
                                    {status === 'completed' ? 'bg-emerald-50 text-emerald-700' : ''}
                                    {status === 'pending' ? 'bg-indigo-100 text-indigo-900' : ''}
                                    "
                                >
                                    {statusLabel[status]}
                                </div>
                            </div>
                        </div>

                        {#if p.items!.length > 0}
                            <div class="space-y-1.5 border-t border-gray-100 pt-3 text-xs">
                                {#each p.items! as item (item.id)}
                                    <div class="flex justify-between text-gray-600">
                                        <span>{item.qty}x {item.name}</span>
                                        <span class="font-medium text-third">
                                            {formatCurrency(item.subTotal, bill.currency)}
                                        </span>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                
                            <div class="action-btn flex gap-x-1">
    {#if p.contact.whatsapp}
        <button
            class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            onclick={() => sendWhatsAppLink(p)}
        >
            Kirim Link WA
        </button>
    {/if}
    <button
        class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
        onclick={() => copyLink(p)}
    >
        {copiedParticipantId === p.id ? 'Tersalin!' : 'Salin Link'}
    </button>
</div>


                            {#if status === 'pending'}
                                <button
                                    class="rounded-xl bg-fourth px-4 py-2 text-xs font-bold text-white"
                                    onclick={() => askVerify(p)}
                                >
                                    Verifikasi Pembayaran
                                </button>
                            {/if}
                        </div>
                    </article>
                {/each}
            </div>

            <!-- Summary -->
            <div class="lg:col-span-4">
                <div class="space-y-5 rounded-3xl border border-gray-200 bg-white p-6">
                    <div>
                        <span class="text-xs font-bold uppercase text-gray-400">Total Tagihan</span>
                        <div class="text-3xl font-extrabold text-third">
                            {formatCurrency(totalAmount, bill.currency)}
                        </div>
                    </div>

                    <div class="space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-600">
                        <div class="flex justify-between">
                            <span>Subtotal</span>
                            <span class="font-medium text-third">{formatCurrency(subtotal, bill.currency)}</span>
                        </div>
                        {#if bill.tax}
                            <div class="flex justify-between">
                                <span>Pajak &amp; Layanan</span>
                                <span class="font-medium text-third">{formatCurrency(bill.tax, bill.currency)}</span>
                            </div>
                        {/if}
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>Terkumpul: {formatCurrency(displayCollected, bill.currency)}</span>
                            <span class="font-bold text-fourth">{progressPercent}%</span>
                        </div>
                        <div class="h-2.5 w-full overflow-hidden rounded-full bg-primary">
                            <div bind:this={progressBarEl} class="h-full rounded-full bg-fourth" style="width: 0%"></div>
                        </div>
                    </div>

                    {#if totalRemaining > 0}
                    <div class="flex items-center justify-between rounded-xl bg-rose-50 p-2.5 text-sm font-bold text-rose-600">
                        <span>Sisa Belum Selesai</span>
                        <span>{formatCurrency(totalRemaining, bill.currency)}</span>
                    </div>
                    {/if}
                </div>
            </div>
        </div>
    </main>

    {#if confirmTarget}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div class="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6">
                <h3 class="text-base font-bold text-third">Konfirmasi Pembayaran</h3>
                <p class="text-sm text-gray-600">
                    Apakah Anda yakin ingin menyelesaikan pembayaran dari
                    <strong>{confirmTarget.contact.name}</strong>?
                </p>
                <div class="flex justify-end gap-2">
                    <button
                        class="rounded-xl px-4 py-2 text-sm font-medium text-gray-500"
                        onclick={() => (confirmTarget = null)}
                    >
                        Batal
                    </button>
                    <button
                        class="rounded-xl bg-fourth px-4 py-2 text-sm font-bold text-white"
                        onclick={confirmVerify}
                    >
                        Ya, Verifikasi
                    </button>
                </div>
            </div>
        </div>
    {/if}
{/if}