import { IScript, ISwissKnifeContext } from './Interfaces'
import { hexToRgb, rgbToHex } from './lib/colors'
import { countChars, countWords } from './lib/count'
import { bip39, generateRSAKeyPair, hashIdentifier, selfSignedCert, toMd5, toSha1, toSha256, toSha512 } from './lib/crypto'
import { fromBase64, fromBinary, fromHex, fromQuotedPrintable, fromUnicodeEscaped, fromUrlEncode, fullUrlEncode, toBase64, toBinary, toHex, toHTMLEncodeAll, toMorseCode, toUnicodeEscaped, toUrlEncode } from './lib/encodings'
import { loremIpsum, randomString, uuidv4 } from './lib/generators'
import { fromCsv, toHtml } from './lib/markdown'
import { scriptTemplateJs, scriptTemplateTs } from './lib/native'
import { checkPassword, generatePassword } from './lib/passwords'
import { capitalize, joinLines, sortAlphabetically, toCamelCase, toLowerCase, toUpperCase } from './lib/textBasic'
import { fromTimestamp, insertLocalDate, insertUtcDate, toTimestamp } from './lib/time'
import { jwtDecode, linuxPermissions, randomLine, requestToFetch, startSecureServer, startServer, stopServer, textToString, urlExpand, urlShortener } from './lib/utils'
import { fromYaml, toYaml } from './lib/yaml'
import { readInputAsync } from './utils'

