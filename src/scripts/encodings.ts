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

export const toBinary = async (str: string): Promise<string> => {
  return str.split("").map(c => c.charCodeAt(0).toString(2)).join(" ");
};

export const fromBinary = async (str: string): Promise<string> => {
  return str.replace(/\s/g, "").match(/[0-1]{8}/g)?.map(b => String.fromCharCode(parseInt(b, 2))).join("") || "";
};

export const fromUnicodeEscaped = async (str: string): Promise<string> => {
  var unicodeRegex = /\\u([\d\w]{4})/gi;
  return str.replace(unicodeRegex, (match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
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

export const toUnicodeEscaped = async (str: string): Promise<string> => {

  return str.split("").map(c => {
    let unicode = c.codePointAt(0)?.toString(16) || "";
    return "\\u" + "0".repeat(4 - unicode.length) + unicode;
  }).join("");
};

const scripts: IScript[] = [
  {
    title: "Text to Morse code",
    detail: "Converts text into morse code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromUnicodeEscaped)
  },
  {
    title: "Unicode escaped to Text",
    detail: "Decode unicode escaoed string. (ex: \\u00AA",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromUnicodeEscaped)
  },
  {
    title: "Text to Unicode escaped",
    detail: "Converts text into unicode escaped charaters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toUnicodeEscaped)
  },
  {
    title: "Text to Base64",
    detail: "Convert text into base64 encoded string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toBase64)
  },
  {
    title: "Base64 to Text",
    detail: "Decode base64 strings",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromBase64)
  },
  {
    title: "Hex to Text",
    detail: "Convert an hex encoded string into readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromHex)
  },
  {
    title: "Text to Hex",
    detail: "Convert a string tino hex encoded",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toHex)
  },
  {
    title: "Url Encode",
    detail: "Url Encode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toUrlEncode)
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