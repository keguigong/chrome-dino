import Runner from "./Runner"
import { IS_HIDPI } from "./varibles"

export default class PressToStart {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  canvasDimensions!: Dimensions
  textImgPos!: Position

  animTimer = 0
  opacity = 0
  currTextIndex = 1
  fadeIn = true

  constructor(canvas: HTMLCanvasElement, textImgPos: Position, dimensions: Dimensions) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.canvasDimensions = dimensions
    this.textImgPos = textImgPos
  }

  drawText(dimensions: any) {
    let centerX = this.canvasDimensions.WIDTH / 2

    let textSourceX = dimensions.OFFSET_X
    let textSourceY = dimensions.OFFSET_Y
    let textSourceWidth = dimensions.TEXT_WIDTH
    let textSourceHeight = dimensions.TEXT_HEIGHT

    let textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3)
    let textTargetX = Math.round(centerX - dimensions.TEXT_WIDTH / 2)
    let textTargetWidth = dimensions.TEXT_WIDTH
    let textTargetHeight = dimensions.TEXT_HEIGHT
    if (dimensions.REMARK !== "en") {
      textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH * 1.25) / 2)
      textTargetWidth = dimensions.TEXT_WIDTH * 1.25
      textTargetHeight = dimensions.TEXT_HEIGHT * 1.25
    } else if (dimensions.REMARK === "zh") {
      textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH * 1.5) / 2)
      textTargetWidth = dimensions.TEXT_WIDTH * 1.5
      textTargetHeight = dimensions.TEXT_HEIGHT * 1.5
    }

    if (IS_HIDPI) {
      textSourceX *= 2
      textSourceY *= 2
      textSourceWidth *= 2
      textSourceHeight *= 2
    }
    textSourceX += this.textImgPos.x
    textSourceY += this.textImgPos.y

    this.ctx.save()
    this.ctx.globalAlpha = this.opacity
    this.ctx.drawImage(
      Runner.imageSprite,
      textSourceX,
      textSourceY,
      textSourceWidth,
      textSourceHeight,
      textTargetX,
      textTargetY,
      textTargetWidth,
      textTargetHeight
    )
    this.ctx.restore()
    this.ctx.globalAlpha = 1
  }

  drawEmoji(text: string, fadeOut = false) {
    let centerX = this.canvasDimensions.WIDTH / 2
    const textTargetY = 100
    this.ctx.font = "16px system-ui, sans-serif"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    this.ctx.save()
    if (fadeOut) {
      this.ctx.globalAlpha = this.opacity
    }
    this.ctx.fillStyle = "#6c6c6c"
    this.ctx.fillText(text, centerX, textTargetY)
    this.ctx.restore()
    this.ctx.globalAlpha = 1
  }

  /**
   * Update animation frames.
   */
  update(deltaTime: number, fadeOut = false) {
    if (this.opacity === 0 && fadeOut) return

    if (this.opacity === 1) {
      this.animTimer += deltaTime
      if (this.animTimer > PressToStart.TEXT_PAUSE_DURATION) {
        this.fadeIn = false
        this.animTimer = 0
      }
    } else if (this.opacity === 0 && !this.fadeIn) {
      this.fadeIn = true
      this.currTextIndex = this.currTextIndex + 1 < PressToStart.TEXT_LIST.length ? this.currTextIndex + 1 : 0
    }

    if (fadeOut && this.opacity > 0) {
      this.fadeIn = false
    }

    if (this.fadeIn) {
      this.opacity = Math.min(1, this.opacity + PressToStart.FADE_SPEED * deltaTime)
    } else {
      this.opacity = Math.max(0, this.opacity - PressToStart.FADE_SPEED * deltaTime)
    }

    let textDimension = PressToStart.TEXT_LIST[this.currTextIndex]
    this.drawText(textDimension)
    this.drawEmoji("Code with 🤚 & ❤️ by keguigong", fadeOut)
  }

  reset() {
    this.animTimer = 0
  }

  static FADE_SPEED = 1 / 500
  static TEXT_PAUSE_DURATION = 875
  static TEXT_LIST = [
    {
      REMARK: "en",
      OFFSET_X: 240,
      OFFSET_Y: 66,
      TEXT_WIDTH: 264,
      TEXT_HEIGHT: 14
    },
    {
      REMARK: "zh",
      OFFSET_X: 0,
      OFFSET_Y: 80,
      TEXT_WIDTH: 126,
      TEXT_HEIGHT: 14
    },
    {
      REMARK: "jp",
      OFFSET_X: 0,
      OFFSET_Y: 66,
      TEXT_WIDTH: 222,
      TEXT_HEIGHT: 14
    }
    // {
    //   REMARK: "en",
    //   OFFSET_X: 240,
    //   OFFSET_Y: 80,
    //   TEXT_WIDTH: 278,
    //   TEXT_HEIGHT: 14
    // }
  ]
}
