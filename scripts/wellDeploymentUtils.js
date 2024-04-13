const hre = require("hardhat");

// Sepolia addresses
const aquifierAddressSepolia = "0x7aa056fCEf8F529E8C8e0732727F40748f49Bc1B";
const constantProduct2AddressSepolia = "0x30Af8bc21683754086CDcb27C828FACAE85Cbcad";
const multiFlowPumpAddressSepolia = "0x9A3AE9143753eFc2cC9583Eb03DEFaC75b649686";
const standardWellImplementationAddressSepolia = "0x29F2f6EBA43ecE36a355D786FbF7Aa34432dB780";

// Mainnet addresses
const aquifierAddressMainnet = "0xBA51AAAA95aeEFc1292515b36D86C51dC7877773";
const constantProduct2AddressMainnet = "0xBA510C20FD2c52E4cb0d23CFC3cCD092F9165a6E";
const multiFlowPumpAddressMainnet = "0xBA510f10E3095B83a0F33aa9ad2544E22570a87C";
const standardWellImplementationAddressMainnet = "0xBA510e11eEb387fad877812108a3406CA3f43a4B";

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

function validateWellInput(token1Address, token2Address) {
    // check if token1 and token2 are the same
    if (token1Address === token2Address) {
      console.log('\nError: token1 and token2 cannot be the same.');
      process.exit(1);
    }
  
    // check if token1 and token2 are valid addresses
    // token address length is 42 characters
    // if the addresses dont exist, the script will fail at the metadata retrieval step
    if (token1Address.length !== 42 || token2Address.length !== 42) {
      console.log('\nError: token1 and token2 addresses are invalid.');
      process.exit(1);
    }
}

function getWellComponentQuestionsArray() {
    return [
        {
          type: 'list',
          choices: ['Mainnet', 'Sepolia'],
          message: 'Select the network you would like to deploy the well to',
          name: 'network',
        },
        // https://sepolia.etherscan.io/tokentxns for tokens on Sepolia
        {
          type: 'input',
          name: 'token1Address',
          message: 'Input an address for token1',
        },
        {
          type: 'input',
          name: 'token2Address',
          message: 'Input an address for token2',
        },
        {
          type: 'list',
          choices: ['ConstantProduct2'],
          message: 'Select a well function to use for the Well. Read more about well functions at: https://docs.basin.exchange/components/well',
          name: 'wellFunction',
        },
        {
          type: 'list',
          choices: ['None', 'Multi Flow Pump (recommended)'],
          message: 'Select a pump to use for the Well (None for no pump). Read more about pumps at: https://docs.basin.exchange/components/pump',
          name: 'pump',
        },
        {
          type: 'list',
          choices: ['Standard Well Implementation (recommended)'],
          message: 'Select a well implementation to use for the Well. Read more about well implementations at: https://docs.basin.exchange/components/well#well-implementation',
          name: 'wellImplementation',
        },
      ];
}

async function getWellDataQuestionsArray(token1Address, token2Address, wellFunctionName, wellFunctionSymbol) {
    return [
        {
          type: 'input',
          name: 'wellName',
          message: 'Input a name for the well, press ENTER to use the default name.',
          default: await getWellName(token1Address, token2Address, wellFunctionName),
        },
        {
          type: 'input',
          name: 'wellSymbol',
          message: 'Input a symbol for the well, press ENTER to use the default symbol.',
          default: await getWellSymbol(token1Address, token2Address, wellFunctionSymbol),
        },
        {
          type: 'input',
          name: 'salt',
          message: 'Input a salt for the well. Use a salt deploy a new Well with CREATE2 opcode. Press ENTER to add the default salt. Salts are used for vanity addresses and to predict the new well address.',
        },
      ];
}

async function printWellDefinition(token1Address, token2Address, wellFunctionAddress, 
    pumpAddress, wellImplementationAddress, wellName, wellSymbol, salt, network) {

    console.log('\n///////////////// WELL DEPLOYMENT PARAMETERS ///////////////////////////');
    console.log('Token1: ', token1Address + ' (' + await getTokenSymbol(token1Address) + ')' );
    console.log('Token2: ', token2Address + ' (' + await getTokenSymbol(token2Address) + ')' );
    console.log('Well Function: ', wellFunctionAddress);
    console.log('Pump: ', pumpAddress);
    console.log('Well Implementation: ', wellImplementationAddress);
    console.log('Well Name: ', wellName);
    console.log('Well Symbol: ', wellSymbol);
    console.log('Salt: ', salt);
    console.log('Network: ', network);
}

// Function to get configuration based on component type
function getConfigByComponentType(componentType) {

    // Central configuration repository
    // TODO: Move to a json file like the pump registry
    const componentConfigs = {
      wellFunction: {
        'ConstantProduct2': {
          address: (network) => network === 'Mainnet' ? constantProduct2AddressMainnet : constantProduct2AddressSepolia,
          name: 'Constant Product 2',
          symbol: 'CP2'
        }
      },
      pump: {
        'None': {
          address: () => ethers.constants.AddressZero
        },
        'Multi Flow Pump (recommended)': {
          address: (network) => network === 'Mainnet' ? multiFlowPumpAddressMainnet : multiFlowPumpAddressSepolia,
          name: 'Multi Flow Pump',
          symbol: ''
        }
      },
      wellImplementation: {
        'Standard Well Implementation (recommended)': {
          address: (network) => network === 'Mainnet' ? standardWellImplementationAddressMainnet : standardWellImplementationAddressSepolia,
          name: 'Standard Well Implementation',
          symbol: ''
        }
      }
    };

    const config = componentConfigs[componentType];
    if (!config) {
      throw new Error('Invalid component type');
    }    
    return config;
}

// Function to dynamically map key to details based on component type and network
function mapComponentDetails(componentType, key, network) {
    const config = getConfigByComponentType(componentType);
    const detailConfig = config[key];
    if (!detailConfig) {
        throw new Error(`Invalid key for ${componentType}`);
    }
    // Return details with the address potentially being a function of the network
    return {
        address: typeof detailConfig.address === 'function' ? detailConfig.address(network) : detailConfig.address,
        name: detailConfig.name,
        symbol: detailConfig.symbol
    };
}




module.exports = {
    encodeWellImmutableData,
    encodeInitFunctionCall,
    getWellName,
    getWellSymbol,
    getTokenSymbol,
    validateWellInput,
    getWellComponentQuestionsArray,
    getWellDataQuestionsArray,
    printWellDefinition,
    mapComponentDetails
}