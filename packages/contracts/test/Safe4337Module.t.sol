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

    /// -----------------------------------------------------------------------
    /// Setup
    /// -----------------------------------------------------------------------

    function setUp() public {
        deployOnitAccount();
    }

    // See https://github.com/safe-global/safe-modules/modules/4337/README.md
    function deployOnitAccount() internal {
        // Deploy module with passkey
        safe4337Module = new Safe4337Module(entryPointAddress, publicKey);

        address[] memory modules = new address[](1);
        modules[0] = address(safe4337Module);

        // Placeholder owners since we use a passkey signer only
        address[] memory owners = new address[](1);
        owners[0] = address(0xdead);

        bytes memory initializer = abi.encodeWithSignature(
            "setup(address[],uint256,address,bytes,address,address,uint256,address)",
            owners,
            1,
            address(addModulesLib),
            abi.encodeWithSignature("enableModules(address[])", modules),
            address(safe4337Module),
            address(0),
            0,
            address(0)
        );

        // bytes memory initCallData =
        //     abi.encodeWithSignature("createProxyWithNonce(address,bytes,uint256)", address(singleton), initializer, 99);

        // bytes memory initCode = abi.encodePacked(address(proxyFactory), initCallData);

        onitAccountAddress = payable(proxyFactory.createProxyWithNonce(address(singleton), initializer, 99));
        onitAccount = Safe(onitAccountAddress);
    }

    /// -----------------------------------------------------------------------
    /// Setup tests
    /// -----------------------------------------------------------------------

    function testOnitAccountDeployedCorrectly() public {
        assertEq(onitAccount.getOwners()[0], address(0xdead));
        assertEq(onitAccount.getThreshold(), 1);
        assertTrue(onitAccount.isModuleEnabled(address(safe4337Module)));

        assertEq(address(safe4337Module.entryPoint()), entryPointAddress);
        assertEq(safe4337Module.owner()[0], publicKey[0]);
        assertEq(safe4337Module.owner()[1], publicKey[1]);
    }

    // test that entrypoint and other values are set correctly
}
