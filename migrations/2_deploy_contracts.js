var Chain = artifacts.require("./Chain.sol");
var RgsToken = artifacts.require("./RgsToken.sol");

const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
    fullNode: 'https://api.shasta.trongrid.io',
    solidityNode: 'https://api.shasta.trongrid.io',
    eventServer: 'https://api.shasta.trongrid.io'
  },
  '6D24852A27ED1A37AF2F20D99BEE465781C1A020A3D6203CD5CEA433F4E53C5'
)

module.exports = function(deployer, network, account) {
  console.log("account: ", account);
  if (network == "development") {
    deployer.deploy(RgsToken, "RGSToken", "RGS", tronWeb.toSun(1e9))
    deployer.deploy(Chain, account);
  } else {
    deployer.deploy(RgsToken, "XXXToken", "XXX", tronWeb.toSun(1e9))
    deployer.deploy(Chain, account);
  }
};
