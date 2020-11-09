import { IScript, ISwissKnifeContext } from "../Interfaces";

//type for showdown was getting errors :) 
const showdown = require('showdown');


//adapted from https://github.com/IvanMathy/Boop/blob/0e7864b30e83d69283e081d302b7bb66aeff4cfb/Scripts/convertToMarkdownTable.js
//All credits to 'xshoji'
export const fromCsv = async (input: string): Promise<string> => {

  const list = input.trim().replace(/^(\r?\n)+$/g, "\n").split("\n").map(v => v.replace(/^\||\|$/g, ""));
  const delimiter = [`|`, `\t`, `","`, `,`].find(v => list[0].split(v).length > 1);
  if (delimiter === `|`) {
    // If input text is markdown table format, removes header separator.
    list.splice(1, 1);
  }

  if (!delimiter) return "";

  const tableElements = list.map(record => record.split(delimiter).map(v => v.trim()));
  const calcBytes = (character: string) => {
    let length = 0;
    for (let i = 0; i < character.length; i++) {
      const c = character.charCodeAt(i);
      // Multibyte handling
      (c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4) ? length += 1 : length += 2;
    }
    return length;
  };
  const columnMaxLengthList = tableElements[0].map((v, i) => i).reduce((map: any, columnIndex) => {
    let maxLength = 0;
    tableElements.forEach(record => maxLength < calcBytes(record[columnIndex]) ? maxLength = calcBytes(record[columnIndex]) : null);
    if (maxLength === 1) {
      maxLength = 2;
    }
    map[columnIndex] = maxLength;
    return map;
  }, {});
  const formattedTableElements = tableElements.map(record => record.map((value, columnIndex) => value + "".padEnd(columnMaxLengthList[columnIndex] - calcBytes(value), " ")));
  const headerValues: any = formattedTableElements.shift();
  const tableLine = headerValues.map((v: any) => "".padStart(calcBytes(v), "-"));
  formattedTableElements.unshift(tableLine);
  formattedTableElements.unshift(headerValues);
  return formattedTableElements.map(record => "| " + record.join(" | ") + " |").join("\n");
};

export const toHtml = async (input: string): Promise<string> => {
  const converter = new showdown.Converter();
  return converter.makeHtml(input);
};

const scripts: IScript[] = [
  {
    title: "CSV to Markdown",
    detail: "Generates a markdown table from the supplied CSV",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromCsv)
  },
  {
    title: "Markdown to HTML",
    detail: "Converts Markdown to renderable HTML code",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toHtml)
  },
];

export default scripts;