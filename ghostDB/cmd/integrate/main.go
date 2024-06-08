package main

import (
	"context"
	"database/sql"
	"fmt"
	"ghostDB/cryptoAes"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	_ "github.com/mattn/go-sqlite3" // 导入SQLite3驱动
	"log"
	"math/big"
	"time"
)

var (
	key = []byte("XCY03LX06ZLQN30J") // 16字节的秘钥
	iv  = []byte("KM97SH196CXCY6C9") // 16字节的偏移量
)

func main() {
	db, err := sql.Open("sqlite3", "../../ghostWallets.db")
	if err != nil {
		log.Fatalf("打开数据库失败: %v", err)
	}
	defer db.Close()

	// 连接到区块链
	rpcURL := "https://b2-mainnet.alt.technology"
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("无法连接到区块链: %v", err)
	}

	// 目标地址是要归拢到的地址
	targetAddress := "0xc9d994e2e2614be1218afb55104723c2c2b8aa13"

	// 从数据库中读取所有钱包的加密私钥
	rows, err := db.Query("SELECT id, address, encryptedPrivateKey FROM wallets WHERE  id  between ? AND ?", 16, 116)
	if err != nil {
		log.Fatal("查询数据库失败：", err)
	}
	defer rows.Close()
	fmt.Println("正在读取数据库中的钱包信息...")

	for rows.Next() {
		var id int
		var address, encryptedPrivateKey string
		err = rows.Scan(&id, &address, &encryptedPrivateKey)
		if err != nil {
			log.Fatal("读取记录失败：", err)
		}

		// 解密私钥
		privateKey, err := cryptoAes.DecryptByinv(key, iv, encryptedPrivateKey)
		if err != nil {
			log.Fatalf("解密私钥失败: %v", err)
		}
		privateKeyECDSA, err := crypto.HexToECDSA(privateKey)
		if err != nil {
			log.Fatal("加载私钥失败：", err)
		}

		balance, err := client.BalanceAt(context.Background(), common.HexToAddress(address), nil)

		fmt.Println(id, " 需归拢钱包--", address, "地址目前的余额--", balance)
		// 先获取钱包地址的余额  得转出最大可转出的余额
		// 计算交易费用
		gasLimit := uint64(21000)
		gasPrice, err := client.SuggestGasPrice(context.Background())
		if err != nil {
			log.Fatalf("获取Gas价格失败: %v", err)
		}
		txCost := new(big.Int).Mul(gasPrice, big.NewInt(int64(gasLimit)))

		extraMargin := new(big.Int).Div(new(big.Int).Mul(txCost, big.NewInt(30)), big.NewInt(100)) // 计算30%的交易费用

		adjustedTxCost := new(big.Int).Add(txCost, extraMargin)

		// 计算最大可转出的余额（余额 - 调整后的交易费用）
		amount := new(big.Int).Sub(balance, adjustedTxCost)
		if amount.Sign() <= 0 {
			fmt.Println("余额不足以支付交易费用")
			continue
		}

		if amount.Sign() <= 0 {
			fmt.Println(id, " 需归拢钱包--", address, "余额不足以支付交易费用--", balance)
			continue
		}

		txHash := cryptoAes.Transfer(client, common.HexToAddress(address), privateKeyECDSA, targetAddress, amount.Int64())

		fmt.Println(id, " 需归拢钱包--", address, "成功，交易哈希:", txHash, "-- 转出了", amount.Int64())
		time.Sleep(2 * time.Second)
		fmt.Println("-------------------------------------------------------------------------------------")

	}

	// 检查是否有错误发生在迭代过程中
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	fmt.Println("Done")
}
