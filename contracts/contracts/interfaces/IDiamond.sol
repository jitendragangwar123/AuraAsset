// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IDiamond {
    function getPositionSize(address _account, address _indexToken, bool _isLong) external view returns (uint256);
    function addLPFees(uint256 feesUSD, address _indexToken) external;
    function transferLongToShort(address _asset, uint256 _amount) external;
    function transferShortToLong(address _asset, uint256 _amount) external;
    function isSequencerWhitelisted(address _sequencer) external view returns (bool);
}
