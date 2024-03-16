// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";

import {AddModulesLib} from "../../src/libraries/AddModulesLib.sol";

contract AddModulesLibDeployer is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        AddModulesLib addModulesLib = new AddModulesLib();
        console2.log("implementation", address(addModulesLib));
    }
}
