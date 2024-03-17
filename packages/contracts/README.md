
## Safe ERC4337 Passkey Module

These contracts are used to demonstrate a Safe controlled with an [ERC4337 module](/packages/contracts/src/safe-4337-module/Safe4337Module.sol). The module has a passkey signer that is created by the dapp using SPC. The Safe is created using the [Safe Account Factory](/packages/contracts/src/safe-4337-module/Safe4337Factory.sol) and the ERC4337 module is added to the Safe using the Add Modules Lib.

Some notable changes to existing Safe modules are:
- Using a passkey signer x and y rather than just an existing Safe owner EOA
- The addition of webauthn-sol to verify the full webauthn data signed by the SPC passkey credential. This has been [modified slightly](/packages/contracts/src/utils/WebAuthnUtils.sol) from the Base implementation to allow for passing of origin
- Using v0.7.0 entrypoint for ERC4337

## Deployments

The contracts are deployed on Base and Arbitrum Sepolia testnets.

| Contract              |                                                            Address                                                            | Description                                     |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------- |
| Add Modules Lib           | [0x58e912c126f92ccd3c6856a0d1104a30d5260e2b](https://sepolia.basescan.org/address/0x58e912c126f92ccd3c6856a0d1104a30d5260e2b#code) | Utility lib for deploying a Safe with enabled modules |
| Safe Account Factory   | [0x758f1cE181e74b4eb3D38441a0B2b117991C5cC8](https://sepolia.basescan.org/address/0x758f1cE181e74b4eb3D38441a0B2b117991C5cC8#code) | Factory for ERC4337 Module controlled Safes               
| Example NFT   | [0x4A56fD1D63D99978FDb3aC5C152ea122514b6792](https://sepolia.basescan.org/address/0x4A56fD1D63D99978FDb3aC5C152ea122514b6792#code) | Simple NFT used in tests & demo                        |
| 

Some notable transactions on these addresses are
- [Using the factory to deploy a Safe](https://sepolia.basescan.org/tx/0xdbb657384c1f49e327f1117549a674bf07287bcf12f07f2ecb66232a7ff422a2#eventlog) where the passkey signer was created by the dapp using SPC
- Simple demo of the NFT contract [minting](https://sepolia.basescan.org/tx/0x666c40c983c3ca865b4b958d7dfd638295450930de8d7d0e720a708648446fb0) some 1155

## Usage

### Test

```shell
$ forge test
```
