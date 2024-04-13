const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { askForConfirmation } = require('../generalUtils')
const { deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');
const { findParametersByVersionInRegistryJson, getLatestReleaseVersion } = require('../generalUtils');

async function deployPump(vanity, account, nonce) {

    const pumpQuestions = [
      {
          type: 'list',
          choices: ['Multiflow Pump'],
          message: 'Select the exchange function you would like to deploy',
          name: 'pump',
      }
    ]

    let { pump } = await inquirer.prompt(pumpQuestions);

    let pumpMap = {
        'Multiflow Pump': 'MultiFlowPump',
    }

    const pumpVersion = getLatestReleaseVersion();

    // map the input to the actual exchange function name json from npm package
    const componentName = pumpMap[pump];

    ///////////////////////// PUMP PARAMETERS /////////////////////////

    const pumpRegistry = fs.readFileSync('./data/pumpRegistry.json');
    const pumpJson = JSON.parse(pumpRegistry);

    const pumpParamsQuestions = findParametersByVersionInRegistryJson(pumpVersion, pumpJson);

    const pumpParameters = await inquirer.prompt(pumpParamsQuestions);

    // convert the parameters dictionary to an array
    let pumpParamsArray = [];
    for (const key in pumpParameters) {
        pumpParamsArray.push(pumpParameters[key]);
    }

    await setSignerBalance(account.address)

    await askForConfirmation(componentName, pumpVersion, account.address, false)

    if (vanity) {
        await deployWellContractAtNonce(componentName, pumpParamsArray, account, pumpVersion, nonce);
    } else {
        await deployWellContract(componentName, pumpParamsArray, account, pumpVersion);
    }
}   

module.exports = {
    deployPump
}