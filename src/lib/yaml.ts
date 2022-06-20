
import * as YAML from 'yaml'

export const toYaml = (str: string): string => {
  try {
    const json = JSON.parse(str)
    return YAML.stringify(json)
  } catch (err) { throw new Error("Error parsing JSON") }
}

export const fromYaml = (str: string): string => {
  try {
    const yaml = YAML.parse(str)
    return JSON.stringify(yaml)
  } catch (err) { throw new Error("Error parsing YAML") }
}