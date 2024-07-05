// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibClone} from "./LibClone.sol";

contract MineSalt {
    using LibClone for address;

    address wellDeployer;
    address constant AQUIFER = 0xBA51AAAA95aeEFc1292515b36D86C51dC7877773;
    address constant WELL_IMPLEMENTATION = 0xBA510e11eEb387fad877812108a3406CA3f43a4B;
    bytes immutableData;

    string targetPrefix;
    uint256 characters;

    uint256 attemptsPerRun;

    constructor(uint256 _attemptsPerRun, address _wellDeployer, bytes memory _immutableData, string memory _targetPrefix, uint256 _characters) {
        wellDeployer = _wellDeployer;
        attemptsPerRun = _attemptsPerRun;
        immutableData = _immutableData;
        targetPrefix = _targetPrefix;
        characters = _characters;
    }

    function checkForAddress(uint256 start) external view returns (address a, string memory str, bytes32 s) {
        bytes32 targetHash = keccak256(abi.encodePacked(targetPrefix));
        uint256 end = start + attemptsPerRun;
        for (uint256 i = start; i < end; i++) {
            (a, str) = checkSalt(bytes32(uint256(i)), targetHash);
            if (a != address(0)) {
                s = bytes32(uint256(i));
                return (a, str, s);
            }
        }
    }

    function checkSalt(bytes32 salt, bytes32 targetHash) internal view returns (address, string memory) {
        bytes memory initData = immutableData;
        address well = predictWellAddress(AQUIFER, wellDeployer, WELL_IMPLEMENTATION, initData, salt);
        string memory wellString = toHexString(well, characters);

        if (keccak256(abi.encodePacked(wellString)) == targetHash) {
            return (well, wellString);
        }
    }

    function predictWellAddress(
        address aquifer,
        address wellDeployer,
        address implementation,
        bytes memory immutableData,
        bytes32 salt
    ) internal pure returns (address well) {
        salt = keccak256(abi.encode(wellDeployer, salt));
        if (immutableData.length > 0) {
            well = implementation.predictDeterministicAddress(immutableData, salt, aquifer);
        } else {
            well = implementation.predictDeterministicAddress(salt, aquifer);
        }
    }

    bytes16 private constant _HEX_DIGITS = "0123456789abcdef";

    function toHexString(uint256 value, uint256 length, uint256 totalLength) internal pure returns (string memory) {
        uint256 localValue = value;
        bytes memory buffer = new bytes(length);
        for (uint256 i = totalLength; i > length; --i) {
            localValue >>= 4;
        }
        for (uint256 i = length; i > 0; --i) {
            buffer[i - 1] = _HEX_DIGITS[localValue & 0xf];
            localValue >>= 4;
        }
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
     */
    function toHexString(address addr, uint256 length) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), length, 40);
    }
}
