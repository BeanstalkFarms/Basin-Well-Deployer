const hre = require("hardhat");
const inquirer = require('inquirer');
const { askForConfirmation } = require('../generalUtils')
const { deployWellContract, deployWellContractAtNonce } = require('./componentDeploymentUtils');
const { getLatestReleaseVersion } = require('../generalUtils');

async function deployExchangeFunction(vanity, account, nonce) {

    const exchangeFunctionQuestions = [
        {
            type: 'list',
            choices: ['ConstantProduct2'],
            message: 'Select the exchange function you would like to deploy',
            name: 'exchangeFunction',
        }
    ]

    let { exchangeFunction } = await inquirer.prompt(exchangeFunctionQuestions);

    // map the exchange function to the actual json contract name
    let exchangeFunctionMap = {
        'ConstantProduct2': 'ConstantProduct2',
    }

    const exchangeFunctionVersion = getLatestReleaseVersion();

    // map the input to the actual exchange function name json from npm package
    const componentName = exchangeFunctionMap[exchangeFunction];

    await askForConfirmation(componentName, exchangeFunctionVersion, account.address, false)

    if (vanity) {
        await deployWellContractAtNonce(componentName, [], account, exchangeFunctionVersion, nonce);
    } else {
        await deployWellContract(componentName, [], account, exchangeFunctionVersion);
    }   

}

module.exports = {
    deployExchangeFunction
}