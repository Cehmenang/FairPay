<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import {
    Split,
    ChevronLeft,
    ChevronRight,
    ScanLine,
    Wallet,
    CheckCircle2,
  } from "lucide-svelte";

  let sectionEl: HTMLElement;
  let trackEl: HTMLElement;
  let cardEls: HTMLElement[] = [];
  let animated = false;

  const cards = [
  {
    id: "scan",
    bg: "bg-fourth",
    text: "text-primary",
    title: "Scan struk, langsung terbagi untuk semua orang.",
  },
  {
    id: "ghost",
    bg: "bg-[#1E1B2E]",
    text: "text-white",
    title: "Lihat siapa berutang apa, terlacak secara real-time.",
  },
  {
    id: "settle",
    bg: "bg-[#EFECFB]",
    text: "text-third",
    title: "Catatan rapi, untuk pembagian yang adil.",
  },
];

  function scrollByCard(dir: 1 | -1) {
    if (!trackEl) return;
    const card = trackEl.querySelector("[data-card]") as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : 300;
    trackEl.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            gsap.from(cardEls, {
              y: 40,
              opacity: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: "power3.out",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionEl) observer.observe(sectionEl);

    return () => observer.disconnect();
  });
</script>

<section bind:this={sectionEl} class="w-full bg-primary px-4 py-16 sm:px-6 lg:px-10">
  <div class="mx-auto max-w-6xl">
    <!-- Top bar: label pill + nav arrows -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2 rounded-full bg-white px-5 py-2.5">
        <Split size={18} class="text-third" />
        <span class="text-sm font-medium text-third sm:text-base">Kenapa FairPay?</span>
      </div>

      <div class="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          onclick={() => scrollByCard(-1)}
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-third/40 transition-colors hover:text-third"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next"
          onclick={() => scrollByCard(1)}
          class="flex h-10 w-10 items-center justify-center rounded-full bg-fourth text-primary transition-transform hover:scale-105"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>

    <!-- Card track: horizontal scroll on mobile, grid on desktop -->
    <div
      bind:this={trackEl}
      class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0"
    >
      <!-- Card 1: Scan -->
      <div
        bind:this={cardEls[0]}
        data-card
        class="{cards[0].bg} {cards[0].text} flex min-w-[85%] shrink-0 snap-start flex-col justify-between rounded-3xl p-6 sm:min-w-0 sm:p-8"
      >
        <h3 class="text-2xl font-medium leading-snug sm:text-[28px]">
          {cards[0].title}
        </h3>

        <div class="relative mt-10 aspect-[4/5] w-full max-w-[220px] self-center rounded-2xl bg-[#1E1B2E] p-4">
          <div class="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <ScanLine size={16} class="text-fourth" />
            <span class="text-xs text-white/80">Scanning...</span>
          </div>
          <div class="mt-8">
            <p class="text-4xl font-bold text-white">$42.50</p>
            <p class="mt-1 text-xs text-white/50">Terdeteksi 3 Barang</p>
          </div>
        </div>
      </div>

      <!-- Card 2: Ghost / dark -->
      <div
        bind:this={cardEls[1]}
        data-card
        class="{cards[1].bg} {cards[1].text} flex min-w-[85%] shrink-0 snap-start flex-col justify-between rounded-3xl p-6 sm:min-w-0 sm:p-8"
      >
        <h3 class="text-2xl font-medium leading-snug sm:text-[28px]">
          {cards[1].title}
        </h3>

        <div class="my-10 flex items-center justify-center">
          <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-fourth">
            <Wallet size={44} class="text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <!-- Card 3: Settle / light -->
      <div
        bind:this={cardEls[2]}
        data-card
        class="{cards[2].bg} {cards[2].text} relative flex min-w-[85%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-6 sm:min-w-0 sm:p-8"
      >
        <h3 class="text-2xl font-medium leading-snug sm:text-[28px]">
          {cards[2].title}
        </h3>

        <div class="relative mt-10 flex h-[160px] items-center justify-center">
          <span class="absolute -left-2 top-2 -rotate-12 rounded-md bg-black/10 px-3 py-1 text-xs font-medium text-third/60">
            Pending
          </span>
          <span class="absolute right-0 top-8 rotate-6 rounded-md bg-emerald-200 px-3 py-1 text-xs font-medium text-emerald-900">
            Paid
          </span>
          <span class="absolute bottom-2 left-6 rotate-3 rounded-md bg-black/10 px-3 py-1 text-xs font-medium text-third/60">
            Pending
          </span>
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-fourth">
            <CheckCircle2 size={30} class="text-primary" />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>