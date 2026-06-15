import { type ClassValue, clsx } from 'clsx';
export function cn(...inputs: ClassValue[]) { return clsx(inputs); }
export function fmt(value: number, digits = 1) { return Number.isFinite(value) ? value.toFixed(digits) : '0.0'; }
export function timeLabel(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
