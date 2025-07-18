// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyNFT — ERC‑721 with owner‑only minting and metadata URI  
contract MyNFT is ERC721, Ownable {
    // simple auto‑incrementing counter (Counters.sol removed in OZ 5)
    uint256 private _nextTokenId = 1;

    // base URI storage
    string private _baseTokenURI;

    event Minted(address indexed to, uint256 indexed tokenId);

    /// @param baseURI_ the prefix for tokenURI, e.g. "ipfs://<CID>/"
    constructor(string memory baseURI_)
        ERC721("MyNFT", "MNFT")
        Ownable(msg.sender)   // OZ 5 requires initialOwner
    {
        _baseTokenURI = baseURI_;
    }

    /// @inheritdoc ERC721
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Mint a new NFT to `to`. Only the contract owner can call.
    /// @return newId the freshly minted token’s ID
    function mint(address to)
        external
        onlyOwner
        returns (uint256 newId)
    {
        newId = _nextTokenId++;
        _safeMint(to, newId);
        emit Minted(to, newId);
    }
}
