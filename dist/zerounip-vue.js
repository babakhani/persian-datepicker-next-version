/**
 * 
 * persian-datepicker-next-version
 * v0.0.1
 * babakhani.reza@gmail.com
 * license MIT
 * 
 *     
 */

'use strict';

function noop() { }
const identity = x => x;
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
    if (!store || typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
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

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
let running = false;
function run_tasks() {
    tasks.forEach(task => {
        if (!task[0](now())) {
            tasks.delete(task);
            task[1]();
        }
    });
    running = tasks.size > 0;
    if (running)
        raf(run_tasks);
}
function loop(fn) {
    let task;
    if (!running) {
        running = true;
        raf(run_tasks);
    }
    return {
        promise: new Promise(fulfil => {
            tasks.add(task = [fn, fulfil]);
        }),
        abort() {
            tasks.delete(task);
        }
    };
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
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
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

let stylesheet;
let active = 0;
let current_rules = {};
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    if (!current_rules[name]) {
        if (!stylesheet) {
            const style = element('style');
            document.head.appendChild(style);
            stylesheet = style.sheet;
        }
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    node.style.animation = (node.style.animation || '')
        .split(', ')
        .filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    )
        .join(', ');
    if (name && !--active)
        clear_rules();
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        let i = stylesheet.cssRules.length;
        while (i--)
            stylesheet.deleteRule(i);
        current_rules = {};
    });
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
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
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
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined' ? window : global);
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
        $$.ctx = {};
    }
}
function make_dirty(component, key) {
    if (!component.$$.dirty) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal, props) {
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
        dirty: null
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (key, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    $$.bound[key](value);
                if (ready)
                    make_dirty(component, key);
            }
            return ret;
        })
        : prop_values;
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
    document.dispatchEvent(custom_event(type, detail));
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

function fade(node, { delay = 0, duration = 400, easing = identity }) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}

class PersianDateParser {
    constructor() {
        this.pattern = {
          iso: /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/g,
          jalali: /^[1-4]\d{3}(\/|-|\.)((0?[1-6](\/|-|\.)((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))(\/|-|\.)(30|([1-2][0-9])|(0?[1-9]))))$/g
        };
    }

    parse(inputString) {
        let that = this,
            persianDateArray,
            isoPat = new RegExp(that.pattern.iso),
            jalaliPat = new RegExp(that.pattern.jalali);

        String.prototype.toEnglishDigits = function () {
            let charCodeZero = '۰'.charCodeAt(0);
            return this.replace(/[۰-۹]/g, function (w) {
                return w.charCodeAt(0) - charCodeZero;
            });
        };
        inputString = inputString.toEnglishDigits();
        if (jalaliPat.test(inputString)) {
          /* eslint-disable no-useless-escape */
          persianDateArray = inputString.split(/\/|-|\,|\./).map(Number);
          /* eslint-enable no-useless-escape */
          return persianDateArray;
        } else if (isoPat.test(inputString)) {
          /* eslint-disable no-useless-escape */
          persianDateArray = inputString.split(/\/|-|\,|\:|\T|\Z/g).map(Number);
          return persianDateArray;
          /* eslint-enable no-useless-escape */
        } else {
            return undefined;
        }

    }
}

function persianDateToUnix(pDate) {
  return pDate.unix() * 1000
}

function getHourMinuteSecond(unix) {
  const pDate = new persianDate(unix);
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

let Helper = {
  debug () {
  //  // console.log(i)
  }
};
/**
 * @description persian-datepicker configuration document
 */
var defaultconfig = {


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
    'viewMode': 'month',


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
        },


        /**
         * @description Called when navigator goes to previews state
         * @event
         * @example function (navigator) {
         *      //log('navigator prev ');
         *  }
         */
        'onPrev': function (datepickerObject) {
        },


        /**
         * @description Called when navigator switch
         * @event
         * @example function (datepickerObject) {
                // console.log('navigator switch ');
         *  }
         */
        'onSwitch': function (datepickerObject) {
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
         * @description The amount that increases or decreases by pressing the button
         * @type number
         */
        'step': 1,

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
          let selectedYear = new dateObject(unix).year();
          let startYear = selectedYear - (selectedYear % 12);
          return new dateObject(unix).year(startYear).format(this.titleFormat) + '-' + new
            dateObject(unix).year(startYear+ 11).format(this.titleFormat)
        },

        /**
         * @description fired when user select year
         * @event
         * @param year
         */
        'onSelect': function (year) {
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
      'selectedDateFormat': ' dddd DD MMMM',
      'selectedDateFormatter': function (unix, dateObject) {
        return new dateObject(unix).format(this.selectedDateFormat)
      }
    },


    /**
     * @description Called when date Select by user.
     * @event
     * @param unixDate
     */
    'onSelect': function (unixDate) {
    },


    /**
     * @description Called when date Select by api.
     * @event
     * @param unixDate
     */
    'onSet': function (unixDate) {
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
    },


    /**
     * @description A function that takes current datepicker instance. It is called just before the datepicker Hide.
     * @event
     */
    'onHide': function (datepickerObject) {
    },


    /**
     * @description on toggle datepicker event
     * @event
     */
    'onToggle': function (datepickerObject) {
    },


    /**
     * @description on destroy datepicker event
     * @event
     */
    'onDestroy': function (datepickerObject) {
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

// TODO get default value from config by more priority

const nowUnix = persianDateToUnix(new persianDate());

const config = writable(defaultconfig);
const isDirty = writable(false);
const selectedUnix = writable(nowUnix);
const viewUnix = writable(nowUnix);
const viewMode = writable('date'); // [date, month, year]
const minUnix = writable(null);
const maxUnix = writable(null);
const dateObject = writable(persianDate);
const currentCalendar = writable('persian'); // [persian, gregorian]


const actions = {
  parsInitialValue (inputString) {
    let pd = get_store_value(dateObject);
    let parse = new PersianDateParser();
    if (parse.parse(inputString) !== undefined) {
        pd.toCalendar(get_store_value(config).initialValueType);
        let unix = new pd(parse.parse(inputString));
        this.updateIsDirty(true);
        viewUnix.set(unix.valueOf());
        this.setSelectedDate(unix);
        pd.toCalendar(get_store_value(config).calendarType);
    }
  },
  setFromDefaultValue (data) {
    this.parsInitialValue(data);
  },
  onSetCalendar (payload) {
    config.set({
      ...get_store_value(config),
      calendarType: payload
    });
    let currentLocale = get_store_value(config).calendar[payload].locale;
    let obj = persianDate;
    currentCalendar.set(payload);
    obj.toCalendar(payload);
    obj.toLocale(currentLocale);
    obj.toLeapYearMode(get_store_value(config).calendar.persian.leapYearMode);
    dateObject.set( obj );
    viewUnix.set(get_store_value(selectedUnix));
  },
  setConfig (payload) {
    config.set(payload);
    viewMode.set(payload.viewMode);
    this.onSetCalendar(get_store_value(config).calendarType);
  },
  onSelectTime (pDate) {
    const pd = get_store_value(dateObject);
    const date = pDate.detail;
    const { hour, minute, second } = getHourMinuteSecond(date);
    const calced = new pd(get_store_value(selectedUnix)).hour(hour).minute(minute).second(second);
    this.updateIsDirty(true);
    this.setSelectedDate(calced);
  },
  onSelectDate(pDate) {
    const pd = get_store_value(dateObject);
    const { hour, minute, second } = getHourMinuteSecond(get_store_value(selectedUnix));
    const date = new pd(pDate);
    const cashedDate = date.date();
    const cashedMonth = date.month();
    const cashedYear = date.year();
    date
      .hour(hour)
      .minute(minute)
      .second(second)
      .date(cashedDate)
      .month(cashedMonth)
      .year(cashedYear);
    this.setSelectedDate(date);
    this.updateIsDirty(true);
  },
  setSelectedDate(pDate) {
    const pd = get_store_value(dateObject);
    const unix = new pd(pDate).valueOf();
    selectedUnix.set(unix);
    this.setViewModeToLowerAvailableLevel();
    get_store_value(config).onSelect(unix);
  },
  onSelectMonth(month) {
    const pd = get_store_value(dateObject);
    viewUnix.set(
      new pd(get_store_value(viewUnix))
      .month(month)
      .valueOf()
    );
    if (!get_store_value(config).onlySelectOnDate) {
      this.setSelectedDate(
        new pd(get_store_value(viewUnix))
        .month(month)
      );
    }
    this.setViewModeToLowerAvailableLevel();
    this.updateIsDirty(true);
  },
  onSelectYear(year) {
    const pd = get_store_value(dateObject);
    viewUnix.set(
      new pd(get_store_value(selectedUnix))
      .year(year)
      .valueOf()
    );
    if (!get_store_value(config).onlySelectOnDate) {
      this.setSelectedDate(
        new pd(get_store_value(selectedUnix))
        .year(year)
      );
    }
    this.setViewModeToLowerAvailableLevel();
    this.updateIsDirty(true);
  },
  onSetHour(hour) {
    const pd = get_store_value(dateObject);
    this.setSelectedDate(
      new pd(get_store_value(selectedUnix))
      .hour(hour)
    );
    this.updateIsDirty(true);
  },
  onSetMinute(minute) {
    const pd = get_store_value(dateObject);
    this.setSelectedDate(
      new pd(get_store_value(selectedUnix))
      .minute(minute)
    );
    this.updateIsDirty(true);
  },
  setSecond(second) {
    const pd = get_store_value(dateObject);
    this.setSelectedDate(
      new pd(get_store_value(selectedUnix))
      .second(second)
    );
  },
  setViewMode(mode) {
    viewMode.set(mode);
  },
  setViewModeToUpperAvailableLevel() {
    let currentViewMode = get_store_value(viewMode);
    let $config = get_store_value(config);
    if (currentViewMode === 'time') {
       if ($config.dayPicker.enabled) {
         viewMode.set('day');
       } else if ($config.monthPicker.enabled) {
         viewMode.set('month');
       } else if ($config.yearPicker.enabled) {
         viewMode.set('year');
       }
    } else if (currentViewMode === 'day') {
       if ($config.monthPicker.enabled) {
         viewMode.set('month');
       } else if ($config.yearPicker.enabled) {
         viewMode.set('year');
       }
    } else if (currentViewMode === 'month') {
       if ($config.yearPicker.enabled) {
         viewMode.set('year');
       }
    }
  },
  setViewModeToLowerAvailableLevel() {
    let currentViewMode = get_store_value(viewMode);
    let $config = get_store_value(config);
    if (currentViewMode === 'year') {
       if ($config.monthPicker.enabled) {
         viewMode.set('month');
       } else if ($config.dayPicker.enabled) {
         viewMode.set('day');
       } else if ($config.timePicker.enabled) {
         viewMode.set('time');
       }
    } else if (currentViewMode === 'month') {
       if ($config.dayPicker.enabled) {
         viewMode.set('day');
       } else if ($config.timePicker.enabled) {
         viewMode.set('time');
       }
    } else if (currentViewMode === 'day') {
       if ($config.timePicker.enabled && $config.timePicker.showAsLastStep) {
         viewMode.set('time');
       }
    }
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
  onSelectNextView() {
    if (get_store_value(viewMode) === 'day') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('month', 1)));
    }
    if (get_store_value(viewMode) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('year', 1)));
    }
    if (get_store_value(viewMode) === 'year') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('year', 12)));
    }
  },
  onSelectPrevView() {
    if (get_store_value(viewMode) === 'day') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('month', 1)));
    }
    if (get_store_value(viewMode) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('year', 1)));
    }
    if (get_store_value(viewMode) === 'year') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('year', 12)));
    }
  },
  setViewUnix(pDate) {
    viewUnix.set(persianDateToUnix(pDate));
  },
  onSelectToday() {
    viewUnix.set(persianDateToUnix(new persianDate().startOf('day')));
  }
};

/* src/components/YearView.svelte generated by Svelte v3.15.0 */
const file = "src/components/YearView.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.year = list[i];
	return child_ctx;
}

