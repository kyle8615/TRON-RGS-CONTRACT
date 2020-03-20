const TronWeb = require("tronweb");
const Big = require('big.js');

const RgsToken = artifacts.require("RgsToken");

contract('RgsToken', function(accounts) {
  let sender = accounts[0];
  let beneficiary = accounts[1];
  let player = accounts[2];
  let catchRevert = require("./exceptions.js").catchRevert;

  let rgsToken;
  it("should deploying token", async () => {
    rgsToken = await RgsToken.deployed();
    let decimals = await rgsToken.decimals();
    assert.equal(await decimals, 6, "token name is not RgsToken")
    let symbol = await rgsToken.symbol();
    assert.equal(await symbol, "RGS", "token symbol is not RgsToken")
    let cap = await rgsToken.cap();
    assert(await rgsToken.isMinter(sender), "sender is not minter")
  })

  it("should capped", async () => {
    let beforeTS = await rgsToken.totalSupply();
    assert.equal(beforeTS, 0, "ts equal to 0")
    await rgsToken.mint(beneficiary, tronWeb.toSun(100));
    let midTS = await rgsToken.totalSupply();
    assert.equal(midTS, tronWeb.toSun(100), "ts equal to 100 RGS")
    await rgsToken.mint(beneficiary, tronWeb.toSun(1e10));
    let afterTS = await rgsToken.totalSupply();
    assert.equal(afterTS, tronWeb.toSun(100), "ts not mint over capped");
    await rgsToken.mint(beneficiary, tronWeb.toSun(1e9 * 0.999999));
    let finalTS = await rgsToken.totalSupply();
    assert.equal(finalTS, tronWeb.toSun(1e9 * 0.999999 + 100), "ts equal to 200 RGS");
    let balance = await rgsToken.balanceOf(beneficiary)
    assert.equal(balance.toString(), finalTS.toString(), "balance is equal to 200 RGS");
    await rgsToken.mint("TRr6xVXoPQfUeqk16jC1aF14sn1uCZykSB", tronWeb.toSun(100));
  });

  it("test minter", async () => {
    await rgsToken.addMinter(beneficiary);
    let isMinter = await rgsToken.isMinter(beneficiary);
    assert.ok(isMinter, "fail authorize minter");
    await rgsToken.renounceMinter();
    isMinter = await rgsToken.isMinter(sender);
    assert.ok(!isMinter, "fail unauthorize minter");
    await rgsToken.transfer("TRr6xVXoPQfUeqk16jC1aF14sn1uCZykSB", tronWeb.toSun(10))
    let balance = await rgsToken.balanceOf("TRr6xVXoPQfUeqk16jC1aF14sn1uCZykSB")
  });

  it("test transfer", async () => {
    let berforeBeneficiaryBalance = await rgsToken.balanceOf(beneficiary);
    await rgsToken.transfer(player, tronWeb.toSun(10), {
      from: beneficiary
    });
    let afterBeneficiaryBalance = await rgsToken.balanceOf(beneficiary);
    assert.equal(berforeBeneficiaryBalance.sub(afterBeneficiaryBalance).toNumber(), tronWeb.toSun(10), "remainder balnace error")
    let playerBalance = await rgsToken.balanceOf(player);
    assert.equal(berforeBeneficiaryBalance.sub(afterBeneficiaryBalance).toNumber(), tronWeb.toSun(10), "remainder balnace error")
    assert.equal(playerBalance, tronWeb.toSun(10), "remainder balnace error")
  });
});
