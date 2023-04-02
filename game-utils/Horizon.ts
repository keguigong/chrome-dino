import Cloud from "./Cloud"
import HorizonLine from "./HorizonLine"

export default class Horizon {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  horizonLine!: HorizonLine

  dimensions!: Dimensions
  cloudFrequency = Cloud.config.CLOUD_FREQUENCY
  clouds: Cloud[] = []
  cloudSpeed = Cloud.config.BG_CLOUD_SPEED

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource, dimensions: Dimensions) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.dimensions = dimensions
    this.init()
  }

  private init() {
    this.addCloud()
    this.horizonLine = new HorizonLine(this.ctx, this.spriteImage)
  }

  update(deltaTime: number, speed: number) {
    this.horizonLine.update(deltaTime, speed)
    this.updateCloud(deltaTime, speed)
  }

  addCloud() {
    this.clouds.push(new Cloud(this.ctx, this.spriteImage, this.dimensions.WIDTH))
  }

  updateCloud(deltaTime: number, speed: number) {
    let cloudSpeed = Math.ceil((deltaTime * this.cloudSpeed * speed) / 1000)
    let numClouds = this.clouds.length

    if (numClouds) {
      for (let i = numClouds - 1; i >= 0; i--) {
        this.clouds[i].update(cloudSpeed)
      }

      let lastCloud = this.clouds[numClouds - 1]

      if (
        numClouds < Cloud.config.MAX_CLOUDS &&
        this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap &&
        this.cloudFrequency > Math.random()
      ) {
        this.addCloud()
      }

      this.clouds.filter((item) => !item.remove)
    } else {
      this.addCloud()
    }
  }
}
