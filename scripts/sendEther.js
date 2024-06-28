const hre = require("hardhat");
const {ethers} = require("ethers");

async function main() {
    const [deployer, addr1, addr2] = await hre.ethers.getSigners(); // 获取部署者账户
    const targetContractAddress = "0x8464135c8F25Da09e49BC8782676a84730C318bC"; // 替换为你的目标合约地址

    const tx = await deployer.sendTransaction({
        to: targetContractAddress,
        value: hre.ethers.parseEther("1.0") // 1 Ether
    });


    await tx.wait();

    console.log(`Sent 1 Ether to ${targetContractAddress}`);

    const messageHash = "0x1fd06650b7adddbf74cf5813c60af5d77b09cf604b55ee8bef4c91eb268303ad"

    // 用addr1签名
    const signature1 = await addr1.signMessage(messageHash);
    console.log(`addr1 signed message hash: ${messageHash}`);
    console.log(`addr1 signature: ${signature1}`);

    // 用addr2签名
    const signature2 = await addr2.signMessage(messageHash);
    console.log(`addr2 signed message hash: ${messageHash}`);
    console.log(`addr2 signature: ${signature2}`);

    // 去掉signature2开头的0x并拼接
    const combinedSignature = `${signature1}${signature2.slice(2)}`;
    console.log(`Combined signature: ${combinedSignature}`);


}
// npx hardhat run scripts/sendEther.js --network localhost
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });