const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const { handleVanityAddress } = require('./vanityAddressUtils');
const { getWellContractFactory, getDeploymentAccount, deployWellContract } = require('./componentDeploymentUtils');


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
            choices: ['v1.0', 'v1.1'],
            message: 'Select the version of the function you would like to deploy',
            name: 'exchangeFunctionVersion',
        }
    ]

    let { exchangeFunction, exchangeFunctionVersion } = await inquirer.prompt(exchangeFunctionQuestions);

    let exchangeFunctionMap = {
        'ConstantProduct2': 'ConstantProduct2',
    }

    // clean the "v" from the version
    exchangeFunctionVersion = exchangeFunctionVersion.replace('v', '');

    // map the input to the actual exchange function name json from npm package
    const componentName = exchangeFunctionMap[exchangeFunction];

    console.log(`Deploying ${componentName} version ${exchangeFunctionVersion}...`)

    const vanity = false;

    // if vanity, get the deployment account from the vanity address, else get the signer from the hardhat config
    const deploymentAccount = (vanity) ? await getDeploymentAccount() : await hre.ethers.provider.getSigner();

                             // name,   arguments, account, version
    await deployWellContract(componentName, [], deploymentAccount, exchangeFunctionVersion);

}



deployFunction().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });