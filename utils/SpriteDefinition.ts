export default class SpriteDefinition {
  IS_HDPI = window.devicePixelRatio > 1

  static originals = {
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
    }
  }

  private static instance: SpriteDefinition

  static getIsHdpi() {
    this.getInstance()
    return this.instance.IS_HDPI
  }

  static getPositions() {
    this.getInstance()
    if (this.instance.IS_HDPI) return SpriteDefinition.originals.HDPI
    else return SpriteDefinition.originals.LDPI
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SpriteDefinition()
      return this.instance
    }
    return this.instance
  }
}
