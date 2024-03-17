import { encodeFunctionData, type Address, type Hex } from "viem";

/**
 * @dev Onit Safe 4337 Module functions
 */

// abis --------------------------------------------
const ONIT_SAFE_4337_ABI = [
	{
		type: "function",
		name: "executeUserOp",
		inputs: [
			{ name: "to", type: "address", internalType: "address" },
			{ name: "value", type: "uint256", internalType: "uint256" },
			{ name: "data", type: "bytes", internalType: "bytes" },
			{ name: "operation", type: "uint8", internalType: "uint8" },
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
] as const;

// 4337 module calls --------------------------------------------
/// @dev Build payload which the entryPoint will call on the sender Onit 4337 account
export const formatExecutionCalldata = (
	to: Address,
	value: bigint,
	data: Hex,
	operation: number,
) =>
	encodeFunctionData({
		abi: ONIT_SAFE_4337_ABI,
		functionName: "executeUserOp",
		args: [to, value, data, operation],
	});
