// contracts/SmartContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; //* base NFT interface
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; //* tokenURI storage
import "hardhat/console.sol"; //* for local debugging
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; //* reentrancy guard
import "@openzeppelin/contracts/access/Ownable2Step.sol"; //* safer ownership transfer
import "@openzeppelin/contracts/utils/Pausable.sol"; //* pause()/unpause()

contract NFTMarketplace is
    ERC721URIStorage,
    ReentrancyGuard,
    Ownable2Step,
    Pausable
{
    //$ Variables and NFT Struct
    uint256 private _tokenIds;

    uint16 public constant FEE_BPS   = 100; //* 1% listing/cancel/sale fee

    uint256 private protocolAccrued; //* earned Fees
    mapping(address => uint256) private balances; //* Sellers balance

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    mapping(uint256 => MarketItem) private idMarketItem; //* index MarketItem

    //$ Log for blockchain
    event MarketItemCreated( //* create nft log
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    event ProceedsAccrued(address indexed seller, uint256 amount); //* sell nft log
    event Withdrawn(address indexed seller, uint256 amount); //* withdraw log

    //$ constructor
    constructor() ERC721("MRMNFTMarketPlace", "MNMP") Ownable(msg.sender) {} //* NFT collection name and symbol

    //$ Admin: Pause / Unpause
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    //$ return info
    function getProtocolFeeBps() external pure returns (uint16) { //* Fee
        return FEE_BPS;
    }
    function protocolBalance() public view returns (uint256) { //* SC Balance by fees
        return protocolAccrued;
    }
    function pendingBalanceOf(address account) public view returns (uint256) { //* seller balance
        return balances[account];
    }
    function getBalance() public view returns (uint256) { //* raw SC balance
        return address(this).balance;
    }

    //$ Functions
    function listingFeeFor(uint256 price) public pure returns (uint256) { //* calculate Fee
        return (price * FEE_BPS) / 10_000;
    }

    function createToken( //* create NFT
        string memory tokenURI,
        uint256 price
    ) public payable whenNotPaused returns (uint256) {
        _tokenIds++;
        uint256 newtokenId = _tokenIds;

        _mint(msg.sender, newtokenId); //* ERC721 mint func - owned by msg.sender at first
        _setTokenURI(newtokenId, tokenURI); //* store metadata

        _createMarketItem(newtokenId, price);
        return newtokenId;
    }

    function _createMarketItem(uint256 tokenId, uint256 price) private { //* list an NFT
        require(price > 0, "Price must be > 0");
        uint256 requiredFee = listingFeeFor(price);
        require(msg.value == requiredFee, "Incorrect listing fee"); //* check if caller sent ETH

        protocolAccrued += msg.value;

        idMarketItem[tokenId] = MarketItem({ //* create market item
            tokenId: tokenId,
            seller: payable(msg.sender),
            owner: payable(address(this)),
            price: price,
            sold: false
        });

        _transfer(msg.sender, address(this), tokenId); //* move NFT from caller to contract
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false); //* log
    }

    function resellToken( //* resell an NFT
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant whenNotPaused {
        require(price > 0, "Price must be > 0 wei");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(ownerOf(tokenId) != address(this), "Already listed");

        require( //* either approve NFT transer for this NFT or all
            getApproved(tokenId) == address(this) ||
            isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        uint256 requiredFee = listingFeeFor(price);
        require(msg.value == requiredFee, "Incorrect listing fee");

        protocolAccrued += msg.value;

        //* update token info
        MarketItem storage item = idMarketItem[tokenId];
        item.sold = false;
        item.price = price;
        item.owner = payable(address(this));
        item.seller = payable(msg.sender);

        transferFrom(msg.sender, address(this), tokenId); //* move NFT from user to contract
    }

    function cancelListing(uint256 tokenId) public payable nonReentrant { //* cancel listing - get minted NFT
        MarketItem storage item = idMarketItem[tokenId];

        require(item.owner == address(this), "Not listed");
        require(item.seller == msg.sender, "Only seller");

        uint256 requiredFee = listingFeeFor(item.price);
        require(msg.value == requiredFee, "Incorrect cancel fee");

        protocolAccrued += msg.value;
        
        //* update token info
        item.owner = payable(msg.sender);
        item.sold = false;
        item.seller = payable(address(0));
        item.price = 0;

        _transfer(address(this), msg.sender, tokenId); //* move NFT from contract to user
    }

    function createMarketSale( //* selling NFT
        uint256 tokenId
    ) public payable nonReentrant whenNotPaused {
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

        //* update NFT info
        item.owner = payable(msg.sender);
        item.sold = true;
        item.seller = payable(address(0));
        item.price = 0;

        protocolAccrued += requiredFee;

        //* seller recieves price-fee
        uint256 sellerProceeds = price - requiredFee;
        balances[seller] += sellerProceeds;

        emit ProceedsAccrued(seller, sellerProceeds); //* log 

        _transfer(address(this), msg.sender, tokenId); //*  //* move NFT from contract to user
    }

    function withdraw(uint256 amount) external nonReentrant { //* withdraw
        require(amount > 0, "amount=0");

        uint256 bal = balances[msg.sender];
        require(bal >= amount, "insufficient");

        unchecked { //* update user balance - unchecked skips solidity overflow check
            balances[msg.sender] = bal - amount;
        }
        
        (bool ok, ) = payable(msg.sender).call{value: amount}(""); //* send ETH to user
        require(ok, "withdraw failed");
        emit Withdrawn(msg.sender, amount); //*log
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) { //* get users NFTs
        uint256 totalCount = _tokenIds;
        uint256 count = 0;
        for (uint256 i = 1; i <= totalCount; i++) { //* loop through all NFTs to check owner
            if (ownerOf(i) == msg.sender) {
                count++;
            }
        }

        MarketItem[] memory items = new MarketItem[](count); //* allocate memory for user NFTs
        uint256 idx = 0;
        for (uint256 i = 1; i <= totalCount; i++) { //* get list of users NFTs
            if (ownerOf(i) == msg.sender) {
                items[idx] = idMarketItem[i];
                idx++;
            }
        }
        return items;
    }
}
