export interface BillItem {
	id: string;
	name: string;
	qty: number;
	unitPrice: number;
	subTotal: number;
}

export function itemSubtotal(item: BillItem): number {
	return item.qty * item.unitPrice;
}

export function itemsTotal(items: BillItem[]): number {
	return items.reduce((sum, it) => sum + itemSubtotal(it), 0);
}

export function newEmptyItem(): BillItem {
	return { id: crypto.randomUUID(), name: '', qty: 1, unitPrice: 0, subTotal: 0 };
}
