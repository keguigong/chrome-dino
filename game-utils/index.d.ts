declare interface Position {
  x: number
  y: number
}

declare interface Dimensions {
  WIDTH: number
  HEIGHT: number
  [key: string]: number
}

declare namespace Obstacle {
  interface Type {
    type: string
    width: number
    height: number
    yPos: number
    multipleSpeed: number
    minGap: number
    minSpeed: number
    numFrames?: number
    frameRate?: number
    speedOffset?: number
  }
}
