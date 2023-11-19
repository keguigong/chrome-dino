import CollisionBox from "./CollisionBox"
import Horizon from "./Horizon"
import Trex from "./Trex"
import { IS_HIDPI, IS_MOBILE, RESOURCE_POSTFIX } from "./varibles"

const DEFAULT_WIDTH = 600
export default class Runner {
  spriteDef!: SpritePosDef

  outerContainerEl!: HTMLElement
  containerEl!: HTMLElement

  config!: ConfigDict
  dimensions!: Dimensions

  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  time!: number
  runningTime!: number
  currentSpeed!: number

  activated!: boolean
  playing!: boolean
  crashed!: boolean
  paused!: boolean
  updatePending!: boolean
  resizeTimerId_!: NodeJS.Timer | null

  raqId!: number

  horizon!: Horizon
  playingIntro!: boolean

  constructor(outerContainerId: string, optConfig?: ConfigDict) {
    this.outerContainerEl = document.querySelector(outerContainerId) as HTMLElement

    this.config = optConfig || Runner.config
    this.dimensions = Runner.defaultDimensions

    this.time = Date.now()
    this.runningTime = 0
    this.currentSpeed = Runner.config.SPEED

    this.activated = false
    this.playing = false
    this.crashed = false
    this.paused = false
    this.updatePending = false
    this.resizeTimerId_ = null

    this.raqId = 0

    this.loadImages()
  }

  loadImages() {
    let scale = "1x"
    this.spriteDef = Runner.spriteDefinition.LDPI
    if (IS_HIDPI) {
      scale = "2x"
      this.spriteDef = Runner.spriteDefinition.HDPI
    }
    Runner.imageSprite = document.getElementById(RESOURCE_POSTFIX + scale) as HTMLImageElement

    if (Runner.imageSprite.complete) {
      this.init()
    } else {
      Runner.imageSprite.addEventListener(Runner.events.LOAD, this.init.bind(this))
    }
  }

  init() {
    this.adjustDimensions()

    // this.containerEl = document.createElement("div")
    this.containerEl = document.querySelector(`.${Runner.classes.CONTAINER}`) as HTMLDivElement
    this.containerEl.setAttribute("role", IS_MOBILE ? "button" : "application")
    this.containerEl.setAttribute("tabindex", "0")
    this.containerEl.className = Runner.classes.CONTAINER

    // const canvas = document.createElement("canvas")
    const canvas = document.querySelector(`.${Runner.classes.CANVAS}`) as HTMLCanvasElement
    canvas.className = Runner.classes.CANVAS
    canvas.width = this.dimensions.WIDTH
    canvas.height = this.dimensions.HEIGHT
    this.canvas = canvas
    // this.containerEl.appendChild(canvas)

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
    this.ctx.fillStyle = "#f7f7f7"
    this.ctx.fill()
    Runner.updateCanvasScaling(this.canvas)
    // Load background class Horizon
    this.horizon = new Horizon(this.canvas, this.spriteDef, this.dimensions, Runner.config.GAP_COEFFICIENT)

    this.outerContainerEl.appendChild(this.containerEl)

    this.startListening()
    this.update()

    window.addEventListener(Runner.events.RESIZE, this.debounceResize.bind(this))
  }

  /**
   * Debounce the resize event.
   */
  debounceResize() {
    if (!this.resizeTimerId_) {
      this.resizeTimerId_ = setInterval(this.adjustDimensions.bind(this), 250)
    }
  }

  adjustDimensions() {
    this.resizeTimerId_ && clearInterval(this.resizeTimerId_)
    this.resizeTimerId_ = null

    if (typeof window === "undefined") return
    const boxStyles = window.getComputedStyle(this.outerContainerEl)
    const padding = Number(boxStyles.paddingLeft.substr(0, boxStyles.paddingLeft.length - 2))

    this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2
    if (this.isArcadeMode()) {
      this.dimensions.WIDTH = Math.min(DEFAULT_WIDTH, this.dimensions.WIDTH)
      if (this.activated) {
        this.setArcadeModeContainerScale()
      }
    }

    if (this.canvas) {
      this.canvas.width = this.dimensions.WIDTH
      this.canvas.height = this.dimensions.HEIGHT

      Runner.updateCanvasScaling(this.canvas)

      this.clearCanvas()
      this.horizon.update(0, 0, true)

      // Outer container and distance meter.
      if (this.playing || this.crashed || this.paused) {
        this.containerEl.style.width = this.dimensions.WIDTH + "px"
        this.containerEl.style.height = this.dimensions.HEIGHT + "px"
        // this.stop()
      }

      // Game over panel.
      // if (this.crashed) {

      // }
    }
  }

