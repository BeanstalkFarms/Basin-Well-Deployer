const hre = require('hardhat');
const fs = require('fs');
const { getWellName, getWellSymbol } = require('./utils');

async function main() {
    // Aquifier abi from etherscan
    const erc20ABI = JSON.parse(await fs.readFileSync('contracts/USDT_ABI.json', 'utf8'));

    // usdt address
    const USDTtokenAddress = "0x419Fe9f14Ff3aA22e46ff1d03a73EdF3b70A62ED"

    const AGEURtokenAddress = "0xf7f928B2bf5cc7E0Bd0f258165249fA3C2Ef85AC"

    const wellFunctionName = "Constant Product 2"

    const wellFunctionSymbol = "CP2"

    const wellName = await getWellName(USDTtokenAddress, AGEURtokenAddress, wellFunctionName);
    const wellSymbol = await getWellSymbol(USDTtokenAddress, AGEURtokenAddress, wellFunctionSymbol);

    console.log('Well Name: ', wellName);
    console.log('Well Symbol: ', wellSymbol);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});