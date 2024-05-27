const hre = require("hardhat");



async function main() {
    // 部署 GLDToken 合约
    const GLDToken = await hre.ethers.getContractFactory("GLDToken");
    const gldToken = await GLDToken.deploy("10000000000000000000000"); // 假设初始供应量为 10000 GLD
    await gldToken.waitForDeployment();
    // 部署 AIStarterPublicSale 合约
    const rewardTokenAddress = await gldToken.getAddress().then((address) => {
        console.log("GLDToken deployed to:", address);
        return address;
    });

    const joinIdoPrice = "1000000000000000000"; // 假设IDO价格为1个代币，使用wei作为单位
    const rewardAmount = "5000000000000000000000"; // 假设奖励金额为5000代币，使用wei作为单位
    const mFundAddress = "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"; // 资金地址的示例
    const root = "0x25a627fce2b4a3e7c4b2cb90d49ed2c0798a3c359c123a2148e1d2cba68beb42"; // Merkle树根的示例，需要是bytes32类型

    const args = [
        rewardTokenAddress,
        joinIdoPrice,
        rewardAmount,
        mFundAddress,
        root
    ];


    const AIStarterPublicSale = await hre.ethers.getContractFactory("AIStarterPublicSale");
    const aiStarterPublicSale = await AIStarterPublicSale.deploy(...args);
    await aiStarterPublicSale.waitForDeployment();
    await aiStarterPublicSale.getAddress().then((address) => {
        console.log("AIStarterPublicSale deployed to:", address);
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });