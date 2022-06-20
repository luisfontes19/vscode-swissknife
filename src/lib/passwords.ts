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

// fix module bias, using module to get a number won't get uniform numbers, there's a bias
// we fix it with this logic
// 256 is the number of possible outputs from crypto.randombytes(1)
// cool explanation here: // https://donjon.ledger.com/kaspersky-password-manager/
export const generateSecureCharCode = (): number => {
  const from = 33
  const to = 125
  const length = to - from
  const moduleBias = 256 - (256 - length)

  let n = 0
  do
    n = _generateCharCode(from, to)
  while (n > moduleBias)

  return n

}

export const generatePassword = (size: number) => {
  let charCodes: number[] = []
  for (let i = 0; i < size; i++)
    charCodes.push(generateSecureCharCode())

  return String.fromCharCode(...charCodes)
}
