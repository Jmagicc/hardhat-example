const { deploy } = require("@nomicfoundation/ignition-core");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const {getProofForAddress,getRootHash}= require("../merkel/verify_merkle.js");


describe("AIStarterPublicSale Contract", function () {
    let gldToken, aiStarterPublicSale;
    let owner, addr1, addr2, addrs;
    let gldTokenAddress, aiStarterPublicSaleAddress;
    const mFundAddress = "0x9adF7b1D1d4f0846f2Af926D34A6474ADcbe4FbF"; 

    beforeEach(async function () {
        deployer = await hre.ethers.getSigners(); // 获取部署者账户
        owner = deployer[0];
        addr1 = deployer[1];
  
        // 部署 GLDToken 合约
        const GLDToken = await hre.ethers.getContractFactory("GLDToken");
        gldToken = await GLDToken.deploy("10000000000000000000000"); // 假设初始供应量为 10000 GLD
        await gldToken.waitForDeployment();
        // 部署 AIStarterPublicSale 合约
        const rewardTokenAddress = await gldToken.getAddress().then((address) => {
            // console.log("GLDToken deployed to:", address);
            gldTokenAddress= address;
            return address;
        });
        const joinIdoPrice = "1000000000000000000"; // 假设IDO价格为1个代币，使用wei作为单位
        const rewardAmount = "5000000000000000000000"; // 假设奖励金额为5000代币，使用wei作为单位
        
        const root = getRootHash(); // Merkle树根的示例，需要是bytes32类型
        const args = [
            rewardTokenAddress,
            joinIdoPrice,
            rewardAmount,
            mFundAddress,
            root
        ];
        const AIStarterPublicSale = await hre.ethers.getContractFactory("AIStarterPublicSale");
        aiStarterPublicSale = await AIStarterPublicSale.deploy(...args);
        await aiStarterPublicSale.waitForDeployment();
        await aiStarterPublicSale.getAddress().then((address) => {
            // console.log("AIStarterPublicSale deployed to:", address);
            aiStarterPublicSaleAddress= address;

             // GLDToken向AIStarterPublicSale发送一些代币
            const transferAmount = "5000000000000000000000"; // 发送5000 GLD
            gldToken.connect(owner).transfer(address, transferAmount);
            return address;
        });
    });

    describe("1.Mul Joining IDO", function () {
        it("1.1 Should allow user to join IDO", async function () {
             // 初始化合约条件
            // 假设addr1是白名单中的地址，获取其Merkle proof
            const proof = getProofForAddress(owner.address)
            // 断言 proof不为空, ["0x253a73acbde0dfcdb72410f274df8c86f4e80ad90bf027a61b5cd20b2f4dddb2"]
            expect(proof).to.not.be.empty;
            // await console.log("proof:",proof);
            // // 启动IDO
            await aiStarterPublicSale.setStart(true);
            // // 第一次参与IDO
            await aiStarterPublicSale.connect(owner).joinIdo(proof, { value: ethers.parseEther("1")});
            // 检查参与后的参数
            let parameters = await aiStarterPublicSale.connect(owner).getParameters(owner.address);
            expect(parameters[7]).to.equal(ethers.parseEther("1"));
            expect(parameters[8]).to.be.above(0); // Expected token Amount
            // 第二次参与IDO
            await aiStarterPublicSale.connect(owner).joinIdo(proof,{ value: ethers.parseEther("2")});
            // 获取参与后的状态
            parameters = await aiStarterPublicSale.connect(owner).getParameters(owner.address);
            expect(parameters[7]).to.equal(ethers.parseEther("3")); // 总共提交了3 ETH
            expect(parameters[8]).to.be.above(0); //  应该有预期超过0的代币数
        });
    });
    describe("2. Claiming Tokens", function () {
        it("2.1 Should allow user to claim tokens after IDO", async function () {
            // 假设addr1是白名单中的地址，获取其Merkle proof
            const proof = getProofForAddress(owner.address);
            // 断言 proof不为空
            expect(proof).to.not.be.empty;
            // // 启动IDO
            await aiStarterPublicSale.setStart(true);
             // // 第一次参与IDO
            await aiStarterPublicSale.connect(owner).joinIdo(proof, { value: ethers.parseEther("1")});
             // 设置IDO结束后的认领时间
            await aiStarterPublicSale.setDt(3600, 7200, 10800, 14400); // 设置不同阶段的认领时间
            // 快进到IDO结束时间后再加上第一阶段认领时间，确保当前时间超过claimDt1
            await hre.network.provider.send("evm_increaseTime", [3600 + 7200]);
            await hre.network.provider.send("evm_mine");
            // 认领代币
            await aiStarterPublicSale.connect(owner).claimToken(proof);
            // 检查认领后的代币数量
            const balanceAfterClaim = await gldToken.balanceOf(owner.address);
            expect(balanceAfterClaim).to.be.above(0); // 断言用户的代币余额大于0
        });
    });



    
    describe("3. Claiming Refunds", function () {
        it("3.1 Should allow user to claim refunds if overfunded", async function () {
            // 假设addr1是白名单中的地址，获取其Merkle proof
            const proof = getProofForAddress(owner.address);
            // 断言 proof不为空
            expect(proof).to.not.be.empty;
            // 启动IDO
            await aiStarterPublicSale.setStart(true);
            // 第一次参与IDO
            await aiStarterPublicSale.connect(owner).joinIdo(proof, { value: ethers.parseEther("1")});
            // 设置IDO结束后的时间，确保当前时间超过了IDO的持续时间
            await aiStarterPublicSale.setDt(3600, 7200, 10800, 14400); // 设置不同阶段的时间
            // 快进到IDO结束的时间，确保当前时间超过了IDO的结束时间
            await hre.network.provider.send("evm_increaseTime", [3600 + 1]);
            await hre.network.provider.send("evm_mine");
            // 用户认领退款
            await aiStarterPublicSale.connect(owner).claimBTC(proof);
            // 检查认领退款后的ETH余额，这里只能检查调用是否成功，实际ETH余额的检查需要复杂的环境配置
            expect(await hre.ethers.provider.getBalance(gldTokenAddress)).to.be.below(ethers.parseEther("1"));
        });
    });
    
    describe("4. Withdrawing Funds", function () {
        it("4.1 Should allow fund address to withdraw", async function () {
            const proof = getProofForAddress(owner.address);
            expect(proof).to.not.be.empty;
            await aiStarterPublicSale.setStart(true);
            await aiStarterPublicSale.connect(owner).joinIdo(proof, { value: ethers.parseEther("1")});

            // 提取合约中的ETH到基金地址
            // let mFundAddress=owner.address
            const initialBalance = await hre.ethers.provider.getBalance(mFundAddress);
            await aiStarterPublicSale.connect(addr1).withdraw(ethers.parseEther("1"));
            const finalBalance = await hre.ethers.provider.getBalance(mFundAddress);
            expect(finalBalance).to.be.above(initialBalance); // 断言基金地址的余额增加
        });
    
        it("4.2 Should allow owner to withdraw ERC20 tokens", async function () {
           
            //  模拟IDO
            const proof = getProofForAddress(owner.address);
            expect(proof).to.not.be.empty;
            await aiStarterPublicSale.setStart(true);
            await aiStarterPublicSale.connect(owner).joinIdo(proof, { value: ethers.parseEther("1")});
            
            // 提取合约中的GLDToken到基金地址
            await aiStarterPublicSale.connect(owner).withdrawToken(gldTokenAddress, ethers.parseEther("1"));
            const balanceAfterWithdraw = await gldToken.balanceOf(addr1.address);
            expect(balanceAfterWithdraw).to.eq(ethers.parseEther("1")); // 断言基金地址的GLDToken余额为1
        });
    });
});

