const hre = require("hardhat");
const {getWellName, getWellSymbol, getTokenSymbol} = require('./wellDeploymentUtils');
const inquirer = require('inquirer');
const fs = require('fs');

// Sepolia addresses
const aquifierAddressSepolia = "0x7aa056fCEf8F529E8C8e0732727F40748f49Bc1B";
const constantProduct2AddressSepolia = "0x30Af8bc21683754086CDcb27C828FACAE85Cbcad";
const multiFlowPumpAddressSepolia = "0x9A3AE9143753eFc2cC9583Eb03DEFaC75b649686";
const standardWellImplementationAddressSepolia = "0x29F2f6EBA43ecE36a355D786FbF7Aa34432dB780";

// Mainnet addresses
const aquifierAddressMainnet = "0xBA51AAAA95aeEFc1292515b36D86C51dC7877773";
const constantProduct2AddressMainnet = "0xBA150C2ae0f8450D4B832beeFa3338d4b5982d26";
const multiFlowPumpAddressMainnet = "0xBA51AaaAa95bA1d5efB3cB1A3f50a09165315A17";
const standardWellImplementationAddressMainnet = "0xBA510e11eEb387fad877812108a3406CA3f43a4B";

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


async function padToBytes16(value) {
  // if value is less than 10, pad with 0
  if (value < 10 && value > 0) { value = '0' + value; }
  // convert to hex with 0x prefix
  const hexValue = '0x' + value.toString();
  return await hre.ethers.zeroPadValue(hexValue, 16);
}


async function padPumpData(alpha, capInterval, maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease) {
  alpha = await padToBytes16(alpha);
  capInterval = await padToBytes16(capInterval);
  for (let i = 0; i < maxRateChanges.length; i++) {
    for (let j = 0; j < maxRateChanges[i].length; j++) {
      maxRateChanges[i][j] = await padToBytes16(maxRateChanges[i][j]);
    }
  }
  maxLpSupplyIncrease = await padToBytes16(maxLpSupplyIncrease);
  maxLpSupplyDecrease = await padToBytes16(maxLpSupplyDecrease);
  return [alpha, capInterval, maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease];
}

async function getWellPumpDataQuestionsArray() {
  const hexzero = await hre.ethers.zeroPadValue("0x00", 16)
  const pumpDataQuestions = [
    {
      type: 'input',
      name: 'alpha',
      message: 'Enter the alpha value for the pump (bytes16)',
      default: 12
    },
    {
      type: 'input',
      name: 'capInterval',
      message: 'Enter the cap interval for the pump in seconds (uint256)',
      default: 12
    },
    {
      type: 'input',
      name: 'maxRateChanges',
      message: 'Enter the max rate changes for the pump (bytes16[][])',
      default: [
        ["00", "12"],
        ["12", "00"]
      ]
    },
    {
      type: 'input',
      name: 'maxLpSupplyIncrease',
      message: 'Enter the max LP supply increase for the pump (bytes16)',
      default: 16
    },
    {
      type: 'input',
      name: 'maxLpSupplyDecrease',
      message: 'Enter the max LP supply decrease for the pump (bytes16)',
      default: 16
    }
  ];
  return pumpDataQuestions;
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
    // TODO: Move everyhting to a json file like the pump registry
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
          address: () => hre.ethers.ZeroAddress,
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

async function askExitWithInitData(initData) {
  const message = "\nNow that init data has been encoded, you can mine for a salt for a vanity well address or proceed with the deployment of the well. Would you like to proceed with the deployment? (y/n)"
  const { proceed } = await inquirer.prompt( { type: 'input', name: 'proceed', message: message , default: "y"});
  if (proceed.toLowerCase() !== "y" && proceed.toLowerCase() !== "yes") {
    await fs.writeFileSync('wellInitData.txt', initData);
    console.log('\nInit data have been saved to wellInitData.txt. Use them to mine for a salt and come back to deploy the well.')
    console.log('Exiting...');
    process.exit(0);
  }
}

module.exports = {
    validateWellInput,
    getWellComponentQuestionsArray,
    getWellDataQuestionsArray,
    printWellDefinition,
    mapComponentDetails,
    getWellPumpDataQuestionsArray,
    padPumpData,
    askExitWithInitData
};