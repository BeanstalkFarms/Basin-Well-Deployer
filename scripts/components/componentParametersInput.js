const inquirer = require('inquirer');

// TODO --> READ FROM REGISTRY JSON DYNAMICALLY ACCORDING TO VERSION
async function handlePumpParameters(pump, pumpVersion) {
    let parameters = {};
    if (pump === 'Multiflow Pump') {
        if (pumpVersion === 'Pump 1.0') {
            const pump1_0Questions = [
                {
                    type: 'input',
                    message: 'Enter the maximum percentage increase',
                    name: 'maxPercentIncrease',
                },
                {
                    type: 'input',
                    message: 'Enter the maximum percentage decrease',
                    name: 'maxPercentDecrease',
                },
                {
                    type: 'input',
                    message: 'Enter the cap interval',
                    name: 'capInterval',
                },
                {
                    type: 'input',
                    message: 'Enter the alpha',
                    name: 'alpha',
                }
            ]
            parameters = await inquirer.prompt(pump1_0Questions);
        } else {
            const pump1_1Questions = [
                {
                    type: 'input',
                    message: 'Enter the alpha',
                    name: 'alpha',
                },
                {
                    type: 'input',
                    message: 'Enter the cap interval',
                    name: 'capInterval',
                },
                {
                    type: 'input',
                    message: 'Enter the cap reserves parameters',
                    name: 'capReservesParameters',
                }
            ]
            parameters = await inquirer.prompt(pump1_1Questions);
        }
    }
    console.log(parameters);
    return parameters;
}

module.exports = {
    handlePumpParameters
}
