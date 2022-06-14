import * as crypto from 'crypto'
import { v4 } from 'uuid'
import { IScript, ISwissKnifeContext } from '../Interfaces'
import { readInputAsync } from '../utils'

export const uuidv4 = async (): Promise<string> => {
  return v4()
}

export const _randomString = (size: number) => {
  return crypto.randomBytes(size).toString('base64').slice(0, size)
}

export const randomString = async (context: ISwissKnifeContext): Promise<string> => {
  const answer = await readInputAsync("Whats the size of the string? (default 30)\n")
  const size = answer ? parseInt(answer) : 30
  return _randomString(size)

}

const scripts: IScript[] = [
  {
    title: "UUIDv4",
    detail: "Generates a cryptographically secure UUID (v4)",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(uuidv4)
  },
  {
    title: "Random String",
    detail: "Generates a cryptographically secure random string",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(randomString)
  }
]

export default scripts