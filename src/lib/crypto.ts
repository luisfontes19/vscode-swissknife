import * as bip39Lib from 'bip39'
import * as crypto from 'crypto'
// import * as eccrypto from 'eccrypto';
import { ec } from 'elliptic'
// @ts-ignore ADD TYPES
import * as HashIdentifier from 'hash-identifier'
// @ts-ignore TODO: ADD TYPES
import * as selfsigned from 'selfsigned'
import { ISwissKnifeContext } from '../Interfaces'
import request = require('request')

export const toMd5 = (text: string): string => {
  return crypto.createHash('md5').update(text).digest('hex')
}

export const toSha1 = (text: string): string => {
  return crypto.createHash('sha1').update(text).digest('hex')
}

export const toSha256 = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export const toSha512 = (text: string): string => {
  return crypto.createHash('sha512').update(text).digest('hex')
}

export const bip39 = () => {
  const mnemonic = bip39Lib.generateMnemonic()
  const seed = bip39Lib.mnemonicToSeedSync(mnemonic).toString('hex')

  return { mnemonic, seed }
}

export const selfSignedCert = (domain: string): any => {
  const attrs = [{ name: 'commonName', value: domain }]
  return selfsigned.generate(attrs, { days: 365, keySize: 2048 })
}

export const generateElipticKeypair = async (context: ISwissKnifeContext): Promise<string> => {
  const supportedCurves = ["secp256k1", "p192", "p224", "p256", "p384", "p521", "curve25519", "ed25519"]

  const curve = (await context.vscode.window.showQuickPick(supportedCurves, { placeHolder: "Select Curve" })) || ""
  if (!supportedCurves.includes(curve)) return Promise.reject("Curve not supported")

  const keypair = new ec(curve).genKeyPair()

  return `Private key:${keypair.getPrivate("hex")}\nPublic Key:${keypair.getPublic(true, "hex")}`
}

export const hashIdentifier = (input: string): string => {
  const res = HashIdentifier.checkAlgorithm(input)
  input += res.length > 0 ? `\nIdentified Algorithms:\n${res.join("\n")}` : "\nCould not identify an hash algorithm"

  return input
}

export const generateRSAKeyPair = (): string => {
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
  })

  //TODO: open each in a new tab?
  //TODO: ask for size and password
  return res.publicKey + "\n\n\n\n" + res.privateKey
}

