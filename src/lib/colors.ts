import { leftPad } from './utils'

export const rgbToHex = (text: string): string => {
  const reg = /\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?,?\s?\d\.?\d{0,3}/

  const convertToHex = (str: string) => {
    const colorArray = str.split(",")
    return "#" + colorArray.map((c, i) => {
      let n = parseInt(c)
      if (i === 3) {  // rgba
        n = parseFloat(c)
        n = Math.round(n * 255)
      }

      return leftPad(n.toString(16), 2)
    }).join("").toUpperCase()
  }

  try {

    // if the entire text is just an RGB(A) color, like 255,255,255 just convert it
    if (text.match(new RegExp(`^${reg.source}$`))) return convertToHex(text)

    // if the text has more then just a color, search for something like rgb(255,255,255) and replace it
    text.match(new RegExp(`rgba?\\\(${reg.source}\\\)`, "gi"))?.forEach(m => {
      const v = m.match(reg)![0]
      text = text.replace(m, convertToHex(v))
    })
  }
  catch (error) { }

  return text
}


export const hexToRgb = (text: string): string => {
  const matches = text.match(/#?[0-9A-F]{8}|#?[0-9A-F]{6}/ig)

  const convertToHex = (hex: string) => {

    hex = hex.replace("#", "")

    let rgb: Array<number> = []
    for (let i = 0; i < hex.length / 2; i++) {
      const n = hex.substring(i * 2, (i * 2) + 2)

      //in case we are using rgba, value should be between 0 and 1, so divide by 255
      const c = i === 3 ? Math.round(parseInt(n, 16) / 255 * 100) / 100 : parseInt(n, 16)
      rgb.push(c)
    }

    // rgba
    const func = hex.length === 8 ? "rgba" : "rgb"

    return `${func}(${rgb.join(",")})`
  }

  matches?.forEach(m => text = text.replace(m, convertToHex(m)))

  return text
}