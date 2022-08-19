export interface DecoratorEntry {
  file: string
  decorator: string
}

export enum DecoratorOp {
  ADD, REMOVE, UPDATE
}