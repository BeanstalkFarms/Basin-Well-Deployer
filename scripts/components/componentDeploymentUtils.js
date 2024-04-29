const fs = require('fs');
const hre = require('hardhat');
const { increaseToNonce } = require('./vanityAddressUtils');

// Next versions just append the version to the base string after the /wells folder
// eg ./node_modules/@beanstalk/wells1.1/out ...
const BASE_STRING = './node_modules/@beanstalk/wells';

// Fetches the json file for the contract from the basin npm package and returns the contract factory
async function getWellContractFactory(name, account, version) {
    const FINAL_BASE_STRING = BASE_STRING + (version !== "1.0" ? version : '') + '/out';
    const contractJson = JSON.parse(await fs.readFileSync(`${FINAL_BASE_STRING}/${name}.sol/${name}.json`))
    let contractFactory = await hre.ethers.getContractFactory(
        contractJson.abi,
        contractJson.bytecode.object,
        account
    );
    return contractFactory;
    // console.log(await contractFactory.bytecode)
    // return contractFactory.bytecode
}

// Deploys the well contract at a specific nonce
// If the account is not at the nonce, it will increase the nonce to the specified nonce
async function deployWellContractAtNonce(name, arguments = [], account, version, nonce) {
    await increaseToNonce(account, nonce);
    return await deployWellContract(name, arguments, account, version);
}

// Deploys the well contract at the next nonce
async function deployWellContract(name, arguments = [], account, version) {
    const Contract = await getWellContractFactory(name, account, version);
    console.log(`\nFactory for ${name} fetched from npm package`);
    console.log(`\nDeploying ${name} contract...`);
    const contract = await Contract.deploy(...arguments);
    await contract.waitForDeployment();
    console.log(`\nContract deployed at address: ${await contract.getAddress()}`);
    return contract;
}

// Reads the generated vanity address info from the json file and returns the deployment account
async function getDeploymentAccount() {
    const jsonString = await fs.readFileSync('data/vanityAddress.json', 'utf-8');
    const deploymentAccountInfo = JSON.parse(jsonString);
    const deploymentAccount = deploymentAccountInfo.account;
    return new hre.ethers.Wallet(deploymentAccount.privKey, hre.ethers.provider);
}

module.exports = {
    getWellContractFactory,
    deployWellContract,
    deployWellContractAtNonce,
    getDeploymentAccount,
}

