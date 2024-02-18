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
                packedPumps,            // previously packed pumps
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

// constructs the default well name from the token addresses and the well function name
async function getWellName(token1Address, token2Address, wellFunctionName) {
    const token1 = await ethers.getContractAt('IERC20Metadata', token1Address);
    const token2 = await ethers.getContractAt('IERC20Metadata', token2Address);
    const token1Symbol = await token1.symbol();
    const token2Symbol = await token2.symbol();
    return token1Symbol + ':' + token2Symbol + ' ' + wellFunctionName + ' Well';
}

// constructs the default well symbol from the token addresses and the well function symbol
async function getWellSymbol(token1Address, token2Address, wellFunctionSymbol) {
    const token1 = await ethers.getContractAt('IERC20Metadata', token1Address);
    const token2 = await ethers.getContractAt('IERC20Metadata', token2Address);
    const token1Name = await token1.symbol();
    const token2Name = await token2.symbol();
    return token1Name + token2Name + wellFunctionSymbol + 'w';
}

// Assebles everything and deploys the well --> kept here for reference
async function deployWell(tokens, verbose = false, salt = ethers.constants.HashZero) {
    const wellImplementation = await deployWellContract('Well');
    if (verbose) console.log("Deployed Well Implementation", wellImplementation.address);
    const aquifer = await deployWellContract('Aquifer');
    if (verbose) console.log("Deployed Aquifer", aquifer.address);
    const wellFunction = await deployWellContract('ConstantProduct2');
    if (verbose) console.log("Deployed Well Function", wellFunction.address);
    const pump = await deployMultiFlowPump()
    if (verbose) console.log("Deployed Pump", pump.address);

    const immutableData = await encodeWellImmutableData(
        aquifer.address,
        tokens,
        { target: wellFunction.address, data: '0x', length: 0 },
        [{ target: pump.address, data: '0x', length: 0 }]
    )

    const initData = await encodeInitFunctionCall();

    if (verbose) console.log("Immutable Data", immutableData);
    if (verbose) console.log("Init Data", initData);

    const well = await aquifer.callStatic.boreWell(
        wellImplementation.address,
        immutableData,
        initData,
        salt
    );

    await aquifer.boreWell(
        wellImplementation.address,
        immutableData,
        initData,
        salt
    );

    if (verbose) console.log(`Well Deployed: ${well}`)

    return await ethers.getContractAt('IWell', well);
}

module.exports = {
    encodeWellImmutableData,
    encodeInitFunctionCall,
    getWellName,
    getWellSymbol
}