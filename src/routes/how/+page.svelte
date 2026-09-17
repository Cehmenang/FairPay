<script lang="ts">
	import { onMount } from 'svelte';

	type Segment = {
		id: string;
		label: string;
		step: number | null;
		title: string;
		body: string[];
		sample?: string;
		note?: string;
	};

	const segments: Segment[] = [
		{
			id: 'ringkasan',
			label: 'Ringkasan',
			step: null,
			title: 'Ringkasan Alur',
			body: [
				'Aplikasi ini membantu kamu membagi tagihan patungan tanpa perlu ngitung manual satu-satu. Satu bill bisa berisi beberapa item, dan tiap item bisa dibagi ke satu atau beberapa peserta.',
				'Ada dua cara memulai: foto/scan struk lalu biarkan AI membacakan itemnya, atau input manual kalau strukmu tidak jelas atau kamu cuma mau bagi rata dari total.'
			]
		},
		{
			id: 'buat-bill',
			label: 'Buat Bill',
			step: 1,
			title: 'Buat Bill Baru',
			body: [
				'Mulai dengan memberi judul bill, misalnya nama tempat makan atau keterangan acara. Judul ini yang akan muncul di halaman Bills dan History supaya gampang dikenali belakangan.',
				'Kamu juga bisa menambahkan pajak dan biaya layanan di sini. Nilainya nanti dibagi rata secara proporsional ke tiap peserta sesuai besar porsi masing-masing, bukan dibagi rata per orang.'
			]
		},
		{
			id: 'scan-struk',
			label: 'Scan Struk (AI)',
			step: 2,
			title: 'Scan Struk dengan AI',
			body: [
				'Foto atau upload struk fisik, lalu gambar itu dikirim ke Groq untuk dibaca. AI mengikuti system prompt yang sudah diatur supaya hasilnya konsisten: setiap baris item diubah jadi data terstruktur, bukan sekadar teks bebas.',
				'Hasil bacaan AI ditampilkan sebagai draf item yang bisa kamu koreksi dulu sebelum disimpan — kalau ada nama item yang salah baca atau harga yang meleset, tinggal edit manual di langkah ini.'
			],
			sample:
				'{\n  "items": [\n    { "name": "Kopi Susu", "qty": 2, "unitPrice": 22000, "subTotal": 44000 },\n    { "name": "Roti Bakar", "qty": 1, "unitPrice": 18000, "subTotal": 18000 }\n  ],\n  "grossAmount": 62000,\n  "tax": 6200\n}',
			note: 'Bentuk JSON di atas mengikuti field BillItem (name, qty, unitPrice, subTotal) supaya bisa langsung dipetakan tanpa transformasi tambahan.'
		},
		{
			id: 'cocokkan-item',
			label: 'Cocokkan Item ke Peserta',
			step: 3,
			title: 'Cocokkan Item ke Peserta',
			body: [
				'Setelah item terisi, tambahkan peserta dari daftar kontak atau ketik nama baru. Tiap item lalu dicocokkan ke satu atau beberapa peserta yang memesan atau menanggungnya.',
				'Kalau satu item ditanggung berdua, porsinya otomatis dibagi rata untuk item itu saja — item lain tetap dihitung terpisah. Dari sinilah shareAmount tiap peserta dihitung otomatis, sudah termasuk proporsi pajak dan biaya layanan.'
			]
		},
		{
			id: 'bagikan-link',
			label: 'Bagikan Link Bill',
			step: 4,
			title: 'Bagikan Link ke Peserta',
			body: [
				'Setiap bill punya sebuah link unik yang bisa langsung kamu kirim lewat WhatsApp. Lewat link ini, peserta bisa melihat rincian item dan jumlah yang jadi tanggungannya masing-masing tanpa perlu login.',
				'Link ini sengaja dibuat per-bill, bukan per-orang, supaya satu bill selalu bisa dibuka ulang kalau kamu perlu mengecek atau membagikannya lagi.'
			]
		},
		{
			id: 'klaim-pembayaran',
			label: 'Peserta Klaim Bayar',
			step: 5,
			title: 'Peserta Menandai Sudah Bayar',
			body: [
				'Setelah transfer, peserta menandai dari halaman link tadi bahwa dirinya sudah membayar. Penanda ini tercatat sebagai waktu klaim, dan berfungsi sebagai sinyal ke kamu bahwa ada pembayaran yang perlu dicek.',
				'Klaim ini belum berarti uangnya pasti sudah kamu terima — statusnya masih menunggu verifikasi sampai kamu mengonfirmasi sendiri di langkah berikutnya.'
			]
		},
		{
			id: 'verifikasi',
			label: 'Verifikasi Pembayaran',
			step: 6,
			title: 'Verifikasi Pembayaran',
			body: [
				'Cek mutasi rekening atau riwayat e-wallet, cocokkan dengan nominal yang diklaim peserta, lalu verifikasi dari sisi kamu sebagai pemilik bill. Begitu diverifikasi, waktu verifikasi ini yang tercatat sebagai bukti pembayaran sudah benar-benar diterima.',
				'Kalau ternyata salah verifikasi atau salah orang, statusnya bisa dibatalkan lagi dan peserta tersebut kembali berstatus menunggu.'
			]
		},
		{
			id: 'lunas-history',
			label: 'Bill Lunas & History',
			step: 7,
			title: 'Bill Lunas & Riwayatnya',
			body: [
				'Begitu semua peserta dalam satu bill sudah terverifikasi, bill otomatis berstatus lunas — tidak ada tombol yang perlu ditekan, statusnya murni dihitung dari data pembayaran tiap peserta.',
				'Semua bill, yang masih berjalan maupun yang sudah lunas, bisa ditelusuri lagi dari halaman History lengkap dengan waktu tiap peserta klaim dan waktu tiap peserta diverifikasi — jadi kalau ada yang perlu ditinjau ulang, tanggal dan jamnya selalu bisa dicek dari sana.'
			]
		}
	];

	let activeId = $state(segments[0].id);
	let sectionEls: Record<string, HTMLElement> = {};

	function goTo(id: string) {
		sectionEls[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				}
			},
			{ rootMargin: '-25% 0px -65% 0px', threshold: 0 }
		);

		Object.values(sectionEls).forEach((el) => el && observer.observe(el));

		return () => observer.disconnect();
	});
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 pt-20 sm:px-8 sm:py-10 md:pt-[100px]">
	<div class="flex flex-col gap-4">
		<h1 class="font-momo text-3xl text-third sm:text-4xl">Cara Pakai</h1>
	</div>

	<p
		class="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-third/45 sm:text-sm"
	>
		<span>Foto struk</span>
		<span class="text-third/25">→</span>
		<span>AI baca item</span>
		<span class="text-third/25">→</span>
		<span>Cocokkan ke peserta</span>
		<span class="text-third/25">→</span>
		<span>Bagikan link</span>
		<span class="text-third/25">→</span>
		<span>Peserta klaim</span>
		<span class="text-third/25">→</span>
		<span>Kamu verifikasi</span>
		<span class="text-third/25">→</span>
		<span class="text-fourth">Lunas</span>
	</p>

	<!-- navigasi segmen untuk layar sempit -->
	<div class="-mx-4 overflow-x-auto px-4 sm:hidden">
		<div class="flex w-max gap-2 pb-1">
			{#each segments as segment (segment.id)}
				<button
					onclick={() => goTo(segment.id)}
					class="shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 font-inter text-xs transition-colors {activeId ===
					segment.id
						? 'border-fourth bg-fourth/10 text-fourth'
						: 'border-third/15 text-third/55'}"
				>
					{segment.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-12">
		<!-- sidebar segmen untuk layar lebar -->
		<nav class="hidden shrink-0 sm:sticky sm:top-28 sm:block sm:w-52">
			<ol class="flex flex-col">
				{#each segments as segment (segment.id)}
					<li>
						<button
							onclick={() => goTo(segment.id)}
							class="flex w-full items-baseline gap-3 border-l-2 py-2 pl-4 text-left font-inter text-sm transition-colors {activeId ===
							segment.id
								? 'border-fourth text-third'
								: 'border-third/10 text-third/45 hover:text-third/70'}"
						>
							<span
								class="font-mono text-[11px] {activeId === segment.id
									? 'text-fourth'
									: 'text-third/30'}"
							>
								{segment.step ? String(segment.step).padStart(2, '0') : '—'}
							</span>
							<span>{segment.label}</span>
						</button>
					</li>
				{/each}
			</ol>
		</nav>

		<!-- konten -->
		<div class="flex min-w-0 flex-1 flex-col gap-14">
			{#each segments as segment (segment.id)}
				<section
					id={segment.id}
					bind:this={sectionEls[segment.id]}
					class="flex scroll-mt-28 flex-col gap-3"
				>
					<div class="flex items-baseline gap-3">
						{#if segment.step}
							<span class="font-mono text-sm text-fourth">{String(segment.step).padStart(2, '0')}</span>
						{/if}
						<h2 class="font-momo text-xl text-third sm:text-2xl">{segment.title}</h2>
					</div>

					{#each segment.body as paragraph}
						<p class="max-w-[65ch] font-inter text-sm leading-relaxed text-third/70 sm:text-base">
							{paragraph}
						</p>
					{/each}

					{#if segment.sample}
						<pre
							class="mt-1 max-w-[65ch] overflow-x-auto rounded-xl border border-third/10 bg-third/[0.03] p-4 font-mono text-xs leading-relaxed text-third/70">{segment.sample}</pre>
					{/if}

					{#if segment.note}
						<p class="max-w-[65ch] border-l-2 border-amber-500/50 pl-3 font-inter text-xs text-third/50">
							{segment.note}
						</p>
					{/if}
				</section>
			{/each}
		</div>
	</div>
</div>