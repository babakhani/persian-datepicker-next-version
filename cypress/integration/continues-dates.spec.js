context('Continues dates', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/test.html')

    const waitTime1 = 100
    const waitTime2 = 2000

    // go to 1/1/1300
    // open month picker
    cy.get('.pwt-date-navigator-button').click()
    // open year picker
    cy.wait(waitTime1)
    cy.get('.pwt-date-navigator-button').click()

    // initial date is 1399 in test file
    const pagesToGoBack = Math.floor((1399 - 1300) / 12)

    // navigate previous years {pagesToGoBack} times
    for (let index = 0; index < pagesToGoBack; index++) {
      cy.wait(waitTime1)
      cy.get('.pwt-date-navigator-next').click()
    }

    cy.wait(waitTime2)
    cy.contains('1300').click()
    cy.wait(waitTime2)
    cy.contains('فروردین').click()
  })

  describe('Check all dates from 1300 to 1500', () => {
    it('All dates are continues without duplication', () => {
      const pagesToGoNext = Math.ceil((1500 - 1300) * 12)
      const waitTime3 = 1

      for (let index = 0; index < pagesToGoNext; index++) {
        cy.wait(waitTime3)
        cy.get('.pwt-date-navigator-prev').click()

        let prevDateItemText = ''
        cy.get(
          '#container .pwt-month-table td:not(.othermonth) .pwt-date-view-text'
        ).each((dateItem, index) => {
          const currentDateItemText = dateItem.text()
          expect(currentDateItemText).to.not.equal(prevDateItemText)
          prevDateItemText = currentDateItemText
        })
      }
    })
  })
})
