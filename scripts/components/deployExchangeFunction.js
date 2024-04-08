const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { askForConfirmation } = require('../generalUtils')
const { getWellContractFactory, getDeploymentAccount, deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');


async function deployExchangeFunction(vanity, account, nonce) {

    const exchangeFunctionQuestions = [
        {
            type: 'list',
            choices: ['ConstantProduct2'],
            message: 'Select the exchange function you would like to deploy',
            name: 'exchangeFunction',
        },
        {
            type: 'list',
            choices: ['v1.0', 'v1.1'],
            message: 'Select the version of the function you would like to deploy',
            name: 'exchangeFunctionVersion',
        }
    ]

    let { exchangeFunction, exchangeFunctionVersion } = await inquirer.prompt(exchangeFunctionQuestions);

    // map the exchange function to the actual json contract name
    let exchangeFunctionMap = {
        'ConstantProduct2': 'ConstantProduct2',
    }

    // clean the "v" from the version
    exchangeFunctionVersion = exchangeFunctionVersion.replace('v', '');

    // map the input to the actual exchange function name json from npm package
    const componentName = exchangeFunctionMap[exchangeFunction];

    await setSignerBalance(account.address)

    await askForConfirmation(componentName, exchangeFunctionVersion, nonce, account.address, false)

    if (vanity) {
        await deployWellContractAtNonce(componentName, [], account, exchangeFunctionVersion, nonce);
    } else {
        await deployWellContract(componentName, [], account, exchangeFunctionVersion);
    }   

}

async function setSignerBalance(signerAddress) {  
      await hre.network.provider.send("hardhat_setBalance", [signerAddress, "0x21E19E0C9BAB2400000"]);
}

module.exports = {
    deployExchangeFunction
}