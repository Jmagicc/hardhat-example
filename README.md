# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy-aiStarter.js --network localhost
```

# first create .env file
```shell
ACCOUNT_PRIVATE_KEY=your private key
```

# deploy contract
npx hardhat run scripts/deploy-lock.js --network merlinTestnet


# If your contract constructor accepts multiple parameters, be sure to separate each parameter with a space in the order in which the constructor is defined.
npx hardhat verify --network merlinTestnet 0x123...abc 123