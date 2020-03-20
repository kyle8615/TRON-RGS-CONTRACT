const TronWeb = require('TronWeb');
const SunWeb = require('SunWeb');
const rgsToken = require('./build/contracts/RgsToken.json');

let privateKey = process.env.PRIVATE_KEY_SHASTA;
const mainchain = new TronWeb({
  fullNode: 'http://47.252.85.111:8090',
  solidityNode: 'http://47.252.85.111:8091',
  eventServer: 'https://testapi.tronex.io',
  privateKey
});
const sidechain = new TronWeb({
  fullNode: 'http://47.252.85.90:8090',
  solidityNode: 'http://47.252.85.90:8091',
  eventServer: 'https://suntest.tronex.io/event',
  privateKey
})
const sunWeb = new SunWeb(
  mainchain,
  sidechain,
  'TFLtPoEtVJBMcj6kZPrQrwEdM3W3shxsBU',
  'TRDepx5KoQ8oNbFVZ5sogwUxtdYmATDRgX',
  '413AF23F37DA0D48234FDD43D89931E98E1144481B'
);

async function go() {
  //  const tronWeb = new TronWeb({
  //    fullNode: 'http://47.252.85.111:8090',
  //    solidityNode: 'http://47.252.85.111:8091',
  //    eventServer: 'https://testapi.tronex.io',
  //    privateKey
  //  });
  //  const tokenaddress = 'TLCzkVBJBTxyC8su5AaJZtFSUcgaGrLAfw';
  //  const chainaddress = 'TEb27H2XtSnBKYBCsmuNEQfePmAz7DHykK';
  //  const rgsToken = await tronWeb.contract().at(tokenaddress);
  //  const chainContract = await tronWeb.contract().at(chainaddress);
  //
  //let a = tronWeb.address.fromHex('4176186683a204ce48f2c62cf027a92c874e861bce')
  //console.log(a);
  //await rgsToken.mint('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n', tronWeb.toSun(100)).send();
  //let balance = await rgsToken.balanceOf('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n').call();
  //console.log(balance.toString());

  let txs = await sunWeb.mappingTrc20('c9c2c180506937eaadd5430fdf0d967d8d38dd4646b5744b7aff23465d471a80', 10000000, 100000);
  console.log(txs)

  //let balance = await sunWeb.mainchain.trx.getBalance('TLCzkVBJBTxyC8su5AaJZtFSUcgaGrLAfw');

  //console.log(balance.toString());
  //let res = await sunWeb.depositTrx(TronWeb.toSun(10).toString(), 10000, 1000000);
  //console.log(res);
  //let balance = await sunWeb.sidechain.trx.getBalance('TG1ZZ8cZsG7cLzRFb8AeE6U5Tzmg4aQa2n');

}

go();
