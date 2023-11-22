import CollisionBox from "./CollisionBox"
import Runner from "./Runner"
import { FPS, IS_HIDPI } from "./varibles"

export default class Trex {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spritePos!: Position
  xPos = 0
  yPos = 0
  xInitialPos = 0
  groundYPos = 0
  minJumpHeight = 0

  currentFrame = 0
  currentAnimFrams = []
  blinkDelay = 0
  blinkCount = 0
  animStartTime = 0
  timer = 0
  msPerFrame = 1000 / FPS
  status = Trex.status.WAITING
  // config = Object.assign(Trex.config, Trex.normalJumpConfig)
  config = Object.assign(Trex.config, Trex.normalJumpConfig, Trex.bdayConfig)

  jumping = false
  ducking = false
  jumpVelocity = 0
  reachedMinHeight = false
  speedDrop = false
  jumpCount = 0
  jumpSpotX = 0

  playingIntro = false

  constructor(canvas: HTMLCanvasElement, spritePos: Position) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.spritePos = spritePos

    this.init()
  }

  init() {
    this.groundYPos = Runner.defaultDimensions.HEIGHT - this.config.HEIGHT - Runner.config.BOTTOM_PAD
    this.yPos = this.groundYPos
    this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT

    this.update(0, Trex.status.WAITING)
    this.draw(0, 0)
  }

  /**
   * Set the animation status.
   */
  update(deltaTime: number, optStatus?: string) {
    this.timer += deltaTime
    if (optStatus) {
      this.status = optStatus
      this.currentFrame = 0
      this.msPerFrame = Trex.animFrames[optStatus].msPerFrame
      this.currentAnimFrams = Trex.animFrames[optStatus].frames

      if (optStatus === Trex.status.WAITING) {
        this.animStartTime = Date.now()
        this.setBlinkDelay()
      }
    }

    // Game intro animation, T-rex moves in from the left.
    if (this.playingIntro && this.xPos < this.config.START_X_POS) {
      this.xPos += Math.round((this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime)
      this.xInitialPos = this.xPos
    }

    if (this.status === Trex.status.WAITING) {
      this.blink(Date.now())
    } else {
      this.draw(this.currentAnimFrams[this.currentFrame], 0)
    }

    if (this.timer >= this.msPerFrame) {
      this.currentFrame = this.currentFrame === this.currentAnimFrams.length - 1 ? 0 : this.currentFrame + 1
      this.timer = 0
    }
  }

  setBlinkDelay() {
    this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING)
  }

  /**
   * Make t-rex blink at random intervals.
   */
  blink(time: number) {
    const deltaTime = time - this.animStartTime

    if (deltaTime >= this.blinkDelay) {
      this.draw(this.currentAnimFrams[this.currentFrame], 0)

      if (this.currentFrame === 1) {
        // Set new random delay to blink.
        this.setBlinkDelay()
        this.animStartTime = time
        this.blinkCount++
      }
    }
  }

  draw(x: number, y: number) {
    let sourceX = x
    let sourceY = y
    let sourceWidth = this.ducking && this.status !== Trex.status.CRASHED ? this.config.WIDTH_DUCK : this.config.WIDTH
    let sourceHeight = this.config.HEIGHT
    const outputHeight = sourceHeight

    let jumpOffset = Runner.spriteDefinition.TREX.JUMPING.xOffset

    if (IS_HIDPI) {
      sourceX *= 2
      sourceY *= 2
      sourceWidth *= 2
      sourceHeight *= 2
      jumpOffset *= 2
    }

    // Adjustments for sprite sheet position.
    sourceX += this.spritePos.x
    sourceY += this.spritePos.y

    if (this.ducking && this.status !== Trex.status.CRASHED) {
      this.ctx.drawImage(
        // Runner.imageSprite,
        Runner.imageBdaySprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH_DUCK,
        outputHeight
      )
    } else {
      if (this.ducking && this.status == Trex.status.CRASHED) {
        this.xPos++
      }

      this.ctx.drawImage(
        // Runner.imageSprite,
        Runner.imageBdaySprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH,
        outputHeight
      )
    }
    this.ctx.globalAlpha = 1
  }

  startJump(speed: number) {
    if (!this.jumping) {
      this.update(0, Trex.status.JUMPING)

      this.jumpVelocity = this.config.INITIAL_JUMP_VELOCITY - speed / 10
      this.jumping = true
      this.reachedMinHeight = false
      this.speedDrop = false
    }
  }

  endJump() {
    if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
      this.jumpVelocity = this.config.DROP_VELOCITY
    }
  }

  updateJump(deltaTime: number) {
    const msPerFrame = Trex.animFrames[this.status].msPerFrame
    const frameElapsed = deltaTime / msPerFrame

    // Speed drop makes Trex fall faster.
    if (this.speedDrop) {
      this.yPos += Math.round(this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * frameElapsed)
    } else {
      this.yPos += Math.round(this.jumpVelocity * frameElapsed)
    }

    this.jumpVelocity += this.config.GRAVITY * frameElapsed

    // Minimum height has been reached.
    if (this.yPos < this.minJumpHeight || this.speedDrop) {
      this.reachedMinHeight = true
    }

    // Reached max height.
    if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
      this.endJump()
    }

    // Back down at ground level. Jump completed.
    if (this.yPos > this.groundYPos) {
      this.reset()
      this.jumpCount++
    }
  }

  setSpeedDrop() {
    this.speedDrop = true
    this.jumpVelocity = 1
  }

  setDuck(isDucking: boolean) {
    if (isDucking && this.status !== Trex.status.DUCKING) {
      this.update(0, Trex.status.DUCKING)
      this.ducking = true
    } else if (this.status === Trex.status.DUCKING) {
      this.update(0, Trex.status.RUNNING)
      this.ducking = false
    }
  }

  reset() {
    this.yPos = this.groundYPos
    this.jumpVelocity = 0
    this.jumping = false
    this.ducking = false
    this.update(0, Trex.status.RUNNING)
    this.speedDrop = false
    this.jumpCount = 0
  }

  static config = {
    DROP_VELOCITY: -5,
    FLASH_OFF: 175,
    FLASH_ON: 100,
    HEIGHT: 47,
    HEIGHT_DUCK: 25,
    INTRO_DURATION: 1500,
    SPEED_DROP_COEFFICIENT: 3,
    SPRITE_WIDTH: 262,
    START_X_POS: 50,
    WIDTH: 44,
    WIDTH_DUCK: 59
  }

  static bdayConfig = {
    HEIGHT: 62,
    HEIGHT_DUCK: 62
  }

  static normalJumpConfig = {
    GRAVITY: 0.6,
    MAX_JUMP_HEIGHT: 30,
    MIN_JUMP_HEIGHT: 30,
    INITIAL_JUMP_VELOCITY: -10
  }

  static collisionBoxes = {
    // DUCKING: [new CollisionBox(1, 18, 55, 25)],
    // RUNNING: [
    //   new CollisionBox(22, 0, 17, 16),
    //   new CollisionBox(1, 18, 30, 9),
    //   new CollisionBox(10, 35, 14, 8),
    //   new CollisionBox(1, 24, 29, 5),
    //   new CollisionBox(5, 30, 21, 4),
    //   new CollisionBox(9, 34, 15, 4)
    // ],
    DUCKING: [new CollisionBox(39, 22, 9, 13), new CollisionBox(1, 34, 55, 25)],
    RUNNING: [
      new CollisionBox(25, 4, 9, 12),
      new CollisionBox(22, 16, 17, 16),
      new CollisionBox(1, 34, 30, 9),
      new CollisionBox(10, 51, 14, 8),
      new CollisionBox(1, 40, 29, 5),
      new CollisionBox(5, 46, 21, 4),
      new CollisionBox(9, 50, 15, 4)
    ]
  }

  static BLINK_TIMING = 7000

  static status = {
    CRASHED: "CRASHED",
    DUCKING: "DUCKING",
    JUMPING: "JUMPING",
    RUNNING: "RUNNING",
    WAITING: "WAITING"
  }

  static animFrames: ConfigDict = {
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
    },
    DUCKING: {
      frames: [264, 323],
      msPerFrame: 1000 / 8
    }
  }
}
