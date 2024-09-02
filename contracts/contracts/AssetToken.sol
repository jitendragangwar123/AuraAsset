// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAuraAssetInteraction.sol";
import "./interfaces/IAuraAssetView.sol";

/// @title AssetToken
/// @dev ERC777 token with partition-specific attributes and role-based access control.
contract AssetToken is ERC20, AccessControl {
    // ========================== Storages ========================== //

    uint256 public assetId;
    uint256 public partitionId;
    uint256 public totalValue;
    address public auraAssetRegistry;

    // ========================== Modifiers ========================== //

    /// @dev Modifier to restrict function access to the `auraAssetRegistry` address only.
    modifier onlyAuraAssetRegistry() {
        require(
            msg.sender == auraAssetRegistry,
            "Only AuraAssetRegistry can call"
        );
        _;
    }

    // ========================== Constructor ========================== //

    /// @dev Initializes the AssetToken contract with specified parameters.
    /// @param _assetId Unique identifier for the asset.
    /// @param _partitionId Unique identifier for the partition.
    /// @param _partitionName Name of the partition.
    /// @param _partitionSymbol Symbol of the partition.
    /// @param _totalValue Total value represented by the tokens.
    /// @param _maxSupply Maximum supply of tokens that can be minted.
    /// @param _defaultAssetManagers Addresses granted admin and asset manager roles.
    constructor(
        uint256 _assetId,
        uint256 _partitionId,
        string memory _partitionName,
        string memory _partitionSymbol,
        uint256 _totalValue,
        uint256 _maxSupply,
        address[] memory _defaultAssetManagers
    ) ERC20(_partitionName, _partitionSymbol) {
        _grantRole(ADMIN_ROLE, _defaultAssetManagers[0]);
        _grantRole(ASSET_MANAGER_ROLE, _defaultAssetManagers[0]);
        assetId = _assetId;
        partitionId = _partitionId;
        _mint(msg.sender, _maxSupply); // AuraAssetRegistry to store assetToken (like an escrow)
        totalValue = _totalValue;
        auraAssetRegistry = msg.sender; // AuraAssetRegistry
    }

    // ========================== Functions ========================== //

    // ========================== Public Functions ========================== //

    /// @dev Returns the calculated token price based on the total value and total supply.
    /// @return The calculated token price.
    function getTokenPrice() public view returns (uint256) {
        return (totalValue * 10 ** 18) / totalSupply();
    }

    /// @dev Override of ERC20 transfer function to revert with a custom message.
    function transfer(
        address to,
        uint256 value
    ) public override returns (bool) {
        require(to != address(0), "to address invalid");
        require(value > 0, "value should be greater than 0");
        require(to != auraAssetRegistry, "to shouldn't be AuraAssetRegistry");
        IAuraAssetView(auraAssetRegistry).validateTransfer(msg.sender, to);
        IAuraAssetInteraction(auraAssetRegistry)
            .updateInvestorAssetInfoOnTransfer(msg.sender, to, value);
        _transfer(msg.sender, to, value);
        return true;
    }

    /// @dev Override of ERC20 approve function to revert with a custom message.
    function approve(
        address spender,
        uint256 value
    ) public override returns (bool) {
        // require(spender != address(0), "spender address invalid");
        bool isVerified = IAuraAssetView(auraAssetRegistry)
            .isAccountKYCVerified(msg.sender);
        require(isVerified, "The investor is not KYC verified");
        require(
            spender == auraAssetRegistry,
            "spender address should be AuraAssetRegistry"
        );
        require(value > 0, "value should be greater than 0");
        // revert("Can not call approve");
        _approve(msg.sender, spender, value);
        return true;
    }

    /// @dev Override of ERC20 transferFrom function to revert with a custom message.
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public override onlyAuraAssetRegistry returns (bool) {
        require(from != address(0), "from address invalid");
        require(to != address(0), "to address invalid");
        require(value > 0, "value should be greater than 0");
        // revert("Can not call transferFrom");
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    // ========================== External Functions ========================== //

    /// @dev Transfers assets between addresses, restricted to the `auraAssetRegistry` address.
    /// @param from Address sending the tokens.
    /// @param to Address receiving the tokens.
    /// @param amount Amount of tokens to transfer.
    /// @return True if the transfer was successful.
    function transferOfAssets(
        address from,
        address to,
        uint256 amount
    ) external onlyAuraAssetRegistry returns (bool) {
        _transfer(from, to, amount);
        // emit Transfer(assetId, msg.sender, to, value);
        return true;
    }
}
