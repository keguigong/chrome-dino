declare type Position = {
  x: number
  y: number
}

declare type Dimensions = {
  WIDTH: number
  HEIGHT: number
  [key: string]: number
}

declare type SpritePosDef = {
  [key: string]: Position
}

declare type ConfigDict = {
  [key: string]: any
}

declare type SpriteDefinition = ConfigDict
