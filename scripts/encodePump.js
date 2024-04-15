const hre = require("hardhat");

async function encodePumpData(alpha, capInterval, capReservesParameters) {
    console.log("Alpha: ", alpha);
    console.log("CapInterval: ", capInterval);

    // pack all together with solidityPack
    const packed = hre.ethers.solidityPacked(
        ['bytes16', 'uint256', 'bytes16[][]', 'bytes16', 'bytes16'],
        [alpha, capInterval, crp.maxRateChanges, crp.maxLpSupplyIncrease, crp.maxLpSupplyDecrease]
    );

    console.log("Packed: ", packed);
    return packed;
}

async function main() {

    // struct CapReservesParameters {
    //     bytes16[][] maxRateChanges;
    //     bytes16 maxLpSupplyIncrease;
    //     bytes16 maxLpSupplyDecrease;
    // }

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

    await encodePumpData(alpha, capInterval, capReservesParameters);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
