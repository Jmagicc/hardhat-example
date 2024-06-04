const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const {getProofForAddress,getRootHash}= require("../merkel/verify_merkle.js");

describe("NFTContract", function () {
    let nftContract,nftContractAddress;
    let owner, addr1, addr2 ;
    let startTime, endTime;
    let distributionRoot; 

    beforeEach(async function () {
        // 获取测试账户
        [owner, addr1, addr2,] = await hre.ethers.getSigners();

        // 设置测试的开始和结束时间
        startTime = Math.floor(Date.now() / 1000); // 当前时间
        endTime = startTime + 86400; // 24小时后

        // 部署NFT合约
        const NFT = await hre.ethers.getContractFactory("NFTContract");
        const root = getRootHash(); // Example of Merkle Tree Root
        distributionRoot= root;

        const args = [
            "DAP_NFT",
            "DAP_NFT",
            distributionRoot,
            startTime,
            endTime
        ];
        nftContract = await NFT.deploy(...args);
        await nftContract.waitForDeployment();
        // await nftContract.getAddress().then((address) => {
        //     console.log("DAP_NFT deployed to:", address);
        //     nftContractAddress= address;
        //     return address;
        // });
    });

    describe("初始化测试", function () {
        it("合约部署后应正确设置销售事件时间", async function () {
            expect(await nftContract.startTime()).to.equal(startTime);
            expect(await nftContract.endTime()).to.equal(endTime);
        });
    });

    describe("铸造NFT", function () {
        it("非白名单用户在白名单时间内不能铸造NFT", async function () {
            // 假设的非白名单用户的Merkle证明
            const badProof = ["0x0000000000000000000000000000000000000000000000000000000000000000"];
            await expect(nftContract.connect(addr1).mintNFT("uri", badProof)).to.be.revertedWith("Insufficient sent");
        });

        it("白名单用户在白名单时间内可以铸造NFT", async function () {
            // 假设的白名单用户的Merkle证明，实际使用时需要替换为正确的证明
            const correctProof = getProofForAddress(owner.address)
            expect(correctProof).to.not.be.empty;
            // 模拟白名单用户铸造NFT
            await expect(nftContract.connect(addr1).mintNFT("uri", correctProof,{ value: ethers.parseEther("0.00015")})).to.emit(nftContract, "NFTMinted");
        });

        it("非白名单用户在白名单时间结束后可以通过支付ETH铸造NFT", async function () {
            // 增加时间到白名单结束后
            await ethers.provider.send("evm_increaseTime", [86400 + 1]);
            await ethers.provider.send("evm_mine");

            // 铸造NFT并支付ETH
            await expect(nftContract.connect(addr2).mintNFT("uri", [], { value: ethers.parseEther("0.00015")})).to.emit(nftContract, "NFTMinted");
        });
    });

    describe("合约所有者操作", function () {
        it("合约所有者可以更新铸造价格", async function () {
            const newMintPrice = ethers.parseEther("0.0002");
            await nftContract.setMintPrice(newMintPrice);
            expect(await nftContract.mintPrice()).to.equal(newMintPrice);
        });

        it("合约所有者可以铸造NFT而不受限制", async function () {
            await expect(nftContract.connect(owner).mintByOwner("uri")).to.emit(nftContract, "NFTMinted");
        });
    });
});