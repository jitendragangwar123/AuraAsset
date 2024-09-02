// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDeposit {
    /// @notice Updates investor balances based on the specified amount.
    /// @param _investor The address of the investor whose balances are to be updated.
    /// @param _amount The amount by which to update the investor's balances.
    /// @param isInvest Boolean flag indicating whether the update is for an investment.
    /// @param isRedeem Boolean flag indicating whether the update is for a redeem.
    function updateInvestorBalances(address _investor, uint256 _amount, bool isInvest, bool isRedeem) external;

    /// @notice Updates investor balances based on the target reach on properties.
    /// @param _assetId Unique identifier for the asset
    /// @param _partitionId Identifier for the partition
    /// @param _targetFundsRaised Target funds raised for the partition
    function updateBalanceOnTargetReached(uint256 _assetId, uint256 _partitionId, uint256 _targetFundsRaised)
        external;
}
