var RgsToken = artifacts.require("./RgsToken.sol");
var RgsOps = artifacts.require("./RgsOps.sol");

const SHASTA_ADMIN = 'TCuUczA1wbcMXQ71GSdk6Y2yF2g8zqRsb3';
const TronWeb = require("tronweb");

module.exports = function(deployer, network, account) {
  if (network == "development") {
    let rgsToken;
    deployer.deploy(RgsToken, "RGSToken", "RGS", TronWeb.toSun(1e9))
      .then(() => RgsToken.deployed())
      .then((instance) => {
        rgsToken = instance;
        return deployer.deploy(RgsOps, account)
      })
      .then(() => RgsOps.deployed())
      .then((instance) => {
        instance.setBurnToken(rgsToken.address);
        instance.setStakeToken(rgsToken.address);
      })
  } else if (network == "shasta") {
    let rgsToken;
    deployer.deploy(RgsToken, "RGToken", "RGT", TronWeb.toSun(1e9))
      .then(() => RgsToken.deployed())
      .then(async (instance) => {
        rgsToken = instance;
        await instance.addMinter(SHASTA_ADMIN);
        await instance.mint(account, TronWeb.toSun(1000000))
        await instance.addMinter(SHASTA_ADMIN);
        await instance.renounceMinter();
        return deployer.deploy(RgsOps, account)
      })
      .then(() => RgsOps.deployed())
      .then(async (instance) => {
        await instance.setBurnToken(rgsToken.address);
        await instance.setStakeToken(rgsToken.address);
        await instance.registerToken("0x0000000000000000000000000000000000000000", TronWeb.toSun(0.001));
        //        await instance.transferAdministrator(SHASTA_ADMIN);
      })
  }
};
