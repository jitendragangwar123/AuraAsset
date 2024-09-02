// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
/// @dev Structure to store asset details

struct Asset {
    uint256 assetId; // unique identifier for the asset
    uint256 assetTypeId; // asset type identifier
    uint256 totalValue; // total value of the asset in USD
    address owner; // owner of the asset
    string name; // name of the asset
    string location; // location of the asset
    Partition[] partitions; // partitions of the asset
}

/// @dev Structure to store partition details
struct Partition {
    uint256 assetId;
    uint256 partitionId;
    uint256 totalSupply; // maxSupply
    uint256 totalValue; // partition total value
    uint256 tokenPrice; // partition token price
    uint256 rentalYield; // Given by Credora
    uint256 targetIRR; // Given by Credora
    uint256 annualAppreciation; // Given by Credora
    uint256 totalRaisedFunds; // Set by asset manager
    uint256 targetFunds; // Set by asset manager
    address partitionTokenAddress; // partition token contract address
    string partitionName;
    address[] investors;
}

struct PartitionDescription {
    uint256 totalValue; // partition total value
    uint256 tokenPrice; // partition token price
    uint256 rentalYield; // Given by Credora
    uint256 targetIRR; // Given by Credora
    uint256 annualAppreciation; // Given by Credora
    uint256 targetFunds; // Set by asset manager
    string partitionName;
}

/// @dev Structure to store asset details
struct AssetDescription {
    uint256 assetTypeId; // asset type identifier
    uint256 totalValue; // total value of the asset in USD
    address owner; // owner of the asset
    string name; // name of the asset
    string location; // location of the asset
}

struct InvestorAssetInfo {
    uint256 assetId;
    uint256 partitionId;
    uint256 amountInvested;
    uint256 sharePercentages;
    address partitionTokenAddress;
    uint256 availablePropertTokenAmount;
    uint256 propertyTokenAmountRedeemed;
}

enum Action {
    isInvest,
    isClaim,
    isTransfer,
    isReceive,
    isRedeem
}

bytes32 constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 constant ASSET_MANAGER_ROLE = keccak256("ASSET_MANAGER_ROLE");

struct AppStorage {
    // counter for asset type IDs like residential, commercial etc.
    uint256 assetTypeCount;
    // counter for asset IDs
    uint256 assetIdCount;
    // address of the deposit contract
    address depositContract;
    // Mapping to store asset ownership, basically partition ownership
    mapping(address => InvestorAssetInfo[]) investorAssetInfo;
    // Mapping to store investors of partitions
    mapping(uint256 => mapping(uint256 => address[])) investors;
    // Mapping to store userAssetShares[investor][assetId][partitionId] in percentage
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) userAssetShares;
    // Mapping to store assetClaimableAmount[investor][assetId][partitionId]
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) assetClaimableAmount;
    // Mapping to store assetTypeID => name
    mapping(uint256 => string) assetTypes;
    // Mapping to store isKYCVerified[investor][bool]
    mapping(address => bool) isAccountKYCVerified;
    // Mapping to store partitionId => assetId
    mapping(uint256 => uint256) isPartitionOf;
    // Mapping to store assetId => Asset
    mapping(uint256 => Asset) assetIdToAsset;
    // Mapping to store assetId => partitionId => Partition
    mapping(uint256 => mapping(uint256 => Partition)) partition;
    // Mapping to store assetId => partitionId => SPV document
    mapping(uint256 => mapping(uint256 => string)) spvDocument;
    // Mapping to store assetId => partitionId => AssetToken
    mapping(uint256 => mapping(uint256 => address)) assetToken;
    // Mapping to store assetToken => Partiton
    mapping(address => Partition) assetTokenToPartiton;
}
