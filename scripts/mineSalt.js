const hre = require("hardhat");
const fs = require("fs");

async function mineSalt() {
    const saltCheckerFactory = await hre.ethers.getContractFactory("Salt");
    const attemptsPerRun = 100;
    const saltChecker = await saltCheckerFactory.deploy(attemptsPerRun);
    for (let i = 0; i < 10; i++) {
        console.time(`Iteration ${i}`);
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
        console.timeEnd(`Iteration ${i}`);
    }
}

mineSalt();