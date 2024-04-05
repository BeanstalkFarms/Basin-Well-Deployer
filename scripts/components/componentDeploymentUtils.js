const fs = require('fs');
const hre = require('hardhat');

// Next versions just apeend the version to the base string after the /wells folder
// eg ./node_modules/@beanstalk/wells1.1/out ...
const BASE_STRING = './node_modules/@beanstalk/wells';

// Fetches the json file for the contract from the basin npm package and returns the contract factory
async function getWellContractFactory(name, account, version) {
    const FINAL_BASE_STRING = BASE_STRING + (version !== "1.0" ? version : '') + '/out';
    console.log(FINAL_BASE_STRING)
    const contractJson = JSON.parse(await fs.readFileSync(`${FINAL_BASE_STRING}/${name}.sol/${name}.json`))
    return await hre.ethers.getContractFactory(
        contractJson.abi,
        contractJson.bytecode.object,
        account
    );
}

// Deploys the well contract at a specific nonce
// If the account is not at the nonce, it will increase the nonce to the specified nonce
async function deployWellContractAtNonce(name, nonce, arguments = [], account = undefined, verbose = false) {
    await increaseToNonce(account, nonce)
    return await deployWellContract(name, arguments, account, verbose)
}

// Deploys the well contract at the next nonce
async function deployWellContract(name, arguments = [], account = undefined, verbose = false) {
    const Contract = await getWellContractFactory(name, account);
    const contract = await Contract.deploy(...arguments);
    await contract.deployed();
    if (verbose) console.log(`${name} deployed at ${contract.address}`)
    return contract;
}

// reads the generated vanity address info from the json file and returns the deployment account
async function getDeploymentAccount() {
    // read the vanity_address.json file
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

