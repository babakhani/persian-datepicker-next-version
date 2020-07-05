context('Continues dates', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/test.html')

    // go to 1/1/1300
    cy.get('.pwt-date-navigator-button').click()
    cy.wait(300)
    cy.get('.pwt-date-navigator-button').click()
    cy.wait(300)
    cy.contains('1400').click()
    cy.wait(300)
    cy.contains('فروردین').click()
  })

  describe('Check all dates from 1300 to 1500', () => {
    it('All dates are continues without duplication', () => {
      let prevDateItemText = ''
      cy.get(
        '#container .pwt-month-table td:not(.othermonth) .pwt-date-view-text'
      ).each((dateItem, index) => {
        const currentDateItemText = dateItem.text()
        expect(currentDateItemText).to.not.equal(prevDateItemText)
        prevDateItemText = currentDateItemText
      })
    })
  })
})
