const hre = require("hardhat");

// Utils taken from basin.js in the Beanstalk repo

function encodeWellImmutableData(aquifer, tokens, wellFunction, pumps) {
  let packedPumps = "0x";
  for (let i = 0; i < pumps.length; i++) {
    console.log("pumps[i].target: ", pumps[i].target);
    console.log("pumps[i].length: ", pumps[i].length);
    console.log("pumps[i].data: ", pumps[i].data);
    packedPumps = hre.ethers.solidityPacked(
      ["bytes", "address", "uint256", "bytes"],
      [
        packedPumps, // previously packed pumps
        pumps[i].target, // pump address
        pumps[i].length, // pump data length
        pumps[i].data, // pump data (bytes)
      ]
    );
  }

  immutableData = hre.ethers.solidityPacked(
    [
      "address", // aquifer address
      "uint256", // number of tokens
      "address", // well function address
      "uint256", // well function data length
      "uint256", // number of pumps
      "address[]", // tokens array
      "bytes", // well function data (bytes)
      "bytes", // packed pumps (bytes)
    ],
    [
      aquifer, // aquifer address
      tokens.length, // number of tokens
      wellFunction.target, // well function address
      wellFunction.length, // well function data length
      pumps.length, // number of pumps
      tokens, // tokens array
      wellFunction.data, // well function data (bytes)
      packedPumps, // packed pumps (bytes)
    ]
  );
  return immutableData;
  //   0x
  //   ba51aaaa95aeefc1292515b36d86c51dc7877773
  //   0000000000000000000000000000000000000000000000000000000000000002
  //   ba150c2ae0f8450d4b832beefa3338d4b5982d26
  //   0000000000000000000000000000000000000000000000000000000000000000
  //   0000000000000000000000000000000000000000000000000000000000000001
  //   000000000000000000000000bea0000029ad1c77d3d5d23ba2d8893db9d1efab
  //   0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0
  //   ba51aaaaa95ba1d5efb3cb1a3f50a09165315a17
  //   0000000000000000000000000000000000000000000000000000000000000001
  //   3ffeef368eb04325c526c2246eec3e5500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000603ff33a92a305532617c1bda5119ce075000000000000000000000000000000003ff33a92a305532617c1bda5119ce075000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003ff7eb851eb851eb851eb851eb851eb80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023ff7eb851eb851eb851eb851eb851eb8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
}

// Encodes the init function call for the well implementation
async function encodeInitFunctionCall(
  wellImplementationAbi,
  wellName,
  wellSymbol
) {
  const wellInterface = new hre.ethers.Interface(wellImplementationAbi);
  // function   name,  symbol
  return wellInterface.encodeFunctionData("init", [wellName, wellSymbol]);
}

async function encodePumpData(alpha, capInterval, capReservesParameters) {
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
  return abiCoderEncoding;
}

// gets the token symbol from the token address
async function getTokenSymbol(tokenAddress) {
  const token = await ethers.getContractAt(
    "contracts/IERC20Metadata.sol:IERC20Metadata",
    tokenAddress
  );
  return await token.symbol();
}

// constructs the default well name from the token addresses and the well function name
async function getWellName(token1Address, token2Address, wellFunctionName) {
  try {
    const token1Symbol = await getTokenSymbol(token1Address);
    const token2Symbol = await getTokenSymbol(token2Address);
    return token1Symbol + ":" + token2Symbol + " " + wellFunctionName + " Well";
  } catch (e) {
    console.log(e);
    console.log(
      "Error getting well name, Make sure the token addresses are correct and the tokens are deployed."
    );
    process.exit(1);
  }
}

// constructs the default well symbol from the token addresses and the well function symbol
async function getWellSymbol(token1Address, token2Address, wellFunctionSymbol) {
  try {
    const token1Name = await getTokenSymbol(token1Address);
    const token2Name = await getTokenSymbol(token2Address);
    return token1Name + token2Name + wellFunctionSymbol + "w";
  } catch (e) {
    console.log(e);
    console.log(
      "Error getting well symbol, Make sure the token addresses are correct and the tokens are deployed."
    );
    process.exit(1);
  }
}

module.exports = {
  encodeWellImmutableData,
  encodeInitFunctionCall,
  encodePumpData,
  getWellName,
  getWellSymbol,
  getTokenSymbol,
};
