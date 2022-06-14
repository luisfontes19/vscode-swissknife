import { IScript, ISwissKnifeContext } from "../Interfaces"
import { readInputAsync } from '../utils'

export const toLowerCase = async (text: string): Promise<string> => {
  return text.toLowerCase()
}

export const toUpperCase = async (text: string): Promise<string> => {
  return text.toUpperCase()
}

export const capitalize = async (text: string): Promise<string> => {
  return text.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

export const toCamelCase = async (text: string): Promise<string> => {
  return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
}

export const _joinLines = (text: string, replace: string): string => {
  return text.replace(/\n/g, replace)
}

export const joinLines = async (text: string): Promise<string> => {

  const answer = await readInputAsync("What do you want to delimit the lines with? (press enter for none)")
  return _joinLines(text, answer || "")
}

export const sortAlphabetically = async (text: string): Promise<string> => {
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
    title: "Capitalize",
    detail: "Capitalizes every first letter of each word",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(capitalize)
  },
  {
    title: "To Camel Case",
    detail: "Capitalizes every single word and concatenates text into a single word (removes non alphanumeric chars)",
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