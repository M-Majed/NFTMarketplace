// contracts/SmartContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable2Step, Pausable {
    uint256 private _tokenIds;

    // Flat fee required on list/resell/cancel (kept name to preserve FE calls)
    uint256 public listingPrice = 0.01 ether;

    // Unified protocol fee accounting (new)
    uint16 private protocolFeeBps;            // e.g., 250 = 2.5%, max 10000
    address payable private feeRecipient;     // separate recipient (owner by default)
    uint256 private protocolAccrued;          // accumulated protocol fees (listing + cancel + sales fee)
    mapping(address => uint256) private balances; // withdrawable seller proceeds

    mapping(uint256 => MarketItem) private idMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller; // who will receive proceeds
        address payable owner;  // escrow owner (address(this)) when listed; buyer after sale
        uint256 price;          // asking price while listed
        bool sold;              // true only immediately after sale
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // New accounting events
    event ProtocolFeeUpdated(uint16 bps);
    event ListingFeeUpdated(uint256 fee);
    event FeeRecipientUpdated(address indexed to);
    event ProceedsAccrued(address indexed seller, uint256 amount);
    event Withdrawn(address indexed seller, uint256 amount);
    event ProtocolWithdrawn(address indexed to, uint256 amount);

    constructor() ERC721("MRMNFTMarketPlace", "MNMP") Ownable(msg.sender) {
        // sensible defaults
        protocolFeeBps = 0; // start at 0% until configured
        feeRecipient = payable(msg.sender);
    }

    // --- Emergency controls ---
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // --- Fees (admin) ---
    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner {
        listingPrice = _listingPrice;
        emit ListingFeeUpdated(_listingPrice);
    }
    function setProtocolFeeBps(uint16 newBps) external onlyOwner {
        require(newBps <= 10_000, "bps too high");
        protocolFeeBps = newBps;
        emit ProtocolFeeUpdated(newBps);
    }
    function setFeeRecipient(address payable to) external onlyOwner {
        require(to != address(0), "zero addr");
        feeRecipient = to;
        emit FeeRecipientUpdated(to);
    }

    // --- Views (fees & balances) ---
    function getListingPrice() public view returns (uint256) { return listingPrice; }
    function getProtocolFeeBps() external view returns (uint16) { return protocolFeeBps; }
    function getFeeRecipient() external view returns (address) { return feeRecipient; }
    function protocolBalance() public view returns (uint256) { return protocolAccrued; }
    function pendingBalanceOf(address account) public view returns (uint256) { return balances[account]; }
    function getBalance() public view returns (uint256) { return address(this).balance; }

    // --- Mint + list ---
    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        whenNotPaused
        returns (uint256)
    {
        _tokenIds++;
        uint256 newtokenId = _tokenIds;

        _mint(msg.sender, newtokenId);
        _setTokenURI(newtokenId, tokenURI);

        createMarketItem(newtokenId, price);
        return newtokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1");
        require(msg.value == listingPrice, "Fee must equal listing price");

        // accrue listing fee
        protocolAccrued += msg.value;

        idMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    // --- Resell: list an owned NFT back on marketplace ---
    function resellToken(uint256 tokenId, uint256 price)
        public
        payable
        nonReentrant
        whenNotPaused
    {
        require(price > 0, "Price must be > 0 wei");
        require(msg.value == listingPrice, "Fee must equal listing price");

        // existence & ownership
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        // not already escrowed
        require(ownerOf(tokenId) != address(this), "Already listed");

        // approval
        require(
            getApproved(tokenId) == address(this) ||
                isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // accrue listing fee
        protocolAccrued += msg.value;

        // effects
        MarketItem storage item = idMarketItem[tokenId];
        item.sold = false;
        item.price = price;
        item.owner = payable(address(this));
        item.seller = payable(msg.sender);

        // interaction
        transferFrom(msg.sender, address(this), tokenId);
    }

    // --- Cancel a listing (pay fee; NFT back to seller) ---
    function cancelListing(uint256 tokenId) public payable nonReentrant {
        MarketItem storage item = idMarketItem[tokenId];

        require(item.owner == address(this), "Not listed");
        require(item.seller == msg.sender, "Only seller");
        require(msg.value == listingPrice, "Fee must equal listing price");

        // accrue cancel fee
        protocolAccrued += msg.value;

        // Move NFT back to the seller and clear listing
        item.owner = payable(msg.sender);
        item.sold = false;
        item.seller = payable(address(0));
        item.price = 0;

        _transfer(address(this), msg.sender, tokenId);
    }

    // --- Buy a listed NFT ---
    function createMarketSale(uint256 tokenId)
        public
        payable
        nonReentrant
        whenNotPaused
    {
        // existence & listing checks
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        MarketItem storage item = idMarketItem[tokenId];
        require(item.seller != address(0), "Listing not found");
        require(ownerOf(tokenId) == address(this) && item.owner == address(this), "Not listed");
        require(!item.sold, "Already sold");
        require(item.price > 0, "Invalid price");
        require(msg.value == item.price, "Please submit the asking price");

        // snapshot
        address payable seller = item.seller;
        uint256 price = item.price;

        // compute protocol fee
        uint256 fee = (price * protocolFeeBps) / 10_000;

        // effects
        item.owner = payable(msg.sender);
        item.sold = true;
        item.seller = payable(address(0));
        item.price = 0;

        // accounting
        protocolAccrued += fee;
        uint256 sellerProceeds = price - fee;
        balances[seller] += sellerProceeds;
        emit ProceedsAccrued(seller, sellerProceeds);

        // transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId);
    }

    // --- Seller withdraws their proceeds (pull-payments) ---
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        uint256 bal = balances[msg.sender];
        require(bal >= amount, "insufficient");
        unchecked { balances[msg.sender] = bal - amount; }
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    // --- Owner withdraws protocol accruals to any address ---
    function withdrawProtocol(address payable to, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        require(to != address(0), "zero addr");
        require(amount > 0, "amount=0");
        uint256 bal = protocolAccrued;
        require(bal >= amount, "insufficient");
        unchecked { protocolAccrued = bal - amount; }
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "protocol withdraw failed");
        emit ProtocolWithdrawn(to, amount);
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
