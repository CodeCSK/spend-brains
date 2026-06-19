type SavedStyles = {
  htmlOverflow: string
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyWidth: string
  bodyTouchAction: string
}

let lockCount = 0
let savedScrollY = 0
let savedStyles: SavedStyles | null = null

/** Lock page scroll (reference counted for nested modals). */
export function lockBodyScroll(): void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY

    savedStyles = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      bodyTouchAction: document.body.style.touchAction,
    }

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.touchAction = 'none'
  }

  lockCount += 1
}

/** Release a scroll lock acquired with lockBodyScroll(). */
export function unlockBodyScroll(): void {
  if (lockCount === 0) {
    return
  }

  lockCount -= 1

  if (lockCount !== 0 || !savedStyles) {
    return
  }

  document.documentElement.style.overflow = savedStyles.htmlOverflow
  document.body.style.overflow = savedStyles.bodyOverflow
  document.body.style.position = savedStyles.bodyPosition
  document.body.style.top = savedStyles.bodyTop
  document.body.style.width = savedStyles.bodyWidth
  document.body.style.touchAction = savedStyles.bodyTouchAction
  document.body.style.left = ''
  document.body.style.right = ''

  window.scrollTo(0, savedScrollY)
  savedStyles = null
}
