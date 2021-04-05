import { IScript, ISwissKnifeContext } from '../Interfaces';

export const toBase64 = async (str: string): Promise<string> => {
  return Buffer.from(str, 'utf-8').toString("base64");
};

export const fromBase64 = async (str: string): Promise<string> => {
  return Buffer.from(str, 'base64').toString();
};

export const fromHex = async (str: string): Promise<string> => {
  return Buffer.from(str, 'hex').toString();
};

export const toHex = async (str: string): Promise<string> => {
  return Buffer.from(str, 'utf-8').toString("hex");
};

export const toHTMLEncodeAll = async (str: string): Promise<string> => {
  return str.split("").map(c => `&#${c.charCodeAt(0)}`).join("");
};

export const toUrlEncode = async (str: string): Promise<string> => {
  return encodeURIComponent(str);
};

export const fromUrlEncode = async (str: string): Promise<string> => {
  return decodeURIComponent(str);
};

export const fullUrlEncode = async (str: string): Promise<string> => {
  let encoded = '';

  for (let i = 0; i < str.length; i++) {
    const h = parseInt(str.charCodeAt(i).toString()).toString(16);
    encoded += '%' + h;
  }

  return encoded;
};

export const toBinary = async (str: string): Promise<string> => {
  return str.split("").map(c => c.charCodeAt(0).toString(2)).join(" ");
};

export const fromBinary = async (str: string): Promise<string> => {
  return str.replace(/\s/g, "").match(/[0-1]{8}/g)?.map(b => String.fromCharCode(parseInt(b, 2))).join("") || "";
};



export const toMorseCode = async (str: string): Promise<string> => {
  const convertion: any = {
    "a": ".-", "b": "-...", "c": "-.-.", "d": "-..", "e": ".", "f": "..-.", "g": "--.",
    "h": "....", "i": "..", "j": ".---", "k": "-.-", "l": ".-..", "m": "--", "n": "-.", "o": "---", "p": ".--.",
    "q": "--.-", "r": ".-.", "s": "...", "t": "-", "u": "..-", "v": "...-", "w": ".--", "x": "-..-",
    "y": "-.--", "z": "--..", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....",
    "7": "--...", "8": "---..", "9": "----.", "0": "-----", ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-."
  };

  return str.toLowerCase().split("").map(c => {
    return convertion[c] || c;
  }).join("");
};

//best article ever -> https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/
export const fromUnicodeEscaped = async (str: string): Promise<string> => {
  const regex = /\\u\{(\w{1,6})\}|\\u(\w{1,6})/; //\w can improved
  return str.match(new RegExp(regex, "g"))?.map(m => {
    const finding = m.match(regex)!;
    const unicodeChar = finding[1] || finding[2];
    const codePoint = parseInt(unicodeChar, 16);
    return String.fromCodePoint(codePoint);
  }).join("") || "";
};

export const toUnicodeEscaped = async (str: string): Promise<string> => {
  return [...str].map(c => {
    const u = c.codePointAt(0)!.toString(16);
    return `\\u{${u}}`;
  }).join("");
};

const scripts: IScript[] = [
  {
    title: "To Morse code",
    detail: "Converts text into morse code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromUnicodeEscaped)
  },
  {
    title: "Unicode decode",
    detail: "Decode unicode escaoed string. (ex: \\u00AA or \\u{00AA}",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromUnicodeEscaped)
  },
  {
    title: "Unicode encode (js format)",
    detail: "Converts text into unicode escaped charaters for javascript",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toUnicodeEscaped)
  },
  {
    title: "Base64 encode",
    detail: "Convert text into base64 encoded string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toBase64)
  },
  {
    title: "Base64 decode",
    detail: "Decode base64 strings",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromBase64)
  },
  {
    title: "Hex decode",
    detail: "Convert an hex encoded string into readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromHex)
  },
  {
    title: "Hex encode",
    detail: "Convert a string tino hex encoded",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toHex)
  },
  {
    title: "Url Encode",
    detail: "Url Encode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toUrlEncode)
  },
  {
    title: "Url Encode (All Characters)",
    detail: "Url encode all characters in a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fullUrlEncode)
  },
  {
    title: "Url Decode",
    detail: "Url decode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromUrlEncode)
  },
  {
    title: "HTML Encode (AlL)",
    detail: "Html encode all characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toHTMLEncodeAll)
  },
  {
    title: "Text To Binary",
    detail: "Converts text to binary",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toBinary)
  },
  {
    title: "Binary To Text",
    detail: "Converts binary to Text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromBinary)
  },
];

export default scripts;