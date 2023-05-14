import { leftPad } from './utils'

export const hslToHex = (h: number, s: number, l: number) => {
  // Convert the hue to a value between 0 and 360
  h = ((h % 360) + 360) % 360

  // Convert the saturation and lightness to a value between 0 and 1
  s /= 100
  l /= 100

  // Calculate the chroma, which is the difference between the max and min values of RGB
  const chroma = (1 - Math.abs(2 * l - 1)) * s

  // Calculate the hue prime, which is used to calculate the RGB values
  const huePrime = h / 60

  // Calculate the second largest component of RGB
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1))

  // Calculate the RGB values based on the hue prime
  let r = 0
  let g = 0
  let b = 0

  if (huePrime >= 0 && huePrime < 1) {
    r = chroma
    g = x
  } else if (huePrime >= 1 && huePrime < 2) {
    r = x
    g = chroma
  } else if (huePrime >= 2 && huePrime < 3) {
    g = chroma
    b = x
  } else if (huePrime >= 3 && huePrime < 4) {
    g = x
    b = chroma
  } else if (huePrime >= 4 && huePrime < 5) {
    r = x
    b = chroma
  } else if (huePrime >= 5 && huePrime < 6) {
    r = chroma
    b = x
  }

  // Calculate the lightness modifier
  const lightnessModifier = l - chroma / 2

  // Calculate the final RGB values
  r = Math.round((r + lightnessModifier) * 255)
  g = Math.round((g + lightnessModifier) * 255)
  b = Math.round((b + lightnessModifier) * 255)

  // Convert the RGB values to a HEX color
  const hexColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")

  return "#" + hexColor.toUpperCase()
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

export const hwbToHex = (h: number, w: number, b: number): string => {
  console.log(h)
  console.log(w)
  console.log(b)
  // Convert the hue to a value between 0 and 360
  h = ((h % 360) + 360) % 360

  // Convert whiteness and blackness to a value between 0 and 1
  w /= 100
  b /= 100

  // Calculate the chroma, which is the difference between the max and min values of RGB
  const chroma = 1 - w - b

  // Calculate the hue prime, which is used to calculate the RGB values
  const huePrime = h / 60

  // Calculate the second largest component of RGB
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1))

  // Calculate the RGB values based on the hue prime
  let r = 0
  let g = 0
  let bValue = 0

  if (huePrime >= 0 && huePrime < 1) {
    r = chroma
    g = x
  } else if (huePrime >= 1 && huePrime < 2) {
    g = chroma
    r = x
  } else if (huePrime >= 2 && huePrime < 3) {
    g = chroma
    bValue = x
  } else if (huePrime >= 3 && huePrime < 4) {
    bValue = chroma
    g = x
  } else if (huePrime >= 4 && huePrime < 5) {
    bValue = chroma
    r = x
  } else if (huePrime >= 5 && huePrime < 6) {
    r = chroma
    bValue = x
  }

  // Calculate the RGB values by adding the chroma, whiteness, and blackness
  r += w
  g += w
  bValue += b

  // Convert the RGB values to hexadecimal notation
  const rHex = Math.round(r * 255).toString(16).padStart(2, '0')
  const gHex = Math.round(g * 255).toString(16).padStart(2, '0')
  const bHex = Math.round(bValue * 255).toString(16).padStart(2, '0')

  return `#${rHex}${gHex}${bHex}`.toUpperCase()
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
