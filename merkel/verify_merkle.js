const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const { log } = require('console');
// Read whitelist addresses and create Merkle trees
function createMerkleTree() {
    const jsonString = fs.readFileSync('./merkel/addresses.json', 'utf8');
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