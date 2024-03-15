import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const getPayeeDomain = () => {
	const isDev = import.meta.env.DEV;
	const domain = isDev ? "loca.lt" : "web.app";
	const payeeOrigin = `https://spc-dapp.${domain}`;

	return payeeOrigin;
};

export const sendMessage = (message: string) => {
	window.parent.postMessage({ message }, getPayeeDomain());
};
