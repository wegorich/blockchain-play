// Contract to be tested
var Payment = artifacts.require("./Payment.sol");

// Test suite
contract('Payment', function(accounts) {
    var paymentInstance;
    var owner = accounts[0];
    var target = accounts[1];
    var ownerBalanceBeforeBuy, targetBalanceBeforeBuy;
    var ownerBalanceAfterBuy, targetBalanceAfterBuy;

    // Test case: check initial values
    it("should be initialized with empty values", function() {
        return Payment.deployed().then(function(instance) {
            paymentInstance = instance;
            return paymentInstance.getAllowTransfer();
        }).then(function(data) {
            assert.equal(data, false, "allowTransfer is zero by default");
            return paymentInstance.isOwner();
        }).then(function(data) {
            assert.equal(data, true, "test execution context is contact owner");
        });
    });


    it("should revert on transfer when 'allowTransfer' is false", function() {
        return Payment.deployed().then(function(instance) {
                paymentInstance = instance;
                return paymentInstance.pay(target, {
                    from: owner,
                    value: web3.toWei(10, "ether")
                });
            })
            .then(assert.fail)
            .catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain 'revert'");
            });
    });

    it("should revert on transfer when target is owner", function() {
        return Payment.deployed().then(function(instance) {
                paymentInstance = instance;
                return paymentInstance.pay(owner, {
                    from: owner,
                    value: web3.toWei(10, "ether")
                });
            })
            .then(assert.fail)
            .catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain 'revert'");
            });
    });

    it("should revert on transfer when target is 0x0", function() {
        return Payment.deployed().then(function(instance) {
                paymentInstance = instance;
                return paymentInstance.pay("0x0", {
                    from: owner,
                    value: web3.toWei(10, "ether")
                });
            })
            .then(assert.fail)
            .catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain 'revert'");
            });
    });

    it("should transfer when 'allowTransfer' is true", function() {
        return Payment.deployed().then(function(instance) {
                paymentInstance = instance;
                // check original balances
                ownerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(owner), "ether").toNumber();
                targetBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(target), "ether").toNumber();
                // allow transfer
                return paymentInstance.setAllowTransfer(true, {
                    from: owner,
                    gas: 500000
                });
            })
            .then(function() {
                // transfer
                return paymentInstance.pay(target, {
                    from: owner,
                    value: web3.toWei(1, "ether")
                });
            })
            .then(function(receipt) {
                // check balances after transfer
                ownerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(owner), "ether").toNumber();
                targetBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(target), "ether").toNumber();

                var ownerDiff = ownerBalanceBeforeBuy - ownerBalanceAfterBuy;
                var targetDiff = targetBalanceAfterBuy - targetBalanceBeforeBuy;
                assert(ownerDiff > 1 && ownerDiff < 1.1, '1 ether transfered + gas');
                assert(targetDiff == 1, 'target has +1 Eth now');

                // check event
                assert.equal(receipt.logs.length, 1, "we should have event");
                assert.equal(receipt.logs[0].event, "payCompletedEvent", "event should be payCompletedEvent");
                assert.equal(receipt.logs[0].args._target, target, "event _target must be " + target);
                assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei("1", "ether"), "price must be 1 Eth");

            })
            .catch(assert.fail);
    });
});