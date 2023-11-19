export default class Trex {
  spriteImage!: CanvasImageSource
  ctx!: CanvasRenderingContext2D
  xPos = 0
  yPos = 0

  private constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    this.ctx = ctx
    this.spriteImage = spriteImage
  }

  draw(x: number, y: number) {
    let sx = x
    let sy = y
    let sw = Trex.config.WIDTH
    let sh = Trex.config.HEIGHT
    if (true) {
      sx *= 2
      sy *= 2
      sw *= 2
      sh *= 2
    }
    this.ctx.drawImage(this.spriteImage, sx, sy, sw, sh, this.xPos, this.yPos, Trex.config.WIDTH, Trex.config.HEIGHT)
  }

  static config = {
    DROP_VELOCITY: -5,
    GRAVITY: 0.6,
    HEIGHT: 47,
    INIITAL_JUMP_VELOCITY: -10,
    INTRO_DURATION: 1500,
    MAX_JUMP_HEIGHT: 30,
    MIN_JUMP_HEIGHT: 30,
    SPEED_DROP_COEFFICIENT: 3,
    SPRITE_WIDTH: 262,
    START_X_POS: 50,
    WIDTH: 44
  }

  static animFrames = {
    WAITING: {
      frames: [44, 0],
      msPerFrame: 1000 / 3
    },
    RUNNING: {
      frames: [88, 132],
      msPerFrame: 1000 / 12
    },
    CRASHED: {
      frames: [220],
      msPerFrame: 1000 / 60
    },
    JUMPING: {
      frames: [0],
      msPerFrame: 1000 / 60
    }
  }

  private static instance: Trex
  /** Get singleton instance */
  static getInstance(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    if (!this.instance) {
      this.instance = new Trex(ctx, spriteImage)
      return this.instance
    }
    return this.instance
  }
}
