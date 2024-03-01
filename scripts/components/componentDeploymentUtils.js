const BASE_STRING = './node_modules/@beanstalk/wells/out';
const fs = require('fs');
const hre = require('hardhat');
const { setUpDeploymentAccountsNonce } = require('./nonces');

// Fetches the json file for the contract from the basin npm package and returns the contract factory
async function getWellContractFactory(name, account = undefined) {
    const contractJson = JSON.parse(await fs.readFileSync(`${BASE_STRING}/${name}.sol/${name}.json`))
    return await hre.ethers.getContractFactory(
        contractJson.abi,
        contractJson.bytecode.object,
        (account == undefined) ? await getWellDeployer() : account
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

