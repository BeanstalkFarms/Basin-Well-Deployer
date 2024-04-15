const hre = require("hardhat");

// Utils taken from basin.js in the Beanstalk repo 

// encodeWellImmutableData encodes the immutable data for a well
function encodeWellImmutableData(
    aquifer,
    tokens,
    wellFunction,
    pumps
  ) {
    let packedPumps = '0x';
    for (let i = 0; i < pumps.length; i++) {
        packedPumps = hre.ethers.solidityPacked(
            ['bytes', 'address', 'uint256', 'bytes'],
            [
                packedPumps,           // previously packed pumps
                pumps[i].target,       // pump address
                pumps[i].length,       // pump data length
                pumps[i].data          // pump data (bytes)
            ]
        )
    }
  
  
    immutableData = hre.ethers.solidityPacked(
        [
            'address',                  // aquifer address
            'uint256',                  // number of tokens
            'address',                  // well function address
            'uint256',                  // well function data length
            'uint256',                  // number of pumps
            'address[]',                // tokens array
            'bytes',                    // well function data (bytes)
            'bytes'                     // packed pumps (bytes)
        ], [
        aquifer,                    // aquifer address
        tokens.length,              // number of tokens
        wellFunction.target,        // well function address
        wellFunction.length,        // well function data length
        pumps.length,               // number of pumps
        tokens,                     // tokens array
        wellFunction.data,          // well function data (bytes)
        packedPumps                 // packed pumps (bytes)
    ]
    );
    return immutableData
  }
  
// Encodes the init function call for the well implementation
async function encodeInitFunctionCall(wellImplementationAbi, wellName, wellSymbol) {
    const wellInterface = new hre.ethers.Interface(wellImplementationAbi)
                                          // function   name,  symbol     
    return wellInterface.encodeFunctionData('init', [wellName, wellSymbol]);
}


// struct CapReservesParameters {
//     bytes16[][] maxRateChanges;
//     bytes16 maxLpSupplyIncrease;
//     bytes16 maxLpSupplyDecrease;
// }

async function encodePumpData(
    // bytes16 alpha, --> see stack overflow patrick question for bytes
    // uint256 capInterval, --> regular number
    // MultiFlowPump.CapReservesParameters memory crp --> struct --> Should be an object 
    alpha,
    capInterval,
    crp
) {
    // encode alpha to bytes
    const encoder = hre.ethers.AbiCoder();
    const alphaBytes = encoder.encode(['bytes16'], [alpha]);

    // convert capInterval to uint256 bytes
    const capIntervalBytes = encoder.encode(['uint256'], [capInterval]);

    // convert crp to bytes                                                 2D array, bytes16 encoded, bytes16 encoded
    const crpBytes = encoder.encode(['bytes16[][]', 'bytes16', 'bytes16'], [crp.maxRateChanges, crp.maxLpSupplyIncrease, crp.maxLpSupplyDecrease]);

    // return the concatenated bytes
    return hre.ethers.concat([alphaBytes, capIntervalBytes, crpBytes]);
}

// gets the token symbol from the token address
async function getTokenSymbol(tokenAddress) {
    const token = await ethers.getContractAt('IERC20Metadata', tokenAddress);
    return await token.symbol();
}

// constructs the default well name from the token addresses and the well function name
async function getWellName(token1Address, token2Address, wellFunctionName) {
    try {
        const token1Symbol = await getTokenSymbol(token1Address);
        const token2Symbol = await getTokenSymbol(token2Address);
        return token1Symbol + ':' + token2Symbol + ' ' + wellFunctionName + ' Well';
    } catch (e) {
        console.log(e);
        console.log("Error getting well name, Make sure the token addresses are correct and the tokens are deployed.");
        process.exit(1);
    }
}

// constructs the default well symbol from the token addresses and the well function symbol
async function getWellSymbol(token1Address, token2Address, wellFunctionSymbol) {
    try {
        const token1Name = await getTokenSymbol(token1Address);
        const token2Name = await getTokenSymbol(token2Address);
        return token1Name + token2Name + wellFunctionSymbol + 'w';
    } catch (e) {
        console.log(e);
        console.log("Error getting well symbol, Make sure the token addresses are correct and the tokens are deployed.");
        process.exit(1);
    }
}

module.exports = {
    encodeWellImmutableData,
    encodeInitFunctionCall,
    getWellName,
    getWellSymbol,
    getTokenSymbol
}