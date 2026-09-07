// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title NFT Marketplace Smart Contract
/// @notice Implements an escrow-backed ERC-721 NFT marketplace with minting, listing, secondary sales, and fee accounting.
/// @dev Inherits OpenZeppelin ERC721URIStorage for on-chain metadata pointers, ReentrancyGuard for reentrancy mitigation,
/// Ownable2Step for safe administrative handover, and Pausable for emergency circuit breaking.
/// Employs a pull-payment pattern (Checks-Effects-Interactions) for seller payouts to avoid denial-of-service vulnerabilities.
contract NFTMarketplace is
    ERC721URIStorage,
    ReentrancyGuard,
    Ownable2Step,
    Pausable
{
    // --- State Variables ---

    /// @dev Internal tracker for sequentially assigned token identifiers.
    uint256 private _tokenIds;

    /// @notice Protocol fee in basis points (100 BPS = 1.00%).
    uint16 public constant FEE_BPS = 100;

    /// @dev Accumulated marketplace protocol fees retained in contract escrow.
    uint256 private protocolAccrued;

    /// @dev Accounting ledger mapping seller addresses to claimable ETH proceeds (pull-payment pattern).
    mapping(address => uint256) private balances;

    /// @notice Data structure representing a single NFT listed in the marketplace.
    /// @param tokenId The unique ERC-721 token identifier.
    /// @param seller The original seller who deposited the token into escrow.
    /// @param owner Current custodial owner (address(this) while listed, or buyer upon purchase).
    /// @param price Listing price denominated in wei.
    /// @param sold Boolean flag indicating if the listing has completed.
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    /// @dev Maps a token ID to its corresponding marketplace item details.
    mapping(uint256 => MarketItem) private idMarketItem;

    // --- Events ---

    /// @notice Emitted when a new token is minted and escrowed as an active market listing.
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    /// @notice Emitted when a successful sale accrues claimable ETH proceeds for a seller.
    event ProceedsAccrued(address indexed seller, uint256 amount);

    /// @notice Emitted when an account withdraws accrued proceeds from the contract.
    event Withdrawn(address indexed seller, uint256 amount);

    // --- Constructor ---

    /// @notice Initializes the ERC-721 collection and transfers initial ownership to the deployer.
    constructor()
        ERC721("MRMNFTMarketPlace", "MNMP")
        Ownable(msg.sender)
    {}

    // --- Administrative Controls ---

    /// @notice Halts core marketplace actions (minting, listing, buying) in emergencies.
    /// @dev Callable only by the contract owner via Ownable2Step.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resumes normal marketplace operations after a pause.
    /// @dev Callable only by the contract owner via Ownable2Step.
    function unpause() external onlyOwner {
        _unpause();
    }

    // --- View & Pure Utility Functions ---

    /// @notice Retrieves the current protocol fee basis points.
    /// @return The fee in basis points (100 = 1%).
    function getProtocolFeeBps() external pure returns (uint16) {
        return FEE_BPS;
    }

    /// @notice Returns the cumulative protocol fees accrued by the contract.
    /// @return Total accrued fees in wei.
    function protocolBalance() public view returns (uint256) {
        return protocolAccrued;
    }

    /// @notice Queries the claimable proceeds balance for a specific seller.
    /// @param account Address of the seller to query.
    /// @return The withdrawable balance in wei.
    function getUserBalanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    /// @notice Returns the total raw ETH balance held by the smart contract.
    /// @dev Represents the sum of claimable seller balances, accrued fees, and active listing deposits.
    /// @return Total balance in wei.
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Calculates the required protocol listing/transaction fee for a given asking price.
    /// @param price The listing price in wei.
    /// @return The computed protocol fee in wei based on FEE_BPS.
    function listingFeeFor(uint256 price) public pure returns (uint256) {
        return (price * FEE_BPS) / 10000;
    }

    // --- Core Marketplace Functions ---

    /// @notice Mints a new NFT with token URI metadata and immediately lists it for sale in escrow.
    /// @dev Requires the sender to transfer the exact listing fee in msg.value.
    /// @param tokenURI IPFS or HTTPS URI pointing to ERC-721 metadata JSON schema.
    /// @param price The listing price in wei for the minted token.
    /// @return The newly assigned unique token ID.
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable whenNotPaused nonReentrant returns (uint256) {
        _tokenIds++;
        uint256 newtokenId = _tokenIds;

        _mint(msg.sender, newtokenId);
        _setTokenURI(newtokenId, tokenURI);

        _createMarketItem(newtokenId, price);
        return newtokenId;
    }

    /// @dev Internal helper that transfers token custody to the marketplace contract and logs listing state.
    /// @param tokenId The token identifier being listed.
    /// @param price Asking price in wei.
    function _createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be > 0");
        uint256 requiredFee = listingFeeFor(price);
        require(msg.value == requiredFee, "Incorrect listing fee");

        protocolAccrued += msg.value;

        idMarketItem[tokenId] = MarketItem({
            tokenId: tokenId,
            seller: payable(msg.sender),
            owner: payable(address(this)),
            price: price,
            sold: false
        });

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    /// @notice Relists a previously purchased or unlisted token owned by the caller.
    /// @dev Requires pre-approval via approve() or setApprovalForAll() and exact protocol listing fee in msg.value.
    /// @param tokenId The identifier of the token to list for sale.
    /// @param price The asking price in wei.
    function resellToken(
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant whenNotPaused {
        require(price > 0, "Price must be > 0 wei");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(ownerOf(tokenId) != address(this), "Already listed");

        require(
            getApproved(tokenId) == address(this) ||
            isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        uint256 requiredFee = listingFeeFor(price);
        require(msg.value == requiredFee, "Incorrect listing fee");

        protocolAccrued += msg.value;

        MarketItem storage item = idMarketItem[tokenId];
        item.sold = false;
        item.price = price;
        item.owner = payable(address(this));
        item.seller = payable(msg.sender);

        transferFrom(msg.sender, address(this), tokenId);
    }

    /// @notice Cancels an active listing, returning token custody from escrow back to the original seller.
    /// @dev Incurs a cancellation fee equal to the protocol fee to deter denial-of-inventory spam.
    /// @param tokenId The identifier of the token to cancel.
    function cancelListing(uint256 tokenId) public payable nonReentrant {
        MarketItem storage item = idMarketItem[tokenId];

        require(item.owner == address(this), "Not listed");
        require(item.seller == msg.sender, "Only seller");

        uint256 requiredFee = listingFeeFor(item.price);
        require(msg.value == requiredFee, "Incorrect cancel fee");

        protocolAccrued += msg.value;
        
        item.owner = payable(msg.sender);
        item.sold = false;
        item.seller = payable(address(0));
        item.price = 0;

        _transfer(address(this), msg.sender, tokenId);
    }

    /// @notice Executes the purchase of an actively listed token.
    /// @dev Adheres strictly to the Checks-Effects-Interactions pattern: updates internal accounting
    /// before transferring token ownership. Seller proceeds are credited to balances for pull-payment withdrawal.
    /// @param tokenId The identifier of the token being purchased.
    function createMarketSale(
        uint256 tokenId
    ) public payable nonReentrant whenNotPaused {
        require(idMarketItem[tokenId].seller != msg.sender, "Seller can't buy own NFT");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        MarketItem storage item = idMarketItem[tokenId];
        require(item.seller != address(0), "Listing not found");
        require(
            ownerOf(tokenId) == address(this) && item.owner == address(this),
            "Not listed"
        );
        require(!item.sold, "Already sold");
        require(item.price > 0, "Invalid price");
        require(msg.value == item.price, "Please submit the asking price");

        address payable seller = item.seller;
        uint256 price = item.price;
        uint256 requiredFee = listingFeeFor(item.price);

        // State update (Effects)
        item.owner = payable(msg.sender);
        item.sold = true;
        item.seller = payable(address(0));
        item.price = 0;

        protocolAccrued += requiredFee;

        // Credit seller proceeds to pull-payment ledger
        uint256 sellerProceeds = price - requiredFee;
        balances[seller] += sellerProceeds;

        emit ProceedsAccrued(seller, sellerProceeds);

        // External token transfer (Interactions)
        _transfer(address(this), msg.sender, tokenId);
    }

    /// @notice Withdraws accrued sales proceeds belonging to the caller.
    /// @dev Employs Checks-Effects-Interactions and ReentrancyGuard to protect against reentrancy attacks.
    /// Uses native call syntax with unchecked subtraction following guaranteed balance validation.
    /// @param amount Amount in wei to withdraw.
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");

        uint256 bal = balances[msg.sender];
        require(bal >= amount, "insufficient");

        unchecked {
            balances[msg.sender] = bal - amount;
        }
        
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Fetches all market items currently owned by the caller.
    /// @dev Iterates through all minted token IDs in memory. Intended for off-chain view calls.
    /// @return An array of MarketItem structs owned by the calling address.
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
