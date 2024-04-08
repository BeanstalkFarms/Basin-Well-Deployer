const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { askForConfirmation } = require('../generalUtils')
const { getWellContractFactory, getDeploymentAccount, deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');
const { findParametersByVersionInRegistryJson } = require('../generalUtils');

async function deployImplementation(vanity, account, nonce) {
    const implementationQuestions = [
        {
            type: 'list',
            choices: ['Standard well implementation'],
            message: 'Select the well implementation you would like to deploy',
            name: 'implementation',
        },
        {
            type: 'list',
            choices: ['v1.0', 'v1.1'],
            message: 'Select the version of the implementation you would like to deploy',
            name: 'implementationVersion',
        }
      ]
  
      let { implementation, implementationVersion } = await inquirer.prompt(implementationQuestions);
  
      let implementationMap = {
          'Standard well implementation': 'Well',
      }
  
      // clean the "v" from the version
      implementationVersion = implementationVersion.replace('v', '');
  
      // map the input to the actual exchange function name json from npm package
      const componentName = implementationMap[implementation];
  
      await setSignerBalance(account.address)
  
      await askForConfirmation(componentName, implementationVersion, nonce, account.address, false)

      if (vanity) {
          await deployWellContractAtNonce(componentName, [], account, implementationVersion, nonce);
      } else {
          await deployWellContract(componentName, [], account, implementationVersion);
      } 
  }   
  
module.exports = {
    deployImplementation
}