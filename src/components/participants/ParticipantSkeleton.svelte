<div class="flex flex-col gap-4">
    <div class="h-24 animate-pulse rounded-3xl bg-secondary"></div>
    <div class="h-12 animate-pulse rounded-2xl bg-secondary"></div>
    <div class="flex flex-col gap-2">
        {#each Array(5) as _}
            <div class="h-16 animate-pulse rounded-2xl bg-secondary"></div>
        {/each}
    </div>
</div>