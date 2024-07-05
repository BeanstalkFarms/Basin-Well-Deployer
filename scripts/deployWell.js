const hre = require("hardhat");
const inquirer = require('inquirer');
const fs = require('fs');
const {encodeInitFunctionCall, encodeWellImmutableData, encodePumpData} = require('./wells/wellDeploymentUtils');
const {getWellComponentQuestionsArray, getWellDataQuestionsArray, validateWellInput, mapComponentDetails, printWellDefinition, getWellPumpDataQuestionsArray, askExitWithWellData, convertPumpData} = require('./wells/wellDeploymentInput');
const { askForConfirmation, deployMockERC20 } = require('./generalUtils');

// Sepolia factory address
const aquifierAddressSepolia = "0x7aa056fCEf8F529E8C8e0732727F40748f49Bc1B";
// Mainnet factory address
const aquifierAddressMainnet = "0xBA51AAAA95aeEFc1292515b36D86C51dC7877773";

async function deployWell() {

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
  const componentQuestions = getWellComponentQuestionsArray();
  const { network, token1Address, token2Address, wellFunction, pump, wellImplementation } = await inquirer.prompt(componentQuestions);

  // safeguards
  validateWellInput(token1Address, token2Address);

  // map the component details
  const wellFunctionDetails = mapComponentDetails('wellFunction', wellFunction, network);
  let wellFunctionAddress = wellFunctionDetails.address;
  let wellFunctionName = wellFunctionDetails.name;
  let wellFunctionSymbol = wellFunctionDetails.symbol;

  const pumpDetails = mapComponentDetails('pump', pump, network);
  const pumpAddress = pumpDetails.address;

  const implementationDetails = mapComponentDetails('wellImplementation', wellImplementation, network);
  const wellImplementationAddress = implementationDetails.address;
  
  /////////////////////////////// SYMBOL , NAME , SALT INPUT ///////////////////////////////
  const dataQuestions = await getWellDataQuestionsArray(token1Address, token2Address, wellFunctionName, wellFunctionSymbol);
  let { wellName, wellSymbol, salt } = await inquirer.prompt(dataQuestions);

  ///////////////////////////// PUMP DATA /////////////////////////////
  const pumpDataQuestions = await getWellPumpDataQuestionsArray();
  let { alpha, capInterval, maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease } = await inquirer.prompt(pumpDataQuestions);
  [alpha, capInterval, maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease] = await convertPumpData(alpha, capInterval, maxRateChanges, maxLpSupplyIncrease, maxLpSupplyDecrease);

  // construct the capReservesParameters struct
  // struct CapReservesParameters {
  //     bytes16[][] maxRateChanges;
  //     bytes16 maxLpSupplyIncrease;
  //     bytes16 maxLpSupplyDecrease;
  // }
  const capReservesParameters = {
    maxRateChanges: maxRateChanges, // bytes16[][]
    maxLpSupplyIncrease: maxLpSupplyIncrease, // bytes16
    maxLpSupplyDecrease: maxLpSupplyDecrease // bytes16
  };

  console.log("Well Component Adresses: ")
  console.log(`Well Function Address: ${wellFunctionAddress}`);
  console.log(`Pump Address: ${pumpAddress}`);
  console.log(`Well Implementation Address: ${wellImplementationAddress}`);
  console.log("\n");

  const pumpData = await encodePumpData(alpha, capInterval, capReservesParameters);

  // salt validation
  // salt is a bytes32 string
  if ( salt === '' ) {
    // if salt is empty, we use the bytes32 string of 'beanstalk'
    // to ensure we can predict the address of the well
    salt = hre.ethers.encodeBytes32String("beanstalk");
  } else {
    salt = hre.ethers.encodeBytes32String(salt);
  }
  
  // Get deployed aquifier
  const deployedAquifierAddress = network === 'Mainnet' ? aquifierAddressMainnet : aquifierAddressSepolia;

  // Aquifier abi from etherscan
  const aquifierABI = JSON.parse(await fs.readFileSync('contracts/Aquifier_ABI.json', 'utf8'));
  
  // get deployed aquifier contract
  const deployedAquifier = await hre.ethers.getContractAt(aquifierABI, deployedAquifierAddress);

  // Assemble data to encode
  const tokens = [token1Address, token2Address];

  // IMMUTABLE DATA
  const immutableData = await encodeWellImmutableData(
    deployedAquifierAddress, // aquifer address
    tokens, // tokens array
    { target: wellFunctionAddress, data: '0x', length: 0 }, // well function object --> reference to Call struct
    [{ target: pumpAddress, data: pumpData, length: 1 }] // array of pump objects --> references to Call struct
  )
  
  console.log('\nImmutable data encoded...\n')
  console.log(immutableData)

  // Well implementation abi from etherscan
  const wellImplementationABI = JSON.parse(await fs.readFileSync('contracts/Well_ABI.json', 'utf8'));
  
  // INIT DATA
                                                              // abi   name,  symbol
  const initData = await encodeInitFunctionCall(wellImplementationABI, wellName, wellSymbol);
  
  console.log('\nInit data encoded...\n')
  console.log(initData)

  await askExitWithWellData(immutableData);

  // Predict well address from input parameters
  const newWellAddress = await deployedAquifier.predictWellAddress(
    wellImplementationAddress,
    immutableData,
    salt
  );

  // Confirmation step
  await printWellDefinition(token1Address, token2Address, wellFunctionAddress,
      pumpAddress, wellImplementationAddress, wellName, wellSymbol, salt, network, newWellAddress);
  await askForConfirmation(undefined, undefined, undefined, true)

  // DEPLOY WELL FUNCTION CALL
  console.log('Deploying new well...');

  // Then we call boreWell, to actually deploy the well
  await deployedAquifier.boreWell(
    wellImplementationAddress,
    immutableData,
    initData,
    salt
  );
  
  console.log(`\n\n/////////////// ${wellName} DEPLOYED //////////////////`);
  console.log(`New Well deployed to: ${newWellAddress}`);
  console.log(`View the Aquifer transaction on Etherscan: https://${network === 'Mainnet' ? 'etherscan.io' : 'sepolia.etherscan.io'}/address/${deployedAquifierAddress}`);
}

deployWell().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
