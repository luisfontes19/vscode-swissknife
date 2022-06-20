
export const formattedDateToTimestamp = (text: string): string => {
  return (new Date(text).getTime() / 1000).toString()
}

export const timestampToFormattedDate = (text: string): string => {
  /* If timestamp is superior to the year 2969, let’s assume it is a milliseconds timestamp */
  let intText = parseInt(text)
  intText = intText > 31536000000 ? intText : intText * 1000

  return new Date(intText).toUTCString()
}

export const insertUtcDate = (): string => {
  return new Date().toUTCString()
}

export const insertLocalDate = (): string => {
  return new Date().toString()
}
