import { IScript, ISwissKnifeContext } from "../Interfaces"
import { leftPad } from './utils'

export const rgbToHex = async (text: string): Promise<string> => {
  const reg1 = /rgba?\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3},?\s?\d{0,3}\)/g
  const reg2 = /\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?,?\s?\d{0,3}/

  const convertToHex = (str: string) => {
    const colorArray = str.split(",")
    return "#" + colorArray.map((c, i) => {
      let n = parseInt(c)
      if (i === 3) n = n * 255 // rgba
      return leftPad(n.toString(16), 2)
    }).join("").toUpperCase()
  }

  try {

    // if the entire text is just an RGB(A) color, like 255,255,255 just convert it
    if (text.match(new RegExp(`^${reg2.source}$`))) return convertToHex(text)

    // if the text has more then just a color, search for something like rgb(255,255,255) and replace it
    text.match(reg1)?.forEach(m => {
      const v = m.match(reg2)![0]
      text = text.replace(m, convertToHex(v))
    })
  }
  catch (error) { }

  return text
}


export const hexToRgb = async (text: string): Promise<string> => {
  const matches = text.match(/#?[0-9A-F]{8}|#?[0-9A-F]{6}/ig)

  const convertToHex = (hex: string) => {

    hex = hex.replace("#", "")

    let rgb: Array<number> = []
    for (let i = 0; i < hex.length / 2; i++) {
      const n = hex.substring(i * 2, (i * 2) + 2)
      rgb.push(parseInt(n, 16))
    }

    // rgba
    const func = hex.length === 8 ? "rgba" : "rgb"

    return `${func}(${rgb.join(",")})`
  }

  matches?.forEach(m => text = text.replace(m, convertToHex(m)))

  return text
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