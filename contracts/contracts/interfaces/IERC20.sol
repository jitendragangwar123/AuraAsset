// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    /// @notice Returns the total token supply.
    /// @return The total supply of tokens as an unsigned integer.
    function totalSupply() external view returns (uint256);

    /// @notice Returns the account balance of another account with address `account`.
    /// @param account The address for which the balance is to be retrieved.
    /// @return The balance of the specified `account`.
    function balanceOf(address account) external view returns (uint256);

    /// @notice Transfers `value` amount of tokens to address `to`, and returns a boolean value indicating success.
    /// @param to The recipient address to which the tokens will be transferred.
    /// @param value The amount of tokens to be transferred.
    /// @return A boolean value indicating whether the transfer was successful (true) or not (false).
    function transfer(address to, uint256 value) external returns (bool);

    /// @notice Returns the remaining number of tokens that `spender` will be allowed to spend on behalf of `owner`
    /// through `transferFrom`. This is zero by default.
    /// @param owner The address that approves the spending of tokens.
    /// @param spender The address which will spend the tokens.
    /// @return The remaining allowance of tokens for `spender` as an unsigned integer.
    function allowance(address owner, address spender) external view returns (uint256);

    /// @notice Sets `value` as the allowance of `spender` over the caller's tokens.
    /// @param spender The address which will spend the tokens.
    /// @param value The allowance amount to be set.
    /// @return A boolean value indicating whether the approval was successful (true) or not (false).
    function approve(address spender, uint256 value) external returns (bool);

    /// @notice Moves `value` tokens from address `from` to address `to`, and returns a boolean value indicating success.
    /// @param from The sender address from which the tokens will be transferred.
    /// @param to The recipient address to which the tokens will be transferred.
    /// @param value The amount of tokens to be transferred.
    /// @return A boolean value indicating whether the transfer was successful (true) or not (false).
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    /// @notice Emitted when tokens are transferred from one address to another.
    event Transfer(address indexed from, address indexed to, uint256 value);

    /// @notice Emitted when the allowance of a spender for a specific owner is set or decreased.
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
