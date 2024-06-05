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


// rootHash::  0x1616fe05a5e33494f9daa37158d53e5a30d62b9d0e3e8bc022472f1cee3cca98
// proof::  [
//     '0xd02dd8df66b7981f4186e837b5601f692acbeb7460d6facef1e2997bc653dd29',
//     '0x4e591a967a5d6d4831ec0a4750c0b3a62a6acab8074c2ab11b0c639115b68b0e',
//     '0x41dadca109deeb98fd1e005e85f053457c577bdd5beedcaf66e78871bba8f939',
//     '0xb292bb2a24fc8936c9b50e194a1f00a68012385992e07f9c6b220d309c0e30a6',
//     '0xa757bf3fef850f5b57086faadde26059af5d1b9bc6907214df836f10652ee68a',
//     '0xc9ab8398dd143ac88fcd849df3785ab9174c93bef42fbe8e946225ab4b84e5e3',
//     '0xe49dd2777c658aeccec94b8a21f485d942ece3488926fe93ae997aca2a736533',
//     '0x59d0ce7e3fa1a03ae152ae3fa6d96f4fa8d85ab34f5f76a1718237761e135049',
//     '0xd71c8ce25befa691d6e96012300760ced54c530c0648dc45c704ceef9767a991',
//     '0xfbce61c8c7d129d5521b85d9be20813e9a45b909f227ca7fbc1abcdd4827d291',
//     '0xe06174cc2dadc776d95e45c71c215523cf0e06e3e6b804081a2938a2815f0086',
//     '0x3b0409fae75fe3205533ea83755bc87df326d0a73ad2630a73d191427aca078a'
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
// DAP_NFT: 0xe30683D90fa2A21342FA430e67Bbb169d8A3b654