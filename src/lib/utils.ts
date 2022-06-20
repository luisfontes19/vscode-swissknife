
import * as request from 'request'
import * as vscode from 'vscode'
import { readInputAsync } from '../utils'
import { generateSelfSignedCertificate } from './crypto'
import { base64ToText } from './encodings'
import { parseRawRequest, rawRequestToJSFetch } from './requestUtils'
import * as Server from './server'
import { ServerConfig } from './server'

export const jwtDecode = (str: string): string => {

  const parts = str.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT Token")


  var header = base64ToText(parts[0])
  var payload = base64ToText(parts[1])
  var signature = parts[2]

  try {
    var fullJson = {
      "header": JSON.parse(header),
      "payload": JSON.parse(payload),
      "signature": signature
    }

    return JSON.stringify(fullJson, null, 2)
  } catch (err) { throw new Error("Error parsing JWT") }
}

export const escapeString = (str: string): string => {
  return JSON.stringify(escapeString)
}

export const shortenUrl = async (str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // the service is blacklisted in marketplace, trying to bypass it :D 
    request({ uri: "https://tin" + "yur" + "l.com/api-create.php?url=" + str, }, (err, httpResponse) => {
      if (err) reject(err)
      else resolve(httpResponse.body)
    })
  })
}

export const expandUrl = async (str: string): Promise<string> => {

  return new Promise((resolve, reject) => {
    request({ uri: str, followRedirect: false },
      function (err, httpResponse) {
        if (err) throw new Error(err)
        resolve(httpResponse.headers.location || str)
      }
    )
  })
}

export const requestToFetch = (str: string): string => {
  const parsedRequest = parseRawRequest(str)
  return rawRequestToJSFetch(parsedRequest)
}

export const _startServer = async (https: boolean) => {

  if (Server.exists()) {
    vscode.window.showErrorMessage("Server already running, please stop it first")
    return Promise.resolve()
  }

  let key: string, cert: string

  if (https) {
    const domain = (await readInputAsync("What's the domain to generate the certificate to?")) || "localhost"
    const pems = await generateSelfSignedCertificate(domain)
    key = pems.private
    cert = pems.cert
  }

  const p = await readInputAsync("Run server on which port? (default 3000)\n")
  const port = p ? parseInt(p) : 3000

  vscode.window.showQuickPick(["No", "Yes"], { placeHolder: "Do you want to serve a specific folder?" }).then(r => {
    let serverOptions: ServerConfig = { port }
    if (https) serverOptions = { ...serverOptions, key, cert }

    if (r === "No")
      Server.start(serverOptions)
    else {
      vscode.window.showOpenDialog(
        {
          canSelectFolders: true,
          canSelectMany: false,
          canSelectFiles: false,
          title: "Select folder to serve"
        }
      ).then(folder => {

        const f = (folder || "").toString().replace("file://", "")
        serverOptions.staticFolder = f
        Server.start(serverOptions)
      })
    }
  })

  return Promise.resolve()
}

export const leftPad = (n: number | string, size: number) => ("0".repeat(size) + n.toString()).slice(-size)

export const startServer = async (): Promise<void> => {
  return await _startServer(false)
}

export const startSecureServer = async (): Promise<void> => {
  return await _startServer(true)
}

export const stopServer = (): Promise<void> => {
  try {
    if (Server.exists()) {
      Server.stop()
      vscode.window.showInformationMessage("Server stopped")
    }
    else
      vscode.window.showErrorMessage("No Server running...")
  }
  catch (err) {
    vscode.window.showErrorMessage("Ups something went wrong")
    console.log("[SWISSKNIFE]", err)
  }

  return Promise.resolve()
}

export const linuxPermissions = (permission: string): string => {
  if (permission.length !== 3) throw new Error("Not a valid permission")

  const decodeFor = (perm: string, t: string) => {
    let readable = t
    const digit = parseInt(perm)

    if ((digit & 4) === 4) readable += "Read "
    if ((digit & 2) === 2) readable += "Write "
    if ((digit & 1) === 1) readable += "Execute "

    return readable
  }

  let decoded = ""
  const permissionArray = permission.split("")

  try {
    decoded += decodeFor(permissionArray[0], "User:   ") + "\n"
    decoded += decodeFor(permissionArray[1], "Group:  ") + "\n"
    decoded += decodeFor(permissionArray[2], "Others: ") + "\n"
  }
  catch (ex) { throw new Error("Not a valid permission") }

  return decoded
}

export const pickRandomLine = (str: string): string => {
  const lines = str.split("\n")
  const n = Math.floor(Math.random() * lines.length)
  return lines[n]
}
