const hre = require("hardhat");
const fs = require("fs");
const inquirer = require('inquirer');

const miningQs = [
    {
        type: 'input',
        name: 'wellDeployerAddress',
        message: 'Input the address tht is deploying the well',
    },
    {
        type: 'input',
        name: 'immutableData',
        message: 'Input the immutable data, encoded from the deployWell.js script',
    },
    {
        type: 'input',
        name: 'targetPrefix',
        message: 'Input the prefix of the well address you want to mine for',
    }
]

async function mineSalt() {
    const attemptsPerRun = 1_000;
    let { wellDeployerAddress, immutableData, targetPrefix } = await inquirer.prompt(miningQs);

    // the number of characters in the prefix
    const numberOfChars = targetPrefix.length;
    const saltCheckerFactory = await hre.ethers.getContractFactory("MineSalt");
    const saltChecker = await saltCheckerFactory.deploy(attemptsPerRun, wellDeployerAddress,
                                                 immutableData, targetPrefix, numberOfChars);
    for (let i = 0; i < 10_000; i++) {
        console.log(`Iteration: ${i * attemptsPerRun} through ${(i+1) * attemptsPerRun}`);
        const start = i * attemptsPerRun
        const result = await saltChecker.checkForAddress(start, { gasLimit: 5000000000 });
        if (result[0] !== hre.ethers.ZeroAddress) {
            console.log(`Predicted Well address: ${result[0]}`);
            console.log(`Prefix: ${result[1]}`);
            console.log(`Salt: ${result[2]}`);
            // write to file
            fs.writeFileSync(`./data/well.txt`, `Found Well address: ${result[0]}\nPrefix: ${result[1]}\nSalt: ${result[2]}`);
            break;
        }
    }
}

mineSalt();