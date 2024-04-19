const hre = require("hardhat");

async function encodePumpData() {

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

    const abiCoder = new hre.ethers.AbiCoder();

    // Encoding complex structs (using positional properties)
    const all_packed = abiCoder.encode(
    // alpha, capInterval, capReservesParameters(maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease)
    ['bytes16', 'uint256',"tuple(bytes16[][], bytes16, bytes16)"],
    [
        alpha,
        capInterval,
      [ capReservesParameters.maxRateChanges, capReservesParameters.maxLpSupplyIncrease, capReservesParameters.maxLpSupplyDecrease]
    ]
    );

    console.log("all_packed: ", all_packed);
}


encodePumpData()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});
