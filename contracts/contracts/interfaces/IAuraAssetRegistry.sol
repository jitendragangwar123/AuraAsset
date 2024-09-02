// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AppStorage.sol";

interface IAuraAssetRegistry {
    // ========================== Events ========================== //

    /// @dev Emitted when a new asset type is added
    /// @param assetTypeId Unique identifier for the asset type
    /// @param name Name of the asset type
    event AssetTypeAdded(uint256 assetTypeId, string name);

    /// @dev Emitted when an asset is removed
    /// @param assetId Unique identifier for the asset
    event AssetRemoved(uint256 assetId);

    /// @dev Emitted when an asset type is removed
    /// @param assetTypeId Unique identifier for the asset type
    event AssetTypeRemoved(uint256 assetTypeId);

    /// @dev Emitted when a new asset token is created
    /// @param tokenAddress Address of the new asset token
    /// @param owner Address of the owner of the asset token
    event AssetTokenCreated(address indexed tokenAddress, address indexed owner);

    /// @dev Emitted when a new asset is added
    /// @param assetId Unique identifier for the asset
    /// @param name Name of the asset
    /// @param assetTypeId Identifier for the asset type
    /// @param owner Address of the owner of the asset
    /// @param partitions Partitions of the asset
    event AssetAdded(uint256 assetId, string name, uint256 assetTypeId, address owner, Partition[] partitions);

    // /// @dev Emitted when an asset is claimed
    // /// @param assetId Unique identifier for the asset
    // /// @param partitionId Identifier for the partition
    // /// @param receiver Address of the receiver
    // /// @param amount Amount of the asset claimed
    // event AssetClaimed(uint256 assetId, uint256 partitionId, address receiver, uint256 amount);

    // /// @dev Emitted when tokens are distributed for claiming
    // /// @param assetId Unique identifier for the asset
    // /// @param partitionId Identifier for the partition
    // /// @param assetToken Address of the asset token
    // /// @param investor Address of the investor
    // /// @param getHolderClaimableAmount Amount claimable by the investor
    // event TokenDistributedForClaiming(
    //     uint256 assetId, uint256 partitionId, address assetToken, address investor, uint256 getHolderClaimableAmount
    // );

    // /// @dev Emitted when tokens are transferred
    // /// @param assetId Unique identifier for the asset
    // /// @param partitionId Identifier for the partition
    // /// @param from Address of the sender
    // /// @param to Address of the recipient
    // /// @param amount Amount of tokens transferred
    // event Transfer(uint256 assetId, uint256 partitionId, address from, address to, uint256 amount);

    // /// @dev Emitted when tokens are sold
    // /// @param assetId Unique identifier for the asset
    // /// @param partitionId Identifier for the partition
    // /// @param investor Address of the investor
    // /// @param amount Amount of tokens sold
    // event RedeemToken(uint256 assetId, uint256 partitionId, address investor, uint256 amount);

    // /// @dev Emitted when investor invest
    // /// @param investor Address of the investor
    // /// @param assetId Unique identifier for the asset
    // /// @param partitionId Identifier for the partition
    // /// @param amount Amount of money to invest by the investor
    // event Invest(address investor, uint256 assetId, uint256 partitionId, uint256 amount);
}
