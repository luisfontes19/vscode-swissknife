
export const toLowerCase = (text: string): string => {
  return text.toLowerCase()
}

export const toUpperCase = (text: string): string => {
  return text.toUpperCase()
}

export const capitalize = (text: string): string => {
  return text.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

export const toCamelCase = (text: string): string => {
  return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
}

export const joinLines = (text: string, replace: string): string => {
  return text.replace(/\n/g, replace)
}
export const sortAlphabetically = (text: string): string => {
  const lines = text.split("\n")
  return lines.sort().join("\n")
}
