const RgsToken = artifacts.require("./RgsToken.sol");
const Chain = artifacts.require("./Chain.sol");

async function assertFail(callback) {
  let error_thrown = false;
  try {
    await callback();
  } catch (error) {
    if (error.message.search("invalid opcode"))
      error_thrown = true;
  }
  assert.ok(error_thrown, "Transaction should fail");
};

contract('Chain', function(accounts) {
  let admin = accounts[0];
  let player = accounts[1];
  let other = accounts[2];

  let chainContract;
  let rgsToken;
  it("should deploy contract successfully", async function() {

    chainContract = await Chain.deployed();
    rgsToken = await RgsToken.deployed();
    await rgsToken.mint(player, tronWeb.toSun(100));
    let balance = await rgsToken.balanceOf(player)
    assert.equal(balance.toString(), tronWeb.toSun(100).toString(), "balance is equal to 100 RGS");
    //rgsToken = await tronWeb.contract().at(rgsToken.address)
    //chainContract = await tronWeb.contract().at(chainContract.address)

  });

  it("should register and operate native token", async function() {
    await chainContract.registerToken('0x0000000000000000000000000000000000000000', tronWeb.toSun(0.01));

    let res = await chainContract.depositNative({
      value: tronWeb.toSun(0.001),
      from: other
    })
    await chainContract.withdrawNative(player, tronWeb.toSun(1))
    let playerbalance = await tronWeb.trx.getBalance(player);
    console.log(playerbalance);
    let otherbalance = await tronWeb.trx.getBalance(other);
    console.log(otherbalance);
    let chainbalance = await tronWeb.trx.getBalance(chainContract.address);
    console.log(chainbalance);
  })

  it("should register and operate token", async function() {
    //await chainContract.registerToken(rgsToken.address, tronWeb.toSun(0.01));

    //let balance = await rgsToken.balanceOf(player)
    //assert.equal(balance.toString(), tronWeb.toSun(100).toString(), "balance is equal to 100 RGS");
    //await rgsToken.approve(rgsToken.address, tronWeb.toSun(100), {
    //  from: player
    //})
    //await chainContract.depositToken(rgsToken.address, tronWeb.toSun(1), {
    //  from: player
    //})
    //let allow = await rgsToken.allowance(player, rgsToken.address)
    //console.log('yoyo ', allow.toString())
    //balance = await rgsToken.balanceOf(player)
    //assert.equal(balance.toString(), tronWeb.toSun(99).toString(), "balance is equal to 100 RGS");
    //await chainContract.withdrawToken(rgsToken.address, player, tronWeb.toSun(1))

    //balance = await rgsToken.balanceOf(player)
    //assert.equal(balance.toString(), tronWeb.toSun(100).toString(), "balance is equal to 100 RGS");
  })

  //  it("should enable stake", async function() {
  //    await chainContract.enableStakeToken(rgsToken.address, tronWeb.toSun(0.01));
  //    await rgsToken.mint(admin, tronWeb.toSun(100));
  //    let balance = await rgsToken.balanceOf(admin);
  //    console.log(balance.toString());
  //    await rgsToken.mint(player, tronWeb.toSun(100));
  //    balance = await rgsToken.balanceOf(player);
  //    console.log(balance.toString());
  //    await rgsToken.approve(chainContract.address, tronWeb.toSun(1), {
  //      from: admin
  //    });
  //    await chainContract.stakeToken(rgsToken.address, tronWeb.toSun(1), {
  //      from: admin
  //    })
  //    await rgsToken.approve(chainContract.address, tronWeb.toSun(2), {
  //      from: player
  //    })
  //    await chainContract.stakeToken(rgsToken.address, tronWeb.toSun(1), {
  //      from: player
  //    })
  //    let totalStake = await chainContract.totalStake();
  //    console.log(totalStake.toString());
  //    await chainContract.unstakeToken(rgsToken.address, tronWeb.toSun(1), {
  //      from: player
  //    })
  //    balance = await rgsToken.balanceOf(player);
  //    console.log(balance.toString());
  //    await chainContract.setTimestamp(1578211884 + 86400)
  //
  //    await chainContract.redeemToken(rgsToken.address, {
  //      from: player
  //    })
  //    balance = await rgsToken.balanceOf(player);
  //    console.log(balance.toString());
  //  })
  it("should able to stake burn", async function() {

    await chainContract.setBurnToken(rgsToken.address);
    await rgsToken.approve(chainContract.address, tronWeb.toSun(10), {
      from: player
    })
    await chainContract.stakeBurnToken(tronWeb.toSun(10), {
      from: player
    });
    let records = await chainContract.stakeBurnRecordOf(admin, {
      from: player
    });
    console.log(records);
  });
});
