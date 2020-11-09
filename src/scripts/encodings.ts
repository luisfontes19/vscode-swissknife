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



const scripts: IScript[] = [
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
];

export default scripts;