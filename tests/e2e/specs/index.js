// https://docs.cypress.io/api/introduction/api.html
const address = 'http://127.0.0.1:8001/'
const sectionsDelay = 5
const toPersianDigit = function (digit, latinDigit = false) {
  return digit.toString().replace(/\d+/g, function (digit) {
    let enDigitArr = [], peDigitArr = [], i, j;
    for (i = 0; i < digit.length; i += 1) {
      enDigitArr.push(digit.charCodeAt(i));
    }
    for (j = 0; j < enDigitArr.length; j += 1) {
      peDigitArr.push(String.fromCharCode(enDigitArr[j] + ((!!latinDigit && latinDigit === true) ? 1584 : 1728)));
    }
    return peDigitArr.join('');
  });
}
const leftZeroFill = function (number, targetLength = 1) {
  let output = number + '';
  while (output.length <= targetLength) {
    output = '0' + output;
  }
  return output;
}

describe('Check 1400/1/1 00:00 rendered element', () => {
  it('Main', () => {
    cy.visit(address)
    cy.get('.pwt-date-info--title').contains('۱۴۰۰')
    cy.get('.pwt-date-info--sub-title').contains('یکشنبه ۰۱ فروردین')
    cy.get('.pwt-date-info--time').contains('۰۰:۰۰:۰۰ ق ظ')
    cy.get('.pwt-date-navigator-button').contains('۱۴۰۰ فروردین')

    cy.get('.pwt-month-table .selected .pwt-date-view-text').contains('۱')
    cy.get('.pwt-month-table .pwt-date-view-text').contains('۳۱')
  })
})

describe('Select Every Month nth date', () => {
  it('Main', () => {
    let monthString = [
       'یکشنبه ۰۱ فروردین',
       'چهار شنبه ۰۱ اردیبهشت',
       'شنبه ۰۱ خرداد',
       'سه شنبه ۰۱ تیر',
       'جمعه ۰۱ مرداد',
       'دوشنبه ۰۱ شهریور',
       'پنج‌شنبه ۰۱ مهر',
       'شنبه ۰۱ آبان',
       'دوشنبه ۰۱ آذر',
       'چهار شنبه ۰۱ دی',
       'جمعه ۰۱ بهمن',
       'یکشنبه ۰۱ اسفند',
    ]
    let monthToTest = 11
    const nthDate = 1
    cy.visit(address, {
      onBeforeLoad: function (window) {
      }
    })
    let i = 0;
    cy.get('input#container')
      .invoke('val')
      .and('equal', `۱۴۰۰/۰۱/۰۱ ۰۰:۰۰:۰۰`) 
    cy.get('.pwt-date-info--sub-title').contains(monthString[0])

    while(i < monthToTest) {
      cy.get('.pwt-date-navigator .pwt-date-navigator-prev').click()
      cy.get('.pwt-date-view-text').contains(toPersianDigit(nthDate)).click()
      cy.wait(200)
      cy.get('.pwt-date-info--sub-title').contains(monthString[1+i])
      cy.get('input#container')
        .invoke('val')
        .and('equal', `۱۴۰۰/${toPersianDigit(leftZeroFill(2+i))}/${toPersianDigit(leftZeroFill(nthDate))} ۰۰:۰۰:۰۰`) 
      cy.get('.pwt-date-info--title').contains('۱۴۰۰')
      cy.wait(200)
      i++
    }
    cy.log(`DONE: No Duplicate Day tested for ${ monthToTest/12} years`)
  })
})

describe('No Duplicate Date', () => {
  it('Main', () => {
    //let monthToTest = 1200
    let monthToTest = 11
    cy.visit(address, {
      onBeforeLoad: function (window) {
      }
    })
    let i = 1;
    while(i < monthToTest) {
      cy.get('.pwt-date-navigator .pwt-date-navigator-prev').click()
      cy.get('.pwt-date-view-text').contains('۱۵').click()

      let prevDateItemText = ''
      cy.get(
        '.pwt-month-table td:not(.othermonth) .pwt-date-view-text'
      ).each((dateItem, index) => {
        const currentDateItemText = dateItem.text()
        expect(currentDateItemText).to.not.equal(prevDateItemText)
        prevDateItemText = currentDateItemText
      })

      cy.wait(sectionsDelay)
      cy.log("Test Date in Next Month :"  + i)
      i++
    }
    cy.log(`DONE: No Duplicate Day tested for ${ monthToTest/12} years`)
  })
})
