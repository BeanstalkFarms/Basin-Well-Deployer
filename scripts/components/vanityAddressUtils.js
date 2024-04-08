const fs = require('fs');
var exec = require('child_process').exec;
const inquirer = require('inquirer');

// Generates info for a component vanity address and writes it to a file
async function generateVanityAddress() {

    // ask for pattern
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

module.exports = {
    generateVanityAddress,
    deployAtNonce,
    increaseToNonce,
    increaseNonce
}