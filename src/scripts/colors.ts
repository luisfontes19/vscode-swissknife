import { IScript, ISwissKnifeContext } from "../Interfaces"
import { leftPad } from './utils'

export const rgbToHex = async (text: string): Promise<string> => {
  const rgbArray = text.includes(",") ? text.split(",") : text.split(" ")

  if (rgbArray.length < 3 || rgbArray.length > 4) throw (new Error("Invalid RGB format"))

  try {
    return "#" + rgbArray.map((c, i) => {
      let n = parseInt(c)
      if (i === 3) n = n * 255 // rgba
      return leftPad(n.toString(16), 2)
    }).join("").toUpperCase()
  }
  catch (error) {
    throw (new Error("Invalid RGB value"))
  }

}


export const hexToRgb = async (text: string): Promise<string> => {
  const match = text.toUpperCase().match(/^#?[0-9A-F]{6}$|^#?[0-9A-F]{8}$/)
  if (!match) throw (new Error("Invalid Hex color"))

  text = text.replace("#", "")

  let rgb: Array<number> = []
  for (let i = 0; i < 3; i++) {
    const n = text.substring(i * 2, (i * 2) + 2)
    rgb.push(parseInt(n, 16))
  }

  // rgba
  if (text.length === 8) rgb.push(parseInt(text.substring(5, 7), 16) / 255)

  return rgb.join(",")

}


const scripts: IScript[] = [
  {

    title: "RGB(a) To Hex",
    detail: "Convert an RGB(A) (ex: 255,255,255) into Hex Color format",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(rgbToHex)
  },
  {

    title: "Hex to RGB",
    detail: "Convert an Hex Color (ex #FFFFFF) into RGB(A)",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(hexToRgb)
  },

]

export default scripts