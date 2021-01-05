const { ethers } = require("ethers");
const fs = require("fs");

const STAKE_ABI = [{"inputs":[{"internalType":"address","name":"vybe","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"melody","type":"address"}],"name":"MelodyAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"melody","type":"address"}],"name":"MelodyRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"mintage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"developerFund","type":"uint256"}],"name":"Rewards","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"StakeDecreased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"StakeIncreased","type":"event"},{"inputs":[{"internalType":"address","name":"melody","type":"address"}],"name":"addMelody","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"calculateRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"calculateSupplyDivisor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"decreaseStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"increaseStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"lastClaim","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"previous","type":"address"},{"internalType":"address[]","name":"people","type":"address[]"},{"internalType":"uint256[]","name":"lastClaims","type":"uint256[]"}],"name":"migrate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"melody","type":"address"}],"name":"removeMelody","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"staked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owned","type":"address"},{"internalType":"address","name":"upgraded","type":"address"}],"name":"upgrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"fund","type":"address"}],"name":"upgradeDevelopmentFund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"vybe","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

const contractAddress = "0x81e756Ef62b481333A93011705bb4f6AF1475AEF";
const provider = new ethers.providers.InfuraProvider("mainnet", "KEY");
const stakeProvider = new ethers.Contract(contractAddress, STAKE_ABI, provider);

// event topics
const increaseStake =
  "0x8b0ed825817a2e696c9a931715af4609fc60e1701f09c89ee7645130e937eb2d";
const claimReward =
  "0x61953b03ced70bb23c53b5a7058e431e3db88cf84a72660faea0849b785c43bd";

// the time you want to track events from
const startBlock = 10890000;

console.log("\x1b[33m%s\x1b[0m", "Code is running.....");

async function getEvents(topic) {
    let params = {
        address: contractAddress,
        fromBlock: startBlock,
        toBlock: 'latest',
        topics: [ topic ]
    }
    return await stakeProvider.queryFilter(params);
}

async function init() {
    const events = await getEvents(increaseStake);
    let stakers = [];
    finalSet = [];

    for (let eventObj of events) {
        const fromAddress = "0x" + eventObj.topics[1].substr(26, 40);
        stakers.push(fromAddress);
    }

    const knownSet = Array.from(new Set(stakers));

    for (let address of knownSet) {
        const stakeBalance = await stakeProvider.staked(address);

        if (stakeBalance.gt(0.0)) {
            finalSet.push(address);
        }
    }

    finalSet = Array.from(new Set(finalSet));
    fs.writeFileSync((__dirname, 'data.json'), finalSet);
}

init();
