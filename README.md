# Basin-Well-Deployer
A CLI tool to set up and deploy composable liquidity pools on the Basin DEX. 

## Getting Started

Follow these steps to get started with this project:

1. **Clone this repository and cd into it:**
   ```sh
   git clone https://github.com/BeanstalkFarms/Basin-Well-Deployer.git && cd Basin-Well-Deployer
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Add your ```PRIVATE_KEY``` and ```ALCHEMY_RPC_URLS``` to the ```hardhat.config.js``` file** 
- To export your private key from Metamask, open Metamask and go to Account Details > Export Private Key. 

- You can find detailed guides on how to export your key [here](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key).

- Beware: NEVER share your private key with anyone and dont commit it to a public repository.

- To get an Alchemy RPC URL, sign up for an account at [Alchemy](https://www.alchemy.com/) and create a new project. Select the Ethereum network you want to deploy to and copy the https URL.


4. **Run the CLI script:**
   ```sh
   npx hardhat run scripts/deployWell.js --network <network>
   ```
- Replace ```<network>``` with the network you want to deploy to. Options are ```mainnet``` and ```sepolia```.

- The script will then guide you through the process of deploying a new well. 