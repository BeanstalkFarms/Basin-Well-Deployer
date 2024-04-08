const hre = require("hardhat");
const inquirer = require('inquirer');
const { askForConfirmation } = require('../generalUtils')
const { deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');
const { getLatestReleaseVersion } = require('../generalUtils');

async function deployImplementation(vanity, account, nonce) {
    const implementationQuestions = [
        {
            type: 'list',
            choices: ['Standard well implementation'],
            message: 'Select the well implementation you would like to deploy',
            name: 'implementation',
        }
      ]
  
      let { implementation } = await inquirer.prompt(implementationQuestions);
  
      let implementationMap = {
          'Standard well implementation': 'Well',
      }
  
      const implementationVersion = getLatestReleaseVersion();
  
      // map the input to the actual exchange function name json from npm package
      const componentName = implementationMap[implementation];
  
      await setSignerBalance(account.address)
  
      await askForConfirmation(componentName, implementationVersion, account.address, false)

      if (vanity) {
          await deployWellContractAtNonce(componentName, [], account, implementationVersion, nonce);
      } else {
          await deployWellContract(componentName, [], account, implementationVersion);
      } 
  }   
  
module.exports = {
    deployImplementation
}