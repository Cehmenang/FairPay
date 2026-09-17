import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GROQ_API, GROQ_URL } from '$env/static/private';

const MAX_RETRIES = 2;

const SYSTEM_PROMPT = `OCR struk belanja. Balas HANYA JSON murni (tanpa markdown, tanpa penjelasan):
{"isReceipt":bool,"title":string|null,"currency":string|null,"items":[{"name":string,"qty":number,"unitPrice":number,"subTotal":number}],"grossAmount":number|null,"tax":number|null,"note":string|null}

Angka murni, tanpa simbol/titik ribuan.

Aturan:
- Bukan struk (orang/dokumen lain) -> isReceipt=false, field lain null/[], note=alasan singkat.
- title=nama toko. currency=ISO 4217 dari petunjuk di struk (bahasa/simbol/format/nama toko), default "IDR" jika tak ada petunjuk.
- items: gabung baris duplikat (jumlah qty). unitPrice=harga satuan (hitung mundur dari subtotal/qty jika perlu). subTotal=qty*unitPrice. Skip baris subtotal/pajak/diskon/service charge.
- grossAmount=total sebelum pajak (baris Subtotal, atau jumlah subTotal item).
- tax=nominal pajak/PPN/VAT, null jika tak ada.
- note=null jika jelas; isi singkat jika ada bagian buram/tebakan. Jangan skip item karena buram — tebak.
- Jangan mengarang item. Selalu keluarkan JSON lengkap walau harus menebak.`

export const POST: RequestHandler = async ({ request }) => {
	const { file } = await request.json();

	if (!file || typeof file !== 'string') {
		throw error(400, 'imageBase64 wajib dikirim');
	}

	let lastErrBody: unknown;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		const groqRes = await fetch(GROQ_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GROQ_API}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'qwen/qwen3.8-27b',
				temperature: 0,
				max_tokens: 700,
				reasoning_effort: 'none',
				reasoning_format: 'hidden',
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{
						role: 'user',
						content: [
							{ type: 'text', text: 'Ini fotonya.' },
							{ type: 'image_url', image_url: { url: file } }
						]
					}
				]
			})
		});

		if (groqRes.ok) {
			try {
				return json(await groqRes.json());
			} catch {
				console.warn(`Attempt ${attempt + 1}: hasil bukan JSON valid`);
				continue;
			}
		}

		const errBody = await groqRes.json().catch(() => null);
		console.warn(`Attempt ${attempt + 1} gagal:`, groqRes.status, errBody);

		if (errBody?.error?.code !== 'json_validate_failed') {
			throw error(502, 'Groq gagal memproses gambar');
		}
		lastErrBody = errBody;
	}

	console.error('Groq gagal setelah retry:', lastErrBody);
	throw error(502, 'Gagal membaca struk setelah beberapa percobaan, coba foto ulang dengan pencahayaan lebih baik');
};