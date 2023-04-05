import Horizon from "./Horizon"

export default class Runner {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource
  horizon!: Horizon

  dimensions = Runner.defaultDimensions
  config = Runner.config
  currentSpeed = Runner.config.SPEED
  time = Date.now()
  playing = false
  paused = false
  crashed = false
  updatePending = false
  raqId = 0

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.init()
  }

  private init() {
    this.ctx.fillStyle = "#f7f7f7"
    this.ctx.fill()
    // Load background class Horizon
    this.horizon = new Horizon(
      this.ctx,
      this.spriteImage,
      this.dimensions,
      this.config.GAP_COEFFICIENT
    )
    this.update()
    this.startListening()
    this.startGame()
  }

  update() {
    this.updatePending = false
    let now = Date.now()
    let deltaTime = now - this.time
    this.time = now

    if (this.playing) {
      this.clearCanvas()
      this.horizon.update(deltaTime, this.currentSpeed)
    }

    if (this.playing) {
      // Next update
      this.scheduleNextUpdate()
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT)
  }

  scheduleNextUpdate() {
    if (!this.updatePending) {
      this.updatePending = true
      this.raqId = requestAnimationFrame(this.update.bind(this))
    }
  }

  startListening() {
    document.addEventListener(Runner.events.KEYDOWN, this)
    document.addEventListener(Runner.events.KEYUP, this)
  }

  stopListening() {
    document.removeEventListener(Runner.events.KEYDOWN, this)
    document.removeEventListener(Runner.events.KEYUP, this)
  }

  /**
   * addEventListener 监听某个对象上的事件时，只要被监听的事件触发了，
   * 就会执行该对象上名字为 handleEvent 的方法（如果有）。
   * MDN 上有对 handleEvent 事件的解释。
   */
  handleEvent(e: KeyboardEvent) {
    switch (e.type) {
      case Runner.events.KEYDOWN:
        this.onKeydown(e)
        break
      default:
        break
    }
  }

  onKeydown(e: KeyboardEvent) {
    if (!this.crashed && !this.paused) {
      if (Runner.keycodes.JUMP[e.code]) {
        e.preventDefault()

        if (!this.playing) {
          this.setPlayStatus(true)
          this.update()
        }
      }
    }
  }

  setPlayStatus(playing: boolean) {
    this.playing = playing
  }

  startGame() {
    window.addEventListener(Runner.events.BLUR, this.onVisibilityChange.bind(this))
    window.addEventListener(Runner.events.FOCUS, this.onVisibilityChange.bind(this))
  }

  onVisibilityChange(e: Event) {
    console.log(e.type)
    if (document.hidden || e.type === Runner.events.BLUR || document.visibilityState != "visible") {
      this.stop()
    } else if (!this.crashed) {
      this.play()
    }
  }

  play() {
    if (!this.crashed) {
      this.setPlayStatus(true)
      this.paused = false
      this.time = Date.now()
      this.update()
    }
  }

  stop() {
    this.setPlayStatus(false)
    this.paused = true
    cancelAnimationFrame(this.raqId)
    this.raqId = 0
  }

  static defaultDimensions = {
    WIDTH: 600,
    HEIGHT: 150
  }

  static keycodes = {
    JUMP: { ArrowUp: 1, Space: 1 } as any, // Up, spacebar
    DUCK: { ArrowDown: 1 } as any, // Down
    RESTART: { Enter: 1 } as any // Enter
  }

  static events = {
    KEYDOWN: "keydown",
    KEYUP: "keyup",
    LOAD: "load",
    BLUR: "blur",
    FOCUS: "focus"
  }

  static config = {
    SPEED: 6,
    BG_CLOUD_SPEED: 0.2,
    CLOUD_FREQUENCY: 0.5,
    GAP_COEFFICIENT: 0.6,
    MAX_CLOUDS: 6,
    MAX_SPEED: 12,
    MAX_OBSTACLE_LENGTH: 3,
    MAX_OBSTACLE_DUPLICATION: 2,
    CLEAR_TIME: 3000,
    ACCELERATION: 0.001,
    BOTTOM_PAD: 10,
    GAMEOVER_CLEAR_TIME: 750,
    GRAVITY: 0.6,
    INITIAL_JUMP_VELOCITY: 12,
    MIN_JUMP_HEIGHT: 35,
    MOBILE_SPEED_COEFFICIENT: 1.2,
    RESOURCE_TEMPLATE_ID: "audio-resources",
    SPEED_DROP_COEFFICIENT: 3
  }

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
