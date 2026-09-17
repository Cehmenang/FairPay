export interface DraftItem {
	id: string;
	name: string;
	qty: number;
	unitPrice: number;
}

export function itemSubtotal(item: DraftItem): number {
	return item.qty * item.unitPrice;
}

export function itemsGross(items: DraftItem[]): number {
	return items.reduce((sum, it) => sum + itemSubtotal(it), 0);
}

export function newEmptyItem(): DraftItem {
	return { id: crypto.randomUUID(), name: '', qty: 1, unitPrice: 0 };
}

export interface ScanResult {
	isReceipt: boolean;
	title: string | null;
	currency: string | null;
	items: { name: string; qty: number; unitPrice: number; subTotal: number }[];
	grossAmount: number | null;
	tax: number | null;
	note: string | null;
}

export interface DraftParticipant {
	id: string;
	name: string;
	whatsapp?: string | null;
	shareAmount: number;
}

export interface DraftContact {
	id: string;
	name: string;
}

export type SplitMethod = 'even' | 'perItem';

export type ItemAssignments = Record<string, Record<string, number>>;

export function assignedQtyForItem(assignments: ItemAssignments, itemId: string): number {
	const map = assignments[itemId] ?? {};
	return Object.values(map).reduce((sum, q) => sum + q, 0);
}

export function computeShares(
	items: DraftItem[],
	participants: DraftParticipant[],
	assignments: ItemAssignments,
	tax: number,
	method: SplitMethod
): DraftParticipant[] {
	const gross = itemsGross(items);
	const grandTotal = gross + tax;

	if (method === 'even' || participants.length === 0) {
		if (participants.length === 0) return [];
		const even = Math.floor(grandTotal / participants.length);
		const remainder = grandTotal - even * participants.length;
		return participants.map((p, i) => ({
			...p,
			shareAmount: even + (i === 0 ? remainder : 0)
		}));
	}

	const subtotalByParticipant = new Map<string, number>();
	for (const item of items) {
		const perParticipantQty = assignments[item.id] ?? {};
		for (const [pid, qty] of Object.entries(perParticipantQty)) {
			if (qty <= 0) continue;
			subtotalByParticipant.set(pid, (subtotalByParticipant.get(pid) ?? 0) + qty * item.unitPrice);
		}
	}

	return participants.map((p) => {
		const subtotal = subtotalByParticipant.get(p.id) ?? 0;
		const taxShare = gross > 0 ? Math.round((subtotal / gross) * tax) : 0;
		return { ...p, shareAmount: subtotal + taxShare };
	});
}

export function buildItemsPayload(items: DraftItem[], assignments: ItemAssignments) {
	const payload: {
		name: string;
		qty: number;
		unitPrice: number;
		subTotal: number;
		contactId: string;
	}[] = [];

	for (const item of items) {
		const itemAssignments = assignments[item.id] ?? {};
		for (const [contactId, qty] of Object.entries(itemAssignments)) {
			if (qty <= 0) continue;
			payload.push({
				name: item.name,
				qty,
				unitPrice: item.unitPrice,
				subTotal: qty * item.unitPrice,
				contactId
			});
		}
	}

	return payload;
}

export function buildParticipantsPayload(finalParticipants: ReturnType<typeof computeShares>) {
	return finalParticipants.map((p) => ({
		contactId: p.id,
		shareAmount: p.shareAmount
	}));
}