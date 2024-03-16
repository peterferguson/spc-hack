
## Documentation

https://book.getfoundry.sh/

## Deployments

| Contract              |                                                            Address                                                            | Description                                     |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------- |
| Add Modules Lib           | [0x58e912c126f92ccd3c6856a0d1104a30d5260e2b](https://sepolia.basescan.org/address/0x58e912c126f92ccd3c6856a0d1104a30d5260e2b#code) | Utility lib for deploying a Safe with enabled modules |
| Onit Account Factory   | [0x5c2f5064510eddc536d07129d9bacb4cab5276a2](https://sepolia.basescan.org/address/0x5c2f5064510eddc536d07129d9bacb4cab5276a2#code) | Factory for ERC4337 Module controlled Safes                        |
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
