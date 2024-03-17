import { clsx, type ClassValue } from "clsx";
import { getDappOrigin, getWalletOrigin } from "helpers";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getPayeeOrigin = () =>
	getDappOrigin({ isDev: import.meta.env.DEV });

export const getPaymentOrigin = () =>
	getWalletOrigin({ isDev: import.meta.env.DEV });
