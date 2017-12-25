App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    target: 0x0,
    allowTransfer: false,

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        // Initialize web3 and set the provider to the testRPC.
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            web3 = new Web3(App.web3Provider);
        }
        App.displayAccountInfo();
        App.initContract();
    },

    displayAccountInfo: function() {
        web3.eth.getAccounts(function(err, accounts) {
            if (err === null) {
                App.account = accounts[0];
                $("#coinbase").text(App.account);
                App.target = '0x1daa654cfbc28f375e0f08f329de219fff50c765';
                $("#target").text(App.target);
                App.refreshBalances();
            }
        });
    },

    refreshBalances: function() {
        web3.eth.getBalance(App.account, function(err, balance) {
            if (!err) {
                $("#coinbase-balance").text(web3.fromWei(balance, "ether") + " ETH");
            } else {
                console.log(err);
            }
        });
        web3.eth.getBalance(App.target, function(err, balance) {
            if (!err) {
                $("#target-balance").text(web3.fromWei(balance, "ether") + " ETH");
            } else {
                console.log(err);
            }
        });
    },

    initContract: function() {
        $.getJSON('Payment.json', function(paymentArtifact) {
            App.contracts.Payment = TruffleContract(paymentArtifact);
            App.contracts.Payment.setProvider(App.web3Provider);

            App.instanceConfig();
        });
    },

    // Listen for events raised from the contract
    instanceConfig: function() {
        App.contracts.Payment.deployed().then(function(instance) {
            // events
            // cannot say why events not work for this case
            // switching to pooling
            setInterval(App.refreshBalances.bind(App), 1000);
            /*instance.payCompletedEvent({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error, event) {
                App.refreshBalances();
            });*/

            // read current allowTransfer
            instance.getAllowTransfer().then(function(isTransferAllowed) {
                App.allowTransfer = isTransferAllowed;
                var cb = $('#allowTransfer');
                cb[0].checked = isTransferAllowed;
                cb.on('change', App.allowTransferChanged.bind(App));

                // polling external service to get state and applying it to our state
                setInterval(function() {
                    $.getJSON('http://test-blockchain.getsandbox.com/state', function(response) {
                        $('#externalState').text(response.state);
                        if (response.state !== App.allowTransfer) {
                            var cb = $('#allowTransfer');
                            cb[0].checked = App.allowTransfer = response.state;
                            cb.trigger('change'); // not triggers automatically
                        }
                    });
                }, 2000);
            })
        });
    },

    allowTransferChanged: function() {

        App.contracts.Payment.deployed().then(function(instance) {
            var val = $('#allowTransfer')[0].checked;
            instance.setAllowTransfer(val, { from: App.account, gas: 500000 });
        });
    },

    transfer: function() {
        event.preventDefault();

        App.contracts.Payment.deployed().then(function(instance) {
            return instance.pay(App.target, {
                from: App.account,
                value: web3.toWei("10", "ether"),
                gas: 500000
            });
        }).then(function(result) {
            // App.refreshBalances();
        }).catch(function(err) {
            console.error(err);
        });
    },
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});