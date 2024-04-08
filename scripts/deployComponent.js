const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { generateVanityAddress } = require('./components/vanityAddressUtils');
const { getDeploymentAccount } = require('./components/componentDeploymentUtils');
const { deployExchangeFunction } = require('./components/deployExchangeFunction')
const { deployPump } = require('./components/deployPump');
const { deployImplementation } = require('./components/deployImplementation');
const { deployAquifer } = require('./components/deployAquifer');

async function main() {
    const asciiArt = ` 
  
██████╗ ██████╗ ███╗   ███╗██████╗  ██████╗ ███╗   ██╗███████╗███╗   ██╗████████╗    ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗    
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗████╗  ██║██╔════╝████╗  ██║╚══██╔══╝    ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝    
██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║██╔██╗ ██║█████╗  ██╔██╗ ██║   ██║       ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝     
██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██║╚██╗██║██╔══╝  ██║╚██╗██║   ██║       ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝      
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝██║ ╚████║███████╗██║ ╚████║   ██║       ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║       
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝
 `; 

    console.log(asciiArt);

    console.log('Welcome to the Basin Component deployment script!');
    console.log('This script will guide you through the deployment of a new Component on Basin DEX.');
    console.log("In Basin, you can deploy and compose exchange functions, network-native oracles (pumps) and exchange implementations into a single liquidity pool known as a Well\n")
    console.log('More information can be found at: https://docs.basin.exchange/ \n');

    /////////////////////////////// COMPONENTS INPUT ///////////////////////////////
    const componentQuestions = [
        {
          type: 'list',
          choices: ['Mainnet', 'Sepolia'],
          message: 'Select the network you would like to deploy the component to',
          name: 'network',
        },
        {
            type: 'list',
            choices: ['Exchange Function', 'Pump', 'Well Implementation', 'Aquifer'],
            message: 'Select the component type you would like to deploy',
            name: 'componentType',
        },
        {
          type: 'confirm',
          message: 'Do you want to deploy at a vanity address?',
          name: 'vanity',
          default: true,
        }]

    const { network, componentType, vanity } = await inquirer.prompt(componentQuestions);
    
    // if vanity , excecute the vanity address generation script
    if (vanity) { await generateVanityAddress(); }

    // if vanity, get the deployment account from the vanity address, else get the signer from the hardhat config
    const deploymentAccount = (vanity) ? await getDeploymentAccount() : await hre.ethers.provider.getSigner();

    /////////////////////////////// COMPONENT HANDLING ///////////////////////////////

    if (componentType === 'Exchange Function') {
        await deployExchangeFunction(vanity, deploymentAccount, 3);
    } else if (componentType === 'Pump') {
        await deployPump(vanity, deploymentAccount, 3);
    } else if (componentType === 'Well Implementation') {
        await deployImplementation(vanity, deploymentAccount, 3);
    } else if (componentType === 'Aquifer') {
        await deployAquifer(vanity, deploymentAccount, 3);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });