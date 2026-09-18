<script lang="ts">
  import "./layout.css";
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { Receipt, Users, Wallet, Calculator } from "lucide-svelte";
    import Feature from "../components/main/Feature.svelte";

  let headlineEl: HTMLElement;
  let subEl: HTMLElement;
  let ctaEl: HTMLElement;
  let iconRefs: HTMLElement[] = [];

  onMount(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Headline letters fly in with a slight stagger
    tl.from(headlineEl.querySelectorAll(".letter"), {
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.03,
    })
      .from(
        subEl,
        { y: 20, opacity: 0, duration: 0.5 },
        "-=0.2"
      )
      .from(
        ctaEl,
        { y: 16, opacity: 0, scale: 0.95, duration: 0.4 },
        "-=0.25"
      )
      .from(
        iconRefs,
        {
          opacity: 0,
          scale: 0.6,
          duration: 0.5,
          stagger: 0.1,
        },
        "-=0.3"
      );

    // Idle floating loop for each icon, offset so they don't sync
    iconRefs.forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? -14 : 14,
        duration: 2.4 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2,
      });
    });
  });
</script>

<div class="main relative w-full h-dvh overflow-hidden bg-primary">
  <!-- Floating background icons, hidden on small screens to avoid clutter -->
  <div
    bind:this={iconRefs[0]}
    class="absolute left-[8%] top-[22%] hidden text-fourth/40 sm:block"
  >
    <Receipt size={140} strokeWidth={1.5} />
  </div>
  <div
    bind:this={iconRefs[1]}
    class="absolute right-[10%] top-[18%] hidden text-fourth/40 md:block"
  >
    <Users size={140} strokeWidth={1.5} />
  </div>
  <div
    bind:this={iconRefs[2]}
    class="absolute bottom-[20%] left-[12%] hidden text-fourth/40 md:block"
  >
    <Wallet size={160} strokeWidth={1.5} />
  </div>
  <div
    bind:this={iconRefs[3]}
    class="absolute bottom-[16%] right-[8%] hidden text-fourth/40 sm:block"
  >
    <Calculator size={180} strokeWidth={1.5} />
  </div>

  <div
    class="text relative z-10 flex h-dvh w-full flex-col items-center justify-center gap-y-6 px-4 text-center text-third sm:gap-y-8 lg:gap-y-10"
  >
    <h1
      bind:this={headlineEl}
      class="font-momo tracking-tight leading-[0.95] text-[clamp(56px,14vw,120px)]"
    >
      {#each "Fair".split("") as char}
        <span class="letter inline-block">{char}</span>
      {/each}
      <span class="text-fourth">
        {#each "Pay".split("") as char}
          <span class="letter inline-block">{char}</span>
        {/each}
      </span>
    </h1>

    <p
	  bind:this={subEl}
	  class="max-w-xl text-[clamp(16px,3.5vw,32px)] leading-snug"
    >
	  Bagi lebih pintar. Bayar
	  <span class="font-bold italic">sesuai porsimu.</span>
    </p>

    <a
      bind:this={ctaEl}
      href="/login"
      class="rounded-full bg-fourth px-8 py-2.5 font-momo text-[clamp(16px,2.5vw,20px)] text-primary transition-transform hover:scale-105 sm:px-10 sm:py-3"
    >
      Coba Gratis!
    </a>
  </div>
</div>
<Feature/>