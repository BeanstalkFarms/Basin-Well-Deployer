// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;


contract MockPumpDataEncoder {

    struct CapReservesParameters {
        bytes16[][] maxRateChanges;
        bytes16 maxLpSupplyIncrease;
        bytes16 maxLpSupplyDecrease;
    }

    function encodePumpData(
        bytes16 alpha,
        uint256 capInterval,
        CapReservesParameters memory crp
    ) pure public returns (bytes memory data) {
        data = abi.encode(alpha, capInterval, crp);
    }
}