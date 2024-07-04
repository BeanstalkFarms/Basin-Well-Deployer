// SPDX-License-Identifier: Unlicense
import {ABDKMathQuad} from "node_modules/abdk-libraries-solidity/ABDKMathQuad.sol";
import {console} from "hardhat/console.sol";

pragma solidity >=0.8.0;

contract MockPumpDataEncoder {
    struct Call {
        address target;
        bytes data;
    }

    struct DeployWellData {
        address[] tokens;
        Call wellFunction;
        Call[] pumps;
    }

    struct CapReservesParameters {
        bytes16[][] maxRateChanges;
        bytes16 maxLpSupplyIncrease;
        bytes16 maxLpSupplyDecrease;
    }

    function encodePumpData(bytes16 alpha, uint256 capInterval, CapReservesParameters memory crp)
        public
        pure
        returns (bytes memory data)
    {
        data = abi.encode(alpha, capInterval, crp);
    }

    /**
     * @notice helper function to encode into bytes.
     */
    function encodeWellParams(address _aquifierAddress, DeployWellData memory wd)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory packedPumpData;
        for (uint256 i; i < wd.pumps.length; i++) {
            Call memory pump = wd.pumps[i];
            console.log("pump.target: %s", pump.target);
            console.log("pump.data.length: %s", pump.data.length);
            console.logBytes(pump.data);
            packedPumpData = abi.encodePacked(packedPumpData, pump.target, pump.data.length, pump.data);
        }
        // encode data:
        return abi.encodePacked(
            _aquifierAddress,
            wd.tokens.length,
            wd.wellFunction.target,
            wd.wellFunction.data.length,
            wd.pumps.length,
            wd.tokens,
            wd.wellFunction.data,
            packedPumpData
        );
    }

    /**
     * @notice helper function to craft the well parameters for a 2 token, 1 pump well.
     */
    function getWellParams2Tkn1Pump(
        address token0,
        address token1,
        address wellFunction,
        bytes memory wellFunctionData,
        address pump,
        bytes memory pumpDataInPump
    ) public pure returns (DeployWellData memory wellParameters) {
        address[] memory tokens = new address[](2);
        tokens[0] = token0;
        tokens[1] = token1;
        Call[] memory pumpData = new Call[](1);
        pumpData[0].target = pump;
        pumpData[0].data = pumpDataInPump;
        wellParameters = DeployWellData(tokens, Call(wellFunction, wellFunctionData), pumpData);
    }

    // function encodeAll() public pure returns (bytes memory) {
    //     bytes16[][] memory maxRateChanges = new bytes16[][](2);
    //     maxRateChanges[0] = new bytes16[](2);
    //     maxRateChanges[1] = new bytes16[](2);
    //     maxRateChanges[0][1] = bytes16(0x3bf5c28f000000000000000000000000); // +/- 0.75%
    //     maxRateChanges[1][0] = bytes16(0x3bf5c28f000000000000000000000000);
    //     DeployWellData memory wd = getWellParams2Tkn1Pump(
    //         address(0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab), // BEAN
    //         address(0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0), // WstETH
    //         address(0xBA150C2ae0f8450D4B832beeFa3338d4b5982d26), // constant product 2 (new one)
    //         new bytes(0), // well function requires no data.
    //         address(0xBA51AaaAa95bA1d5efB3cB1A3f50a09165315A17), // multi flow pump v1.1.
    //         encodePumpData(
    //             bytes16(0x3ffeef368eb04325c526c2246eec3e55), // alpha
    //             12, // block interval
    //             CapReservesParameters(
    //                 maxRateChanges,
    //                 bytes16(0x3cf5c28f000000000000000000000000),
    //                 bytes16(0x3cf5c28f000000000000000000000000) // max lp supply increase and decrease (+/- 3%);
    //             )
    //         )
    //     );
    //     return encodeWellParams(
    //         address(0xBA51AAAA95aeEFc1292515b36D86C51dC7877773), // aquifer
    //         wd
    //     );
    // }

    uint256 constant MAX_128 = 2 ** 128;
    uint256 constant MAX_E18 = 1e18;

    function from18(uint256 a) public pure returns (bytes16 result) {
        return ABDKMathQuad.from128x128(int256((a * MAX_128) / MAX_E18));
    }
}
