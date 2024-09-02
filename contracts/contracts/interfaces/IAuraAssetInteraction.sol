// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AppStorage.sol";

interface IAuraAssetInteraction {
    // ========================== Events ========================== //
    /// @dev Emitted when tokens are distributed for claiming
    /// @param assetId Unique identifier for the asset
    /// @param partitionId Identifier for the partition
    /// @param assetToken Address of the asset token
    /// @param investor Address of the investor
    /// @param getHolderClaimableAmount Amount claimable by the investor
    event TokenDistributedForClaiming(
        uint256 assetId, uint256 partitionId, address assetToken, address investor, uint256 getHolderClaimableAmount
    );

    /// @dev Emitted when tokens are transferred
    /// @param assetId Unique identifier for the asset
    /// @param partitionId Identifier for the partition
    /// @param from Address of the sender
    /// @param to Address of the recipient
    /// @param amount Amount of tokens transferred
    event Transfer(uint256 assetId, uint256 partitionId, address from, address to, uint256 amount);

    /// @dev Emitted when tokens are sold
    /// @param assetId Unique identifier for the asset
    /// @param partitionId Identifier for the partition
    /// @param investor Address of the investor
    /// @param amount Amount of tokens sold
    event RedeemToken(uint256 assetId, uint256 partitionId, address investor, uint256 amount);

    /// @dev Emitted when investor invest
    /// @param investor Address of the investor
    /// @param assetId Unique identifier for the asset
    /// @param partitionId Identifier for the partition
    /// @param amount Amount of money to invest by the investor
    event Invest(address investor, uint256 assetId, uint256 partitionId, uint256 amount);

    /// @dev Emitted when an asset is claimed
    /// @param assetId Unique identifier for the asset
    /// @param partitionId Identifier for the partition
    /// @param receiver Address of the receiver
    /// @param amount Amount of the asset claimed
    event AssetClaimed(uint256 assetId, uint256 partitionId, address receiver, uint256 amount);

    // ========================== Functions ========================== //
    // function isAccountKYCVerified(address _investor) external view returns (bool);
    // function validateTransfer(address from, address to) external;
    function updateInvestorAssetInfoOnTransfer(address from, address to, uint256 value) external;
}
