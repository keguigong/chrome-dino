import Runner from "./Runner"
import { IS_HIDPI } from "./varibles"

export default class GameOverPanel {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  canvasDimensions!: Dimensions
  textImgPos!: Position
  restartImgPos!: Position

  currentFrame = 0
  frameTimeStamp = 0
  animTimer = 0
  flashTime = 0
  flashCounter = 0
  gameOverRafId: number | null = null

  constructor(canvas: HTMLCanvasElement, textImgPos: Position, restartImgPos: Position, dimensions: any) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.canvasDimensions = dimensions
    this.textImgPos = textImgPos
    this.restartImgPos = restartImgPos

    this.draw()
  }

  /**
   * Update the panel dimensions.
   */
  updateDimensions(width: number, optHeight?: number) {
    this.canvasDimensions.WIDTH = width
    if (optHeight) {
      this.canvasDimensions.HEIGHT = optHeight
    }
    this.currentFrame = GameOverPanel.animConfig.frames.length - 1
  }

  drawGameOverText(dimensions: any) {
    let centerX = this.canvasDimensions.WIDTH / 2

    let textSourceX = dimensions.TEXT_X
    let textSourceY = dimensions.TEXT_Y
    let textSourceWidth = dimensions.TEXT_WIDTH
    let textSourceHeight = dimensions.TEXT_HEIGHT

    const textTargetX = Math.round(centerX - dimensions.TEXT_WIDTH / 2)
    const textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3)
    const textTargetWidth = dimensions.TEXT_WIDTH
    const textTargetHeight = dimensions.TEXT_HEIGHT

    if (IS_HIDPI) {
      textSourceX *= 2
      textSourceY *= 2
      textSourceWidth *= 2
      textSourceHeight *= 2
    }
    textSourceX += this.textImgPos.x
    textSourceY += this.textImgPos.y

    this.ctx.save()

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
  }

  drawRestartButton() {
    const dimensions = GameOverPanel.dimensions
    let framePosX = GameOverPanel.animConfig.frames[this.currentFrame]
    let restartSourceWidth = dimensions.RESTART_WIDTH
    let restartSourceHeight = dimensions.RESTART_HEIGHT
    const restartTargetX = this.canvasDimensions.WIDTH / 2 - dimensions.RESTART_WIDTH / 2
    const restartTargetY = this.canvasDimensions.HEIGHT / 2

    if (IS_HIDPI) {
      restartSourceWidth *= 2
      restartSourceHeight *= 2
      framePosX *= 2
    }

    this.ctx.save()

    this.ctx.drawImage(
      Runner.imageSprite,
      this.restartImgPos.x + framePosX,
      this.restartImgPos.y,
      restartSourceWidth,
      restartSourceHeight,
      restartTargetX,
      restartTargetY,
      dimensions.RESTART_WIDTH,
      dimensions.RESTART_HEIGHT
    )

    this.ctx.restore()
  }

  draw() {
    this.drawGameOverText(GameOverPanel.dimensions.ZH)
    this.drawRestartButton()
    this.update()
  }

  /**
   * Update animation frames.
   */
  update() {
    const now = Date.now()
    const deltaTime = now - (this.frameTimeStamp || now)

    this.frameTimeStamp = now
    this.animTimer += deltaTime
    this.flashTime += deltaTime

    // Restart Button
    if (this.currentFrame == 0 && this.animTimer > GameOverPanel.LOGO_PAUSE_DURATION) {
      this.animTimer = 0
      this.currentFrame++
      this.drawRestartButton()
    } else if (this.currentFrame > 0 && this.currentFrame < GameOverPanel.animConfig.frames.length) {
      if (this.animTimer >= GameOverPanel.animConfig.msPerFrame) {
        this.currentFrame++
        this.drawRestartButton()
      }
    } else if (this.currentFrame == GameOverPanel.animConfig.frames.length) {
      this.reset()
      return
    }

    this.gameOverRafId = requestAnimationFrame(this.update.bind(this))
  }

  reset() {
    if (this.gameOverRafId) {
      cancelAnimationFrame(this.gameOverRafId)
      this.gameOverRafId = null
    }
    this.animTimer = 0
    this.frameTimeStamp = 0
    this.currentFrame = 0
    this.flashTime = 0
    this.flashCounter = 0
  }

  static RESTART_ANIM_DURATION = 875
  static LOGO_PAUSE_DURATION = 875
  static FLASH_ITERATIONS = 5

  static animConfig = {
    frames: [0, 36, 72, 108, 144, 180, 216, 252],
    msPerFrame: GameOverPanel.RESTART_ANIM_DURATION / 8
  }

  static dimensions: ConfigDict = {
    EN: {
      TEXT_X: 0, // 文字 "Game Over" 的 x 坐标
      TEXT_Y: 13,
      TEXT_WIDTH: 191, // 文字 "Game Over" 的宽度
      TEXT_HEIGHT: 11
    },
    ZH: {
      TEXT_X: 0,
      TEXT_Y: 26,
      TEXT_WIDTH: 122,
      TEXT_HEIGHT: 14
    },
    RESTART_WIDTH: 36, // 重置按钮的宽度
    RESTART_HEIGHT: 32
  }
}