  update() {
    this.updatePending = false
    let now = Date.now()
    let deltaTime = now - this.time
    this.time = now

    if (this.playing) {
      this.clearCanvas()

      this.runningTime += deltaTime
      let hasObstacles = this.runningTime > Runner.config.CLEAR_TIME

      if (!this.playingIntro) {
        this.playIntro()
      }

      if (this.playingIntro) {
        this.horizon.update(0, this.currentSpeed, hasObstacles)
      } else {
        deltaTime = !this.activated ? 0 : deltaTime
        this.horizon.update(deltaTime, this.currentSpeed, hasObstacles)
      }

      if (this.currentSpeed < Runner.config.MAX_SPEED) {
        this.currentSpeed += Runner.config.ACCELERATION
      }
    }

    if (this.playing) {
      this.scheduleNextUpdate()
    }
  }

  /**
   * RequestAnimationFrame wrapper.
   */
  scheduleNextUpdate() {
    if (!this.updatePending) {
      this.updatePending = true
      this.raqId = requestAnimationFrame(this.update.bind(this))
    }
  }

  /**
   * Play the game intro.
   * Canvas container width expands out to the full width.
   */
  playIntro() {
    if (!this.activated && !this.crashed) {
      this.playingIntro = true

      let keyframes = `@-webkit-keyframes intro {
          from { width: ${Trex.config.WIDTH}px }
          to { width: ${this.dimensions.WIDTH}px } +
        }`
      document.styleSheets[0].insertRule(keyframes, 0)
      this.containerEl.style.webkitAnimation = "intro .4s ease-out 1 both"
      this.containerEl.style.width = this.dimensions.WIDTH + "px"
      this.containerEl.addEventListener(Runner.events.ANIM_END, this.startGame.bind(this))

      this.setPlayStatus(true)
      this.activated = true
    } else if (this.crashed) {
      this.restart()
    }
  }

