import { IScript, ISwissKnifeContext } from './Interfaces'
import { hexToHsl, hexToHwb, hexToRgb, hslToHex, hwbToHex, rgbToHex } from './lib/colors'
import { countChars, countWords } from './lib/count'
import { bip39, generateRSAKeyPair, generateSelfSignedCertificate, hashIdentifier, toMd5, toSha1, toSha256, toSha512 } from './lib/crypto'
import { base64ToText, binaryToText, hexToText, htmlEncodeAllChars, quotedPrintableDecode, textToBase64, textToBinary, textToHex, toMorseCode, unicodeEncode, urlDecode, urlEncode, urlEncodeAllChars } from './lib/encodings'
import { loremIpsum, randomString, uuidv4 } from './lib/generators'
import { csvToMarkdown, markdownToHtml } from './lib/markdown'
import { scriptTemplateJs, scriptTemplateTs } from './lib/native'
import { checkPassword, generatePassword } from './lib/passwords'
import { capitalize, joinLines, sortAlphabetically, toCamelCase, toLowerCase, toUpperCase, slugify } from './lib/textBasic'
import { formattedDateToTimestamp, insertLocalDate, insertUtcDate, timestampToFormattedDate } from './lib/time'
import { escapeString, expandUrl, jwtDecode, linuxPermissions, pickRandomLine, requestToFetch, shortenUrl, startSecureServer, startServer, stopServer } from './lib/utils'
import { jsonToYaml, yamlToJson } from './lib/yaml'
import { readInputAsync, takeScreenshot } from './utils'

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
    title: "RGB(a) Color To Hex",
    detail: "Convert an RGB(A) like rgb(255,255,255) into Hex Color format",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => {
      const rgbs = parseRgbValues(text)

      const reg = /^\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?,?\s?\d?\.?\d{0,3}$/
      const match = text.match(reg)

      if (!match) {
        context.informationRoutine(async () => "Invalid RGB(A) Format")
        return text
      }

      const rgb = text.split(",").map((c) => parseInt(c))
      return rgbToHex(rgb[0], rgb[1], rgb[2], rgb[3])
    })

  },
  {
    title: "Hex Color to RGB",
    detail: "Convert an Hex Color (ex #FFFFFF) into RGB(A)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hexToRgb(text))
  },

  {
    title: "Hex Color to HSL",
    detail: "Convert an Hex Color (ex #FFFFFF) into HSL",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => {
      const matches = text.match(/^#?[0-9A-F]{8}|#?[0-9A-F]{6}$/)
      if (!matches) {
        context.informationRoutine(async () => "Invalid Hex Color")
        return text
      }

      return hexToHsl(text)
    })
  },

  {
    title: "HSL Color to Hex",
    detail: "Convert an HSL Color (ex hsl(0,0%,100%)) into Hex",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => {

      const res = text.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)?/)
      if (!res) {
        context.informationRoutine(async () => "Invalid HSL Format")
        return text
      }

      res.shift()
      const [h, s, l] = res.map(Number)
      return hslToHex(h, s, l)

    })
  },

  {
    title: "HWB Color to Hex",
    detail: "Convert an HWB Color (ex hwb(0,0%,100%)) into Hex",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => {

      const res = text.match(/hwb((\d+) (\d+)% (\d+)%)?/g)
      if (!res) {
        context.informationRoutine(async () => "Invalid or unsupported HSL Format. Only format like 'hwb(0 0% 100%)' is supported")
        return text
      }

      const [h, w, b] = res.map(Number)
      return hwbToHex(h, w, b)
    })
  },

  {
    title: "Hex Color to HWB",
    detail: "Convert an Hex Color (ex #FFFFFF) into HWB",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => {
      const matches = text.match(/^#?[0-9A-F]{8}|#?[0-9A-F]{6}$/)
      if (!matches) {
        context.informationRoutine(async () => "Invalid Hex Color")
        return text
      }

      return hexToHwb(text)
    })
  },

  // {
  //   title: "Test",
  //   detail: "Test",
  //   cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => {
  //     const { vscode } = context
  //     let activeEditor = vscode.window.activeTextEditor
  //     if (activeEditor) {
  //       const decorationType = vscode.window.createTextEditorDecorationType({
  //         gutterIconPath: , // image path or URI for the gutter icon
  //         overviewRulerColor: 'red', // color of the decorator
  //         overviewRulerLane: vscode.OverviewRulerLane.Right // specify the overview ruler lane
  //       })
  //       const line = 5 // The line number you want to add the decorator
  //       const startPos = new vscode.Position(line, 0)
  //       const endPos = new vscode.Position(line, 0)
  //       const range = new vscode.Range(startPos, endPos)
  //       const decoration = { range }
  //       activeEditor.setDecorations(decorationType, [decoration])
  //     }

  //     return Promise.resolve("asd")
  //   })
  // },




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
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => {
      const res = generateRSAKeyPair()
      return res.publicKey + "\n\n\n\n" + res.privateKey
    })
  },
  {
    title: "Self Signed Certificate",
    detail: "Generates a self signed certificate for the provided domain, to be used for dev purposes",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext): Promise<string> => {

      const domain = await readInputAsync("What's the domain to generate the certificate to?")
      const pems = generateSelfSignedCertificate(domain || "localhost")
      return `${pems.cert}\n\n\n\n\n\n${pems.private}\n\n\n\n\n\n${pems.public}`
    }
    )
  },
  {
    title: "Identify hash",
    detail: "Tries to identify the algorithm that was used to generate the supplied hash",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (input: string) => {
      const res = hashIdentifier(input)
      input += res.length > 0 ? `\nIdentified Algorithms:\n${res.join("\n")}` : "\nCould not identify an hash algorithm"

      return input
    })
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
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => unicodeEncode(text))
  },
  {
    title: "Unicode encode (js format)",
    detail: "Converts text into unicode escaped charaters for javascript",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => unicodeEncode(text))
  },
  {
    title: "Base64 encode",
    detail: "Convert text into base64 encoded string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToBase64(text))
  },
  {
    title: "Base64 decode",
    detail: "Decode base64 strings",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => base64ToText(text))
  },
  {
    title: "Hex decode",
    detail: "Convert an hex encoded string into readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hexToText(text))
  },
  {
    title: "Hex encode",
    detail: "Convert a string tino hex encoded",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToHex(text))
  },
  {
    title: "Quoted Printable Decode",
    detail: "Decode a “Quoted Printable” (QP encoding) string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => quotedPrintableDecode(text))
  },
  {
    title: "Url Encode",
    detail: "Url Encode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlEncode(text))
  },
  {
    title: "Url Encode (All Characters)",
    detail: "Url encode all characters in a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlEncodeAllChars(text))
  },
  {
    title: "Url Decode",
    detail: "Url decode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlDecode(text))
  },
  {
    title: "HTML Encode (ALL)",
    detail: "Html encode all characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => htmlEncodeAllChars(text))
  },
  {
    title: "Text To Binary",
    detail: "Converts text to binary",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToBinary(text))
  },
  {
    title: "Binary To Text",
    detail: "Converts binary to Text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => binaryToText(text))
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
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => csvToMarkdown(text))
  },
  {
    title: "Markdown to HTML",
    detail: "Converts Markdown to renderable HTML code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => markdownToHtml(text))
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
  {
    title: "Slugify",
    detail: "Convert a text to a slug",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => slugify(text))
  },

  ////////////////////////////////////////////////////////////////////////////////////
  //                                    TIME                                        //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "Date to Timestamp",
    detail: "Convert a valid date into unix timestamp",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => formattedDateToTimestamp(text))
  },
  {
    title: "Timestamp to Date",
    detail: "Converts a unix timestamp to UTC date",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => timestampToFormattedDate(text))
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
    title: "Code screenshot",
    detail: "Create a nice code screenshot",
    cb: async (context: ISwissKnifeContext) => takeScreenshot(context)
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
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(shortenUrl)
  },
  {
    title: "Url Unshorten (url expand)",
    detail: "Converts a shorten URL into the full url",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => expandUrl(text))
  },
  {
    title: "Text to String (Escape)",
    detail: "Converts text to string, escaping necessary characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => escapeString(text))
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
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => pickRandomLine(text))
  },
  ////////////////////////////////////////////////////////////////////////////////////
  //                                     YAML                                       //
  ////////////////////////////////////////////////////////////////////////////////////
  {
    title: "JSON to YAML",
    detail: "Converts a JSON structure to YAML",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => jsonToYaml(text))
  },
  {
    title: "YAML to JSON",
    detail: "Converts a YAML structure to JSON",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => yamlToJson(text))
  },
]

export default scripts
function parseRgbValues(text: string) {
  throw new Error('Function not implemented.')
}

