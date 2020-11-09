import { IScript, ISwissKnifeContext } from "../Interfaces";

export const countWords = async (text: string): Promise<string> => {
  return `${_countWords(text)} words found`;
};

export const countChars = async (text: string): Promise<string> => {
  return `${_countChars(text)} characters`;
};

export const _countWords = (text: string): number => {
  return (text.trim().match(/\S+/g) || "").length;
};

export const _countChars = (text: string): number => {
  return text.length;
};

const scripts: IScript[] = [
  {
    title: "Count words",
    detail: "Count the number of words determined by the \S regex",
    cb: (context: ISwissKnifeContext) => context.informationRoutine(countWords)
  },
  {
    title: "Count characters",
    detail: "Count the number of characters in the text",
    cb: (context: ISwissKnifeContext) => context.informationRoutine(countChars)
  },
];

export default scripts;