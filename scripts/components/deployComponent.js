const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
var exec = require('child_process').exec;



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
            choices: ['Exchange', 'Pump', 'Implementation'],
            message: 'Select the component type you would like to deploy',
            name: 'componentType',
        },
        {
          type: 'confirm',
          message: 'Do you want to deploy at a vanity address?',
          name: 'vanity',
          default: true,
        }]

    // if vanity , excecute the vanity address generation script


    const { network, componentType, vanity } = await inquirer.prompt(componentQuestions);

    if (vanity) {

        exec('ls', function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                 console.log('exec error: ' + error);
            }
        });
    }

    // Promp user for the component type --> exchange, pump, or implementation

    // Prompt user for the component parameters

    // Deploy the component

    // research what parameters each component needs

    // FOR BEAN:WSTETH need to  deploy new pump, deploy new constant product 2 well function

}








main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });