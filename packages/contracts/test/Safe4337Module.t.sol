// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Test imports
import {Test, console2} from "forge-std/Test.sol";
import {ERC4337TestConfig} from "./config/ERC4337TestConfig.t.sol";
import {SafeTestConfig, Safe} from "./config/SafeTestConfig.t.sol";

// Safe Module for testing
import {Safe4337Module} from "../src/safe-4337-module/Safe4337Module.sol";

contract Safe4337ModuleTest is Test, ERC4337TestConfig, SafeTestConfig {
    // The Onit account is a Safe controlled by an ERC4337 module with passkey signer
    Safe internal onitAccount;
    address payable internal onitAccountAddress;

    // The Safe 4337 Module is where the passkey is verified
    Safe4337Module public safe4337Module;
    address public safe4337ModuleAddress;

    // Some public keys used as signers in tests
    uint256[2] internal publicKey;
    uint256[2] internal publicKey2;

    function setUp() public {
        deployOnitAccount();
    }

    function deployOnitAccount() internal {
        // Deploy module with passkey
        safe4337Module = new Safe4337Module(entryPointAddress, publicKey);
    }

    function test_Increment() public {
        assertEq(address(0), address(0));
    }
}
