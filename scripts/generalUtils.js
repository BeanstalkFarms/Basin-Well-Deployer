const inquirer = require('inquirer');

async function askForConfirmation(componentName, componentVersion, nonce, deployerAddress, isWell) {
    let message = ''
    if (isWell) {
        message = 'A well will be deployed with the parameters above. Do you want to continue? (y/n)'
    } else {
        message = `Are you sure you want to deploy ${componentName} version ${componentVersion} with nonce ${nonce} by deployer account ${deployerAddress} ?`
    }
    const { proceed } = await inquirer.prompt( { type: 'input', name: 'proceed', message: message , default: "y"});
  
    if (proceed.toLowerCase() !== "y" && proceed.toLowerCase() !== "yes") {
      console.log('\nWell deployment cancelled.')
      console.log('Exiting...');
      process.exit(0);
    }
}

// Function to find the parameters for a given component version form the registry json
function findParametersByVersionInRegistryJson(version, jsonData ) {
    const versionInfo = jsonData.versions.find(v => v.version === version);
    if (versionInfo) {
      return versionInfo.parameters;
    } else {
      console.log('Version for specified component not found');
      return null;
    }
}
  

module.exports = {
    askForConfirmation,
    findParametersByVersionInRegistryJson
}