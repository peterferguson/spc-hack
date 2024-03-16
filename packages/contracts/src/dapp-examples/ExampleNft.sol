// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {ERC1155} from "solady/tokens/ERC1155.sol";

/**
 *  @title ExampleNft
 *  @dev This contract is an example of an ERC1155 NFT contract.
 *       It is used to demonstrate the usage of the Safe4337Module and it not meant to be used in production!
 */
contract ExampleNft is ERC1155 {
    /// @dev Constants for the token types, 0 for dapp token, 1 for NFT
    uint256 public constant DAPP_TOKEN = 0;
    uint256 public constant NFT = 1;

    mapping(uint256 => string) public uris;

    constructor(string memory uri1, string memory uri2) ERC1155() {
        // Set some URIs for the tokens
        uris[DAPP_TOKEN] = uri1;
        uris[NFT] = uri2;
    }

    function uri(uint256 id) public view override returns (string memory) {
        return uris[id];
    }

    /**
     * @dev This function is used to demonstrate the usage of the Safe4337Module
     *      It mints 10 ether of token 0 to the caller
     */
    function mintCoupon() public {
        _mint(msg.sender, DAPP_TOKEN, 10 ether, "");
    }

    /**
     * @dev This function is used to demonstrate the usage of the Safe4337Module
     *      It burns 1 ether of token 0 from the caller, in exchange for an NFT
     */
    function exchangeForNft() public {
        _burn(msg.sender, DAPP_TOKEN, 1 ether);
        _mint(msg.sender, NFT, 1, "");
    }
}
