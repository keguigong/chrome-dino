/**
 * Declare some global varibles
 */
export const FPS = 60

export const IS_HIDPI = typeof window != "undefined" ? window.devicePixelRatio > 1 : false

export const IS_IOS = typeof window != "undefined" ? /CriOS/.test(window.navigator.userAgent) : false

export const IS_MOBILE = typeof window != "undefined" ? /Android/.test(window.navigator.userAgent) || IS_IOS : false

export const getRandomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
