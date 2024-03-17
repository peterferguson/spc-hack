
## Documentation

https://book.getfoundry.sh/

## Deployments

| Contract              |                                                            Address                                                            | Description                                     |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------- |
| Add Modules Lib           | [0x58e912c126f92ccd3c6856a0d1104a30d5260e2b](https://sepolia.basescan.org/address/0x58e912c126f92ccd3c6856a0d1104a30d5260e2b#code) | Utility lib for deploying a Safe with enabled modules |
| Onit Account Factory   | [0x42AB880Ea77fC7A09Eb6bA0Fe82FBC9901C114b6](https://sepolia.basescan.org/address/0x42AB880Ea77fC7A09Eb6bA0Fe82FBC9901C114b6#code) | Factory for ERC4337 Module controlled Safes               
| Example NFT   | [0x4A56fD1D63D99978FDb3aC5C152ea122514b6792](https://sepolia.basescan.org/address/0x4A56fD1D63D99978FDb3aC5C152ea122514b6792#code) | Simple NFT used in tests & demo                        |
| 

## Usage

### Test

```shell
$ forge test
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --chain-id <chainid> --private-key <your_private_key> --etherscan-api-key <your_etherscan_api_key> --verify --broadcast --legacy
```
