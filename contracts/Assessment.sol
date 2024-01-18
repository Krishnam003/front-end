// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => uint256) public activityPoints;
    mapping(address => uint256) public credits;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event EarnActivityPoints(address indexed participant, uint256 points);
    event ClaimCredits(address indexed participant, uint256 creditsClaimed);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }
 error InsufficientBalance(uint256 balance, uint256 withdrawAmount);
    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function earnActivityPoints(uint256 _points) public {
        activityPoints[msg.sender] += _points;
        emit EarnActivityPoints(msg.sender, _points);
    }

    function getActivityPoints(address participant) public view returns (uint256) {
        return activityPoints[participant];
    }

    function claimCredits() public {
        uint256 earnedPoints = activityPoints[msg.sender];
        require(earnedPoints > 0, "No activity points to claim");
        credits[msg.sender] += earnedPoints;
        activityPoints[msg.sender] = 0;
        emit ClaimCredits(msg.sender, earnedPoints);
    }

    function getCredits(address participant) public view returns (uint256) {
        return credits[participant];
    }
}
