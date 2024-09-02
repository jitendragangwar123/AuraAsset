// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AppStorage.sol";

interface IAuraAssetView {
    function isAccountKYCVerified(address _investor) external view returns (bool);
    function validateTransfer(address from, address to) external;
}
