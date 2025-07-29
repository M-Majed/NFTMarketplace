// contracts/SmartContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Marketplace is ReentrancyGuard {
    uint256 private _items;
    uint256 private _soldItems;

    address payable owner;

    uint256 listingPrice = 0.025 ether; // minimum price, change for what you want

    // interface to marketplace item
    struct MarketplaceItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketplaceItem) private idToMarketplaceItem;

    // declare a event for when a item is created on marketplace
    event MarketplaceItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() {
        owner = payable(msg.sender);
    }

    //$ returns the listing price of the contract
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    //* places an item for sale on the marketplace
    function createMarketplaceItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _items++;

        idToMarketplaceItem[_items] = MarketplaceItem(
            _items,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketplaceItemCreated(
            _items,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    // creates the sale of a marketplace item
    //* transfers ownership of the item, as well as funds between parties
    function createMarketplaceSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint256 price = idToMarketplaceItem[itemId].price;
        uint256 tokenId = idToMarketplaceItem[itemId].tokenId;

        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        idToMarketplaceItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketplaceItem[itemId].owner = payable(msg.sender);
        idToMarketplaceItem[itemId].sold = true;

        _soldItems++;

        payable(owner).transfer(listingPrice);
    }

    //* returns all unsold marketplace items
    function fetchMarketplaceItems()
        public
        view
        returns (MarketplaceItem[] memory)
    {
        uint256 unsoldItemCount = _items - _soldItems;
        uint256 currentIndex = 0;

        MarketplaceItem[] memory items = new MarketplaceItem[](unsoldItemCount);
        for (uint256 i = 0; i < _items; i++) {
            if (idToMarketplaceItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketplaceItem storage currentItem = idToMarketplaceItem[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    
    //* returns only items that a user has purchased
    function fetchMyNFTs() public view returns (MarketplaceItem[] memory) {
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < _items; i++) {
            if (idToMarketplaceItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketplaceItem[] memory items = new MarketplaceItem[](itemCount);
        for (uint256 i = 0; i < _items; i++) {
            if (idToMarketplaceItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketplaceItem storage currentItem = idToMarketplaceItem[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //* returns only items a user has created
    function fetchItemsCreated()
        public
        view
        returns (MarketplaceItem[] memory)
    {
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < _items; i++) {
            if (idToMarketplaceItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketplaceItem[] memory items = new MarketplaceItem[](itemCount);

        for (uint256 i = 0; i < _items; i++) {
            if (idToMarketplaceItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketplaceItem storage currentItem = idToMarketplaceItem[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}
