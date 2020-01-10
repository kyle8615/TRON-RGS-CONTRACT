const TronWeb = require('TronWeb');

const tronWeb = new TronWeb({
  fullNode: 'https://api.shasta.trongrid.io',
  solidityNode: 'https://api.shasta.trongrid.io',
  eventServer: 'https://api.shasta.trongrid.io'
})

const fs = require('fs');
const app = async () => {
  tronWeb.setAddress('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n');
  tronWeb.setPrivateKey('6D24852A27ED1A37AF2F20D99BEE465781C1A020A3D6203CD5CEA433F4E53C59');
  const tokenaddress = 'TCsbb7JNmihCDNCocsok1cEsamZnESSiHP';
  const chainaddress = 'TJkqKvmZ45U1F3eDibKSDhLPbxbpmj2LTX';
  const rgsToken = await tronWeb.contract().at(tokenaddress);
  const chainContract = await tronWeb.contract().at(chainaddress);
  //await chainContract.registerToken('0x0000000000000000000000000000000000000000', tronWeb.toSun(0.001).toString()).send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.depositNative().send({
  //  shouldPollResponse: false,
  //  callValue: tronWeb.toSun(100000)
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.withdrawNative('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n', tronWeb.toSun(1)).send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.registerToken("TQuFgReaLc1jx66AsEsXhNrRa72NAe9cVo", tronWeb.toSun(0.001).toString()).send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await rgsToken.approve("TLAAy2PxYKHnYRsfQP3RmyyUuRw1gCiWft", tronWeb.toSun(1)).send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.depositToken("TQuFgReaLc1jx66AsEsXhNrRa72NAe9cVo", tronWeb.toSun(1)).send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.withdrawToken("TQuFgReaLc1jx66AsEsXhNrRa72NAe9cVo", "TRr6xVXoPQfUeqk16jC1aF14sn1uCZykSB", tronWeb.toSun(1)).send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.pause().send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await chainContract.unpause().send({
  //  shouldPollResponse: true,
  //  callValue: 0
  //}).then(res => {
  //  console.log(res)
  //}).catch(console.log);

  //await rgsToken.mint('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n', tronWeb.toSun(100)).send();
  //await chainContract.enableStakeToken("TL4EDHo9bKdiEQENfeSi1ZNovH5tD1BCs9", tronWeb.toSun(0.001)).send()
  //await rgsToken.approve("TNDAZ7aNYLVJ1q7UokmXYCV9iqZgxrxiHN", tronWeb.toSun(2)).send()
  //await chainContract.stakeToken("TL4EDHo9bKdiEQENfeSi1ZNovH5tD1BCs9", tronWeb.toSun(2)).send()
  //await chainContract.unstakeToken("TL4EDHo9bKdiEQENfeSi1ZNovH5tD1BCs9", tronWeb.toSun(1)).send()
  //await chainContract.redeemToken("TL4EDHo9bKdiEQENfeSi1ZNovH5tD1BCs9").send()
  //let chain = await chainContract.redeemableTokenOf("TL4EDHo9bKdiEQENfeSi1ZNovH5tD1BCs9").call()
  //console.log(chain);
  //console.log(chain[0][0].toString());
  //console.log(chain[1][0].toString());
  //let stake = await chainContract.totalStakeMap("TL4EDHo9bKdiEQENfeSi1ZNovH5tD1BCs9").call()
  //console.log(stake.toString());

  //await rgsToken.mint('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n', tronWeb.toSun(100)).send();
  //await chainContract.setBurnToken(tokenaddress).send()
  //await rgsToken.approve(chainaddress, tronWeb.toSun(3)).send()
  //await chainContract.stakeBurnToken(tronWeb.toSun(3)).send()

  await chainContract.burnRecordByAddr("TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n", 1578504775).send({
    shouldPollResponse: true,
    callValue: 0
  }).then(res => {
    console.log(res)
  }).catch(console.log);

  //let chain = await chainContract.stakeBurnAddresses(0).call()
  //let chain = await chainContract.getStakeBurnAddresses().call()
  //console.log(chain);
  //let balance = await rgsToken.balanceOf(chainaddress).call();
  //console.log('balance: ', balance.toString());
  let chain = await chainContract.stakeBurnRecordOf("TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n").call()
  console.log(chain);
  console.log(chain[0][0].toString());
  console.log(chain[1][0].toString());
  console.log(chain[0][1].toString());
  console.log(chain[1][1].toString());
  console.log(chain[0][2].toString());
  console.log(chain[1][2].toString());
  console.log(chain[0][3].toString());
  console.log(chain[1][3].toString());
  console.log(chain[0][4].toString());
  console.log(chain[1][4].toString());
  console.log(chain[0][5].toString());
  console.log(chain[1][5].toString());
  console.log(chain[0][6].toString());
  console.log(chain[1][6].toString());
  console.log(chain[0][7].toString());
  console.log(chain[1][7].toString());
  //console.log(chain[0][8].toString());
  //console.log(chain[1][8].toString());
  //console.log(chain[0][9].toString());
  //console.log(chain[1][9].toString());
};

app();
