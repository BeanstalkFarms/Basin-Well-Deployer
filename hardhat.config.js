require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

// Replace this private key with your Sepolia account private key
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_SEPOLIA_KEY = process.env.ALCHEMY_SEPOLIA_KEY;
const ALCHEMY_MAINNET_KEY = process.env.ALCHEMY_MAINNET_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_KEY,
      accounts: [PRIVATE_KEY]
    },
    mainnet: {
      url: ALCHEMY_MAINNET_KEY,
      accounts: [PRIVATE_KEY]
    },
    localhost: {
      chainId: 1337
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  

  
};
