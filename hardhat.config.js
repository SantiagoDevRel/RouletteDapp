require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config()

const {API_URL, PRIVATE_KEY, api_Key} = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "goerli",
  paths:{
    artifacts: "./src/artifacts",
  },
  networks: {
    hardhat:{
      chainId: 1337,
    },
    goerli: {
      url: `${API_URL}`,
      accounts: [`0x${PRIVATE_KEY}`]
    
    },
  },
  etherscan:{
    apiKey: `${api_Key}`,
  },
  solidity: "0.8.9",
};
