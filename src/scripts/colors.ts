import { IScript, ISwissKnifeContext } from "../Interfaces"

export const rgbToHex = async (text: string): Promise<string> => {
  const rgbArray = text.includes(",") ? text.split(",") : text.split(" ")

  if (rgbArray.length !== 3) throw (new Error("Invalid RGB format"))

  let hex = "#"

  try {
    rgbArray.forEach(c => {
      hex += parseInt(c).toString(16)
    })
  }
  catch (error) {
    throw (new Error("Invalid RGB value"));;
  }

  return hex.toUpperCase()

}


export const hexToRgb = async (text: string): Promise<string> => {
  const match = text.toUpperCase().match(/^#?[0-9A-F]{6}$/)
  if (!match) throw (new Error("Invalid Hex color"))

  text = text.replace("#", "")

  let rgb: Array<number> = []
  for (let i = 0; i < 3; i++) {
    const n = text.substring(i * 2, (i * 2) + 2)
    rgb.push(parseInt(n, 16))
  }

  return rgb.join(",")

}


const scripts: IScript[] = [
  {

    title: "RGB To Hex",
    detail: "Convert an RGB (ex: 255,255,255) into Hex Color format",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(rgbToHex)
  },
  {

    title: "Hex to RGB",
    detail: "Convert an Hex Color (ex #FFFFFF) into RGB",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(hexToRgb)
  },

]

export default scripts