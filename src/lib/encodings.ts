import { leftPad } from './utils'

export const toBase64 = (str: string): string => {
  return Buffer.from(str, 'utf-8').toString("base64")
}

export const fromBase64 = (str: string): string => {
  return Buffer.from(str, 'base64').toString()
}

export const fromHex = (str: string): string => {
  return Buffer.from(str, 'hex').toString()
}

export const toHex = (str: string): string => {
  return Buffer.from(str, 'utf-8').toString("hex").toUpperCase()
}

export const toHTMLEncodeAll = (str: string): string => {
  return str.split("").map(c => `&#${c.charCodeAt(0)}`).join("")
}

export const toUrlEncode = (str: string): string => {
  return encodeURIComponent(str)
}

export const fromUrlEncode = (str: string): string => {
  return decodeURIComponent(str)
}

export const fullUrlEncode = (str: string): string => {
  let encoded = ''

  for (let i = 0; i < str.length; i++) {
    const h = parseInt(str.charCodeAt(i).toString()).toString(16)
    encoded += '%' + h
  }

  return encoded
}

export const toBinary = (str: string): string => {
  return str.split("").map(c => leftPad(c.charCodeAt(0).toString(2), 8)).join(" ")
}

export const fromBinary = (str: string): string => {
  return str.replace(/\s/g, "").match(/[0-1]{8}/g)?.map(b => String.fromCharCode(parseInt(b, 2))).join("") || ""
}

export const toMorseCode = (str: string): string => {
  const convertion: any = {
    "a": ".-", "b": "-...", "c": "-.-.", "d": "-..", "e": ".", "f": "..-.", "g": "--.",
    "h": "....", "i": "..", "j": ".---", "k": "-.-", "l": ".-..", "m": "--", "n": "-.", "o": "---", "p": ".--.",
    "q": "--.-", "r": ".-.", "s": "...", "t": "-", "u": "..-", "v": "...-", "w": ".--", "x": "-..-",
    "y": "-.--", "z": "--..", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....",
    "7": "--...", "8": "---..", "9": "----.", "0": "-----", ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.",
    "!": "-.-.--", "\"": ".-..-.", "$": "...-..-", "&": ".-...", "(": "-.--.", ")": "-.--.-", "=": "-...-", "'": ".----.",
    "+": ".-.-.", "-": "-....-", "_": "..--.-", ";": "-.-.-.", ":": "---..."
  }

  return str.toLowerCase().split("").map(c => {
    return convertion[c] || c
  }).join(" ")
}

//best article ever -> https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/
export const fromUnicodeEscaped = (str: string): string => {
  const regex = /\\u\{(\w{1,6})\}|\\u(\w{1,6})/ //\w can improved
  return str.match(new RegExp(regex, "g"))?.map(m => {
    const finding = m.match(regex)!
    const unicodeChar = finding[1] || finding[2]
    const codePoint = parseInt(unicodeChar, 16)
    return String.fromCodePoint(codePoint)
  }).join("") || ""
}

export const toUnicodeEscaped = (str: string): string => {
  return [...str].map(c => {
    const u = c.codePointAt(0)!.toString(16)
    return `\\u{${u}}`
  }).join("")
}

// From here: https://github.com/mathiasbynens/quoted-printable/blob/master/src/quoted-printable.js
// And here: https://gist.github.com/MarcelloDiSimone/933a13c6a5b6458ce29d972644bb5892
export const fromQuotedPrintable = (str: string): string => {
  return str
    .replace(/[\t\x20]$/gm, '')
    .replace(/=(?:\r\n?|\n|$)/g, '')
    .replace(/=([a-fA-F0-9]{2})/g, ($0, $1) => {
      return String.fromCharCode(parseInt($1, 16))
    })
    .replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, (c) => {
      return String.fromCharCode(((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f))
    })
    .replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, (c) => {
      return String.fromCharCode((c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f)
    })
}
