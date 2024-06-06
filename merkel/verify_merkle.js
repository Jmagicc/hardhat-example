const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const { log } = require('console');


const jsonString = fs.readFileSync('./whiteList.json', 'utf8');
const WhiteList = JSON.parse(jsonString);
const leaves = WhiteList.map((x) => keccak256(x));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const rootHash = '0x' + merkleTree.getRoot().toString('hex');
const testAddress = '0x7A9367e4C7ddFCaCa96DB65bae68F1d267299A6C';  //example
const leaf = keccak256(testAddress);
const proof = merkleTree.getHexProof(leaf);
const isWhiteList = merkleTree.verify(proof, leaf, rootHash);

console.log('rootHash:: ', rootHash);
console.log('proof:: ', proof);  // Contract input, double quotes instead of single quotes
console.log('verify:: ', isWhiteList);


// rootHash::  0xd2fa415ea6ea1add2e97ff763bbd28f0f38ce8914a5d263a665f1430869354e3
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
//     '0xe06174cc2dadc776d95e45c71c215523cf0e06e3e6b804081a2938a2815f0086',
//     '0x0e6ba869f5d980f5ab73dd2f96066221207c2fb3915e5255ee5b2f6ec2907a2e'
// ]
// verify::  true

// Read whitelist addresses and create Merkle trees
function createMerkleTree() {
    const jsonString = fs.readFileSync('./merkel/hardhat_dev_account.json', 'utf8');
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
// DAP_NFT: 0x3FdaCd1C4fCbF43568C5f3d9E674aE9C9ba30847