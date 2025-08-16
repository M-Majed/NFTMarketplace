// contracts/SmartContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

//$ create a new contract NFTMarketplace that inherits from ERC721URIStorage
contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard {
    uint256 private _tokenIds;

    //$ listingPrice: price to list the nft
    uint256 listingPrice = 0.01 ether;

    //$ represent an address that can receive Ether.
    address payable owner;

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

    //$ modifier: a special function that is used to modify the behavior of functions
    //* checks if the caller is the owner of the contract
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    //$ constructor
    //* ERC721("name of smartcontract", "symbol of smartcontract")
    constructor() ERC721("MRMNFTMarketPlace", "MNMP") {
        //* whoever deploys this contract will be the owner
        owner = payable(msg.sender);
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
    ) public payable returns (uint256) {
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
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1");
        require(msg.value == listingPrice, "Fee must equal listing price");

        // Must be the on-chain owner
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        // Must not already be listed (escrowed in the marketplace)
        require(ownerOf(tokenId) != address(this), "Already listed");

        // Marketplace must be approved for this token or as operator
        require(
            getApproved(tokenId) == address(this) ||
                isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // Update market state
        idMarketItem[tokenId].sold = false;
        idMarketItem[tokenId].price = price;
        idMarketItem[tokenId].owner = payable(address(this));
        idMarketItem[tokenId].seller = payable(msg.sender);

        // If you track this metric, keep your existing behavior:

        // Move NFT into escrow; uses approval checks
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

        _transfer(address(this), msg.sender, tokenId);

        // NOTE: Fee stays in the contract balance (see getBalance()).
    }

    function createMarketSale(uint256 tokenId) public payable nonReentrant {
        uint256 price = idMarketItem[tokenId].price;
        require(msg.value == price, "Please submit the asking price");

        address payable seller = idMarketItem[tokenId].seller;

        // ---- effects (state updates) BEFORE external calls
        idMarketItem[tokenId].owner = payable(msg.sender);
        idMarketItem[tokenId].sold = true;

        _transfer(address(this), msg.sender, tokenId);

        // ---- interactions (ETH transfers) via call
        (bool feeOk, ) = owner.call{value: listingPrice}("");
        require(feeOk, "Fee transfer failed");

        (bool payoutOk, ) = seller.call{value: msg.value}("");
        require(payoutOk, "Payout transfer failed");
    }

    // function fetchMarketItems() public view returns (MarketItem[] memory) {
    //     uint256 itemCount = _tokenIds;
    //     uint256 unSoldItemCount = _tokenIds - _itemsSold;
    //     uint256 currentIndex = 0;

    //     MarketItem[] memory items = new MarketItem[](unSoldItemCount);

    //     for (uint256 i = 0; i < itemCount; i++) {
    //         if (idMarketItem[i + 1].owner == address(this)) {
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = idMarketItem[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }

    //     return items;
    // }

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

    // function fetchItemsListed() public view returns (MarketItem[] memory) {
    //     uint256 totalCount = _tokenIds;
    //     uint256 itemCount = 0;
    //     uint256 currentIndex = 0;

    //     MarketItem[] memory items = new MarketItem[](itemCount);

    //     for (uint256 i = 0; i < totalCount; i++) {
    //         if (idMarketItem[i + 1].seller == msg.sender) {
    //             itemCount += 1;
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = idMarketItem[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }

    //     return items;
    // }
}
