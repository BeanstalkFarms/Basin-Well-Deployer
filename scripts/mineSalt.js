const hre = require("hardhat");
const inquirer = require('inquirer');

async function mineSalt() {
    for (let i = 0; i < 10; i++) {
        console.log(`Iteration: ${i * 5_000} through ${(i+1) * 5_000}`);
        const saltCheckerFactory = await hre.ethers.getContractFactory("Salt");
        const saltChecker = await saltCheckerFactory.deploy();
        const start = i * 5_000;
        const result = await saltChecker.checkForAddress(start, { gasLimit: 5000000000 });
        console.log(result);
    }
}

mineSalt();