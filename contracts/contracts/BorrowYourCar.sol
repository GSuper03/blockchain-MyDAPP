// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract BorrowYourCar is ERC721{

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);

    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information
    mapping(address => uint[]) public owners;
    uint256 public carCount = 0; // A counter to count how many cars are in the contract
    uint256 public MaxCarCount = 500;
    constructor() ERC721("Car NFT", "CAR") {
        //owner = msg.sender;
    }

    function CarNFT(address Car_to_Owner) public{
        require(carCount + 1 < MaxCarCount, "Over Max Car counts!");
        _mint(Car_to_Owner, carCount);
        cars[carCount].owner = Car_to_Owner;
        owners[Car_to_Owner].push(carCount);
        carCount++;
    }

    function getOwnedCars() public view returns (uint256[] memory) {
        uint256[] memory owned_cars = new uint256[] (owners[msg.sender].length);
        for(uint256 i = 0; i < owned_cars.length; i++){
            owned_cars[i] = owners[msg.sender][i];
        }
        return owned_cars;
    }

    function getFreeCars() public view returns (uint256[] memory) {
        uint256 num = 0;
        for(uint256 i = 0; i < carCount; i++){
            if(cars[i].borrower == address (0)){
                num++;
            }
        }
        uint256[] memory avai_cars = new uint256[] (num);
        num = 0;
        for(uint256 i = 0; i < avai_cars.length; i++){
            if(cars[i].borrower == address (0)){
                avai_cars[num] = i;
                num++;
            }
        }
        return avai_cars;
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

    function borrow(uint256 CarTokenId) public {
        require(CarTokenId < carCount, "invalid car id");
        Car storage now_car = cars[CarTokenId];
        require(now_car.borrower != address (0), "car already borrowed");
        now_car.borrower = msg.sender;
        uint256 currentTime = block.timestamp;
        now_car.borrowUntil = currentTime + (3 days);
        emit CarBorrowed(CarTokenId, now_car.borrower, currentTime, (3 days));
    }



    function helloworld() pure external returns(string memory) {
        return "hello world";
    }
}