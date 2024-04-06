const hre = require("hardhat");

async function deployAtNonce(name, account, nonce, verbose = false, parameters = []) {
    if (verbose) console.log(`Start Nonce: ${await ethers.provider.getTransactionCount(account.address)}`)
    await increaseToNonce(account, nonce)
    if (verbose) console.log(`Deploying Contract with nonce: ${await ethers.provider.getTransactionCount(account.address)}`)
    return await deploy(name, account, true, parameters)
  }
  
  async function increaseToNonce(account, nonce) {
    const currentNonce = await ethers.provider.getTransactionCount(account.address)
    await increaseNonce(account, nonce-currentNonce-1)
  }
  
  async function increaseNonce(account, n = 1) {
      for (let i = 0; i < n; i++) {
        await account.sendTransaction({
            to: account.address,
            value: ethers.utils.parseEther("0"),
        })
      }
  }
  

module.exports = {
    deployAtNonce,
    increaseToNonce,
    increaseNonce
}
