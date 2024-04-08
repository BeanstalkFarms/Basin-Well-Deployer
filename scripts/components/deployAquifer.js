const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { askForConfirmation } = require('../generalUtils')
const { getWellContractFactory, getDeploymentAccount, deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');
const { findParametersByVersionInRegistryJson } = require('../generalUtils');

async function deployAquifer(vanity, account, nonce) {
  const implementationQuestions = [
    {
        type: 'list',
        choices: ['Standard Aquifer'],
        message: 'Select the aquifer you would like to deploy',
        name: 'aquifer',
    },
    {
        type: 'list',
        choices: ['v1.0', 'v1.1'],
        message: 'Select the version of the implementation you would like to deploy',
        name: 'aquiferVersion',
    }
  ] 
  let { aquifer, aquiferVersion } = await inquirer.prompt(implementationQuestions); 

  let aquiferMap = {
      'Standard Aquifer': 'Aquifer',
  } 

  // clean the "v" from the version
  aquiferVersion = aquiferVersion.replace('v', ''); 

  // map the input to the actual exchange function name json from npm package
  const componentName = aquiferMap[aquifer];  

  await setSignerBalance(account.address) 

  await askForConfirmation(componentName, aquiferVersion, nonce, account.address, false) 

  if (vanity) {
      await deployWellContractAtNonce(componentName, [], account, aquiferVersion, nonce);
  } else {
      await deployWellContract(componentName, [], account, aquiferVersion);
  } 
}

async function setSignerBalance(signerAddress) {  
  await hre.network.provider.send("hardhat_setBalance", [signerAddress, "0x21E19E0C9BAB2400000"]);
}

module.exports = {
    deployAquifer
}