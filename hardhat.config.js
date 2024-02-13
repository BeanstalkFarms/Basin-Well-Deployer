require("@nomicfoundation/hardhat-toolbox");


// Replace this private key with your Sepolia account private key
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const PRIVATE_KEY = "<YOUR_PK>";
const ALCHEMY_SEPOLIA_KEY = "<YOUR_ALCHEMY_KEY>";
const ALCHEMY_MAINNET_KEY = "<YOUR_ALCHEMY_KEY>";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_KEY,
      accounts: [PRIVATE_KEY]
    },
    mainnet: {
      url: ALCHEMY_MAINNET_KEY,
      accounts: [PRIVATE_KEY]
    }
  },

  
};
