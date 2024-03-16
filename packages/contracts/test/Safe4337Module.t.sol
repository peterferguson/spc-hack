// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Test imports
import {Test, console2} from "forge-std/Test.sol";
import {ERC4337TestConfig, PackedUserOperation} from "./config/ERC4337TestConfig.t.sol";
import {SafeTestConfig, Safe, Enum} from "./config/SafeTestConfig.t.sol";
import {AddressTestConfig} from "./config/AddressTestConfig.t.sol";

// Webauthn formatting util
import {WebAuthnUtils, WebAuthnInfo} from "../src/utils/WebAuthnUtils.sol";
import {WebAuthn, Base64} from "../lib/webauthn-sol/src/WebAuthn.sol";

// Safe Module for testing
import {Safe4337Module} from "../src/safe-4337-module/Safe4337Module.sol";
import {ISafe} from "../src/interfaces/ISafe.sol";

import "forge-std/console.sol";

contract Safe4337ModuleTest is Test, ERC4337TestConfig, SafeTestConfig, AddressTestConfig {
    // The Onit account is a Safe controlled by an ERC4337 module with passkey signer
    Safe internal onitAccount;
    address payable internal onitAccountAddress;

    // The Safe 4337 Module is where the passkey is verified
    Safe4337Module public safe4337Module;
    address public safe4337ModuleAddress;

    // Some public keys used as signers in tests
    uint256[2] internal publicKey;
    uint256[2] internal publicKey2;

    // base values //
    bytes authenticatorData = hex"49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000";
    string origin = "https://sign.coinbase.com";
    // Tmp public key for testing with base auth data
    uint256[2] internal pk = [
        0x1c05286fe694493eae33312f2d2e0d0abeda8db76238b7a204be1fb87f54ce42,
        0x28fef61ef4ac300f631657635c28e59bfb2fe71bce1634c81c65642042f6dc4d
    ];
    // Tmp private key for testing with base auth data
    uint256 passkeyPrivateKey = uint256(0x03d99692017473e2d631945a812607b23269d85721e0f370b8d3e7d29a874fd2);

    // // onit values //
    // bytes authenticatorData =
    //     hex"e1c20915d53e289bfbca906c1bb50d9bcbc452502b03ea571af141b8647754564500000001010203040506070801020304050607080020d4cccf2672cd45e176543de905182e569b07b0b0ddcfe2e9a2c447d44487969ea5010203262001215820bb4890149afeb9a0b42f3d9351330b294ba8afc9799f0bd28ec872f96795ca9a2258201d03433a2a11d5cac2db61dd3129d174ad24fb07faf330267b678342953f4b43";
    // string origin = "https://spc-wallet.loca.lt";

    // uint256[2] internal pk =[
    //     0x3059301306072a8648ce3d020106082a8648ce3d03010703420004bb4890149afeb9a0b42f3d9351330b294ba8afc9799f0bd28ec872f96795ca9a
    //     0x1d03433a2a11d5cac2db61dd3129d174ad24fb07faf330267b678342953f4b43
    // ]

    /// -----------------------------------------------------------------------
    /// Setup
    /// -----------------------------------------------------------------------

    function setUp() public {
        deployOnitAccount();

        deal(onitAccountAddress, 1 ether);
    }

    // See https://github.com/safe-global/safe-modules/modules/4337/README.md
    function deployOnitAccount() internal {
        // Deploy module with passkey signer
        safe4337Module = new Safe4337Module(entryPointAddress, pk);
        safe4337ModuleAddress = address(safe4337Module);

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

        // Initcode if deployed from entrypoint on first tx
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
        assertEq(safe4337Module.owner()[0], pk[0]);
        assertEq(safe4337Module.owner()[1], pk[1]);
    }

    // test that entrypoint and other values are set correctly

    /// -----------------------------------------------------------------------
    /// Validation tests
    /// -----------------------------------------------------------------------

    function testFailsIfNotFromEntryPoint() public {
        safe4337Module.validateUserOp(userOpBase, entryPoint.getUserOpHash(userOpBase), 0);
    }

    function testValidateUserOp() public {
        // Some basic user operation
        PackedUserOperation memory userOp = buildUserOp(onitAccountAddress, 0, new bytes(0), new bytes(0));

        // Get the webauthn struct which will be verified by the module
        bytes32 challenge = entryPoint.getUserOpHash(userOp);
        WebAuthnInfo memory webAuthn = WebAuthnUtils.getWebAuthnStruct(challenge, authenticatorData, origin);

        (bytes32 r, bytes32 s) = vm.signP256(passkeyPrivateKey, webAuthn.messageHash);

        // Format the signature data
        bytes memory pksig = abi.encode(
            WebAuthn.WebAuthnAuth({
                authenticatorData: webAuthn.authenticatorData,
                clientDataJSON: webAuthn.clientDataJSON,
                typeIndex: 1,
                challengeIndex: 23,
                r: uint256(r),
                s: uint256(s)
            })
        );
        userOp.signature = pksig;

        bytes memory validateUserOpCalldata =
            abi.encodeWithSelector(Safe4337Module.validateUserOp.selector, userOp, challenge, 0);

        // We prank entrypoint and call like this so the safe handler context passes the _requireFromEntryPoint check
        vm.prank(entryPointAddress);
        (, bytes memory validationData) = onitAccountAddress.call(validateUserOpCalldata);

        assertEq(keccak256(validationData), keccak256(abi.encodePacked(uint256(0))));
    }

    /// -----------------------------------------------------------------------
    /// Execution tests
    /// -----------------------------------------------------------------------

    function testExecuteTx() public {
        // Init values for test
        uint256 aliceBalanceBefore = alice.balance;
        uint256 onitAccountBalanceBefore = onitAccountAddress.balance;
        uint256 transferAmount = 0.1 ether;

        // Some transfer user operation
        bytes memory transferExecutionCalldata =
            buildExecutionPayload(alice, transferAmount, new bytes(0), Enum.Operation.Call);
        PackedUserOperation memory userOp = buildUserOp(onitAccountAddress, 0, new bytes(0), transferExecutionCalldata);

        // Get the webauthn struct which will be verified by the module
        bytes32 challenge = entryPoint.getUserOpHash(userOp);
        WebAuthnInfo memory webAuthn = WebAuthnUtils.getWebAuthnStruct(challenge, authenticatorData, origin);

        (bytes32 r, bytes32 s) = vm.signP256(passkeyPrivateKey, webAuthn.messageHash);

        // Format the signature data
        bytes memory pksig = abi.encode(
            WebAuthn.WebAuthnAuth({
                authenticatorData: webAuthn.authenticatorData,
                clientDataJSON: webAuthn.clientDataJSON,
                typeIndex: 1,
                challengeIndex: 23,
                r: uint256(r),
                s: uint256(s)
            })
        );

        PackedUserOperation[] memory userOps = new PackedUserOperation[](1);
        userOps[0] = userOp;
        userOp.signature = pksig;

        entryPoint.handleOps(userOps, payable(alice));

        assertEq(alice.balance, aliceBalanceBefore + transferAmount);
        assertEq(onitAccountAddress.balance, onitAccountBalanceBefore - transferAmount);
    }

    /// -----------------------------------------------------------------------
    /// Utils
    /// -----------------------------------------------------------------------

    // Build payload which the entryPoint will call on the sender Onit 4337 account
    function buildExecutionPayload(address to, uint256 value, bytes memory data, Enum.Operation operation)
        internal
        pure
        returns (bytes memory)
    {
        return abi.encodeWithSignature("executeUserOp(address,uint256,bytes,uint8)", to, value, data, uint8(0));
    }
}
