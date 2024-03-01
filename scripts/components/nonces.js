const hre = require("hardhat");
const fs = require('fs');


// Reads the vanity_info.json file and increments the nonce of the accounts to the wanted nonce
async function setUpDeploymentAccountsNonce() {

    // Read the JSON file containing vanity addresses information
    const jsonString = await fs.readFileSync('data/vanity_info.json', 'utf-8');
    const targetAddressesInfo = JSON.parse(jsonString);

    // Increment the nonce for each vanity address
    for (let i = 0; i < targetAddressesInfo.length; i++) {
        const targetAddressInfo = targetAddressesInfo[i];
        const targetAddress = targetAddressInfo.address.toString();
        const contracts = targetAddressInfo.contracts;
        const targetNonce = getContractNonce(contracts);
        const targetPrivateKey = targetAddressInfo.private.toString();
        console.log("-----------------------------------------------------------------")
        console.log(`Incrementing nonce for ${targetAddress} to ${targetNonce}...`);
        await incrementAccountToWantedNonce(targetAddress, targetNonce, targetPrivateKey);
    }
}

// Extracts the nonce from the contracts json object
function getContractNonce(contracts) {
    for (const contractNumber in contracts) {
        targetNonce = contractNumber;
        return targetNonce;
    }
}

// Increments the nonce of the account to the wanted nonce
async function incrementAccountToWantedNonce(wantedNonce, privateKey) {
    // Obtain the signer account
    const signer = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  
    let currentNonce = await hre.ethers.provider.getTransactionCount(signer.address);

    wantedNonce = currentNonce + 5;

    console.log(`Current nonce for ${signer.address}: ${currentNonce}`);
    console.log(`Wanted nonce for ${signer.address}: ${wantedNonce}`);

    while (currentNonce < wantedNonce) {
        console.log(`Incrementing nonce to ${currentNonce + 1}...`);
        await sendZeroValueTx(signer, currentNonce);
        currentNonce++;
    }

    console.log(`Nonce for ${signer.address} is now ${currentNonce}`);
}

// Sends a zero-value transaction to increment the nonce
async function sendZeroValueTx(signer, nonce) {
    const tx = await signer.sendTransaction({
        to: signer.address, // Send to itself
        value: 0, // Zero value transaction
        nonce: nonce, // Use the current nonce
    });

    // Wait for the transaction to be mined
    await tx.wait();
}


setUpDeploymentAccountsNonce().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


module.exports = { setUpDeploymentAccountsNonce };
  