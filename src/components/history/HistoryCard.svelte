<script lang="ts">
    import {
        formatDateTime,
        formatMoney,
        formatPaymentMethod,
        type HistoryBill,
        type ParticipantStatus
    } from '$lib/types/history';

    let { bill }: { bill: HistoryBill } = $props();

    const dotStyle: Record<ParticipantStatus, string> = {
        paid: 'bg-fourth',
        claimed: 'bg-amber-500',
        unpaid: 'bg-third/15'
    };

    let progress = $derived(
        bill.participantCount ? Math.round((bill.paidCount / bill.participantCount) * 100) : 0
    );

    let receiptNo = $derived(bill.id.replace(/-/g, '').slice(0, 8).toUpperCase());
</script>

<article class="relative overflow-hidden rounded-2xl border border-third/10 bg-secondary">
    <div class="flex flex-col gap-4 p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex flex-col gap-1">
                <h2 class="font-momo text-xl text-third">{bill.title}</h2>
                <p class="font-mono text-[11px] text-third/40">
                    No. {receiptNo} · {formatDateTime(bill.createdAt)}
                </p>
            </div>
            <div class="text-right">
                <p class="font-mono text-lg font-semibold text-third">
                    {formatMoney(bill.totalAmount, bill.currency)}
                </p>
                <p class="font-inter text-xs text-third/50">
                    {#if bill.isSettled}
                        lunas {formatDateTime(bill.settledAt)}
                    {:else if bill.claimedCount > 0}
                        <span class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        {bill.claimedCount} menunggu verifikasi
                    {:else}
                        {bill.paidCount}/{bill.participantCount} sudah bayar
                    {/if}
                </p>
            </div>
        </div>

        <div class="h-1 w-full rounded-sm bg-third/10">
            <div
                class="h-full rounded-sm bg-fourth transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style="width: {progress}%"
            ></div>
        </div>
    </div>

    <div
        class="h-px w-full border-t-2 border-dashed border-third/15"
        aria-hidden="true"
    ></div>

    <ul class="flex flex-col divide-y divide-third/10 px-5 sm:px-6">
        {#each bill.participants as participant (participant.id)}
            <li class="flex flex-col gap-2 py-3">
                <div class="flex items-baseline gap-2">
                    <span class="shrink-0 truncate font-inter text-sm text-third">{participant.name}</span>
                    <span class="min-w-4 flex-1 border-b border-dotted border-third/25"></span>
                    <span class="shrink-0 font-mono text-sm text-third/80">
                        {formatMoney(participant.shareAmount, bill.currency)}
                    </span>
                </div>

                <div class="flex items-center gap-2 pl-0.5">
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full {dotStyle[participant.status]}"></span>
                    <span class="font-inter text-[11px] text-third/45">
                        {formatDateTime(participant.claimedAt) ?? 'belum klaim'}
                    </span>

                    <span
                        class="h-px w-5 shrink-0 {participant.status === 'unpaid'
                            ? 'bg-third/15'
                            : participant.status === 'paid'
                                ? 'bg-fourth'
                                : 'bg-amber-500/50'}"
                    ></span>

                    <span class="h-1.5 w-1.5 shrink-0 rounded-full {participant.paidAt ? dotStyle.paid : 'bg-third/15'}"></span>
                    <span class="font-inter text-[11px] text-third/45">
                        {formatDateTime(participant.paidAt) ?? 'belum diverifikasi'}
                    </span>

                    {#if participant.paidAt && participant.paymentMethod}
                        <span class="rounded-full bg-fourth/10 px-2 py-0.5 font-inter text-[10px] font-medium text-fourth">
                            {formatPaymentMethod(participant.paymentMethod)}
                        </span>
                    {/if}
                </div>
            </li>
        {/each}
    </ul>

    <div class="h-4"></div>
</article>