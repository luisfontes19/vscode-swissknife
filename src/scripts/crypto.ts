import * as crypto from 'crypto';
import * as bip39Lib from 'bip39';
import { IScript, ISwissKnifeContext } from '../Interfaces';

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


];

export default scripts;