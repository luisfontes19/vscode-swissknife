export const countWords = (text: string): number => {
  return (text.trim().match(/\S+/g) || "").length
}

// TODO: support for multi byte unichode chars
export const countChars = (text: string): number => {
  return text.length
}
