// SPDX License Identifier: MIT
pragma solidity ^0.8.28;

//* keep track of number of nfts created, sold and etc
//! counters is removed from openzeppelin. change it later
import "./Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

//$ create a new contract NFTMarketplace that inherits from ERC721URIStorage
contract NFTMarketplace is ERC721URIStorage(){
    //$ using counters
    using Counters for Counters.Counter;

    //$ create priavte counter for tokenId and itemsSold
    Counters.Counter private _tokenIds;
    Counters.Counter private _itesmSold;

    //$ listingPrice: price to list the nft
    uint256 listingPrice = 0.01 ether;

    //$ represent an address that can receive Ether.
    address payable owner;

    //$ mapping: key value pair
    //* every nft will have a unique id
    //* we will pass that id in this mapping
    mapping(uint256 => MarketItem) private idMarketItem;

    //$ MarketItem: struct that will have all the details of the nft
    struct MarketItem{
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
    modifier onlyOwner(){
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    //$ constructor
    //* ERC721("name of smartcontract", "symbol of smartcontract")
    constructor() ERC721("MRMNFTMarketPlace", "MNMP"){
        //* whoever deploys this contract will be the owner
        owner == payable(msg.sender);
    }

    //$ update the price of the nft
    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner{
        listingPrice = _listingPrice;
    }

    function getListingPrice() public view returns(uint256){
        return listingPrice;
    }

    function createToken(string memory tokenURI, uint256 price) public payable returns(uint256){
        _tokenIds.increment();
        uint256 newtokenId = _tokenIds.current();

        _mint(msg.sender, newtokenId);
        _setTokenURI(newtokenId, tokenURI);

        createMarketItem(newtokenId, price);

        return newtokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private{
        require(price > 0, "Price must be at least 1");
        require(msg.value == listingPrice, "Price must be equal to listing price");

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

    function resellToken(uint256 tokenId, uint256 price) public payable{
        require(idMarketItem[tokenId].owner == msg.sender, "You are not the owner of this token");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idMarketItem[tokenId].sold = false;
        idMarketItem[tokenId].price = price;
        idMarketItem[tokenId].price = payable(address(this));
        idMarketItem[tokenId].price = payable(msg.sender);

        _itesmSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    function createMarketSale(uint256 tokenId) public payable{
        uint256 price = idMarketItem[tokenId].price;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idMarketItem[tokenId].owner = payable(msg.sender);
        idMarketItem[tokenId].sold = true;
        idMarketItem[tokenId].owner = payable(address(0));

        _itesmSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        payable(owner).transfer(listingPrice);
        payable(idMarketItem[tokenId].seller).transfer(msg.value);
    }

    function fetchMarketItems() public view returns(MarketItem[] memory){
        uint256 itemCount = _itesmSold.current();
        uint256 unSoldItemCount = _tokenIds.current() - _itesmSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint256 i = 0; i < itemCount; i++){
            if(idMarketItem[i + 1].owner == address(this)){
                uint256 currentId = i+1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyNFTs() public view returns(MarketItem[] memory){
        uint256 totalCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint256 i = 0; i < totalCount; i++){
            if(idMarketItem[i + 1].owner == msg.sender){
                itemCount += 1;
                uint256 currentId = i+1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchItemsListed() public view returns(MarketItem[] memory){
        uint256 totalCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint256 i = 0; i < totalCount; i++){
            if(idMarketItem[i + 1].seller == msg.sender){
                itemCount += 1;
                uint256 currentId = i+1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    

}