const hre = require("hardhat");
const fs = require("fs");

async function mineSalt() {
  const saltCheckerFactory = await hre.ethers.getContractFactory("Salt");
  const attemptsPerRun = 1_000;
  const saltChecker = await saltCheckerFactory.deploy(attemptsPerRun);
  for (let i = 0; i < 100_000; i++) {
    console.log(
      `Iteration: ${i * attemptsPerRun} through ${(i + 1) * attemptsPerRun}`
    );
    const start = i * attemptsPerRun + 3_000_000;
    const result = await saltChecker.checkForAddress(start, {
      gasLimit: 5000000000,
    });
    if (result[0] !== hre.ethers.ZeroAddress) {
      console.log(`Predicted Well address: ${result[0]}`);
      console.log(`Prefix: ${result[1]}`);
      console.log(`Salt: ${result[2]}`);
      // write to file
      fs.writeFileSync(
        `./data/well.txt`,
        `Found Well address: ${result[0]}\nPrefix: ${result[1]}\nSalt: ${result[2]}`
      );
      break;
    }
    console.log(`Iteration ${i}`);
  }
}

// async function getPumpV1_1Data() {
//   const MockPumpDataEncoderFactory = await hre.ethers.getContractFactory(
//     "MockPumpDataEncoder"
//   );
//   const MockPumpDataEncoder = await MockPumpDataEncoderFactory.deploy();

//   console.log(await MockPumpDataEncoder.from18(1000000000000000)); // 1e15 -> 0.001
//   console.log("0.75%", await MockPumpDataEncoder.from18(7500000000000000)); // 0.75e15 -> 0.0075
//   // 0x3ff7eb851eb851eb851eb851eb851eb8
//   // 0x3ff33a92a305532617c1bda5119ce075
//   console.log("3%", await MockPumpDataEncoder.from18(300000000000000)); // 3e15 -> 0.03
// }

// getPumpV1_1Data();
mineSalt();
