import * as crypto from 'crypto';
import { v4 } from 'uuid';
import { IScript, ISwissKnifeContext } from '../Interfaces';

export const uuidv4 = async (): Promise<string> => {
  return v4();
};

export const randomString = async (context: ISwissKnifeContext): Promise<string> => {
  return new Promise((resolve, reject) => {
    context.vscode.window.showInputBox({ prompt: "Whats the size of the string? (default 30)\n" }).then(answer => {
      let size = 30;
      if (answer) size = parseInt(answer);

      resolve(crypto.randomBytes(size).toString('base64').slice(0, size));
    });
  });
};

const scripts: IScript[] = [
  {
    title: "UUIDv4",
    detail: "Generates a cryptographically secure UUID (v4)",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(uuidv4)
  },
  {
    title: "Random String",
    detail: "Generates a cryptographically secure random string",
    cb: (context: ISwissKnifeContext) => context.insertRoutine(randomString)
  }
];

export default scripts;