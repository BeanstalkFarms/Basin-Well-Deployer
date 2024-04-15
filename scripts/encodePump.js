const hre = require("hardhat");

async function encodePumpData(
    // bytes16 alpha, --> see stack overflow patrick question for bytes
    // uint256 capInterval, --> regular number
    // MultiFlowPump.CapReservesParameters memory crp --> struct --> Should be an object 
    alpha,
    capInterval,
    crp
) {
    // encode alpha to bytes
    const encoder = new hre.ethers.AbiCoder();
    const alphaBytes = encoder.encode(['bytes16'], [alpha]);

    console.log("Encoded alpha: ", alphaBytes);

    // convert capInterval to uint256 bytes
    const capIntervalBytes = encoder.encode(['uint256'], [capInterval]);

    console.log("Encoded capInterval: ", capIntervalBytes);

    // convert crp to bytes                                                 2D array, bytes16 encoded, bytes16 encoded
    const crpBytes = encoder.encode(['bytes16[][]', 'bytes16', 'bytes16'], [crp.maxRateChanges, crp.maxLpSupplyIncrease, crp.maxLpSupplyDecrease]);

    console.log("Encoded crp: ", crpBytes);

    console.log("Concatenated bytes: ", hre.ethers.concat([alphaBytes, capIntervalBytes, crpBytes]));

    // return the concatenated bytes
    return hre.ethers.concat([alphaBytes, capIntervalBytes, crpBytes]);
}


// struct CapReservesParameters {
//     bytes16[][] maxRateChanges;
//     bytes16 maxLpSupplyIncrease;
//     bytes16 maxLpSupplyDecrease;
// }

const alpha = '0x2'
const capInterval = 12;
const crp = {
    maxRateChanges: [
        ['0x0', '0x1'],
        ['0x1', '0x0'],
    ],
    maxLpSupplyIncrease: '0x1',
    maxLpSupplyDecrease: '0x2'
};

encodePumpData(alpha, capInterval, crp);
