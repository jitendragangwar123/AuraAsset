// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

// Storage contract for USDC-like token functionality
abstract contract USDC_Storage {
    mapping(address => bool) faucetMinted; // Track if an address has received faucet minting

    error AlreadyMinted(address);

    event FaucetMinted(address account, uint256 amount);

    address public admin; // Admin address for managing contract
    mapping(address => uint256) lastMinted; // Timestamp of last minting for each address

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier ifAlreadyMinted(address _address) {
        require(
            lastMinted[_address] + 1 days <= block.timestamp, "Token minted already, please try again after 24 hours"
        );
        _;
    }
}

/// @title AuraAssetUSDC
/// @dev ERC20 token contract with additional functionality for managing a USDC-like token
contract AuraAssetUSDC is UUPSUpgradeable, OwnableUpgradeable, ERC20Upgradeable, USDC_Storage {
    /// @dev Initializes the token with name, symbol, and sets admin.
    /// @param _name The name of the token.
    /// @param _symbol The symbol of the token.
    /// @param _admin The address of the admin for the token.
    function initialize(string memory _name, string memory _symbol, address _admin) public initializer {
        __ERC20_init(_name, _symbol);
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        admin = _admin;

        // Mint initial tokens to the contract deployer (for testing purposes)
        _mint(msg.sender, 1_000_000 * (10 ** uint256(decimals())));
    }

    /// @dev Allows the admin to authorize an upgrade to a new implementation contract.
    /// @param newImplementation The address of the new implementation contract.
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @dev Mints tokens and assigns them to the specified account.
    /// @param _account The account to receive the minted tokens.
    /// @param _amount The amount of tokens to mint.
    function mint(address _account, uint256 _amount) external onlyOwner {
        _mint(_account, _amount);
    }

    /// @dev Returns the number of decimals used to get its user representation.
    /// @return The number of decimals.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @dev Allows admin to mint tokens to a specified address once every 1 days.
    /// @param _address The address to mint tokens to.
    function faucetMint(address _address) public ifAlreadyMinted(_address) {
        lastMinted[_address] = block.timestamp;
        _mint(_address, 10000 * (10 ** uint256(decimals())));
        emit FaucetMinted(_address, 10000 * (10 ** uint256(decimals())));
    }

    /// @dev Increases the allowance of the specified spender.
    /// @param spender The address which will spend the funds.
    /// @param value The amount of tokens to increase the allowance by.
    function increaseAllowance(address spender, uint256 value) external {
        _approve(msg.sender, spender, allowance(msg.sender, spender) + value);
    }

    /// @dev Decreases the allowance of the specified spender.
    /// @param spender The address which will spend the funds.
    /// @param value The amount of tokens to decrease the allowance by.
    function decreaseAllowance(address spender, uint256 value) external {
        uint256 currentAllowance = allowance(msg.sender, spender);
        require(currentAllowance >= value, "Not enough allowance to decrease");
        _approve(msg.sender, spender, currentAllowance - value);
    }

    /// @dev Changes the admin address.
    /// @param newAdmin The new admin address.
    function changeAdmin(address newAdmin) external {
        require(msg.sender == owner() || msg.sender == admin, "Only owner or admin can call");
        admin = newAdmin;
    }
}

/// @title USDC_V2
/// @dev Upgraded version of the USDC-like token contract.
contract USDC_V2 is Initializable, UUPSUpgradeable, OwnableUpgradeable, ERC20Upgradeable, USDC_Storage {
    /// @dev Initializes the token with name, symbol, and sets admin.
    /// @param _name The name of the token.
    /// @param _symbol The symbol of the token.
    /// @param _admin The address of the admin for the token.
    function initialise(string memory _name, string memory _symbol, address _admin) public initializer {
        __ERC20_init(_name, _symbol);
        __Ownable_init(msg.sender);
        admin = _admin;
        // Mint initial tokens to the contract deployer (for testing purposes)
        _mint(msg.sender, 1_000_000 * (10 ** uint256(decimals())));
    }

    /// @dev Allows the admin to authorize an upgrade to a new implementation contract.
    /// @param newImplementation The address of the new implementation contract.
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @dev Mints tokens and assigns them to the specified account.
    /// @param _account The account to receive the minted tokens.
    /// @param _amount The amount of tokens to mint.
    function mint(address _account, uint256 _amount) external onlyOwner {
        _mint(_account, _amount);
    }

    /// @dev Returns the number of decimals used to get its user representation.
    /// @return The number of decimals.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @dev Allows admin to mint tokens to a specified address once every 7 days.
    /// @param _address The address to mint tokens to.
    function faucetMint(address _address) public {
        if (lastMinted[_address] + 7 days > block.timestamp) {
            revert AlreadyMinted(_address);
        }
        lastMinted[_address] = block.timestamp;
        _mint(_address, 1000 * (10 ** uint256(decimals())));
    }

    /// @dev Increases the allowance of the specified spender.
    /// @param spender The address which will spend the funds.
    /// @param value The amount of tokens to increase the allowance by.
    function increaseAllowance(address spender, uint256 value) external {
        _approve(msg.sender, spender, allowance(msg.sender, spender) + value);
    }

    /// @dev Decreases the allowance of the specified spender.
    /// @param spender The address which will spend the funds.
    /// @param value The amount of tokens to decrease the allowance by.
    function decreaseAllowance(address spender, uint256 value) external {
        uint256 currentAllowance = allowance(msg.sender, spender);
        require(currentAllowance >= value, "Not enough allowance to decrease");
        _approve(msg.sender, spender, currentAllowance - value);
    }

    /// @dev Changes the admin address.
    /// @param newAdmin The new admin address.
    function changeAdmin(address newAdmin) external {
        require(msg.sender == owner() || msg.sender == admin, "Only owner or admin can call");
        admin = newAdmin;
    }
}

/// @title MockToken
/// @dev Mock ERC20 token for testing purposes.
contract MockToken is ERC20 {
    uint8 private _decimals;

    /// @dev Constructor to initialize the token with name, symbol, initial supply, and decimals.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param initialSupply The initial supply of the token.
    /// @param decimals_ The number of decimals to use for the token.
    constructor(string memory name_, string memory symbol_, uint256 initialSupply, uint8 decimals_)
        ERC20(name_, symbol_)
    {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals_)));
    }

    /// @dev Returns the number of decimals used to get its user representation.
    /// @return The number of decimals.
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @dev Mints tokens and assigns them to the specified account.
    /// @param _to The account to receive the minted tokens.
    /// @param _amount The amount of tokens to mint.
    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
