const hre = require("hardhat");

async function testPumpDataEncoding() {
  const alpha = "0x3ffeef368eb04325c526c2246eec3e55";
  const ratetoken1 = "0x3ff7eb851eb851eb851eb851eb851eb8";
  const ratetoken2 = "0x3ff7eb851eb851eb851eb851eb851eb8";
  const hexzero = await hre.ethers.zeroPadValue("0x00", 16);

  const maxLpSupplyIncrease = "0x3ff33a92a305532617c1bda5119ce075";
  const maxLpSupplyDecrease = "0x3ff33a92a305532617c1bda5119ce075";

  const capInterval = 12;

  const capReservesParameters = {
    maxRateChanges: [
      [hexzero, ratetoken2],
      [ratetoken1, hexzero],
    ],
    maxLpSupplyIncrease: maxLpSupplyIncrease,
    maxLpSupplyDecrease: maxLpSupplyDecrease,
  };
  const MockPumpData = await hre.ethers.getContractFactory(
    "MockPumpDataEncoder"
  );
  const mockPumpData = await MockPumpData.deploy();
  const correctEncoding = await mockPumpData.encodePumpData(
    alpha,
    capInterval,
    capReservesParameters
  );
  console.log("correct encoding: ", correctEncoding);

  const abiCoder = new hre.ethers.AbiCoder();

  // Encoding complex structs (using positional properties)
  let abiCoderEncoding = abiCoder.encode(
    // alpha, capInterval, capReservesParameters(maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease)
    ["bytes16", "uint256", "tuple(bytes16[][], bytes16, bytes16)"],
    [
      alpha,
      capInterval,
      [
        capReservesParameters.maxRateChanges,
        capReservesParameters.maxLpSupplyIncrease,
        capReservesParameters.maxLpSupplyDecrease,
      ],
    ]
  );

  console.log("all_packed with abicoder: ", abiCoderEncoding);

  // pack all together with solidityPack
  let solidityPackedEncoding = hre.ethers.solidityPacked(
    [
      "bytes16", // alpha
      "uint256", // capInterval
      "bytes16[][]", // maxRateChanges
      "bytes16", // maxLpSupplyIncrease
      "bytes16",
    ], // maxLpSupplyDecrease
    [
      alpha,
      capInterval,
      capReservesParameters.maxRateChanges,
      capReservesParameters.maxLpSupplyIncrease,
      capReservesParameters.maxLpSupplyDecrease,
    ]
  );

  console.log("all_packed with solidityPacked: ", solidityPackedEncoding);

  // check if either encoding is correct
  // Correct encoding:  ABI CODER
  console.log("ABI CODER IS CORRECT: ", correctEncoding === abiCoderEncoding);
  console.log(
    "SOLIDITY PACKED IS CORRECT: ",
    correctEncoding === solidityPackedEncoding
  );
}

testPumpDataEncoding();
