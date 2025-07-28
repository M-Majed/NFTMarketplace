// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage {
    uint256 private _tokenIds;

    mapping(address => uint256[]) private balance;

    constructor() ERC721("Amazing Tokens", "AMAZ") {}

    // set the new token to the user's balance
    function updateUsersNFTs(uint256 tokenId) public {
        balance[msg.sender].push(tokenId);
    }

    //$ return all the tokens that belongs to the user
    function getUserNFTs() public view returns (uint256[] memory) {
        return balance[msg.sender];
    }

    //$ create a token for the user
    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds++;

        _mint(msg.sender, _tokenIds);
        _setTokenURI(_tokenIds, tokenURI);
        updateUsersNFTs(_tokenIds);

        return _tokenIds;
    }
}