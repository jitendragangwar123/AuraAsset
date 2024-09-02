// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "../interfaces/IAuraAssetRegistry.sol";
import "../AssetToken.sol";

/// @title AuraAssetRegistryFacet
/// @dev Central registry and management hub for asset types and descriptions
contract AuraAssetRegistryFacet is
    IAuraAssetRegistry,
    AccessControlUpgradeable
{
    AppStorage internal s;

    // ========================== Modifiers ========================== //

    /// @dev Modifier to restrict access to only admin roles
    modifier onlyAdmin() {
        LibDiamond.enforceIsContractOwner();
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Caller doesn't have ADMIN role"
        );
        _;
    }

    /// @dev Modifier to restrict access to only asset manager roles
    modifier onlyAssetManager() {
        require(
            hasRole(ASSET_MANAGER_ROLE, msg.sender),
            "Caller is not an Asset Manager"
        );
        _;
    }

    // ========================== Public Functions ========================== //

    /// @notice Set the deposit contract address
    /// @param _depositContract Address of the deposit contract
    function setDepositContract(address _depositContract) public onlyAdmin {
        s.depositContract = _depositContract;
    }

    /// @notice Set KYC verification status for investors
    /// @param _investors Array of investor addresses
    /// @param _status KYC status (true or false)
    function setKYCStatus(
        address[] memory _investors,
        bool[] memory _status
    ) public onlyAssetManager {
        require(
            _investors.length == _status.length,
            "accounts and status array should have equal length"
        );
        for (uint256 i = 0; i < _investors.length; i++) {
            s.isAccountKYCVerified[_investors[i]] = _status[i];
        }
    }

    /// @notice Set SPV document for a partition
    /// @param assetId Unique identifier for the asset
    /// @param partitionId Identifier for the partition
    /// @param _spvDocument SPV document
    function setSPVDocument(
        uint256 assetId,
        uint256 partitionId,
        string memory _spvDocument
    ) public onlyAssetManager {
        s.spvDocument[assetId][partitionId] = _spvDocument;
    }

    /// @notice Set a role admin for a role
    /// @param role Role identifier
    /// @param adminRole Admin role
    function setRoleAdmin(
        bytes32 role,
        bytes32 adminRole
    ) public virtual onlyAdmin {
        super._setRoleAdmin(role, adminRole);
    }

    /// @notice Grant a role to an account
    /// @param role Role identifier
    /// @param account Address of the account
    function grantRole(
        bytes32 role,
        address account
    ) public override onlyAdmin {
        super.grantRole(role, account);
    }

    /// @notice Revoke a role from an account
    /// @param role Role identifier
    /// @param account Address of the account
    function revokeRole(
        bytes32 role,
        address account
    ) public override onlyAdmin {
        super.revokeRole(role, account);
    }

    /// @notice Renounce a role
    /// @param role Role identifier
    /// @param account Address of the account
    function renounceRole(
        bytes32 role,
        address account
    ) public override onlyAdmin {
        super.renounceRole(role, account);
    }

    /// @notice Add a new asset type
    /// @param name Name of the asset type
    function addAssetType(string memory name) public onlyAssetManager {
        _addAssetType(name);
    }

    /// @notice Remove an asset type
    /// @param _assetTypeId Unique identifier for the asset type
    function removeAssetType(uint256 _assetTypeId) public onlyAssetManager {
        require(
            _assetTypeId != 0 && bytes(s.assetTypes[_assetTypeId]).length != 0,
            "Asset type does not exist"
        );

        // Decrease assetTypeCount and delete the asset type
        s.assetTypeCount--;
        delete s.assetTypes[_assetTypeId];

        emit AssetTypeRemoved(_assetTypeId);
    }

    // ========================== External Functions ========================== //

    /// @notice Add a new asset with its partitions and default asset managers
    /// @dev Only accessible by accounts with the ASSET_MANAGER_ROLE
    /// @param _assetDescription Struct containing details of the asset to be added
    /// @param _partitionDescription Array of structs describing partitions of the asset
    /// @param _defaultAssetManagers Array of addresses representing default asset managers for the asset
    function addAsset(
        AssetDescription calldata _assetDescription,
        PartitionDescription[] calldata _partitionDescription,
        address[] calldata _defaultAssetManagers
    ) external onlyAssetManager returns (Asset memory) {
        return
            _addAsset(
                _assetDescription,
                _partitionDescription,
                _defaultAssetManagers
            );
    }

    /// @notice Remove an asset from the registry
    /// @dev Only accessible by accounts with the ADMIN_ROLE
    /// @param _assetId Identifier of the asset to be removed
    function removeAsset(uint256 _assetId) external onlyAdmin {
        _removeAsset(_assetId);
    }

    // ========================== Internal Functions ========================== //

    /// @notice Deploy a new AssetToken contract
    /// @dev Internal function to create a new AssetToken contract instance
    /// @param _assetId Unique identifier for the asset
    /// @param _partitionId Identifier for the partition
    /// @param _partitionName Name of the partition
    /// @param _partitionSymbol Symbol of the partition
    /// @param _totalValue Total value of the tokens
    /// @param _maxSupply Maximum supply of tokens
    /// @param _defaultAssetManagers Addresses of the default asset managers
    /// @return Address of the newly deployed AssetToken contract
    function _createAssetToken(
        uint256 _assetId,
        uint256 _partitionId,
        string memory _partitionName,
        string memory _partitionSymbol,
        uint256 _totalValue,
        uint256 _maxSupply,
        address[] memory _defaultAssetManagers
    ) internal returns (address) {
        // Deploy a new AssetToken contract instance
        AssetToken _assetToken = new AssetToken(
            _assetId,
            _partitionId,
            _partitionName,
            _partitionSymbol,
            _totalValue,
            _maxSupply,
            _defaultAssetManagers
        );

        // Emit an event to log the creation of the AssetToken contract
        emit AssetTokenCreated(address(_assetToken), _defaultAssetManagers[0]);

        // Return the address of the newly deployed AssetToken contract
        return address(_assetToken);
    }

    /// @notice Internal function to add a new asset type.
    /// @dev Increments assetTypeCount, assigns the provided name to the next index, and emits an event.
    /// @param _name The name of the asset type to be added.
    function _addAssetType(string memory _name) internal {
        // Increment assetTypeCount to get a new index
        s.assetTypeCount++;
        // Store the new asset type with the incremented index
        s.assetTypes[s.assetTypeCount] = _name;
        // Emit an event to log the addition of the new asset type
        emit AssetTypeAdded(s.assetTypeCount, _name);
    }

    /// @notice Internal function to add a new asset.
    /// @dev Validates the asset type ID, creates asset partition tokens, and updates asset details.
    /// @param _assetDescription Details of the asset being added.
    /// @param _partitionDescription Descriptions of partitions for the asset.
    /// @param _defaultAssetManagers Addresses of default asset managers for the asset.
    function _addAsset(
        AssetDescription calldata _assetDescription,
        PartitionDescription[] memory _partitionDescription,
        address[] calldata _defaultAssetManagers
    ) internal returns (Asset memory) {
        // Validate asset type ID
        require(
            _assetDescription.assetTypeId != 0 &&
                bytes(s.assetTypes[_assetDescription.assetTypeId]).length != 0,
            "Invalid asset type ID"
        );

        // Generate new asset ID
        // uint256 _assetId = assets.length + 1;
        s.assetIdCount += 1;
        uint256 _assetId = s.assetIdCount;
        uint256 _assetTotalValue;

        // Initialize asset and partition arrays
        Asset storage _asset = s.assetIdToAsset[_assetId];
        Partition[] storage _partitions = _asset.partitions;

        // Loop through each partition description provided
        for (uint256 i = 0; i < _partitionDescription.length; i++) {
            // Calculate total supply of tokens for the partition
            uint256 _totalSupply = (_partitionDescription[i].totalValue *
                10 ** 18) / _partitionDescription[i].tokenPrice;
            uint256 _partitionId = i + 1;

            // Deploy asset partition token contract
            address _assetToken = _createAssetToken(
                _assetId,
                _partitionId,
                _partitionDescription[i].partitionName,
                _partitionDescription[i].partitionName,
                _partitionDescription[i].totalValue,
                _totalSupply,
                _defaultAssetManagers
            );

            s.assetToken[_assetId][_partitionId] = _assetToken;
            address[] memory _investors;

            // Store partition details in storage arrays
            _partitions.push(
                Partition({
                    assetId: _assetId,
                    partitionId: _partitionId,
                    totalSupply: _totalSupply,
                    totalValue: _partitionDescription[i].totalValue,
                    tokenPrice: _partitionDescription[i].tokenPrice,
                    rentalYield: _partitionDescription[i].rentalYield,
                    targetIRR: _partitionDescription[i].targetIRR,
                    annualAppreciation: _partitionDescription[i]
                        .annualAppreciation,
                    totalRaisedFunds: 0,
                    targetFunds: _partitionDescription[i].targetFunds,
                    partitionTokenAddress: _assetToken,
                    partitionName: _partitionDescription[i].partitionName,
                    investors: _investors
                })
            );

            // Update mappings and arrays related to partitions and investors
            s.partition[_assetId][_partitionId] = _partitions[i];
            s.isPartitionOf[_partitionId] = _assetId;
            s.assetTokenToPartiton[_assetToken] = _partitions[i];
        }

        // Calculate total value of the asset from its partitions
        for (uint256 i = 0; i < _partitionDescription.length; i++) {
            _assetTotalValue += _partitionDescription[i].totalValue;
        }

        // Validate total asset value
        require(
            _assetTotalValue == _assetDescription.totalValue,
            "Invalid asset total value"
        );

        // Create new Asset object and store it in mappings and arrays
        Asset memory _newAsset = Asset({
            assetId: _assetId,
            assetTypeId: _assetDescription.assetTypeId,
            owner: _assetDescription.owner,
            name: _assetDescription.name,
            location: _assetDescription.location,
            totalValue: _assetTotalValue,
            partitions: _partitions
        });
        s.assetIdToAsset[_assetId] = _newAsset;
        // assets.push(_newAsset);

        // Emit event to log the addition of the new asset
        emit AssetAdded(
            _assetId,
            _assetDescription.name,
            _assetDescription.assetTypeId,
            _assetDescription.owner,
            _partitions
        );
        return _newAsset;
    }

    /// @notice Internal function to remove an asset by its ID.
    /// @dev Removes the asset from the `assets` array, including all related partitions and mappings.
    /// @param _assetId The unique identifier of the asset to be removed.
    function _removeAsset(uint256 _assetId) internal {
        // Check if the asset ID exists
        require(_assetId != 0, "Asset does not exist");
        uint256 partitionsLength = s.assetIdToAsset[_assetId].partitions.length;
        for (uint256 i = 0; i < partitionsLength; i++) {
            // Retrieve partition and investors information
            Partition memory _partition = s.assetIdToAsset[_assetId].partitions[
                i
            ];
            address[] memory _investors = s.investors[_assetId][
                _partition.partitionId
            ];

            require(_investors.length == 0, "Already investors exist");
            delete s.assetToken[_assetId][_partition.partitionId];
            delete s.spvDocument[_assetId][_partition.partitionId];
            delete s.partition[_assetId][_partition.partitionId];
            delete s.isPartitionOf[_partition.partitionId];
            delete s.investors[_assetId][_partition.partitionId];
            delete s.assetIdToAsset[_assetId];
        }

        s.assetIdCount -= 1;

        // Emit event to log the removal of the asset
        emit AssetRemoved(_assetId);
    }
}
