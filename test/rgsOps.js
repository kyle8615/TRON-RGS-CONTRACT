const RgsToken = artifacts.require("./RgsToken.sol");
const RgsOps = artifacts.require("./RgsOps.sol");

const delay = ms => new Promise(res => setTimeout(res, ms));

contract('RgsOps', function(accounts) {
  let admin = accounts[0];
  let player = accounts[1];
  let other = accounts[2];

  let rgsOps;
  let rgsToken;
  let ops;
  let token;

  it("should deploy contract successfully", async function() {
    rgsOps = await RgsOps.deployed();
    rgsToken = await RgsToken.deployed();
    await rgsToken.mint(player, tronWeb.toSun(100));
    let balance = await rgsToken.balanceOf(player)
    assert.equal(balance.toString(), tronWeb.toSun(100).toString(), "balance is equal to 100 RGS");
  });

  //it("should enable stake", async function() {
  //  //await rgsOps.setStakeToken(rgsToken.address);
  //  let stakeTokenAddress = await rgsOps.stakeTokenAddress();
  //  assert.equal(rgsToken.address, stakeTokenAddress, "address should be set successfully");
  //  await rgsToken.approve(rgsOps.address, tronWeb.toSun(2), {
  //    from: player
  //  })
  //  await rgsOps.stakeToken(tronWeb.toSun(1), {
  //    from: player
  //  })
  //  let stakeAmount = await rgsOps.stakeMap(player);
  //  assert.equal(stakeAmount.toString(), tronWeb.toSun(1), "stake amount is not equal");
  //  let totalStake = await rgsOps.totalStakeAmount();
  //  assert.equal(totalStake, tronWeb.toSun(1), "stake amount is not equal");
  //  let addresses = await rgsOps.getStakedAddresses();
  //  assert.equal(addresses.length, 1, "staked address length equals to 1");
  //  await rgsOps.unstakeToken(tronWeb.toSun(0.5), {
  //    from: player
  //  })
  //  await rgsOps.unstakeToken(tronWeb.toSun(0.5), {
  //    from: player
  //  })
  //  addresses = await rgsOps.getStakedAddresses();
  //  assert.equal(addresses.length, 0, "staked address length equals to 0");
  //  totalStake = await rgsOps.totalStakeAmount();
  //  assert.equal(totalStake, tronWeb.toSun(0), "stake amount is not equal");

  //  await delay(3000);
  //  let unstakeMap = await rgsOps.unstakeMap(player, 0);
  //  assert.equal(unstakeMap.amount, tronWeb.toSun(0.5), "unstake amount is not equal");
  //  unstakeMap = await rgsOps.unstakeMap(player, 1);
  //  assert.equal(unstakeMap.amount, tronWeb.toSun(0.5), "unstake amount is not equal");
  //  stakeAmount = await rgsOps.stakeMap(player);
  //  assert.equal(stakeAmount, tronWeb.toSun(0), "stake amount is not equal");
  //  await rgsOps.redeemToken({
  //    from: player
  //  })
  //  let redeemableTokens = await rgsOps.redeemableTokenOf({
  //    from: player
  //  });
  //  console.log(redeemableTokens[0][0].toString())
  //  console.log(redeemableTokens[1][0].toString())
  //  assert.equal(redeemableTokens[0].length, 1, "stake amount is not equal");
  //  await rgsOps.redeemToken({
  //    from: player
  //  })
  //  redeemableTokens = await rgsOps.redeemableTokenOf({
  //    from: player
  //  });
  //  assert.equal(redeemableTokens[0].length, 0, "stake amount is not equal");

  //})

  it("should able to stake burn", async function() {
    let burnTokenAddress = await rgsOps.burnTokenAddress();
    assert.equal(rgsToken.address, burnTokenAddress, "address should be set successfully");
    await rgsToken.approve(rgsOps.address, tronWeb.toSun(6), {
      from: player
    });
    await rgsOps.stakeBurnToken(tronWeb.toSun(3), {
      from: player
    });

    await delay(3000);
    let firstRecords = await rgsOps.stakeBurnRecordOf(player);
    console.log(firstRecords);
    console.log(tronWeb.toDecimal(firstRecords[0][0]));
    console.log(tronWeb.toDecimal(firstRecords[1][0]));
    await rgsOps.stakeBurnToken(tronWeb.toSun(3), {
      from: player
    });
    await delay(3000);
    let secondRecords = await rgsOps.stakeBurnRecordOf(player);
    console.log(secondRecords);
    console.log(tronWeb.toDecimal(secondRecords[0][1]));
    console.log(tronWeb.toDecimal(secondRecords[1][1]));

    //await rgsOps.burnRecordByAddr(player, Date.now() - 10000);
    //await delay(2500);
    //let thirdRecords = await rgsOps.stakeBurnRecordOf(player);
    //console.log(thirdRecords);
    //console.log(tronWeb.toDecimal(thirdRecords[0][0]));
    //console.log(tronWeb.toDecimal(thirdRecords[1][0]));

    let res = await rgsOps.burnRecordByAddr(admin, Math.floor(Date.now() / 1000))
    await delay(2500);
    let fourthRecords = await rgsOps.stakeBurnRecordOf(admin);
    console.log(tronWeb.toDecimal(fourthRecords[0][0]));
    console.log(tronWeb.toDecimal(fourthRecords[1][0]));
  });

});
