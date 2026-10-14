import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement <dialog> methods. This stub only toggles `open`; focus trapping and Escape
// handling come from real browsers.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
