<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { Eye, EyeOff } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let username = $state("");
  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);

  let cardEl: HTMLElement;
  let formEls: HTMLElement[] = [];

  function togglePassword() {
    showPassword = !showPassword;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const data = { username, email, password }
    try{
      const res = await fetch('http://localhost:3000/user', {
          method: 'POST',
          body: JSON.stringify(data),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
      })
      if(res.ok){ return await goto('/bills', { invalidateAll: true }) }
    }catch(err){ console.log(err) }
  }

  onMount(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(cardEl, { y: 24, opacity: 0, scale: 0.97, duration: 0.5 }).from(
      formEls,
      { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 },
      "-=0.2"
    );
  });
</script>

<div class="flex h-dvh w-full items-center justify-center bg-primary px-4 py-10">
  <div
    bind:this={cardEl}
    class="max-w-md rounded-3xl bg-white px-6 py-10 sm:px-10"
  >
    <!-- Logo -->
    <div bind:this={formEls[0]} class="flex items-center justify-center gap-2">
      <span class="h-7 w-7 rounded-lg bg-fourth"></span>
      <span class="font-momo text-2xl text-third">
        Fair<span class="text-fourth">Pay</span>
      </span>
    </div>

    <p bind:this={formEls[1]} class="mt-4 text-center text-sm text-third/70 sm:text-base">
      Sign up to create your FairPay account
    </p>

    <!-- Google button -->
    <!-- <button
      bind:this={formEls[2]}
      type="button"
      class="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-third/20 px-6 py-3 text-sm font-medium text-third transition-colors hover:bg-third/5 sm:text-base"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
        />
      </svg>
      Continue with Google
    </button> -->

    <!-- Divider -->
    <!-- <div bind:this={formEls[3]} class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-third/15"></span>
      <span class="text-xs font-medium text-third/50">OR</span>
      <span class="h-px flex-1 bg-third/15"></span>
    </div> -->

    <form onsubmit={handleSubmit} class="flex flex-col gap-4 mt-10">
      <input
        bind:this={formEls[4]}
        bind:value={username}
        type="text"
        placeholder="Username"
        required
        class="w-full rounded-xl border border-third/20 px-4 py-3 text-sm text-third outline-none transition-colors focus:border-fourth sm:text-base"
      />

      <input
        bind:this={formEls[5]}
        bind:value={email}
        type="email"
        placeholder="Email address"
        required
        class="w-full rounded-xl border border-third/20 px-4 py-3 text-sm text-third outline-none transition-colors focus:border-fourth sm:text-base"
      />

      <div bind:this={formEls[6]} class="relative">
        <input
          bind:value={password}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          required
          class="w-full rounded-xl border border-third/20 px-4 py-3 pr-11 text-sm text-third outline-none transition-colors focus:border-fourth sm:text-base"
        />
        <button
          type="button"
          onclick={togglePassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-third/50 hover:text-third"
        >
          {#if showPassword}
            <EyeOff size={18} />
          {:else}
            <Eye size={18} />
          {/if}
        </button>
      </div>

      <button
        bind:this={formEls[7]}
        type="submit"
        class="mt-2 w-full rounded-full bg-fourth py-3 text-sm font-semibold uppercase tracking-wide text-white transition-transform hover:scale-[1.02] sm:text-base"
      >
        Continue
      </button>
    </form>

    <p bind:this={formEls[8]} class="mt-6 text-center text-sm text-third sm:text-base">
      Already have an account?
      <a href="/login" class="font-medium text-fourth hover:underline">Log in</a>
    </p>
  </div>
</div>