const fs = require('fs');
var exec = require('child_process').exec;
const inquirer = require('inquirer');

// Generates info for a component vanity address and writes it to a file
async function generateVanityAddress() {

    // ask for pattern
    patternQuestion = {
        type: 'input',
        message: 'Enter the pattern you want vanity address to start with:',
        name: 'pattern',
        default: 'BEA'
    }

    const { pattern } = await inquirer.prompt(patternQuestion);

    console.log('\nGenerating a vanity address for you...');
    exec(`vanityeth -n 1 --contract -i ${pattern} -c`, function (error, stdout, stderr) {

        //clean up and write output to file
        stderr = stderr.replace("- generating vanity address 1/1", "");
        stderr = stderr.replace("✔ ", "");
        stderr = stderr.replace("\n", "");
        fs.writeFileSync('data/vanityAddress.json', stderr, 'utf-8');

        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
    console.log('Vanity address generated and saved to data/vanityAddress.json!\n');
}

module.exports = {
    generateVanityAddress,
}