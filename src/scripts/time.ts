import { IScript, ISwissKnifeContext } from "../Interfaces";

export const toTimestamp = async (text: string): Promise<string> => {
  return (new Date(text).getTime() / 1000).toString();
};

export const fromTimestamp = async (text: string): Promise<string> => {
  /* If timestamp is superior to the year 2969, let’s assume it is a milliseconds timestamp */
  let intText = parseInt(text);
  intText = intText > 31536000000 ?  intText : intText * 1000;

  return new Date(parseInt(intText) * 1000).toUTCString();
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
