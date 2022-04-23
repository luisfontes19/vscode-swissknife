import { IScript, ISwissKnifeContext } from "../Interfaces"

export const toLowerCase = async (text: string): Promise<string> => {
  return text.toLowerCase()
}

export const toUpperCase = async (text: string): Promise<string> => {
  return text.toUpperCase()
}

export const toCamelCase = async (text: string): Promise<string> => {
  return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
}

export const joinLines = async (text: string, context: ISwissKnifeContext): Promise<string> => {
  return new Promise((resolve, reject) => {
    context.vscode.window.showInputBox({ prompt: "What do you want to delimit the lines with? (press enter for none)" }).then(answer => {
      resolve(text.replace(/\n/g, answer || ""))
    })
  })
}

export const sortAlphabetically = async (text: string, context: ISwissKnifeContext): Promise<string> => {
  const lines = text.split("\n")
  return lines.sort().join("\n")
}

const scripts: IScript[] = [
  {
    title: "To Lower Case",
    detail: "Converts text to lower case",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toLowerCase)
  },
  {
    title: "To Upper Case",
    detail: "Converts text to upper case",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toUpperCase)
  },
  {
    title: "To Camel Case",
    detail: "Capitalizes the first letter of each word",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toCamelCase)
  },
  {
    title: "Join lines",
    detail: "Join multiple lines delimited by a string of your choosing",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(joinLines)
  },
  {
    title: "Sort Lines",
    detail: "Sorts lines alphabetically",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(sortAlphabetically)
  },
]

export default scripts