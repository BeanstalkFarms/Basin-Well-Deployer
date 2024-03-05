const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { handleVanityAddress } = require('./vanityAddressUtils');
const { getWellContractFactory, getDeploymentAccount } = require('./componentDeploymentUtils');
const { handleExchangeFunctionInput, handlePumpInput, handleWellImplementationInput } = require('./componentInput');



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
            choices: ['Exchange Function', 'Pump', 'Well Implementation'],
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
    if (vanity) {
        await handleVanityAddress();
    }

    // if vanity, get the deployment account from the vanity address, else get the signer from the hardhat config
    const deploymentAccount = (vanity) ? getDeploymentAccount() : hre.ethers.getSigner()

    /////////////////////////////// COMPONENTS INPUT ///////////////////////////////

    // ask for type of component , version of component and parameters specific to that component
    // For exchange function --> stableswap , constant product2
    // for pump --> multiflow pump with additional parameters based on version
    // for well implementation --> standard well implementation

    let componentName = '';
    if (componentType === 'Exchange Function') {
        componentName = await handleExchangeFunctionInput();
    } else if (componentType === 'Pump') {
        componentName = await handlePumpInput();
    } else if (componentType === 'Well Implementation') {
        componentName = await handleWellImplementationInput();
    }
    console.log("\nComponent name is: ", componentName);

    // Promp user for the component type --> exchange, pump, or implementation --> done --> handle version and get factory

    // Get the factory for the component
                                                // name,     account
    componentFactory = getWellContractFactory(componentName, deploymentAccount);

    console.log("\nFactory is formed from npm package for the component: ", componentName);

    // Prompt user for the component parameters

    // Deploy the component

    // research what parameters each component needs

    // FOR BEAN:WSTETH need to  deploy new pump, deploy new constant product 2 well function

}








main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });