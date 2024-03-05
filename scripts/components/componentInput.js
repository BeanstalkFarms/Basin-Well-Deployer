const inquirer = require('inquirer');

async function handleExchangeFunctionInput() {

    const exchangeFunctionQuestions = [
        {
            type: 'list',
            choices: ['ConstantProduct2'],
            message: 'Select the exchange function you would like to deploy',
            name: 'exchangeFunction',
        }
    ]

    const { exchangeFunction } = await inquirer.prompt(exchangeFunctionQuestions);

    // map the input to the actual exchange function name json from npm package
    let exchangeFunctionMap = {
        'ConstantProduct2': 'ConstantProduct2',
    }

    return exchangeFunctionMap[exchangeFunction];
}

async function handlePumpInput() {
    
    const pumpQuestions = [
        {
            type: 'list',
            choices: ['Multiflow Pump'],
            message: 'Select the pump you would like to deploy',
            name: 'pump',
        }
    ]

    const { pump } = await inquirer.prompt(pumpQuestions);

    // map the input to the actual pump name json from npm package
    let pumpMap = {
        'Multiflow Pump': 'MultiFlowPump',
    }
    
    return pumpMap[pump];
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