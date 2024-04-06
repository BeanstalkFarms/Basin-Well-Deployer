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

module.exports = {
    askForConfirmation
}