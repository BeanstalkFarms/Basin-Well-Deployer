const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { askForConfirmation } = require('../generalUtils')
const { getWellContractFactory, getDeploymentAccount, deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');
const { getLatestReleaseVersion } = require('../generalUtils');

async function deployAquifer(vanity, account, nonce) {
  const implementationQuestions = [
    {
        type: 'list',
        choices: ['Standard Aquifer'],
        message: 'Select the aquifer you would like to deploy',
        name: 'aquifer',
    }
  ] 
  let { aquifer } = await inquirer.prompt(implementationQuestions); 

  let aquiferMap = {
      'Standard Aquifer': 'Aquifer',
  }

  const aquiferVersion = getLatestReleaseVersion();

  // map the input to the actual exchange function name json from npm package
  const componentName = aquiferMap[aquifer];

  await askForConfirmation(componentName, aquiferVersion, account.address, false) 

  if (vanity) {
      await deployWellContractAtNonce(componentName, [], account, aquiferVersion, nonce);
  } else {
      await deployWellContract(componentName, [], account, aquiferVersion);
  }
}

module.exports = {
    deployAquifer
}