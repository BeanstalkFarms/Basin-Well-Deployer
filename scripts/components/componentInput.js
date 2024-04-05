const inquirer = require('inquirer');
const { handlePumpParameters } = require('./componentParametersInput');

async function handlePumpInput() {
    
    const pumpQuestions = [
        {
            type: 'list',
            choices: ['Multiflow Pump'],
            message: 'Select the pump you would like to deploy',
            name: 'pump',
        },
        {
            type: 'list',
            choices: ['Pump 1.0', 'Pump 1.1'],
            message: 'Select the version of the pump you would like to deploy',
            name: 'pumpVersion',
        }
    ]

    // Pump 1.0
    // constructor(bytes16 _maxPercentIncrease, bytes16 _maxPercentDecrease, uint256 _capInterval, bytes16 _alpha) {

    // Pump 1.1
    // (bytes16 alpha, uint256 capInterval, CapReservesParameters memory crp) =
    // abi.decode(data, (bytes16, uint256, CapReservesParameters));

    const {pump, pumpVersion} = await inquirer.prompt(pumpQuestions);

    const parameters = await handlePumpParameters(pump, pumpVersion);

    // map the input to the actual pump name json from npm package
    let pumpMap = {
        'Multiflow Pump': 'MultiFlowPump',
    }
    
    return pumpMap[pump] , parameters;
}

async function handleWellImplementationInput() {

    const wellImplementationQuestions = [
        {
            type: 'list',
            choices: ['Standard'],
            message: 'Select the well implementation you would like to deploy',
            name: 'wellImplementation',
        }
    ]

    const { wellImplementation } = await inquirer.prompt(wellImplementationQuestions);

    // map the input to the actual well implementation name json from npm package
    let wellImplementationMap = {
        'Standard': 'Well',
    }

    return wellImplementationMap[wellImplementation];

}

module.exports = {
    handleExchangeFunctionInput,
    handlePumpInput,
    handleWellImplementationInput,
}