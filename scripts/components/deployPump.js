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

    console.log(pumpParameters);

    // convert the parameters dictionary to an array
    let pumpParamsArray = [];
    for (const key in pumpParameters) {
        pumpParamsArray.push(pumpParameters[key]);
    }

    // manually set the parameters for the pump until we convert them to their appropriate format
    //                  MAX_PERCENT_INCREASE,                 MAX_PERCENT_DECREASE,            CAP_INTERVAL,  ALPHA
    pumpParamsArray = ['0x3ff50624dd2f1a9fbe76c8b439581062','0x3ff505e1d27a3ee9bffd7f3dd1a32671', 12, '0x3ffeef368eb04325c526c2246eec3e55']

    console.log('\nParameters for the pump:');
    console.log(pumpParamsArray);

    await setSignerBalance(account.address)

    await askForConfirmation(componentName, pumpVersion, account.address, false)

    if (vanity) {
        await deployWellContractAtNonce(componentName, pumpParamsArray, account, pumpVersion, nonce);
    } else {
        await deployWellContract(componentName, pumpParamsArray, account, pumpVersion);
    } 
}   

async function setSignerBalance(signerAddress) {  
    await hre.network.provider.send("hardhat_setBalance", [signerAddress, "0x21E19E0C9BAB2400000"]);
}

module.exports = {
    deployPump
}