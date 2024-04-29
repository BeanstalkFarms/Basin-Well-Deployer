const fs = require('fs');
var exec = require('child_process').exec;
const inquirer = require('inquirer');
const hre = require('hardhat');

// Generates info for a component vanity address and writes it to a file
async function generateVanityAddress() {

    patternQuestion = {
        type: 'input',
        message: 'Enter the pattern you want vanity address to start with:',
        name: 'pattern',
        default: 'BEA'
    }

    const { pattern } = await inquirer.prompt(patternQuestion);

    console.log('\nGenerating a vanity address for you...');
    exec(`vanityeth -n 1 --contract -i ${pattern} -c`, function (error, stdout, stderr) {

        //clean up and write output to file
        stderr = stderr.replace("- generating vanity address 1/1", "");
        stderr = stderr.replace("✔ ", "");
        stderr = stderr.replace("\n", "");
        fs.writeFileSync('data/vanityAddress.json', stderr, 'utf-8');

        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
    console.log('Vanity address generated and saved to data/vanityAddress.json!\n');
}

async function deployAtNonce(name, account, nonce, verbose = false, parameters = []) {
    if (verbose) console.log(`Start Nonce: ${await ethers.provider.getTransactionCount(account.address)}`)
    await increaseToNonce(account, nonce)
    if (verbose) console.log(`Deploying Contract with nonce: ${await ethers.provider.getTransactionCount(account.address)}`)
    return await deploy(name, account, true, parameters)
  }
  
async function increaseToNonce(account, nonce) {
  const currentNonce = await ethers.provider.getTransactionCount(account.address)
  console.log("\nNonce Manipulation Starting...")
  console.log("Current Nonce: " + currentNonce)
  console.log("Target Nonce: " + nonce)
  await increaseNonce(account, nonce-currentNonce-1)
}
  
async function increaseNonce(account, n) {
    for (let i = 0; i < n; i++) {
      console.log("\nIncreasing the account's nonce to: " + (
        await ethers.provider.getTransactionCount(account.address) + 1))
      await account.sendTransaction({
          to: account.address,
          value: hre.ethers.parseEther("0"),
      })
    }
}

async function fundDeploymentAccount(account, mock) {
    if (mock) {
        setSignerBalance(account.address)
    } else {
        const message = 'You will send 0.01 ETH from your account to the vanity address to fund the deployment account. You can recover the funds later by getting the vanity account private key from /data/vanityAddress.json  Do you want to proceed? (y/n)'
        const { proceed } = await inquirer.prompt({ type: 'input', name: 'proceed', message: message, default: "y" });
        if (proceed.toLowerCase() !== "y" && proceed.toLowerCase() !== "yes") {
            console.log('Exiting...');
            process.exit(0);
        }
        const signer = await hre.ethers.provider.getSigner();
        await signer.sendTransaction({
            to: account.address,
            value: hre.ethers.parseEther("0.01"),
        });
    }
}

async function setSignerBalance(signerAddress) {  
  await hre.network.provider.send("hardhat_setBalance", [signerAddress, "0x21E19E0C9BAB2400000"]);
}

module.exports = {
    generateVanityAddress,
    deployAtNonce,
    increaseToNonce,
    increaseNonce,
    fundDeploymentAccount,
}