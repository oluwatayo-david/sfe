import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

function renderDrawer(onClose = vi.fn()) {
  render(
    <Drawer open title="Transaction details" onClose={onClose}>
      <p>Reference ACM-1</p>
    </Drawer>
  )
  return onClose
}

describe('Drawer', () => {
  it('is an accessible, labelled dialog', () => {
    renderDrawer()
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
  })

  it('closes from the close button', async () => {
    const onClose = renderDrawer()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape (the dialog cancel event)', () => {
    const onClose = renderDrawer()
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('stays open when clicking inside the panel', async () => {
    const onClose = renderDrawer()
    await userEvent.click(screen.getByText('Reference ACM-1'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when clicking the backdrop', () => {
    const onClose = renderDrawer()
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
