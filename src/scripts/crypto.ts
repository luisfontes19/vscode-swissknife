import * as bip39Lib from 'bip39';
import * as crypto from 'crypto';
import { IScript, ISwissKnifeContext } from '../Interfaces';
import request = require('request');
const selfsigned = require('selfsigned');
export let CRYPTO_CURRENCIES: string[] = [];
console.log("Loading cryptocurrency list");
request({ url: 'https://www.cryptonator.com/api/currencies' }, (err, httpResponse) => {
  const crypto = JSON.parse(httpResponse.body).rows;
  CRYPTO_CURRENCIES = crypto.map((c: any) => `${c.name} (${c.code})`);
});


export const toMd5 = async (text: string): Promise<string> => {
  return crypto.createHash('md5').update(text).digest('hex');
};

export const toSha1 = async (text: string): Promise<string> => {
  return crypto.createHash('sha1').update(text).digest('hex');
};

export const toSha256 = async (text: string): Promise<string> => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

export const toSha512 = async (text: string): Promise<string> => {
  return crypto.createHash('sha512').update(text).digest('hex');
};

export const bip39Output = async (): Promise<string> => {
  const { mnemonic, seed } = bip39();
  return "Mnemonic: " + mnemonic + "\n" + "Seed: " + seed;
};

export const bip39 = () => {
  const mnemonic = bip39Lib.generateMnemonic();
  const seed = bip39Lib.mnemonicToSeedSync(mnemonic).toString('hex');

  return { mnemonic, seed };
};

export const selfSignedCert = async (context: ISwissKnifeContext): Promise<string> => {
  return new Promise((resolve, reject) => {
    context.vscode.window.showInputBox({ prompt: "What's the domain to generate the certificate to?" }).then(domain => {
      const attrs = [{ name: 'commonName', value: domain }];
      var pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });
      resolve(`${pems.cert}\n\n\n\n\n\n${pems.private}\n\n\n\n\n\n${pems.public}`);
    });
  });
};

export const cryptoPrice = async (text: string, context: ISwissKnifeContext): Promise<string> => {
  const reg = /([\d\.,]+)\s?(\w{3,5}) to (\w{3,5})/;

  let from: string, to: string, value: number;
  const m = text.match(reg); //try to see if we have something like: 10btc to usd. If not ask params to user

  if (m) {
    value = parseFloat(m[1]);
    from = m[2].toLowerCase();
    to = m[3].toLowerCase();
  }
  else {
    const tmp = (await context.vscode.window.showQuickPick(CRYPTO_CURRENCIES, { placeHolder: "Currency you are converting from" }))?.match(/\((\w+)\)$/);
    if (!tmp) return Promise.resolve("");

    const tmp2 = (await context.vscode.window.showQuickPick(CRYPTO_CURRENCIES, { placeHolder: "Currency you are converting to" }))?.match(/\((\w+)\)$/);
    if (!tmp2) return Promise.resolve("");

    from = tmp[1];
    to = tmp2[1];
    value = parseFloat(text);
  }

  return new Promise((resolve, reject) => {

    const pair = `${from}-${to}`;

    request({ url: `https://api.cryptonator.com/api/ticker/${pair}` }, (err, response) => {
      if (err) return reject(err);
      const res = JSON.parse(response.body);
      const price = parseFloat(res.ticker.price);

      const converted = value * price;
      const ret = `${value} ${from.toUpperCase()} is equal to ${converted} ${to.toUpperCase()}`;

      resolve(ret);
    });
  });

};


export const generateRSAKeyPair = async (): Promise<string> => {
  const res = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    }
  });

  //TODO: open each in a new tab?
  //TODO: ask for size and password
  return res.publicKey + "\n\n\n\n" + res.privateKey;
};


const scripts: IScript[] = [
  {
    title: "Md5 hash",
    detail: "Generate an md5 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toMd5)
  },
  {
    title: "SHA1 hash",
    detail: "Generate a SHA1 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toSha1)
  },
  {
    title: "SHA256 hash",
    detail: "Generate a SHA256 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toSha256)
  },
  {
    title: "SHA512 hash",
    detail: "Generate a SHA512 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toSha512)
  },

  {
    title: "Bip39 Mnemonic",
    detail: "Generates a secure Bip39 Mnemonic for crypto wallets",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(bip39Output)
  },

  {
    title: "RSA Key pair",
    detail: "Generates RSA public and private keys",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(generateRSAKeyPair)
  },
  {
    title: "Crypto currency value",
    detail: "Converts value of crypto currency or fiat(Can be used like: 1btc to dollar)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(cryptoPrice)
  },
  {
    title: "Generate a Self Signed Certificate",
    detail: "Generates a self signed certificate for the provided domain, to be used for dev purposes",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(selfSignedCert)
  },


];

export default scripts;