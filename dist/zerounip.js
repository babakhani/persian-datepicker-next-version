/**
 * 
 * persian-datepicker-next-version
 * v0.0.1
 * babakhani.reza@gmail.com
 * license MIT
 * 
 *     
 */


(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
this['persian-datepicker-next-version'] = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var persianDate = createCommonjsModule(function (module, exports) {
    /*!
     * 
     * persian-date -  1.1.0
     * Reza Babakhani <babakhani.reza@gmail.com>
     * http://babakhani.github.io/PersianWebToolkit/docs/persian-date/
     * Under MIT license 
     * 
     * 
     */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(commonjsGlobal, function() {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId])
    /******/ 			return installedModules[moduleId].exports;
    /******/
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// identity function for calling harmony imports with the correct context
    /******/ 	__webpack_require__.i = function(value) { return value; };
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, {
    /******/ 				configurable: false,
    /******/ 				enumerable: true,
    /******/ 				get: getter
    /******/ 			});
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 8);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ (function(module, exports, __webpack_require__) {


    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var durationUnit = __webpack_require__(4).durationUnit;

    var Helpers = function () {
        function Helpers() {
            _classCallCheck(this, Helpers);
        }

        _createClass(Helpers, [{
            key: 'toPersianDigit',


            /**
             * @description return converted string to persian digit
             * @param digit
             * @returns {string|*}
             */
            value: function toPersianDigit(digit) {
                var latinDigit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                return digit.toString().replace(/\d+/g, function (digit) {
                    var enDigitArr = [],
                        peDigitArr = [],
                        i = void 0,
                        j = void 0;
                    for (i = 0; i < digit.length; i += 1) {
                        enDigitArr.push(digit.charCodeAt(i));
                    }
                    for (j = 0; j < enDigitArr.length; j += 1) {
                        peDigitArr.push(String.fromCharCode(enDigitArr[j] + (!!latinDigit && latinDigit === true ? 1584 : 1728)));
                    }
                    return peDigitArr.join('');
                });
            }

            /**
             * @param number
             * @param targetLength
             * @returns {string}
             */

        }, {
            key: 'leftZeroFill',
            value: function leftZeroFill(number, targetLength) {
                var output = number + '';
                while (output.length < targetLength) {
                    output = '0' + output;
                }
                return output;
            }

            /**
             * @description normalize duration params and return valid param
             * @return {{unit: *, value: *}}
             */

        }, {
            key: 'normalizeDuration',
            value: function normalizeDuration() {
                var unit = void 0,
                    value = void 0;
                if (typeof arguments[0] === 'string') {
                    unit = arguments[0];
                    value = arguments[1];
                } else {
                    value = arguments[0];
                    unit = arguments[1];
                }
                if (durationUnit.year.indexOf(unit) > -1) {
                    unit = 'year';
                } else if (durationUnit.month.indexOf(unit) > -1) {
                    unit = 'month';
                } else if (durationUnit.week.indexOf(unit) > -1) {
                    unit = 'week';
                } else if (durationUnit.day.indexOf(unit) > -1) {
                    unit = 'day';
                } else if (durationUnit.hour.indexOf(unit) > -1) {
                    unit = 'hour';
                } else if (durationUnit.minute.indexOf(unit) > -1) {
                    unit = 'minute';
                } else if (durationUnit.second.indexOf(unit) > -1) {
                    unit = 'second';
                } else if (durationUnit.millisecond.indexOf(unit) > -1) {
                    unit = 'millisecond';
                }
                return {
                    unit: unit,
                    value: value
                };
            }

            /**
             *
             * @param number
             * @returns {number}
             */

        }, {
            key: 'absRound',
            value: function absRound(number) {
                if (number < 0) {
                    return Math.ceil(number);
                } else {
                    return Math.floor(number);
                }
            }

            /**
             *
             * @param number
             * @return {number}
             */

        }, {
            key: 'absFloor',
            value: function absFloor(number) {
                if (number < 0) {
                    // -0 -> 0
                    return Math.ceil(number) || 0;
                } else {
                    return Math.floor(number);
                }
            }
        }]);

        return Helpers;
    }();

    module.exports = Helpers;

    /***/ }),
    /* 1 */
    /***/ (function(module, exports, __webpack_require__) {


    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var TypeChecking = __webpack_require__(10);
    var Algorithms = __webpack_require__(2);
    var Helpers = __webpack_require__(0);
    var Duration = __webpack_require__(5);
    var Validator = __webpack_require__(11);
    var toPersianDigit = new Helpers().toPersianDigit;
    var leftZeroFill = new Helpers().leftZeroFill;
    var normalizeDuration = new Helpers().normalizeDuration;
    var fa = __webpack_require__(7);
    var en = __webpack_require__(6);

    /**
     * @description persian date class
     */

    var PersianDateClass = function () {

        /**
         * @param input
         * @return {PersianDateClass}
         */
        function PersianDateClass(input) {
            _classCallCheck(this, PersianDateClass);

            this.calendarType = PersianDateClass.calendarType;
            this.localType = PersianDateClass.localType;
            this.leapYearMode = PersianDateClass.leapYearMode;

            this.algorithms = new Algorithms(this);
            this.version = "1.1.0";
            this._utcMode = false;
            if (this.localType !== 'fa') {
                this.formatPersian = false;
            } else {
                this.formatPersian = '_default';
            }
            this.State = this.algorithms.State;
            this.setup(input);
            if (this.State.isInvalidDate) {
                // Return Date like message
                return new Date([-1, -1]);
            }
            return this;
        }

        /**
         * @param input
         */


        _createClass(PersianDateClass, [{
            key: 'setup',
            value: function setup(input) {
                // Convert Any thing to Gregorian Date
                if (TypeChecking.isDate(input)) {
                    this._gDateToCalculators(input);
                } else if (TypeChecking.isArray(input)) {
                    if (!Validator.validateInputArray(input)) {
                        this.State.isInvalidDate = true;
                        return false;
                    }
                    this.algorithmsCalc([input[0], input[1] ? input[1] : 1, input[2] ? input[2] : 1, input[3] ? input[3] : 0, input[4] ? input[4] : 0, input[5] ? input[5] : 0, input[6] ? input[6] : 0]);
                } else if (TypeChecking.isNumber(input)) {
                    var fromUnix = new Date(input);
                    this._gDateToCalculators(fromUnix);
                }
                // instance of pDate
                else if (input instanceof PersianDateClass) {
                        this.algorithmsCalc([input.year(), input.month(), input.date(), input.hour(), input.minute(), input.second(), input.millisecond()]);
                    }
                    // ASP.NET JSON Date
                    else if (input && input.substring(0, 6) === '/Date(') {
                            var fromDotNet = new Date(parseInt(input.substr(6)));
                            this._gDateToCalculators(fromDotNet);
                        } else {
                            var now = new Date();
                            this._gDateToCalculators(now);
                        }
            }

            /**
             * @param input
             * @return {*}
             * @private
             */

        }, {
            key: '_getSyncedClass',
            value: function _getSyncedClass(input) {
                var syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType).toLeapYearMode(this.leapYearMode);
                return new syncedCelander(input);
            }

            /**
             * @param inputgDate
             * @private
             */

        }, {
            key: '_gDateToCalculators',
            value: function _gDateToCalculators(inputgDate) {
                this.algorithms.calcGregorian([inputgDate.getFullYear(), inputgDate.getMonth(), inputgDate.getDate(), inputgDate.getHours(), inputgDate.getMinutes(), inputgDate.getSeconds(), inputgDate.getMilliseconds()]);
            }

            /**
             * @since 1.0.0
             * @description Helper method that return date range name like week days name, month names, month days names (specially in persian calendar).
             * @static
             * @return {*}
             */

        }, {
            key: 'rangeName',


            /**
             * @since 1.0.0
             * @description Helper method that return date range name like week days name, month names, month days names (specially in persian calendar).
             * @return {*}
             */
            value: function rangeName() {
                var t = this.calendarType;
                if (this.localType === 'fa') {
                    if (t === 'persian') {
                        return fa.persian;
                    } else {
                        return fa.gregorian;
                    }
                } else {
                    if (t === 'persian') {
                        return en.persian;
                    } else {
                        return en.gregorian;
                    }
                }
            }

            /**
             * @since 1.0.0
             * @param input
             * @return {PersianDateClass}
             */

        }, {
            key: 'toLeapYearMode',
            value: function toLeapYearMode(input) {
                this.leapYearMode = input;
                if (input === 'astronomical' && this.calendarType == 'persian') {
                    this.leapYearMode = 'astronomical';
                } else if (input === 'algorithmic' && this.calendarType == 'persian') {
                    this.leapYearMode = 'algorithmic';
                }
                this.algorithms.updateFromGregorian();
                return this;
            }

            /**
             * @since 1.0.0
             * @static
             * @param input
             * @return {PersianDateClass}
             */

        }, {
            key: 'toCalendar',


            /**
             * @since 1.0.0
             * @param input
             * @return {PersianDateClass}
             */
            value: function toCalendar(input) {
                this.calendarType = input;
                this.algorithms.updateFromGregorian();
                return this;
            }

            /**
             * @since 1.0.0
             * @static
             * @param input
             * @return {PersianDateClass}
             */

        }, {
            key: 'toLocale',


            /**
             * @since 1.0.0
             * @param input
             * @return {PersianDateClass}
             */
            value: function toLocale(input) {
                this.localType = input;
                if (this.localType !== 'fa') {
                    this.formatPersian = false;
                } else {
                    this.formatPersian = '_default';
                }
                return this;
            }

            /**
             * @return {*}
             * @private
             */

        }, {
            key: '_locale',
            value: function _locale() {
                var t = this.calendarType;
                if (this.localType === 'fa') {
                    if (t === 'persian') {
                        return fa.persian;
                    } else {
                        return fa.gregorian;
                    }
                } else {
                    if (t === 'persian') {
                        return en.persian;
                    } else {
                        return en.gregorian;
                    }
                }
            }

            /**
             * @param input
             * @private
             */

        }, {
            key: '_weekName',
            value: function _weekName(input) {
                return this._locale().weekdays[input - 1];
            }

            /**
             * @param input
             * @private
             */

        }, {
            key: '_weekNameShort',
            value: function _weekNameShort(input) {
                return this._locale().weekdaysShort[input - 1];
            }

            /**
             * @param input
             * @private
             */

        }, {
            key: '_weekNameMin',
            value: function _weekNameMin(input) {
                return this._locale().weekdaysMin[input - 1];
            }

            /**
             * @param input
             * @return {*}
             * @private
             */

        }, {
            key: '_dayName',
            value: function _dayName(input) {
                return this._locale().persianDaysName[input - 1];
            }

            /**
             * @param input
             * @private
             */

        }, {
            key: '_monthName',
            value: function _monthName(input) {
                return this._locale().months[input - 1];
            }

            /**
             * @param input
             * @private
             */

        }, {
            key: '_monthNameShort',
            value: function _monthNameShort(input) {
                return this._locale().monthsShort[input - 1];
            }

            /**
             * @param obj
             * @returns {boolean}
             */

        }, {
            key: 'isPersianDate',


            /**
             * @param obj
             * @return {boolean}
             */
            value: function isPersianDate(obj) {
                return obj instanceof PersianDateClass;
            }

            /**
             * @returns {PersianDate}
             */

        }, {
            key: 'clone',
            value: function clone() {
                return this._getSyncedClass(this.State.gDate);
            }

            /**
             * @since 1.0.0
             * @param dateArray
             * @return {*}
             */

        }, {
            key: 'algorithmsCalc',
            value: function algorithmsCalc(dateArray) {
                if (this.isPersianDate(dateArray)) {
                    dateArray = [dateArray.year(), dateArray.month(), dateArray.date(), dateArray.hour(), dateArray.minute(), dateArray.second(), dateArray.millisecond()];
                }
                if (this.calendarType === 'persian' && this.leapYearMode == 'algorithmic') {
                    return this.algorithms.calcPersian(dateArray);
                } else if (this.calendarType === 'persian' && this.leapYearMode == 'astronomical') {
                    return this.algorithms.calcPersiana(dateArray);
                } else if (this.calendarType === 'gregorian') {
                    dateArray[1] = dateArray[1] - 1;
                    return this.algorithms.calcGregorian(dateArray);
                }
            }

            /**
             * @since 1.0.0
             * @return {*}
             */

        }, {
            key: 'calendar',
            value: function calendar() {
                var key = void 0;
                if (this.calendarType == 'persian') {
                    if (this.leapYearMode == 'astronomical') {
                        key = 'persianAstro';
                    } else if (this.leapYearMode == 'algorithmic') {
                        key = 'persianAlgo';
                    }
                } else {
                    key = 'gregorian';
                }
                return this.State[key];
            }

            /**
             * @description return Duration object
             * @param input
             * @param key
             * @returns {Duration}
             */

        }, {
            key: 'duration',


            /**
             * @description return Duration object
             * @param input
             * @param key
             * @returns {Duration}
             */
            value: function duration(input, key) {
                return new Duration(input, key);
            }

            /**
             * @description check if passed object is duration
             * @param obj
             * @returns {boolean}
             */

        }, {
            key: 'isDuration',


            /**
             * @description check if passed object is duration
             * @param obj
             * @returns {boolean}
             */
            value: function isDuration(obj) {
                return obj instanceof Duration;
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'years',
            value: function years(input) {
                return this.year(input);
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'year',
            value: function year(input) {
                if (input || input === 0) {
                    this.algorithmsCalc([input, this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()]);
                    return this;
                } else {
                    return this.calendar().year;
                }
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'month',
            value: function month(input) {
                if (input || input === 0) {
                    this.algorithmsCalc([this.year(), input, this.date()]);
                    return this;
                } else {
                    return this.calendar().month + 1;
                }
            }

            /**
             * Day of week
             * @returns {Function|Date.toJSON.day|date_json.day|PersianDate.day|day|output.day|*}
             */

        }, {
            key: 'days',
            value: function days() {
                return this.day();
            }

            /**
             * @returns {Function|Date.toJSON.day|date_json.day|PersianDate.day|day|output.day|*}
             */

        }, {
            key: 'day',
            value: function day() {
                return this.calendar().weekday;
            }

            /**
             * Day of Months
             * @param input
             * @returns {*}
             */

        }, {
            key: 'dates',
            value: function dates(input) {
                return this.date(input);
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'date',
            value: function date(input) {
                if (input || input === 0) {
                    this.algorithmsCalc([this.year(), this.month(), input]);
                    return this;
                } else {
                    return this.calendar().day;
                }
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'hour',
            value: function hour(input) {
                return this.hours(input);
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'hours',
            value: function hours(input) {
                if (input || input === 0) {
                    if (input === 0) {
                        input = 24;
                    }
                    this.algorithmsCalc([this.year(), this.month(), this.date(), input]);
                    return this;
                } else {
                    return this.State.gDate.getHours();
                }
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'minute',
            value: function minute(input) {
                return this.minutes(input);
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'minutes',
            value: function minutes(input) {
                if (input || input === 0) {
                    this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), input]);
                    return this;
                } else {
                    return this.State.gDate.getMinutes();
                }
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'second',
            value: function second(input) {
                return this.seconds(input);
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'seconds',
            value: function seconds(input) {
                if (input || input === 0) {
                    this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), this.minute(), input]);
                    return this;
                } else {
                    return this.State.gDate.getSeconds();
                }
            }

            /**
             * @param input
             * @returns {*}
             * Getter Setter
             */

        }, {
            key: 'millisecond',
            value: function millisecond(input) {
                return this.milliseconds(input);
            }

            /**
             * @param input
             * @returns {*}
             */

        }, {
            key: 'milliseconds',
            value: function milliseconds(input) {
                if (input || input === 0) {
                    this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), input]);
                    return this;
                } else {
                    return this.State.gregorian.millisecond;
                }
            }

            /**
             * Return Milliseconds since the Unix Epoch (1318874398806)
             * @returns {*}
             * @private
             */
            //    _valueOf () {
            //        return this.State.gDate.valueOf();
            //    }


        }, {
            key: 'unix',


            /**
             * Return Unix Timestamp (1318874398)
             * @param timestamp
             * @returns {*}
             */
            value: function unix(timestamp) {
                var output = void 0;
                if (timestamp) {
                    return this._getSyncedClass(timestamp * 1000);
                } else {
                    var str = this.State.gDate.valueOf().toString();
                    output = str.substring(0, str.length - 3);
                }
                return parseInt(output);
            }

            /**
             * @returns {*}
             */

        }, {
            key: 'valueOf',
            value: function valueOf() {
                return this.State.gDate.valueOf();
            }

            /**
             * @param year
             * @param month
             * @returns {*}
             * @since 1.0.0
             */

        }, {
            key: 'getFirstWeekDayOfMonth',


            /**
             * @param year
             * @param month
             * @returns {*}
             * @since 1.0.0
             */
            value: function getFirstWeekDayOfMonth(year, month) {
                return this._getSyncedClass([year, month, 1]).day();
            }

            /**
             * @param input
             * @param val
             * @param asFloat
             * @returns {*}
             */

        }, {
            key: 'diff',
            value: function diff(input, val, asFloat) {
                var self = this,
                    inputMoment = input,
                    zoneDiff = 0,
                    diff = self.State.gDate - inputMoment.toDate() - zoneDiff,
                    year = self.year() - inputMoment.year(),
                    month = self.month() - inputMoment.month(),
                    date = (self.date() - inputMoment.date()) * -1,
                    output = void 0;

                if (val === 'months' || val === 'month') {
                    output = year * 12 + month + date / 30;
                } else if (val === 'years' || val === 'year') {
                    output = year + (month + date / 30) / 12;
                } else {
                    output = val === 'seconds' || val === 'second' ? diff / 1e3 : // 1000
                    val === 'minutes' || val === 'minute' ? diff / 6e4 : // 1000 * 60
                    val === 'hours' || val === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    val === 'days' || val === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    val === 'weeks' || val === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
                }
                return asFloat ? output : Math.round(output);
            }

            /**
             * @param key
             * @returns {*}
             */

        }, {
            key: 'startOf',
            value: function startOf(key) {
                var syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType);
                var newArray = new PersianDateClass(this.valueOf() - (this.calendar().weekday - 1) * 86400000).toArray();
                // Simplify this\
                /* jshint ignore:start */
                switch (key) {
                    case 'years':
                    case 'year':
                        return new syncedCelander([this.year(), 1, 1]);
                    case 'months':
                    case 'month':
                        return new syncedCelander([this.year(), this.month(), 1]);
                    case 'days':
                    case 'day':
                        return new syncedCelander([this.year(), this.month(), this.date(), 0, 0, 0]);
                    case 'hours':
                    case 'hour':
                        return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), 0, 0]);
                    case 'minutes':
                    case 'minute':
                        return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 0]);
                    case 'seconds':
                    case 'second':
                        return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
                    case 'weeks':
                    case 'week':
                        return new syncedCelander(newArray);
                    default:
                        return this.clone();
                }
                /* jshint ignore:end */
            }

            /**
             * @param key
             * @returns {*}
             */
            /* eslint-disable no-case-declarations */

        }, {
            key: 'endOf',
            value: function endOf(key) {
                var syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType);
                // Simplify this
                switch (key) {
                    case 'years':
                    case 'year':
                        var days = this.isLeapYear() ? 30 : 29;
                        return new syncedCelander([this.year(), 12, days, 23, 59, 59]);
                    case 'months':
                    case 'month':
                        var monthDays = this.daysInMonth(this.year(), this.month());
                        return new syncedCelander([this.year(), this.month(), monthDays, 23, 59, 59]);
                    case 'days':
                    case 'day':
                        return new syncedCelander([this.year(), this.month(), this.date(), 23, 59, 59]);
                    case 'hours':
                    case 'hour':
                        return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), 59, 59]);
                    case 'minutes':
                    case 'minute':
                        return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 59]);
                    case 'seconds':
                    case 'second':
                        return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
                    case 'weeks':
                    case 'week':
                        var weekDayNumber = this.calendar().weekday;
                        return new syncedCelander([this.year(), this.month(), this.date() + (7 - weekDayNumber)]);
                    default:
                        return this.clone();
                }
                /* eslint-enable no-case-declarations */
            }

            /**
             * @returns {*}
             */

        }, {
            key: 'sod',
            value: function sod() {
                return this.startOf('day');
            }

            /**
             * @returns {*}
             */

        }, {
            key: 'eod',
            value: function eod() {
                return this.endOf('day');
            }

            /** Get the timezone offset in minutes.
             * @return {*}
             */

        }, {
            key: 'zone',
            value: function zone(input) {
                if (input || input === 0) {
                    this.State.zone = input;
                    return this;
                } else {
                    return this.State.zone;
                }
            }

            /**
             * @returns {PersianDate}
             */

        }, {
            key: 'local',
            value: function local() {
                var utcStamp = void 0;
                if (this._utcMode) {
                    var ThatDayOffset = new Date(this.toDate()).getTimezoneOffset();
                    var offsetMils = ThatDayOffset * 60 * 1000;
                    if (ThatDayOffset < 0) {
                        utcStamp = this.valueOf() - offsetMils;
                    } else {
                        /* istanbul ignore next */
                        utcStamp = this.valueOf() + offsetMils;
                    }
                    this.toCalendar(PersianDateClass.calendarType);
                    var utcDate = new Date(utcStamp);
                    this._gDateToCalculators(utcDate);
                    this._utcMode = false;
                    this.zone(ThatDayOffset);
                    return this;
                } else {
                    return this;
                }
            }

            /**
             * @param input
             * @return {*}
             */

        }, {
            key: 'utc',


            /**
             * @description Current date/time in UTC mode
             * @param input
             * @returns {*}
             */
            value: function utc(input) {
                var utcStamp = void 0;
                if (input) {
                    return this._getSyncedClass(input).utc();
                }
                if (this._utcMode) {
                    return this;
                } else {
                    var offsetMils = this.zone() * 60 * 1000;
                    if (this.zone() < 0) {
                        utcStamp = this.valueOf() + offsetMils;
                    } else {
                        /* istanbul ignore next */
                        utcStamp = this.valueOf() - offsetMils;
                    }
                    var utcDate = new Date(utcStamp),
                        d = this._getSyncedClass(utcDate);
                    this.algorithmsCalc(d);
                    this._utcMode = true;
                    this.zone(0);
                    return this;
                }
            }

            /**
             * @returns {boolean}
             */

        }, {
            key: 'isUtc',
            value: function isUtc() {
                return this._utcMode;
            }

            /**
             * @returns {boolean}
             * @link https://fa.wikipedia.org/wiki/%D8%B3%D8%A7%D8%B9%D8%AA_%D8%AA%D8%A7%D8%A8%D8%B3%D8%AA%D8%A7%D9%86%DB%8C
             */

        }, {
            key: 'isDST',
            value: function isDST() {
                var month = this.month(),
                    day = this.date();
                if (month == 1 && day > 1 || month == 6 && day < 31 || month < 6 && month >= 2) {
                    return true;
                } else {
                    return false;
                }
            }

            /**
             * @returns {boolean}
             */

        }, {
            key: 'isLeapYear',
            value: function isLeapYear(year) {
                if (year === undefined) {
                    year = this.year();
                }
                if (this.calendarType == 'persian' && this.leapYearMode === 'algorithmic') {
                    return this.algorithms.leap_persian(year);
                }
                if (this.calendarType == 'persian' && this.leapYearMode === 'astronomical') {
                    return this.algorithms.leap_persiana(year);
                } else if (this.calendarType == 'gregorian') {
                    return this.algorithms.leap_gregorian(year);
                }
            }

            /**
             * @param yearInput
             * @param monthInput
             * @returns {number}
             */

        }, {
            key: 'daysInMonth',
            value: function daysInMonth(yearInput, monthInput) {
                var year = yearInput ? yearInput : this.year(),
                    month = monthInput ? monthInput : this.month();
                if (this.calendarType === 'persian') {
                    if (month < 1 || month > 12) return 0;
                    if (month < 7) return 31;
                    if (month < 12) return 30;
                    if (this.isLeapYear(year)) {
                        return 30;
                    }
                    return 29;
                }
                if (this.calendarType === 'gregorian') {
                    return new Date(year, month, 0).getDate();
                }
            }

            /**
             * @description Return Native Javascript Date
             * @returns {*|PersianDate.gDate}
             */

        }, {
            key: 'toDate',
            value: function toDate() {
                return this.State.gDate;
            }

            /**
             * @description Returns Array Of Persian Date
             * @returns {array}
             */

        }, {
            key: 'toArray',
            value: function toArray() {
                return [this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()];
            }

            /**
             * @returns {*}
             */

        }, {
            key: 'formatNumber',
            value: function formatNumber() {
                var output = void 0,
                    self = this;

                // if default conf dosent set follow golbal config
                if (this.formatPersian === '_default') {
                    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
                        /* istanbul ignore next */
                        if (self.formatPersian === false) {
                            output = false;
                        } else {
                            // Default Conf
                            output = true;
                        }
                    }
                    /* istanbul ignore next */
                    else {
                            if (window.formatPersian === false) {
                                output = false;
                            } else {
                                // Default Conf
                                output = true;
                            }
                        }
                } else {
                    if (this.formatPersian === true) {
                        output = true;
                    } else if (this.formatPersian === false) {
                        output = false;
                    }
                }
                return output;
            }

            /**
             * @param inputString
             * @returns {*}
             */

        }, {
            key: 'format',
            value: function format(inputString) {
                if (this.State.isInvalidDate) {
                    return false;
                }
                var self = this,
                    formattingTokens = /([[^[]*])|(\\)?(Mo|MM?M?M?|Do|DD?D?D?|dddddd?|ddddd?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|X|LT|ll?l?l?|LL?L?L?)/g,
                    info = {
                    year: self.year(),
                    month: self.month(),
                    hour: self.hours(),
                    minute: self.minutes(),
                    second: self.seconds(),
                    date: self.date(),
                    timezone: self.zone(),
                    unix: self.unix()
                },
                    formatToPersian = self.formatNumber();

                var checkPersian = function checkPersian(i) {
                    if (formatToPersian) {
                        return toPersianDigit(i);
                    } else {
                        return i;
                    }
                };

                /* jshint ignore:start */
                function replaceFunction(input) {
                    switch (input) {
                        // AM/PM
                        case 'a':
                            {
                                if (formatToPersian) return info.hour >= 12 ? 'ب ظ' : 'ق ظ';else return info.hour >= 12 ? 'PM' : 'AM';
                            }
                        // Hours (Int)
                        case 'H':
                            {
                                return checkPersian(info.hour);
                            }
                        case 'HH':
                            {
                                return checkPersian(leftZeroFill(info.hour, 2));
                            }
                        case 'h':
                            {
                                return checkPersian(info.hour % 12);
                            }
                        case 'hh':
                            {
                                return checkPersian(leftZeroFill(info.hour % 12, 2));
                            }
                        // Minutes
                        case 'm':
                            {
                                return checkPersian(leftZeroFill(info.minute, 2));
                            }
                        // Two Digit Minutes
                        case 'mm':
                            {
                                return checkPersian(leftZeroFill(info.minute, 2));
                            }
                        // Second
                        case 's':
                            {
                                return checkPersian(info.second);
                            }
                        case 'ss':
                            {
                                return checkPersian(leftZeroFill(info.second, 2));
                            }
                        // Day (Int)
                        case 'D':
                            {
                                return checkPersian(leftZeroFill(info.date));
                            }
                        // Return Two Digit
                        case 'DD':
                            {
                                return checkPersian(leftZeroFill(info.date, 2));
                            }
                        // Return day Of Month
                        case 'DDD':
                            {
                                var t = self.startOf('year');
                                return checkPersian(leftZeroFill(self.diff(t, 'days'), 3));
                            }
                        // Return Day of Year
                        case 'DDDD':
                            {
                                var _t = self.startOf('year');
                                return checkPersian(leftZeroFill(self.diff(_t, 'days'), 3));
                            }
                        // Return day Of week
                        case 'd':
                            {
                                return checkPersian(self.calendar().weekday);
                            }
                        // Return week day name abbr
                        case 'ddd':
                            {
                                return self._weekNameShort(self.calendar().weekday);
                            }
                        case 'dddd':
                            {
                                return self._weekName(self.calendar().weekday);
                            }
                        // Return Persian Day Name
                        case 'ddddd':
                            {
                                return self._dayName(self.calendar().day);
                            }
                        // Return Persian Day Name
                        case 'dddddd':
                            {
                                return self._weekNameMin(self.calendar().weekday);
                            }
                        // Return Persian Day Name
                        case 'w':
                            {
                                var _t2 = self.startOf('year'),
                                    day = parseInt(self.diff(_t2, 'days') / 7) + 1;
                                return checkPersian(day);
                            }
                        // Return Persian Day Name
                        case 'ww':
                            {
                                var _t3 = self.startOf('year'),
                                    _day = leftZeroFill(parseInt(self.diff(_t3, 'days') / 7) + 1, 2);
                                return checkPersian(_day);
                            }
                        // Month  (Int)
                        case 'M':
                            {
                                return checkPersian(info.month);
                            }
                        // Two Digit Month (Str)
                        case 'MM':
                            {
                                return checkPersian(leftZeroFill(info.month, 2));
                            }
                        // Abbr String of Month (Str)
                        case 'MMM':
                            {
                                return self._monthNameShort(info.month);
                            }
                        // Full String name of Month (Str)
                        case 'MMMM':
                            {
                                return self._monthName(info.month);
                            }
                        // Year
                        // Two Digit Year (Str)
                        case 'YY':
                            {
                                var yearDigitArray = info.year.toString().split('');
                                return checkPersian(yearDigitArray[2] + yearDigitArray[3]);
                            }
                        // Full Year (Int)
                        case 'YYYY':
                            {
                                return checkPersian(info.year);
                            }
                        /* istanbul ignore next */
                        case 'Z':
                            {
                                var flag = '+',
                                    hours = Math.round(info.timezone / 60),
                                    minutes = info.timezone % 60;

                                if (minutes < 0) {
                                    minutes *= -1;
                                }
                                if (hours < 0) {
                                    flag = '-';
                                    hours *= -1;
                                }

                                var z = flag + leftZeroFill(hours, 2) + ':' + leftZeroFill(minutes, 2);
                                return checkPersian(z);
                            }
                        /* istanbul ignore next */
                        case 'ZZ':
                            {
                                var _flag = '+',
                                    _hours = Math.round(info.timezone / 60),
                                    _minutes = info.timezone % 60;

                                if (_minutes < 0) {
                                    _minutes *= -1;
                                }
                                if (_hours < 0) {
                                    _flag = '-';
                                    _hours *= -1;
                                }
                                var _z = _flag + leftZeroFill(_hours, 2) + '' + leftZeroFill(_minutes, 2);
                                return checkPersian(_z);
                            }
                        /* istanbul ignore next */
                        case 'X':
                            {
                                return self.unix();
                            }
                        // 8:30 PM
                        case 'LT':
                            {
                                return self.format('H:m a');
                            }
                        // 09/04/1986
                        case 'L':
                            {
                                return self.format('YYYY/MM/DD');
                            }
                        // 9/4/1986
                        case 'l':
                            {
                                return self.format('YYYY/M/D');
                            }
                        // September 4th 1986
                        case 'LL':
                            {
                                return self.format('MMMM DD YYYY');
                            }
                        // Sep 4 1986
                        case 'll':
                            {
                                return self.format('MMM DD YYYY');
                            }
                        //September 4th 1986 8:30 PM
                        case 'LLL':
                            {
                                return self.format('MMMM YYYY DD   H:m  a');
                            }
                        // Sep 4 1986 8:30 PM
                        case 'lll':
                            {
                                return self.format('MMM YYYY DD   H:m  a');
                            }
                        //Thursday, September 4th 1986 8:30 PM
                        case 'LLLL':
                            {
                                return self.format('dddd D MMMM YYYY  H:m  a');
                            }
                        // Thu, Sep 4 1986 8:30 PM
                        case 'llll':
                            {
                                return self.format('ddd D MMM YYYY  H:m  a');
                            }
                    }
                }

                /* jshint ignore:end */

                if (inputString) {
                    return inputString.replace(formattingTokens, replaceFunction);
                } else {
                    var _inputString = 'YYYY-MM-DD HH:mm:ss a';
                    return _inputString.replace(formattingTokens, replaceFunction);
                }
            }

            /**
             * @param key
             * @param value
             * @returns {PersianDate}
             */

        }, {
            key: 'add',
            value: function add(key, value) {
                if (value === 0) {
                    return this;
                }
                var unit = normalizeDuration(key, value).unit,
                    arr = this.toArray();
                value = normalizeDuration(key, value).value;
                if (unit === 'year') {
                    var normalizedDate = arr[2],
                        monthDays = this.daysInMonth(arr[0] + value, arr[1]);
                    if (arr[2] > monthDays) {
                        normalizedDate = monthDays;
                    }
                    var tempDate = new PersianDateClass([arr[0] + value, arr[1], normalizedDate, arr[3], arr[4], arr[5], arr[6], arr[7]]);
                    return tempDate;
                }
                if (unit === 'month') {
                    var tempYear = Math.floor(value / 12);
                    var remainingMonth = value - tempYear * 12,
                        calcedMonth = null;
                    if (arr[1] + remainingMonth > 12) {
                        tempYear += 1;
                        calcedMonth = arr[1] + remainingMonth - 12;
                    } else {
                        calcedMonth = arr[1] + remainingMonth;
                    }
                    var normalizaedDate = arr[2],
                        tempDateArray = new PersianDateClass([arr[0] + tempYear, calcedMonth, 1, arr[3], arr[4], arr[5], arr[6], arr[7]]).toArray(),
                        _monthDays = this.daysInMonth(arr[0] + tempYear, calcedMonth);
                    if (arr[2] > _monthDays) {
                        normalizaedDate = _monthDays;
                    }
                    return new PersianDateClass([tempDateArray[0], tempDateArray[1], normalizaedDate, tempDateArray[3], tempDateArray[4], tempDateArray[5], tempDateArray[6], tempDateArray[7]]);
                }
                if (unit === 'day') {
                    var calcedDay = new PersianDateClass(this.valueOf()).hour(12),
                        newMillisecond = calcedDay.valueOf() + value * 86400000,
                        newDate = new PersianDateClass(newMillisecond);
                    return newDate.hour(arr[3]);
                }
                if (unit === 'week') {
                    var _calcedDay = new PersianDateClass(this.valueOf()).hour(12),
                        _newMillisecond = _calcedDay.valueOf() + 7 * value * 86400000,
                        _newDate = new PersianDateClass(_newMillisecond);
                    return _newDate.hour(arr[3]);
                }
                if (unit === 'hour') {
                    var _newMillisecond2 = this.valueOf() + value * 3600000;
                    return this.unix(_newMillisecond2 / 1000);
                }
                if (unit === 'minute') {
                    var _newMillisecond3 = this.valueOf() + value * 60000;
                    return this.unix(_newMillisecond3 / 1000);
                }
                if (unit === 'second') {
                    var _newMillisecond4 = this.valueOf() + value * 1000;
                    return this.unix(_newMillisecond4 / 1000);
                }
                if (unit === 'millisecond') {
                    var _newMillisecond5 = this.valueOf() + value;
                    return this.unix(_newMillisecond5 / 1000);
                }
                return this._getSyncedClass(this.valueOf());
            }

            /**
             * @param key
             * @param value
             * @returns {PersianDate}
             */

        }, {
            key: 'subtract',
            value: function subtract(key, value) {
                return this.add(key, value * -1);
            }

            /**
             * check if a date is same as b
             * @param dateA
             * @param dateB
             * @since 1.0.0
             * @return {boolean}
             * @static
             */

        }, {
            key: 'isSameDay',


            /**
             * @param dateB
             * @since 1.0.0
             * @return {PersianDateClass|*|boolean}
             */
            value: function isSameDay(dateB) {
                return this && dateB && this.date() == dateB.date() && this.year() == dateB.year() && this.month() == dateB.month();
            }

            /**
             * @desc check if a month is same as b
             * @param {Date} dateA
             * @param {Date} dateB
             * @return {boolean}
             * @since 1.0.0
             * @static
             */

        }, {
            key: 'isSameMonth',


            /**
             * @desc check two for month similarity
             * @param dateA
             * @param dateB
             * @since 1.0.0
             * @return {*|boolean}
             */
            value: function isSameMonth(dateB) {
                return this && dateB && this.year() == this.year() && this.month() == dateB.month();
            }
        }], [{
            key: 'rangeName',
            value: function rangeName() {
                var p = PersianDateClass,
                    t = p.calendarType;
                if (p.localType === 'fa') {
                    if (t === 'persian') {
                        return fa.persian;
                    } else {
                        return fa.gregorian;
                    }
                } else {
                    if (t === 'persian') {
                        return en.persian;
                    } else {
                        return en.gregorian;
                    }
                }
            }
        }, {
            key: 'toLeapYearMode',
            value: function toLeapYearMode(input) {
                var d = PersianDateClass;
                d.leapYearMode = input;
                return d;
            }
        }, {
            key: 'toCalendar',
            value: function toCalendar(input) {
                var d = PersianDateClass;
                d.calendarType = input;
                return d;
            }

            /**
             * @since 1.0.0
             * @static
             * @param input
             * @return {PersianDateClass}
             */

        }, {
            key: 'toLocale',
            value: function toLocale(input) {
                var d = PersianDateClass;
                d.localType = input;
                if (d.localType !== 'fa') {
                    d.formatPersian = false;
                } else {
                    d.formatPersian = '_default';
                }
                return d;
            }
        }, {
            key: 'isPersianDate',
            value: function isPersianDate(obj) {
                return obj instanceof PersianDateClass;
            }
        }, {
            key: 'duration',
            value: function duration(input, key) {
                return new Duration(input, key);
            }
        }, {
            key: 'isDuration',
            value: function isDuration(obj) {
                return obj instanceof Duration;
            }
        }, {
            key: 'unix',
            value: function unix(timestamp) {
                if (timestamp) {
                    return new PersianDateClass(timestamp * 1000);
                } else {
                    return new PersianDateClass().unix();
                }
            }
        }, {
            key: 'getFirstWeekDayOfMonth',
            value: function getFirstWeekDayOfMonth(year, month) {
                return new PersianDateClass([year, month, 1]).day();
            }
        }, {
            key: 'utc',
            value: function utc(input) {
                if (input) {
                    return new PersianDateClass(input).utc();
                } else {
                    return new PersianDateClass().utc();
                }
            }
        }, {
            key: 'isSameDay',
            value: function isSameDay(dateA, dateB) {
                return dateA && dateB && dateA.date() == dateB.date() && dateA.year() == dateB.year() && dateA.month() == dateB.month();
            }
        }, {
            key: 'isSameMonth',
            value: function isSameMonth(dateA, dateB) {
                return dateA && dateB && dateA.year() == dateB.year() && dateA.month() == dateB.month();
            }
        }]);

        return PersianDateClass;
    }();

    /**
     * @type {PersianDateClass}
     */


    module.exports = PersianDateClass;

    /***/ }),
    /* 2 */
    /***/ (function(module, exports, __webpack_require__) {


    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    // Start algorithm class
    var ASTRO = __webpack_require__(3);
    var State = __webpack_require__(9);

    var Algorithms = function () {
        function Algorithms(parent) {
            _classCallCheck(this, Algorithms);

            this.parent = parent;
            this.ASTRO = new ASTRO();
            this.State = new State();
            /*  You may notice that a variety of array variables logically local
             to functions are declared globally here.  In JavaScript, construction
             of an array variable from source code occurs as the code is
             interpreted.  Making these variables pseudo-globals permits us
             to avoid overhead constructing and disposing of them in each
             call on the function in which whey are used.  */
            // TODO this block didnt used in main agorithm
            this.J0000 = 1721424.5; // Julian date of Gregorian epoch: 0000-01-01
            this.J1970 = 2440587.5; // Julian date at Unix epoch: 1970-01-01
            this.JMJD = 2400000.5; // Epoch of Modified Julian Date system
            this.NormLeap = [false /*"Normal year"*/, true /*"Leap year"*/];
            // TODO END
            this.GREGORIAN_EPOCH = 1721425.5;
            this.PERSIAN_EPOCH = 1948320.5;
        }

        /**
         * @desc LEAP_GREGORIAN  --  Is a given year in the Gregorian calendar a leap year ?
         * @param year
         * @return {boolean}
         */


        _createClass(Algorithms, [{
            key: 'leap_gregorian',
            value: function leap_gregorian(year) {
                return year % 4 === 0 && !(year % 100 === 0 && year % 400 !== 0);
            }

            /**
             * @desc Determine Julian day number from Gregorian calendar date
             * @param {*} year
             * @param {*} month
             * @param {*} day
             */

        }, {
            key: 'gregorian_to_jd',
            value: function gregorian_to_jd(year, month, day) {
                return this.GREGORIAN_EPOCH - 1 + 365 * (year - 1) + Math.floor((year - 1) / 4) + -Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400) + Math.floor((367 * month - 362) / 12 + (month <= 2 ? 0 : this.leap_gregorian(year) ? -1 : -2) + day);
            }

            /**
             * @desc Calculate Gregorian calendar date from Julian day
             * @param {*} jd
             */

        }, {
            key: 'jd_to_gregorian',
            value: function jd_to_gregorian(jd) {
                var wjd = void 0,
                    depoch = void 0,
                    quadricent = void 0,
                    dqc = void 0,
                    cent = void 0,
                    dcent = void 0,
                    quad = void 0,
                    dquad = void 0,
                    yindex = void 0,
                    year = void 0,
                    yearday = void 0,
                    leapadj = void 0,
                    month = void 0,
                    day = void 0;

                wjd = Math.floor(jd - 0.5) + 0.5;
                depoch = wjd - this.GREGORIAN_EPOCH;
                quadricent = Math.floor(depoch / 146097);
                dqc = this.ASTRO.mod(depoch, 146097);
                cent = Math.floor(dqc / 36524);
                dcent = this.ASTRO.mod(dqc, 36524);
                quad = Math.floor(dcent / 1461);
                dquad = this.ASTRO.mod(dcent, 1461);
                yindex = Math.floor(dquad / 365);
                year = quadricent * 400 + cent * 100 + quad * 4 + yindex;
                if (!(cent === 4 || yindex === 4)) {
                    year++;
                }
                yearday = wjd - this.gregorian_to_jd(year, 1, 1);
                leapadj = wjd < this.gregorian_to_jd(year, 3, 1) ? 0 : this.leap_gregorian(year) ? 1 : 2;
                month = Math.floor(((yearday + leapadj) * 12 + 373) / 367);
                day = wjd - this.gregorian_to_jd(year, month, 1) + 1;

                return [year, month, day];
            }

            /**
             * @param {*} year
             */
            //    leap_julian (year) {
            //        return this.ASTRO.mod(year, 4) === ((year > 0) ? 0 : 3);
            //    }


            /**
             * @desc Calculate Julian calendar date from Julian day
             * @param {*} td
             */
            //    jd_to_julian (td) {
            //        let z, a, b, c, d, e, year, month, day;
            //
            //        td += 0.5;
            //        z = Math.floor(td);
            //
            //        a = z;
            //        b = a + 1524;
            //        c = Math.floor((b - 122.1) / 365.25);
            //        d = Math.floor(365.25 * c);
            //        e = Math.floor((b - d) / 30.6001);
            //
            //        month = Math.floor((e < 14) ? (e - 1) : (e - 13));
            //        year = Math.floor((month > 2) ? (c - 4716) : (c - 4715));
            //        day = b - d - Math.floor(30.6001 * e);
            //
            //        /*  If year is less than 1, subtract one to convert from
            //         a zero based date system to the common era system in
            //         which the year -1 (1 B.C.E) is followed by year 1 (1 C.E.).  */
            //
            //        if (year < 1) {
            //            year--;
            //        }
            //
            //        return [year, month, day];
            //    }


            /**
             * @desc TEHRAN_EQUINOX  --  Determine Julian day and fraction of the
             March equinox at the Tehran meridian in
             a given Gregorian year.
             * @param {*} year
             */

        }, {
            key: 'tehran_equinox',
            value: function tehran_equinox(year) {
                var equJED = void 0,
                    equJD = void 0,
                    equAPP = void 0,
                    equTehran = void 0,
                    dtTehran = void 0;

                //  March equinox in dynamical time
                equJED = this.ASTRO.equinox(year, 0);

                //  Correct for delta T to obtain Universal time
                equJD = equJED - this.ASTRO.deltat(year) / (24 * 60 * 60);

                //  Apply the equation of time to yield the apparent time at Greenwich
                equAPP = equJD + this.ASTRO.equationOfTime(equJED);

                /*  Finally, we must correct for the constant difference between
                 the Greenwich meridian andthe time zone standard for
                 Iran Standard time, 52°30' to the East.  */

                dtTehran = (52 + 30 / 60.0 + 0 / (60.0 * 60.0)) / 360;
                equTehran = equAPP + dtTehran;

                return equTehran;
            }

            /**
             * @desc TEHRAN_EQUINOX_JD  --  Calculate Julian day during which the
             March equinox, reckoned from the Tehran
             meridian, occurred for a given Gregorian
             year.
             * @param {*} year
             */

        }, {
            key: 'tehran_equinox_jd',
            value: function tehran_equinox_jd(year) {
                var ep = void 0,
                    epg = void 0;

                ep = this.tehran_equinox(year);
                epg = Math.floor(ep);

                return epg;
            }

            /**
             * @desc  PERSIANA_YEAR  --  Determine the year in the Persian
             astronomical calendar in which a
             given Julian day falls.  Returns an
             array of two elements:
              [0]  Persian year
             [1]  Julian day number containing
             equinox for this year.
             * @param {*} jd
             */

        }, {
            key: 'persiana_year',
            value: function persiana_year(jd) {
                var guess = this.jd_to_gregorian(jd)[0] - 2,
                    lasteq = void 0,
                    nexteq = void 0,
                    adr = void 0;

                lasteq = this.tehran_equinox_jd(guess);
                while (lasteq > jd) {
                    guess--;
                    lasteq = this.tehran_equinox_jd(guess);
                }
                nexteq = lasteq - 1;
                while (!(lasteq <= jd && jd < nexteq)) {
                    lasteq = nexteq;
                    guess++;
                    nexteq = this.tehran_equinox_jd(guess);
                }
                adr = Math.round((lasteq - this.PERSIAN_EPOCH) / this.ASTRO.TropicalYear) + 1;

                return [adr, lasteq];
            }

            /**
             * @desc Calculate date in the Persian astronomical
             calendar from Julian day.
             * @param {*} jd
             */

        }, {
            key: 'jd_to_persiana',
            value: function jd_to_persiana(jd) {
                var year = void 0,
                    month = void 0,
                    day = void 0,
                    adr = void 0,
                    equinox = void 0,
                    yday = void 0;

                jd = Math.floor(jd) + 0.5;
                adr = this.persiana_year(jd);
                year = adr[0];
                equinox = adr[1];
                day = Math.floor((jd - equinox) / 30) + 1;

                yday = Math.floor(jd) - this.persiana_to_jd(year, 1, 1) + 1;
                month = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
                day = Math.floor(jd) - this.persiana_to_jd(year, month, 1) + 1;

                return [year, month, day];
            }

            /**
             * @desc Obtain Julian day from a given Persian
             astronomical calendar date.
             * @param {*} year
             * @param {*} month
             * @param {*} day
             */

        }, {
            key: 'persiana_to_jd',
            value: function persiana_to_jd(year, month, day) {
                var adr = void 0,
                    equinox = void 0,
                    guess = void 0,
                    jd = void 0;

                guess = this.PERSIAN_EPOCH - 1 + this.ASTRO.TropicalYear * (year - 1 - 1);
                adr = [year - 1, 0];

                while (adr[0] < year) {
                    adr = this.persiana_year(guess);
                    guess = adr[1] + (this.ASTRO.TropicalYear + 2);
                }
                equinox = adr[1];

                jd = equinox + (month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6) + (day - 1);
                return jd;
            }

            /**
             * @desc Is a given year a leap year in the Persian astronomical calendar ?
             * @param {*} year
             */

        }, {
            key: 'leap_persiana',
            value: function leap_persiana(year) {
                return this.persiana_to_jd(year + 1, 1, 1) - this.persiana_to_jd(year, 1, 1) > 365;
            }

            /**
             * @desc Is a given year a leap year in the Persian calendar ?
             * also nasa use this algorithm https://eclipse.gsfc.nasa.gov/SKYCAL/algorithm.js search for 'getLastDayOfPersianMonth' and you can find it
             * @param {*} year
             *
             */

        }, {
            key: 'leap_persian',
            value: function leap_persian(year) {
                return ((year - (year > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682 % 2816 < 682;
            }

            /**
             * @desc Determine Julian day from Persian date
             * @param {*} year
             * @param {*} month
             * @param {*} day
             */

        }, {
            key: 'persian_to_jd',
            value: function persian_to_jd(year, month, day) {
                var epbase = void 0,
                    epyear = void 0;

                epbase = year - (year >= 0 ? 474 : 473);
                epyear = 474 + this.ASTRO.mod(epbase, 2820);

                return day + (month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6) + Math.floor((epyear * 682 - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (this.PERSIAN_EPOCH - 1);
            }

            /**
             * @desc Calculate Persian date from Julian day
             * @param {*} jd
             */

        }, {
            key: 'jd_to_persian',
            value: function jd_to_persian(jd) {
                var year = void 0,
                    month = void 0,
                    day = void 0,
                    depoch = void 0,
                    cycle = void 0,
                    cyear = void 0,
                    ycycle = void 0,
                    aux1 = void 0,
                    aux2 = void 0,
                    yday = void 0;

                jd = Math.floor(jd) + 0.5;

                depoch = jd - this.persian_to_jd(475, 1, 1);
                cycle = Math.floor(depoch / 1029983);
                cyear = this.ASTRO.mod(depoch, 1029983);
                if (cyear === 1029982) {
                    ycycle = 2820;
                } else {
                    aux1 = Math.floor(cyear / 366);
                    aux2 = this.ASTRO.mod(cyear, 366);
                    ycycle = Math.floor((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
                }
                year = ycycle + 2820 * cycle + 474;
                if (year <= 0) {
                    year--;
                }
                yday = jd - this.persian_to_jd(year, 1, 1) + 1;
                month = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
                day = jd - this.persian_to_jd(year, month, 1) + 1;
                return [year, month, day];
            }

            /**
             *
             * @param {*} weekday
             */

        }, {
            key: 'gWeekDayToPersian',
            value: function gWeekDayToPersian(weekday) {
                if (weekday + 2 === 8) {
                    return 1;
                } else if (weekday + 2 === 7) {
                    return 7;
                } else {
                    return weekday + 2;
                }
            }

            /**
             * @desc updateFromGregorian  --  Update all calendars from Gregorian.
             "Why not Julian date?" you ask.  Because
             starting from Gregorian guarantees we're
             already snapped to an integral second, so
             we don't get roundoff errors in other
             calendars.
             */

        }, {
            key: 'updateFromGregorian',
            value: function updateFromGregorian() {
                var j = void 0,
                    year = void 0,
                    mon = void 0,
                    mday = void 0,
                    hour = void 0,
                    min = void 0,
                    sec = void 0,
                    weekday = void 0,
                    utime = void 0,
                    perscal = void 0;

                year = this.State.gregorian.year;
                mon = this.State.gregorian.month;
                mday = this.State.gregorian.day;
                hour = 0; //this.State.gregorian.hour;
                min = 0; //this.State.gregorian.minute;
                sec = 0; //this.State.gregorian.second;

                this.State.gDate = new Date(year, mon, mday, this.State.gregorian.hour, this.State.gregorian.minute, this.State.gregorian.second, this.State.gregorian.millisecond);

                if (this.parent._utcMode === false) {
                    this.State.zone = this.State.gDate.getTimezoneOffset();
                }

                // Added for this algorithms cant parse 2016,13,32 successfully
                this.State.gregorian.year = this.State.gDate.getFullYear();
                this.State.gregorian.month = this.State.gDate.getMonth();
                this.State.gregorian.day = this.State.gDate.getDate();

                //  Update Julian day
                // ---------------------------------------------------------------------------
                j = this.gregorian_to_jd(year, mon + 1, mday) + Math.floor(sec + 60 * (min + 60 * hour) + 0.5) / 86400.0;

                this.State.julianday = j;
                this.State.modifiedjulianday = j - this.JMJD;

                //  Update day of week in Gregorian box
                // ---------------------------------------------------------------------------
                weekday = this.ASTRO.jwday(j);
                // Move to 1 indexed number
                this.State.gregorian.weekday = weekday + 1;

                //  Update leap year status in Gregorian box
                // ---------------------------------------------------------------------------
                this.State.gregorian.leap = this.NormLeap[this.leap_gregorian(year) ? 1 : 0];

                //  Update Julian Calendar
                // ---------------------------------------------------------------------------
                //        julcal = this.jd_to_julian(j);
                //
                //        this.State.juliancalendar.year = julcal[0];
                //        this.State.juliancalendar.month = julcal[1] - 1;
                //        this.State.juliancalendar.day = julcal[2];
                //        this.State.juliancalendar.leap = this.NormLeap[this.leap_julian(julcal[0]) ? 1 : 0];
                weekday = this.ASTRO.jwday(j);
                //        this.State.juliancalendar.weekday = weekday;

                //  Update Persian Calendar
                // ---------------------------------------------------------------------------
                if (this.parent.calendarType == 'persian' && this.parent.leapYearMode == 'algorithmic') {
                    perscal = this.jd_to_persian(j);
                    this.State.persian.year = perscal[0];
                    this.State.persian.month = perscal[1] - 1;
                    this.State.persian.day = perscal[2];
                    this.State.persian.weekday = this.gWeekDayToPersian(weekday);
                    this.State.persian.leap = this.NormLeap[this.leap_persian(perscal[0]) ? 1 : 0];
                }

                //  Update Persian Astronomical Calendar
                // ---------------------------------------------------------------------------
                if (this.parent.calendarType == 'persian' && this.parent.leapYearMode == 'astronomical') {
                    perscal = this.jd_to_persiana(j);
                    this.State.persianAstro.year = perscal[0];
                    this.State.persianAstro.month = perscal[1] - 1;
                    this.State.persianAstro.day = perscal[2];
                    this.State.persianAstro.weekday = this.gWeekDayToPersian(weekday);
                    this.State.persianAstro.leap = this.NormLeap[this.leap_persiana(perscal[0]) ? 1 : 0];
                }
                //  Update Gregorian serial number
                // ---------------------------------------------------------------------------
                if (this.State.gregserial.day !== null) {
                    this.State.gregserial.day = j - this.J0000;
                }

                //  Update Unix time()
                // ---------------------------------------------------------------------------
                utime = (j - this.J1970) * (60 * 60 * 24 * 1000);

                this.State.unixtime = Math.round(utime / 1000);
            }

            /**
             * @desc Perform calculation starting with a Gregorian date
             * @param {*} dateArray
             */

        }, {
            key: 'calcGregorian',
            value: function calcGregorian(dateArray) {
                if (dateArray[0] || dateArray[0] === 0) {
                    this.State.gregorian.year = dateArray[0];
                }
                if (dateArray[1] || dateArray[1] === 0) {
                    this.State.gregorian.month = dateArray[1];
                }
                if (dateArray[2] || dateArray[2] === 0) {
                    this.State.gregorian.day = dateArray[2];
                }
                if (dateArray[3] || dateArray[3] === 0) {
                    this.State.gregorian.hour = dateArray[3];
                }
                if (dateArray[4] || dateArray[4] === 0) {
                    this.State.gregorian.minute = dateArray[4];
                }
                if (dateArray[5] || dateArray[5] === 0) {
                    this.State.gregorian.second = dateArray[5];
                }
                if (dateArray[6] || dateArray[6] === 0) {
                    this.State.gregorian.millisecond = dateArray[6];
                }
                this.updateFromGregorian();
            }

            /**
             * @desc Perform calculation starting with a Julian date
             */

        }, {
            key: 'calcJulian',
            value: function calcJulian() {
                var j = void 0,
                    date = void 0;
                j = this.State.julianday;
                date = this.jd_to_gregorian(j);
                this.State.gregorian.year = date[0];
                this.State.gregorian.month = date[1] - 1;
                this.State.gregorian.day = date[2];
                //        this.State.gregorian.hour = this.pad(time[0], 2, " ");
                //        this.State.gregorian.minute = this.pad(time[1], 2, "0");
                //        this.State.gregorian.second = this.pad(time[2], 2, "0");
                this.updateFromGregorian();
            }

            /**
             * @desc Set Julian date and update all calendars
             * @param {*} j
             */

        }, {
            key: 'setJulian',
            value: function setJulian(j) {
                this.State.julianday = j;
                this.calcJulian();
            }

            /**
             * @desc  Update from Persian calendar
             * @param {*} dateArray
             */

        }, {
            key: 'calcPersian',
            value: function calcPersian(dateArray) {
                if (dateArray[0] || dateArray[0] === 0) {
                    this.State.persian.year = dateArray[0];
                }
                if (dateArray[1] || dateArray[1] === 0) {
                    this.State.persian.month = dateArray[1];
                }
                if (dateArray[2] || dateArray[2] === 0) {
                    this.State.persian.day = dateArray[2];
                }
                if (dateArray[3] || dateArray[3] === 0) {
                    this.State.gregorian.hour = dateArray[3];
                }
                if (dateArray[4] || dateArray[4] === 0) {
                    this.State.gregorian.minute = dateArray[4];
                }
                if (dateArray[5] || dateArray[5] === 0) {
                    this.State.gregorian.second = dateArray[5];
                }
                if (dateArray[6] || dateArray[6] === 0) {
                    this.State.gregorian.millisecond = dateArray[6];
                }

                this.setJulian(this.persian_to_jd(this.State.persian.year, this.State.persian.month, this.State.persian.day));
            }

            /**
             * @desc Update from Persian astronomical calendar
             * @param {*} dateArray
             */

        }, {
            key: 'calcPersiana',
            value: function calcPersiana(dateArray) {
                if (dateArray[0] || dateArray[0] === 0) {
                    this.State.persianAstro.year = dateArray[0];
                }
                if (dateArray[1] || dateArray[1] === 0) {
                    this.State.persianAstro.month = dateArray[1];
                }
                if (dateArray[2] || dateArray[2] === 0) {
                    this.State.persianAstro.day = dateArray[2];
                }

                if (dateArray[3] || dateArray[3] === 0) {
                    this.State.gregorian.hour = dateArray[3];
                }
                if (dateArray[4] || dateArray[4] === 0) {
                    this.State.gregorian.minute = dateArray[4];
                }
                if (dateArray[5] || dateArray[5] === 0) {
                    this.State.gregorian.second = dateArray[5];
                }
                if (dateArray[6] || dateArray[6] === 0) {
                    this.State.gregorian.millisecond = dateArray[6];
                }
                this.setJulian(this.persiana_to_jd(this.State.persianAstro.year, this.State.persianAstro.month, this.State.persianAstro.day + 0.5));
            }
        }]);

        return Algorithms;
    }();

    module.exports = Algorithms;

    /***/ }),
    /* 3 */
    /***/ (function(module, exports, __webpack_require__) {


    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    /*
     JavaScript functions for positional astronomy
     by John Walker  --  September, MIM
     http://www.fourmilab.ch/
     This program is in the public domain.
     */

    var ASTRO = function () {
        function ASTRO() {
            _classCallCheck(this, ASTRO);

            //  Frequently-used constants
            this.J2000 = 2451545.0; // Julian day of J2000 epoch
            this.JulianCentury = 36525.0; // Days in Julian century
            this.JulianMillennium = this.JulianCentury * 10; // Days in Julian millennium
            //        this.AstronomicalUnit = 149597870.0;           // Astronomical unit in kilometres
            this.TropicalYear = 365.24219878; // Mean solar tropical year

            /*  OBLIQEQ  --  Calculate the obliquity of the ecliptic for a given
             Julian date.  This uses Laskar's tenth-degree
             polynomial fit (J. Laskar, Astronomy and
             Astrophysics, Vol. 157, page 68 [1986]) which is
             accurate to within 0.01 arc second between AD 1000
             and AD 3000, and within a few seconds of arc for
             +/-10000 years around AD 2000.  If we're outside the
             range in which this fit is valid (deep time) we
             simply return the J2000 value of the obliquity, which
             happens to be almost precisely the mean.  */
            this.oterms = [-4680.93, -1.55, 1999.25, -51.38, -249.67, -39.05, 7.12, 27.87, 5.79, 2.45];
            /* Periodic terms for nutation in longiude (delta \Psi) and
             obliquity (delta \Epsilon) as given in table 21.A of
             Meeus, "Astronomical Algorithms", first edition. */
            this.nutArgMult = [0, 0, 0, 0, 1, -2, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, -2, 1, 0, 2, 2, 0, 0, 0, 2, 1, 0, 0, 1, 2, 2, -2, -1, 0, 2, 2, -2, 0, 1, 0, 0, -2, 0, 0, 2, 1, 0, 0, -1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1, 2, 0, -1, 2, 2, 0, 0, -1, 0, 1, 0, 0, 1, 2, 1, -2, 0, 2, 0, 0, 0, 0, -2, 2, 1, 2, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 0, 2, 0, 0, -2, 0, 1, 2, 2, 0, 0, 0, 2, 0, -2, 0, 0, 2, 0, 0, 0, -1, 2, 1, 0, 2, 0, 0, 0, 2, 0, -1, 0, 1, -2, 2, 0, 2, 2, 0, 1, 0, 0, 1, -2, 0, 1, 0, 1, 0, -1, 0, 0, 1, 0, 0, 2, -2, 0, 2, 0, -1, 2, 1, 2, 0, 1, 2, 2, 0, 1, 0, 2, 2, -2, 1, 1, 0, 0, 0, -1, 0, 2, 2, 2, 0, 0, 2, 1, 2, 0, 1, 0, 0, -2, 0, 2, 2, 2, -2, 0, 1, 2, 1, 2, 0, -2, 0, 1, 2, 0, 0, 0, 1, 0, -1, 1, 0, 0, -2, -1, 0, 2, 1, -2, 0, 0, 0, 1, 0, 0, 2, 2, 1, -2, 0, 2, 0, 1, -2, 1, 0, 2, 1, 0, 0, 1, -2, 0, -1, 0, 1, 0, 0, -2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 2, 0, -1, -1, 1, 0, 0, 0, 1, 1, 0, 0, 0, -1, 1, 2, 2, 2, -1, -1, 2, 2, 0, 0, -2, 2, 2, 0, 0, 3, 2, 2, 2, -1, 0, 2, 2];

            this.nutArgCoeff = [-171996, -1742, 92095, 89, /*  0,  0,  0,  0,  1 */
            -13187, -16, 5736, -31, /* -2,  0,  0,  2,  2 */
            -2274, -2, 977, -5, /*  0,  0,  0,  2,  2 */
            2062, 2, -895, 5, /*  0,  0,  0,  0,  2 */
            1426, -34, 54, -1, /*  0,  1,  0,  0,  0 */
            712, 1, -7, 0, /*  0,  0,  1,  0,  0 */
            -517, 12, 224, -6, /* -2,  1,  0,  2,  2 */
            -386, -4, 200, 0, /*  0,  0,  0,  2,  1 */
            -301, 0, 129, -1, /*  0,  0,  1,  2,  2 */
            217, -5, -95, 3, /* -2, -1,  0,  2,  2 */
            -158, 0, 0, 0, /* -2,  0,  1,  0,  0 */
            129, 1, -70, 0, /* -2,  0,  0,  2,  1 */
            123, 0, -53, 0, /*  0,  0, -1,  2,  2 */
            63, 0, 0, 0, /*  2,  0,  0,  0,  0 */
            63, 1, -33, 0, /*  0,  0,  1,  0,  1 */
            -59, 0, 26, 0, /*  2,  0, -1,  2,  2 */
            -58, -1, 32, 0, /*  0,  0, -1,  0,  1 */
            -51, 0, 27, 0, /*  0,  0,  1,  2,  1 */
            48, 0, 0, 0, /* -2,  0,  2,  0,  0 */
            46, 0, -24, 0, /*  0,  0, -2,  2,  1 */
            -38, 0, 16, 0, /*  2,  0,  0,  2,  2 */
            -31, 0, 13, 0, /*  0,  0,  2,  2,  2 */
            29, 0, 0, 0, /*  0,  0,  2,  0,  0 */
            29, 0, -12, 0, /* -2,  0,  1,  2,  2 */
            26, 0, 0, 0, /*  0,  0,  0,  2,  0 */
            -22, 0, 0, 0, /* -2,  0,  0,  2,  0 */
            21, 0, -10, 0, /*  0,  0, -1,  2,  1 */
            17, -1, 0, 0, /*  0,  2,  0,  0,  0 */
            16, 0, -8, 0, /*  2,  0, -1,  0,  1 */
            -16, 1, 7, 0, /* -2,  2,  0,  2,  2 */
            -15, 0, 9, 0, /*  0,  1,  0,  0,  1 */
            -13, 0, 7, 0, /* -2,  0,  1,  0,  1 */
            -12, 0, 6, 0, /*  0, -1,  0,  0,  1 */
            11, 0, 0, 0, /*  0,  0,  2, -2,  0 */
            -10, 0, 5, 0, /*  2,  0, -1,  2,  1 */
            -8, 0, 3, 0, /*  2,  0,  1,  2,  2 */
            7, 0, -3, 0, /*  0,  1,  0,  2,  2 */
            -7, 0, 0, 0, /* -2,  1,  1,  0,  0 */
            -7, 0, 3, 0, /*  0, -1,  0,  2,  2 */
            -7, 0, 3, 0, /*  2,  0,  0,  2,  1 */
            6, 0, 0, 0, /*  2,  0,  1,  0,  0 */
            6, 0, -3, 0, /* -2,  0,  2,  2,  2 */
            6, 0, -3, 0, /* -2,  0,  1,  2,  1 */
            -6, 0, 3, 0, /*  2,  0, -2,  0,  1 */
            -6, 0, 3, 0, /*  2,  0,  0,  0,  1 */
            5, 0, 0, 0, /*  0, -1,  1,  0,  0 */
            -5, 0, 3, 0, /* -2, -1,  0,  2,  1 */
            -5, 0, 3, 0, /* -2,  0,  0,  0,  1 */
            -5, 0, 3, 0, /*  0,  0,  2,  2,  1 */
            4, 0, 0, 0, /* -2,  0,  2,  0,  1 */
            4, 0, 0, 0, /* -2,  1,  0,  2,  1 */
            4, 0, 0, 0, /*  0,  0,  1, -2,  0 */
            -4, 0, 0, 0, /* -1,  0,  1,  0,  0 */
            -4, 0, 0, 0, /* -2,  1,  0,  0,  0 */
            -4, 0, 0, 0, /*  1,  0,  0,  0,  0 */
            3, 0, 0, 0, /*  0,  0,  1,  2,  0 */
            -3, 0, 0, 0, /* -1, -1,  1,  0,  0 */
            -3, 0, 0, 0, /*  0,  1,  1,  0,  0 */
            -3, 0, 0, 0, /*  0, -1,  1,  2,  2 */
            -3, 0, 0, 0, /*  2, -1, -1,  2,  2 */
            -3, 0, 0, 0, /*  0,  0, -2,  2,  2 */
            -3, 0, 0, 0, /*  0,  0,  3,  2,  2 */
            -3, 0, 0, 0 /*  2, -1,  0,  2,  2 */
            ];

            /**
             * @desc Table of observed Delta T values at the beginning of even numbered years from 1620 through 2002.
             * @type Array
             */
            this.deltaTtab = [121, 112, 103, 95, 88, 82, 77, 72, 68, 63, 60, 56, 53, 51, 48, 46, 44, 42, 40, 38, 35, 33, 31, 29, 26, 24, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 15, 15, 14, 13, 13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12, 11.9, 11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3, 5.4, 5.6, 5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6, 7.7, 7.3, 6.2, 5.2, 2.7, 1.4, -1.2, -2.8, -3.8, -4.8, -5.5, -5.3, -5.6, -5.7, -5.9, -6, -6.3, -6.5, -6.2, -4.7, -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16, 18.2, 20.2, 21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7, 24, 24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2, 33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5, 50.5, 52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63, 65, 66.6];

            /*  EQUINOX  --  Determine the Julian Ephemeris Day of an
             equinox or solstice.  The "which" argument
             selects the item to be computed:
              0   March equinox
             1   June solstice
             2   September equinox
             3   December solstice
              */
            /**
             * @desc Periodic terms to obtain true time
             * @type Array
             */
            this.EquinoxpTerms = [485, 324.96, 1934.136, 203, 337.23, 32964.467, 199, 342.08, 20.186, 182, 27.85, 445267.112, 156, 73.14, 45036.886, 136, 171.52, 22518.443, 77, 222.54, 65928.934, 74, 296.72, 3034.906, 70, 243.58, 9037.513, 58, 119.81, 33718.147, 52, 297.17, 150.678, 50, 21.02, 2281.226, 45, 247.54, 29929.562, 44, 325.15, 31555.956, 29, 60.93, 4443.417, 18, 155.12, 67555.328, 17, 288.79, 4562.452, 16, 198.04, 62894.029, 14, 199.76, 31436.921, 12, 95.39, 14577.848, 12, 287.11, 31931.756, 12, 320.81, 34777.259, 9, 227.73, 1222.114, 8, 15.45, 16859.074];

            this.JDE0tab1000 = [new Array(1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071), new Array(1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025), new Array(1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074), new Array(1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006)];

            this.JDE0tab2000 = [new Array(2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057), new Array(2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030), new Array(2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078), new Array(2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032)];
        }

        /**
         *
         * @param Degrees to radians.
         * @return {number}
         */


        _createClass(ASTRO, [{
            key: "dtr",
            value: function dtr(d) {
                return d * Math.PI / 180.0;
            }

            /**
             * @desc Radians to degrees.
             * @param r
             * @return {number}
             */

        }, {
            key: "rtd",
            value: function rtd(r) {
                return r * 180.0 / Math.PI;
            }

            /**
             * @desc Range reduce angle in degrees.
             * @param a
             * @return {number}
             */

        }, {
            key: "fixangle",
            value: function fixangle(a) {
                return a - 360.0 * Math.floor(a / 360.0);
            }

            /**
             * @desc Range reduce angle in radians.
             * @param a
             * @return {number}
             */

        }, {
            key: "fixangr",
            value: function fixangr(a) {
                return a - 2 * Math.PI * Math.floor(a / (2 * Math.PI));
            }

            /**
             * @desc  Sine of an angle in degrees
             * @param d
             * @return {number}
             */

        }, {
            key: "dsin",
            value: function dsin(d) {
                return Math.sin(this.dtr(d));
            }

            /**
             * @desc Cosine of an angle in degrees
             * @param d
             * @return {number}
             */

        }, {
            key: "dcos",
            value: function dcos(d) {
                return Math.cos(this.dtr(d));
            }

            /**
             * @desc Modulus function which works for non-integers.
             * @param a
             * @param b
             * @return {number}
             */

        }, {
            key: "mod",
            value: function mod(a, b) {
                return a - b * Math.floor(a / b);
            }

            /**
             *
             * @param j
             * @return {number}
             */

        }, {
            key: "jwday",
            value: function jwday(j) {
                return this.mod(Math.floor(j + 1.5), 7);
            }

            /**
             *
             * @param jd
             * @return {number|*}
             */

        }, {
            key: "obliqeq",
            value: function obliqeq(jd) {
                var eps, u, v, i;
                v = u = (jd - this.J2000) / (this.JulianCentury * 100);
                eps = 23 + 26 / 60.0 + 21.448 / 3600.0;

                if (Math.abs(u) < 1.0) {
                    for (i = 0; i < 10; i++) {
                        eps += this.oterms[i] / 3600.0 * v;
                        v *= u;
                    }
                }
                return eps;
            }

            /**
             * @desc  Calculate the nutation in longitude, deltaPsi, and
             obliquity, deltaEpsilon for a given Julian date
             jd.  Results are returned as a two element Array
             giving (deltaPsi, deltaEpsilon) in degrees.
             * @param jd
             * @return Object
             */

        }, {
            key: "nutation",
            value: function nutation(jd) {
                var deltaPsi,
                    deltaEpsilon,
                    i,
                    j,
                    t = (jd - 2451545.0) / 36525.0,
                    t2,
                    t3,
                    to10,
                    ta = [],
                    dp = 0,
                    de = 0,
                    ang;

                t3 = t * (t2 = t * t);

                /* Calculate angles.  The correspondence between the elements
                 of our array and the terms cited in Meeus are:
                  ta[0] = D  ta[0] = M  ta[2] = M'  ta[3] = F  ta[4] = \Omega
                  */

                ta[0] = this.dtr(297.850363 + 445267.11148 * t - 0.0019142 * t2 + t3 / 189474.0);
                ta[1] = this.dtr(357.52772 + 35999.05034 * t - 0.0001603 * t2 - t3 / 300000.0);
                ta[2] = this.dtr(134.96298 + 477198.867398 * t + 0.0086972 * t2 + t3 / 56250.0);
                ta[3] = this.dtr(93.27191 + 483202.017538 * t - 0.0036825 * t2 + t3 / 327270);
                ta[4] = this.dtr(125.04452 - 1934.136261 * t + 0.0020708 * t2 + t3 / 450000.0);

                /* Range reduce the angles in case the sine and cosine functions
                 don't do it as accurately or quickly. */

                for (i = 0; i < 5; i++) {
                    ta[i] = this.fixangr(ta[i]);
                }

                to10 = t / 10.0;
                for (i = 0; i < 63; i++) {
                    ang = 0;
                    for (j = 0; j < 5; j++) {
                        if (this.nutArgMult[i * 5 + j] !== 0) {
                            ang += this.nutArgMult[i * 5 + j] * ta[j];
                        }
                    }
                    dp += (this.nutArgCoeff[i * 4 + 0] + this.nutArgCoeff[i * 4 + 1] * to10) * Math.sin(ang);
                    de += (this.nutArgCoeff[i * 4 + 2] + this.nutArgCoeff[i * 4 + 3] * to10) * Math.cos(ang);
                }

                /* Return the result, converting from ten thousandths of arc
                 seconds to radians in the process. */

                deltaPsi = dp / (3600.0 * 10000.0);
                deltaEpsilon = de / (3600.0 * 10000.0);

                return [deltaPsi, deltaEpsilon];
            }

            /**
             * @desc  Determine the difference, in seconds, between
             Dynamical time and Universal time.
             * @param year
             * @return {*}
             */

        }, {
            key: "deltat",
            value: function deltat(year) {
                var dt, f, i, t;

                if (year >= 1620 && year <= 2000) {
                    i = Math.floor((year - 1620) / 2);
                    f = (year - 1620) / 2 - i;
                    /* Fractional part of year */
                    dt = this.deltaTtab[i] + (this.deltaTtab[i + 1] - this.deltaTtab[i]) * f;
                } else {
                    t = (year - 2000) / 100;
                    if (year < 948) {
                        dt = 2177 + 497 * t + 44.1 * t * t;
                    } else {
                        dt = 102 + 102 * t + 25.3 * t * t;
                        if (year > 2000 && year < 2100) {
                            dt += 0.37 * (year - 2100);
                        }
                    }
                }
                return dt;
            }

            /**
             *
             * @param year
             * @param which
             * @return {*}
             */

        }, {
            key: "equinox",
            value: function equinox(year, which) {
                var deltaL = void 0,
                    i = void 0,
                    j = void 0,
                    JDE0 = void 0,
                    JDE = void 0,
                    JDE0tab = void 0,
                    S = void 0,
                    T = void 0,
                    W = void 0,
                    Y = void 0;
                /*  Initialise terms for mean equinox and solstices.  We
                 have two sets: one for years prior to 1000 and a second
                 for subsequent years.  */

                if (year < 1000) {
                    JDE0tab = this.JDE0tab1000;
                    Y = year / 1000;
                } else {
                    JDE0tab = this.JDE0tab2000;
                    Y = (year - 2000) / 1000;
                }

                JDE0 = JDE0tab[which][0] + JDE0tab[which][1] * Y + JDE0tab[which][2] * Y * Y + JDE0tab[which][3] * Y * Y * Y + JDE0tab[which][4] * Y * Y * Y * Y;
                T = (JDE0 - 2451545.0) / 36525;
                W = 35999.373 * T - 2.47;
                deltaL = 1 + 0.0334 * this.dcos(W) + 0.0007 * this.dcos(2 * W);
                S = 0;
                for (i = j = 0; i < 24; i++) {
                    S += this.EquinoxpTerms[j] * this.dcos(this.EquinoxpTerms[j + 1] + this.EquinoxpTerms[j + 2] * T);
                    j += 3;
                }
                JDE = JDE0 + S * 0.00001 / deltaL;
                return JDE;
            }

            /**
             * @desc  Position of the Sun.  Please see the comments
             on the return statement at the end of this function
             which describe the array it returns.  We return
             intermediate values because they are useful in a
             variety of other contexts.
             * @param jd
             * @return Object
             */

        }, {
            key: "sunpos",
            value: function sunpos(jd) {
                var T = void 0,
                    T2 = void 0,
                    L0 = void 0,
                    M = void 0,
                    e = void 0,
                    C = void 0,
                    sunLong = void 0,
                    sunAnomaly = void 0,
                    sunR = void 0,
                    Omega = void 0,
                    Lambda = void 0,
                    epsilon = void 0,
                    epsilon0 = void 0,
                    Alpha = void 0,
                    Delta = void 0,
                    AlphaApp = void 0,
                    DeltaApp = void 0;

                T = (jd - this.J2000) / this.JulianCentury;
                T2 = T * T;
                L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
                L0 = this.fixangle(L0);
                M = 357.52911 + 35999.05029 * T + -0.0001537 * T2;
                M = this.fixangle(M);
                e = 0.016708634 + -0.000042037 * T + -0.0000001267 * T2;
                C = (1.914602 + -0.004817 * T + -0.000014 * T2) * this.dsin(M) + (0.019993 - 0.000101 * T) * this.dsin(2 * M) + 0.000289 * this.dsin(3 * M);
                sunLong = L0 + C;
                sunAnomaly = M + C;
                sunR = 1.000001018 * (1 - e * e) / (1 + e * this.dcos(sunAnomaly));
                Omega = 125.04 - 1934.136 * T;
                Lambda = sunLong + -0.00569 + -0.00478 * this.dsin(Omega);
                epsilon0 = this.obliqeq(jd);
                epsilon = epsilon0 + 0.00256 * this.dcos(Omega);
                Alpha = this.rtd(Math.atan2(this.dcos(epsilon0) * this.dsin(sunLong), this.dcos(sunLong)));
                Alpha = this.fixangle(Alpha);
                Delta = this.rtd(Math.asin(this.dsin(epsilon0) * this.dsin(sunLong)));
                AlphaApp = this.rtd(Math.atan2(this.dcos(epsilon) * this.dsin(Lambda), this.dcos(Lambda)));
                AlphaApp = this.fixangle(AlphaApp);
                DeltaApp = this.rtd(Math.asin(this.dsin(epsilon) * this.dsin(Lambda)));

                return [//  Angular quantities are expressed in decimal degrees
                L0, //  [0] Geometric mean longitude of the Sun
                M, //  [1] Mean anomaly of the Sun
                e, //  [2] Eccentricity of the Earth's orbit
                C, //  [3] Sun's equation of the Centre
                sunLong, //  [4] Sun's true longitude
                sunAnomaly, //  [5] Sun's true anomaly
                sunR, //  [6] Sun's radius vector in AU
                Lambda, //  [7] Sun's apparent longitude at true equinox of the date
                Alpha, //  [8] Sun's true right ascension
                Delta, //  [9] Sun's true declination
                AlphaApp, // [10] Sun's apparent right ascension
                DeltaApp // [11] Sun's apparent declination
                ];
            }

            /**
             * @desc Compute equation of time for a given moment. Returns the equation of time as a fraction of a day.
             * @param jd
             * @return {number|*}
             */

        }, {
            key: "equationOfTime",
            value: function equationOfTime(jd) {
                var alpha = void 0,
                    deltaPsi = void 0,
                    E = void 0,
                    epsilon = void 0,
                    L0 = void 0,
                    tau = void 0;
                tau = (jd - this.J2000) / this.JulianMillennium;
                L0 = 280.4664567 + 360007.6982779 * tau + 0.03032028 * tau * tau + tau * tau * tau / 49931 + -(tau * tau * tau * tau / 15300) + -(tau * tau * tau * tau * tau / 2000000);
                L0 = this.fixangle(L0);
                alpha = this.sunpos(jd)[10];
                deltaPsi = this.nutation(jd)[0];
                epsilon = this.obliqeq(jd) + this.nutation(jd)[1];
                E = L0 + -0.0057183 + -alpha + deltaPsi * this.dcos(epsilon);
                E = E - 20.0 * Math.floor(E / 20.0);
                E = E / (24 * 60);
                return E;
            }
        }]);

        return ASTRO;
    }();

    module.exports = ASTRO;

    /***/ }),
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {


    /**
     * Constants
     * @module constants
     */

    module.exports = {
        durationUnit: {
            year: ['y', 'years', 'year'],
            month: ['M', 'months', 'month'],
            day: ['d', 'days', 'day'],
            hour: ['h', 'hours', 'hour'],
            minute: ['m', 'minutes', 'minute'],
            second: ['s', 'second', 'seconds'],
            millisecond: ['ms', 'milliseconds', 'millisecond'],
            week: ['W', 'w', 'weeks', 'week']
        }
    };

    /***/ }),
    /* 5 */
    /***/ (function(module, exports, __webpack_require__) {


    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Helpers = __webpack_require__(0);
    var normalizeDuration = new Helpers().normalizeDuration;
    var absRound = new Helpers().absRound;
    var absFloor = new Helpers().absFloor;
    /**
     * Duration object constructor
     * @param duration
     * @class Duration
     * @constructor
     */

    var Duration = function () {
        function Duration(key, value) {
            _classCallCheck(this, Duration);

            var duration = {},
                data = this._data = {},
                milliseconds = 0,
                normalizedUnit = normalizeDuration(key, value),
                unit = normalizedUnit.unit;
            duration[unit] = normalizedUnit.value;
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

            var years = duration.years || duration.year || duration.y || 0,
                months = duration.months || duration.month || duration.M || 0,
                weeks = duration.weeks || duration.w || duration.week || 0,
                days = duration.days || duration.d || duration.day || 0,
                hours = duration.hours || duration.hour || duration.h || 0,
                minutes = duration.minutes || duration.minute || duration.m || 0,
                seconds = duration.seconds || duration.second || duration.s || 0;
            // representation for dateAddRemove
            this._milliseconds = milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = days + weeks * 7;
            // It is impossible translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = months + years * 12;
            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;
            seconds += absFloor(milliseconds / 1000);
            data.seconds = seconds % 60;
            minutes += absRound(seconds / 60);
            data.minutes = minutes % 60;
            hours += absRound(minutes / 60);
            data.hours = hours % 24;
            days += absRound(hours / 24);
            days += weeks * 7;
            data.days = days % 30;
            months += absRound(days / 30);
            data.months = months % 12;
            years += absRound(months / 12);
            data.years = years;
            return this;
        }

        _createClass(Duration, [{
            key: 'valueOf',
            value: function valueOf() {
                return this._milliseconds + this._days * 864e5 + this._months * 2592e6;
            }
        }]);

        return Duration;
    }();

    module.exports = Duration;

    /***/ }),
    /* 6 */
    /***/ (function(module, exports, __webpack_require__) {


    /**
     * Constants
     * @module constants
     */

    module.exports = {
        gregorian: {
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        },
        persian: {
            months: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
            monthsShort: ['Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha', 'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf'],
            weekdays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            weekdaysShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            weekdaysMin: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
            persianDaysName: ['Urmazd', 'Bahman', 'Ordibehesht', 'Shahrivar', 'Sepandarmaz', 'Khurdad', 'Amordad', 'Dey-be-azar', 'Azar', 'Aban', 'Khorshid', 'Mah', 'Tir', 'Gush', 'Dey-be-mehr', 'Mehr', 'Sorush', 'Rashn', 'Farvardin', 'Bahram', 'Ram', 'Bad', 'Dey-be-din', 'Din', 'Ord', 'Ashtad', 'Asman', 'Zamyad', 'Mantre-sepand', 'Anaram', 'Ziadi']
        }
    };

    /***/ }),
    /* 7 */
    /***/ (function(module, exports, __webpack_require__) {


    /**
     * Constants
     * @module constants
     */

    module.exports = {
        gregorian: {
            months: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
            monthsShort: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
            weekdays: '\u06CC\u06A9\u200C\u0634\u0646\u0628\u0647_\u062F\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200C\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647_\u062C\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
            weekdaysShort: '\u06CC\u06A9\u200C\u0634\u0646\u0628\u0647_\u062F\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200C\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647_\u062C\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
            weekdaysMin: 'ی_د_س_چ_پ_ج_ش'.split('_')
        },
        persian: {
            months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
            monthsShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
            weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهار شنبه', '\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647', 'جمعه'],
            weekdaysShort: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
            weekdaysMin: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
            persianDaysName: ['اورمزد', 'بهمن', 'اوردیبهشت', 'شهریور', 'سپندارمذ', 'خورداد', 'امرداد', 'دی به آذز', 'آذز', 'آبان', 'خورشید', 'ماه', 'تیر', 'گوش', 'دی به مهر', 'مهر', 'سروش', 'رشن', 'فروردین', 'بهرام', 'رام', 'باد', 'دی به دین', 'دین', 'ارد', 'اشتاد', 'آسمان', 'زامیاد', 'مانتره سپند', 'انارام', 'زیادی']
        }
    };

    /***/ }),
    /* 8 */
    /***/ (function(module, exports, __webpack_require__) {


    var PersianDateClass = __webpack_require__(1);
    PersianDateClass.calendarType = 'persian';
    PersianDateClass.leapYearMode = 'astronomical';
    PersianDateClass.localType = 'fa';
    module.exports = PersianDateClass;

    /***/ }),
    /* 9 */
    /***/ (function(module, exports, __webpack_require__) {


    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Container = function Container() {
        _classCallCheck(this, Container);

        this.isInvalidDate = null;

        this.gDate = null;
        /**
         *
         * @type {number}
         */
        this.modifiedjulianday = 0;

        /**
         *
         * @type {number}
         */
        this.julianday = 0;

        /**
         *
         * @type {{day: number}}
         */
        this.gregserial = {
            day: 0
        };

        this.zone = 0;

        /**
         *
         * @type {{year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, weekday: number, unix: number, leap: number}}
         */
        this.gregorian = {
            year: 0,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
            weekday: 0,
            unix: 0,
            leap: 0
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.juliancalendar = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.islamic = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.persianAlgo = this.persian = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.persianAstro = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0
        };

        /**
         *
         * @type {{year: number, week: number, day: number}}
         */
        this.isoweek = {
            year: 0,
            week: 0,
            day: 0
        };

        /**
         *
         * @type {{year: number, day: number}}
         */
        this.isoday = {
            year: 0,
            day: 0
        };
    };

    module.exports = Container;

    /***/ }),
    /* 10 */
    /***/ (function(module, exports, __webpack_require__) {


    module.exports = {
        /**
         * @param input
         * @returns {boolean}
         */
        isArray: function isArray(input) {
            return Object.prototype.toString.call(input) === '[object Array]';
        },


        /**
         *
         * @param input
         * @returns {boolean}
         */
        isNumber: function isNumber(input) {
            return typeof input === 'number';
        },


        /**
         *
         * @param input
         * @returns {boolean}
         */
        isDate: function isDate(input) {
            return input instanceof Date;
        }
    };

    /***/ }),
    /* 11 */
    /***/ (function(module, exports, __webpack_require__) {


    module.exports = {
      /**
       * @param input
       * @returns {boolean}
       */
      validateInputArray: function validateInputArray(input) {
        var out = true;
        // Check month
        if (input[1] < 1 || input[1] > 12) {
          out = false;
        }
        // Check date
        if (input[2] < 1 || input[1] > 31) {
          out = false;
        }
        // Check hour 
        if (input[3] < 0 || input[3] > 24) {
          out = false;
        }
        // Check minute 
        if (input[4] < 0 || input[4] > 60) {
          out = false;
        }
        // Check second 
        if (input[5] < 0 || input[5] > 60) {
          out = false;
        }
        return out;
      }
    };

    /***/ })
    /******/ ]);
    });
    });

    var persianDate$1 = unwrapExports(persianDate);

    function persianDateToUnix(pDate) {
      return pDate.unix() * 1000
    }

    function getHourMinuteSecond(unix) {
      const pDate = new persianDate$1(unix);
      const result = {
        hour: pDate.hour(),
        minute: pDate.minute(),
        second: pDate.second(),
      };
      return result
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const nowUnix = persianDateToUnix(new persianDate$1());
    const isDirty = writable(false);
    // TODO get default value from config by more priority
    const selectedUnix = writable(nowUnix);
    const viewUnix = writable(nowUnix);
    const viewMode = writable('month'); // [date, month, year]
    const isOpen = writable(false);
    const minUnix = writable(null);
    const maxUnix = writable(null);
    const currentCalendar = writable('persian'); // [persian, gregorian]

    const actions = {
      onSelectDate(pDate) {
        const { hour, minute, second } = getHourMinuteSecond(get_store_value(selectedUnix));
        pDate
          .hour(hour)
          .minute(minute)
          .second(second);
        this.setSelectedDate(pDate);
        this.updateIsDirty(true);
      },
      setSelectedDate(pDate) {
        const unix = persianDateToUnix(pDate);
        selectedUnix.set(unix);
      },
      onSelectMonth(month) {
        this.setMonth(month);
        this.setViewMode('day');
        this.updateIsDirty(true);
      },
      onSelectYear(year) {
        this.setYear(year);
        this.setViewMode('month');
        this.updateIsDirty(true);
      },
      onSetHour(hour) {
        this.setHour(hour);
        this.updateIsDirty(true);
      },
      onSetMinute(minute) {
        this.setMinute(minute);
        this.updateIsDirty(true);
      },
      setYear(year) {
        selectedUnix.set(
          persianDateToUnix(
            new persianDate$1(get_store_value(selectedUnix))
              .toCalendar(get_store_value(currentCalendar))
              .year(year)
          )
        );
      },
      setMonth(month) {
        selectedUnix.set(
          persianDateToUnix(
            new persianDate$1(get_store_value(selectedUnix))
              .toCalendar(get_store_value(currentCalendar))
              .month(month)
          )
        );
      },
      /* @param {number} date - day of month */
      setDate(date) {
        selectedUnix.set(
          persianDateToUnix(
            new persianDate$1(get_store_value(selectedUnix))
              .toCalendar(get_store_value(currentCalendar))
              .date(date)
          )
        );
      },
      setHour(hour) {
        selectedUnix.set(
          persianDateToUnix(
            new persianDate$1(get_store_value(selectedUnix))
              .toCalendar(get_store_value(currentCalendar))
              .hour(hour)
          )
        );
      },
      setMinute(minute) {
        selectedUnix.set(
          persianDateToUnix(
            new persianDate$1(get_store_value(selectedUnix))
              .toCalendar(get_store_value(currentCalendar))
              .minute(minute)
          )
        );
      },
      setSecond(second) {
        selectedUnix.set(
          persianDateToUnix(
            new persianDate$1(get_store_value(selectedUnix))
              .toCalendar(get_store_value(currentCalendar))
              .second(second)
          )
        );
      },
      onChangeViewMode(viewMode) {
        // click on center of toolbar
        this.setViewMode(viewMode);
      },
      setViewMode(mode) {
        viewMode.set(mode);
      },
      updateIsDirty(value) {
        isDirty.set(value);
      },
      setMinUnix(date) {
        minUnix.set(date);
        this.setSelectedDate(Math.max(get_store_value(selectedUnix), get_store_value(minUnix)));
      },
      setMaxUnix(date) {
        maxUnix.set(date);
        this.setSelectedDate(Math.min(get_store_value(selectedUnix), get_store_value(maxUnix)));
      },
      onSelectCalendar(calendar) {
        this.setCalendar(calendar);
      },
      setCalendar(calendar) {
        currentCalendar.set(calendar);
      },
      onSelectNextView() {
        viewUnix.set(persianDateToUnix(new persianDate$1(get_store_value(viewUnix)).add('month', 1)));
      },
      onSelectPrevView() {
        viewUnix.set(persianDateToUnix(new persianDate$1(get_store_value(viewUnix)).subtract('month', 1)));
      },
      setViewUnix(pDate) {
        viewUnix.set(persianDateToUnix(pDate));
      },
      onSelectToday() {
        viewUnix.set(persianDateToUnix(new persianDate$1().startOf('day')));
      },
      onClickInput() {
        this.setOpen(!isOpen);
      },
      setOpen(value) {
        isOpen.set(value);
      },
    };

    /*

    import { writable, readable, derived } from 'svelte/store'

    // Readable Example
    export const time = readable(new Date(), function start (set) {
      const interval = setInterval(() => {
        set(new Date())
      }, 1000)

      return function stop () {
        clearInterval(interval)
      }
    })

    // Writable Example
    export const count = writable(0)
    // Derived Example
    const start = new Date()
    export const elapsed = derived(time, $time =>
      Math.round(($time - start) / 1000)
    )

    // Custom Store
    export const countable = (function () {
      const { subscribe, set, update } = writable(0)
      return {
        set: input => update(() => input),
        subscribe,
        increment: () => update(n => n + 1),
        decrement: () => update(n => n - 1),
        reset: () => set(0)
      }
    })()


    */

    /* src/components/YearView.svelte generated by Svelte v3.18.2 */
    const file = "src/components/YearView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (2:2) {#each yearRange as year}
    function create_each_block(ctx) {
    	let span;
    	let t0_value = /*year*/ ctx[9] + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[8](/*year*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			toggle_class(span, "selected", /*currentYear*/ ctx[1] === /*year*/ ctx[9]);
    			add_location(span, file, 2, 4, 65);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*yearRange*/ 1 && t0_value !== (t0_value = /*year*/ ctx[9] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*currentYear, yearRange*/ 3) {
    				toggle_class(span, "selected", /*currentYear*/ ctx[1] === /*year*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(2:2) {#each yearRange as year}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = /*yearRange*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pwt-date-year-view");
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentYear, yearRange, select*/ 7) {
    				each_value = /*yearRange*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { selectedUnix } = $$props;
    	let { viewUnix } = $$props;
    	const dispatch = createEventDispatcher();

    	function select(payload) {
    		dispatch("select", { payload });
    	}

    	let yearRange;
    	let startYear;
    	const writable_props = ["selectedUnix", "viewUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<YearView> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (year, event) => select(year);

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(3, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(4, viewUnix = $$props.viewUnix);
    	};

    	$$self.$capture_state = () => {
    		return {
    			selectedUnix,
    			viewUnix,
    			yearRange,
    			startYear,
    			currentViewDate,
    			currentYear
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(3, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(4, viewUnix = $$props.viewUnix);
    		if ("yearRange" in $$props) $$invalidate(0, yearRange = $$props.yearRange);
    		if ("startYear" in $$props) $$invalidate(5, startYear = $$props.startYear);
    		if ("currentViewDate" in $$props) currentViewDate = $$props.currentViewDate;
    		if ("currentYear" in $$props) $$invalidate(1, currentYear = $$props.currentYear);
    	};

    	let currentViewDate;
    	let currentYear;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*viewUnix*/ 16) {
    			 currentViewDate = new persianDate$1(viewUnix).format("MMMM");
    		}

    		if ($$self.$$.dirty & /*selectedUnix*/ 8) {
    			 $$invalidate(1, currentYear = new persianDate$1(selectedUnix).year());
    		}

    		if ($$self.$$.dirty & /*currentYear, yearRange, startYear*/ 35) {
    			 {
    				$$invalidate(0, yearRange = []);
    				$$invalidate(5, startYear = currentYear - currentYear % 12);
    				let i = 0;

    				while (i < 12) {
    					yearRange.push(startYear + i);
    					i++;
    				}
    			}
    		}
    	};

    	return [
    		yearRange,
    		currentYear,
    		select,
    		selectedUnix,
    		viewUnix,
    		startYear,
    		currentViewDate,
    		dispatch,
    		click_handler
    	];
    }

    class YearView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { selectedUnix: 3, viewUnix: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "YearView",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[3] === undefined && !("selectedUnix" in props)) {
    			console.warn("<YearView> was created without expected prop 'selectedUnix'");
    		}

    		if (/*viewUnix*/ ctx[4] === undefined && !("viewUnix" in props)) {
    			console.warn("<YearView> was created without expected prop 'viewUnix'");
    		}
    	}

    	get selectedUnix() {
    		throw new Error("<YearView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedUnix(value) {
    		throw new Error("<YearView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewUnix() {
    		throw new Error("<YearView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewUnix(value) {
    		throw new Error("<YearView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MonthView.svelte generated by Svelte v3.18.2 */
    const file$1 = "src/components/MonthView.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (2:2) {#each monthRange as month, index}
    function create_each_block$1(ctx) {
    	let span;
    	let t0_value = /*month*/ ctx[8] + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[7](/*index*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			toggle_class(span, "selected", /*currentMonth*/ ctx[0] - 1 === /*index*/ ctx[10]);
    			add_location(span, file$1, 2, 4, 75);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*currentMonth*/ 1) {
    				toggle_class(span, "selected", /*currentMonth*/ ctx[0] - 1 === /*index*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(2:2) {#each monthRange as month, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = /*monthRange*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pwt-date-month-view");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentMonth, select, monthRange*/ 7) {
    				each_value = /*monthRange*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { selectedUnix } = $$props;
    	let { viewUnix } = $$props;
    	const dispatch = createEventDispatcher();

    	function select(payload) {
    		dispatch("select", { payload });
    	}

    	let monthRange = new persianDate$1().rangeName().months;
    	const writable_props = ["selectedUnix", "viewUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MonthView> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (index, event) => select(index + 1);

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(3, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(4, viewUnix = $$props.viewUnix);
    	};

    	$$self.$capture_state = () => {
    		return {
    			selectedUnix,
    			viewUnix,
    			monthRange,
    			currentUnixDate,
    			currentMonth
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(3, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(4, viewUnix = $$props.viewUnix);
    		if ("monthRange" in $$props) $$invalidate(2, monthRange = $$props.monthRange);
    		if ("currentUnixDate" in $$props) currentUnixDate = $$props.currentUnixDate;
    		if ("currentMonth" in $$props) $$invalidate(0, currentMonth = $$props.currentMonth);
    	};

    	let currentUnixDate;
    	let currentMonth;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*viewUnix*/ 16) {
    			 currentUnixDate = new persianDate$1(viewUnix).format("MMMM");
    		}

    		if ($$self.$$.dirty & /*selectedUnix*/ 8) {
    			 $$invalidate(0, currentMonth = new persianDate$1(selectedUnix).month());
    		}
    	};

    	return [
    		currentMonth,
    		select,
    		monthRange,
    		selectedUnix,
    		viewUnix,
    		currentUnixDate,
    		dispatch,
    		click_handler
    	];
    }

    class MonthView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { selectedUnix: 3, viewUnix: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MonthView",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[3] === undefined && !("selectedUnix" in props)) {
    			console.warn("<MonthView> was created without expected prop 'selectedUnix'");
    		}

    		if (/*viewUnix*/ ctx[4] === undefined && !("viewUnix" in props)) {
    			console.warn("<MonthView> was created without expected prop 'viewUnix'");
    		}
    	}

    	get selectedUnix() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedUnix(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewUnix() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewUnix(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/DateView.svelte generated by Svelte v3.18.2 */
    const file$2 = "src/components/DateView.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (4:6) {#if groupedDay[0]}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*groupedDay*/ ctx[1][0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay*/ 2) {
    				each_value_2 = /*groupedDay*/ ctx[1][0];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(4:6) {#if groupedDay[0]}",
    		ctx
    	});

    	return block;
    }

    // (5:8) {#each groupedDay[0] as day}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*day*/ ctx[14].format("ddd") + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$2, 5, 10, 156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay*/ 2 && t_value !== (t_value = /*day*/ ctx[14].format("ddd") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(5:8) {#each groupedDay[0] as day}",
    		ctx
    	});

    	return block;
    }

    // (12:8) {#each week as day}
    function create_each_block_1(ctx) {
    	let td;
    	let t_value = /*day*/ ctx[14].format("D") + "";
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[10](/*day*/ ctx[14], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			toggle_class(td, "selected", /*isSameDate*/ ctx[2](/*day*/ ctx[14], /*selectedDay*/ ctx[0]));
    			toggle_class(td, "today", /*isSameDate*/ ctx[2](/*day*/ ctx[14], /*today*/ ctx[4]));
    			add_location(td, file$2, 12, 10, 306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    			dispose = listen_dev(td, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*groupedDay*/ 2 && t_value !== (t_value = /*day*/ ctx[14].format("D") + "")) set_data_dev(t, t_value);

    			if (dirty & /*isSameDate, groupedDay, selectedDay*/ 7) {
    				toggle_class(td, "selected", /*isSameDate*/ ctx[2](/*day*/ ctx[14], /*selectedDay*/ ctx[0]));
    			}

    			if (dirty & /*isSameDate, groupedDay, today*/ 22) {
    				toggle_class(td, "today", /*isSameDate*/ ctx[2](/*day*/ ctx[14], /*today*/ ctx[4]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(12:8) {#each week as day}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#each groupedDay as week, i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*week*/ ctx[11];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$2, 10, 6, 263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isSameDate, groupedDay, selectedDay, today, selectDate*/ 31) {
    				each_value_1 = /*week*/ ctx[11];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:4) {#each groupedDay as week, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let table;
    	let tr;
    	let t;
    	let if_block = /*groupedDay*/ ctx[1][0] && create_if_block(ctx);
    	let each_value = /*groupedDay*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			tr = element("tr");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$2, 2, 4, 78);
    			attr_dev(table, "class", "month-table next");
    			attr_dev(table, "border", "1");
    			add_location(table, file$2, 1, 2, 30);
    			attr_dev(div, "class", "pwt-date-view");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);
    			append_dev(table, tr);
    			if (if_block) if_block.m(tr, null);
    			append_dev(table, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*groupedDay*/ ctx[1][0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(tr, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*groupedDay, isSameDate, selectedDay, today, selectDate*/ 31) {
    				each_value = /*groupedDay*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const isSameDate = (a, b) => {
    		return a.format("YYYY/MM/DD") === b.format("YYYY/MM/DD");
    	};

    	let { viewUnix } = $$props;
    	let { selectedUnix } = $$props;
    	let { todayUnix } = $$props;
    	const dispatch = createEventDispatcher();

    	function selectDate(payload) {
    		dispatch("selectDate", { payload });
    	}

    	let selectedDay = new persianDate$1(selectedUnix).startOf("day");

    	afterUpdate(async () => {
    		$$invalidate(0, selectedDay = new persianDate$1(selectedUnix).startOf("day"));
    	});

    	let today = new persianDate$1(todayUnix);
    	let groupedDay = [];
    	const writable_props = ["viewUnix", "selectedUnix", "todayUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DateView> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (day, event) => selectDate(day);

    	$$self.$set = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(5, viewUnix = $$props.viewUnix);
    		if ("selectedUnix" in $$props) $$invalidate(6, selectedUnix = $$props.selectedUnix);
    		if ("todayUnix" in $$props) $$invalidate(7, todayUnix = $$props.todayUnix);
    	};

    	$$self.$capture_state = () => {
    		return {
    			viewUnix,
    			selectedUnix,
    			todayUnix,
    			selectedDay,
    			today,
    			groupedDay,
    			viewUnixDate
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(5, viewUnix = $$props.viewUnix);
    		if ("selectedUnix" in $$props) $$invalidate(6, selectedUnix = $$props.selectedUnix);
    		if ("todayUnix" in $$props) $$invalidate(7, todayUnix = $$props.todayUnix);
    		if ("selectedDay" in $$props) $$invalidate(0, selectedDay = $$props.selectedDay);
    		if ("today" in $$props) $$invalidate(4, today = $$props.today);
    		if ("groupedDay" in $$props) $$invalidate(1, groupedDay = $$props.groupedDay);
    		if ("viewUnixDate" in $$props) viewUnixDate = $$props.viewUnixDate;
    	};

    	let viewUnixDate;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*viewUnix*/ 32) {
    			 viewUnixDate = new persianDate$1(viewUnix).format("MMMM YYYY");
    		}

    		if ($$self.$$.dirty & /*viewUnix, groupedDay*/ 34) {
    			 {
    				$$invalidate(1, groupedDay = []);
    				let days = [];
    				let dateObj = new persianDate$1(viewUnix);
    				let day = dateObj.startOf("month");
    				let daysInMonth = dateObj.daysInMonth();
    				let monthFirstDate = dateObj.startOf("month");
    				let monthLastDate = dateObj.endOf("month");
    				let monthVisualBeforeSpan = day.day();
    				let monthVisualAfterSpan = 8 - monthLastDate.clone().add("m", 1).startOf("month").day();
    				let i = 0;

    				while (i < daysInMonth) {
    					i++;

    					// days.push(day.add('day', i))
    					days.push(new persianDate$1([day.year(), day.month(), i]));
    				}

    				let j = 1;

    				while (j < monthVisualBeforeSpan) {
    					days.unshift(monthFirstDate.subtract("day", j));
    					j++;
    				}

    				let f = 1;

    				while (f <= monthVisualAfterSpan) {
    					days.push(monthLastDate.add("day", f));
    					f++;
    				}

    				let weekindex = 0;

    				days.forEach((item, index) => {
    					if (index % 7 == 0) {
    						$$invalidate(1, groupedDay[weekindex] = [], groupedDay);
    					}

    					groupedDay[weekindex].push(item);

    					if (index % 7 == 6) {
    						weekindex++;
    					}
    				});
    			}
    		}
    	};

    	return [
    		selectedDay,
    		groupedDay,
    		isSameDate,
    		selectDate,
    		today,
    		viewUnix,
    		selectedUnix,
    		todayUnix,
    		viewUnixDate,
    		dispatch,
    		click_handler
    	];
    }

    class DateView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			viewUnix: 5,
    			selectedUnix: 6,
    			todayUnix: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateView",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewUnix*/ ctx[5] === undefined && !("viewUnix" in props)) {
    			console.warn("<DateView> was created without expected prop 'viewUnix'");
    		}

    		if (/*selectedUnix*/ ctx[6] === undefined && !("selectedUnix" in props)) {
    			console.warn("<DateView> was created without expected prop 'selectedUnix'");
    		}

    		if (/*todayUnix*/ ctx[7] === undefined && !("todayUnix" in props)) {
    			console.warn("<DateView> was created without expected prop 'todayUnix'");
    		}
    	}

    	get viewUnix() {
    		throw new Error("<DateView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewUnix(value) {
    		throw new Error("<DateView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedUnix() {
    		throw new Error("<DateView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedUnix(value) {
    		throw new Error("<DateView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get todayUnix() {
    		throw new Error("<DateView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todayUnix(value) {
    		throw new Error("<DateView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TimeView.svelte generated by Svelte v3.18.2 */
    const file$3 = "src/components/TimeView.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*currentUnixDate*/ ctx[0]);
    			attr_dev(div, "class", "pwt-date-navigator");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentUnixDate*/ 1) set_data_dev(t, /*currentUnixDate*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { selectedUnix } = $$props;
    	let currentUnixDate = new persianDate$1(selectedUnix).format("HH:mm:ss");

    	afterUpdate(async () => {
    		$$invalidate(0, currentUnixDate = new persianDate$1(selectedUnix).format("HH:mm:ss"));
    	});

    	const writable_props = ["selectedUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimeView> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(1, selectedUnix = $$props.selectedUnix);
    	};

    	$$self.$capture_state = () => {
    		return { selectedUnix, currentUnixDate };
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(1, selectedUnix = $$props.selectedUnix);
    		if ("currentUnixDate" in $$props) $$invalidate(0, currentUnixDate = $$props.currentUnixDate);
    	};

    	return [currentUnixDate, selectedUnix];
    }

    class TimeView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { selectedUnix: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeView",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[1] === undefined && !("selectedUnix" in props)) {
    			console.warn("<TimeView> was created without expected prop 'selectedUnix'");
    		}
    	}

    	get selectedUnix() {
    		throw new Error("<TimeView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedUnix(value) {
    		throw new Error("<TimeView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navigator.svelte generated by Svelte v3.18.2 */
    const file$4 = "src/components/Navigator.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*selectedUnixDate*/ ctx[0]);
    			attr_dev(div, "class", "pwt-date-navigator");
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedUnixDate*/ 1) set_data_dev(t, /*selectedUnixDate*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { selectedUnix } = $$props;
    	const writable_props = ["selectedUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigator> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(1, selectedUnix = $$props.selectedUnix);
    	};

    	$$self.$capture_state = () => {
    		return { selectedUnix, selectedUnixDate };
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(1, selectedUnix = $$props.selectedUnix);
    		if ("selectedUnixDate" in $$props) $$invalidate(0, selectedUnixDate = $$props.selectedUnixDate);
    	};

    	let selectedUnixDate;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedUnix*/ 2) {
    			 $$invalidate(0, selectedUnixDate = new persianDate$1(selectedUnix).format("MMMM YYYY DD"));
    		}
    	};

    	return [selectedUnixDate, selectedUnix];
    }

    class Navigator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { selectedUnix: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigator",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[1] === undefined && !("selectedUnix" in props)) {
    			console.warn("<Navigator> was created without expected prop 'selectedUnix'");
    		}
    	}

    	get selectedUnix() {
    		throw new Error("<Navigator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedUnix(value) {
    		throw new Error("<Navigator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    ({
        /**
         * @desc monthTitleFormat
         */
        monthTitleFormat: "MMMM",

        /**
         * @desc startDate
         */
        startDate: new persianDate$1([new persianDate$1().year(), 1, 3, 1, 1, 1, 1]),


        /**
         * @desc  endDate
         */
        endDate: new persianDate$1().endOf('year'),


        /**
         * @desc weekDayTitle
         */
        weekDayTitle: ["شنبه", "", "دوشنبه", "", "چهارشنبه", "", "جمعه"],


        /**
         * @desc dayWidth
         */
        dayWidth: "30",


        /**
         * @desc dayHeight
         */
        dayHeight: "30",


        /**
         * @desc data
         */
        data: {

        },


        /**
         * @desc days
         */
        days: {
            /**
             * @desc render data function()
             * @type function
             */
            renderData: function ($day, data) {
            },
            label: {
                enabled: true,
                format: "DD",
                formatter: function (Obj, date) {
                    return date.format("DD");
                }
            },
            tooltip: {
                enabled: true,
                formatter: function (Obj, date) {

                },
                background_color: "#333333",
                color: "#ffffff",
                animation_speed: 250,
                animation_offset: 20,
                close_on_click: true,
                default_position: "above",
                hide_delay: 100,
                keep_visible: true,
                max_width: 200,
                opacity: 0.85,
                position: "center",
                prerender: false,
                show_delay: 100,
                vertical_offset: 0
            }
        }
    });

    /* src/App.svelte generated by Svelte v3.18.2 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let t6;
    	let br0;
    	let t7;
    	let t8;
    	let br1;
    	let t9;
    	let t10;
    	let br2;
    	let t11;
    	let t12;
    	let br3;
    	let t13;
    	let current;
    	let dispose;

    	const navigator = new Navigator({
    			props: { selectedUnix: /*$selectedUnix*/ ctx[0] },
    			$$inline: true
    		});

    	const yearview = new YearView({
    			props: {
    				viewUnix: /*$viewUnix*/ ctx[1],
    				selectedUnix: /*$selectedUnix*/ ctx[0]
    			},
    			$$inline: true
    		});

    	yearview.$on("select", /*onSelectYear*/ ctx[5]);

    	const monthview = new MonthView({
    			props: {
    				viewUnix: /*$viewUnix*/ ctx[1],
    				selectedUnix: /*$selectedUnix*/ ctx[0]
    			},
    			$$inline: true
    		});

    	monthview.$on("select", /*onSelectMonth*/ ctx[4]);

    	const timeview = new TimeView({
    			props: { selectedUnix: /*$selectedUnix*/ ctx[0] },
    			$$inline: true
    		});

    	const dateview = new DateView({
    			props: {
    				todayUnix: /*todayUnix*/ ctx[2],
    				selectedUnix: /*$selectedUnix*/ ctx[0],
    				viewUnix: /*$viewUnix*/ ctx[1]
    			},
    			$$inline: true
    		});

    	dateview.$on("selectDate", /*onSelectDate*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Today";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Prev";
    			t5 = space();
    			create_component(navigator.$$.fragment);
    			t6 = space();
    			br0 = element("br");
    			t7 = space();
    			create_component(yearview.$$.fragment);
    			t8 = space();
    			br1 = element("br");
    			t9 = space();
    			create_component(monthview.$$.fragment);
    			t10 = space();
    			br2 = element("br");
    			t11 = space();
    			create_component(timeview.$$.fragment);
    			t12 = space();
    			br3 = element("br");
    			t13 = space();
    			create_component(dateview.$$.fragment);
    			attr_dev(button0, "class", "svelte-12ruqcy");
    			add_location(button0, file$5, 1, 2, 31);
    			attr_dev(button1, "class", "svelte-12ruqcy");
    			add_location(button1, file$5, 2, 2, 75);
    			attr_dev(button2, "class", "svelte-12ruqcy");
    			add_location(button2, file$5, 3, 2, 120);
    			attr_dev(br0, "class", "svelte-12ruqcy");
    			add_location(br0, file$5, 6, 2, 233);
    			attr_dev(br1, "class", "svelte-12ruqcy");
    			add_location(br1, file$5, 12, 2, 371);
    			attr_dev(br2, "class", "svelte-12ruqcy");
    			add_location(br2, file$5, 18, 2, 512);
    			attr_dev(br3, "class", "svelte-12ruqcy");
    			add_location(br3, file$5, 21, 2, 588);
    			attr_dev(div, "class", "pwt-datepicker svelte-12ruqcy");
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(div, t3);
    			append_dev(div, button2);
    			append_dev(div, t5);
    			mount_component(navigator, div, null);
    			append_dev(div, t6);
    			append_dev(div, br0);
    			append_dev(div, t7);
    			mount_component(yearview, div, null);
    			append_dev(div, t8);
    			append_dev(div, br1);
    			append_dev(div, t9);
    			mount_component(monthview, div, null);
    			append_dev(div, t10);
    			append_dev(div, br2);
    			append_dev(div, t11);
    			mount_component(timeview, div, null);
    			append_dev(div, t12);
    			append_dev(div, br3);
    			append_dev(div, t13);
    			mount_component(dateview, div, null);
    			current = true;

    			dispose = [
    				listen_dev(button0, "click", /*today*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*navNext*/ ctx[6], false, false, false),
    				listen_dev(button2, "click", /*navPrev*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const navigator_changes = {};
    			if (dirty & /*$selectedUnix*/ 1) navigator_changes.selectedUnix = /*$selectedUnix*/ ctx[0];
    			navigator.$set(navigator_changes);
    			const yearview_changes = {};
    			if (dirty & /*$viewUnix*/ 2) yearview_changes.viewUnix = /*$viewUnix*/ ctx[1];
    			if (dirty & /*$selectedUnix*/ 1) yearview_changes.selectedUnix = /*$selectedUnix*/ ctx[0];
    			yearview.$set(yearview_changes);
    			const monthview_changes = {};
    			if (dirty & /*$viewUnix*/ 2) monthview_changes.viewUnix = /*$viewUnix*/ ctx[1];
    			if (dirty & /*$selectedUnix*/ 1) monthview_changes.selectedUnix = /*$selectedUnix*/ ctx[0];
    			monthview.$set(monthview_changes);
    			const timeview_changes = {};
    			if (dirty & /*$selectedUnix*/ 1) timeview_changes.selectedUnix = /*$selectedUnix*/ ctx[0];
    			timeview.$set(timeview_changes);
    			const dateview_changes = {};
    			if (dirty & /*$selectedUnix*/ 1) dateview_changes.selectedUnix = /*$selectedUnix*/ ctx[0];
    			if (dirty & /*$viewUnix*/ 2) dateview_changes.viewUnix = /*$viewUnix*/ ctx[1];
    			dateview.$set(dateview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigator.$$.fragment, local);
    			transition_in(yearview.$$.fragment, local);
    			transition_in(monthview.$$.fragment, local);
    			transition_in(timeview.$$.fragment, local);
    			transition_in(dateview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigator.$$.fragment, local);
    			transition_out(yearview.$$.fragment, local);
    			transition_out(monthview.$$.fragment, local);
    			transition_out(timeview.$$.fragment, local);
    			transition_out(dateview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navigator);
    			destroy_component(yearview);
    			destroy_component(monthview);
    			destroy_component(timeview);
    			destroy_component(dateview);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $selectedUnix;
    	let $viewUnix;
    	validate_store(selectedUnix, "selectedUnix");
    	component_subscribe($$self, selectedUnix, $$value => $$invalidate(0, $selectedUnix = $$value));
    	validate_store(viewUnix, "viewUnix");
    	component_subscribe($$self, viewUnix, $$value => $$invalidate(1, $viewUnix = $$value));
    	let { options = {} } = $$props;
    	const todayUnix = persianDateToUnix(new persianDate$1());
    	//options = Object.assign(Options, options)

    	// Public events
    	const dispatch = createEventDispatcher();

    	const dispatcher = function (input) {
    		if (options[input]) {
    			return event => options[input](event);
    		} else {
    			return event => {
    				actions[input](event.detail.payload);
    			};
    		}
    	};

    	const onSelectDate = function (event) {
    		dispatcher("onSelectDate")(event);
    	};

    	const onSelectMonth = function (event) {
    		dispatcher("onSelectMonth")(event);
    	};

    	const onSelectYear = function (event) {
    		dispatcher("onSelectYear")(event);
    	};

    	const navNext = event => {
    		dispatcher("onSelectNextView")(event);
    	};

    	const today = event => {
    		dispatcher("onSelectToday")(event);
    	};

    	const navPrev = event => {
    		dispatcher("onSelectPrevView")(event);
    	};

    	const writable_props = ["options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("options" in $$props) $$invalidate(9, options = $$props.options);
    	};

    	$$self.$capture_state = () => {
    		return { options, $selectedUnix, $viewUnix };
    	};

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(9, options = $$props.options);
    		if ("$selectedUnix" in $$props) selectedUnix.set($selectedUnix = $$props.$selectedUnix);
    		if ("$viewUnix" in $$props) viewUnix.set($viewUnix = $$props.$viewUnix);
    	};

    	return [
    		$selectedUnix,
    		$viewUnix,
    		todayUnix,
    		onSelectDate,
    		onSelectMonth,
    		onSelectYear,
    		navNext,
    		today,
    		navPrev,
    		options
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { options: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get options() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=zerounip.js.map
