
const hre = require("hardhat");
const {ethers} = require("ethers")
require("@nomiclabs/hardhat-etherscan");

async function wait(miliseconds){
  return new Promise((resolve)=>{
    setTimeout(()=>resolve(),miliseconds*1000)
  })
}
async function main() {
  const initialAmount = ethers.utils.parseEther("0.005");
  
  const Roulette = await hre.ethers.getContractFactory("Roulette")
  const roulette = await Roulette.deploy({value: initialAmount});
  await roulette.deployed()

  console.log("Roulette deployed to: ",roulette.address);

  await wait(50);

  await hre.run("verify:verify",{
    address: roulette.address,
    constructorArguments: [],
  })


}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
