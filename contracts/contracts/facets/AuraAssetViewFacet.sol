// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "../interfaces/IERC20AuraAsset.sol";
import "../interfaces/IDeposit.sol";
import "../AssetToken.sol";
import "../AppStorage.sol";

/// @title AuraAssetViewFacet
contract AuraAssetViewFacet is AccessControlUpgradeable, PausableUpgradeable {
    AppStorage internal s;

    // ========================== View Functions ========================== //

    /// @notice Transfer tokens from the caller to a specified recipient
    /// @param from Address of which tokens are being transferred
    /// @param to Address of the recipient to whom tokens are being transferred
    /// @dev Requires both caller and recipient to be KYC verified
    ///      Ensures the caller has sufficient token balance to perform the transfer
    ///      Emits a `Transfer` event upon successful transfer
    function validateTransfer(address from, address to) external view {
        require(from != address(0), "Invalid from address");
        require(to != address(0), "Invalid recipient address");
        require(
            s.isAccountKYCVerified[from],
            "From address is not KYC verified"
        );
        require(
            s.isAccountKYCVerified[to],
            "Receiver address is not KYC verified"
        );
    }

    /**
     * @notice Checks if an investor account is KYC verified.
     * @param _investor The address of the investor account to check.
     * @return A boolean indicating whether the investor account is KYC verified or not.
     */
    function isAccountKYCVerified(
        address _investor
    ) external view returns (bool) {
        return s.isAccountKYCVerified[_investor];
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasAssignedRole(
        bytes32 role,
        address account
    ) public view returns (bool) {
        return hasRole(role, account);
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function isPaused() public view returns (bool) {
        return paused();
    }

    /// @notice Retrieves assetID count
    function assetIdCount() public view returns (uint256) {
        return s.assetIdCount;
    }

    /// @notice Retrieves asset Type count
    function assetTypeCount() public view returns (uint256) {
        return s.assetTypeCount;
    }

    /// @notice Retrieves the owner of a specific asset
    /// @param _assetId The identifier of the asset
    /// @return The address of the owner of the asset
    function getAssetOwner(uint256 _assetId) public view returns (address) {
        return s.assetIdToAsset[_assetId].owner;
    }

    /// @notice Retrieves partitions owned by a specific investor
    /// @param _investor The address of the investor whose partitions are to be retrieved
    /// @return An array of partition identifiers owned by the specified investor
    function getInvestorAssetInfo(
        address _investor
    ) public view returns (InvestorAssetInfo[] memory) {
        return s.investorAssetInfo[_investor];
    }

    /// @notice Retrieves investors of a specific asset partition
    /// @param _assetId The identifier of the asset
    /// @param _partitionId The identifier of the partition within the asset
    /// @return An array of addresses representing investors of the specified asset partition
    function getAssetInvestors(
        uint256 _assetId,
        uint256 _partitionId
    ) public view returns (address[] memory) {
        return s.investors[_assetId][_partitionId];
    }

    /// @notice Retrieves an asset by its identifier
    /// @dev Throws an error if the asset ID does not exist
    /// @param _assetId The identifier of the asset to retrieve
    /// @return The Asset struct corresponding to the given asset ID
    function getAssetById(uint256 _assetId) public view returns (Asset memory) {
        require(_assetId != 0, "Asset does not exist");
        return s.assetIdToAsset[_assetId];
    }

    /// @notice Retrieves the asset type name by its ID
    /// @param _assetTypeId The identifier of the asset type
    /// @return The name of the asset type
    function getAssetType(
        uint256 _assetTypeId
    ) public view returns (string memory) {
        return s.assetTypes[_assetTypeId];
    }

    /// @notice Retrieves all asset types registered in the contract
    /// @return An array of strings representing all asset types
    function getAllAssetTypes() public view returns (string[] memory) {
        string[] memory allTypes = new string[](s.assetTypeCount);
        for (uint256 i = 0; i < s.assetTypeCount; i++) {
            allTypes[i] = s.assetTypes[i + 1];
        }
        return allTypes;
    }

    /// @notice Retrieves the rental yield of a specific asset partition
    /// @param _assetId The identifier of the asset
    /// @param _partitionId The identifier of the partition within the asset
    /// @return The rental yield of the specified asset partition
    function getRentalYieldById(
        uint256 _assetId,
        uint256 _partitionId
    ) public view returns (uint256) {
        Partition memory _partition = s.partition[_assetId][_partitionId];
        return _partition.rentalYield;
    }

    /// @notice Retrieves the target IRR (Internal Rate of Return) of a specific asset partition
    /// @param _assetId The identifier of the asset
    /// @param _partitionId The identifier of the partition within the asset
    /// @return The target IRR of the specified asset partition
    function getIRRById(
        uint256 _assetId,
        uint256 _partitionId
    ) public view returns (uint256) {
        Partition memory _partition = s.partition[_assetId][_partitionId];
        return _partition.targetIRR;
    }

    /// @notice Retrieves the annual appreciation rate of a specific asset partition
    /// @param _assetId The identifier of the asset
    /// @param _partitionId The identifier of the partition within the asset
    /// @return The annual appreciation rate of the specified asset partition
    function getAnnualAppreciationById(
        uint256 _assetId,
        uint256 _partitionId
    ) public view returns (uint256) {
        Partition memory _partition = s.partition[_assetId][_partitionId];
        return _partition.annualAppreciation;
    }

    /// @notice Retrieves the SPV (Special Purpose Vehicle) document associated with an asset partition
    /// @dev Requires the caller to be one of the investors of the asset token
    /// @param assetId The identifier of the asset
    /// @param partitionId The identifier of the partition within the asset
    /// @return The SPV document string associated with the specified asset partition
    function getSPVDocument(
        uint256 assetId,
        uint256 partitionId
    ) public view returns (string memory) {
        address[] memory _investors = s.investors[assetId][partitionId];
        for (uint256 i = 0; i < _investors.length; i++) {
            require(
                msg.sender == _investors[i],
                "Should be an asset token investor"
            );
        }
        return s.spvDocument[assetId][partitionId];
    }

    /// @notice Checks if the target funds goal for a specific asset partition has been fulfilled
    /// @param _assetId The identifier of the asset
    /// @param _partitionId The identifier of the partition within the asset
    /// @return targetFundsFulfilled True if the target funds goal has been reached, targetFunds and totalRaisedFunds
    function checkForTargetFundsFulfilled(
        uint256 _assetId,
        uint256 _partitionId
    )
        public
        view
        returns (
            bool targetFundsFulfilled,
            uint256 targetFunds,
            uint256 totalRaisedFunds
        )
    {
        Partition memory _partition = s.partition[_assetId][_partitionId];
        return (
            _partition.totalRaisedFunds == _partition.targetFunds,
            _partition.targetFunds,
            _partition.totalRaisedFunds
        );
    }
}
