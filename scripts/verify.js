const hre = require("hardhat");
const {ethers} = require("ethers")
require("@nomiclabs/hardhat-etherscan");

async function main() {

    const roulette = await hre.ethers.getContractAt("0x9B2Ebc7dB1F8FcE75Eb87bEB49d136ce563f7933")

  await hre.run("verify:verify",{
    address: roulette.address,
    constructorArguments: [],
  })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  