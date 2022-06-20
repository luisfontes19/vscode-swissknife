import * as express from 'express'
import * as http from 'http'
import * as https from 'https'
import * as vscode from 'vscode'
import { expressRequestToRawString } from './requestUtils'

let server: any = undefined

export interface ServerConfig {
  staticFolder?: string
  key?: string
  cert?: string
  port: number
}

export const start = (serverOptions: ServerConfig) => {
  const app = express()

  app.use(express.raw({ type: '*/*' })) //this is needed so that we can get the raw body of the request
  if (serverOptions.staticFolder) app.use(express.static(serverOptions.staticFolder))

  const output = vscode.window.createOutputChannel("Swissknife Server")

  app.all("*", async (req: any, res: any) => {
    output.append(expressRequestToRawString(req) + "\n\n")
    res.send("VSCode Swissknife Rocks")
  })

  try {
    if (serverOptions.cert && serverOptions.key)
      server = https.createServer({ key: serverOptions.key, cert: serverOptions.cert }, app)
    else
      server = http.createServer(app)

    server.listen(serverOptions.port)
    vscode.window.showInformationMessage(`Server started at port ${serverOptions.port}. Use the output window to inspect requests`)
  }
  catch (ex) {
    vscode.window.showErrorMessage("Couldn't start the server. Check if the port is already in use")
  }
}

export const stop = () => {
  server.close()
  server = undefined
}

export const exists = () => server !== undefined