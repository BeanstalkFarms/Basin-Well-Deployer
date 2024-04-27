# Basin-Well-Deployer
A CLI tool to set up and deploy composable liquidity pools on the Basin DEX. 

```bash

  ██╗    ██╗███████╗██╗     ██╗         ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗
  ██║    ██║██╔════╝██║     ██║         ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝
  ██║ █╗ ██║█████╗  ██║     ██║         ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ 
  ██║███╗██║██╔══╝  ██║     ██║         ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  
  ╚███╔███╔╝███████╗███████╗███████╗    ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   
   ╚══╝╚══╝ ╚══════╝╚══════╝╚══════╝    ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝  
```

## Getting Started

Follow these steps and open a terminal (cmd on windows) to get started with this project:

1. **Install Node.js and npm:**
   - First check if you have Node.js and npm installed by running:
     ```sh
     node --version
     npm --version
     ```
   - If you see version numbers, you're good to go!
   - If you don't, you can download Node.js and npm for Windows and MacOS from [here](https://nodejs.org/en/download/).
   - And for Linux distributions, you can follow the instructions [here](https://nodejs.org/en/download/package-manager).

2. **Clone this repository and cd into it:**
   ```sh
   git clone https://github.com/BeanstalkFarms/Basin-Well-Deployer.git && cd Basin-Well-Deployer
   ```

3. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Create a ```.env``` file and add your ```PRIVATE_KEY``` and ```ALCHEMY_RPC_URL``` as shown in the ```.env.example```.**
- To export your private key from Metamask, open Metamask and go to Account Details > Export Private Key. 

- You can find detailed guides on how to export your key [here](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key).

- Beware: NEVER share your private key with anyone and dont commit it to a public repository.

- To get an Alchemy RPC URL, sign up for an account at [Alchemy](https://www.alchemy.com/) and create a new project. Select the Ethereum network you want to deploy to and copy the https URL.

## Deploying a Well
- To deploy a well with existing deployed components, run the following command:
   ```sh
   npx hardhat run scripts/deployWell.js --network <network>
   ```
- Replace ```<network>``` with the network you want to deploy to. Options are ```mainnet``` and ```sepolia```.

- The script will then guide you through the process of deploying a new well. 

## Deploying a Component
- To deploy a new component, run the following command:
   ```sh
   npx hardhat run scripts/deployComponent.js --network <network>
   ```
- Replace ```<network>``` with the network you want to deploy to. Options are ```mainnet``` and ```sepolia```.

- To integrate your new component into the well, you will need to grab the address of the deployed component and add it as input to the deployWell script.