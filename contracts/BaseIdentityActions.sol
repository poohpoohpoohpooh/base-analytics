// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseIdentityActions {
    event DailyCheckIn(address indexed user, uint256 timestamp);
    event GM(address indexed user, uint256 timestamp);
    event GN(address indexed user, uint256 timestamp);

    mapping(address => uint256) public lastDailyCheckIn;
    mapping(address => uint256) public lastGM;
    mapping(address => uint256) public lastGN;

    mapping(address => uint256) public totalCheckIns;
    mapping(address => uint256) public totalGMs;
    mapping(address => uint256) public totalGNs;

    function dailyCheckIn() external {
        require(
            block.timestamp >= lastDailyCheckIn[msg.sender] + 1 days,
            "Already checked in today"
        );

        lastDailyCheckIn[msg.sender] = block.timestamp;
        totalCheckIns[msg.sender] += 1;

        emit DailyCheckIn(msg.sender, block.timestamp);
    }

    function gm() external {
        require(block.timestamp >= lastGM[msg.sender] + 12 hours, "GM cooldown active");

        lastGM[msg.sender] = block.timestamp;
        totalGMs[msg.sender] += 1;

        emit GM(msg.sender, block.timestamp);
    }

    function gn() external {
        require(block.timestamp >= lastGN[msg.sender] + 12 hours, "GN cooldown active");

        lastGN[msg.sender] = block.timestamp;
        totalGNs[msg.sender] += 1;

        emit GN(msg.sender, block.timestamp);
    }
}
