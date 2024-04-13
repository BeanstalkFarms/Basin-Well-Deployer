const inquirer = require('inquirer');

async function askForConfirmation(componentName, componentVersion, deployerAddress, isWell) {
    let message = ''
    if (isWell) {
        message = '\nA well will be deployed with the parameters above. Do you want to continue? (y/n)'
    } else {
        message = `Are you sure you want to deploy ${componentName} version ${componentVersion} by deployer account ${deployerAddress} ?`
    }
    const { proceed } = await inquirer.prompt( { type: 'input', name: 'proceed', message: message , default: "y"});
  
    if (proceed.toLowerCase() !== "y" && proceed.toLowerCase() !== "yes") {
      console.log('\nWell deployment cancelled.')
      console.log('Exiting...');
      process.exit(0);
    }
}

// returns the latest release version of the wells npm package
function getLatestReleaseVersion() {
  return '1.1';
}

// Function to find the parameters for a given component version from their respective registry json
function findParametersByVersionInRegistryJson(version, jsonData ) {
    // obtain the specified version info of the component
    const versionInfo = jsonData.versions.find(v => v.version === version);

    // dont ask any questions if the version has no parameters
    if (versionInfo.hasParameters === false) {return []}

    if (versionInfo) {
      return versionInfo.parameters;
    } else {
      console.log('Version for specified component not found');
      return null;
    }
}

module.exports = {
    askForConfirmation,
    findParametersByVersionInRegistryJson,
    getLatestReleaseVersion
}