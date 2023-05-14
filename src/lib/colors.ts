import { leftPad } from './utils'

export const hslToHex = (h: number, s: number, l: number) => {
  // Convert the hue to degrees
  h /= 360

  // Convert saturation and lightness to decimals
  s /= 100
  l /= 100

  // Calculate the RGB values
  let r, g, b
  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  // Convert the RGB values to hex
  const rgb = (r * 255) << 16 | (g * 255) << 8 | (b * 255) << 0
  const hex = '#' + (0x1000000 | rgb).toString(16).substring(1)

  return hex.toUpperCase()
}

export const hexToHsl = (hex: string) => {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // Find the minimum and maximum values of R, G, and B
  const cMin = Math.min(r, g, b)
  const cMax = Math.max(r, g, b)

  // Calculate the difference between the minimum and maximum values
  const delta = cMax - cMin

  // Calculate the hue
  let hue = 0
  if (delta === 0) {
    hue = 0
  } else if (cMax === r) {
    hue = ((g - b) / delta) % 6
  } else if (cMax === g) {
    hue = (b - r) / delta + 2
  } else if (cMax === b) {
    hue = (r - g) / delta + 4
  }
  hue = Math.round(hue * 60)

  // Calculate the lightness
  const lightness = (cMax + cMin) / 2

  // Calculate the saturation
  let saturation = 0
  if (delta === 0) {
    saturation = 0
  } else {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))
  }
  saturation = Math.round(saturation * 100)

  return `hsl(${hue}, ${saturation}%, ${Math.round(lightness * 100)}%)`
}

export const hwbToHex = (h: number, w: number, b: number) => {

}





export const hexToHwb = (hex: string) => {
  // Convert hex to RGB values
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Calculate the Whiteness, Blackness, and Hue
  const w = Math.round(Math.min(r, g, b) / 255 * 100)
  const b1 = Math.round((1 - Math.max(r, g, b) / 255) * 100)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const chroma = max - min
  let h = 0
  if (chroma !== 0) {
    if (max === r) {
      h = ((g - b) / chroma) % 6
    } else if (max === g) {
      h = ((b - r) / chroma) + 2
    } else {
      h = ((r - g) / chroma) + 4
    }
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  return `hwb(${h}, ${w}%, ${b1}%)`
}

export const rgbToHex = (r: number, g: number, b: number, a?: number): string => {
  const colorArray = [r, g, b]
  if (a) colorArray.push(a)

  return "#" + colorArray.map((n, i) => {
    if (i === 3)  // rgba
      n = Math.round(n * 255)

    return leftPad(n.toString(16), 2)
  }).join("").toUpperCase()
}


export const hexToRgb = (hex: string): string => {

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
