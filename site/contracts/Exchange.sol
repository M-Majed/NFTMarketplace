// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title NFTMarketplace — list, buy, and cancel ERC‑721 sales in ETH  
contract NFTMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
    }

    /// nftContract → tokenId → Listing data
    mapping(address => mapping(uint256 => Listing)) public listings;

    event Listed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event Sale(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );
    event Cancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller
    );

    /// @dev Give the deployer `owner` rights in Ownable
    constructor() Ownable(msg.sender) {}

    /// @notice List your NFT for sale. You must first `approve` this contract.
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be > 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        listings[nftContract][tokenId] = Listing(msg.sender, price);
        emit Listed(nftContract, tokenId, msg.sender, price);
    }

    /// @notice Cancel a listing you created
    function cancelListing(address nftContract, uint256 tokenId)
        external
        nonReentrant
    {
        Listing memory listed = listings[nftContract][tokenId];
        require(listed.seller == msg.sender, "Not the seller");

        delete listings[nftContract][tokenId];
        emit Cancelled(nftContract, tokenId, msg.sender);
    }

    /// @notice Purchase a listed NFT by sending exactly `price` ETH
    function buyItem(address nftContract, uint256 tokenId)
        external
        payable
        nonReentrant
    {
        Listing memory listed = listings[nftContract][tokenId];
        require(listed.price > 0, "Not listed");
        require(msg.value == listed.price, "Incorrect ETH amount");

        // Remove listing first (reentrancy guard)
        delete listings[nftContract][tokenId];

        // Pay the seller
        (bool sent, ) = payable(listed.seller).call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(
            listed.seller,
            msg.sender,
            tokenId
        );

        emit Sale(nftContract, tokenId, msg.sender, msg.value);
    }

    /// @notice Withdraw all ETH in this contract (only owner)
    function withdraw(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool sent, ) = to.call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    /// @dev Accept ETH transfers
    receive() external payable {}
}
