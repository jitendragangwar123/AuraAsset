// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "../interfaces/IAuraAssetInteraction.sol";
import "../interfaces/IERC20AuraAsset.sol";
import "../interfaces/IDeposit.sol";
import {Action} from "../AppStorage.sol";

/// @title AuraAssetInteractionFacet
contract AuraAssetInteractionFacet is
    IAuraAssetInteraction,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    AppStorage internal s;

    // ========================== Modifier ========================== //
    /// @dev Modifier to restrict access to only admin roles
    modifier onlyAdmin() {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    // ========================== External Functions ========================== //

    /* @notice Pauses the contract, preventing certain functions from being executed.
     * @dev This function can only be called by an admin.
     * Emits a {Paused} event indicating the contract is paused.
     * Requirements:
     * - The caller must be an admin.
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @notice Unpauses the contract, allowing certain functions to be executed again.
     * @dev This function can only be called by an admin.
     * Emits a {Unpaused} event indicating the contract is unpaused.
     * Requirements:
     * - The caller must be an admin.
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /// @notice Invest funds into a specific asset partition
    /// @param _assetId Identifier of the asset to invest in
    /// @param _partitionId Identifier of the partition within the asset
    /// @param _amount Amount of funds to invest, in wei
    /// @dev Requires the investor to be KYC verified and ensures the partition's target funds have been set.
    ///      Updates the total raised funds for the partition, updates investor balances via IDeposit interface,
    ///      and calculates and updates the investor's asset shares based on the invested amount.
    function invest(
        uint256 _assetId,
        uint256 _partitionId,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(_assetId != 0, "Asset does not exist");
        require(
            s.isAccountKYCVerified[msg.sender],
            "Not KYC verified investor"
        );

        Partition storage _partition = s.partition[_assetId][_partitionId];
        require(_partition.targetFunds > 0, "Target goal has not been set yet");
        require(
            _amount <= (_partition.targetFunds - _partition.totalRaisedFunds),
            "Invested amount > Required amount"
        );

        // Update investor balances via IDeposit interface
        IDeposit(s.depositContract).updateInvestorBalances(
            msg.sender,
            _amount,
            true,
            false
        );

        // Update partition funds
        _partition.totalRaisedFunds += _amount;

        // Update investor asset shares
        uint256 _addUserAssetShares = (_amount * 1e6) / _partition.targetFunds;
        s.userAssetShares[msg.sender][_assetId][
            _partitionId
        ] += _addUserAssetShares;

        // Update partition investors list
        if (!_isAddressInArray(_partition.investors, msg.sender)) {
            _partition.investors.push(msg.sender);
        }

        // Update global investors list
        if (
            !_isAddressInArray(s.investors[_assetId][_partitionId], msg.sender)
        ) {
            s.investors[_assetId][_partitionId].push(msg.sender);
        }

        // Update investor asset info
        _updateInvestorAssetInfo(
            msg.sender,
            _assetId,
            _partitionId,
            _amount,
            _addUserAssetShares,
            0,
            0,
            Action.isInvest
        );

        // Update asset partitions
        _updateAssetPartitions(_assetId, _partition);

        // Handle token distribution if target funds met
        if (_partition.totalRaisedFunds == _partition.targetFunds) {
            _tokenDistributionForClaiming(_assetId, _partitionId);
            IDeposit(s.depositContract).updateBalanceOnTargetReached(
                _assetId,
                _partitionId,
                _partition.totalRaisedFunds
            );
        }

        emit Invest(msg.sender, _assetId, _partitionId, _amount);
    }

    /// @notice Claim asset tokens from a specific asset partition
    /// @param _assetId Identifier of the asset from which tokens are being claimed
    /// @param _partitionId Identifier of the partition within the asset
    /// @dev Transfers claimable asset tokens to the caller if they have claimable tokens available.
    ///      Emits an `AssetClaimed` event upon successful transfer.
    function claimAssetTokens(
        uint256 _assetId,
        uint256 _partitionId
    ) external nonReentrant whenNotPaused {
        // uint256 _amountInvested;
        address _assetToken = s.assetToken[_assetId][_partitionId];
        uint256 _getHolderClaimableAmount = s.assetClaimableAmount[msg.sender][
            _assetId
        ][_partitionId];
        require(
            _getHolderClaimableAmount > 0,
            "Either Already Claimed or Not eligible or Wait for the target fund goals to be reached"
        );
        // Transfer the claimable asset tokens to the caller
        bool success = IERC20AuraAsset(_assetToken).transferOfAssets(
            address(this),
            msg.sender,
            _getHolderClaimableAmount
        );
        require(success, "Transfer of assets failed");
        s.assetClaimableAmount[msg.sender][_assetId][_partitionId] = 0;
        // userAssetShares[msg.sender][_assetId][_partitionId] = 0;
        // InvestorAssetInfo[] storage _investorAssetInfoArray = s.investorAssetInfo[msg.sender];
        // uint256 _investorAssetInfoLength = _investorAssetInfoArray.length;
        // for (uint256 i = 0; i < _investorAssetInfoLength; i++) {
        //     if (
        //         _investorAssetInfoArray[i].assetId == _assetId && _investorAssetInfoArray[i].partitionId == _partitionId
        //     ) {
        //         _amountInvested = _investorAssetInfoArray[i].amountInvested;
        //     }
        // }
        uint256 balanceOfInvestor = IERC20(_assetToken).balanceOf(msg.sender);
        // uint256 _userAssetShares = userAssetShares[msg.sender][_assetId][_partitionId];

        _updateInvestorAssetInfo(
            msg.sender,
            _assetId,
            _partitionId,
            0,
            0,
            balanceOfInvestor,
            0,
            Action.isClaim
        );

        emit Transfer(
            _assetId,
            _partitionId,
            address(this),
            msg.sender,
            _getHolderClaimableAmount
        );
        emit AssetClaimed(
            _assetId,
            _partitionId,
            msg.sender,
            _getHolderClaimableAmount
        );
    }

    /**
     * @notice Redeem tokens from the caller's balance of a specified asset partition.
     * @param assetId Identifier of the asset from which tokens are being redeemed.
     * @param partitionId Identifier of the partition within the asset from which tokens are being redeemed.
     * @param amount Amount of tokens to redeem.
     * @dev Requires the caller to be KYC verified.
     *      Ensures the caller has sufficient token balance to perform the redemption.
     *      Updates investor balances through the `updateInvestorBalances` function.
     * Emits a `RedeemToken` event upon successful token redemption.
     */
    function redeem(
        uint256 assetId,
        uint256 partitionId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(
            s.isAccountKYCVerified[msg.sender],
            "Caller is not KYC verified"
        );

        Partition storage _partition = s.partition[assetId][partitionId];
        address _assetToken = _partition.partitionTokenAddress;

        require(_assetToken != address(0), "Asset doesn't exist");
        uint256 _tokenBalance = IERC20(_assetToken).balanceOf(msg.sender);
        require(_tokenBalance >= amount, "Insufficient property token balance");
        IERC20(_assetToken).transferFrom(msg.sender, address(this), amount);

        // @note - Do we need to burn or to get back tokens from investors and return their funds ?
        // IERC20AuraAsset(_assetToken).burn(msg.sender, amount); // Example burn function call

        // @note - updateAmountForWithdraw = amount, only if token to USDC ratio 1:1, otherwise need to calculate the rate
        // Need to implement the functionalities.
        // uint256 factor = 10 ** 12;
        uint256 updateAmountForWithdraw = amount;

        // Update investor asset shares
        uint256 _totalSupply = IERC20(_assetToken).totalSupply();
        uint256 _userAssetShares = (amount * 1e6) / _totalSupply;
        require(
            s.userAssetShares[msg.sender][_partition.assetId][
                _partition.partitionId
            ] > 0,
            "Investor doesn't have any shares"
        );
        s.userAssetShares[msg.sender][_partition.assetId][
            _partition.partitionId
        ] -= _userAssetShares;

        if (
            s.userAssetShares[msg.sender][_partition.assetId][
                _partition.partitionId
            ] == 0
        ) {
            uint256 _investorsLength = _partition.investors.length;
            for (uint256 i = 0; i < _investorsLength; i++) {
                if (_partition.investors[i] == msg.sender) {
                    _partition.investors[i] = _partition.investors[
                        _investorsLength - 1
                    ];
                    _partition.investors.pop();
                    break;
                }
            }
        }
        uint256 _availableTokenBalance = IERC20(_assetToken).balanceOf(
            msg.sender
        );
        // Update investor asset info
        _updateInvestorAssetInfo(
            msg.sender,
            _partition.assetId,
            _partition.partitionId,
            updateAmountForWithdraw,
            _userAssetShares,
            _availableTokenBalance,
            amount,
            Action.isRedeem
        );

        // Update asset partitions
        _updateAssetPartitions(_partition.assetId, _partition);

        // Update investor balances accordingly
        uint256 _amountToUpdate = (amount * _partition.tokenPrice) / 10 ** 18;
        IDeposit(s.depositContract).updateInvestorBalances(
            msg.sender,
            _amountToUpdate,
            false,
            true
        );

        emit RedeemToken(assetId, partitionId, msg.sender, amount);
    }

    function updateInvestorAssetInfoOnTransfer(
        address from,
        address to,
        uint256 value
    ) external nonReentrant {
        // Update investor balances via IDeposit interface
        // uint256 value = amount / 10 ** 12;
        require(
            to != address(this),
            "To address shouldn't be AuraAssetRegistry address"
        );

        Partition storage _partition = s.assetTokenToPartiton[msg.sender]; // msg.sender is partitionToken
        require(
            _partition.assetId != 0 && _partition.partitionId != 0,
            "Invalid parttion"
        );
        require(_partition.targetFunds != 0, "Invalid partition target goals");

        // Update investor asset shares
        uint256 _totalSupply = IERC20(msg.sender).totalSupply();

        uint256 _userAssetShares = (value * 1e6) / _totalSupply;
        require(
            s.userAssetShares[from][_partition.assetId][
                _partition.partitionId
            ] > 0,
            "Investor doesn't have any shares"
        );
        s.userAssetShares[from][_partition.assetId][
            _partition.partitionId
        ] -= _userAssetShares;
        s.userAssetShares[to][_partition.assetId][
            _partition.partitionId
        ] += _userAssetShares;

        if (
            s.userAssetShares[from][_partition.assetId][
                _partition.partitionId
            ] == 0
        ) {
            uint256 _investorsLength = _partition.investors.length;
            for (uint256 i = 0; i < _investorsLength; i++) {
                if (_partition.investors[i] == from) {
                    _partition.investors[i] = _partition.investors[
                        _investorsLength - 1
                    ];
                    _partition.investors.pop();
                    break;
                }
            }
        }

        // Update partition investors list
        if (!_isAddressInArray(_partition.investors, to)) {
            _partition.investors.push(to);
        }

        // Update global investors list
        if (
            !_isAddressInArray(
                s.investors[_partition.assetId][_partition.partitionId],
                to
            )
        ) {
            s.investors[_partition.assetId][_partition.partitionId].push(to);
        }
        uint256 _assetBalanceFrom = IERC20(msg.sender).balanceOf(from);

        require(value <= _assetBalanceFrom, "Not enough asset token balance");

        // Update investor asset info
        _updateInvestorAssetInfo(
            from,
            _partition.assetId,
            _partition.partitionId,
            value,
            _userAssetShares,
            IERC20(msg.sender).balanceOf(from) - value,
            0,
            Action.isTransfer
        );
        _updateInvestorAssetInfo(
            to,
            _partition.assetId,
            _partition.partitionId,
            value,
            _userAssetShares,
            value,
            0,
            Action.isReceive
        );
        // console.log("10");

        // Update asset partitions
        _updateAssetPartitions(_partition.assetId, _partition);
        uint256 balanceToBeUpdated = (value * _partition.totalValue) /
            _totalSupply;

        IDeposit(s.depositContract).updateInvestorBalances(
            from,
            balanceToBeUpdated,
            false,
            false
        );
    }

    // ========================== Internal Functions ========================== //

    function _updateInvestorAssetInfo(
        address _investor,
        uint256 _assetId,
        uint256 _partitionId,
        uint256 _amount,
        uint256 _addUserAssetShares,
        uint256 _availablePropertTokenAmount,
        uint256 _propertyTokenAmountRedeemed,
        Action _action
    ) internal {
        InvestorAssetInfo[] storage _investorAssetInfoArray = s
            .investorAssetInfo[_investor];
        Partition storage _partition = s.partition[_assetId][_partitionId];
        bool _assetUpdated = false;
        uint256 _investorAssetInfoArrayLength = _investorAssetInfoArray.length;

        for (uint256 i = 0; i < _investorAssetInfoArrayLength; i++) {
            InvestorAssetInfo storage _info = _investorAssetInfoArray[i];
            if (
                _info.assetId == _assetId && _info.partitionId == _partitionId
            ) {
                if (_action == Action.isInvest) {
                    _info.amountInvested += _amount;
                    _info.sharePercentages += _addUserAssetShares;
                    _assetUpdated = true;
                    break;
                } else if (_action == Action.isRedeem) {
                    if (_info.amountInvested != 0) {
                        _info.amountInvested -=
                            (_amount * _partition.tokenPrice) /
                            10 ** 18;
                    }
                    _info.sharePercentages -= _addUserAssetShares;
                    _info
                        .availablePropertTokenAmount = _availablePropertTokenAmount;
                    _info
                        .propertyTokenAmountRedeemed += _propertyTokenAmountRedeemed;
                    _assetUpdated = true;
                    break;
                } else if (_action == Action.isTransfer) {
                    _info.amountInvested -=
                        (_amount * _partition.tokenPrice) /
                        10 ** 18;
                    _info.sharePercentages -= _addUserAssetShares;
                    _info
                        .availablePropertTokenAmount = _availablePropertTokenAmount;
                    _assetUpdated = true;
                    break;
                } else if (_action == Action.isClaim) {
                    _info
                        .availablePropertTokenAmount += _availablePropertTokenAmount;
                    _assetUpdated = true;
                    break;
                } else {
                    _info.sharePercentages += _addUserAssetShares;
                    _info
                        .availablePropertTokenAmount += _availablePropertTokenAmount;
                    _assetUpdated = true;
                    break;
                }
            }
        }

        for (uint256 i = 0; i < _investorAssetInfoArrayLength; i++) {
            InvestorAssetInfo storage _info = _investorAssetInfoArray[i];
            if (_info.sharePercentages == 0) {
                _investorAssetInfoArray[i] = _investorAssetInfoArray[
                    _investorAssetInfoArrayLength - 1
                ];
                _investorAssetInfoArray.pop();
                break;
            }
        }

        if (
            s.userAssetShares[_investor][_partition.assetId][
                _partition.partitionId
            ] == 0
        ) {
            uint256 _investorsLength = _partition.investors.length;
            for (uint256 i = 0; i < _investorsLength; i++) {
                if (_partition.investors[i] == _investor) {
                    _partition.investors[i] = _partition.investors[
                        _investorsLength - 1
                    ];
                    _partition.investors.pop();
                    break;
                }
            }
            uint256 _investorsArrayLength = s
            .investors[_partition.assetId][_partition.partitionId].length;
            for (uint256 i = 0; i < _investorsArrayLength; i++) {
                if (
                    s.investors[_partition.assetId][_partition.partitionId][
                        i
                    ] == _investor
                ) {
                    s.investors[_partition.assetId][_partition.partitionId][
                        i
                    ] = s.investors[_partition.assetId][_partition.partitionId][
                        _investorsArrayLength - 1
                    ];
                    s
                    .investors[_partition.assetId][_partition.partitionId]
                        .pop();
                    break;
                }
            }
        }

        // new investor
        if (!_assetUpdated) {
            if (_action == Action.isReceive) {
                _amount = 0;
            }
            InvestorAssetInfo memory _newInfo = InvestorAssetInfo({
                assetId: _assetId,
                partitionId: _partitionId,
                amountInvested: _amount,
                sharePercentages: s.userAssetShares[_investor][_assetId][
                    _partitionId
                ],
                partitionTokenAddress: s.assetToken[_assetId][_partitionId],
                availablePropertTokenAmount: _availablePropertTokenAmount,
                propertyTokenAmountRedeemed: 0
            });
            s.investorAssetInfo[_investor].push(_newInfo);
        }
    }

    function _updateAssetPartitions(
        uint256 _assetId,
        Partition storage _partition
    ) internal {
        Asset storage _asset = s.assetIdToAsset[_assetId];
        bool _partitionUpdated = false;

        for (uint256 i = 0; i < _asset.partitions.length; i++) {
            if (_asset.partitions[i].partitionId == _partition.partitionId) {
                _asset.partitions[i] = _partition;
                address _assetToken = s.assetToken[_assetId][
                    _partition.partitionId
                ];
                s.assetTokenToPartiton[_assetToken] = _partition;
                _partitionUpdated = true;
                break;
            }
        }

        if (!_partitionUpdated) {
            _asset.partitions.push(_partition);
            address _assetToken = s.assetToken[_assetId][
                _partition.partitionId
            ];
            s.assetTokenToPartiton[_assetToken] = _partition;
        }

        s.assetIdToAsset[_assetId] = _asset;
    }

    function _isAddressInArray(
        address[] storage _array,
        address _address
    ) internal view returns (bool) {
        for (uint256 i = 0; i < _array.length; i++) {
            if (_array[i] == _address) {
                return true;
            }
        }
        return false;
    }

    /// @notice Internal function to calculate the claimable amount for an investor based on their shares.
    /// @param _assetId The unique identifier of the asset.
    /// @param _partitionId The identifier of the partition within the asset.
    /// @param _investor The address of the investor for whom the claimable amount is calculated.
    /// @return The calculated claimable amount in tokens.
    function _getClaimableAmount(
        uint256 _assetId,
        uint256 _partitionId,
        address _investor
    ) internal view returns (uint256) {
        // Get the number of shares owned by the investor for the specified asset and partition
        uint256 _getUserShares = s.userAssetShares[_investor][_assetId][
            _partitionId
        ];
        address _assetToken = s.assetToken[_assetId][_partitionId];

        // Get the total supply of the asset tokens
        uint256 _totalSupplyOfAsset = IERC20(_assetToken).totalSupply();

        // Calculate and return the claimable amount based on the investor's shares and total supply
        return (_getUserShares * _totalSupplyOfAsset) / 1e6;
    }

    /**
     * @dev Distributes tokens to eligible investors for claiming based on the specified asset and partition.
     * @param _assetId The ID of the asset.
     * @param _partitionId The ID of the partition within the asset.
     *
     * This function distributes tokens to investors who are eligible for claiming, based on the specified
     * asset and partition. It requires that the target funds for the partition have been fully raised
     * before distribution can occur.
     *
     * Emits a `TokenDistributedForClaiming` event for each investor indicating the amount of tokens distributed.
     */
    function _tokenDistributionForClaiming(
        uint256 _assetId,
        uint256 _partitionId
    ) internal {
        address _assetToken = s.assetToken[_assetId][_partitionId];

        address[] memory _investors = s.investors[_assetId][_partitionId];

        for (uint256 i = 0; i < _investors.length; i++) {
            uint256 _getHolderClaimableAmount = _getClaimableAmount(
                _assetId,
                _partitionId,
                _investors[i]
            );

            s.assetClaimableAmount[_investors[i]][_assetId][
                _partitionId
            ] = _getHolderClaimableAmount;

            emit TokenDistributedForClaiming(
                _assetId,
                _partitionId,
                _assetToken,
                _investors[i],
                _getHolderClaimableAmount
            );
        }
    }
}
