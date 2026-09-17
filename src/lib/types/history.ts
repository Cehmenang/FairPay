export type ParticipantStatus = 'unpaid' | 'claimed' | 'paid';

export type HistoryParticipant = {
	id: string;
	name: string;
	shareAmount: number;
	claimedAt: string | null;
	paidAt: string | null;
	status: ParticipantStatus;
};

export type HistoryBill = {
	id: string;
	title: string;
	currency: string;
	createdAt: string;
	participants: HistoryParticipant[];
	participantCount: number;
	claimedCount: number;
	paidCount: number;
	totalAmount: number;
	paidAmount: number;
	isSettled: boolean;
	/** paidAt paling akhir di bill ini — kapan bill-nya jadi lunas. null kalau belum lunas. */
	settledAt: string | null;
};

export type HistoryFilter = 'all' | 'ongoing' | 'settled';

/** Bentuk mentah dari API NestJS. contact bisa nested atau sudah di-flatten jadi contactName. */
type RawParticipant = {
	id: string;
	shareAmount: number;
	claimedAt?: string | null;
	paidAt?: string | null;
	contact?: { name?: string | null } | null;
	contactName?: string | null;
	name?: string | null;
};

type RawBill = {
	id: string;
	title: string;
	currency?: string | null;
	createdAt: string;
	participants?: RawParticipant[] | null;
};

function participantName(p: RawParticipant) {
	return p.contact?.name ?? p.contactName ?? p.name ?? 'Tanpa nama';
}

export function toParticipantStatus(p: {
	paidAt?: string | Date | null;
	claimedAt?: string | Date | null;
}): ParticipantStatus {
	if (p.paidAt) return 'paid';
	if (p.claimedAt) return 'claimed';
	return 'unpaid';
}

export function toHistoryBill(raw: RawBill): HistoryBill {
	const participants: HistoryParticipant[] = (raw.participants ?? []).map((p) => ({
		id: p.id,
		name: participantName(p),
		shareAmount: p.shareAmount,
		claimedAt: p.claimedAt ?? null,
		paidAt: p.paidAt ?? null,
		status: toParticipantStatus(p)
	}));

	const paid = participants.filter((p) => p.paidAt);

	// bill tanpa participant jangan pernah dianggap lunas:
	// every() pada array kosong selalu true
	const isSettled = participants.length > 0 && paid.length === participants.length;

	const settledAt = isSettled
		? new Date(Math.max(...paid.map((p) => new Date(p.paidAt as string).getTime()))).toISOString()
		: null;

	return {
		id: raw.id,
		title: raw.title,
		currency: raw.currency ?? 'IDR',
		createdAt: raw.createdAt,
		participants,
		participantCount: participants.length,
		claimedCount: participants.filter((p) => p.status === 'claimed').length,
		paidCount: paid.length,
		totalAmount: participants.reduce((acc, p) => acc + p.shareAmount, 0),
		paidAmount: paid.reduce((acc, p) => acc + p.shareAmount, 0),
		isSettled,
		settledAt
	};
}

export function formatMoney(amount: number, currency = 'IDR') {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	}).format(amount);
}

export function formatDateTime(iso: string | null) {
	if (!iso) return null;
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(iso));
}

export function formatTime(iso: string | null) {
	if (!iso) return null;
	return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(
		new Date(iso)
	);
}