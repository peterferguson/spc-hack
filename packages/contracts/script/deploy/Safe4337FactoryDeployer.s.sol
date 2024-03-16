// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";

import {Safe4337Factory} from "../../src/safe-4337-module/Safe4337Factory.sol";

contract Safe4337FactoryDeployer is Script {
    // v1.4.1
    address public constant SAFE_PROXY_FACTORY_ADDRESS = 0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67;
    // v1.4.1
    address public constant SAFE_SINGLETON_ADDRESS = 0x29fcB43b46531BcA003ddC8FCB67FFE91900C762;
    // Deployed in other script
    address public constant ADD_MODULES_LIB_ADDRESS = 0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67;
    // v0.7.0
    address public constant ENTRY_POINT_ADDRESS = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        Safe4337Factory safe4337Factory = new Safe4337Factory(
            SAFE_PROXY_FACTORY_ADDRESS, ADD_MODULES_LIB_ADDRESS, SAFE_SINGLETON_ADDRESS, ENTRY_POINT_ADDRESS
        );
        console2.log("implementation", address(safe4337Factory));
    }
}
