# blockchain-play

### Setup

Please use Google Chrome for demo app as i didint tested it for other browsers

1. `git clone https://github.com/ValLisetsky/blockchain-play` and step into `blockchain-play` folder
2. Run `npm install`
3. Run `npm run testrpc` and leave it running
4. Run `npm run test` to run unit tests
4. Run `npm start` to start demo app (open chrome http://localhost:3000)

### Key Points
1. One contract `contracts/Payment.sol` that:
    - keeps state `allowTransfer` that can be modified only by contract owner
    - method `pay` transfers Eth only when `allowTransfer` is `true`
2. All UI done with jQuery (for simplicity) and all frontend code located in `src/js/app.js`.
    - UI polling (2 secs) `http://test-blockchain.getsandbox.com/state` service and changes `Allow Transfer` checkbox.
    - Any time when `Allow Transfer` checkbox is changed - its new value goes to `Payment.allowTransfer` in blockchain.
    - Use can transfer 10 Ether by clicking `Transfer 10 Eth` button
    - Depending on `Payment.allowTransfer` state transfer will be competed or rolls back.

### Issues
1. This code can be improved :)
2. No tests for UI - only Contract tests for now
3. No Test Coverage collected
4. For some reason Contract events not worked for me (`src/js/app.js:71`) so i switched to polling balances