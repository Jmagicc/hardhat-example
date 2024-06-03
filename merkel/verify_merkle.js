const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const { log } = require('console');


const jsonString = fs.readFileSync('./whiteList.json', 'utf8');
const WhiteList = JSON.parse(jsonString);
const leaves = WhiteList.map((x) => keccak256(x));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const rootHash = '0x' + merkleTree.getRoot().toString('hex');
const testAddress = '0x58841cb93a81b3aa2b1de2bebd9bd9fb6490263f';  //example
const leaf = keccak256(testAddress);
const proof = merkleTree.getHexProof(leaf);
const isWhiteList = merkleTree.verify(proof, leaf, rootHash);

console.log('rootHash:: ', rootHash);
console.log('proof:: ', proof);  // Contract input, double quotes instead of single quotes
console.log('verify:: ', isWhiteList);

// rootHash::  0x9975b4e80ee80c53b7d3ad7dea09f60b11c14c4813f9d2d71a19c33c64c42b84
// proof::  [
//     '0x7752443926179ab91a043ecc86eaf2cb14ca7a648a61e77503ecc4823a694686',
//     '0x80494ef4bf243f44d15738160cdaf301ccd3a91b9c0a133c1e220d79314689db',
//     '0xdf8e830b5084fb4262082317003e6029dba2a689237a664b31cda8030e40923c',
//     '0x110d5bf14548f7bbb3e7049911c9e37eeda57dd3d47dc4a01f564e17dd97eceb',
//     '0x40534def59aa4e361f69e7cd473c14f84a1afc69796904286f1a3dec238b0a6f',
//     '0x1c16a3ebde95080cab7610ddf4971754e54561efe5ff77615f31dadc45aaae2b',
//     '0x8827aeb3c8663af58bf028cc1655623507b046bb3e20dea6bdccb309097f2fa2',
//     '0x5e2c77a884288caf84d63530a31b6418126313ce9687c4f04af1c995d35f8dd9',
//     '0x82a748e72e44a168b7f777953b566f283417b0005a3cdee7aaf587435910f27e',
//     '0xfbce61c8c7d129d5521b85d9be20813e9a45b909f227ca7fbc1abcdd4827d291',
//     '0x4e0c29d5e80e6342c82c488d4babc86589231993427de89f1395ac1bd06fc960'
// ]
// verify::  true


// Read whitelist addresses and create Merkle trees
function createMerkleTree() {
    const jsonString = fs.readFileSync('../merkel/hardhat_dev_account.json', 'utf8');
    const WhiteList = JSON.parse(jsonString);

    const leaves = WhiteList.map(x => keccak256(x));
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return merkleTree;
}
// The function for generating Merkle tree roots
function getRootHash() {
    const merkleTree = createMerkleTree();
    const rootHash = '0x' + merkleTree.getRoot().toString('hex');
    return rootHash;
}

// Obtain Merkle proof based on wallet address
function getProofForAddress(address) {
    const merkleTree = createMerkleTree();
    const leaf = keccak256(address);
    const proof = merkleTree.getHexProof(leaf);
    return proof;
}

module.exports = { getProofForAddress,getRootHash };


// B²  mainnet
// DAP_NFT: 0xe30683D90fa2A21342FA430e67Bbb169d8A3b654