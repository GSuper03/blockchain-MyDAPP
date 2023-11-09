import { ethers } from "hardhat";

async function main() {

  const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  const borrowYourCar = await BorrowYourCar.deploy("BorrowYourCar", "BYCAR");
  await borrowYourCar.deployed();

  await borrowYourCar.CarNFT("0xf2A3818564973Ca9F128f8d892905f4cBf06555C");
  await borrowYourCar.CarNFT("0xf2A3818564973Ca9F128f8d892905f4cBf06555C");
  await borrowYourCar.CarNFT("0x9d379E4164ECa3163BA43E5C6da97eAb4084AC6f");

  console.log(`BorrowYourCar deployed to ${borrowYourCar.address}`);

  const maomaotoken = await borrowYourCar.maomaoToken();
  console.log(`MaoMaoToken deployed to ${maomaotoken}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});