// (1:0) {#if visible}
function create_if_block(ctx) {
	let div;
	let div_intro;
	let div_outro;
	let current;
	let each_value = ctx.yearRange;
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
			add_location(div, file, 1, 0, 14);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p: function update(changed, ctx) {
			if (changed.isDisable || changed.yearRange || changed.currentYear || changed.select) {
				each_value = ctx.yearRange;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
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
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (div_outro) div_outro.end(1);
				if (!div_intro) div_intro = create_in_transition(div, ctx.fadeIn, { duration: animateSpeed });
				div_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (div_intro) div_intro.invalidate();
			div_outro = create_out_transition(div, ctx.fadeOut, { duration: animateSpeed });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_each(each_blocks, detaching);
			if (detaching && div_outro) div_outro.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(1:0) {#if visible}",
		ctx
	});

	return block;
}

// (6:2) {#each yearRange as year}
function create_each_block(ctx) {
	let div;
	let span;
	let t0_value = ctx.year + "";
	let t0;
	let t1;
	let dispose;

	function click_handler(...args) {
		return ctx.click_handler(ctx, ...args);
	}

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			attr_dev(span, "class", "pwt-text");
			add_location(span, file, 10, 3, 325);
			toggle_class(div, "disable", ctx.isDisable(ctx.year));
			toggle_class(div, "selected", ctx.currentYear === ctx.year);
			add_location(div, file, 6, 4, 167);

			dispose = listen_dev(
				div,
				"click",
				function () {
					click_handler.apply(this, arguments);
				},
				false,
				false,
				false
			);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t0);
			append_dev(div, t1);
		},
		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			if (changed.yearRange && t0_value !== (t0_value = ctx.year + "")) set_data_dev(t0, t0_value);

			if (changed.isDisable || changed.yearRange) {
				toggle_class(div, "disable", ctx.isDisable(ctx.year));
			}

			if (changed.currentYear || changed.yearRange) {
				toggle_class(div, "selected", ctx.currentYear === ctx.year);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(6:2) {#each yearRange as year}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let if_block_anchor;
	let current;
	let if_block = ctx.visible && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
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

let animateSpeed = 100;

function instance($$self, $$props, $$invalidate) {
	let $config;
	let $dateObject;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));
	let { selectedUnix } = $$props;
	let { viewUnix } = $$props;

	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	function fadeIn(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${!transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	const isDisable = y => {
		let startYear;
		let endYear;

		if ($config.checkYear(y)) {
			if ($config.minDate && $config.maxDate) {
				startYear = new $dateObject($config.minDate).year();
				endYear = new $dateObject($config.maxDate).year();

				if (y > endYear || y < startYear) {
					return true;
				}
			} else if ($config.maxDate) {
				endYear = new $dateObject($config.maxDate).year();

				if (y > endYear) {
					return true;
				}
			} else if ($config.minDate) {
				startYear = new $dateObject($config.minDate).year();

				if (y < startYear) {
					return true;
				}
			}
		} else {
			return true;
		}
	};

	const dispatch = createEventDispatcher();

	function select(payload) {
		dispatch("select", payload);
	}

	let yearRange;
	let startYear;
	let visible = true;
	let cachedViewUnix = viewUnix;
	let transitionDirectionForward = true;
	const writable_props = ["selectedUnix", "viewUnix"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<YearView> was created with unknown prop '${key}'`);
	});

	const click_handler = ({ year }, event) => {
		if (!isDisable(year)) select(year);
	};

	$$self.$set = $$props => {
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
	};

	$$self.$capture_state = () => {
		return {
			selectedUnix,
			viewUnix,
			yearRange,
			startYear,
			visible,
			animateSpeed,
			cachedViewUnix,
			transitionDirectionForward,
			$config,
			$dateObject,
			currentYear,
			currentViewYear
		};
	};

	$$self.$inject_state = $$props => {
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("yearRange" in $$props) $$invalidate("yearRange", yearRange = $$props.yearRange);
		if ("startYear" in $$props) $$invalidate("startYear", startYear = $$props.startYear);
		if ("visible" in $$props) $$invalidate("visible", visible = $$props.visible);
		if ("animateSpeed" in $$props) $$invalidate("animateSpeed", animateSpeed = $$props.animateSpeed);
		if ("cachedViewUnix" in $$props) $$invalidate("cachedViewUnix", cachedViewUnix = $$props.cachedViewUnix);
		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
		if ("currentYear" in $$props) $$invalidate("currentYear", currentYear = $$props.currentYear);
		if ("currentViewYear" in $$props) $$invalidate("currentViewYear", currentViewYear = $$props.currentViewYear);
	};

	let currentYear;
	let currentViewYear;

	$$self.$$.update = (changed = { $dateObject: 1, selectedUnix: 1, viewUnix: 1, currentViewYear: 1, yearRange: 1, startYear: 1, cachedViewUnix: 1 }) => {
		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentYear", currentYear = new $dateObject(selectedUnix).year());
		}

		if (changed.$dateObject || changed.viewUnix) {
			 $$invalidate("currentViewYear", currentViewYear = new $dateObject(viewUnix).year());
		}

		if (changed.currentViewYear || changed.yearRange || changed.startYear || changed.viewUnix || changed.cachedViewUnix) {
			 {
				$$invalidate("yearRange", yearRange = []);
				$$invalidate("startYear", startYear = currentViewYear - currentViewYear % 12);
				let i = 0;

				while (i < 12) {
					yearRange.push(startYear + i);
					i++;
				}

				if (viewUnix > cachedViewUnix) {
					transitionDirectionForward = true;
				} else {
					transitionDirectionForward = false;
				}

				$$invalidate("cachedViewUnix", cachedViewUnix = viewUnix);
				$$invalidate("visible", visible = false);

				setTimeout(
					() => {
						$$invalidate("visible", visible = true);
					},
					200
				);
			}
		}
	};

	return {
		selectedUnix,
		viewUnix,
		fadeOut,
		fadeIn,
		isDisable,
		select,
		yearRange,
		visible,
		currentYear,
		click_handler
	};
}

class YearView extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { selectedUnix: 0, viewUnix: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "YearView",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.selectedUnix === undefined && !("selectedUnix" in props)) {
			console.warn("<YearView> was created without expected prop 'selectedUnix'");
		}

		if (ctx.viewUnix === undefined && !("viewUnix" in props)) {
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

/* src/components/MonthView.svelte generated by Svelte v3.15.0 */
const file$1 = "src/components/MonthView.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.month = list[i];
	child_ctx.index = i;
	return child_ctx;
}

// (1:0) {#if visible}
function create_if_block$1(ctx) {
	let div;
	let div_intro;
	let div_outro;
	let current;
	let each_value = ctx.monthRange;
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
			add_location(div, file$1, 1, 1, 15);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p: function update(changed, ctx) {
			if (changed.isDisable || changed.currentViewYear || changed.currentMonth || changed.currentSelectedYear || changed.select || changed.monthRange) {
				each_value = ctx.monthRange;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
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
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (div_outro) div_outro.end(1);
				if (!div_intro) div_intro = create_in_transition(div, ctx.fadeIn, { duration: animateSpeed$1 });
				div_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (div_intro) div_intro.invalidate();
			div_outro = create_out_transition(div, ctx.fadeOut, { duration: animateSpeed$1 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_each(each_blocks, detaching);
			if (detaching && div_outro) div_outro.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(1:0) {#if visible}",
		ctx
	});

	return block;
}

// (6:2) {#each monthRange as month, index}
function create_each_block$1(ctx) {
	let div;
	let span;
	let t0_value = ctx.month + "";
	let t0;
	let t1;
	let dispose;

	function click_handler(...args) {
		return ctx.click_handler(ctx, ...args);
	}

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			attr_dev(span, "class", "pwt-text");
			add_location(span, file$1, 10, 4, 436);
			toggle_class(div, "disable", ctx.isDisable(ctx.currentViewYear, ctx.index + 1));
			toggle_class(div, "selected", ctx.currentMonth - 1 === ctx.index && ctx.currentViewYear === ctx.currentSelectedYear);
			add_location(div, file$1, 6, 3, 178);

			dispose = listen_dev(
				div,
				"click",
				function () {
					click_handler.apply(this, arguments);
				},
				false,
				false,
				false
			);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t0);
			append_dev(div, t1);
		},
		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			if (changed.monthRange && t0_value !== (t0_value = ctx.month + "")) set_data_dev(t0, t0_value);

			if (changed.isDisable || changed.currentViewYear) {
				toggle_class(div, "disable", ctx.isDisable(ctx.currentViewYear, ctx.index + 1));
			}

			if (changed.currentMonth || changed.currentViewYear || changed.currentSelectedYear) {
				toggle_class(div, "selected", ctx.currentMonth - 1 === ctx.index && ctx.currentViewYear === ctx.currentSelectedYear);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(6:2) {#each monthRange as month, index}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = ctx.visible && create_if_block$1(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
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

let animateSpeed$1 = 100;

function instance$1($$self, $$props, $$invalidate) {
	let $config;
	let $dateObject;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));
	let { selectedUnix } = $$props;
	let { viewUnix } = $$props;

	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	function fadeIn(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${!transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	const isDisable = (y, month) => {
		let startYear;
		let startMonth;
		let endYear;
		let endMonth;

		if ($config.checkMonth(y, month)) {
			if ($config.minDate && $config.maxDate) {
				startYear = new $dateObject($config.minDate).year();
				startMonth = new $dateObject($config.minDate).month();
				endYear = new $dateObject($config.maxDate).year();
				endMonth = new $dateObject($config.maxDate).month();

				if (y == endYear && month > endMonth || y > endYear || (y == startYear && month < startMonth || y < startYear)) {
					return true;
				}
			} else if ($config.maxDate) {
				endYear = new $dateObject($config.maxDate).year();
				endMonth = new $dateObject($config.maxDate).month();

				if (y == endYear && month > endMonth || y > endYear) {
					return true;
				}
			} else if ($config.minDate) {
				startYear = new $dateObject($config.minDate).year();
				startMonth = new $dateObject($config.minDate).month();

				if (y == startYear && month < startMonth || y < startYear) {
					return true;
				}
			}
		} else {
			return true;
		}
	};

	const dispatch = createEventDispatcher();

	function select(payload) {
		dispatch("select", payload);
	}

	let visible = true;
	let cachedViewUnix = viewUnix;
	let transitionDirectionForward = true;
	const writable_props = ["selectedUnix", "viewUnix"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MonthView> was created with unknown prop '${key}'`);
	});

	const click_handler = ({ index }, event) => {
		if (!isDisable(currentViewYear, index + 1)) select(index + 1);
	};

	$$self.$set = $$props => {
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
	};

	$$self.$capture_state = () => {
		return {
			selectedUnix,
			viewUnix,
			visible,
			animateSpeed: animateSpeed$1,
			cachedViewUnix,
			transitionDirectionForward,
			$config,
			$dateObject,
			monthRange,
			currentMonth,
			currentSelectedYear,
			currentViewYear
		};
	};

	$$self.$inject_state = $$props => {
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("visible" in $$props) $$invalidate("visible", visible = $$props.visible);
		if ("animateSpeed" in $$props) $$invalidate("animateSpeed", animateSpeed$1 = $$props.animateSpeed);
		if ("cachedViewUnix" in $$props) $$invalidate("cachedViewUnix", cachedViewUnix = $$props.cachedViewUnix);
		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
		if ("monthRange" in $$props) $$invalidate("monthRange", monthRange = $$props.monthRange);
		if ("currentMonth" in $$props) $$invalidate("currentMonth", currentMonth = $$props.currentMonth);
		if ("currentSelectedYear" in $$props) $$invalidate("currentSelectedYear", currentSelectedYear = $$props.currentSelectedYear);
		if ("currentViewYear" in $$props) $$invalidate("currentViewYear", currentViewYear = $$props.currentViewYear);
	};

	let monthRange;
	let currentMonth;
	let currentSelectedYear;
	let currentViewYear;

	$$self.$$.update = (changed = { $dateObject: 1, selectedUnix: 1, viewUnix: 1, cachedViewUnix: 1 }) => {
		if (changed.$dateObject) {
			 $$invalidate("monthRange", monthRange = new $dateObject().rangeName().months);
		}

		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentMonth", currentMonth = new $dateObject(selectedUnix).month());
		}

		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentSelectedYear", currentSelectedYear = new $dateObject(selectedUnix).year());
		}

		if (changed.$dateObject || changed.viewUnix) {
			 $$invalidate("currentViewYear", currentViewYear = new $dateObject(viewUnix).year());
		}

		if (changed.viewUnix || changed.cachedViewUnix) {
			 {
				if (viewUnix > cachedViewUnix) {
					transitionDirectionForward = true;
				} else {
					transitionDirectionForward = false;
				}

				$$invalidate("cachedViewUnix", cachedViewUnix = viewUnix);
				$$invalidate("visible", visible = false);

				setTimeout(
					() => {
						$$invalidate("visible", visible = true);
					},
					200
				);
			}
		}
	};

	return {
		selectedUnix,
		viewUnix,
		fadeOut,
		fadeIn,
		isDisable,
		select,
		visible,
		monthRange,
		currentMonth,
		currentSelectedYear,
		currentViewYear,
		click_handler
	};
}

class MonthView extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { selectedUnix: 0, viewUnix: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MonthView",
			options,
			id: create_fragment$1.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.selectedUnix === undefined && !("selectedUnix" in props)) {
			console.warn("<MonthView> was created without expected prop 'selectedUnix'");
		}

		if (ctx.viewUnix === undefined && !("viewUnix" in props)) {
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

/* src/components/DateView.svelte generated by Svelte v3.15.0 */
const file$2 = "src/components/DateView.svelte";

function get_each_context_1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.day = list[i];
	return child_ctx;
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.week = list[i];
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.day = list[i];
	return child_ctx;
}

// (6:3) {#if groupedDay[1]}
function create_if_block_4(ctx) {
	let each_1_anchor;
	let each_value_2 = ctx.groupedDay[1];
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
		p: function update(changed, ctx) {
			if (changed.groupedDay) {
				each_value_2 = ctx.groupedDay[1];
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
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
		id: create_if_block_4.name,
		type: "if",
		source: "(6:3) {#if groupedDay[1]}",
		ctx
	});

	return block;
}

