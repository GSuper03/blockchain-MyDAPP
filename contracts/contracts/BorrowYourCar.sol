// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
import "./MaoMaoToken.sol";

contract BorrowYourCar is ERC721{

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);

    // maybe you need a struct to store car information
    struct Car {
        uint256 tokenId;
        address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information
    mapping(address => uint[]) public owners;
    uint256 public carCount = 0; // A counter to count how many cars are in the contract
    uint256 public MaxCarCount = 500;
    MaoMaoToken public maomaoToken;
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_){
        maomaoToken = new MaoMaoToken("MaoMaoToken", "MMT");
    }

    function CarNFT(address Car_to_Owner) public{
        require(carCount + 1 < MaxCarCount, "Over Max Car counts!");
        _mint(Car_to_Owner, carCount);
        cars[carCount].owner = Car_to_Owner;
        cars[carCount].tokenId = carCount;
        owners[Car_to_Owner].push(carCount);
        carCount++;
        console.log("get a car success!");
    }

    function getOwnedCars() public view returns (Car[] memory) {
        Car[] memory owned_cars = new Car[] (owners[msg.sender].length);
        for(uint256 i = 0; i < owned_cars.length; i++){
            owned_cars[i] = cars[owners[msg.sender][i]];
        }
        console.log("get owned cars success!");
        return owned_cars;
    }

    function isFree(uint256 CarTokenId) public returns (bool){
        require(CarTokenId < carCount, "invalid car id");
        bool isfree = false;
        if(cars[CarTokenId].borrower == address (0)){
            isfree = true;
            return isfree;
        }
        uint256 currentTime = block.timestamp;
        if(currentTime >= cars[CarTokenId].borrowUntil){
            isfree = true;
            cars[CarTokenId].borrower = address (0);
            cars[CarTokenId].borrowUntil = 0;
            return isfree;
        }
        return isfree;
    }

    function getFreeCars() public view returns (Car[] memory) {
        uint256 num = 0;
        for(uint256 i = 0; i < carCount; i++){
            if(cars[i].owner != msg.sender){
                num++;
            }
        }
        Car[] memory avai_cars = new Car[] (num);
        num = 0;
        for(uint256 i = 0; i < carCount; i++){
            if(cars[i].owner != msg.sender){
                avai_cars[num] = cars[i];
                num++;
            }
        }
        return avai_cars;
    }

    function getBorrowedCars() public view returns (Car[] memory){
        uint256 num = 0;
        for(uint256 i = 0; i < carCount; i++){
            if(cars[i].borrower == msg.sender){
                num++;
            }
        }
        Car[] memory borr_cars = new Car[] (num);
        num = 0;
        for(uint256 i = 0; i < carCount; i++){
            if(cars[i].borrower == msg.sender){
                borr_cars[num] = cars[i];
                num++;
            }
        }
        return borr_cars;
    }

    function getCarOwner(uint256 CarTokenId) public view returns (address) {
        address owner;
        require(CarTokenId < carCount, "invalid car id");
        for(uint256 i = 0; i < carCount; i++){
            if(CarTokenId == i){
                owner = cars[i].owner;
                break;
            }
        }
        return owner;
    }

    function getCarBorrower(uint256 CarTokenId) public view returns (address) {
        address borrower;
        require(CarTokenId < carCount, "invalid car id");
        for(uint256 i = 0; i < carCount; i++){
            if(CarTokenId == i){
                require(cars[i].borrower != address (0), "car not borrowed");
                borrower = cars[i].borrower;
                break;
            }
        }
        return borrower;
    }

    function borrow(uint256 CarTokenId, uint256 duration) public {
        require(CarTokenId < carCount, "invalid car id");
        Car storage now_car = cars[CarTokenId];
        require(now_car.owner != msg.sender, "cannot borrow yours car");
        now_car.borrower = msg.sender;
        uint256 currentTime = block.timestamp;
        now_car.borrowUntil = currentTime + duration;
        maomaoToken.transferFrom(msg.sender, now_car.owner, duration);
        emit CarBorrowed(CarTokenId, now_car.borrower, currentTime, (duration));
    }

    function back(uint256 CarTokenId) public {
        require(CarTokenId < carCount, "invalid car id");
        Car storage now_car = cars[CarTokenId];
        require(now_car.owner != msg.sender, "cannot return yours car");
        require(now_car.borrower == msg.sender, "you not borrow this car or already return");
        now_car.borrower = address (0);
        now_car.borrowUntil = 0;
    }


    function helloworld() pure external returns(string memory) {
        return "hello world";
    }
}