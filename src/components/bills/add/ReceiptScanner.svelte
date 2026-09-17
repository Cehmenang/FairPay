<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Camera, RotateCcw, ScanLine, Upload, Loader2, AlertTriangle } from 'lucide-svelte';
	import type { ScanResult } from '$lib/types/billDraft';

	let { onScanned }: { onScanned: (result: ScanResult) => void } = $props();

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let fileInputEl: HTMLInputElement;

	let stream: MediaStream | null = null;
	let cameraReady = $state(false);
	let cameraError = $state<string | null>(null);
	let capturedImage = $state<string | null>(null);
	let scanning = $state(false);
	let scanError = $state<string | null>(null);
	let notReceiptNote = $state<string | null>(null);

	async function startCamera() {
		cameraError = null;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 1280 } },
				audio: false
			});
			if (videoEl) {
				videoEl.srcObject = stream;
				await videoEl.play();
				cameraReady = true;
			}
		} catch (err) {
			cameraError = 'Tidak bisa mengakses kamera. Coba upload foto dari galeri di bawah.';
			console.error(err);
		}
	}

	function stopCamera() {
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		cameraReady = false;
	}

	function capture() {
		if (!videoEl) return;
		const w = videoEl.videoWidth;
		const h = videoEl.videoHeight;
		canvasEl.width = w;
		canvasEl.height = h;
		canvasEl.getContext('2d')?.drawImage(videoEl, 0, 0, w, h);
		capturedImage = canvasEl.toDataURL('image/jpeg', 0.9);
		stopCamera();
	}

	function retake() {
		capturedImage = null;
		scanError = null;
		notReceiptNote = null;
		startCamera();
	}

	function onFilePicked(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			capturedImage = reader.result as string;
			stopCamera();
		};
		reader.readAsDataURL(file);
	}

	async function submitScan() {
		if (!capturedImage) return;
		scanning = true;
		scanError = null;
		notReceiptNote = null;
		try {
			const res = await fetch('/api/groq', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ file: capturedImage })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.message ?? 'Scan gagal');
			}	
			const response = await res.json();
			const result: ScanResult = JSON.parse(response.choices[0].message.content)

			if (!result.isReceipt) {
				notReceiptNote = result.note ?? 'Foto ini kelihatannya bukan struk belanja.';
				return;
			}
			onScanned(result);
		} catch (err) {
			scanError = err instanceof Error ? err.message : 'Scan gagal, coba lagi.';
		} finally {
			scanning = false;
		}
	}

	onDestroy(stopCamera);
</script>

<div class="flex flex-col gap-4 rounded-3xl bg-secondary p-5 shadow-[0_8px_24px_-12px_rgba(43,36,64,0.25)]">
	{#if !capturedImage}
		<div class="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-third/5">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video bind:this={videoEl} class="h-full w-full object-cover" playsinline muted></video>

			{#if !cameraReady && !cameraError}
				<button
					onclick={startCamera}
					class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary/60 font-inter text-sm text-third backdrop-blur-sm"
				>
					<Camera size={28} class="text-fourth" />
					Ketuk untuk aktifkan kamera
				</button>
			{/if}

			{#if cameraReady}
				<div class="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-secondary/70"></div>
			{/if}
		</div>

		{#if cameraError}
			<p class="font-inter text-xs text-[#D97757]">{cameraError}</p>
		{/if}

		<div class="flex items-center gap-3">
			{#if cameraReady}
				<button
					onclick={capture}
					class="flex flex-1 items-center justify-center gap-2 rounded-full bg-fourth py-3 font-inter text-sm font-medium text-secondary shadow-sm transition hover:brightness-110 active:scale-[0.97]"
				>
					<ScanLine size={16} />
					Ambil Foto Struk
				</button>
			{/if}
			<button
				onclick={() => fileInputEl.click()}
				class="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-inter text-sm font-medium text-third transition hover:bg-primary/70"
			>
				<Upload size={16} />
				Galeri
			</button>
			<input
				bind:this={fileInputEl}
				type="file"
				accept="image/*"
				capture="environment"
				class="hidden"
				onchange={onFilePicked}
			/>
		</div>
	{:else}
		<div class="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-third/5">
			<img src={capturedImage} alt="Preview struk" class="h-full w-full object-cover" />
			{#if scanning}
				<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-third/50 font-inter text-sm text-secondary">
					<Loader2 size={24} class="animate-spin" />
					Membaca struk...
				</div>
			{/if}
		</div>

		{#if scanError}
			<p class="font-inter text-xs text-[#D97757]">{scanError}</p>
		{/if}

		{#if notReceiptNote}
			<div class="flex items-start gap-2 rounded-2xl bg-[#FFF1EC] p-3 font-inter text-xs text-[#D97757]">
				<AlertTriangle size={14} class="mt-0.5 shrink-0" />
				<span>{notReceiptNote} Coba foto ulang, atau isi manual.</span>
			</div>
		{/if}

		<div class="flex items-center gap-3">
			<button
				onclick={retake}
				disabled={scanning}
				class="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-inter text-sm font-medium text-third transition hover:bg-primary/70 disabled:opacity-50"
			>
				<RotateCcw size={16} />
				Ambil Ulang
			</button>
			<button
				onclick={submitScan}
				disabled={scanning}
				class="flex flex-1 items-center justify-center gap-2 rounded-full bg-fourth py-3 font-inter text-sm font-medium text-secondary shadow-sm transition hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
			>
				{#if scanning}
					<Loader2 size={16} class="animate-spin" />
					Memproses...
				{:else}
					<ScanLine size={16} />
					Scan Struk Ini
				{/if}
			</button>
		</div>
	{/if}

	<canvas bind:this={canvasEl} class="hidden"></canvas>
</div>
