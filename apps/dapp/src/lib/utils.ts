import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getPaymentOrigin = () => {
  const isDev = import.meta.env.DEV;
  const domain = isDev ? "loca.lt" : "web.app";
  const paymentOrigin = `https://spc-wallet.${domain}`;

  return paymentOrigin
}

