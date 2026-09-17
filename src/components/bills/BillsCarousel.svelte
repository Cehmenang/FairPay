<script lang="ts">
    import { tick } from 'svelte';
    import { ChevronLeft, ChevronRight } from 'lucide-svelte';
    import gsap from 'gsap';
    import BillCard from './BillCard.svelte';
    import type { Bill } from '$lib/types/bill';

    let { bills }: { bills: Bill[] } = $props();

    let trackEl: HTMLDivElement;
    let cardEls: HTMLDivElement[] = [];

    function scrollByCard(dir: 1 | -1) {
        const card = trackEl.querySelector('.carousel-item') as HTMLElement | null;
        const step = (card?.offsetWidth ?? 280) + 16;
        trackEl.scrollBy({ left: dir * step, behavior: 'smooth' });
    }

    $effect(() => {
        bills;

        tick().then(() => {
            if (cardEls.length === 0) return;
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
        });
    });
</script>

<section class="flex flex-col gap-3">
<div class="flex items-center justify-between">
<h2 class="font-momo text-lg text-third">Bills Terbaru</h2>
<div class="flex gap-2">
<button
onclick={() => scrollByCard(-1)}
aria-label="Sebelumnya"
class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-third shadow-sm transition hover:bg-fourth hover:text-secondary"
>
<ChevronLeft size={16} />
</button>
<button
onclick={() => scrollByCard(1)}
aria-label="Berikutnya"
class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-third shadow-sm transition hover:bg-fourth hover:text-secondary"
>
<ChevronRight size={16} />
</button>
</div>
</div>

<div
bind:this={trackEl}
class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
>
{#each bills as bill, i (bill.id)}
<div class="carousel-item snap-start" bind:this={cardEls[i]}>
<BillCard {bill} />
</div>
{/each}
</div>
</section>

<style>
.scrollbar-hide::-webkit-scrollbar {
display: none;
    }
.scrollbar-hide {
scrollbar-width: none;
    }
</style>