import * as crypto from 'crypto'
import { v4 } from 'uuid'

const loremWords = ("dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut " +
  "labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris " +
  "nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit " +
  "esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in " +
  "culpa qui officia deserunt mollit anim id est laborum").split(" ")

export const uuidv4 = (): string => {
  return v4()
}

export const randomString = (size: number) => {
  return crypto.randomBytes(size).toString('base64').slice(0, size)
}

export const loremIpsum = (nWords: number): string => {
  let li = ""
  if (Math.floor(Math.random() * 5)) {
    //To throw Lorem ipsum some times :)
    li = "Lorem ipsum "
    nWords -= 2
  }

  for (let i = 0; i < nWords; i++) {
    const n = Math.floor(Math.random() * loremWords.length)
    li += loremWords[n] + " "
  }

  return li
}