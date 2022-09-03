import * as crypto from 'crypto'
import * as zxcvbn from 'zxcvbn'


export const checkPassword = (text: string): string => {
  const result = zxcvbn(text)

  return `Password: ${text}\n` +
    `Score (from 1-5): ${result.score + 1}\n` +
    `Feedback: ${result.feedback.warning}\n` +
    `Suggestion: ${result.feedback.suggestions}\n` +
    `Estimated guesses to crack: ${result.guesses}\n` +
    `Estimated time to crack the password on a single machine can go from ` +
    `${result.crack_times_display.offline_fast_hashing_1e10_per_second} to ${result.crack_times_display.offline_slow_hashing_1e4_per_second}\n`
}


const _generateCharCode = (from: number, to: number): number => {
  return ((crypto.randomBytes(1)[0]) % to) + from
}

export const generatePassword = (length: number) => {
  // TODO: make this configurable
  let charSet = 'abcdefghijklmnopqrstuvwxyz'
  charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  charSet += '0123456789'
  charSet += '!@#$%^&*()_+~`|}{[]\\:;?><,./-='

  const passwordChars = []
  for (let i = 0; i < length; i++) {
    const pos = crypto.randomInt(0, charSet.length - 1)
    passwordChars.push(charSet[pos])
  }

  return passwordChars.join('')
}
