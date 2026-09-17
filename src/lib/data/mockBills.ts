import type { Bill, Participant } from '$lib/types/bill';

export const participants: Participant[] = [
	{ id: 'p1', name: 'Alex Smith', color: '#8778F0' },
	{ id: 'p2', name: 'Rani Putri', color: '#2B2440' },
	{ id: 'p3', name: 'Budi Santoso', color: '#8778F0' },
	{ id: 'p4', name: 'Cehmenang', color: '#2B2440' },
	{ id: 'p5', name: 'Dinda Ayu', color: '#8778F0' },
	{ id: 'p6', name: 'Eka Wijaya', color: '#2B2440' },
	{ id: 'p7', name: 'Farah Nabila', color: '#8778F0' }
];

function pick(ids: string[]): Participant[] {
	return participants.filter((p) => ids.includes(p.id));
}

export const bills: Bill[] = [
	{
		id: 'b1',
		title: 'Sewa Kos Bulanan',
		amount: 2400000,
		currency: 'IDR',
		createdAt: '2026-08-24',
		dueDate: '2026-08-30',
		participants: pick(['p1', 'p2', 'p3', 'p4']),
		payments: [
			{ participantId: 'p1', paidAt: '2026-08-24' },
			{ participantId: 'p2', paidAt: '2026-08-25' },
			{ participantId: 'p3', paidAt: null },
			{ participantId: 'p4', paidAt: null }
		]
	},
	{
		id: 'b2',
		title: 'Langganan Netflix',
		amount: 65000,
		currency: 'IDR',
		createdAt: '2026-08-22',
		dueDate: '2026-08-27',
		participants: pick(['p1', 'p5']),
		payments: [
			{ participantId: 'p1', paidAt: '2026-08-22' },
			{ participantId: 'p5', paidAt: '2026-08-23' }
		]
	},
	{
		id: 'b3',
		title: 'Makan Malam Tim',
		amount: 480000,
		currency: 'IDR',
		createdAt: '2026-08-20',
		dueDate: '2026-08-26',
		participants: pick(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']),
		payments: [
			{ participantId: 'p1', paidAt: '2026-08-20' },
			{ participantId: 'p2', paidAt: '2026-08-20' },
			{ participantId: 'p3', paidAt: null },
			{ participantId: 'p4', paidAt: '2026-08-21' },
			{ participantId: 'p5', paidAt: null },
			{ participantId: 'p6', paidAt: null }
		]
	},
	{
		id: 'b4',
		title: 'Tagihan Listrik',
		amount: 350000,
		currency: 'IDR',
		createdAt: '2026-08-18',
		dueDate: '2026-08-25',
		participants: pick(['p1', 'p4']),
		payments: [
			{ participantId: 'p1', paidAt: '2026-08-19' },
			{ participantId: 'p4', paidAt: '2026-08-19' }
		]
	},
	{
		id: 'b5',
		title: 'Wifi Rumah',
		amount: 320000,
		currency: 'IDR',
		createdAt: '2026-08-14',
		dueDate: '2026-08-20',
		participants: pick(['p1', 'p2', 'p4', 'p7']),
		payments: [
			{ participantId: 'p1', paidAt: '2026-08-14' },
			{ participantId: 'p2', paidAt: null },
			{ participantId: 'p4', paidAt: '2026-08-15' },
			{ participantId: 'p7', paidAt: null }
		]
	},
	{
		id: 'b6',
		title: 'Trip Bandung',
		amount: 1250000,
		currency: 'IDR',
		createdAt: '2026-08-05',
		dueDate: '2026-08-12',
		participants: pick(['p2', 'p3', 'p5', 'p6', 'p7']),
		payments: [
			{ participantId: 'p2', paidAt: '2026-08-05' },
			{ participantId: 'p3', paidAt: '2026-08-06' },
			{ participantId: 'p5', paidAt: '2026-08-06' },
			{ participantId: 'p6', paidAt: '2026-08-07' },
			{ participantId: 'p7', paidAt: '2026-08-07' }
		]
	}
];

const CURRENCY_LOCALE: Record<string, string> = {
	IDR: 'id-ID',
	USD: 'en-US',
	SGD: 'en-SG',
	MYR: 'ms-MY',
	EUR: 'de-DE',
	JPY: 'ja-JP',
	GBP: 'en-GB',
	AUD: 'en-AU'
};

export function formatCurrency(amount: number, currency = 'IDR'): string {
	const locale = CURRENCY_LOCALE[currency] ?? 'en-US';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	}).format(amount);
}

export function formatDate(iso: string): string {
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(new Date(iso));
}