// (7:4) {#each groupedDay[1] as day}
function create_each_block_2(ctx) {
	let th;
	let span;
	let t0_value = ctx.day.format("ddd") + "";
	let t0;
	let t1;

	const block = {
		c: function create() {
			th = element("th");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			add_location(span, file$2, 8, 6, 158);
			add_location(th, file$2, 7, 5, 147);
		},
		m: function mount(target, anchor) {
			insert_dev(target, th, anchor);
			append_dev(th, span);
			append_dev(span, t0);
			append_dev(th, t1);
		},
		p: function update(changed, ctx) {
			if (changed.groupedDay && t0_value !== (t0_value = ctx.day.format("ddd") + "")) set_data_dev(t0, t0_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(th);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_2.name,
		type: "each",
		source: "(7:4) {#each groupedDay[1] as day}",
		ctx
	});

	return block;
}

// (16:2) {#if visible}
function create_if_block$2(ctx) {
	let each_1_anchor;
	let current;
	let each_value = ctx.groupedDay;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

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
			current = true;
		},
		p: function update(changed, ctx) {
			if (changed.groupedDay || changed.isDisable || changed.checkDate || changed.isSameDate || changed.selectedDay || changed.today || changed.currentViewMonth || changed.selectDate || changed.$config || changed.getHintText) {
				each_value = ctx.groupedDay;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(16:2) {#if visible}",
		ctx
	});

	return block;
}

// (21:5) {#if week.length > 1}
function create_if_block_1(ctx) {
	let each_1_anchor;
	let each_value_1 = ctx.week;
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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
		p: function update(changed, ctx) {
			if (changed.groupedDay || changed.isDisable || changed.checkDate || changed.isSameDate || changed.selectedDay || changed.today || changed.currentViewMonth || changed.selectDate || changed.$config || changed.getHintText) {
				each_value_1 = ctx.week;
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(21:5) {#if week.length > 1}",
		ctx
	});

	return block;
}

// (30:8) {#if day && day.month && day.format && currentViewMonth === day.month()}
function create_if_block_2(ctx) {
	let span;
	let t0_value = ctx.day.format("D") + "";
	let t0;
	let t1;
	let if_block_anchor;
	let if_block = ctx.$config.calendar[ctx.$config.calendarType].showHint && create_if_block_3(ctx);

	const block = {
		c: function create() {
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr_dev(span, "class", "pwt-date-view-text");
			add_location(span, file$2, 30, 9, 970);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t0);
			insert_dev(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(changed, ctx) {
			if (changed.groupedDay && t0_value !== (t0_value = ctx.day.format("D") + "")) set_data_dev(t0, t0_value);

			if (ctx.$config.calendar[ctx.$config.calendarType].showHint) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_3(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
			if (detaching) detach_dev(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(30:8) {#if day && day.month && day.format && currentViewMonth === day.month()}",
		ctx
	});

	return block;
}

// (34:9) {#if $config.calendar[$config.calendarType].showHint}
function create_if_block_3(ctx) {
	let span;
	let t_value = ctx.getHintText(ctx.day) + "";
	let t;

	const block = {
		c: function create() {
			span = element("span");
			t = text(t_value);
			attr_dev(span, "class", "pwt-date-view-hint");
			add_location(span, file$2, 34, 10, 1122);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t);
		},
		p: function update(changed, ctx) {
			if (changed.groupedDay && t_value !== (t_value = ctx.getHintText(ctx.day) + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(34:9) {#if $config.calendar[$config.calendarType].showHint}",
		ctx
	});

	return block;
}

// (22:6) {#each week as day}
function create_each_block_1(ctx) {
	let td;
	let show_if = ctx.day && ctx.day.month && ctx.day.format && ctx.currentViewMonth === ctx.day.month();
	let t;
	let dispose;
	let if_block = show_if && create_if_block_2(ctx);

	function click_handler(...args) {
		return ctx.click_handler(ctx, ...args);
	}

	const block = {
		c: function create() {
			td = element("td");
			if (if_block) if_block.c();
			t = space();
			toggle_class(td, "othermonth", !ctx.day.month);
			toggle_class(td, "disable", ctx.isDisable(ctx.day) || !ctx.checkDate(ctx.day));
			toggle_class(td, "selected", ctx.day && ctx.day.isPersianDate && ctx.isSameDate(ctx.day.valueOf(), ctx.selectedDay));
			toggle_class(td, "today", ctx.day && ctx.day.isPersianDate && ctx.isSameDate(ctx.day.valueOf(), ctx.today));
			add_location(td, file$2, 22, 7, 456);

			dispose = listen_dev(
				td,
				"click",
				function () {
					click_handler.apply(this, arguments);
				},
				false,
				false,
				false
			);
		},
		m: function mount(target, anchor) {
			insert_dev(target, td, anchor);
			if (if_block) if_block.m(td, null);
			append_dev(td, t);
		},
		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			if (changed.groupedDay || changed.currentViewMonth) show_if = ctx.day && ctx.day.month && ctx.day.format && ctx.currentViewMonth === ctx.day.month();

			if (show_if) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_2(ctx);
					if_block.c();
					if_block.m(td, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (changed.groupedDay) {
				toggle_class(td, "othermonth", !ctx.day.month);
			}

			if (changed.isDisable || changed.groupedDay || changed.checkDate) {
				toggle_class(td, "disable", ctx.isDisable(ctx.day) || !ctx.checkDate(ctx.day));
			}

			if (changed.groupedDay || changed.isSameDate || changed.selectedDay) {
				toggle_class(td, "selected", ctx.day && ctx.day.isPersianDate && ctx.isSameDate(ctx.day.valueOf(), ctx.selectedDay));
			}

			if (changed.groupedDay || changed.isSameDate || changed.today) {
				toggle_class(td, "today", ctx.day && ctx.day.isPersianDate && ctx.isSameDate(ctx.day.valueOf(), ctx.today));
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(td);
			if (if_block) if_block.d();
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(22:6) {#each week as day}",
		ctx
	});

	return block;
}

// (17:3) {#each groupedDay as week, i}
function create_each_block$2(ctx) {
	let tr;
	let t;
	let tr_intro;
	let tr_outro;
	let current;
	let if_block = ctx.week.length > 1 && create_if_block_1(ctx);

	const block = {
		c: function create() {
			tr = element("tr");
			if (if_block) if_block.c();
			t = space();
			add_location(tr, file$2, 17, 4, 299);
		},
		m: function mount(target, anchor) {
			insert_dev(target, tr, anchor);
			if (if_block) if_block.m(tr, null);
			append_dev(tr, t);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.week.length > 1) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(tr, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (tr_outro) tr_outro.end(1);
				if (!tr_intro) tr_intro = create_in_transition(tr, ctx.fadeIn, { duration: animateSpeed$2 });
				tr_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (tr_intro) tr_intro.invalidate();
			tr_outro = create_out_transition(tr, ctx.fadeOut, { duration: animateSpeed$2 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(tr);
			if (if_block) if_block.d();
			if (detaching && tr_outro) tr_outro.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$2.name,
		type: "each",
		source: "(17:3) {#each groupedDay as week, i}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let div;
	let table;
	let tr;
	let t;
	let current;
	let if_block0 = ctx.groupedDay[1] && create_if_block_4(ctx);
	let if_block1 = ctx.visible && create_if_block$2(ctx);

	const block = {
		c: function create() {
			div = element("div");
			table = element("table");
			tr = element("tr");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			add_location(tr, file$2, 4, 2, 81);
			attr_dev(table, "class", "month-table next");
			attr_dev(table, "border", "0");
			add_location(table, file$2, 1, 1, 29);
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
			if (if_block0) if_block0.m(tr, null);
			append_dev(table, t);
			if (if_block1) if_block1.m(table, null);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.groupedDay[1]) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_4(ctx);
					if_block0.c();
					if_block0.m(tr, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.visible) {
				if (if_block1) {
					if_block1.p(changed, ctx);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block$2(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(table, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block1);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
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

let animateSpeed$2 = 100;

function instance$2($$self, $$props, $$invalidate) {
	let $dateObject;
	let $config;
	let $currentCalendar;
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(currentCalendar, "currentCalendar");
	component_subscribe($$self, currentCalendar, $$value => $$invalidate("$currentCalendar", $currentCalendar = $$value));

	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	function fadeIn(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${!transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	const isSameDate = (a, b) => {
		return new $dateObject(a).isSameDay(b);
	};

	const checkDate = day => {
		return day.valueOf && $config.checkDate(day.valueOf());
	};

	const isDisable = day => {
		if (day.valueOf) {
			let unixtimespan = day.valueOf();

			if ($config.minDate && $config.maxDate) {
				if (!(unixtimespan >= $config.minDate && unixtimespan <= $config.maxDate)) {
					return true;
				}
			} else if ($config.minDate) {
				if (unixtimespan <= $config.minDate) {
					return true;
				}
			} else if ($config.maxDate) {
				if (unixtimespan >= $config.maxDate) {
					return true;
				}
			}
		}
	};

	let { viewUnix } = $$props;
	let { selectedUnix } = $$props;
	let { todayUnix } = $$props;
	const dispatch = createEventDispatcher();

	function selectDate(payload) {
		dispatch("selectDate", payload);
	}

	const getHintText = function (day) {
		let out;

		if ($currentCalendar === "persian") {
			$dateObject.toCalendar("gregorian");
			out = new $dateObject(day.valueOf()).format("D");
			$dateObject.toCalendar("persian");
		}

		if ($currentCalendar === "gregorian") {
			$dateObject.toCalendar("persian");
			out = new $dateObject(day.valueOf()).format("D");
			$dateObject.toCalendar("gregorian");
		}

		return out;
	};

	let groupedDay = [];
	let visible = true;
	let cachedViewUnix = viewUnix;
	let transitionDirectionForward = true;
	const writable_props = ["viewUnix", "selectedUnix", "todayUnix"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DateView> was created with unknown prop '${key}'`);
	});

	const click_handler = ({ day }, event) => {
		if (!isDisable(day) && day.month && currentViewMonth === day.month()) selectDate(day.valueOf());
	};

	$$self.$set = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("todayUnix" in $$props) $$invalidate("todayUnix", todayUnix = $$props.todayUnix);
	};

	$$self.$capture_state = () => {
		return {
			viewUnix,
			selectedUnix,
			todayUnix,
			groupedDay,
			visible,
			animateSpeed: animateSpeed$2,
			cachedViewUnix,
			transitionDirectionForward,
			$dateObject,
			$config,
			selectedDay,
			$currentCalendar,
			today,
			currentViewMonth
		};
	};

	$$self.$inject_state = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("todayUnix" in $$props) $$invalidate("todayUnix", todayUnix = $$props.todayUnix);
		if ("groupedDay" in $$props) $$invalidate("groupedDay", groupedDay = $$props.groupedDay);
		if ("visible" in $$props) $$invalidate("visible", visible = $$props.visible);
		if ("animateSpeed" in $$props) $$invalidate("animateSpeed", animateSpeed$2 = $$props.animateSpeed);
		if ("cachedViewUnix" in $$props) $$invalidate("cachedViewUnix", cachedViewUnix = $$props.cachedViewUnix);
		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("selectedDay" in $$props) $$invalidate("selectedDay", selectedDay = $$props.selectedDay);
		if ("$currentCalendar" in $$props) currentCalendar.set($currentCalendar = $$props.$currentCalendar);
		if ("today" in $$props) $$invalidate("today", today = $$props.today);
		if ("currentViewMonth" in $$props) $$invalidate("currentViewMonth", currentViewMonth = $$props.currentViewMonth);
	};

	let selectedDay;
	let today;
	let currentViewMonth;

	$$self.$$.update = (changed = { $dateObject: 1, selectedUnix: 1, todayUnix: 1, viewUnix: 1, $config: 1, startVisualDelta: 1, groupedDay: 1, cachedViewUnix: 1 }) => {
		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("selectedDay", selectedDay = new $dateObject(selectedUnix).startOf("day"));
		}

		if (changed.$dateObject || changed.todayUnix) {
			 $$invalidate("today", today = new $dateObject(todayUnix));
		}

		if (changed.$dateObject || changed.viewUnix) {
			 $$invalidate("currentViewMonth", currentViewMonth = new $dateObject(viewUnix).month());
		}

		if (changed.$dateObject || changed.viewUnix || changed.$config || changed.groupedDay || changed.cachedViewUnix) {
			 {
				$$invalidate("groupedDay", groupedDay = []);
				let days = [];
				let dateObj = new $dateObject(viewUnix);
				$dateObject.toCalendar("persian");
				let day = dateObj.startOf("month");
				let daysInMonth = dateObj.daysInMonth();
				let startVisualDelta = dateObj.startOf("month").day();

				if ($config.calendarType === "persian") {
					startVisualDelta -= 1;
				}

				let endVisualDelta = 8 - dateObj.endOf("month").day();
				let firstVisualDate = day.subtract("day", startVisualDelta);
				let startDateOfView = day.subtract("day", startVisualDelta);
				let j = 0;

				if (startVisualDelta < 7) {
					while (j < startVisualDelta) {
						days.push({});
						j++;
					}
				}

				let i = 0;

				while (i < daysInMonth) {
					days.push(new $dateObject([day.year(), day.month(), day.date() + i]));
					i++;
				}

				let f = 0;

				while (f < endVisualDelta) {
					days.push({});
					f++;
				}

				let weekindex = 0;

				days.forEach((item, index) => {
					if (index % 7 == 0) {
						$$invalidate("groupedDay", groupedDay[weekindex] = [], groupedDay);
					}

					groupedDay[weekindex].push(item);

					if (index % 7 == 6) {
						weekindex++;
					}
				});

				if (viewUnix > cachedViewUnix) {
					transitionDirectionForward = true;
				} else {
					transitionDirectionForward = false;
				}

				$$invalidate("cachedViewUnix", cachedViewUnix = viewUnix);

				if (viewUnix) {
					$$invalidate("visible", visible = false);

					setTimeout(
						() => {
							$$invalidate("visible", visible = true);
						},
						200
					);
				}
			}
		}
	};

	return {
		fadeOut,
		fadeIn,
		isSameDate,
		checkDate,
		isDisable,
		viewUnix,
		selectedUnix,
		todayUnix,
		selectDate,
		getHintText,
		groupedDay,
		visible,
		$config,
		selectedDay,
		today,
		currentViewMonth,
		click_handler
	};
}

class DateView extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
			viewUnix: 0,
			selectedUnix: 0,
			todayUnix: 0
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "DateView",
			options,
			id: create_fragment$2.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.viewUnix === undefined && !("viewUnix" in props)) {
			console.warn("<DateView> was created without expected prop 'viewUnix'");
		}

		if (ctx.selectedUnix === undefined && !("selectedUnix" in props)) {
			console.warn("<DateView> was created without expected prop 'selectedUnix'");
		}

		if (ctx.todayUnix === undefined && !("todayUnix" in props)) {
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

/* src/components/TimeView.svelte generated by Svelte v3.15.0 */
const file$3 = "src/components/TimeView.svelte";

// (2:1) {#if $config.timePicker.hour.enabled}
function create_if_block_3$1(ctx) {
	let div;
	let button0;
	let svg0;
	let path0;
	let t0;
	let span;
	let t1;
	let t2;
	let button1;
	let svg1;
	let path1;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			button0 = element("button");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t0 = space();
			span = element("span");
			t1 = text(ctx.currentHour);
			t2 = space();
			button1 = element("button");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z");
			add_location(path0, file$3, 10, 5, 301);
			attr_dev(svg0, "width", "12");
			attr_dev(svg0, "height", "12");
			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
			add_location(svg0, file$3, 6, 4, 220);
			attr_dev(button0, "class", "pwt-date-time-arrow");
			add_location(button0, file$3, 3, 3, 127);
			add_location(span, file$3, 15, 3, 586);
			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
			add_location(path1, file$3, 25, 5, 802);
			attr_dev(svg1, "width", "12");
			attr_dev(svg1, "height", "12");
			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
			add_location(svg1, file$3, 21, 4, 722);
			attr_dev(button1, "class", "pwt-date-time-arrow");
			add_location(button1, file$3, 18, 3, 627);
			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-hour");
			add_location(div, file$3, 2, 2, 69);

			dispose = [
				listen_dev(button0, "click", ctx.click_handler, false, false, false),
				listen_dev(button1, "click", ctx.click_handler_1, false, false, false)
			];
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, button0);
			append_dev(button0, svg0);
			append_dev(svg0, path0);
			append_dev(div, t0);
			append_dev(div, span);
			append_dev(span, t1);
			append_dev(div, t2);
			append_dev(div, button1);
			append_dev(button1, svg1);
			append_dev(svg1, path1);
		},
		p: function update(changed, ctx) {
			if (changed.currentHour) set_data_dev(t1, ctx.currentHour);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$1.name,
		type: "if",
		source: "(2:1) {#if $config.timePicker.hour.enabled}",
		ctx
	});

	return block;
}

// (33:1) {#if $config.timePicker.minute.enabled}
function create_if_block_2$1(ctx) {
	let div;
	let button0;
	let svg0;
	let path0;
	let t0;
	let span;
	let t1;
	let t2;
	let button1;
	let svg1;
	let path1;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			button0 = element("button");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t0 = space();
			span = element("span");
			t1 = text(ctx.currentMinute);
			t2 = space();
			button1 = element("button");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\tL129.007,57.819z");
			add_location(path0, file$3, 41, 4, 1401);
			attr_dev(svg0, "width", "12");
			attr_dev(svg0, "height", "12");
			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
			add_location(svg0, file$3, 37, 3, 1324);
			attr_dev(button0, "class", "pwt-date-time-arrow");
			add_location(button0, file$3, 34, 2, 1232);
			add_location(span, file$3, 46, 2, 1681);
			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
			add_location(path1, file$3, 56, 4, 1891);
			attr_dev(svg1, "width", "12");
			attr_dev(svg1, "height", "12");
			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
			add_location(svg1, file$3, 52, 3, 1815);
			attr_dev(button1, "class", "pwt-date-time-arrow");
			add_location(button1, file$3, 49, 2, 1721);
			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-minute");
			add_location(div, file$3, 33, 1, 1173);

			dispose = [
				listen_dev(button0, "click", ctx.click_handler_2, false, false, false),
				listen_dev(button1, "click", ctx.click_handler_3, false, false, false)
			];
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, button0);
			append_dev(button0, svg0);
			append_dev(svg0, path0);
			append_dev(div, t0);
			append_dev(div, span);
			append_dev(span, t1);
			append_dev(div, t2);
			append_dev(div, button1);
			append_dev(button1, svg1);
			append_dev(svg1, path1);
		},
		p: function update(changed, ctx) {
			if (changed.currentMinute) set_data_dev(t1, ctx.currentMinute);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$1.name,
		type: "if",
		source: "(33:1) {#if $config.timePicker.minute.enabled}",
		ctx
	});

	return block;
}

// (64:1) {#if $config.timePicker.second.enabled}
function create_if_block_1$1(ctx) {
	let div;
	let button0;
	let svg0;
	let path0;
	let t0;
	let span;
	let t1;
	let t2;
	let button1;
	let svg1;
	let path1;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			button0 = element("button");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t0 = space();
			span = element("span");
			t1 = text(ctx.currentSecond);
			t2 = space();
			button1 = element("button");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\tL129.007,57.819z");
			add_location(path0, file$3, 72, 4, 2485);
			attr_dev(svg0, "width", "12");
			attr_dev(svg0, "height", "12");
			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
			add_location(svg0, file$3, 68, 3, 2408);
			attr_dev(button0, "class", "pwt-date-time-arrow");
			add_location(button0, file$3, 65, 2, 2316);
			add_location(span, file$3, 77, 2, 2765);
			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
			add_location(path1, file$3, 87, 4, 2975);
			attr_dev(svg1, "width", "12");
			attr_dev(svg1, "height", "12");
			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
			add_location(svg1, file$3, 83, 3, 2899);
			attr_dev(button1, "class", "pwt-date-time-arrow");
			add_location(button1, file$3, 80, 2, 2805);
			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-second");
			add_location(div, file$3, 64, 1, 2257);

			dispose = [
				listen_dev(button0, "click", ctx.click_handler_4, false, false, false),
				listen_dev(button1, "click", ctx.click_handler_5, false, false, false)
			];
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, button0);
			append_dev(button0, svg0);
			append_dev(svg0, path0);
			append_dev(div, t0);
			append_dev(div, span);
			append_dev(span, t1);
			append_dev(div, t2);
			append_dev(div, button1);
			append_dev(button1, svg1);
			append_dev(svg1, path1);
		},
		p: function update(changed, ctx) {
			if (changed.currentSecond) set_data_dev(t1, ctx.currentSecond);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(64:1) {#if $config.timePicker.second.enabled}",
		ctx
	});

	return block;
}

// (95:1) {#if $config.timePicker.meridian.enabled}
function create_if_block$3(ctx) {
	let div;
	let button0;
	let svg0;
	let path0;
	let t0;
	let span;
	let t1;
	let t2;
	let button1;
	let svg1;
	let path1;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			button0 = element("button");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t0 = space();
			span = element("span");
			t1 = text(ctx.currentMeridian);
			t2 = space();
			button1 = element("button");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\tL129.007,57.819z");
			add_location(path0, file$3, 103, 4, 3574);
			attr_dev(svg0, "width", "12");
			attr_dev(svg0, "height", "12");
			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
			add_location(svg0, file$3, 99, 3, 3497);
			attr_dev(button0, "class", "pwt-date-time-arrow");
			add_location(button0, file$3, 96, 2, 3404);
			add_location(span, file$3, 108, 2, 3854);
			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
			add_location(path1, file$3, 118, 4, 4068);
			attr_dev(svg1, "width", "12");
			attr_dev(svg1, "height", "12");
			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
			add_location(svg1, file$3, 114, 3, 3992);
			attr_dev(button1, "class", "pwt-date-time-arrow");
			add_location(button1, file$3, 111, 2, 3896);
			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-meridian");
			add_location(div, file$3, 95, 1, 3343);

			dispose = [
				listen_dev(button0, "click", ctx.click_handler_6, false, false, false),
				listen_dev(button1, "click", ctx.click_handler_7, false, false, false)
			];
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, button0);
			append_dev(button0, svg0);
			append_dev(svg0, path0);
			append_dev(div, t0);
			append_dev(div, span);
			append_dev(span, t1);
			append_dev(div, t2);
			append_dev(div, button1);
			append_dev(button1, svg1);
			append_dev(svg1, path1);
		},
		p: function update(changed, ctx) {
			if (changed.currentMeridian) set_data_dev(t1, ctx.currentMeridian);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(95:1) {#if $config.timePicker.meridian.enabled}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let div;
	let t0;
	let t1;
	let t2;
	let if_block0 = ctx.$config.timePicker.hour.enabled && create_if_block_3$1(ctx);
	let if_block1 = ctx.$config.timePicker.minute.enabled && create_if_block_2$1(ctx);
	let if_block2 = ctx.$config.timePicker.second.enabled && create_if_block_1$1(ctx);
	let if_block3 = ctx.$config.timePicker.meridian.enabled && create_if_block$3(ctx);

	const block = {
		c: function create() {
			div = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			attr_dev(div, "class", "pwt-date-time");
			add_location(div, file$3, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append_dev(div, t0);
			if (if_block1) if_block1.m(div, null);
			append_dev(div, t1);
			if (if_block2) if_block2.m(div, null);
			append_dev(div, t2);
			if (if_block3) if_block3.m(div, null);
		},
		p: function update(changed, ctx) {
			if (ctx.$config.timePicker.hour.enabled) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_3$1(ctx);
					if_block0.c();
					if_block0.m(div, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.$config.timePicker.minute.enabled) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_2$1(ctx);
					if_block1.c();
					if_block1.m(div, t1);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (ctx.$config.timePicker.second.enabled) {
				if (if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2 = create_if_block_1$1(ctx);
					if_block2.c();
					if_block2.m(div, t2);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (ctx.$config.timePicker.meridian.enabled) {
				if (if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3 = create_if_block$3(ctx);
					if_block3.c();
					if_block3.m(div, null);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
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
	let $dateObject;
	let $config;
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	const dispatch = createEventDispatcher();
	let { selectedUnix } = $$props;
	let tempDate = $dateObject;

	const updateTime = function (mode, direction) {
		let selectedObj = new $dateObject(selectedUnix);

		if (mode === "meridian") {
			if (currentGregorianMeridian === "PM") {
				selectedObj = selectedObj.add("hour", 12).clone();
			} else {
				selectedObj = selectedObj.subtract("hour", 12).clone();
			}
		} else {
			let step = $config.timePicker[mode].step
			? $config.timePicker[mode].step
			: $config.timePicker.step;

			if (direction === "up") {
				selectedObj = selectedObj.add(mode, step).clone();
			} else {
				selectedObj = selectedObj.subtract(mode, step).clone();
			}
		}

		selectDate(selectedObj);
	};

	function selectDate(payload) {
		dispatch("selectTime", payload);
	}

	const writable_props = ["selectedUnix"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimeView> was created with unknown prop '${key}'`);
	});

	const click_handler = () => updateTime("hour", "up");
	const click_handler_1 = () => updateTime("hour", "down");
	const click_handler_2 = () => updateTime("minute", "up");
	const click_handler_3 = () => updateTime("minute", "down");
	const click_handler_4 = () => updateTime("second", "up");
	const click_handler_5 = () => updateTime("second", "down");
	const click_handler_6 = () => updateTime("meridian", "up");
	const click_handler_7 = () => updateTime("meridian", "down");

	$$self.$set = $$props => {
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
	};

	$$self.$capture_state = () => {
		return {
			selectedUnix,
			tempDate,
			currentHour,
			$dateObject,
			currentMinute,
			currentSecond,
			currentMeridian,
			currentGregorianMeridian,
			$config
		};
	};

	$$self.$inject_state = $$props => {
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("tempDate" in $$props) $$invalidate("tempDate", tempDate = $$props.tempDate);
		if ("currentHour" in $$props) $$invalidate("currentHour", currentHour = $$props.currentHour);
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
		if ("currentMinute" in $$props) $$invalidate("currentMinute", currentMinute = $$props.currentMinute);
		if ("currentSecond" in $$props) $$invalidate("currentSecond", currentSecond = $$props.currentSecond);
		if ("currentMeridian" in $$props) $$invalidate("currentMeridian", currentMeridian = $$props.currentMeridian);
		if ("currentGregorianMeridian" in $$props) currentGregorianMeridian = $$props.currentGregorianMeridian;
		if ("$config" in $$props) config.set($config = $$props.$config);
	};

	let currentHour;
	let currentMinute;
	let currentSecond;
	let currentMeridian;
	let currentGregorianMeridian;

	$$self.$$.update = (changed = { $dateObject: 1, selectedUnix: 1, tempDate: 1 }) => {
		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentHour", currentHour = new $dateObject(selectedUnix).format("hh"));
		}

		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentMinute", currentMinute = new $dateObject(selectedUnix).format("mm"));
		}

		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentSecond", currentSecond = new $dateObject(selectedUnix).format("ss"));
		}

		if (changed.$dateObject || changed.selectedUnix) {
			 $$invalidate("currentMeridian", currentMeridian = new $dateObject(selectedUnix).format("a"));
		}

		if (changed.tempDate || changed.selectedUnix) {
			 currentGregorianMeridian = new tempDate(selectedUnix).toLocale("en").format("a");
		}
	};

	return {
		selectedUnix,
		updateTime,
		currentHour,
		currentMinute,
		currentSecond,
		currentMeridian,
		$config,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4,
		click_handler_5,
		click_handler_6,
		click_handler_7
	};
}

class TimeView extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { selectedUnix: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "TimeView",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.selectedUnix === undefined && !("selectedUnix" in props)) {
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

/* src/components/Navigator.svelte generated by Svelte v3.15.0 */
const file$4 = "src/components/Navigator.svelte";

// (2:0) {#if viewMode !== 'time'}
function create_if_block_8(ctx) {
	let button0;
	let svg0;
	let path0;
	let t;
	let button1;
	let svg1;
	let path1;
	let dispose;

	const block = {
		c: function create() {
			button0 = element("button");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t = space();
			button1 = element("button");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			attr_dev(path0, "d", "M5.649,24c-0.143,0-0.279-0.061-0.374-0.168c-0.183-0.207-0.163-0.524,0.043-0.706L17.893,12L5.318,0.875\n\t\t\t\tC5.111,0.692,5.092,0.375,5.274,0.169C5.37,0.062,5.506,0,5.649,0c0.122,0,0.24,0.045,0.331,0.125l12.576,11.126\n\t\t\t\tc0.029,0.026,0.056,0.052,0.081,0.08c0.369,0.416,0.332,1.051-0.08,1.416L5.98,23.875C5.888,23.956,5.771,24,5.649,24z");
			add_location(path0, file$4, 9, 3, 186);
			attr_dev(svg0, "width", "12");
			attr_dev(svg0, "height", "12");
			attr_dev(svg0, "viewBox", "0 0 24 24");
			add_location(svg0, file$4, 5, 2, 124);
			attr_dev(button0, "class", "pwt-date-navigator-prev");
			add_location(button0, file$4, 2, 1, 60);
			attr_dev(path1, "d", "M18.401,24c-0.122,0-0.24-0.044-0.331-0.125L5.495,12.748c-0.03-0.027-0.058-0.055-0.084-0.084\n\t\t\t\tc-0.366-0.413-0.329-1.047,0.083-1.412L18.069,0.125C18.161,0.044,18.279,0,18.401,0c0.143,0,0.28,0.062,0.375,0.169\n\t\t\t\tc0.182,0.206,0.163,0.523-0.043,0.705L6.157,12l12.575,11.125c0.206,0.183,0.226,0.5,0.043,0.706C18.68,23.939,18.544,24,18.401,24\n\t\t\t\tz");
			add_location(path1, file$4, 21, 3, 681);
			attr_dev(svg1, "width", "12");
			attr_dev(svg1, "height", "12");
			attr_dev(svg1, "viewBox", "0 0 24 24");
			add_location(svg1, file$4, 17, 2, 619);
			attr_dev(button1, "class", "pwt-date-navigator-next");
			add_location(button1, file$4, 14, 1, 553);

			dispose = [
				listen_dev(button0, "click", ctx.next, false, false, false),
				listen_dev(button1, "click", ctx.prev, false, false, false)
			];
		},
		m: function mount(target, anchor) {
			insert_dev(target, button0, anchor);
			append_dev(button0, svg0);
			append_dev(svg0, path0);
			insert_dev(target, t, anchor);
			insert_dev(target, button1, anchor);
			append_dev(button1, svg1);
			append_dev(svg1, path1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button0);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(button1);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_8.name,
		type: "if",
		source: "(2:0) {#if viewMode !== 'time'}",
		ctx
	});

	return block;
}

// (31:2) {#if viewMode === 'year'}
function create_if_block_6(ctx) {
	let if_block_anchor;
	let current;
	let if_block = ctx.visible && create_if_block_7(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_7(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6.name,
		type: "if",
		source: "(31:2) {#if viewMode === 'year'}",
		ctx
	});

	return block;
}

// (32:3) {#if visible}
function create_if_block_7(ctx) {
	let button;
	let t0;
	let t1;
	let t2_value = ctx.startYear + 11 + "";
	let t2;
	let button_intro;
	let button_outro;
	let current;

	const block = {
		c: function create() {
			button = element("button");
			t0 = text(ctx.startYear);
			t1 = text(" - ");
			t2 = text(t2_value);
			attr_dev(button, "class", "pwt-date-navigator-button");
			add_location(button, file$4, 32, 4, 1159);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t0);
			append_dev(button, t1);
			append_dev(button, t2);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.startYear) set_data_dev(t0, ctx.startYear);
			if ((!current || changed.startYear) && t2_value !== (t2_value = ctx.startYear + 11 + "")) set_data_dev(t2, t2_value);
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (button_outro) button_outro.end(1);
				if (!button_intro) button_intro = create_in_transition(button, ctx.fadeIn, { duration: animateSpeed$3 });
				button_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (button_intro) button_intro.invalidate();
			button_outro = create_out_transition(button, ctx.fadeOut, { duration: animateSpeed$3 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if (detaching && button_outro) button_outro.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_7.name,
		type: "if",
		source: "(32:3) {#if visible}",
		ctx
	});

	return block;
}

// (41:2) {#if viewMode === 'month'}
function create_if_block_4$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = ctx.visible && create_if_block_5(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4$1.name,
		type: "if",
		source: "(41:2) {#if viewMode === 'month'}",
		ctx
	});

	return block;
}

// (42:3) {#if visible}
function create_if_block_5(ctx) {
	let button;
	let t;
	let button_intro;
	let button_outro;
	let current;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			t = text(ctx.monthViewText);
			attr_dev(button, "class", "pwt-date-navigator-button");
			add_location(button, file$4, 42, 4, 1417);
			dispose = listen_dev(button, "click", ctx.click_handler, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.monthViewText) set_data_dev(t, ctx.monthViewText);
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (button_outro) button_outro.end(1);
				if (!button_intro) button_intro = create_in_transition(button, ctx.fadeIn, { duration: animateSpeed$3 });
				button_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (button_intro) button_intro.invalidate();
			button_outro = create_out_transition(button, ctx.fadeOut, { duration: animateSpeed$3 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if (detaching && button_outro) button_outro.end();
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5.name,
		type: "if",
		source: "(42:3) {#if visible}",
		ctx
	});

	return block;
}

// (52:2) {#if viewMode === 'day'}
function create_if_block_2$2(ctx) {
	let if_block_anchor;
	let current;
	let if_block = ctx.visible && create_if_block_3$2(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_3$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$2.name,
		type: "if",
		source: "(52:2) {#if viewMode === 'day'}",
		ctx
	});

	return block;
}

// (53:3) {#if visible}
function create_if_block_3$2(ctx) {
	let button;
	let t;
	let button_intro;
	let button_outro;
	let current;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			t = text(ctx.dateViewText);
			attr_dev(button, "class", "pwt-date-navigator-button");
			add_location(button, file$4, 53, 4, 1700);
			dispose = listen_dev(button, "click", ctx.click_handler_1, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.dateViewText) set_data_dev(t, ctx.dateViewText);
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (button_outro) button_outro.end(1);
				if (!button_intro) button_intro = create_in_transition(button, ctx.fadeIn, { duration: animateSpeed$3, delay: 10 });
				button_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (button_intro) button_intro.invalidate();
			button_outro = create_out_transition(button, ctx.fadeOut, { duration: animateSpeed$3 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if (detaching && button_outro) button_outro.end();
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$2.name,
		type: "if",
		source: "(53:3) {#if visible}",
		ctx
	});

	return block;
}

// (63:2) {#if viewMode === 'time'}
function create_if_block$4(ctx) {
	let if_block_anchor;
	let current;
	let if_block = ctx.visible && create_if_block_1$2(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_1$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(63:2) {#if viewMode === 'time'}",
		ctx
	});

	return block;
}

// (64:3) {#if visible}
function create_if_block_1$2(ctx) {
	let button;
	let t0;
	let t1;
	let t2;
	let button_intro;
	let button_outro;
	let current;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			t0 = text(ctx.selectedMonth);
			t1 = space();
			t2 = text(ctx.selectedDate);
			attr_dev(button, "class", "pwt-date-navigator-button");
			add_location(button, file$4, 64, 4, 1995);
			dispose = listen_dev(button, "click", ctx.click_handler_2, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t0);
			append_dev(button, t1);
			append_dev(button, t2);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.selectedMonth) set_data_dev(t0, ctx.selectedMonth);
			if (!current || changed.selectedDate) set_data_dev(t2, ctx.selectedDate);
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (button_outro) button_outro.end(1);
				if (!button_intro) button_intro = create_in_transition(button, ctx.fadeIn, { duration: animateSpeed$3, delay: 10 });
				button_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (button_intro) button_intro.invalidate();
			button_outro = create_out_transition(button, ctx.fadeOut, { duration: animateSpeed$3 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if (detaching && button_outro) button_outro.end();
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(64:3) {#if visible}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let div1;
	let t0;
	let div0;
	let t1;
	let t2;
	let t3;
	let current;
	let if_block0 = ctx.viewMode !== "time" && create_if_block_8(ctx);
	let if_block1 = ctx.viewMode === "year" && create_if_block_6(ctx);
	let if_block2 = ctx.viewMode === "month" && create_if_block_4$1(ctx);
	let if_block3 = ctx.viewMode === "day" && create_if_block_2$2(ctx);
	let if_block4 = ctx.viewMode === "time" && create_if_block$4(ctx);

	const block = {
		c: function create() {
			div1 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div0 = element("div");
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			t3 = space();
			if (if_block4) if_block4.c();
			attr_dev(div0, "class", "pwt-date-navigator-center");
			add_location(div0, file$4, 28, 1, 1068);
			attr_dev(div1, "class", "pwt-date-navigator");
			add_location(div1, file$4, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			if (if_block0) if_block0.m(div1, null);
			append_dev(div1, t0);
			append_dev(div1, div0);
			if (if_block1) if_block1.m(div0, null);
			append_dev(div0, t1);
			if (if_block2) if_block2.m(div0, null);
			append_dev(div0, t2);
			if (if_block3) if_block3.m(div0, null);
			append_dev(div0, t3);
			if (if_block4) if_block4.m(div0, null);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.viewMode !== "time") {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_8(ctx);
					if_block0.c();
					if_block0.m(div1, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.viewMode === "year") {
				if (if_block1) {
					if_block1.p(changed, ctx);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_6(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div0, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (ctx.viewMode === "month") {
				if (if_block2) {
					if_block2.p(changed, ctx);
					transition_in(if_block2, 1);
				} else {
					if_block2 = create_if_block_4$1(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(div0, t2);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			if (ctx.viewMode === "day") {
				if (if_block3) {
					if_block3.p(changed, ctx);
					transition_in(if_block3, 1);
				} else {
					if_block3 = create_if_block_2$2(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(div0, t3);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}

			if (ctx.viewMode === "time") {
				if (if_block4) {
					if_block4.p(changed, ctx);
					transition_in(if_block4, 1);
				} else {
					if_block4 = create_if_block$4(ctx);
					if_block4.c();
					transition_in(if_block4, 1);
					if_block4.m(div0, null);
				}
			} else if (if_block4) {
				group_outros();

				transition_out(if_block4, 1, 1, () => {
					if_block4 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(if_block3);
			transition_in(if_block4);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(if_block3);
			transition_out(if_block4);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
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

let animateSpeed$3 = 200;

function instance$4($$self, $$props, $$invalidate) {
	let $dateObject;
	let $config;
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));

	function fadeOut(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	function fadeIn(node, { duration, delay }) {
		return {
			duration,
			delay,
			css: t => {
				return `
				transform: translate(${!transitionDirectionForward ? "-" : ""}${20 - t * 20}px, 0);
				opacity: ${t};
				`;
			}
		};
	}

	let { viewUnix } = $$props;
	let { viewMode } = $$props;
	const dispatch = createEventDispatcher();

	function setViewMode(payload) {
		dispatch("selectmode", payload);
	}

	function next(payload) {
		dispatch("next", payload);
	}

	function prev(payload) {
		dispatch("prev", payload);
	}

	let startYear;
	let visible = true;
	let cachedViewUnix = viewUnix;
	let transitionDirectionForward = true;
	const writable_props = ["viewUnix", "viewMode"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigator> was created with unknown prop '${key}'`);
	});

	const click_handler = () => setViewMode("year");
	const click_handler_1 = () => setViewMode("month");
	const click_handler_2 = () => setViewMode("date");

	$$self.$set = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("viewMode" in $$props) $$invalidate("viewMode", viewMode = $$props.viewMode);
	};

	$$self.$capture_state = () => {
		return {
			viewUnix,
			viewMode,
			startYear,
			visible,
			animateSpeed: animateSpeed$3,
			cachedViewUnix,
			transitionDirectionForward,
			selectedYear,
			$dateObject,
			visualYear,
			selectedMonth,
			selectedDate,
			dateViewText,
			$config,
			monthViewText,
			yearViewText
		};
	};

	$$self.$inject_state = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("viewMode" in $$props) $$invalidate("viewMode", viewMode = $$props.viewMode);
		if ("startYear" in $$props) $$invalidate("startYear", startYear = $$props.startYear);
		if ("visible" in $$props) $$invalidate("visible", visible = $$props.visible);
		if ("animateSpeed" in $$props) $$invalidate("animateSpeed", animateSpeed$3 = $$props.animateSpeed);
		if ("cachedViewUnix" in $$props) $$invalidate("cachedViewUnix", cachedViewUnix = $$props.cachedViewUnix);
		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
		if ("selectedYear" in $$props) $$invalidate("selectedYear", selectedYear = $$props.selectedYear);
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
		if ("visualYear" in $$props) visualYear = $$props.visualYear;
		if ("selectedMonth" in $$props) $$invalidate("selectedMonth", selectedMonth = $$props.selectedMonth);
		if ("selectedDate" in $$props) $$invalidate("selectedDate", selectedDate = $$props.selectedDate);
		if ("dateViewText" in $$props) $$invalidate("dateViewText", dateViewText = $$props.dateViewText);
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("monthViewText" in $$props) $$invalidate("monthViewText", monthViewText = $$props.monthViewText);
		if ("yearViewText" in $$props) yearViewText = $$props.yearViewText;
	};

	let selectedYear;
	let visualYear;
	let selectedMonth;
	let selectedDate;
	let dateViewText;
	let monthViewText;
	let yearViewText;

	$$self.$$.update = (changed = { $dateObject: 1, viewUnix: 1, $config: 1, selectedYear: 1, cachedViewUnix: 1 }) => {
		if (changed.$dateObject || changed.viewUnix) {
			 $$invalidate("selectedYear", selectedYear = new $dateObject(viewUnix).year());
		}

		if (changed.$dateObject || changed.viewUnix) {
			 visualYear = new $dateObject(viewUnix).format("YYYY");
		}

		if (changed.$dateObject || changed.viewUnix) {
			 $$invalidate("selectedMonth", selectedMonth = new $dateObject(viewUnix).format("MMMM"));
		}

		if (changed.$dateObject || changed.viewUnix) {
			 $$invalidate("selectedDate", selectedDate = new $dateObject(viewUnix).format("DD"));
		}

		if (changed.$config || changed.viewUnix || changed.$dateObject) {
			 $$invalidate("dateViewText", dateViewText = $config.dayPicker.titleFormatter(viewUnix, $dateObject));
		}

		if (changed.$config || changed.viewUnix || changed.$dateObject) {
			 $$invalidate("monthViewText", monthViewText = $config.monthPicker.titleFormatter(viewUnix, $dateObject));
		}

		if (changed.$config || changed.viewUnix || changed.$dateObject) {
			 yearViewText = $config.yearPicker.titleFormatter(viewUnix, $dateObject);
		}

		if (changed.viewUnix || changed.selectedYear || changed.cachedViewUnix) {
			 {
				if (viewUnix) {
					$$invalidate("startYear", startYear = selectedYear - selectedYear % 12);

					if (viewUnix > cachedViewUnix) {
						transitionDirectionForward = true;
					} else {
						transitionDirectionForward = false;
					}

					$$invalidate("cachedViewUnix", cachedViewUnix = viewUnix);
					$$invalidate("visible", visible = false);

					setTimeout(
						() => {
							$$invalidate("visible", visible = true);
						},
						200
					);
				}
			}
		}
	};

	return {
		fadeOut,
		fadeIn,
		viewUnix,
		viewMode,
		setViewMode,
		next,
		prev,
		startYear,
		visible,
		selectedMonth,
		selectedDate,
		dateViewText,
		monthViewText,
		click_handler,
		click_handler_1,
		click_handler_2
	};
}

class Navigator extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { viewUnix: 0, viewMode: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Navigator",
			options,
			id: create_fragment$4.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.viewUnix === undefined && !("viewUnix" in props)) {
			console.warn("<Navigator> was created without expected prop 'viewUnix'");
		}

		if (ctx.viewMode === undefined && !("viewMode" in props)) {
			console.warn("<Navigator> was created without expected prop 'viewMode'");
		}
	}

	get viewUnix() {
		throw new Error("<Navigator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewUnix(value) {
		throw new Error("<Navigator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewMode() {
		throw new Error("<Navigator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewMode(value) {
		throw new Error("<Navigator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Infobox.svelte generated by Svelte v3.15.0 */
const file$5 = "src/components/Infobox.svelte";

// (3:1) {#if visible}
function create_if_block$5(ctx) {
	let span;
	let t;
	let span_intro;
	let span_outro;
	let current;

	const block = {
		c: function create() {
			span = element("span");
			t = text(ctx.selectedDAte);
			add_location(span, file$5, 3, 2, 67);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.selectedDAte) set_data_dev(t, ctx.selectedDAte);
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (span_outro) span_outro.end(1);
				if (!span_intro) span_intro = create_in_transition(span, ctx.fadeIn, { duration: animateSpeed$4, offset: 10 });
				span_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			if (span_intro) span_intro.invalidate();
			span_outro = create_out_transition(span, ctx.fadeOut, { duration: animateSpeed$4, offset: 10 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
			if (detaching && span_outro) span_outro.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$5.name,
		type: "if",
		source: "(3:1) {#if visible}",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let current;
	let if_block = ctx.visible && create_if_block$5(ctx);

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t0 = text(ctx.title);
			t1 = space();
			if (if_block) if_block.c();
			add_location(span, file$5, 1, 1, 29);
			attr_dev(div, "class", "pwt-date-info");
			add_location(div, file$5, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t0);
			append_dev(div, t1);
			if (if_block) if_block.m(div, null);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.title) set_data_dev(t0, ctx.title);

			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block) if_block.d();
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

let animateSpeed$4 = 100;

function instance$5($$self, $$props, $$invalidate) {
	let $config;
	let $dateObject;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));

	function fadeOut(node, { duration, delay, offset }) {
		return {
			duration,
			delay,
			css: eased => {
				return `
				transform: translate(0, ${transitionDirectionForward ? "-" : ""}${offset - eased * offset}px);
				`;
			}
		};
	}

	function fadeIn(node, { duration, delay, offset }) {
		return {
			duration,
			delay,
			css: eased => {
				return `
				transform: translate(0, ${!transitionDirectionForward ? "-" : ""}${offset - eased * offset}px);
				`;
			}
		};
	}

	let { viewUnix } = $$props;
	let { selectedUnix } = $$props;
	let oldotherPart;
	let visible;
	let cachedSelectedUnix = viewUnix;
	let transitionDirectionForward = true;
	const writable_props = ["viewUnix", "selectedUnix"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Infobox> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
	};

	$$self.$capture_state = () => {
		return {
			viewUnix,
			selectedUnix,
			oldotherPart,
			visible,
			animateSpeed: animateSpeed$4,
			cachedSelectedUnix,
			transitionDirectionForward,
			title,
			$config,
			$dateObject,
			selectedDAte
		};
	};

	$$self.$inject_state = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("selectedUnix" in $$props) $$invalidate("selectedUnix", selectedUnix = $$props.selectedUnix);
		if ("oldotherPart" in $$props) oldotherPart = $$props.oldotherPart;
		if ("visible" in $$props) $$invalidate("visible", visible = $$props.visible);
		if ("animateSpeed" in $$props) $$invalidate("animateSpeed", animateSpeed$4 = $$props.animateSpeed);
		if ("cachedSelectedUnix" in $$props) $$invalidate("cachedSelectedUnix", cachedSelectedUnix = $$props.cachedSelectedUnix);
		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
		if ("title" in $$props) $$invalidate("title", title = $$props.title);
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
		if ("selectedDAte" in $$props) $$invalidate("selectedDAte", selectedDAte = $$props.selectedDAte);
	};

	let title;
	let selectedDAte;

	$$self.$$.update = (changed = { $config: 1, selectedUnix: 1, $dateObject: 1, selectedDAte: 1, cachedSelectedUnix: 1 }) => {
		if (changed.$config || changed.selectedUnix || changed.$dateObject) {
			 $$invalidate("title", title = $config.infobox.titleFormatter(selectedUnix, $dateObject));
		}

		if (changed.$config || changed.selectedUnix || changed.$dateObject) {
			 $$invalidate("selectedDAte", selectedDAte = $config.infobox.selectedDateFormatter(selectedUnix, $dateObject));
		}

		if (changed.selectedDAte || changed.selectedUnix || changed.cachedSelectedUnix) {
			 if (selectedDAte) {
				if (selectedUnix > cachedSelectedUnix) {
					transitionDirectionForward = true;
				} else {
					transitionDirectionForward = false;
				}

				$$invalidate("cachedSelectedUnix", cachedSelectedUnix = selectedUnix);
				$$invalidate("visible", visible = false);

				setTimeout(
					() => {
						$$invalidate("visible", visible = true);
					},
					200
				);
			}
		}
	};

	return {
		fadeOut,
		fadeIn,
		viewUnix,
		selectedUnix,
		visible,
		title,
		selectedDAte
	};
}

class Infobox extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { viewUnix: 0, selectedUnix: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Infobox",
			options,
			id: create_fragment$5.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.viewUnix === undefined && !("viewUnix" in props)) {
			console.warn("<Infobox> was created without expected prop 'viewUnix'");
		}

		if (ctx.selectedUnix === undefined && !("selectedUnix" in props)) {
			console.warn("<Infobox> was created without expected prop 'selectedUnix'");
		}
	}

	get viewUnix() {
		throw new Error("<Infobox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewUnix(value) {
		throw new Error("<Infobox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selectedUnix() {
		throw new Error("<Infobox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedUnix(value) {
		throw new Error("<Infobox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Toolbox.svelte generated by Svelte v3.15.0 */
const file$6 = "src/components/Toolbox.svelte";

// (2:1) {#if viewMode !== 'time'}
function create_if_block_6$1(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			button.textContent = "Time";
			attr_dev(button, "class", "pwt-date-toolbox-button");
			add_location(button, file$6, 2, 2, 60);
			dispose = listen_dev(button, "click", ctx.click_handler, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6$1.name,
		type: "if",
		source: "(2:1) {#if viewMode !== 'time'}",
		ctx
	});

	return block;
}

// (9:1) {#if viewMode === 'time'}
function create_if_block_5$1(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			button.textContent = "Date";
			attr_dev(button, "class", "pwt-date-toolbox-button");
			add_location(button, file$6, 9, 2, 201);
			dispose = listen_dev(button, "click", ctx.click_handler_1, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5$1.name,
		type: "if",
		source: "(9:1) {#if viewMode === 'time'}",
		ctx
	});

	return block;
}

// (16:1) {#if $config.toolbox.todayButton.enabled}
function create_if_block_4$2(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			button.textContent = "Today";
			attr_dev(button, "class", "pwt-date-toolbox-button");
			add_location(button, file$6, 16, 1, 356);
			dispose = listen_dev(button, "click", ctx.today, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4$2.name,
		type: "if",
		source: "(16:1) {#if $config.toolbox.todayButton.enabled}",
		ctx
	});

	return block;
}

// (23:1) {#if $config.toolbox.calendarSwitch.enabled}
function create_if_block_1$3(ctx) {
	let t;
	let if_block1_anchor;
	let if_block0 = ctx.$config.calendarType === "persian" && create_if_block_3$3(ctx);
	let if_block1 = ctx.$config.calendarType === "gregorian" && create_if_block_2$3(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert_dev(target, if_block1_anchor, anchor);
		},
		p: function update(changed, ctx) {
			if (ctx.$config.calendarType === "persian") {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_3$3(ctx);
					if_block0.c();
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.$config.calendarType === "gregorian") {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_2$3(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		d: function destroy(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach_dev(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach_dev(if_block1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$3.name,
		type: "if",
		source: "(23:1) {#if $config.toolbox.calendarSwitch.enabled}",
		ctx
	});

	return block;
}

// (24:2) {#if $config.calendarType === 'persian'}
function create_if_block_3$3(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			button.textContent = "gregorian";
			attr_dev(button, "class", "pwt-date-toolbox-button");
			add_location(button, file$6, 24, 3, 540);
			dispose = listen_dev(button, "click", ctx.click_handler_2, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$3.name,
		type: "if",
		source: "(24:2) {#if $config.calendarType === 'persian'}",
		ctx
	});

	return block;
}

// (31:2) {#if $config.calendarType === 'gregorian'}
function create_if_block_2$3(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			button.textContent = "Jalali";
			attr_dev(button, "class", "pwt-date-toolbox-button");
			add_location(button, file$6, 31, 3, 717);
			dispose = listen_dev(button, "click", ctx.click_handler_3, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$3.name,
		type: "if",
		source: "(31:2) {#if $config.calendarType === 'gregorian'}",
		ctx
	});

	return block;
}

// (39:1) {#if $config.toolbox.submitButton.enabled}
function create_if_block$6(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			button.textContent = "Submit";
			attr_dev(button, "class", "pwt-date-toolbox-button");
			add_location(button, file$6, 39, 1, 893);
			dispose = listen_dev(button, "click", ctx.click_handler_4, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$6.name,
		type: "if",
		source: "(39:1) {#if $config.toolbox.submitButton.enabled}",
		ctx
	});

	return block;
}

function create_fragment$6(ctx) {
	let div;
	let t0;
	let t1;
	let t2;
	let t3;
	let if_block0 = ctx.viewMode !== "time" && create_if_block_6$1(ctx);
	let if_block1 = ctx.viewMode === "time" && create_if_block_5$1(ctx);
	let if_block2 = ctx.$config.toolbox.todayButton.enabled && create_if_block_4$2(ctx);
	let if_block3 = ctx.$config.toolbox.calendarSwitch.enabled && create_if_block_1$3(ctx);
	let if_block4 = ctx.$config.toolbox.submitButton.enabled && create_if_block$6(ctx);

	const block = {
		c: function create() {
			div = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			t3 = space();
			if (if_block4) if_block4.c();
			attr_dev(div, "class", "pwt-date-toolbox");
			add_location(div, file$6, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append_dev(div, t0);
			if (if_block1) if_block1.m(div, null);
			append_dev(div, t1);
			if (if_block2) if_block2.m(div, null);
			append_dev(div, t2);
			if (if_block3) if_block3.m(div, null);
			append_dev(div, t3);
			if (if_block4) if_block4.m(div, null);
		},
		p: function update(changed, ctx) {
			if (ctx.viewMode !== "time") {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_6$1(ctx);
					if_block0.c();
					if_block0.m(div, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.viewMode === "time") {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_5$1(ctx);
					if_block1.c();
					if_block1.m(div, t1);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (ctx.$config.toolbox.todayButton.enabled) {
				if (if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2 = create_if_block_4$2(ctx);
					if_block2.c();
					if_block2.m(div, t2);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (ctx.$config.toolbox.calendarSwitch.enabled) {
				if (if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3 = create_if_block_1$3(ctx);
					if_block3.c();
					if_block3.m(div, t3);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (ctx.$config.toolbox.submitButton.enabled) {
				if (if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if_block4 = create_if_block$6(ctx);
					if_block4.c();
					if_block4.m(div, null);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let $config;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	let { viewUnix } = $$props;
	let { viewMode } = $$props;
	const dispatch = createEventDispatcher();

	function setViewMode(payload) {
		dispatch("selectmode", payload);
	}

	function setcalendar(payload) {
		dispatch("setcalendar", payload);
	}

	function today(payload) {
		dispatch("today", payload);
	}

	let yearRange;
	let startYear;
	const writable_props = ["viewUnix", "viewMode"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolbox> was created with unknown prop '${key}'`);
	});

	const click_handler = () => setViewMode("time");
	const click_handler_1 = () => setViewMode("day");
	const click_handler_2 = () => setcalendar("gregorian");
	const click_handler_3 = () => setcalendar("persian");

	const click_handler_4 = () => {
		alert("Please implement submit button");
	};

	$$self.$set = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("viewMode" in $$props) $$invalidate("viewMode", viewMode = $$props.viewMode);
	};

	$$self.$capture_state = () => {
		return {
			viewUnix,
			viewMode,
			yearRange,
			startYear,
			selectedYear,
			selectedMonth,
			$config
		};
	};

	$$self.$inject_state = $$props => {
		if ("viewUnix" in $$props) $$invalidate("viewUnix", viewUnix = $$props.viewUnix);
		if ("viewMode" in $$props) $$invalidate("viewMode", viewMode = $$props.viewMode);
		if ("yearRange" in $$props) $$invalidate("yearRange", yearRange = $$props.yearRange);
		if ("startYear" in $$props) $$invalidate("startYear", startYear = $$props.startYear);
		if ("selectedYear" in $$props) $$invalidate("selectedYear", selectedYear = $$props.selectedYear);
		if ("selectedMonth" in $$props) selectedMonth = $$props.selectedMonth;
		if ("$config" in $$props) config.set($config = $$props.$config);
	};

	let selectedYear;
	let selectedMonth;

	$$self.$$.update = (changed = { viewUnix: 1, selectedYear: 1, yearRange: 1, startYear: 1 }) => {
		if (changed.viewUnix) {
			 $$invalidate("selectedYear", selectedYear = new persianDate(viewUnix).year());
		}

		if (changed.viewUnix) {
			 selectedMonth = new persianDate(viewUnix).format("MMMM");
		}

		if (changed.selectedYear || changed.yearRange || changed.startYear) {
			 {
				$$invalidate("yearRange", yearRange = []);
				$$invalidate("startYear", startYear = selectedYear - selectedYear % 12);
				let i = 0;

				while (i < 12) {
					yearRange.push(startYear + i);
					i++;
				}
			}
		}
	};

	return {
		viewUnix,
		viewMode,
		setViewMode,
		setcalendar,
		today,
		$config,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4
	};
}

class Toolbox extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { viewUnix: 0, viewMode: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Toolbox",
			options,
			id: create_fragment$6.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.viewUnix === undefined && !("viewUnix" in props)) {
			console.warn("<Toolbox> was created without expected prop 'viewUnix'");
		}

		if (ctx.viewMode === undefined && !("viewMode" in props)) {
			console.warn("<Toolbox> was created without expected prop 'viewMode'");
		}
	}

	get viewUnix() {
		throw new Error("<Toolbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewUnix(value) {
		throw new Error("<Toolbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewMode() {
		throw new Error("<Toolbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewMode(value) {
		throw new Error("<Toolbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Input.svelte generated by Svelte v3.15.0 */

function create_fragment$7(ctx) {
	const block = {
		c: noop,
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let $config;
	let $isDirty;
	let $selectedUnix;
	let $dateObject;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(isDirty, "isDirty");
	component_subscribe($$self, isDirty, $$value => $$invalidate("$isDirty", $isDirty = $$value));
	validate_store(selectedUnix, "selectedUnix");
	component_subscribe($$self, selectedUnix, $$value => $$invalidate("$selectedUnix", $selectedUnix = $$value));
	validate_store(dateObject, "dateObject");
	component_subscribe($$self, dateObject, $$value => $$invalidate("$dateObject", $dateObject = $$value));
	let { originalContainer } = $$props;
	let { plotarea } = $$props;
	const dispatch = createEventDispatcher();

	let setPlotPostion = function () {
		let configLeft = $config.position !== "auto" ? $config.position[0] : 0;
		let configTop = $config.position !== "auto" ? $config.position[1] : 0;

		let set = () => {
			if (plotarea) {
				if (originalContainer && originalContainer.tagName === "INPUT") {
					$$invalidate("plotarea", plotarea.style.position = "absolute", plotarea);
					$$invalidate("plotarea", plotarea.style.left = originalContainer.offsetLeft + configLeft + "px", plotarea);
					$$invalidate("plotarea", plotarea.style.top = parseInt(originalContainer.offsetTop) + configTop + parseInt(originalContainer.clientHeight) + document.body.scrollTop + "px", plotarea);
				}
			}
		};

		setTimeout(
			() => {
				set();
			},
			100
		);

		setTimeout(
			() => {
				set();
			},
			200
		);

		setTimeout(
			() => {
				set();
			},
			300
		);

		setTimeout(
			() => {
				set();
			},
			1000
		);

		setTimeout(
			() => {
				set();
			},
			1500
		);
	};

	let initInputEvents = function () {
		let bodyListener = e => {
			if (plotarea && plotarea.contains(e.target) || e.target == originalContainer || e.target.className === "pwt-date-navigator-button" || e.target.className === "pwt-date-toolbox-button") ; else {
				dispatch("setvisibility", false);
				document.removeEventListener("click", bodyListener);
			}
		};

		if (originalContainer && originalContainer.tagName === "INPUT") {
			originalContainer.addEventListener("focus", () => {
				dispatch("setvisibility", true);
				setPlotPostion();
				document.addEventListener("click", bodyListener);
			});
		}
	};

	let initInputObserver = function () {
		if (originalContainer && originalContainer.tagName === "INPUT") {
			originalContainer.addEventListener("paste", e => {
				setTimeout(
					() => {
						getInputInitialValue();
					},
					0
				);
			});

			originalContainer.addEventListener("keyup", e => {
				setTimeout(
					() => {
						getInputInitialValue();
					},
					0
				);
			});
		}
	};

	let updateInputs = function () {
		if (originalContainer && originalContainer.tagName === "INPUT" && $config.initialValue || $isDirty) {
			let selected = $config.formatter($selectedUnix, $dateObject);

			if (originalContainer && originalContainer.tagName === "INPUT") {
				$$invalidate("originalContainer", originalContainer.value = selected, originalContainer);
			}

			if ($config.altField) {
				let altField = document.querySelector($config.altField);

				if (altField && originalContainer.altField === "INPUT") {
					altField.value = $config.altFieldFormatter($selectedUnix, $dateObject);
				}
			}
		}
	};

	let getInputInitialValue = function () {
		if (originalContainer) {
			let value = originalContainer.value;

			setTimeout(
				() => {
					dispatch("setinitialvalue", value);
				},
				0
			);
		}
	};

	getInputInitialValue();
	setPlotPostion();
	initInputEvents();

	if ($config.observer) {
		initInputObserver();
	}

	const writable_props = ["originalContainer", "plotarea"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("originalContainer" in $$props) $$invalidate("originalContainer", originalContainer = $$props.originalContainer);
		if ("plotarea" in $$props) $$invalidate("plotarea", plotarea = $$props.plotarea);
	};

	$$self.$capture_state = () => {
		return {
			originalContainer,
			plotarea,
			setPlotPostion,
			initInputEvents,
			initInputObserver,
			updateInputs,
			getInputInitialValue,
			$config,
			$isDirty,
			$selectedUnix,
			$dateObject
		};
	};

	$$self.$inject_state = $$props => {
		if ("originalContainer" in $$props) $$invalidate("originalContainer", originalContainer = $$props.originalContainer);
		if ("plotarea" in $$props) $$invalidate("plotarea", plotarea = $$props.plotarea);
		if ("setPlotPostion" in $$props) setPlotPostion = $$props.setPlotPostion;
		if ("initInputEvents" in $$props) initInputEvents = $$props.initInputEvents;
		if ("initInputObserver" in $$props) initInputObserver = $$props.initInputObserver;
		if ("updateInputs" in $$props) $$invalidate("updateInputs", updateInputs = $$props.updateInputs);
		if ("getInputInitialValue" in $$props) getInputInitialValue = $$props.getInputInitialValue;
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("$isDirty" in $$props) isDirty.set($isDirty = $$props.$isDirty);
		if ("$selectedUnix" in $$props) selectedUnix.set($selectedUnix = $$props.$selectedUnix);
		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
	};

	$$self.$$.update = (changed = { $selectedUnix: 1, updateInputs: 1 }) => {
		if (changed.$selectedUnix || changed.updateInputs) {
			 {
				if ($selectedUnix) {
					updateInputs();
				}
			}
		}
	};

	return { originalContainer, plotarea };
}

class Input extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, { originalContainer: 0, plotarea: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input",
			options,
			id: create_fragment$7.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.originalContainer === undefined && !("originalContainer" in props)) {
			console.warn("<Input> was created without expected prop 'originalContainer'");
		}

		if (ctx.plotarea === undefined && !("plotarea" in props)) {
			console.warn("<Input> was created without expected prop 'plotarea'");
		}
	}

	get originalContainer() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set originalContainer(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get plotarea() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set plotarea(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/app.svelte generated by Svelte v3.15.0 */

const { Object: Object_1, console: console_1 } = globals;
const file$7 = "src/app.svelte";

// (1:0) {#if isVisbile}
function create_if_block$7(ctx) {
	let div1;
	let t0;
	let t1;
	let div0;
	let t2;
	let t3;
	let current;
	let dispose;
	let if_block0 = ctx.$config.infobox.enabled && create_if_block_8$1(ctx);
	let if_block1 = ctx.$config.navigator.enabled && create_if_block_7$1(ctx);
	let if_block2 = !ctx.$config.onlyTimePicker && create_if_block_3$4(ctx);
	let if_block3 = (ctx.$viewMode === "time" && ctx.$config.timePicker.enabled || ctx.$config.onlyTimePicker) && create_if_block_2$4(ctx);
	let if_block4 = ctx.$config.toolbox.enabled && create_if_block_1$4(ctx);

	const block = {
		c: function create() {
			div1 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			div0 = element("div");
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			t3 = space();
			if (if_block4) if_block4.c();
			attr_dev(div0, "class", "pwt-datepicker-picker-section");
			add_location(div0, file$7, 20, 3, 502);
			attr_dev(div1, "class", "pwt-datepicker");
			add_location(div1, file$7, 1, 1, 17);
			dispose = listen_dev(div1, "wheel", ctx.handleWheel, false, false, false);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			if (if_block0) if_block0.m(div1, null);
			append_dev(div1, t0);
			if (if_block1) if_block1.m(div1, null);
			append_dev(div1, t1);
			append_dev(div1, div0);
			if (if_block2) if_block2.m(div0, null);
			append_dev(div0, t2);
			if (if_block3) if_block3.m(div0, null);
			append_dev(div1, t3);
			if (if_block4) if_block4.m(div1, null);
			ctx.div1_binding(div1);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.$config.infobox.enabled) {
				if (if_block0) {
					if_block0.p(changed, ctx);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_8$1(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div1, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (ctx.$config.navigator.enabled) {
				if (if_block1) {
					if_block1.p(changed, ctx);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_7$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div1, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!ctx.$config.onlyTimePicker) {
				if (if_block2) {
					if_block2.p(changed, ctx);
					transition_in(if_block2, 1);
				} else {
					if_block2 = create_if_block_3$4(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(div0, t2);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			if (ctx.$viewMode === "time" && ctx.$config.timePicker.enabled || ctx.$config.onlyTimePicker) {
				if (if_block3) {
					if_block3.p(changed, ctx);
					transition_in(if_block3, 1);
				} else {
					if_block3 = create_if_block_2$4(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(div0, null);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}

			if (ctx.$config.toolbox.enabled) {
				if (if_block4) {
					if_block4.p(changed, ctx);
					transition_in(if_block4, 1);
				} else {
					if_block4 = create_if_block_1$4(ctx);
					if_block4.c();
					transition_in(if_block4, 1);
					if_block4.m(div1, null);
				}
			} else if (if_block4) {
				group_outros();

				transition_out(if_block4, 1, 1, () => {
					if_block4 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(if_block3);
			transition_in(if_block4);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(if_block3);
			transition_out(if_block4);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			ctx.div1_binding(null);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$7.name,
		type: "if",
		source: "(1:0) {#if isVisbile}",
		ctx
	});

	return block;
}

// (6:2) {#if $config.infobox.enabled}
function create_if_block_8$1(ctx) {
	let current;

	const infobox = new Infobox({
			props: {
				viewUnix: ctx.$viewUnix,
				selectedUnix: ctx.$selectedUnix
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(infobox.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(infobox, target, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			const infobox_changes = {};
			if (changed.$viewUnix) infobox_changes.viewUnix = ctx.$viewUnix;
			if (changed.$selectedUnix) infobox_changes.selectedUnix = ctx.$selectedUnix;
			infobox.$set(infobox_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(infobox.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(infobox.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(infobox, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_8$1.name,
		type: "if",
		source: "(6:2) {#if $config.infobox.enabled}",
		ctx
	});

	return block;
}

// (11:3) {#if $config.navigator.enabled}
function create_if_block_7$1(ctx) {
	let current;

	const navigator = new Navigator({
			props: {
				viewMode: ctx.$viewMode,
				viewUnix: ctx.$viewUnix,
				selectedUnix: ctx.$selectedUnix
			},
			$$inline: true
		});

	navigator.$on("selectmode", ctx.setViewModeToUpperAvailableLevel);
	navigator.$on("today", ctx.today);
	navigator.$on("next", ctx.navNext);
	navigator.$on("prev", ctx.navPrev);

	const block = {
		c: function create() {
			create_component(navigator.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(navigator, target, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			const navigator_changes = {};
			if (changed.$viewMode) navigator_changes.viewMode = ctx.$viewMode;
			if (changed.$viewUnix) navigator_changes.viewUnix = ctx.$viewUnix;
			if (changed.$selectedUnix) navigator_changes.selectedUnix = ctx.$selectedUnix;
			navigator.$set(navigator_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(navigator.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(navigator.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(navigator, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_7$1.name,
		type: "if",
		source: "(11:3) {#if $config.navigator.enabled}",
		ctx
	});

	return block;
}

// (23:4) {#if !$config.onlyTimePicker}
function create_if_block_3$4(ctx) {
	let t0;
	let t1;
	let if_block2_anchor;
	let current;
	let if_block0 = ctx.$viewMode === "year" && ctx.$config.yearPicker.enabled && create_if_block_6$2(ctx);
	let if_block1 = ctx.$viewMode === "month" && ctx.$config.monthPicker.enabled && create_if_block_5$2(ctx);
	let if_block2 = ctx.$viewMode === "day" && ctx.$config.dayPicker.enabled && create_if_block_4$3(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t0, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert_dev(target, t1, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert_dev(target, if_block2_anchor, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.$viewMode === "year" && ctx.$config.yearPicker.enabled) {
				if (if_block0) {
					if_block0.p(changed, ctx);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_6$2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t0.parentNode, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (ctx.$viewMode === "month" && ctx.$config.monthPicker.enabled) {
				if (if_block1) {
					if_block1.p(changed, ctx);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_5$2(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(t1.parentNode, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (ctx.$viewMode === "day" && ctx.$config.dayPicker.enabled) {
				if (if_block2) {
					if_block2.p(changed, ctx);
					transition_in(if_block2, 1);
				} else {
					if_block2 = create_if_block_4$3(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block2);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach_dev(t0);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach_dev(t1);
			if (if_block2) if_block2.d(detaching);
			if (detaching) detach_dev(if_block2_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$4.name,
		type: "if",
		source: "(23:4) {#if !$config.onlyTimePicker}",
		ctx
	});

	return block;
}

// (24:5) {#if $viewMode === 'year' && $config.yearPicker.enabled}
function create_if_block_6$2(ctx) {
	let div;
	let div_transition;
	let current;

	const yearview = new YearView({
			props: {
				viewUnix: ctx.$viewUnix,
				selectedUnix: ctx.$selectedUnix
			},
			$$inline: true
		});

	yearview.$on("select", ctx.onSelectYear);

	const block = {
		c: function create() {
			div = element("div");
			create_component(yearview.$$.fragment);
			add_location(div, file$7, 24, 6, 652);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(yearview, div, null);
			current = true;
		},
		p: function update(changed, ctx) {
			const yearview_changes = {};
			if (changed.$viewUnix) yearview_changes.viewUnix = ctx.$viewUnix;
			if (changed.$selectedUnix) yearview_changes.selectedUnix = ctx.$selectedUnix;
			yearview.$set(yearview_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(yearview.$$.fragment, local);

			add_render_callback(() => {
				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 0 }, true);
				div_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			transition_out(yearview.$$.fragment, local);
			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 0 }, false);
			div_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(yearview);
			if (detaching && div_transition) div_transition.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6$2.name,
		type: "if",
		source: "(24:5) {#if $viewMode === 'year' && $config.yearPicker.enabled}",
		ctx
	});

	return block;
}

// (33:5) {#if $viewMode === 'month' && $config.monthPicker.enabled}
function create_if_block_5$2(ctx) {
	let div;
	let div_transition;
	let current;

	const monthview = new MonthView({
			props: {
				viewUnix: ctx.$viewUnix,
				selectedUnix: ctx.$selectedUnix
			},
			$$inline: true
		});

	monthview.$on("select", ctx.onSelectMonth);

	const block = {
		c: function create() {
			div = element("div");
			create_component(monthview.$$.fragment);
			add_location(div, file$7, 33, 6, 916);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(monthview, div, null);
			current = true;
		},
		p: function update(changed, ctx) {
			const monthview_changes = {};
			if (changed.$viewUnix) monthview_changes.viewUnix = ctx.$viewUnix;
			if (changed.$selectedUnix) monthview_changes.selectedUnix = ctx.$selectedUnix;
			monthview.$set(monthview_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(monthview.$$.fragment, local);

			add_render_callback(() => {
				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 0 }, true);
				div_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			transition_out(monthview.$$.fragment, local);
			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 0 }, false);
			div_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(monthview);
			if (detaching && div_transition) div_transition.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5$2.name,
		type: "if",
		source: "(33:5) {#if $viewMode === 'month' && $config.monthPicker.enabled}",
		ctx
	});

	return block;
}

// (42:5) {#if $viewMode === 'day' && $config.dayPicker.enabled}
function create_if_block_4$3(ctx) {
	let div;
	let div_transition;
	let current;

	const dateview = new DateView({
			props: {
				viewUnix: ctx.$viewUnix,
				selectedUnix: ctx.$selectedUnix
			},
			$$inline: true
		});

	dateview.$on("prev", ctx.navPrev);
	dateview.$on("next", ctx.navNext);
	dateview.$on("selectDate", ctx.onSelectDate);

	const block = {
		c: function create() {
			div = element("div");
			create_component(dateview.$$.fragment);
			add_location(div, file$7, 42, 6, 1178);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(dateview, div, null);
			current = true;
		},
		p: function update(changed, ctx) {
			const dateview_changes = {};
			if (changed.$viewUnix) dateview_changes.viewUnix = ctx.$viewUnix;
			if (changed.$selectedUnix) dateview_changes.selectedUnix = ctx.$selectedUnix;
			dateview.$set(dateview_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(dateview.$$.fragment, local);

			add_render_callback(() => {
				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 0 }, true);
				div_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			transition_out(dateview.$$.fragment, local);
			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 0 }, false);
			div_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(dateview);
			if (detaching && div_transition) div_transition.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4$3.name,
		type: "if",
		source: "(42:5) {#if $viewMode === 'day' && $config.dayPicker.enabled}",
		ctx
	});

	return block;
}

// (54:4) {#if ($viewMode === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}
function create_if_block_2$4(ctx) {
	let div;
	let div_intro;
	let current;

	const timeview = new TimeView({
			props: { selectedUnix: ctx.$selectedUnix },
			$$inline: true
		});

	timeview.$on("selectTime", ctx.onSelectTime);

	const block = {
		c: function create() {
			div = element("div");
			create_component(timeview.$$.fragment);
			add_location(div, file$7, 54, 5, 1535);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(timeview, div, null);
			current = true;
		},
		p: function update(changed, ctx) {
			const timeview_changes = {};
			if (changed.$selectedUnix) timeview_changes.selectedUnix = ctx.$selectedUnix;
			timeview.$set(timeview_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(timeview.$$.fragment, local);

			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fade, { duration: 500 });
					div_intro.start();
				});
			}

			current = true;
		},
		o: function outro(local) {
			transition_out(timeview.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(timeview);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$4.name,
		type: "if",
		source: "(54:4) {#if ($viewMode === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}",
		ctx
	});

	return block;
}

// (63:3) {#if $config.toolbox.enabled}
function create_if_block_1$4(ctx) {
	let current;

	const toolbox = new Toolbox({
			props: {
				viewMode: ctx.$viewMode,
				viewUnix: ctx.$viewUnix,
				selectedUnix: ctx.$selectedUnix
			},
			$$inline: true
		});

	toolbox.$on("setcalendar", ctx.setcalendar);
	toolbox.$on("selectmode", ctx.setViewMode);
	toolbox.$on("today", ctx.today);
	toolbox.$on("next", ctx.navNext);
	toolbox.$on("prev", ctx.navPrev);

	const block = {
		c: function create() {
			create_component(toolbox.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(toolbox, target, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			const toolbox_changes = {};
			if (changed.$viewMode) toolbox_changes.viewMode = ctx.$viewMode;
			if (changed.$viewUnix) toolbox_changes.viewUnix = ctx.$viewUnix;
			if (changed.$selectedUnix) toolbox_changes.selectedUnix = ctx.$selectedUnix;
			toolbox.$set(toolbox_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(toolbox.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(toolbox.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(toolbox, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$4.name,
		type: "if",
		source: "(63:3) {#if $config.toolbox.enabled}",
		ctx
	});

	return block;
}

function create_fragment$8(ctx) {
	let t;
	let current;
	let if_block = ctx.isVisbile && create_if_block$7(ctx);

	const input = new Input({
			props: {
				plotarea: ctx.plotarea,
				originalContainer: ctx.originalContainer
			},
			$$inline: true
		});

	input.$on("setinitialvalue", ctx.setInitialValue);
	input.$on("setvisibility", ctx.setvisibility);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			t = space();
			create_component(input.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, t, anchor);
			mount_component(input, target, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (ctx.isVisbile) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$7(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(t.parentNode, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			const input_changes = {};
			if (changed.plotarea) input_changes.plotarea = ctx.plotarea;
			if (changed.originalContainer) input_changes.originalContainer = ctx.originalContainer;
			input.$set(input_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(input.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			transition_out(input.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(t);
			destroy_component(input, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let $config;
	let $viewUnix;
	let $selectedUnix;
	let $viewMode;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(viewUnix, "viewUnix");
	component_subscribe($$self, viewUnix, $$value => $$invalidate("$viewUnix", $viewUnix = $$value));
	validate_store(selectedUnix, "selectedUnix");
	component_subscribe($$self, selectedUnix, $$value => $$invalidate("$selectedUnix", $selectedUnix = $$value));
	validate_store(viewMode, "viewMode");
	component_subscribe($$self, viewMode, $$value => $$invalidate("$viewMode", $viewMode = $$value));
	const dispatch = createEventDispatcher();

	const dispatcher = function (input) {
		dispatch(input);

		if (options[input]) {
			return event => options[input](event);
		} else {
			return event => {
				actions[input](event);
			};
		}
	};

	let { options = {} } = $$props;
	let { originalContainer = null } = $$props;
	let { number = "test" } = $$props;

	if (!options) {
		$$invalidate("options", options = defaultconfig);
	} else {
		$$invalidate("options", options = Object.assign(defaultconfig, options));
	}

	dispatcher("setConfig")(options);
	let plotarea;
	let isVisbile = false;

	const setvisibility = function (payload) {
		$$invalidate("isVisbile", isVisbile = payload.detail);

		setTimeout(
			() => {
				if (plotarea) {
					$$invalidate("plotarea", plotarea.style.display = isVisbile ? "block" : "none", plotarea);
				}
			},
			0
		);

		if (isVisbile) {
			$config.onShow();
		} else {
			$config.onHide();
		}
	};

	setvisibility({ detail: true });

	const setInitialValue = function (event) {
		dispatcher("setFromDefaultValue")(event.detail);
	};

	const setViewMode = function (event) {
		dispatcher("setViewMode")(event.detail);
	};

	const setcalendar = function (event) {
		dispatcher("onSetCalendar")(event.detail);
		$config.toolbox.calendarSwitch.onSwitch(event);
	};

	const onSelectDate = function (event) {
		dispatcher("onSelectDate")(event.detail);
		$config.dayPicker.onSelect(event.detail);

		if ($config.autoClose) {
			setvisibility({ detail: false });
		}
	};

	const onSelectTime = function (event) {
		dispatcher("onSelectTime")(event);
	};

	const onSelectMonth = function (event) {
		dispatcher("onSelectMonth")(event.detail);
		$config.monthPicker.onSelect(event.detail);
	};

	const onSelectYear = function (event) {
		dispatcher("onSelectYear")(event.detail);
		$config.yearPicker.onSelect(event.detail);
	};

	const today = event => {
		dispatcher("onSelectToday")(event);
		$config.toolbox.todayButton.onToday(event);
	};

	const navNext = event => {
		dispatcher("onSelectNextView")(event);
		$config.navigator.onNext(event);
	};

	const navPrev = event => {
		dispatcher("onSelectPrevView")(event);
		$config.navigator.onPrev(event);
	};

	const setViewModeToUpperAvailableLevel = event => {
		dispatcher("setViewModeToUpperAvailableLevel")();
		$config.navigator.onSwitch(event);
	};

	const handleWheel = e => {
		if ($config.navigator.scroll.enabled) {
			setTimeout(
				() => {
					if (e.deltaY > 0 || e.deltaX > 0) {
						navNext();
					}

					if (e.deltaY < 0 || e.deltaX < 0) {
						navPrev();
					}
				},
				1
			);
		}
	};

	const writable_props = ["options", "originalContainer", "number"];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate("plotarea", plotarea = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("options" in $$props) $$invalidate("options", options = $$props.options);
		if ("originalContainer" in $$props) $$invalidate("originalContainer", originalContainer = $$props.originalContainer);
		if ("number" in $$props) $$invalidate("number", number = $$props.number);
	};

	$$self.$capture_state = () => {
		return {
			options,
			originalContainer,
			number,
			plotarea,
			isVisbile,
			$config,
			$viewUnix,
			$selectedUnix,
			$viewMode
		};
	};

	$$self.$inject_state = $$props => {
		if ("options" in $$props) $$invalidate("options", options = $$props.options);
		if ("originalContainer" in $$props) $$invalidate("originalContainer", originalContainer = $$props.originalContainer);
		if ("number" in $$props) $$invalidate("number", number = $$props.number);
		if ("plotarea" in $$props) $$invalidate("plotarea", plotarea = $$props.plotarea);
		if ("isVisbile" in $$props) $$invalidate("isVisbile", isVisbile = $$props.isVisbile);
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("$viewUnix" in $$props) viewUnix.set($viewUnix = $$props.$viewUnix);
		if ("$selectedUnix" in $$props) selectedUnix.set($selectedUnix = $$props.$selectedUnix);
		if ("$viewMode" in $$props) viewMode.set($viewMode = $$props.$viewMode);
	};

	$$self.$$.update = (changed = { number: 1 }) => {
		if (changed.number) {
			 {
				console.log("new number");
				console.log(number);
				setViewMode({ detail: number });
			}
		}
	};

	return {
		options,
		originalContainer,
		number,
		plotarea,
		isVisbile,
		setvisibility,
		setInitialValue,
		setViewMode,
		setcalendar,
		onSelectDate,
		onSelectTime,
		onSelectMonth,
		onSelectYear,
		today,
		navNext,
		navPrev,
		setViewModeToUpperAvailableLevel,
		handleWheel,
		$config,
		$viewUnix,
		$selectedUnix,
		$viewMode,
		div1_binding
	};
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			options: 0,
			originalContainer: 0,
			number: 0
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$8.name
		});
	}

	get options() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set options(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get originalContainer() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set originalContainer(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get number() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set number(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var pluginVue = {
  render(createElement) {
    return createElement('div', {
      ref: "container",
      props: this.$attrs
    });
  },
  data() {
    return {
      comp: null
    };
  },
  mounted() {
    this.comp = new App({
      target: this.$refs.container,
      props: this.$attrs
    });

    let watchers = [];

    for (const key in this.$listeners) {
      this.comp.$on(key, this.$listeners[key]);
      const watchRe = /watch:([^]+)/;

      const watchMatch = key.match(watchRe);

      if (watchMatch && typeof this.$listeners[key] === "function") {
        watchers.push([
          `${watchMatch[1][0].toLowerCase()}${watchMatch[1].slice(1)}`,
          this.$listeners[key]
        ]);
      }
    }

    if (watchers.length) {
      let comp = this.comp;
      const update = this.comp.$$.update;
      this.comp.$$.update = function() {
        watchers.forEach(([name, callback]) => {
          const index = comp.$$.props[name];
          callback(comp.$$.ctx[index]);
        });
        update.apply(null, arguments);
      };
    }
  },
  updated() {
    this.comp.$set(this.$attrs);
  },
  destroyed() {
    this.comp.$destroy();
  }
};

module.exports = pluginVue;
//# sourceMappingURL=zerounip-vue.js.map
