const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const {encodeInitFunctionCall, encodeWellImmutableData , getWellName , getWellSymbol} = require('./utils');

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


async function main() {

  const asciiArt = ` 

  ██╗    ██╗███████╗██╗     ██╗         ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗
  ██║    ██║██╔════╝██║     ██║         ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝
  ██║ █╗ ██║█████╗  ██║     ██║         ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ 
  ██║███╗██║██╔══╝  ██║     ██║         ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  
  ╚███╔███╔╝███████╗███████╗███████╗    ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   
   ╚══╝╚══╝ ╚══════╝╚══════╝╚══════╝    ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   
  `; 
  console.log(asciiArt + "\n");

  console.log('Welcome to the Basin well deployment script!');
  console.log('This script will guide you through the deployment of a new well on Basin DEX.');
  console.log("Basin is a composable DEX. This means you can compose exchange functions, network-native oracles (pumps) and exchange implementations into a single liquidity pool known as a Well however you wish.\n")
  console.log("Note that Basin is under development and limited components are available at this time.\n");
  console.log('More information can be found at: https://docs.basin.exchange/ \n');

  /////////////////////////////// COMPONENTS INPUT ///////////////////////////////
  const componentQuestions = [
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


  const { token1Address, token2Address, wellFunction, pump, wellImplementation } = await inquirer.prompt(componentQuestions);

  // map well function to address and name
  let wellFunctionAddress;
  let wellFunctionName;
  let wellFunctionSymbol;
  switch (wellFunction) {
    case 'ConstantProduct2':
      wellFunctionAddress = network === 'Mainnet' ? constantProduct2AddressMainnet : constantProduct2AddressSepolia;
      wellFunctionName = 'Constant Product 2';
      wellFunctionSymbol = 'CP2';
      break;
    default:
      throw new Error('Invalid well function');
  }

  // map pump to address
  let pumpAddress;
  switch (pump) {
    case 'None':
      pumpAddress = hre.ethers.ZeroAddress;
      break;
    case 'Multi Flow Pump (recommended)':
      pumpAddress = network === 'Mainnet' ? multiFlowPumpAddressMainnet : multiFlowPumpAddressSepolia;
      break;
    default:
      throw new Error('Invalid pump');
  }


  // map well implementation to address
  let wellImplementationAddress;
  switch (wellImplementation) {
    case 'Standard Well Implementation (recommended)':
      wellImplementationAddress = network === 'Mainnet' ? standardWellImplementationAddressMainnet : standardWellImplementationAddressSepolia;
      break;
    default:
      throw new Error('Invalid well implementation');
  }

  /////////////////////////////// SYMBOL , NAME , SALT INPUT ///////////////////////////////
  const dataQuestions = [
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
      message: 'Input a salt for the well. Note Use `salt == 0` to deploy a new Well with the CREATE opcode. Use salt > 0 to deploy a new Well with CREATE2 opcode. Press ENTER to skip. Salts are used for vanity addresses.',
    },
  ];

  let { wellName, wellSymbol, salt } = await inquirer.prompt(dataQuestions);

  // salt validation
  // salt is a bytes32 string
  if ( salt === '' ) {
    salt = hre.ethers.ZeroHash;
  } else {
    salt = hre.ethers.encodeBytes32String(salt);
  }

  console.log('\n///////////////// WELL DEPLOYMENT PARAMETERS ///////////////////////////');
  console.log('Token1: ', token1Address);
  console.log('Token2: ', token2Address);
  console.log('Well Function: ', wellFunctionAddress);
  console.log('Pump: ', pumpAddress);
  console.log('Well Implementation: ', wellImplementationAddress);
  console.log('Well Name: ', wellName);
  console.log('Well Symbol: ', wellSymbol);
  console.log('Salt: ', salt);

  const { proceed } = await inquirer.prompt( { type: 'input', name: 'proceed', message: 'A well will be deployed with the parameters above. Do you want to continue? (y/n)' , default: "y"});
  
  console.log("confirm: ", proceed);

  if (proceed == "n" || proceed == "No" || proceed == "no" || proceed == "N") {
    console.log('\nWell deployment cancelled.')
    console.log('Exiting...');
    process.exit(0);
  }
  
  /////////////////////////////// END PARAMETER INPUT ///////////////////////////////


  // Get deployed aquifier
  const deployedAquifierAddress = network === 'Mainnet' ? aquifierAddressMainnet : aquifierAddressSepolia;

  // Aquifier abi from etherscan
  const aquifierABI = JSON.parse(await fs.readFileSync('contracts/Aquifier_ABI.json', 'utf8'));
  
  // get deployed aquifier
  const deployedAquifier = await hre.ethers.getContractAt(aquifierABI, deployedAquifierAddress);

  // Assemble data to encode
  const tokens = [token1Address, token2Address];

  // IMMUTABLE DATA
  const immutableData = await encodeWellImmutableData(
    deployedAquifierAddress, // aquifer address
    tokens, // tokens array
    { target: wellFunctionAddress, data: '0x', length: 0 }, // well function
    [{ target: pumpAddress, data: '0x', length: 0 }] // pumps
  )
  
  // Well implementation abi from etherscan
  const wellImplementationABI = JSON.parse(await fs.readFileSync('contracts/Well_ABI.json', 'utf8'));
  
  // INIT DATA
                                                              // abi   name,  symbol
  const initData = await encodeInitFunctionCall(wellImplementationABI, wellName, wellSymbol);

  console.log('Encoded Immutable Data: ', immutableData);
  console.log('Encoded Init Data: ', initData);
  
  console.log('Data encoded...');
  console.log('\nDeploying new well...');
  
  

  // DEPLOY WELL FUNCTION CALL

  // // First we call the boreWell function with .callStatic to get the address of the new well
  // // This does not actually deploy the well, but returns the address of the new well
  // const newWell = await deployedAquifier.callStatic.boreWell(
  //   wellImplementation.address,
  //   immutableData,
  //   initData,
  //   salt
  // );

  // // Then we call boreWell again, this time without .callStatic to actually deploy the well
  // await deployedAquifier.boreWell(
  //   wellImplementation.address,
  //   immutableData,
  //   initData,
  //   salt
  // );
  
  console.log(`\n\n/////////////// ${wellName} WELL DEPLOYED //////////////////`);
  console.log('New Well deployed to: 000000000000000000000000');

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
