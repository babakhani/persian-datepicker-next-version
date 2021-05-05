let Helper = {
  debug () {
  //  // console.log(i)
  }
}
/**
 * @description persian-datepicker configuration document
 */
export default {
     
     /**
      * @since 2.0.0
      */
    'animate': true,
    'animateSpeed': 180,


    /**
     * @description set default calendar mode of datepicker, available options: 'persian', 'gregorian'
     * @default 'persian'
     * @type string
     * @since 1.0.0
     */
    'calendarType': 'persian',


    /**
     * @description calendar type and localization configuration
     * @type object
     * @since 1.0.0
     * @example
     * {
     *     'persian': {
     *         'locale': 'fa',
     *         'showHint': false,
     *         'leapYearMode': 'algorithmic' // "astronomical"
     *     },
     *
     *     'gregorian': {
     *         'locale': 'en',
     *         'showHint': false
     *     }
     * }
     *
     *
     *
     */
    'calendar': {

        /**
         * @description Persian calendar configuration
         * @type object
         * @since 1.0.0
         */
        'persian': {

            /**
             * @description set locale of Persian calendar available options: 'fa', 'en'
             * @default 'fa'
             * @type string
             * @since 1.0.0
             */
            'locale': 'fa',

            /**
             * @description if set true, small date hint of this calendar will be shown on another calendar
             * @type boolean
             * @default false
             * @since 1.0.0
             */
            'showHint': false,

            /**
             * @description Persian calendar leap year calculation mode, available options: 'algorithmic', 'astronomical'
             * @type string
             * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/leapyear
             * @default 'algorithmic'
             * @since 1.0.0
             */
            'leapYearMode': 'algorithmic' // "astronomical"
        },


        /**
         * @description Gregorian calendar configuration
         * @type object
         * @since 1.0.0
         */
        'gregorian': {

            /**
             * @description set locale of Gregorian calendar available options: 'fa', 'en'
             * @default 'en'
             * @type string
             * @since 1.0.0
             */
            'locale': 'en',

            /**
             * @description if set true, small date hint of this calendar will be shown on another calendar
             * @type boolean
             * @default false
             * @since 1.0.0
             */
            'showHint': false
        }
    },


    /**
     * @description if set true make enable responsive view on mobile devices, Since 2.0.0
     * responsive is enable by default and you cant disable it
     * @type boolean
     * @since 1.0.0
     * @default true
     * @deprecated 2.0.0
     */
    'responsive': true,


    /**
     * @description if true datepicker render inline, Since 2.0.0 datepicker would show inline if
     * you init it on anything except input
     * @type boolean
     * @default false
     * @deprecated 2.0.0
     */
    'inline': false,


    /**
     * @description If set true datepicker init with input value date, use data-date property when you want set inline datepicker initial value
     * @type boolean
     * @default true
     */
    'initialValue': true,


    /**
     * @description Initial value calendar type, accept: 'persian', 'gregorian', Since 2.0.0
     * pwt.datepicker only accept gregorian value as initail value
     * @type boolean
     * @default true
     * @deprecated 2.0.0
     */
    'initialValueType': 'gregorian',


    /**
     * @description from v1.0.0 this options is deprecated, use calendar.persian.locale instead
     * @deprecated
     * @type boolean
     * @default true
     * @deprecated 2.0.0
     */
    'persianDigit': true,


    /**
     * @description default view mode, Acceptable value : day,month,year
     * @type {string}
     * @default 'day'
     */
    'viewMode': 'day',


    /**
     * @description the date format, combination of d, dd, m, mm, yy, yyy.
     * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
     * @type {boolean}
     * @default 'LLLL'
     */
    'format': 'LLLL',


    /**
     * @description format value of input
     * @param unixDate
     * @param dateObject
     * @default function
     * @example function (unixDate) {
     *      var self = this;
     *      var pdate = new persianDate(unixDate);
     *      pdate.formatPersian = this.persianDigit;
     *      return pdate.format(self.format);
     *  }
     */
    'formatter': function (unixDate, dateObject) {
       return new dateObject(unixDate).format(this.format);
    },


    /**
     * @description An input element that is to be updated with the selected date from the datepicker. Use the altFormat option to change the format of the date within this field. Leave as blank for no alternate field. acceptable value: : '#elementId','.element-class'
     * @type {boolean}
     * @default false
     * @example
     * altField: '#inputAltFirld'
     *
     * altField: '.input-alt-field'
     */
    'altField': false,


    /**
     * @description the date format, combination of d, dd, m, mm, yy, yyy.
     * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
     * @type {string}
     * @default 'unix'
     */
    'altFormat': 'unix',


    /**
     * @description format value of 'altField' input
     * @param unixDate
     * @param dateObject
     * @default function
     * @example function (unixDate) {
     *      if (this.altFormat === 'gregorian' || this.altFormat === 'g') {
     *         return new Date(unixDate)
     *      }
     *      else if (this.altFormat === 'unix' || this.altFormat === 'u') {
     *        return new dateObject(unixDate).valueOf();
     *      } else {
     *        return new dateObject(unixDate).format(this.altFormat);
     *      }
     */
    'altFieldFormatter': function (unixDate, dateObject) {
       if (this.altFormat === 'gregorian' || this.altFormat === 'g') {
          return new Date(unixDate)
       }
       else if (this.altFormat === 'unix' || this.altFormat === 'u') {
         return new dateObject(unixDate).valueOf();
       } else {
         return new dateObject(unixDate).format(this.altFormat);
       }
    },


    /**
     * @description Set min date on datepicker, prevent user select date before given unix time
     * @property minDate
     * @type Date
     * @default null
     */
    'minDate': null,


    /**
     * @description Set max date on datepicker, prevent user select date after given unix time
     * @property maxDate
     * @type Date
     * @default null
     */
    'maxDate': null,


    /**
     * @description navigator config object
     * @type {object}
     * @default true
     */
    'navigator': {
        /**
         * @description make navigator enable or disable
         * @type boolean
         * @default true
         */
        'enabled': true,

        /**
         * @description navigate by scroll configuration
         * @type object
         * @description scroll navigation options
         */
        'scroll': {

            /**
             * @description if you want make disable scroll navigation set this option false
             * @type boolean
             * @default true
             */
            'enabled': true
        },


        /**
         * @description navigator text config object
         */
        'text': {
            /**
             * @description text of next button
             * @default '<'
             */
            'btnNextText': '<',


            /**
             * @description text of prev button
             * @default: '>'
             */
            'btnPrevText': '>'
        },


        /**
         * @description Called when navigator goes to next state
         * @event
         * @example function (navigator) {
         *      //log('navigator next ');
         *  }
         */
        'onNext': function (datepickerObject) {
            Helper.debug(datepickerObject, 'Event: onNext');
        },


        /**
         * @description Called when navigator goes to previews state
         * @event
         * @example function (navigator) {
         *      //log('navigator prev ');
         *  }
         */
        'onPrev': function (datepickerObject) {
            Helper.debug(datepickerObject, 'Event: onPrev');
        },


        /**
         * @description Called when navigator switch
         * @event
         * @example function (datepickerObject) {
                // console.log('navigator switch ');
         *  }
         */
        'onSwitch': function (datepickerObject) {
            Helper.debug(datepickerObject, 'dayPicker Event: onSwitch');
        }
    },


    /**
     * @description toolbox config object
     * @type {object}
     * @default true
     */
    'toolbox': {

        /**
         * @description boolean option that make toolbar enable or disable
         * @type boolean
         * @default true
         */
        'enabled': true,

        /**
         * @description toolbox button text configuration
         * @type object
         * @deprecated from 1.0.0
         */
        'text': {

            /**
             * @description text of today button, deprecated from 1.0.0
             * @type string
             * @default 'امروز'
             * @deprecated from 1.0.0
             */
            btnToday: 'امروز'

        },


        /**
         * @description submit button configuration (only shown on mobile)
         * @since 1.0.0
         */
        submitButton: {

            /**
             * @description make submit button enable or disable
             * @type boolean
             * @default false
             * @since 1.0.0
             */
            enabled: Helper.isMobile,


            /**
             * @description submit button text
             * @since 1.0.0
             * @type object
             */
            text: {

                /**
                 * @description show when current calendar is Persian
                 * @since 1.0.0
                 * @type object
                 * @default تایید
                 */
                fa: 'تایید',


                /**
                 * @description show when current calendar is Gregorian
                 * @since 1.0.0
                 * @type object
                 * @default submit
                 */
                en: 'submit'
            },


            /**
             * @description Called when submit button clicked
             * @since 1.0.0
             * @type function
             * @event
             */
            onSubmit: function (datepickerObject) {
                Helper.debug(datepickerObject, 'dayPicker Event: onSubmit');
            }
        },


        /**
         * @description toolbox today button configuration
         * @since 1.0.0
         */
        todayButton: {

            /**
             * @description make toolbox today button enable or disable
             * @type boolean
             * @since 1.0.0
             */
            enabled: true,


            /**
             * @description today button text
             * @since 1.0.0
             * @type object
             */
            text: {

                /**
                 * @description show when current calendar is Persian
                 * @since 1.0.0
                 * @type object
                 * @default امروز
                 */
                fa: 'امروز',

                /**
                 * @description show when current calendar is Gregorian
                 * @since 1.0.0
                 * @type object
                 * @default today
                 */
                en: 'today'
            },

            /**
             * @description Called when today button clicked
             * @since 1.0.0
             * @type function
             * @event
             */
            onToday: function (datepickerObject) {
                Helper.debug(datepickerObject, 'dayPicker Event: onToday');
            }
        },


        /**
         * @description toolbox calendar switch configuration
         * @type object
         * @since 1.0.0
         */
        calendarSwitch: {

            /**
             * @description make calendar switch enable or disable
             * @type boolean
             * @since 1.0.0
             * @default true
             */
            enabled: true,


            /**
             * @description calendar switch text format string
             * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
             * @type string
             * @since 1.0.0
             * @default MMMM
             */
            format: 'MMMM',


            /**
             * @description Called when calendar switch clicked
             * @since 1.0.0
             * @type function
             * @event
             */
            onSwitch: function (datepickerObject) {
                Helper.debug(datepickerObject, 'dayPicker Event: onSwitch');
            }
        },

        /**
         * @event
         * @param toolbox
         * @example function (toolbox) {
         *      //log('toolbox today btn');
         *  }
         *  @deprecated 1.0.0
         */
        onToday: function (datepickerObject) {
            Helper.debug(datepickerObject, 'dayPicker Event: onToday');
        }
    },


    /**
     * @description if true all pickers hide and just show timepicker
     * @default false
     * @type boolean
     */
    'onlyTimePicker': false,


    /**
     * @description  if true date select just by click on day in month grid, and when user select month or year selected date doesnt change
     * @property justSelectOnDate
     * @type boolean
     * @default: true
     */
    'onlySelectOnDate': true,


    /**
     * @description Validate date access before render
     * @type function
     */
    'checkDate': function () {
        return true;
    },


    /**
     * @description Validate month access before render
     * @type {function}
     */
    'checkMonth': function () {
        return true;
    },


    /**
     * @description Validate year access before render
     * @type {function}
     */
    'checkYear': function () {
        return true;
    },


    /**
     * @description timePicker configuration
     * @type {object}
     */
    'timePicker': {

        /**
         * @description make timePicker enable or disable
         * @type boolean
         */
        'enabled': true,


        /**
         * @description  if true timepicker will be sow after select day
         * @type boolean
         * @default true
         * @Since 2.0.0
         */
        'showAsLastStep': true,

        /**
         * @description The amount that increases or decreases by pressing the button
         * @type number
         */
        'step': 1,

        /**
         * @description daypicker title format string
         * @type string
         * @default 'YYYY MMMM'
         * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
         * @Since 2.0.0
         */
        'titleFormat': 'MMMM DD',

        /**
         * @description daypicker title formatter function
         * @param year
         * @param month
         * @return {*}
         * @Since 2.0.0
         */
        'titleFormatter': function (unix, dateObject) {
            return new dateObject(unix).format(this.titleFormat)
        },

        /**
         * @description hour selector configuration
         * @type object
         */
        'hour': {

            /**
             * @description make hour selector enable or disable
             * @type boolean
             */
            'enabled': true,

            /**
             * @description The amount that increases or decreases hour, by pressing the button. overwrite by timepicker.step
             * @type boolean
             */
            'step': null
        },

        /**
         * @description minute selector configuration
         * @type object
         */
        'minute': {

            /**
             * @description make minute selector enable or disable
             * @type boolean
             */
            'enabled': true,

            /**
             * @description The amount that increases or decreases minute, by pressing the button. overwrite by timepicker.step
             * @description overwrite by parent step
             * @type boolean
             */
            'step': null
        },

        /**
         * @description second selector configuration
         * @type object
         */
        'second': {

            /**
             * @description make second selector enable or disable
             * @type boolean
             */
            'enabled': true,

            /**
             * @description The amount that increases or decreases second, by pressing the button. overwrite by timepicker.step
             * @type boolean
             */
            'step': null
        },

        /**
         * @description meridian selector configuration
         * @type object
         */
        'meridian': {

            /**
             * @description if you set this as false, datepicker timepicker system moved to 24-hour system
             * @type boolean
             */
            'enabled': true
        }
    },


    /**
     * @description dayPicker configuration
     * @type {object}
     */
    'dayPicker': {

        /**
         * @description make daypicker enable or disable
         * @type boolean
         * @default true
         */
        'enabled': true,

        /**
         * @description daypicker title format string
         * @type string
         * @default 'YYYY MMMM'
         * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
         */
        'titleFormat': 'YYYY MMMM',

        /**
         * @description daypicker title formatter function
         * @param year
         * @param month
         * @return {*}
         * @changed 2.0.0
         */
        'titleFormatter': function (unix, dateObject) {
            return new dateObject(unix).format(this.titleFormat)
        },

        /**
         * @description fired when user select date
         * @event
         * @param selectedDayUnix
         */
        'onSelect': function (selectedDayUnix) {
            Helper.debug(this, 'dayPicker Event: onSelect : ' + selectedDayUnix);
        }

    },


    /**
     * @description monthPicker configuration
     * @type {object}
     */
    'monthPicker': {

        /**
         * @description make monthPicker enable or disable
         * @type boolean
         * @default true
         */
        'enabled': true,

        /**
         * @description monthPicker title format string
         * @type string
         * @default 'YYYY'
         */
        'titleFormat': 'YYYY',

        /**
         * @description monthPicker title formatter function
         * @param unix
         * @return {*}
         * @changed 2.0.0
         */
        'titleFormatter': function (unix, dateObject) {
          return new dateObject(unix).format(this.titleFormat)
        },

        /**
         * @description fired when user select month
         * @event
         * @param monthIndex
         */
        'onSelect': function (monthIndex) {
            Helper.debug(this, 'monthPicker Event: onSelect : ' + monthIndex);
        }
    },


    /**
     * @description yearPicker configuration
     * @type {object}
     */
    'yearPicker': {

        /**
         * @description make yearPicker enable or disable
         * @type boolean
         * @default true
         */
        'enabled': true,

        /**
         * @description yearPicker title format string
         * @type string
         * @default 'YYYY'
         */
        'titleFormat': 'YYYY',

        /**
         * @description yearPicker title formatter function
         * @param year
         * @return {string}
         * @changed 2.0.0
         */
        'titleFormatter': function (unix, dateObject) {
          let selectedYear = new dateObject(unix).year()
          let startYear = selectedYear - (selectedYear % 12)
          return new dateObject(unix).year(startYear).format(this.titleFormat) + '-' + new
            dateObject(unix).year(startYear+ 11).format(this.titleFormat)
        },

        /**
         * @description fired when user select year
         * @event
         * @param year
         */
        'onSelect': function (year) {
            Helper.debug(this, 'yearPicker Event: onSelect : ' + year);
        }
    },


    /**
     * TODO: compelte Doc
     * @description Material design like infobox
     * @since 2.0.0
     */
    'infobox': {
      'enabled': true,
      'titleFormat': 'YYYY', 
      'titleFormatter': function (unix, dateObject) {
        return new dateObject(unix).format(this.titleFormat)
      },
      'selectedDateFormat': 'dddd DD MMMM',
      'selectedDateFormatter': function (unix, dateObject) {
        return new dateObject(unix).format(this.selectedDateFormat)
      },
      'selectedTimeFormat': 'hh:mm:ss a',
      'selectedTimeFormatter': function (unix, dateObject) {
        return new dateObject(unix).format(this.selectedTimeFormat)
      }
    },


    /**
     * @description Called when date Select by user.
     * @event
     * @param unixDate
     */
    'onSelect': function (unixDate) {
        Helper.debug(this, 'datepicker Event: onSelect : ' + unixDate);
    },


    /**
     * @description Called when date Select by api.
     * @event
     * @param unixDate
     */
    'onSet': function (unixDate) {
        Helper.debug(this, 'datepicker Event: onSet : ' + unixDate);
    },

    /**
     * @description position of datepicker relative to input element
     * @type string | array
     * @default 'auto'
     * @example
     *  'position': 'auto'
     *'position': [10,10]
     */
    'position': 'auto',


    /**
     * @description A function that takes current datepicker instance. It is called just before the datepicker is displayed.
     * @event
     */
    'onShow': function (datepickerObject) {
        Helper.debug(datepickerObject, 'Event: onShow ');
    },


    /**
     * @description A function that takes current datepicker instance. It is called just before the datepicker Hide.
     * @event
     */
    'onHide': function (datepickerObject) {
        Helper.debug(datepickerObject, 'Event: onHide ');
    },


    /**
     * @description on toggle datepicker event
     * @event
     */
    'onToggle': function (datepickerObject) {
        Helper.debug(datepickerObject, 'Event: onToggle ');
    },


    /**
     * @description on destroy datepicker event
     * @event
     */
    'onDestroy': function (datepickerObject) {
        Helper.debug(datepickerObject, 'Event: onDestroy ');
    },


    /**
     * @description If true datepicker close When select a date
     * @type {boolean}
     * @default false
     */
    'autoClose': false,


    /**
     * @description by default datepicker have a template string, and you can overwrite it simply by replace string in config.
     * @type string
     * @deprected 2.0.0
     * @removed 2.0.0
     */
    'template': null,


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Under Implement ///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @description if true datepicker update self by user inputted date string, accept 'yyyy/mm/dd'
     * @example '1396/10/2', ''
     * @type {boolean}
     * @default false
     */
    'observer': false,

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Un  implemented ///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * @description waite time for last user key-down event, accept millisecond
     * @type {number}
     * @default 800
     */
    'inputDelay': 800
};
