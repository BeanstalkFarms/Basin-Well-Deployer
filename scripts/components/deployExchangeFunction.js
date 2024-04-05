const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { handleVanityAddress } = require('./vanityAddressUtils');
const { getWellContractFactory, getDeploymentAccount } = require('./componentDeploymentUtils');


async function deployFunction() {

    const exchangeFunctionQuestions = [
        {
            type: 'list',
            choices: ['ConstantProduct2'],
            message: 'Select the exchange function you would like to deploy',
            name: 'exchangeFunction',
        },
        {
            type: 'list',
            choices: ['1.0', '1.1'],
            message: 'Select the version of the function you would like to deploy',
            name: 'exchangeFunctionVersion',
        }
    ]

    const { exchangeFunction, exchangeFunctionVersion } = await inquirer.prompt(exchangeFunctionQuestions);

    // map the input to the actual exchange function name json from npm package
    let exchangeFunctionMap = {
        'ConstantProduct2': 'ConstantProduct2',
    }

    const componentName = exchangeFunctionMap[exchangeFunction];

    const vanity = true;

    // if vanity, get the deployment account from the vanity address, else get the signer from the hardhat config
    const deploymentAccount = (vanity) ? getDeploymentAccount() : hre.ethers.getSigner()

    // Get the factory for the component
                                                    // name,       account
    componentFactory = await getWellContractFactory(componentName, deploymentAccount, exchangeFunctionVersion);

    console.log(`Factory for ${componentName} version ${exchangeFunctionVersion} obtained`);

}



deployFunction().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });