// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

/**
 * @title Deposit
 * @dev A contract to handle USDC deposits, withdrawals, and balance updates.
 */
contract Deposit is OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    // ========================== Storages ========================== //

    /// @notice The address of the USDC token.
    address public usdc;

    /// @notice The address of the admin.
    address public admin;

    /// @notice The address of the Diamond.
    address public diamond;

    /// @notice Mapping to store user balances.
    mapping(address => uint256) public balances;

    /// @notice Mapping to store utilised balances.
    mapping(address => uint256) public utilised;

    /// @notice Total invested value on all properties that has reached the target funds.
    uint256 public totalInvestedOnAllProperties;

    /// @notice Total invested value on particular property that has reached the target funds.
    mapping(uint256 => mapping(uint256 => uint256))
        public totalInvestedOnProperty;

    /// @notice Total deposited value on particular property by the owner or admin.
    mapping(address => mapping(uint256 => mapping(uint256 => uint256)))
        public totalDepositByAdminForProperty;

    // ========================== Events ========================== //

    /**
     * @dev Emitted when a deposit is made.
     * @param sender The address of the depositor.
     * @param amount The amount deposited.
     */
    event Deposited(address sender, uint256 amount);

    /**
     * @dev Emitted when a withdrawal is made.
     * @param sender The address of the withdrawer.
     * @param amount The amount withdrawn.
     */
    event Withdraw(address sender, uint256 amount);

    /**
     * @dev Emitted when an investor's balance is updated.
     * @param investor The address of the investor.
     * @param previousBalance The previous balance of the investor.
     * @param currentBalance The current balance of the investor.
     */
    event BalanceUpdated(
        address investor,
        uint256 previousBalance,
        uint256 currentBalance
    );

    /**
     * @notice This event is emitted when the admin is changed.
     * @param previousAdmin The address of the previous admin.
     * @param newAdmin The address of the new admin.
     */
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    event BalanceUpdatedOnTargetReached(
        uint256 assetId,
        uint256 partitionId,
        uint256 targetFunds
    );

    event WithdrawByAdmin(
        uint256 assetId,
        uint256 partitionId,
        address to,
        uint256 amount,
        uint256 timestamp
    );

    event DepositByAdmin(
        uint256 assetId,
        uint256 partitionId,
        uint256 amount,
        uint256 timestamp
    );

    // ========================== Modifiers ========================== //

    /**
     * @dev Ensures that only the diamond (AuraAssetRegistry) can call the function.
     */
    modifier onlyDiamond() {
        require(
            msg.sender == diamond,
            "Only Dimaond (AuraAssetRegistry) can call"
        );
        _;
    }

    /**
     * @notice Ensures that only the admin can call the function.
     * @dev Reverts if the caller is not the admin.
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }

    /**
     * @notice Ensures that only the owner or admin can call the function.
     * @dev Reverts if the caller is neither the owner nor the admin.
     */
    modifier onlyOwnerOrAdmin() {
        require(
            msg.sender == owner() || msg.sender == admin,
            "Only owner or admin can call"
        );
        _;
    }

    // ========================== Functions ========================== //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ========================== Public Functions ========================== //

    /**
     * @dev Initializes the contract with the given USDC token address.
     * @param _usdc The address of the USDC token.
     */
    function initialize(address _usdc, address _admin) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        __UUPSUpgradeable_init();
        usdc = _usdc;
        admin = _admin;
    }

    // ========================== External Functions ========================== //

    /**
     * @dev Pauses the contract. Only the owner can call this function.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract. Only the owner can call this function.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Sets the Diamond address. Only the owner can call this function.
     * @param _diamond The address of the Diamond (AuraAssetRegistry).
     */
    function setDiamond(address _diamond) external onlyOwner {
        diamond = _diamond;
    }

    /**
     * @dev Deposits a specified amount of USDC into the contract.
     * @param _amount The amount of USDC to deposit.
     */
    function deposit(uint256 _amount) external whenNotPaused {
        IERC20(usdc).transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] += _amount;
        emit Deposited(msg.sender, _amount);
    }

    /**
     * @dev Returns the utilised balance of a specified investor.
     * @param _investor The address of the investor.
     * @return The utilised balance of the investor.
     */
    function utilisedBalance(
        address _investor
    ) external view returns (uint256) {
        return utilised[_investor];
    }

    /**
     * @dev Withdraws a specified amount of USDC from the contract.
     * @param _amount The amount of USDC to withdraw.
     */
    function withdraw(uint256 _amount) external whenNotPaused {
        require(
            IERC20(usdc).balanceOf(address(this)) >= _amount,
            "Not enough balance in the contract"
        );
        require(balances[msg.sender] >= _amount, "Not enough investor balance");
        balances[msg.sender] -= _amount;
        IERC20(usdc).transfer(msg.sender, _amount);
        emit Withdraw(msg.sender, _amount);
    }

    /**
     * @notice Allows the admin to withdraw a specified amount of funds to a specified address.
     * @dev Ensures the destination address is valid and the contract has sufficient balance.
     * @param _assetId The asset ID.
     * @param _partitionId The partion ID.
     * @param _to The address to which the funds will be transferred.
     * @param _amount The amount of funds to withdraw.
     */
    function withdrawByAdmin(
        uint256 _assetId,
        uint256 _partitionId,
        address _to,
        uint256 _amount
    ) external onlyOwnerOrAdmin {
        require(
            totalInvestedOnAllProperties > 0,
            "Not enough total target funds on all properties available"
        );
        require(
            totalInvestedOnProperty[_assetId][_partitionId] > 0,
            "Not enough target funds on this propety available"
        );
        require(_to != address(0), "to address invalid");
        require(
            balances[address(this)] >= _amount,
            "Not enough balance in the contract"
        );
        IERC20(usdc).transfer(_to, _amount);
        totalInvestedOnAllProperties -= _amount;
        totalInvestedOnProperty[_assetId][_partitionId] -= _amount;
        emit WithdrawByAdmin(
            _assetId,
            _partitionId,
            _to,
            _amount,
            block.timestamp
        );
    }

    /**
     * @notice Allows the admin to deposit a specified amount of funds for particulat asset and partion ID.
     * @param _assetId The asset ID.
     * @param _partitionId The partion ID.
     * @param _amount The amount of funds to withdraw.
     */
    function depositByAdmin(
        uint256 _assetId,
        uint256 _partitionId,
        uint256 _amount
    ) external onlyOwnerOrAdmin {
        IERC20(usdc).transferFrom(msg.sender, address(this), _amount);
        totalInvestedOnAllProperties += _amount;
        totalInvestedOnProperty[_assetId][_partitionId] += _amount;
        totalDepositByAdminForProperty[msg.sender][_assetId][
            _partitionId
        ] += _amount;
        emit DepositByAdmin(_assetId, _partitionId, _amount, block.timestamp);
    }

    /**
     * @notice Changes the admin to a new address.
     * @dev Can only be called by the owner or the current admin. Emits an {AdminChanged} event.
     * @param _newAdmin The address of the new admin.
     */
    function changeAdmin(address _newAdmin) external onlyOwnerOrAdmin {
        address _previousAdmin = admin;
        admin = _newAdmin;

        emit AdminChanged(_previousAdmin, _newAdmin);
    }

    /**
     * @dev Updates the investor's balance. Only the AuraAssetRegistry can call this function.
     * @param _investor The address of the investor.
     * @param _amount The amount to update.
     * @param isInvest Whether the balance update is for invest (true) or not (false).
     * @param isRedeem Whether the balance update is for redeem (true) or not (false).
     */
    function updateInvestorBalances(
        address _investor,
        uint256 _amount,
        bool isInvest,
        bool isRedeem
    ) external whenNotPaused onlyDiamond {
        if (isInvest) {
            require(balances[_investor] >= _amount, "Not enough balance");
            balances[_investor] -= _amount;
            utilised[_investor] += _amount;

            // IERC20(usdc).transfer(msg.sender, _amount);
            emit BalanceUpdated(
                _investor,
                balances[_investor] + _amount,
                balances[_investor]
            );
        } else if (isRedeem) {
            balances[_investor] += _amount;
            // This is required if one investor transferred to another investor
            // Another investor tries to redeem
            if (utilised[_investor] > 0) {
                utilised[_investor] -= _amount;
            }

            emit BalanceUpdated(
                _investor,
                balances[_investor] - _amount,
                balances[_investor]
            );
        } else {
            // balances[_investor] += _amount;
            // @note - Need to verify if one investor transfer to second user, who hasn't deposited
            // Second user wants to transfer to third user
            if (utilised[_investor] == 0) {
                utilised[_investor] += _amount;
            } else {
                utilised[_investor] -= _amount;
            }
        }
    }

    function updateBalanceOnTargetReached(
        uint256 _assetId,
        uint256 _partitionId,
        uint256 _targetFunds
    ) external whenNotPaused onlyDiamond {
        totalInvestedOnProperty[_assetId][_partitionId] += _targetFunds;
        totalInvestedOnAllProperties += _targetFunds;
        emit BalanceUpdatedOnTargetReached(
            _assetId,
            _partitionId,
            _targetFunds
        );
    }

    // ========================== Internal Functions ========================== //

    /**
     * @dev Authorizes the upgrade of the contract. Only the owner can call this function.
     * @param newImplementation The address of the new implementation.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
