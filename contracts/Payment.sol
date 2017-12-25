pragma solidity ^0.4.11;

contract Payment {
    
    address owner;
    bool allowTransfer;

    modifier onlyOnwer() {
        require(msg.sender == owner);
        _;
    }

    function Payment() {
        owner = msg.sender;
        allowTransfer = false;
    }

    function isOwner() public constant returns(bool) {
        return owner == msg.sender;
    }

    function getAllowTransfer() public constant returns(bool) {
        return allowTransfer;
    }

    function setAllowTransfer(bool _allowTransfer) public onlyOnwer {
        allowTransfer = _allowTransfer;
    }
    
    function pay(address target) payable onlyOnwer public {
        require(target != 0x0);
        require(target != owner);
        require(allowTransfer == true);
        target.transfer(msg.value);
        payCompletedEvent(target, msg.value);
    }

    event payCompletedEvent(address indexed _target, uint256 _price);
}
