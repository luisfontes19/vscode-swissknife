import { IScript, ISwissKnifeContext } from './Interfaces'
import { hexToHsl, hexToHwb, hexToRgb, hslToHex, hwbToHex, rgbToHex } from './lib/colors'
import { countChars, countWords } from './lib/count'
import { bip39, generateRSAKeyPair, generateSelfSignedCertificate, hashIdentifier, toMd5, toSha1, toSha256, toSha512 } from './lib/crypto'
import { base64ToText, binaryToText, hexToText, htmlEncodeAllChars, quotedPrintableDecode, textToBase64, textToBinary, textToHex, toMorseCode, unicodeDecode, unicodeEncode, urlDecode, urlEncode, urlEncodeAllChars } from './lib/encodings'
import { loremIpsum, randomString, uuidv4 } from './lib/generators'
import { binaryToIp, decimalToIp, hexadecimalToIp, ipToBinary, ipToDecimal, ipToHexadecimal, ipToOctal, octalToIp } from './lib/ip'
import { csvToMarkdown, markdownToHtml } from './lib/markdown'
import { scriptTemplateJs, scriptTemplateTs } from './lib/native'
import { checkPassword, generatePassword } from './lib/passwords'
import { capitalize, joinLines, slugify, sortAlphabetically, toCamelCase, toLowerCase, toUpperCase, unescapeDoubleQuotes, unescapeSingleQuotes } from './lib/textBasic'
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
  {
    title: "Binary: Text To Binary",
    detail: "Converts text to binary",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToBinary(text))
  },
  {
    title: "Binary: Binary To Text",
    detail: "Converts binary to Text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => binaryToText(text))
  },

  {
    title: "Bip39: Generate",
    detail: "Generates a secure Bip39 Mnemonic for crypto wallets",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => {
      const { mnemonic, seed } = bip39()
      return "Mnemonic: " + mnemonic + "\n" + "Seed: " + seed
    })
  },
  {
    title: "Base64: Encode",
    detail: "Convert text into base64 encoded string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToBase64(text))
  },
  {
    title: "Base64: Decode",
    detail: "Decode base64 strings",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => base64ToText(text))
  },

  {
    title: "Color: RGB(a) To Hex",
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
    title: "Color: Hex To RGB",
    detail: "Convert an Hex Color (ex #FFFFFF) into RGB(A)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hexToRgb(text))
  },

  {
    title: "Color: Hex To HSL",
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
    title: "Color: HSL To Hex",
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
    title: "Color: HWB To Hex",
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
    title: "Color: Hex To HWB",
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
  {
    title: "Datetime: To Timestamp",
    detail: "Convert a valid date into unix timestamp",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => formattedDateToTimestamp(text))
  },
  {
    title: "Datetime: From Timestamp",
    detail: "Converts a unix timestamp to UTC date",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => timestampToFormattedDate(text))
  },
  {
    title: "Datetime: Now/Current (UTC)",
    detail: "Inserts current date/time in UTC format",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext) => insertUtcDate())
  },
  {
    title: "Datetime: Now/Current (Local Timezone)",
    detail: "Inserts current date/time for local timezone",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext) => insertLocalDate())
  },

  {
    title: "Hashing: MD5",
    detail: "Generate an md5 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toMd5(text))
  },
  {
    title: "Hashing: SHA1",
    detail: "Generate a SHA1 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toSha1(text))
  },
  {
    title: "Hashing: SHA256",
    detail: "Generate a SHA256 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toSha256(text))
  },

  {
    title: "Hashing: SHA512",
    detail: "Generate a SHA512 hash for the input",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toSha512(text))
  },
  {
    title: "Hashing: Identify hash algorithm",
    detail: "Tries to identify the algorithm that was used to generate the supplied hash",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (input: string) => {
      const res = hashIdentifier(input)
      input += res.length > 0 ? `\nIdentified Algorithms:\n${res.join("\n")}` : "\nCould not identify an hash algorithm"

      return input
    })
  },
  {
    title: "Hex: Decode",
    detail: "Convert an hex encoded string into readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hexToText(text))
  },
  {
    title: "Hex: Encode",
    detail: "Convert a string tino hex encoded",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => textToHex(text))
  },
  {
    title: "HTML: Encode (All Characters)",
    detail: "Html encode all characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => htmlEncodeAllChars(text))
  },
  {
    title: "IP: To Binary",
    detail: "Convert IPv4 address to binary format (e.g., 192.168.1.1 to 11000000.10101000.00000001.00000001)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => ipToBinary(text.trim()))
  },
  {
    title: "IP: From Binary",
    detail: "Convert binary format to IPv4 address (accepts dotted or continuous binary)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => binaryToIp(text.trim()))
  },
  {
    title: "IP: To Decimal",
    detail: "Convert IPv4 address to decimal format (e.g., 192.168.1.1 to 3232235777)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => ipToDecimal(text.trim()))
  },
  {
    title: "IP: From Decimal",
    detail: "Convert decimal format to IPv4 address (e.g., 3232235777 to 192.168.1.1)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => decimalToIp(text.trim()))
  },
  {
    title: "IP: To Hexadecimal",
    detail: "Convert IPv4 address to hexadecimal format (e.g., 192.168.1.1 to C0.A8.01.01)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => ipToHexadecimal(text.trim()))
  },
  {
    title: "IP: From Hexadecimal",
    detail: "Convert hexadecimal format to IPv4 address (accepts dotted or continuous hex)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => hexadecimalToIp(text.trim()))
  },
  {
    title: "IP: To Octal",
    detail: "Convert IPv4 address to octal format (e.g., 192.168.1.1 to 300.250.001.001)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => ipToOctal(text.trim()))
  },
  {
    title: "IP: From Octal",
    detail: "Convert octal format to IPv4 address (e.g., 300.250.001.001 to 192.168.1.1)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => octalToIp(text.trim()))
  },
  {
    title: "JWT: Decode",
    detail: "Decodes a jwt token",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => jwtDecode(text))
  },
  {
    title: "Lorem Ipsum: Generate",
    detail: "Generates a random Lorem Ipsum Text",
    cb: (context: ISwissKnifeContext) => {
      return context.insertRoutine(async (context: ISwissKnifeContext) => {
        const answer = await readInputAsync("How many words do you want? (default 30)\n")
        const nWords = answer ? parseInt(answer) : 30

        return loremIpsum(nWords)
      })
    }
  },

  {
    title: "Markdown: CSV To Markdown",
    detail: "Generates a markdown table from the supplied CSV",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => csvToMarkdown(text))
  },
  {
    title: "Markdown: To HTML",
    detail: "Converts Markdown to renderable HTML code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => markdownToHtml(text))
  },
  {
    title: "Morse Code: Encode",
    detail: "Converts text into morse code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toMorseCode(text))
  },
  {
    title: "Password: Check Strength",
    detail: "Check the strength of a password (using zxcvbn)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => checkPassword(text))
  },
  {
    title: "Password: Generate",
    detail: "Generates a secure, strong password",
    cb: (context: ISwissKnifeContext) => {
      return context.insertRoutine(async (context: ISwissKnifeContext): Promise<string> => {

        const answer = await readInputAsync("How many character do you want in the password? (default 20)\n")
        const size = answer ? parseInt(answer) : 20

        return generatePassword(size)
      })
    }
  },

  {
    title: "Quoted Printable: Encode",
    detail: "Decode a “Quoted Printable” (QP encoding) string, used in emails",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => quotedPrintableDecode(text))
  },
  {
    title: "Unicode: Decode",
    detail: "Decode unicode escaped string. (ex: \\u00AA or \\u{00AA}",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => unicodeDecode(text))
  },
  {
    title: "Unicode: Encode (JS Format)",
    detail: "Converts text into unicode escaped charaters for javascript",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => unicodeEncode(text))
  },
  {
    title: "RSA: Key Pair",
    detail: "Generates RSA public and private keys",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => {
      const res = generateRSAKeyPair()
      return res.publicKey + "\n\n\n\n" + res.privateKey
    })
  },

  {
    title: "Text: To Lower Case",
    detail: "Converts text to lower case",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toLowerCase(text))
  },
  {
    title: "Text: To Upper Case",
    detail: "Converts text to upper case",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toUpperCase(text))
  },
  {
    title: "Text: Capitalize",
    detail: "Capitalizes every first letter of each word",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => capitalize(text))
  },
  {
    title: "Text: To Camel Case",
    detail: "Capitalizes every single word and concatenates text into a single word (removes non alphanumeric chars)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => toCamelCase(text))
  },
  {
    title: "Text: Join Lines",
    detail: "Join multiple lines delimited by a string of your choosing",
    cb: (context: ISwissKnifeContext) => {
      return context.replaceRoutine(async (text: string, context: ISwissKnifeContext) => {
        const answer = await readInputAsync("What do you want to delimit the lines with? (press enter for none)")
        return joinLines(text, answer || "")
      })
    }
  },
  {
    title: "Text: Sort Lines",
    detail: "Sorts lines alphabetically",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => sortAlphabetically(text))
  },
  {
    title: "Text: Slugify",
    detail: "Convert a text to a slug",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => slugify(text))
  },
  {
    title: "Text: Generate Random String",
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
    title: "Text: Escape",
    detail: "Converts text to string, escaping necessary characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => escapeString(text))
  },
  {
    title: "Text: Unescape Double Quotes",
    detail: "Unescapes double-quoted strings (\\n, \\t, \\\", etc.)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => unescapeDoubleQuotes(text))
  },
  {
    title: "Text: Unescape Single Quotes",
    detail: "Unescapes single-quoted strings (\\n, \\t, \\', etc.)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => unescapeSingleQuotes(text))
  },
  {
    title: "Text: Pick Random Line",
    detail: "One option per line, chooses one line at random",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => pickRandomLine(text))
  },
  {
    title: "Text: Count Words",
    detail: "Count the number of words determined by the \S regex",
    cb: (context: ISwissKnifeContext) => context.informationRoutine(async (text: string) => `${countWords(text)} words`)
  },
  {
    title: "Text: Count Characters",
    detail: "Count the number of characters in the text",
    cb: (context: ISwissKnifeContext) => context.informationRoutine(async (text: string) => `${countChars(text)} chars`)
  },

  {
    title: "TLS: Generate Self Signed Certificate",
    detail: "Generates a self signed certificate for the provided domain, to be used for dev purposes",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async (context: ISwissKnifeContext): Promise<string> => {

      const domain = await readInputAsync("What's the domain to generate the certificate to?")
      const pems = generateSelfSignedCertificate(domain || "localhost")
      return `${pems.cert}\n\n\n\n\n\n${pems.private}\n\n\n\n\n\n${pems.public}`
    }
    )
  },
  {
    title: "Swissknife: New Script (JS)",
    detail: "Generates a boilerplate code for a Swissknife script",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => scriptTemplateJs())
  },
  {
    title: "Swissknife: New Script (TS)",
    detail: "Generates a boilerplate Typescript code for a Swissknife script (needs to be transpiled)",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(async () => scriptTemplateTs())
  },
  {
    title: "Server: Start HTTP Server",
    detail: "Creates an HTTP Server and dumps the requests content. You can also serve folders",
    cb: (context: ISwissKnifeContext) => startServer()
  },
  {
    title: "Server: Start HTTPS Server",
    detail: "Creates an HTTPS Server and dumps the requests content. You can also serve folders",
    cb: (context: ISwissKnifeContext) => startSecureServer()
  },
  {
    title: "Server: Stop Server",
    detail: "Stops the http(s) server started by this extension",
    cb: (context: ISwissKnifeContext) => stopServer()
  },

  {
    title: "URL: Encode",
    detail: "Url Encode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlEncode(text))
  },
  {
    title: "URL: Encode (All Characters)",
    detail: "Url encode all characters in a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlEncodeAllChars(text))
  },
  {
    title: "URL: Shorten",
    detail: "Shortens an URL",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(shortenUrl)
  },
  {
    title: "URL: Unshorten (Expand)",
    detail: "Converts a shorten URL into the full url",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => expandUrl(text))
  },
  {
    title: "URL: Decode",
    detail: "Url decode a string",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => urlDecode(text))
  },


  {
    title: "Utility: Code Screenshot",
    detail: "Create a nice code screenshot",
    cb: async (context: ISwissKnifeContext) => takeScreenshot(context)
  },
  {
    title: "Utility: Request To Fetch",
    detail: "Converts a raw HTTP request into a javascript fetch code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => requestToFetch(text))
  },

  {
    title: "Utility: Unix/Linux Permission To Human Readable",
    detail: "Convert a unix permission (like 777) to a human readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => linuxPermissions(text))
  },

  {
    title: "UUIDv4: Generate",
    detail: "Generates a cryptographically secure UUID (v4)",
    cb: (context: ISwissKnifeContext) => context.insertRoutine((async () => uuidv4()))
  },
  {
    title: "YAML: From JSON",
    detail: "Converts a JSON structure to YAML",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => jsonToYaml(text))
  },
  {
    title: "YAML: To JSON",
    detail: "Converts a YAML structure to JSON",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(async (text: string) => yamlToJson(text))
  },
]

export default scripts
function parseRgbValues(text: string) {
  throw new Error('Function not implemented.')
}

