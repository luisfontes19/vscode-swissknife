
import * as request from 'request';
import * as vscode from 'vscode';
import { IScript, ISwissKnifeContext } from '../Interfaces';
import { _selfSignedCert } from './crypto';
import { fromBase64 } from './encodings';
import { fromString, toFetch } from './lib/requestUtils';
import * as Server from './lib/server';
import { ServerConfig } from './lib/server';

const words = ("dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut " +
  "labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris " +
  "nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit " +
  "esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in " +
  "culpa qui officia deserunt mollit anim id est laborum").split(" ");

export const jwtDecode = async (str: string): Promise<string> => {

  const parts = str.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT Token");


  var header = await fromBase64(parts[0]);
  var payload = await fromBase64(parts[1]);
  var signature = parts[2];

  try {
    var fullJson = {
      "header": JSON.parse(header),
      "payload": JSON.parse(payload),
      "signature": signature
    };

    return JSON.stringify(fullJson, null, 2);
  } catch (err) { throw new Error("Error parsing JWT"); }
};

export const textToString = async (str: string): Promise<string> => {
  return JSON.stringify(textToString);
};

export const urlShortener = async (str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    request({ uri: "https://tinyurl.com/api-create.php?url=" + str, }, (err, httpResponse) => {
      if (err) reject(err);
      else resolve(httpResponse.body);
    });
  });
};

export const urlExpand = async (str: string): Promise<string> => {

  return new Promise((resolve, reject) => {
    request({ uri: str, followRedirect: false },
      function (err, httpResponse) {
        if (err) throw new Error(err);
        resolve(httpResponse.headers.location || str);
      }
    );
  });
};

export const requestToFetch = async (str: string): Promise<string> => {
  const parsedRequest = fromString(str);
  return toFetch(parsedRequest);
};


export const loremIpsum = async (context: ISwissKnifeContext): Promise<string> => {
  return new Promise((resolve, reject) => {
    context.vscode.window.showInputBox({ prompt: "How many words do you want? (default 30)\n" }).then(answer => {
      let nWords = 30;
      if (answer) nWords = parseInt(answer);

      let li = "";
      if (Math.floor(Math.random() * 5)) {
        //To throw Lorem ipsum some times :)
        li = "Lorem ipsum ";
        nWords -= 2;
      }

      for (let i = 0; i < nWords; i++) {
        const n = Math.floor(Math.random() * words.length);
        li += words[n] + " ";
      }

      resolve(li);
    });
  });
};


export const _startServer = async (https: boolean) => {
  if (Server.exists()) {
    vscode.window.showErrorMessage("Server already running, please stop it first");
    return Promise.resolve();
  }

  let key: string, cert: string;

  if (https) {
    const pems = await _selfSignedCert();
    key = pems.private;
    cert = pems.cert;
  }

  vscode.window.showInputBox({ prompt: "Run server on which port? (default 3000)\n" }).then(p => {
    const port = p ? parseInt(p) : 3000;


    vscode.window.showQuickPick(["No", "Yes"], { placeHolder: "Do you want to serve a specific folder?" }).then(r => {
      let serverOptions: ServerConfig = { port };
      if (https) serverOptions = { ...serverOptions, key, cert };

      if (r === "No")
        Server.start(serverOptions);
      else {
        vscode.window.showOpenDialog(
          {
            canSelectFolders: true,
            canSelectMany: false,
            canSelectFiles: false,
            title: "Select folder to serve"
          }
        ).then(folder => {

          const f = (folder || "").toString().replace("file://", "");
          serverOptions.staticFolder = f;
          Server.start(serverOptions);
        });
      }
    });
  });

  return Promise.resolve();
}

export const startServer = async (context: ISwissKnifeContext): Promise<void> => {
  return await _startServer(false);
};

export const startSecureServer = async (context: ISwissKnifeContext): Promise<void> => {
  return await _startServer(true);
};

export const stopServer = (context: ISwissKnifeContext): Promise<void> => {
  try {
    if (Server.exists()) {
      Server.stop();
      vscode.window.showInformationMessage("Server stopped");
    }
    else
      vscode.window.showErrorMessage("No Server running...");
  }
  catch (err) {
    vscode.window.showErrorMessage("Ups something went wrong");
    console.log(err);
  }

  return Promise.resolve();
};

export const linuxPermissions = async (permission: string): Promise<string> => {
  if (permission.length !== 3) throw new Error("Not a valid permission");

  const decodeFor = (perm: string, t: string) => {
    let readable = t;
    const digit = parseInt(perm);

    if ((digit & 4) === 4) readable += "Read ";
    if ((digit & 2) === 2) readable += "Write ";
    if ((digit & 1) === 1) readable += "Execute ";

    return readable;
  };

  let decoded = "";
  const permissionArray = permission.split("");

  try {
    decoded += decodeFor(permissionArray[0], "User:   ") + "\n";
    decoded += decodeFor(permissionArray[1], "Group:  ") + "\n";
    decoded += decodeFor(permissionArray[2], "Others: ") + "\n";
  }
  catch (ex) { throw new Error("Not a valid permission"); }

  return decoded;
};

export const randomLine = async (str: string): Promise<string> => {
  const lines = str.split("\n");
  const n = Math.floor(Math.random() * lines.length);
  return lines[n];
};

const scripts: IScript[] = [
  {
    title: "JWT Decode",
    detail: "Decodes a jwt token",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(jwtDecode)
  },
  {
    title: "Request to fetch",
    detail: "Converts a raw HTTP request into a javascript fetch code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(requestToFetch)
  },
  {
    title: "Lorem Ipsum",
    detail: "Generates a random Lorem Ipsum Text",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(loremIpsum)
  },
  {
    title: "Unix/Linux Permission To Human Readable",
    detail: "Convert a unix permission (like 777) to a human readable text",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(linuxPermissions)
  },
  {
    title: "Url Shorten",
    detail: "Shortens an URL (using tinyurl",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(urlShortener)
  },
  {
    title: "Url Unshorten (url expand)",
    detail: "Converts a shorten URL into the full url",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(urlExpand)
  },
  {
    title: "Text to String",
    detail: "Converts text to string, escaping necessary characters",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(textToString)
  },
  {
    title: "Start Local HTTP Server",
    detail: "Creates an HTTP Server and dumps the requests content. You can also serve folders",
    cb: (context: ISwissKnifeContext) => startServer(context)
  },
  {
    title: "Start Local HTTPS Server",
    detail: "Creates an HTTPS Server and dumps the requests content. You can also serve folders",
    cb: (context: ISwissKnifeContext) => startSecureServer(context)
  },
  {
    title: "Stop HTTP Server",
    detail: "Stops the http(s) server started by this extension",
    cb: (context: ISwissKnifeContext) => stopServer(context)
  },
  {
    title: "Pick random",
    detail: "One option per line, chooses one line at random",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(randomLine)
  },

];

export default scripts;