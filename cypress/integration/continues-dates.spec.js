context('Continues dates', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/test.html')

    const waitTime1 = 100
    const waitTime2 = 500

    // go to 1/1/1300
    // open month picker
    cy.get('.pwt-date-navigator-button').click()
    // open year picker
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-button').click()

    // navigate previous years
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-next').click()

    cy.wait(waitTime2)
    cy.contains('1300').click()
    cy.wait(waitTime2)
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
