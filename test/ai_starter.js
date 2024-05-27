const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");


describe("AIStarterPublicSale Contract", function () {
    let gldToken, aiStarterPublicSale;
    let owner, addr1, addr2, addrs;

    beforeEach(async function () {
        owner = await hre.ethers.getSigners(); // 获取部署者账户
        // 部署 GLDToken 合约
        const GLDToken = await hre.ethers.getContractFactory("GLDToken");
        gldToken = await GLDToken.deploy("10000000000000000000000"); // 假设初始供应量为 10000 GLD
        await gldToken.waitForDeployment();
        // 部署 AIStarterPublicSale 合约
        const rewardTokenAddress = await gldToken.getAddress().then((address) => {
            console.log("GLDToken deployed to:", address);
            return address;
        });
        const joinIdoPrice = "1000000000000000000"; // 假设IDO价格为1个代币，使用wei作为单位
        const rewardAmount = "5000000000000000000000"; // 假设奖励金额为5000代币，使用wei作为单位
        const mFundAddress = "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"; // 资金地址的示例
        const root = "0xfabf435885093061c20b6df39024235df5d84fe9ad8bf25f56f02979dbb969d8"; // Merkle树根的示例，需要是bytes32类型
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
            console.log("AIStarterPublicSale deployed to:", address);

             // GLDToken向AIStarterPublicSale发送一些代币
            const transferAmount = "5000000000000000000000"; // 发送5000 GLD
            gldToken.connect(owner).transfer(address, transferAmount);
            return address;
        });


       
    });

    describe("1.Mul Joining IDO", function () {
        it("1.1 Should allow user to join IDO", async function () {
            // 假设addr1是白名单中的地址，获取其Merkle proof
            const proof = ["0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0","0x7e0eefeb2d8740528b8f598997a219669f0842302d3c573e9bb7262be3387e63","0xaa1bb08222809d5a9f954b6a57f2d2b4cd633169f284a6e7c1fd5ced046795e8"];
            // 启动IDO
            await aiStarterPublicSale.setStart(true);
            // 第一次参与IDO
            await aiStarterPublicSale.connect(owner).joinIdo(proof, { value: ethers.parseEther("0.0000001") })
            // 检查参与后的参数
            // let parameters = await aiStarterPublicSale.connect(owner).getParameters(owner.address);
            // expect(parameters[7]).to.equal(ethers.parseEther("1"));
            // expect(parameters[8]).to.be.above(0); // Expected token Amount
            // // 第二次参与IDO
            // await aiStarterPublicSale.connect(owner).joinIdo(proof).send({ value: ethers.parseEther("2") }).wait();
            // // 再次检查参与后的参数
            // parameters = await aiStarterPublicSale.connect(owner).getParameters(owner.address);
            // expect(parameters[7]).to.equal(ethers.parseEther("3")); // 总共提交了3 ETH
            // expect(parameters[8]).to.be.above(0); //  应该有预期超过0的代币数
        });
    });




// 3. 参与IDO
//     joinIdo(proof)：用户发送ETH参与IDO。需要传入Merkle证明 proof 来验证用户是否在白名单中。
// 4. 认领代币
//     在IDO结束后的特定时间点（由 claimDt1、claimDt2 和 claimDt3 控制），用户可以调用 claimToken(proof) 函数来根据其参与IDO的金额认领代币。同样需要传入Merkle证明 proof。
// 5. 认领退款
//     如果参与IDO的总金额超过了奖励代币的价值，用户可以调用 claimBTC(proof) 函数来认领超出部分的退款。需要传入Merkle证明 proof。
// 6. 提取资金
//     withdraw(amount)：允许基金地址提取合约中的ETH。
//     withdrawToken(tokenAddr, amount)：允许合约所有者从合约中提取任意ERC20代币




});

