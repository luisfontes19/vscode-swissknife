import { IScript, ISwissKnifeContext } from '../Interfaces';
import { fromBase64 } from './encodings';
import { fromString, toFetch } from './lib/requestUtils';

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

];

export default scripts;