// cb expects a callback with the following signature:
// (context: ISwissKnifeContext) => Promise<void>
// but since most of the times we are using a routine method (replaceRoutine, insertRoutine or informationRoutine) 
//  they also expect a callback that will be called for each input. 
// This may seem a bit confusing in the file but its actually really simple: 
// - cb always expects a callback method
// - if we use a routine method it will also need a callback method (async)
const scripts: IScript[] = [

  ////////////////////////////////////////////////////////////////////////////////////
  //                                    COLORS                                      //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "RGB(a) To Hex",
    detail: "Convert an RGB(A) like rgb(255,255,255) into Hex Color format",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => rgbToHex(text))

  },
  {
    title: "Hex to RGB",
    detail: "Convert an Hex Color (ex #FFFFFF) into RGB(A)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hexToRgb(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                    COUNT                                       //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "Count words",
    detail: "Count the number of words determined by the \S regex",
    cb: (context: ISwissKnifeContext) => context.informationRoutine(async (text: string) => `${countWords(text)} words`)
  },
  {
    title: "Count characters",
    detail: "Count the number of characters in the text",
    cb: (context: ISwissKnifeContext) => context.informationRoutine(async (text: string) => `${countChars(text)} chars`)
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                    CRYPTO                                      //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "Md5 hash",
    detail: "Generate an md5 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toMd5(text))
  },
  {
    title: "SHA1 hash",
    detail: "Generate a SHA1 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toSha1(text))
  },
  {
    title: "SHA256 hash",
    detail: "Generate a SHA256 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toSha256(text))
  },
  {
    title: "SHA512 hash",
    detail: "Generate a SHA512 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toSha512(text))
  },
  {
    title: "Bip39 Mnemonic",
    detail: "Generates a secure Bip39 Mnemonic for crypto wallets",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => {
      const { mnemonic, seed } = bip39()
      return "Mnemonic: " + mnemonic + "\n" + "Seed: " + seed
    })
  },
  {
    title: "RSA Key pair",
    detail: "Generates RSA public and private keys",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => generateRSAKeyPair())
  },
  {
    title: "Self Signed Certificate",
    detail: "Generates a self signed certificate for the provided domain, to be used for dev purposes",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext): Promise<string> => {

      const domain = await readInputAsync("What's the domain to generate the certificate to?")
      const pems = selfSignedCert(domain || "localhost")
      return `${pems.cert}\n\n\n\n\n\n${pems.private}\n\n\n\n\n\n${pems.public}`
    }
    )
  },
  {
    title: "Identify hash",
    detail: "Tries to identify the algorithm that was used to generate the supplied hash",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hashIdentifier(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                  ENCODINGS                                     //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "To Morse code",
    detail: "Converts text into morse code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toMorseCode(text))
  },
  {
    title: "Unicode decode",
    detail: "Decode unicode escaoed string. (ex: \\u00AA or \\u{00AA}",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromUnicodeEscaped(text))
  },
  {
    title: "Unicode encode (js format)",
    detail: "Converts text into unicode escaped charaters for javascript",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toUnicodeEscaped(text))
  },
  {
    title: "Base64 encode",
    detail: "Convert text into base64 encoded string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toBase64(text))
  },
  {
    title: "Base64 decode",
    detail: "Decode base64 strings",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromBase64(text))
  },
  {
    title: "Hex decode",
    detail: "Convert an hex encoded string into readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromHex(text))
  },
  {
    title: "Hex encode",
    detail: "Convert a string tino hex encoded",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toHex(text))
  },
  {
    title: "Quoted Printable Decode",
    detail: "Decode a “Quoted Printable” (QP encoding) string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromQuotedPrintable(text))
  },
  {
    title: "Url Encode",
    detail: "Url Encode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toUrlEncode(text))
  },
  {
    title: "Url Encode (All Characters)",
    detail: "Url encode all characters in a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fullUrlEncode(text))
  },
  {
    title: "Url Decode",
    detail: "Url decode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromUrlEncode(text))
  },
  {
    title: "HTML Encode (ALL)",
    detail: "Html encode all characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toHTMLEncodeAll(text))
  },
  {
    title: "Text To Binary",
    detail: "Converts text to binary",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toBinary(text))
  },
  {
    title: "Binary To Text",
    detail: "Converts binary to Text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromBinary(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                 GENERATORS                                     //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "UUIDv4",
    detail: "Generates a cryptographically secure UUID (v4)",
    cb: (context: ISwissKnifeContext) => context.insertRoutine((async () => uuidv4()))
  },
  {
    title: "Random String",
    detail: "Generates a cryptographically secure random string",
    cb: (context: ISwissKnifeContext) => {
      return context.insertRoutine(async (context: ISwissKnifeContext) => {
        const answer = await readInputAsync("Whats the size of the string? (default 30)\n")
        const size = answer ? parseInt(answer) : 30
        return randomString(size)
      })
    }
  },
  {
    title: "Lorem Ipsum",
    detail: "Generates a random Lorem Ipsum Text",
    cb: (context: ISwissKnifeContext) => {
      return context.insertRoutine(async (context: ISwissKnifeContext) => {
        const answer = await readInputAsync("How many words do you want? (default 30)\n")
        const nWords = answer ? parseInt(answer) : 30

        return loremIpsum(nWords)
      })
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                  MARKDOWN                                      //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "CSV to Markdown",
    detail: "Generates a markdown table from the supplied CSV",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromCsv(text))
  },
  {
    title: "Markdown to HTML",
    detail: "Converts Markdown to renderable HTML code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toHtml(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                   NATIVE                                       //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "New Swissknife Script (JS)",
    detail: "Generates a boilerplate code for a Swissknife script",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => scriptTemplateJs())
  },
  {
    title: "New Swissknife Script (TS)",
    detail: "Generates a boilerplate Typescript code for a Swissknife script (needs to be transpiled)",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => scriptTemplateTs())
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                  PASSWORDS                                     //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "Password strength",
    detail: "Check the strength of a password (using zxcvbn)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => checkPassword(text))
  },
  {
    title: "Generate Password",
    detail: "Generates a secure, strong password",
    cb: (context: ISwissKnifeContext) => {
      return context.insertRoutine(async (context: ISwissKnifeContext): Promise<string> => {

        const answer = await readInputAsync("How many character do you want in the password? (default 20)\n")
        const size = answer ? parseInt(answer) : 20

        return generatePassword(size)
      })
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                 TEXT BASIC                                     //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "To Lower Case",
    detail: "Converts text to lower case",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toLowerCase(text))
  },
  {
    title: "To Upper Case",
    detail: "Converts text to upper case",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toUpperCase(text))
  },
  {
    title: "Capitalize",
    detail: "Capitalizes every first letter of each word",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => capitalize(text))
  },
  {
    title: "To Camel Case",
    detail: "Capitalizes every single word and concatenates text into a single word (removes non alphanumeric chars)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toCamelCase(text))
  },
  {
    title: "Join lines",
    detail: "Join multiple lines delimited by a string of your choosing",
    cb: (context: ISwissKnifeContext) => {
      return context.replaceRoutine(async (text: string, context: ISwissKnifeContext) => {
        const answer = await readInputAsync("What do you want to delimit the lines with? (press enter for none)")
        return joinLines(text, answer || "")
      })
    }
  },
  {
    title: "Sort Lines",
    detail: "Sorts lines alphabetically",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => sortAlphabetically(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                    TIME                                        //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "Date to Timestamp",
    detail: "Convert a valid date into unix timestamp",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toTimestamp(text))
  },
  {
    title: "Timestamp to Date",
    detail: "Converts a unix timestamp to UTC date",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromTimestamp(text))
  },
  {
    title: "UTC DateTime",
    detail: "Inserts current date/time in UTC format",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext) => insertUtcDate())
  },
  {
    title: "Local DateTime",
    detail: "Inserts current date/time for local timezone",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext) => insertLocalDate())
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                    UTILS                                       //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "JWT Decode",
    detail: "Decodes a jwt token",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => jwtDecode(text))
  },
  {
    title: "Request to fetch",
    detail: "Converts a raw HTTP request into a javascript fetch code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => requestToFetch(text))
  },

  {
    title: "Unix/Linux Permission To Human Readable",
    detail: "Convert a unix permission (like 777) to a human readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => linuxPermissions(text))
  },
  {
    title: "Url Shorten",
    detail: "Shortens an URL",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(urlShortener)
  },
  {
    title: "Url Unshorten (url expand)",
    detail: "Converts a shorten URL into the full url",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlExpand(text))
  },
  {
    title: "Text to String (Escape)",
    detail: "Converts text to string, escaping necessary characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToString(text))
  },
  {
    title: "Start Local HTTP Server",
    detail: "Creates an HTTP Server and dumps the requests content. You can also serve folders",
    cb: (context: ISwissKnifeContext) => startServer()
  },
  {
    title: "Start Local HTTPS Server",
    detail: "Creates an HTTPS Server and dumps the requests content. You can also serve folders",
    cb: (context: ISwissKnifeContext) => startSecureServer()
  },
  {
    title: "Stop HTTP Server",
    detail: "Stops the http(s) server started by this extension",
    cb: (context: ISwissKnifeContext) => stopServer()
  },
  {
    title: "Pick random line",
    detail: "One option per line, chooses one line at random",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => randomLine(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                     YAML                                       //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "JSON to YAML",
    detail: "Converts a JSON structure to YAML",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toYaml(text))
  },
  {
    title: "YAML to JSON",
    detail: "Converts a YAML structure to JSON",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => fromYaml(text))
  },
]

export default scripts