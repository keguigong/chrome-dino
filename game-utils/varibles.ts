/**
 * Declare some global varibles
 */
export const FPS = 60

export const IS_HDPI = typeof window != "undefined" ? window.devicePixelRatio > 1 : false

export const getRandomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
