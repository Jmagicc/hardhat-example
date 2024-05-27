import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

import fs from 'fs';


const jsonString = fs.readFileSync('./addresses.json', 'utf8');
const WhiteList = JSON.parse(jsonString);


const leaves = WhiteList.map((x) => keccak256(x));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const rootHash = '0x' + merkleTree.getRoot().toString('hex');
const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const leaf = keccak256(testAddress);
const proof = merkleTree.getHexProof(leaf);
const isWhiteList = merkleTree.verify(proof, leaf, rootHash);

console.log('rootHash:: ', rootHash);
console.log('proof:: ', proof);
console.log('verify:: ', isWhiteList);

// rootHash::  0xfabf435885093061c20b6df39024235df5d84fe9ad8bf25f56f02979dbb969d8
// proof::  [
//     '0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0',
//     '0x7e0eefeb2d8740528b8f598997a219669f0842302d3c573e9bb7262be3387e63',
//     '0xaa1bb08222809d5a9f954b6a57f2d2b4cd633169f284a6e7c1fd5ced046795e8'
// ]
// verify::  true


// proof:
// ["0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0","0x7e0eefeb2d8740528b8f598997a219669f0842302d3c573e9bb7262be3387e63","0xaa1bb08222809d5a9f954b6a57f2d2b4cd633169f284a6e7c1fd5ced046795e8"]