  /**
   * Update the game status to started.
   */
  startGame() {
    if (this.isArcadeMode()) {
      this.setArcadeMode()
    }
    this.runningTime = 0
    this.playingIntro = false
    this.containerEl.style.webkitAnimation = ""

    window.addEventListener(Runner.events.BLUR, this.onVisibilityChange.bind(this))
    window.addEventListener(Runner.events.FOCUS, this.onVisibilityChange.bind(this))
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT)
  }

  setPlayStatus(playing: boolean) {
    this.playing = playing
  }

  isArcadeMode() {
    return true
  }

  /** Hides offline messaging for a fullscreen game only experience. */
  setArcadeMode() {
    document.body.classList.add(Runner.classes.ARCADE_MODE)
    this.setArcadeModeContainerScale()
  }

  /** Set arcade mode container scaling when start acade mode  */
  setArcadeModeContainerScale() {
    let windowHeight = window.innerHeight
    let scaleHeight = windowHeight / this.dimensions.HEIGHT
    let scaleWidth = window.innerWidth / this.dimensions.WIDTH
    let scale = Math.max(1, Math.min(scaleHeight, scaleWidth))
    let scaledCanvasHeight = this.dimensions.HEIGHT * scale

    let translateY =
      Math.ceil(
        Math.max(
          0,
          (windowHeight - scaledCanvasHeight - Runner.config.ARCADE_MODE_INITIAL_TOP_POSITION) *
            Runner.config.ARCADE_MODE_TOP_POSITION_PERCENT
        )
      ) * window.devicePixelRatio
    this.containerEl.style.transform = "scale(" + scale + ") translateY(" + translateY + "px)"
  }

  restart() {
    if (!this.raqId) {
      this.runningTime = 0
      this.setPlayStatus(true)
      this.paused = false
      this.crashed = false
    }
  }

  onVisibilityChange(e: Event) {
    console.log(e.type)
    if (document.hidden || e.type === Runner.events.BLUR || document.visibilityState != "visible") {
      this.stop()
    } else if (!this.crashed) {
      this.play()
    }
  }

  /** Listen to events */
  startListening() {
    // Keys.
    document.addEventListener(Runner.events.KEYDOWN, this)
    document.addEventListener(Runner.events.KEYUP, this)

    // Touch / pointer.
    this.containerEl.addEventListener(Runner.events.TOUCHSTART, this)
    document.addEventListener(Runner.events.POINTERDOWN, this)
    document.addEventListener(Runner.events.POINTERUP, this)
  }

  stopListening() {
    console.log("stop")

    document.removeEventListener(Runner.events.KEYDOWN, this)
    document.removeEventListener(Runner.events.KEYUP, this)
  }

  /** addEventListener default method */
  handleEvent = (e: KeyboardEvent) => {
    const evtType = e.type
    switch (evtType) {
      case Runner.events.KEYDOWN:
      case Runner.events.TOUCHSTART:
      case Runner.events.KEYDOWN:
        this.onKeydown(e)
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

  stop() {
    this.setPlayStatus(false)
    this.paused = true
    cancelAnimationFrame(this.raqId)
    this.raqId = 0
  }

  play() {
    if (!this.crashed) {
      this.setPlayStatus(true)
      this.paused = false
      this.time = Date.now()
      this.update()
    }
  }

  private static _instance: Runner

  static getInstance(outerContainerId: string, optConfig?: any) {
    if (Runner._instance) {
      Runner._instance.init()
      return Runner._instance
    }
    Runner._instance = new Runner(outerContainerId, optConfig)
    return Runner._instance
  }

  /** Default canvas dimensions */
  static defaultDimensions = {
    WIDTH: 600,
    HEIGHT: 150
  }

  /**
   * Update canvas scale based on devicePixelRatio
   */
  static updateCanvasScaling(canvas: HTMLCanvasElement, opt_width?: number, opt_height?: number) {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D
    // Query the various pixel ratios
    const devicePixelRatio = Math.floor(window.devicePixelRatio) || 1
    const backingStoreRatio = 1
    const ratio = devicePixelRatio / backingStoreRatio

    // Upscale the canvas if the two ratios don't match
    if (devicePixelRatio !== backingStoreRatio) {
      const oldWidth = opt_width || canvas.width
      const oldHeight = opt_height || canvas.height

      canvas.width = oldWidth * ratio
      canvas.height = oldHeight * ratio

      canvas.style.width = oldWidth + "px"
      canvas.style.height = oldHeight + "px"

      // Scale the context to counter the fact that we've manually scaled
      // our canvas element.
      context.scale(ratio, ratio)
      return true
    } else if (devicePixelRatio === 1) {
      // Reset the canvas width / height. Fixes scaling bug when the page is
      // zoomed and the devicePixelRatio changes accordingly.
      canvas.style.width = canvas.width + "px"
      canvas.style.height = canvas.height + "px"
    }
    return false
  }

  static events = {
    ANIM_END: "webkitAnimationEnd",
    CLICK: "click",
    KEYDOWN: "keydown",
    KEYUP: "keyup",
    POINTERDOWN: "pointerdown",
    POINTERUP: "pointerup",
    RESIZE: "resize",
    TOUCHEND: "touchend",
    TOUCHSTART: "touchstart",
    VISIBILITY: "visibilitychange",
    BLUR: "blur",
    FOCUS: "focus",
    LOAD: "load",
    GAMEPADCONNECTED: "gamepadconnected"
  }

  static classes = {
    ARCADE_MODE: "arcade-mode",
    CANVAS: "runner-canvas",
    CONTAINER: "runner-container",
    CRASHED: "crashed",
    ICON: "icon-offline",
    INVERTED: "inverted",
    SNACKBAR: "snackbar",
    SNACKBAR_SHOW: "snackbar-show",
    TOUCH_CONTROLLER: "controller"
  }

  static keycodes = {
    JUMP: { ArrowUp: 1, Space: 1 } as any, // Up, spacebar
    DUCK: { ArrowDown: 1 } as any, // Down
    RESTART: { Enter: 1 } as any // Enter
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
    SPEED_DROP_COEFFICIENT: 3,
    ARCADE_MODE_INITIAL_TOP_POSITION: 35,
    ARCADE_MODE_TOP_POSITION_PERCENT: 0.1
  }

  static imageSprite: HTMLImageElement

  static spriteDefinition = {
    LDPI: {
      BACKGROUND_EL: { x: 86, y: 2 },
      CACTUS_LARGE: { x: 332, y: 2 },
      CACTUS_SMALL: { x: 228, y: 2 },
      OBSTACLE_2: { x: 332, y: 2 },
      OBSTACLE: { x: 228, y: 2 },
      CLOUD: { x: 86, y: 2 },
      HORIZON: { x: 2, y: 54 },
      MOON: { x: 484, y: 2 },
      PTERODACTYL: { x: 134, y: 2 },
      RESTART: { x: 2, y: 68 },
      TEXT_SPRITE: { x: 655, y: 2 },
      TREX: { x: 848, y: 2 },
      STAR: { x: 645, y: 2 },
      COLLECTABLE: { x: 2, y: 2 },
      ALT_GAME_END: { x: 121, y: 2 }
    },
    HDPI: {
      BACKGROUND_EL: { x: 166, y: 2 },
      CACTUS_LARGE: { x: 652, y: 2 },
      CACTUS_SMALL: { x: 446, y: 2 },
      OBSTACLE_2: { x: 652, y: 2 },
      OBSTACLE: { x: 446, y: 2 },
      CLOUD: { x: 166, y: 2 },
      HORIZON: { x: 2, y: 104 },
      MOON: { x: 954, y: 2 },
      PTERODACTYL: { x: 260, y: 2 },
      RESTART: { x: 2, y: 130 },
      TEXT_SPRITE: { x: 1294, y: 2 },
      TREX: { x: 1678, y: 2 },
      STAR: { x: 1276, y: 2 },
      COLLECTABLE: { x: 4, y: 4 },
      ALT_GAME_END: { x: 242, y: 4 }
    },
    MAX_GAP_COEFFICIENT: 1.5,
    MAX_OBSTACLE_LENGTH: 3,
    HAS_CLOUDS: 1,
    BOTTOM_PAD: 10,
    TREX: {
      WAITING_1: { x: 44, w: 44, h: 47, xOffset: 0 },
      WAITING_2: { x: 0, w: 44, h: 47, xOffset: 0 },
      RUNNING_1: { x: 88, w: 44, h: 47, xOffset: 0 },
      RUNNING_2: { x: 132, w: 44, h: 47, xOffset: 0 },
      JUMPING: { x: 0, w: 44, h: 47, xOffset: 0 },
      CRASHED: { x: 220, w: 44, h: 47, xOffset: 0 },
      COLLISION_BOXES: [
        new CollisionBox(22, 0, 17, 16),
        new CollisionBox(1, 18, 30, 9),
        new CollisionBox(10, 35, 14, 8),
        new CollisionBox(1, 24, 29, 5),
        new CollisionBox(5, 30, 21, 4),
        new CollisionBox(9, 34, 15, 4)
      ]
    },
    /** @type {Array<ObstacleType>} */
    OBSTACLES: [
      {
        type: "CACTUS_SMALL",
        width: 17,
        height: 35,
        yPos: 105,
        multipleSpeed: 4,
        minGap: 120,
        minSpeed: 0,
        collisionBoxes: [new CollisionBox(0, 7, 5, 27), new CollisionBox(4, 0, 6, 34), new CollisionBox(10, 4, 7, 14)]
      },
      {
        type: "CACTUS_LARGE",
        width: 25,
        height: 50,
        yPos: 90,
        multipleSpeed: 7,
        minGap: 120,
        minSpeed: 0,
        collisionBoxes: [
          new CollisionBox(0, 12, 7, 38),
          new CollisionBox(8, 0, 7, 49),
          new CollisionBox(13, 10, 10, 38)
        ]
      },
      {
        type: "PTERODACTYL",
        width: 46,
        height: 40,
        yPos: [100, 75, 50], // Variable height.
        yPosMobile: [100, 50], // Variable height mobile.
        multipleSpeed: 999,
        minSpeed: 8.5,
        minGap: 150,
        collisionBoxes: [
          new CollisionBox(15, 15, 16, 5),
          new CollisionBox(18, 21, 24, 6),
          new CollisionBox(2, 14, 4, 3),
          new CollisionBox(6, 10, 4, 7),
          new CollisionBox(10, 8, 6, 9)
        ],
        numFrames: 2,
        frameRate: 1000 / 6,
        speedOffset: 0.8
      }
    ],
    BACKGROUND_EL: {
      CLOUD: {
        HEIGHT: 14,
        MAX_CLOUD_GAP: 400,
        MAX_SKY_LEVEL: 30,
        MIN_CLOUD_GAP: 100,
        MIN_SKY_LEVEL: 71,
        OFFSET: 4,
        WIDTH: 46,
        X_POS: 1,
        Y_POS: 120
      }
    },
    BACKGROUND_EL_CONFIG: {
      MAX_BG_ELS: 1,
      MAX_GAP: 400,
      MIN_GAP: 100,
      POS: 0,
      SPEED: 0.5,
      Y_POS: 125
    },
    LINES: [{ SOURCE_X: 2, SOURCE_Y: 52, WIDTH: 600, HEIGHT: 12, YPOS: 127 }]
  }
}
