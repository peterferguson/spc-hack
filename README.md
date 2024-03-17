# Secure Payment Confirmation (SPC) Wallets As A Service 👛 

What if you could create a wallet instantly on any dapp, fund it & re-use it anywhere. 👀

SPC wallets are built ontop of [Secure Payment Confirmation](https://w3c.github.io/secure-payment-confirmation/) a web api designed to streamline
web2 payments that leverages passkeys to authenticate the user.

We leverage the webauthn-side of the SPC protocol to create passkey wallets that are capable of securely signing transactions on any dapp.

## What is this repo?

This repo is a simple end-to-end implementation of SPC wallets, complete with [passkey wallet contracts](https://github.com/peterferguson/spc-hack/tree/main/packages/contracts), [a simple dapp frontend](https://github.com/peterferguson/spc-hack/tree/main/apps/dapp), [wallet application](https://github.com/peterferguson/spc-hack/tree/main/apps/wallet)
& [a library](https://github.com/peterferguson/spc-hack/tree/main/packages/spc-lib) that lets you embed these wallets in your dapp.


## 🖼️ Demo

Below is a demo journey of a user that has never used the [wallet provider](https://spc-wallet.vercel.app) or the [dapp frontend](https://spc-dapp.web.app) before.

![CleanShot 2024-03-17 at 06 08 07](https://github.com/peterferguson/spc-hack/assets/7002211/8c1084b7-94a1-486d-a014-5c3ba9390fbd)

### User Steps

1. User clicks to claim but has no account -> dapp shows wallet creation popup
2. User inputs a (globally unique to the wallet provider) username
3. Counterfactual account is created linked to the public key of the passkey
4. User again clicks to claim & is presented with an SPC confirmation modal
5. User signs passkey, confirming that they have agreed to the transaction

### Corresponding Technical Steps

1. dapp check for stored credentials, fails to find any & falls back to showing wallet creation popup
2. dapp & wallet provider communicate to ensure the username is available & create a passkey if so
3. wallet provider stores the users credentials so they can be relayed to other dapps upon request
4. dapp has prepared a `UserOp` representing the `Claim Coupon` NFT, creates a [`Payment Request`](https://w3c.github.io/payment-request/#paymentrequest-interface) to be signed by the passkey on confirmation of the SPC modal
5. dapp (or wallet) send the signed `UserOp` to a bundler for inclusion.

## Project Structure 📂

    .
    |
    ├── apps                    # Examples of implementations for wallets & dapps
    │   ├── ...
    │   ├── dapp                # The dapp frontend responsible for creation & operation of the passkey operations 
    │   ├── wallet              # The wallet provider responsible for registration of passkey credentials
    │   └── ...
    ├── packages
    │   ├── ...
    │   ├── contracts           # Contracts for the Safe 4337-module (V07 bundler) with passkey signers
    │   ├── spc-lib             # A utility library with functions for communication between the wallet provider and dapp
    │   └── ...
    └── ...

---

## Deployments

- Dapp Frontend -> deployed at [https://spc-dapp.web.app](https://spc-dapp.web.app)

- Wallet Frontend -> deployed at [https://spc-wallet.vercel.app](https://spc-wallet.vercel.app)

- Contracts -> deployed at [contracts#deployments](https://github.com/peterferguson/spc-hack/tree/main/packages/contracts#deployments)
