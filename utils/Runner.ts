import Horizon from "./Horizon"

export default class Runner {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  horizon!: Horizon

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.init()
  }

  init() {
    this.ctx.fillStyle = "#f7f7f7"
    this.ctx.fill()
    // Load background class Horizon
    this.horizon = new Horizon(this.ctx, this.spriteImage)
  }

  static defaultDimensions = {
    WIDTH: 600,
    HEIGHT: 150
  }

  static keycodes = {
    JUMP: { 38: 1, 32: 1 }, // Up, spacebar
    DUCK: { 40: 1 }, // Down
    RESTART: { 13: 1 } // Enter
  }

  IS_HIDPI = window.devicePixelRatio > 1

  private static instance: Runner
  /** Get singleton instance */
  static getInstance(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    if (!this.instance) {
      this.instance = new Runner(ctx, spriteImage)
      return this.instance
    }
    return this.instance
  }
}
