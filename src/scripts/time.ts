import { IScript, ISwissKnifeContext } from "../Interfaces";

export const toTimestamp = async (text: string): Promise<string> => {
  return (new Date(text).getTime() / 1000).toString();
};

export const fromTimestamp = async (text: string): Promise<string> => {
  return new Date(parseInt(text) * 1000).toUTCString();
};



const scripts: IScript[] = [
  {
    title: "Date to Timestamp",
    detail: "Convert a valid date into unix timestamp",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toTimestamp)
  },
  {
    title: "Timestamp to Date",
    detail: "Converts a unix timestamp to UTC date",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromTimestamp)
  },

];

export default scripts;