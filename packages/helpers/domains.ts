export const getDappOrigin = ({ isDev }: { isDev: boolean }) => {
	const domain = isDev ? "loca.lt" : "web.app";
	const origin = `https://spc-dapp.${domain}`;

	return origin;
};

export const getWalletOrigin = ({ isDev }: { isDev: boolean }) => {
	const domain = isDev ? "loca.lt" : "vercel.app"; // firebase no longer works "web.app";
	const origin = `https://spc-wallet.${domain}`;

	return origin;
};
