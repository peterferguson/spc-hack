// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.15;

// 4337 imports
import {EntryPoint} from "../../lib/account-abstraction/contracts/core/EntryPoint.sol";
import {UserOperationLib} from "../../lib/account-abstraction/contracts/core/UserOperationLib.sol";
import {PackedUserOperation} from "../../lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";

// Lib for encoding
import {Base64} from "../../libraries/Base64.sol";

/**
 * @title ERC4337TestConfig
 * @notice This contract is used to set up the environment for testing ERC4337
 */
contract ERC4337TestConfig {
    using UserOperationLib for PackedUserOperation;

    // Entry point
    EntryPoint public entryPoint;
    address internal entryPointAddress;

    uint192 internal constant BASE_NONCE_KEY = 0;
    uint256 internal constant INITIAL_BALANCE = 100 ether;

    // Default gas limits
    uint128 internal constant CALL_GAS_LIMIT = 30_000_000;
    uint128 internal constant VERIFICATION_GAS_LIMIT = 30_000_000;
    uint256 internal constant PRE_VERIFICATION_GAS = 20_000_000;
    uint128 internal constant MAX_FEE_PER_GAS = 1_000_000_000;
    uint128 internal constant MAX_PRIORITY_FEE_PER_GAS = 1_000_000_000;

    constructor() {
        entryPoint = new EntryPoint();
        entryPointAddress = address(entryPoint);
    }

    // -----------------------------------------------------------------------
    // 4337 Helper Functions
    // -----------------------------------------------------------------------

    PackedUserOperation public userOpBase = PackedUserOperation({
        sender: address(0),
        nonce: 0,
        initCode: new bytes(0),
        callData: new bytes(0),
        accountGasLimits: bytes32(0),
        preVerificationGas: PRE_VERIFICATION_GAS,
        gasFees: bytes32(0),
        paymasterAndData: new bytes(0),
        signature: new bytes(0)
    });

    // -----------------------------------------------------------------------
    // Packed User Operation Helper Functions
    // -----------------------------------------------------------------------

    // pack uint128 into lower end of a bytes32
    function packLow128(uint128 value) internal pure returns (bytes32) {
        return bytes32(uint256(value));
    }

    // pack uint128 into upper end of a bytes32
    function packHigh128(uint128 value) internal pure returns (bytes32) {
        return bytes32(uint256(value) << 128);
    }

    // -----------------------------------------------------------------------
    // User Operation Helper Functions
    // -----------------------------------------------------------------------

    function buildUserOp(address sender, uint256 nonce, bytes memory initCode, bytes memory callData)
        public
        view
        returns (PackedUserOperation memory userOp)
    {
        // Build on top of base op
        userOp = userOpBase;

        // Add sender and calldata to op
        userOp.sender = sender;
        userOp.nonce = nonce;
        userOp.initCode = initCode;
        userOp.callData = callData;
        userOp.accountGasLimits = packHigh128(VERIFICATION_GAS_LIMIT) | packLow128(CALL_GAS_LIMIT);
    }

    // // Build payload which the entryPoint will call on the sender 4337 account
    // function buildExecutionPayload(
    //     address to,
    //     uint256 value,
    //     bytes memory data,
    //     Enum.Operation operation
    // ) internal pure returns (bytes memory) {
    //     return abi.encodeWithSignature("executeAndRevert(address,uint256,bytes,uint8)", to, value, data, operation);
    // }

    // // Calculate gas used by sender of userOp
    // // ! currently only works when paymaster set to 0 - hence 'address(0) != address(0)'
    // function calculateGas(UserOperation memory userOp) internal pure returns (uint256) {
    //     uint256 mul = address(0) != address(0) ? 3 : 1;
    //     uint256 requiredGas = userOp.callGasLimit + userOp.verificationGasLimit * mul + userOp.preVerificationGas;

    //     return requiredGas * userOp.maxFeePerGas;
    // }

    // function failedOpError(uint256 opIndex, string memory reason) internal pure returns (bytes memory) {
    //     return abi.encodeWithSignature("FailedOp(uint256,string)", opIndex, reason);
    // }
}
