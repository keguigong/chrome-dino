import Runner from "./Runner"
import { IS_HIDPI } from "./varibles"

export default class HPBar {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spritePos!: Position
  canvasWidth = 0

  x = 0
  y = 0

  hp = 3
  hpChanged = false
  flashTimer = 0
  flashIterations = 0

  opacity = 0

  constructor(canvas: HTMLCanvasElement, spritePos: Position, canvasWidth: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.spritePos = spritePos
    this.canvasWidth = canvasWidth
  }

  update(deltaTime: number, hp: number) {
    let paint = true
    if (this.opacity < 1) {
      this.opacity = Math.min(this.opacity + HPBar.config.FADE_SPEED, 1)
    }

    if (!this.hpChanged) {
      this.hpChanged = hp !== this.hp

      this.flashIterations = 0
      this.flashTimer = 0
    } else {
      if (this.flashIterations <= HPBar.config.FLASH_ITERATIONS) {
        this.flashTimer += deltaTime

        if (this.flashTimer < HPBar.config.FLASH_DURATION) {
          paint = false
        } else if (this.flashTimer > HPBar.config.FLASH_DURATION * 2) {
          this.flashTimer = 0
          this.flashIterations++
        }
      } else {
        this.hpChanged = false
        this.flashIterations = 0
        this.flashTimer = 0
      }
    }

    this.hp = hp

    // Draw the digits if not flashing.
    if (paint) {
      for (let i = 0; i <= HPBar.config.MAX_HP - 1; i++) {
        if (i <= this.hp - 1) {
          this.draw(i, 0)
        } else {
          this.draw(i, 1)
        }
      }
    }
  }

  draw(targetPos: number, sourcePos: number) {
    let sourceWidth = HPBar.dimensions.WIDTH
    let sourceHeight = HPBar.dimensions.HEIGHT
    let sourceX = HPBar.dimensions.WIDTH * sourcePos
    let sourceY = 0

    let targetX = targetPos * HPBar.dimensions.DEST_WIDTH
    let targetY = this.y
    let targetWidth = HPBar.dimensions.WIDTH
    let targetHeight = HPBar.dimensions.HEIGHT

    if (IS_HIDPI) {
      sourceWidth *= 2
      sourceHeight *= 2
      sourceX *= 2
    }

    sourceX += this.spritePos.x
    sourceY += this.spritePos.y

    this.ctx.save()
    this.ctx.globalAlpha = this.opacity

    this.ctx.drawImage(
      Runner.imageBdaySprite,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight
    )

    this.ctx.restore()
    this.ctx.globalAlpha = 1
  }

  reset() {
    this.hp = HPBar.config.MAX_HP
    this.hpChanged = false
    this.flashTimer = 0
    this.flashIterations = 0

    this.update(0, this.hp)
  }

  static config = {
    FLASH_DURATION: 1000 / 4, // 一闪的时间（一次闪动分别两闪：从有到无，从无到有）
    FLASH_ITERATIONS: 3, // 闪动的次数
    MAX_HP: 3,
    HP_UNIT: 1,
    FADE_SPEED: 0.035 // 淡入淡出的速度
  }

  static dimensions = {
    WIDTH: 28,
    HEIGHT: 26,
    DEST_WIDTH: 30
  }
}
