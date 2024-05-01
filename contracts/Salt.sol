// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibClone} from "./LibClone.sol";

contract Salt {
    using LibClone for address;

    address constant WELL_DEPLOYER = 0x7eaE23DD0f0d8289d38653BCE11b92F7807eFB64; // TODO: Set
    address constant AQUIFER = 0xBA51AAAA95aeEFc1292515b36D86C51dC7877773;
    address constant WELL_IMPLEMENTATION = 0xBA510e11eEb387fad877812108a3406CA3f43a4B;
    bytes INIT_DATA =
        hex"ba51aaaa95aeefc1292515b36d86c51dc78777730000000000000000000000000000000000000000000000000000000000000002ba510c20fd2c52e4cb0d23cfc3ccd092f9165a6e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bea0000029ad1c77d3d5d23ba2d8893db9d1efab000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2ba510f10e3095b83a0f33aa9ad2544e22570a87c0000000000000000000000000000000000000000000000000000000000000000";

    string constant targetPrefix = "ba510";
    uint256 CHARACTERS = 5;

    uint256 attemptsPerRun;

    constructor(uint256 _attemptsPerRun) {
        attemptsPerRun = _attemptsPerRun;
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
        bytes memory initData = INIT_DATA;
        address well = predictWellAddress(AQUIFER, WELL_DEPLOYER, WELL_IMPLEMENTATION, initData, salt);
        string memory wellString = toHexString(well, CHARACTERS);

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
