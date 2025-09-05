// contracts/SmartContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

//$ create a new contract NFTMarketplace that inherits from ERC721URIStorage
contract NFTMarketplace is
    ERC721URIStorage,
    ReentrancyGuard,
    Ownable2Step,
    Pausable
{
    uint256 private _tokenIds;

    //$ listingPrice: price to list the nft
    uint256 listingPrice = 0.01 ether;

    //$ represent an address that can receive Ether.
    // (owner is provided by Ownable; access via owner())

    //$ mapping: key value pair
    //* every nft will have a unique id
    //* we will pass that id in this mapping
    mapping(uint256 => MarketItem) private idMarketItem;

    //$ MarketItem: struct that will have all the details of the nft
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    //$ event: when a transaction is done, it should trigger an event
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() ERC721("MRMNFTMarketPlace", "MNMP") Ownable(msg.sender) {
        // owner is set by Ownable; no custom assignment needed
    }

    // --- Emergency controls ---
    /// @notice Pause marketplace actions (list, mint+list, buy). Cancel is still allowed.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause marketplace actions.
    function unpause() external onlyOwner {
        _unpause();
    }

    //$ update the price of the nft
    function updateListingPrice(
        uint256 _listingPrice
    ) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable whenNotPaused returns (uint256) {
        _tokenIds++;
        uint256 newtokenId = _tokenIds;

        _mint(msg.sender, newtokenId);
        _setTokenURI(newtokenId, tokenURI);

        createMarketItem(newtokenId, price);

        return newtokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        idMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        // payable(owner).transfer(listingPrice);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    function resellToken(
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant whenNotPaused {
        require(price > 0, "Price must be > 0 wei");
        require(msg.value == listingPrice, "Fee must equal listing price");

        // --- existence & ownership (OZ v5 safe existence check)
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        // --- not already escrowed in marketplace (defensive clarity)
        require(ownerOf(tokenId) != address(this), "Already listed");

        // --- approval (we pull into escrow via transferFrom)
        require(
            getApproved(tokenId) == address(this) ||
                isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // --- effects: write listing metadata before transferring
        MarketItem storage item = idMarketItem[tokenId];
        item.sold = false;
        item.price = price;
        item.owner = payable(address(this));
        item.seller = payable(msg.sender);

        // --- interaction: move NFT into escrow
        transferFrom(msg.sender, address(this), tokenId);
    }

    // Cancel a listed item and pay the cancellation fee to the contract
    function cancelListing(uint256 tokenId) public payable nonReentrant {
        MarketItem storage item = idMarketItem[tokenId];

        require(item.owner == address(this), "Item is not currently listed");
        require(item.seller == msg.sender, "Only seller can cancel");
        require(msg.value == listingPrice, "Fee must equal listing price");

        // Move NFT back to the seller and mark as not listed
        item.owner = payable(msg.sender);
        item.sold = false;
        item.seller = payable(address(0));
        item.price = 0;

        _transfer(address(this), msg.sender, tokenId);

        // NOTE: Fee stays in the contract balance (see getBalance()).
    }

    function createMarketSale(
        uint256 tokenId
    ) public payable nonReentrant whenNotPaused {
        // --- existence & listing checks
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        MarketItem storage item = idMarketItem[tokenId];
        require(item.seller != address(0), "Listing not found");
        require(ownerOf(tokenId) == address(this), "Not listed");
        require(item.owner == address(this), "Not listed (state)");
        require(!item.sold, "Already sold");
        require(item.price > 0, "Invalid price");
        require(msg.value == item.price, "Please submit the asking price");

        // snapshot values before mutating/clearing
        address payable seller = item.seller;
        uint256 price = item.price;

        // ---- effects (state updates) BEFORE external calls
        item.owner = payable(msg.sender);
        item.sold = true;
        // clear stale listing data
        item.seller = payable(address(0));
        item.price = 0;

        _transfer(address(this), msg.sender, tokenId);
        // ---- interactions (ETH transfers) via call
        (bool feeOk, ) = payable(owner()).call{value: listingPrice}("");
        require(feeOk, "Fee transfer failed");

        (bool payoutOk, ) = seller.call{value: price}("");
        require(payoutOk, "Payout transfer failed");
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalCount = _tokenIds;
        uint256 count = 0;
        for (uint256 i = 1; i <= totalCount; i++) {
            if (ownerOf(i) == msg.sender) {
                count++;
            }
        }

        MarketItem[] memory items = new MarketItem[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= totalCount; i++) {
            if (ownerOf(i) == msg.sender) {
                items[idx] = idMarketItem[i];
                idx++;
            }
        }
        return items;
    }
}
