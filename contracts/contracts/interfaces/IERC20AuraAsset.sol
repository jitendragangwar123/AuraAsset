// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20AuraAsset {
    /// @notice Transfers assets from one address to another.
    /// @param from The address from which the assets are transferred.
    /// @param to The address to which the assets are transferred.
    /// @param value The amount of assets to transfer.
    /// @return A boolean value indicating whether the transfer was successful (true) or not (false).
    function transferOfAssets(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}
