import { itemSubtotal, type BillItem } from "./billItem";

export interface Contact {
	id: string;
	name: string;
	whatsapp?: string | null;
}

export interface Participant {
	id: string;
	shareAmount: number;
	paidAt: string | null;
	claimedAt?: string | null;
	contact: Contact;
	items?: BillItem[]
}

export interface Bill {
	id: string;
	title: string;
	currency: string;
	owner?: { username: string, email: string };
	grossAmount: number | null;
	tax: number | null;
	createdAt: string; // ISO date
	updatedAt: string;
	shareToken?: string | null;
	participants: Participant[];
	items? : BillItem[];
}

export type BillStatus = 'completed' | 'pending' | 'unpaid';

export function getBillStatus(bill: Bill): BillStatus {
	if (bill.participants.length === 0) return 'pending';
	return bill.participants.every((p) => p.paidAt !== null) ? 'completed' : 'pending';
}

export function getPaidCount(bill: Bill): number {
	return bill.participants.filter((p) => p.paidAt !== null).length;
}

export function toDateKey(dateInput: string) {
	const d = new Date(dateInput);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function getParticipantStatus(p: Participant): BillStatus{
    if (p.paidAt) return 'completed';
	else if (p.claimedAt) return 'pending'
    return 'unpaid';
}

export function getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
}

export function getBillSubtotal(bill: Bill): number {
    return bill.grossAmount ?? bill.items!.reduce((sum, item) => sum + itemSubtotal(item), 0);
}

export function getBillTotal(bill: Bill): number {
    return getBillSubtotal(bill) + (bill.tax ?? 0);
}