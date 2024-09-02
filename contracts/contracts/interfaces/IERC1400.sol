// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

/// @title IERC1400 Security Token Standard
/// @dev See https://github.com/SecurityTokenStandard/EIP-Spec
interface IERC1400 is IERC20 {
    // Document Management
    function getDocument(bytes32 _name) external view returns (string memory, bytes32);
    function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external;

    // Token Information
    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256);
    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);

    // Transfers
    function transferWithData(address _to, uint256 _value, bytes calldata _data) external;
    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external;

    // Partition Token Transfers
    function transferByPartition(bytes32 _partition, address _to, uint256 _value, bytes calldata _data)
        external
        returns (bytes32);
    function operatorTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external returns (bytes32);

    // Controller Operation
    function isControllable() external view returns (bool);
    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;
    function controllerRedeem(address _tokenHolder, uint256 _value, bytes calldata _data, bytes calldata _operatorData)
        external;

    // Operator Management
    function authorizeOperator(address _operator) external;
    function revokeOperator(address _operator) external;
    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external;
    function revokeOperatorByPartition(bytes32 _partition, address _operator) external;

    // Operator Information
    function isOperator(address _operator, address _tokenHolder) external view returns (bool);
    function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder)
        external
        view
        returns (bool);

    // Token Issuance
    function isIssuable() external view returns (bool);
    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external;
    function issueByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes calldata _data)
        external;

    // Token Redemption
    function redeem(uint256 _value, bytes calldata _data) external;
    function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
    function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external;
    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _operatorData
    ) external;

    // Transfer Validity
    function canTransfer(address _to, uint256 _value, bytes calldata _data)
        external
        view
        returns (bytes1 _byte, bytes32 _bytes32);
    function canTransferFrom(address _from, address _to, uint256 _value, bytes calldata _data)
        external
        view
        returns (bytes1 _byte, bytes32 _bytes32);
    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    ) external view returns (bytes1 _byte, bytes32 _bytes, bytes32 _bytes32);

    // Controller Events
    event ControllerTransfer(
        address _controller,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    event ControllerRedemption(
        address _controller, address indexed _tokenHolder, uint256 _value, bytes _data, bytes _operatorData
    );

    // Document Events
    event Document(bytes32 indexed _name, string _uri, bytes32 _documentHash);

    // Transfer Events
    event TransferByPartition(
        bytes32 indexed _fromPartition,
        address _operator,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    event ChangedPartition(bytes32 indexed _fromPartition, bytes32 indexed _toPartition, uint256 _value);

    // Operator Events
    event AuthorizedOperator(address indexed _operator, address indexed _tokenHolder);
    event RevokedOperator(address indexed _operator, address indexed _tokenHolder);
    event AuthorizedOperatorByPartition(
        bytes32 indexed _partition, address indexed _operator, address indexed _tokenHolder
    );
    event RevokedOperatorByPartition(
        bytes32 indexed _partition, address indexed _operator, address indexed _tokenHolder
    );

    // Issuance / Redemption Events
    event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);
    event IssuedByPartition(
        bytes32 indexed _partition,
        address indexed _operator,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );
    event RedeemedByPartition(
        bytes32 indexed _partition,
        address indexed _operator,
        address indexed _from,
        uint256 _value,
        bytes _operatorData
    );
}
