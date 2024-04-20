const hre = require("hardhat");

async function mineSalt() {

    const alpha = await hre.ethers.zeroPadValue("0x12", 16)
    const ratetoken1 = await hre.ethers.zeroPadValue("0x12", 16)
    const ratetoken2 = await hre.ethers.zeroPadValue("0x12", 16)
    const hexzero = await hre.ethers.zeroPadValue("0x00", 16)

    const maxLpSupplyIncrease = await hre.ethers.zeroPadValue("0x12", 16)
    const maxLpSupplyDecrease = await hre.ethers.zeroPadValue("0x12", 16)

    const capInterval = 12;

    const capReservesParameters = {
        maxRateChanges: [
            [hexzero, ratetoken2],
            [ratetoken1, hexzero],
        ],
        maxLpSupplyIncrease: maxLpSupplyIncrease,
        maxLpSupplyDecrease: maxLpSupplyDecrease
    };
    const MockPumpData = await hre.ethers.getContractFactory("MockPumpDataEncoder");
    const mockPumpData = await MockPumpData.deploy();
    const correctEncoding = await mockPumpData.encodePumpData(alpha, capInterval, capReservesParameters);
    console.log("correct encoding: ", correctEncoding);

    const abiCoder = new hre.ethers.AbiCoder();

    // Encoding complex structs (using positional properties)
    let abiCoderEncoding = abiCoder.encode(
    // alpha, capInterval, capReservesParameters(maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease)
    ['bytes16', 'uint256',"tuple(bytes16[][], bytes16, bytes16)"],
    [
        alpha,
        capInterval,
      [ capReservesParameters.maxRateChanges, capReservesParameters.maxLpSupplyIncrease, capReservesParameters.maxLpSupplyDecrease]
    ]
    );

    console.log("all_packed with abicoder: ", abiCoderEncoding);

    // pack all together with solidityPack
    let solidityPackedEncoding = hre.ethers.solidityPacked(
        ['bytes16', // alpha
         'uint256', // capInterval
         'bytes16[][]', // maxRateChanges
         'bytes16', // maxLpSupplyIncrease 
         'bytes16'], // maxLpSupplyDecrease
        [
         alpha,
         capInterval,
         capReservesParameters.maxRateChanges,
         capReservesParameters.maxLpSupplyIncrease,
         capReservesParameters.maxLpSupplyDecrease
        ]
    ); 

    console.log("all_packed with solidityPacked: ", solidityPackedEncoding);

    // check if either encoding is correct
    // Correct encoding:  ABI CODER
    console.log("Correct encoding: ", correctEncoding === abiCoderEncoding || correctEncoding === solidityPackedEncoding);
}

mineSalt();