// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";

import {ExampleNft} from "../../src/dapp-examples/ExampleNft.sol";

contract ExampleNftDeployer is Script {
    string public constant EXAMPLE_NFT_URI_1 =
        "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/https%3A%2F%2Fi.imgur.com%2F7Q0QBrm.jpg";
    string public constant EXAMPLE_NFT_URI_2 =
        "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/https%3A%2F%2Fi.imgur.com%2F4t3zVHj.jpg";

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        ExampleNft exampleNft = new ExampleNft(EXAMPLE_NFT_URI_1, EXAMPLE_NFT_URI_2);
        console2.log("implementation", address(exampleNft));
    }
}
