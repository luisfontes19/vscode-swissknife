
import * as YAML from 'yaml'
import { IScript, ISwissKnifeContext } from '../Interfaces'

export const toYaml = async (str: string): Promise<string> => {
  try {
    const json = JSON.parse(str)
    return YAML.stringify(json)
  } catch (err) { throw new Error("Error parsing JSON") }
}

export const fromYaml = async (str: string): Promise<string> => {
  try {
    const yaml = YAML.parse(str)
    return JSON.stringify(yaml)
  } catch (err) { throw new Error("Error parsing YAML") }
}

const scripts: IScript[] = [
  {
    title: "JSON to YAML",
    detail: "Converts a JSON structure to YAML",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(toYaml)
  },
  {
    title: "YAML to JSON",
    detail: "Converts a YAML structure to JSON",
    cb: (context: ISwissKnifeContext) => context.replaceRoutine(fromYaml)
  },
]

export default scripts