/**
 * 
 * persian-datepicker-next-version
 * v0.0.1
 * babakhani.reza@gmail.com
 * license MIT
 * 
 *     
 */

import React, { useRef, useState, useEffect } from 'react';

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
          persianDateArray = inputString.split(/\/|-|\,|\./).map(Number);
          return persianDateArray;
        } else if (isoPat.test(inputString)) {
          persianDateArray = inputString.split(/\/|-|\,|\:|\T|\Z/g).map(Number);
          return persianDateArray;
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
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
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
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

let Helper = {
  debug () {
  }
};
var defaultconfig = {
    'calendarType': 'persian',
    'calendar': {
        'persian': {
            'locale': 'fa',
            'showHint': false,
            'leapYearMode': 'algorithmic'
        },
        'gregorian': {
            'locale': 'en',
            'showHint': false
        }
    },
    'responsive': true,
    'inline': false,
    'initialValue': true,
    'initialValueType': 'gregorian',
    'persianDigit': true,
    'viewMode': 'month',
    'format': 'LLLL',
    'formatter': function (unixDate, dateObject) {
       return new dateObject(unixDate).format(this.format);
    },
    'altField': false,
    'altFormat': 'unix',
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
    'minDate': null,
    'maxDate': null,
    'navigator': {
        'enabled': true,
        'scroll': {
            'enabled': true
        },
        'text': {
            'btnNextText': '<',
            'btnPrevText': '>'
        },
        'onNext': function (datepickerObject) {
        },
        'onPrev': function (datepickerObject) {
        },
        'onSwitch': function (datepickerObject) {
        }
    },
    'toolbox': {
        'enabled': true,
        'text': {
            btnToday: 'امروز'
        },
        submitButton: {
            enabled: Helper.isMobile,
            text: {
                fa: 'تایید',
                en: 'submit'
            },
            onSubmit: function (datepickerObject) {
            }
        },
        todayButton: {
            enabled: true,
            text: {
                fa: 'امروز',
                en: 'today'
            },
            onToday: function (datepickerObject) {
            }
        },
        calendarSwitch: {
            enabled: true,
            format: 'MMMM',
            onSwitch: function (datepickerObject) {
            }
        },
        onToday: function (datepickerObject) {
        }
    },
    'onlyTimePicker': false,
    'onlySelectOnDate': true,
    'checkDate': function () {
        return true;
    },
    'checkMonth': function () {
        return true;
    },
    'checkYear': function () {
        return true;
    },
    'timePicker': {
        'enabled': true,
        'step': 1,
        'hour': {
            'enabled': true,
            'step': null
        },
        'minute': {
            'enabled': true,
            'step': null
        },
        'second': {
            'enabled': true,
            'step': null
        },
        'meridian': {
            'enabled': true
        }
    },
    'dayPicker': {
        'enabled': true,
        'titleFormat': 'YYYY MMMM',
        'titleFormatter': function (unix, dateObject) {
            return new dateObject(unix).format(this.titleFormat)
        },
        'onSelect': function (selectedDayUnix) {
        }
    },
    'monthPicker': {
        'enabled': true,
        'titleFormat': 'YYYY',
        'titleFormatter': function (unix, dateObject) {
          return new dateObject(unix).format(this.titleFormat)
        },
        'onSelect': function (monthIndex) {
        }
    },
    'yearPicker': {
        'enabled': true,
        'titleFormat': 'YYYY',
        'titleFormatter': function (unix, dateObject) {
          let selectedYear = new dateObject(unix).year();
          let startYear = selectedYear - (selectedYear % 12);
          return new dateObject(unix).year(startYear).format(this.titleFormat) + '-' + new
            dateObject(unix).year(startYear+ 11).format(this.titleFormat)
        },
        'onSelect': function (year) {
        }
    },
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
    'onSelect': function (unixDate) {
    },
    'onSet': function (unixDate) {
    },
    'position': 'auto',
    'onShow': function (datepickerObject) {
    },
    'onHide': function (datepickerObject) {
    },
    'onToggle': function (datepickerObject) {
    },
    'onDestroy': function (datepickerObject) {
    },
    'autoClose': false,
    'template': null,
    'observer': false,
    'inputDelay': 800
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lodash = createCommonjsModule(function (module, exports) {
(function() {
  var undefined$1;
  var VERSION = '4.17.15';
  var LARGE_ARRAY_SIZE = 200;
  var CORE_ERROR_TEXT = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
      FUNC_ERROR_TEXT = 'Expected a function';
  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  var MAX_MEMOIZE_SIZE = 500;
  var PLACEHOLDER = '__lodash_placeholder__';
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;
  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;
  var WRAP_BIND_FLAG = 1,
      WRAP_BIND_KEY_FLAG = 2,
      WRAP_CURRY_BOUND_FLAG = 4,
      WRAP_CURRY_FLAG = 8,
      WRAP_CURRY_RIGHT_FLAG = 16,
      WRAP_PARTIAL_FLAG = 32,
      WRAP_PARTIAL_RIGHT_FLAG = 64,
      WRAP_ARY_FLAG = 128,
      WRAP_REARG_FLAG = 256,
      WRAP_FLIP_FLAG = 512;
  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';
  var HOT_COUNT = 800,
      HOT_SPAN = 16;
  var LAZY_FILTER_FLAG = 1,
      LAZY_MAP_FLAG = 2,
      LAZY_WHILE_FLAG = 3;
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;
  var MAX_ARRAY_LENGTH = 4294967295,
      MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
  var wrapFlags = [
    ['ary', WRAP_ARY_FLAG],
    ['bind', WRAP_BIND_FLAG],
    ['bindKey', WRAP_BIND_KEY_FLAG],
    ['curry', WRAP_CURRY_FLAG],
    ['curryRight', WRAP_CURRY_RIGHT_FLAG],
    ['flip', WRAP_FLIP_FLAG],
    ['partial', WRAP_PARTIAL_FLAG],
    ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
    ['rearg', WRAP_REARG_FLAG]
  ];
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      asyncTag = '[object AsyncFunction]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      domExcTag = '[object DOMException]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      nullTag = '[object Null]',
      objectTag = '[object Object]',
      promiseTag = '[object Promise]',
      proxyTag = '[object Proxy]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      undefinedTag = '[object Undefined]',
      weakMapTag = '[object WeakMap]',
      weakSetTag = '[object WeakSet]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
      reUnescapedHtml = /[&<>"']/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source),
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
  var reEscape = /<%-([\s\S]+?)%>/g,
      reEvaluate = /<%([\s\S]+?)%>/g,
      reInterpolate = /<%=([\s\S]+?)%>/g;
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
      reHasRegExpChar = RegExp(reRegExpChar.source);
  var reTrim = /^\s+|\s+$/g,
      reTrimStart = /^\s+/,
      reTrimEnd = /\s+$/;
  var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
      reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
      reSplitDetails = /,? & /;
  var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
  var reEscapeChar = /\\(\\)?/g;
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
  var reFlags = /\w*$/;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var reIsOctal = /^0o[0-7]+$/i;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
  var reNoMatch = /($^)/;
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
  var rsAstralRange = '\\ud800-\\udfff',
      rsComboMarksRange = '\\u0300-\\u036f',
      reComboHalfMarksRange = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange = '\\u20d0-\\u20ff',
      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
      rsDingbatRange = '\\u2700-\\u27bf',
      rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
      rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
      rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
      rsPunctuationRange = '\\u2000-\\u206f',
      rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
      rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
      rsVarRange = '\\ufe0e\\ufe0f',
      rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
  var rsApos = "['\u2019]",
      rsAstral = '[' + rsAstralRange + ']',
      rsBreak = '[' + rsBreakRange + ']',
      rsCombo = '[' + rsComboRange + ']',
      rsDigits = '\\d+',
      rsDingbat = '[' + rsDingbatRange + ']',
      rsLower = '[' + rsLowerRange + ']',
      rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
      rsFitz = '\\ud83c[\\udffb-\\udfff]',
      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
      rsNonAstral = '[^' + rsAstralRange + ']',
      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsUpper = '[' + rsUpperRange + ']',
      rsZWJ = '\\u200d';
  var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
      rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
      rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
      rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
      reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange + ']?',
      rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
      rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
  var reApos = RegExp(rsApos, 'g');
  var reComboMark = RegExp(rsCombo, 'g');
  var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
  var reUnicodeWord = RegExp([
    rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
    rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
    rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
    rsUpper + '+' + rsOptContrUpper,
    rsOrdUpper,
    rsOrdLower,
    rsDigits,
    rsEmoji
  ].join('|'), 'g');
  var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');
  var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
  var contextProps = [
    'Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array',
    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object',
    'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array',
    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
    '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'
  ];
  var templateCounter = -1;
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;
  var deburredLetters = {
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss',
    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
    '\u0134': 'J',  '\u0135': 'j',
    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
    '\u0174': 'W',  '\u0175': 'w',
    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
    '\u0132': 'IJ', '\u0133': 'ij',
    '\u0152': 'Oe', '\u0153': 'oe',
    '\u0149': "'n", '\u017f': 's'
  };
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };
  var freeParseFloat = parseFloat,
      freeParseInt = parseInt;
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function('return this')();
  var freeExports =  exports && !exports.nodeType && exports;
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = (function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require('util').types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());
  var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
      nodeIsDate = nodeUtil && nodeUtil.isDate,
      nodeIsMap = nodeUtil && nodeUtil.isMap,
      nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
      nodeIsSet = nodeUtil && nodeUtil.isSet,
      nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }
  function arrayEachRight(array, iteratee) {
    var length = array == null ? 0 : array.length;
    while (length--) {
      if (iteratee(array[length], length, array) === false) {
        break;
      }
    }
    return array;
  }
  function arrayEvery(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false;
      }
    }
    return true;
  }
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }
  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array == null ? 0 : array.length;
    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }
  function arrayReduceRight(array, iteratee, accumulator, initAccum) {
    var length = array == null ? 0 : array.length;
    if (initAccum && length) {
      accumulator = array[--length];
    }
    while (length--) {
      accumulator = iteratee(accumulator, array[length], length, array);
    }
    return accumulator;
  }
  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  var asciiSize = baseProperty('length');
  function asciiToArray(string) {
    return string.split('');
  }
  function asciiWords(string) {
    return string.match(reAsciiWord) || [];
  }
  function baseFindKey(collection, predicate, eachFunc) {
    var result;
    eachFunc(collection, function(value, key, collection) {
      if (predicate(value, key, collection)) {
        result = key;
        return false;
      }
    });
    return result;
  }
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);
    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }
  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }
  function baseIndexOfWith(array, value, fromIndex, comparator) {
    var index = fromIndex - 1,
        length = array.length;
    while (++index < length) {
      if (comparator(array[index], value)) {
        return index;
      }
    }
    return -1;
  }
  function baseIsNaN(value) {
    return value !== value;
  }
  function baseMean(array, iteratee) {
    var length = array == null ? 0 : array.length;
    return length ? (baseSum(array, iteratee) / length) : NAN;
  }
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined$1 : object[key];
    };
  }
  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined$1 : object[key];
    };
  }
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function(value, index, collection) {
      accumulator = initAccum
        ? (initAccum = false, value)
        : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }
  function baseSortBy(array, comparer) {
    var length = array.length;
    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }
  function baseSum(array, iteratee) {
    var result,
        index = -1,
        length = array.length;
    while (++index < length) {
      var current = iteratee(array[index]);
      if (current !== undefined$1) {
        result = result === undefined$1 ? current : (result + current);
      }
    }
    return result;
  }
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  function baseToPairs(object, props) {
    return arrayMap(props, function(key) {
      return [key, object[key]];
    });
  }
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  function charsStartIndex(strSymbols, chrSymbols) {
    var index = -1,
        length = strSymbols.length;
    while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }
  function charsEndIndex(strSymbols, chrSymbols) {
    var index = strSymbols.length;
    while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }
  function countHolders(array, placeholder) {
    var length = array.length,
        result = 0;
    while (length--) {
      if (array[length] === placeholder) {
        ++result;
      }
    }
    return result;
  }
  var deburrLetter = basePropertyOf(deburredLetters);
  var escapeHtmlChar = basePropertyOf(htmlEscapes);
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }
  function getValue(object, key) {
    return object == null ? undefined$1 : object[key];
  }
  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }
  function hasUnicodeWord(string) {
    return reHasUnicodeWord.test(string);
  }
  function iteratorToArray(iterator) {
    var data,
        result = [];
    while (!(data = iterator.next()).done) {
      result.push(data.value);
    }
    return result;
  }
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);
    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = 0,
        result = [];
    while (++index < length) {
      var value = array[index];
      if (value === placeholder || value === PLACEHOLDER) {
        array[index] = PLACEHOLDER;
        result[resIndex++] = index;
      }
    }
    return result;
  }
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  function setToPairs(set) {
    var index = -1,
        result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = [value, value];
    });
    return result;
  }
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
        length = array.length;
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  function strictLastIndexOf(array, value, fromIndex) {
    var index = fromIndex + 1;
    while (index--) {
      if (array[index] === value) {
        return index;
      }
    }
    return index;
  }
  function stringSize(string) {
    return hasUnicode(string)
      ? unicodeSize(string)
      : asciiSize(string);
  }
  function stringToArray(string) {
    return hasUnicode(string)
      ? unicodeToArray(string)
      : asciiToArray(string);
  }
  var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
  function unicodeSize(string) {
    var result = reUnicode.lastIndex = 0;
    while (reUnicode.test(string)) {
      ++result;
    }
    return result;
  }
  function unicodeToArray(string) {
    return string.match(reUnicode) || [];
  }
  function unicodeWords(string) {
    return string.match(reUnicodeWord) || [];
  }
  var runInContext = (function runInContext(context) {
    context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
    var Array = context.Array,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;
    var coreJsData = context['__core-js_shared__'];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var idCounter = 0;
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());
    var nativeObjectToString = objectProto.toString;
    var objectCtorString = funcToString.call(Object);
    var oldDash = root._;
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );
    var Buffer = moduleExports ? context.Buffer : undefined$1,
        Symbol = context.Symbol,
        Uint8Array = context.Uint8Array,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined$1,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined$1,
        symIterator = Symbol ? Symbol.iterator : undefined$1,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined$1;
    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());
    var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
        ctxNow = Date && Date.now !== root.Date.now && Date.now,
        ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
    var nativeCeil = Math.ceil,
        nativeFloor = Math.floor,
        nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined$1,
        nativeIsFinite = context.isFinite,
        nativeJoin = arrayProto.join,
        nativeKeys = overArg(Object.keys, Object),
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeNow = Date.now,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random,
        nativeReverse = arrayProto.reverse;
    var DataView = getNative(context, 'DataView'),
        Map = getNative(context, 'Map'),
        Promise = getNative(context, 'Promise'),
        Set = getNative(context, 'Set'),
        WeakMap = getNative(context, 'WeakMap'),
        nativeCreate = getNative(Object, 'create');
    var metaMap = WeakMap && new WeakMap;
    var realNames = {};
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);
    var symbolProto = Symbol ? Symbol.prototype : undefined$1,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1,
        symbolToString = symbolProto ? symbolProto.toString : undefined$1;
    function lodash(value) {
      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
        if (value instanceof LodashWrapper) {
          return value;
        }
        if (hasOwnProperty.call(value, '__wrapped__')) {
          return wrapperClone(value);
        }
      }
      return new LodashWrapper(value);
    }
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined$1;
        return result;
      };
    }());
    function baseLodash() {
    }
    function LodashWrapper(value, chainAll) {
      this.__wrapped__ = value;
      this.__actions__ = [];
      this.__chain__ = !!chainAll;
      this.__index__ = 0;
      this.__values__ = undefined$1;
    }
    lodash.templateSettings = {
      'escape': reEscape,
      'evaluate': reEvaluate,
      'interpolate': reInterpolate,
      'variable': '',
      'imports': {
        '_': lodash
      }
    };
    lodash.prototype = baseLodash.prototype;
    lodash.prototype.constructor = lodash;
    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
    LodashWrapper.prototype.constructor = LodashWrapper;
    function LazyWrapper(value) {
      this.__wrapped__ = value;
      this.__actions__ = [];
      this.__dir__ = 1;
      this.__filtered__ = false;
      this.__iteratees__ = [];
      this.__takeCount__ = MAX_ARRAY_LENGTH;
      this.__views__ = [];
    }
    function lazyClone() {
      var result = new LazyWrapper(this.__wrapped__);
      result.__actions__ = copyArray(this.__actions__);
      result.__dir__ = this.__dir__;
      result.__filtered__ = this.__filtered__;
      result.__iteratees__ = copyArray(this.__iteratees__);
      result.__takeCount__ = this.__takeCount__;
      result.__views__ = copyArray(this.__views__);
      return result;
    }
    function lazyReverse() {
      if (this.__filtered__) {
        var result = new LazyWrapper(this);
        result.__dir__ = -1;
        result.__filtered__ = true;
      } else {
        result = this.clone();
        result.__dir__ *= -1;
      }
      return result;
    }
    function lazyValue() {
      var array = this.__wrapped__.value(),
          dir = this.__dir__,
          isArr = isArray(array),
          isRight = dir < 0,
          arrLength = isArr ? array.length : 0,
          view = getView(0, arrLength, this.__views__),
          start = view.start,
          end = view.end,
          length = end - start,
          index = isRight ? end : (start - 1),
          iteratees = this.__iteratees__,
          iterLength = iteratees.length,
          resIndex = 0,
          takeCount = nativeMin(length, this.__takeCount__);
      if (!isArr || (!isRight && arrLength == length && takeCount == length)) {
        return baseWrapperValue(array, this.__actions__);
      }
      var result = [];
      outer:
      while (length-- && resIndex < takeCount) {
        index += dir;
        var iterIndex = -1,
            value = array[index];
        while (++iterIndex < iterLength) {
          var data = iteratees[iterIndex],
              iteratee = data.iteratee,
              type = data.type,
              computed = iteratee(value);
          if (type == LAZY_MAP_FLAG) {
            value = computed;
          } else if (!computed) {
            if (type == LAZY_FILTER_FLAG) {
              continue outer;
            } else {
              break outer;
            }
          }
        }
        result[resIndex++] = value;
      }
      return result;
    }
    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
    LazyWrapper.prototype.constructor = LazyWrapper;
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined$1 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined$1) : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined$1) ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);
      return index < 0 ? undefined$1 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;
      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (
               key == 'length' ||
               (isBuff && (key == 'offset' || key == 'parent')) ||
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }
    function arraySample(array) {
      var length = array.length;
      return length ? array[baseRandom(0, length - 1)] : undefined$1;
    }
    function arraySampleSize(array, n) {
      return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
    }
    function arrayShuffle(array) {
      return shuffleSelf(copyArray(array));
    }
    function assignMergeValue(object, key, value) {
      if ((value !== undefined$1 && !eq(object[key], value)) ||
          (value === undefined$1 && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined$1 && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAggregator(collection, setter, iteratee, accumulator) {
      baseEach(collection, function(value, key, collection) {
        setter(accumulator, value, iteratee(value), collection);
      });
      return accumulator;
    }
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }
    function baseAt(object, paths) {
      var index = -1,
          length = paths.length,
          result = Array(length),
          skip = object == null;
      while (++index < length) {
        result[index] = skip ? undefined$1 : get(object, paths[index]);
      }
      return result;
    }
    function baseClamp(number, lower, upper) {
      if (number === number) {
        if (upper !== undefined$1) {
          number = number <= upper ? number : upper;
        }
        if (lower !== undefined$1) {
          number = number >= lower ? number : lower;
        }
      }
      return number;
    }
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined$1) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value),
            isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? copySymbolsIn(value, baseAssignIn(result, value))
              : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
      }
      var keysFunc = isFull
        ? (isFlat ? getAllKeysIn : getAllKeys)
        : (isFlat ? keysIn : keys);
      var props = isArr ? undefined$1 : keysFunc(value);
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }
    function baseConforms(source) {
      var props = keys(source);
      return function(object) {
        return baseConformsTo(object, source, props);
      };
    }
    function baseConformsTo(object, source, props) {
      var length = props.length;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (length--) {
        var key = props[length],
            predicate = source[key],
            value = object[key];
        if ((value === undefined$1 && !(key in object)) || !predicate(value)) {
          return false;
        }
      }
      return true;
    }
    function baseDelay(func, wait, args) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return setTimeout(function() { func.apply(undefined$1, args); }, wait);
    }
    function baseDifference(array, values, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          isCommon = true,
          length = array.length,
          result = [],
          valuesLength = values.length;
      if (!length) {
        return result;
      }
      if (iteratee) {
        values = arrayMap(values, baseUnary(iteratee));
      }
      if (comparator) {
        includes = arrayIncludesWith;
        isCommon = false;
      }
      else if (values.length >= LARGE_ARRAY_SIZE) {
        includes = cacheHas;
        isCommon = false;
        values = new SetCache(values);
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee == null ? value : iteratee(value);
        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        }
        else if (!includes(values, computed, comparator)) {
          result.push(value);
        }
      }
      return result;
    }
    var baseEach = createBaseEach(baseForOwn);
    var baseEachRight = createBaseEach(baseForOwnRight, true);
    function baseEvery(collection, predicate) {
      var result = true;
      baseEach(collection, function(value, index, collection) {
        result = !!predicate(value, index, collection);
        return result;
      });
      return result;
    }
    function baseExtremum(array, iteratee, comparator) {
      var index = -1,
          length = array.length;
      while (++index < length) {
        var value = array[index],
            current = iteratee(value);
        if (current != null && (computed === undefined$1
              ? (current === current && !isSymbol(current))
              : comparator(current, computed)
            )) {
          var computed = current,
              result = value;
        }
      }
      return result;
    }
    function baseFill(array, value, start, end) {
      var length = array.length;
      start = toInteger(start);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined$1 || end > length) ? length : toInteger(end);
      if (end < 0) {
        end += length;
      }
      end = start > end ? 0 : toLength(end);
      while (start < end) {
        array[start++] = value;
      }
      return array;
    }
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;
      predicate || (predicate = isFlattenable);
      result || (result = []);
      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }
    var baseFor = createBaseFor();
    var baseForRight = createBaseFor(true);
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }
    function baseForOwnRight(object, iteratee) {
      return object && baseForRight(object, iteratee, keys);
    }
    function baseFunctions(object, props) {
      return arrayFilter(props, function(key) {
        return isFunction(object[key]);
      });
    }
    function baseGet(object, path) {
      path = castPath(path, object);
      var index = 0,
          length = path.length;
      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined$1;
    }
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined$1 ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }
    function baseGt(value, other) {
      return value > other;
    }
    function baseHas(object, key) {
      return object != null && hasOwnProperty.call(object, key);
    }
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }
    function baseInRange(number, start, end) {
      return number >= nativeMin(start, end) && number < nativeMax(start, end);
    }
    function baseIntersection(arrays, iteratee, comparator) {
      var includes = comparator ? arrayIncludesWith : arrayIncludes,
          length = arrays[0].length,
          othLength = arrays.length,
          othIndex = othLength,
          caches = Array(othLength),
          maxLength = Infinity,
          result = [];
      while (othIndex--) {
        var array = arrays[othIndex];
        if (othIndex && iteratee) {
          array = arrayMap(array, baseUnary(iteratee));
        }
        maxLength = nativeMin(array.length, maxLength);
        caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
          ? new SetCache(othIndex && array)
          : undefined$1;
      }
      array = arrays[0];
      var index = -1,
          seen = caches[0];
      outer:
      while (++index < length && result.length < maxLength) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;
        value = (comparator || value !== 0) ? value : 0;
        if (!(seen
              ? cacheHas(seen, computed)
              : includes(result, computed, comparator)
            )) {
          othIndex = othLength;
          while (--othIndex) {
            var cache = caches[othIndex];
            if (!(cache
                  ? cacheHas(cache, computed)
                  : includes(arrays[othIndex], computed, comparator))
                ) {
              continue outer;
            }
          }
          if (seen) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }
    function baseInverter(object, setter, iteratee, accumulator) {
      baseForOwn(object, function(value, key, object) {
        setter(accumulator, iteratee(value), key, object);
      });
      return accumulator;
    }
    function baseInvoke(object, path, args) {
      path = castPath(path, object);
      object = parent(object, path);
      var func = object == null ? object : object[toKey(last(path))];
      return func == null ? undefined$1 : apply(func, object, args);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsArrayBuffer(value) {
      return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
    }
    function baseIsDate(value) {
      return isObjectLike(value) && baseGetTag(value) == dateTag;
    }
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag(object),
          othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];
        if (noCustomizer && data[2]) {
          if (objValue === undefined$1 && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined$1
                ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsRegExp(value) {
      return isObjectLike(value) && baseGetTag(value) == regexpTag;
    }
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseIteratee(value) {
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == 'object') {
        return isArray(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
      }
      return property(value);
    }
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];
      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseLt(value, other) {
      return value < other;
    }
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike(collection) ? Array(collection.length) : [];
      baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get(object, path);
        return (objValue === undefined$1 && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack);
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
          var newValue = customizer
            ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
            : undefined$1;
          if (newValue === undefined$1) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key),
          srcValue = safeGet(source, key),
          stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined$1;
      var isCommon = newValue === undefined$1;
      if (isCommon) {
        var isArr = isArray(srcValue),
            isBuff = !isArr && isBuffer(srcValue),
            isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          }
          else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          }
          else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          }
          else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          }
          else {
            newValue = [];
          }
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          }
          else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        }
        else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    function baseNth(array, n) {
      var length = array.length;
      if (!length) {
        return;
      }
      n += n < 0 ? length : 0;
      return isIndex(n, length) ? array[n] : undefined$1;
    }
    function baseOrderBy(collection, iteratees, orders) {
      var index = -1;
      iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(getIteratee()));
      var result = baseMap(collection, function(value, key, collection) {
        var criteria = arrayMap(iteratees, function(iteratee) {
          return iteratee(value);
        });
        return { 'criteria': criteria, 'index': ++index, 'value': value };
      });
      return baseSortBy(result, function(object, other) {
        return compareMultiple(object, other, orders);
      });
    }
    function basePick(object, paths) {
      return basePickBy(object, paths, function(value, path) {
        return hasIn(object, path);
      });
    }
    function basePickBy(object, paths, predicate) {
      var index = -1,
          length = paths.length,
          result = {};
      while (++index < length) {
        var path = paths[index],
            value = baseGet(object, path);
        if (predicate(value, path)) {
          baseSet(result, castPath(path, object), value);
        }
      }
      return result;
    }
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }
    function basePullAll(array, values, iteratee, comparator) {
      var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
          index = -1,
          length = values.length,
          seen = array;
      if (array === values) {
        values = copyArray(values);
      }
      if (iteratee) {
        seen = arrayMap(array, baseUnary(iteratee));
      }
      while (++index < length) {
        var fromIndex = 0,
            value = values[index],
            computed = iteratee ? iteratee(value) : value;
        while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
          if (seen !== array) {
            splice.call(seen, fromIndex, 1);
          }
          splice.call(array, fromIndex, 1);
        }
      }
      return array;
    }
    function basePullAt(array, indexes) {
      var length = array ? indexes.length : 0,
          lastIndex = length - 1;
      while (length--) {
        var index = indexes[length];
        if (length == lastIndex || index !== previous) {
          var previous = index;
          if (isIndex(index)) {
            splice.call(array, index, 1);
          } else {
            baseUnset(array, index);
          }
        }
      }
      return array;
    }
    function baseRandom(lower, upper) {
      return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
    }
    function baseRange(start, end, step, fromRight) {
      var index = -1,
          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);
      while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
      }
      return result;
    }
    function baseRepeat(string, n) {
      var result = '';
      if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
        return result;
      }
      do {
        if (n % 2) {
          result += string;
        }
        n = nativeFloor(n / 2);
        if (n) {
          string += string;
        }
      } while (n);
      return result;
    }
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }
    function baseSample(collection) {
      return arraySample(values(collection));
    }
    function baseSampleSize(collection, n) {
      var array = values(collection);
      return shuffleSelf(array, baseClamp(n, 0, array.length));
    }
    function baseSet(object, path, value, customizer) {
      if (!isObject(object)) {
        return object;
      }
      path = castPath(path, object);
      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          nested = object;
      while (nested != null && ++index < length) {
        var key = toKey(path[index]),
            newValue = value;
        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
          if (newValue === undefined$1) {
            newValue = isObject(objValue)
              ? objValue
              : (isIndex(path[index + 1]) ? [] : {});
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    var baseSetData = !metaMap ? identity : function(func, data) {
      metaMap.set(func, data);
      return func;
    };
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };
    function baseShuffle(collection) {
      return shuffleSelf(values(collection));
    }
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    function baseSome(collection, predicate) {
      var result;
      baseEach(collection, function(value, index, collection) {
        result = predicate(value, index, collection);
        return !result;
      });
      return !!result;
    }
    function baseSortedIndex(array, value, retHighest) {
      var low = 0,
          high = array == null ? low : array.length;
      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
        while (low < high) {
          var mid = (low + high) >>> 1,
              computed = array[mid];
          if (computed !== null && !isSymbol(computed) &&
              (retHighest ? (computed <= value) : (computed < value))) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return high;
      }
      return baseSortedIndexBy(array, value, identity, retHighest);
    }
    function baseSortedIndexBy(array, value, iteratee, retHighest) {
      value = iteratee(value);
      var low = 0,
          high = array == null ? 0 : array.length,
          valIsNaN = value !== value,
          valIsNull = value === null,
          valIsSymbol = isSymbol(value),
          valIsUndefined = value === undefined$1;
      while (low < high) {
        var mid = nativeFloor((low + high) / 2),
            computed = iteratee(array[mid]),
            othIsDefined = computed !== undefined$1,
            othIsNull = computed === null,
            othIsReflexive = computed === computed,
            othIsSymbol = isSymbol(computed);
        if (valIsNaN) {
          var setLow = retHighest || othIsReflexive;
        } else if (valIsUndefined) {
          setLow = othIsReflexive && (retHighest || othIsDefined);
        } else if (valIsNull) {
          setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
        } else if (valIsSymbol) {
          setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
        } else if (othIsNull || othIsSymbol) {
          setLow = false;
        } else {
          setLow = retHighest ? (computed <= value) : (computed < value);
        }
        if (setLow) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return nativeMin(high, MAX_ARRAY_INDEX);
    }
    function baseSortedUniq(array, iteratee) {
      var index = -1,
          length = array.length,
          resIndex = 0,
          result = [];
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;
        if (!index || !eq(computed, seen)) {
          var seen = computed;
          result[resIndex++] = value === 0 ? 0 : value;
        }
      }
      return result;
    }
    function baseToNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      return +value;
    }
    function baseToString(value) {
      if (typeof value == 'string') {
        return value;
      }
      if (isArray(value)) {
        return arrayMap(value, baseToString) + '';
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }
    function baseUniq(array, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          length = array.length,
          isCommon = true,
          result = [],
          seen = result;
      if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
      }
      else if (length >= LARGE_ARRAY_SIZE) {
        var set = iteratee ? null : createSet(array);
        if (set) {
          return setToArray(set);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache;
      }
      else {
        seen = iteratee ? [] : result;
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;
        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        }
        else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }
    function baseUnset(object, path) {
      path = castPath(path, object);
      object = parent(object, path);
      return object == null || delete object[toKey(last(path))];
    }
    function baseUpdate(object, path, updater, customizer) {
      return baseSet(object, path, updater(baseGet(object, path)), customizer);
    }
    function baseWhile(array, predicate, isDrop, fromRight) {
      var length = array.length,
          index = fromRight ? length : -1;
      while ((fromRight ? index-- : ++index < length) &&
        predicate(array[index], index, array)) {}
      return isDrop
        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
    }
    function baseWrapperValue(value, actions) {
      var result = value;
      if (result instanceof LazyWrapper) {
        result = result.value();
      }
      return arrayReduce(actions, function(result, action) {
        return action.func.apply(action.thisArg, arrayPush([result], action.args));
      }, result);
    }
    function baseXor(arrays, iteratee, comparator) {
      var length = arrays.length;
      if (length < 2) {
        return length ? baseUniq(arrays[0]) : [];
      }
      var index = -1,
          result = Array(length);
      while (++index < length) {
        var array = arrays[index],
            othIndex = -1;
        while (++othIndex < length) {
          if (othIndex != index) {
            result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
          }
        }
      }
      return baseUniq(baseFlatten(result, 1), iteratee, comparator);
    }
    function baseZipObject(props, values, assignFunc) {
      var index = -1,
          length = props.length,
          valsLength = values.length,
          result = {};
      while (++index < length) {
        var value = index < valsLength ? values[index] : undefined$1;
        assignFunc(result, props[index], value);
      }
      return result;
    }
    function castArrayLikeObject(value) {
      return isArrayLikeObject(value) ? value : [];
    }
    function castFunction(value) {
      return typeof value == 'function' ? value : identity;
    }
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }
    var castRest = baseRest;
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === undefined$1 ? length : end;
      return (!start && end >= length) ? array : baseSlice(array, start, end);
    }
    var clearTimeout = ctxClearTimeout || function(id) {
      return root.clearTimeout(id);
    };
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    function compareAscending(value, other) {
      if (value !== other) {
        var valIsDefined = value !== undefined$1,
            valIsNull = value === null,
            valIsReflexive = value === value,
            valIsSymbol = isSymbol(value);
        var othIsDefined = other !== undefined$1,
            othIsNull = other === null,
            othIsReflexive = other === other,
            othIsSymbol = isSymbol(other);
        if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
            (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
            (valIsNull && othIsDefined && othIsReflexive) ||
            (!valIsDefined && othIsReflexive) ||
            !valIsReflexive) {
          return 1;
        }
        if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
            (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
            (othIsNull && valIsDefined && valIsReflexive) ||
            (!othIsDefined && valIsReflexive) ||
            !othIsReflexive) {
          return -1;
        }
      }
      return 0;
    }
    function compareMultiple(object, other, orders) {
      var index = -1,
          objCriteria = object.criteria,
          othCriteria = other.criteria,
          length = objCriteria.length,
          ordersLength = orders.length;
      while (++index < length) {
        var result = compareAscending(objCriteria[index], othCriteria[index]);
        if (result) {
          if (index >= ordersLength) {
            return result;
          }
          var order = orders[index];
          return result * (order == 'desc' ? -1 : 1);
        }
      }
      return object.index - other.index;
    }
    function composeArgs(args, partials, holders, isCurried) {
      var argsIndex = -1,
          argsLength = args.length,
          holdersLength = holders.length,
          leftIndex = -1,
          leftLength = partials.length,
          rangeLength = nativeMax(argsLength - holdersLength, 0),
          result = Array(leftLength + rangeLength),
          isUncurried = !isCurried;
      while (++leftIndex < leftLength) {
        result[leftIndex] = partials[leftIndex];
      }
      while (++argsIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
          result[holders[argsIndex]] = args[argsIndex];
        }
      }
      while (rangeLength--) {
        result[leftIndex++] = args[argsIndex++];
      }
      return result;
    }
    function composeArgsRight(args, partials, holders, isCurried) {
      var argsIndex = -1,
          argsLength = args.length,
          holdersIndex = -1,
          holdersLength = holders.length,
          rightIndex = -1,
          rightLength = partials.length,
          rangeLength = nativeMax(argsLength - holdersLength, 0),
          result = Array(rangeLength + rightLength),
          isUncurried = !isCurried;
      while (++argsIndex < rangeLength) {
        result[argsIndex] = args[argsIndex];
      }
      var offset = argsIndex;
      while (++rightIndex < rightLength) {
        result[offset + rightIndex] = partials[rightIndex];
      }
      while (++holdersIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
          result[offset + holders[holdersIndex]] = args[argsIndex++];
        }
      }
      return result;
    }
    function copyArray(source, array) {
      var index = -1,
          length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1,
          length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined$1;
        if (newValue === undefined$1) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }
    function createAggregator(setter, initializer) {
      return function(collection, iteratee) {
        var func = isArray(collection) ? arrayAggregator : baseAggregator,
            accumulator = initializer ? initializer() : {};
        return func(collection, setter, getIteratee(iteratee, 2), accumulator);
      };
    }
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined$1,
            guard = length > 2 ? sources[2] : undefined$1;
        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined$1;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined$1 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);
        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    function createBind(func, bitmask, thisArg) {
      var isBind = bitmask & WRAP_BIND_FLAG,
          Ctor = createCtor(func);
      function wrapper() {
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(isBind ? thisArg : this, arguments);
      }
      return wrapper;
    }
    function createCaseFirst(methodName) {
      return function(string) {
        string = toString(string);
        var strSymbols = hasUnicode(string)
          ? stringToArray(string)
          : undefined$1;
        var chr = strSymbols
          ? strSymbols[0]
          : string.charAt(0);
        var trailing = strSymbols
          ? castSlice(strSymbols, 1).join('')
          : string.slice(1);
        return chr[methodName]() + trailing;
      };
    }
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
      };
    }
    function createCtor(Ctor) {
      return function() {
        var args = arguments;
        switch (args.length) {
          case 0: return new Ctor;
          case 1: return new Ctor(args[0]);
          case 2: return new Ctor(args[0], args[1]);
          case 3: return new Ctor(args[0], args[1], args[2]);
          case 4: return new Ctor(args[0], args[1], args[2], args[3]);
          case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
          case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
          case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        }
        var thisBinding = baseCreate(Ctor.prototype),
            result = Ctor.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      };
    }
    function createCurry(func, bitmask, arity) {
      var Ctor = createCtor(func);
      function wrapper() {
        var length = arguments.length,
            args = Array(length),
            index = length,
            placeholder = getHolder(wrapper);
        while (index--) {
          args[index] = arguments[index];
        }
        var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
          ? []
          : replaceHolders(args, placeholder);
        length -= holders.length;
        if (length < arity) {
          return createRecurry(
            func, bitmask, createHybrid, wrapper.placeholder, undefined$1,
            args, holders, undefined$1, undefined$1, arity - length);
        }
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return apply(fn, this, args);
      }
      return wrapper;
    }
    function createFind(findIndexFunc) {
      return function(collection, predicate, fromIndex) {
        var iterable = Object(collection);
        if (!isArrayLike(collection)) {
          var iteratee = getIteratee(predicate, 3);
          collection = keys(collection);
          predicate = function(key) { return iteratee(iterable[key], key, iterable); };
        }
        var index = findIndexFunc(collection, predicate, fromIndex);
        return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined$1;
      };
    }
    function createFlow(fromRight) {
      return flatRest(function(funcs) {
        var length = funcs.length,
            index = length,
            prereq = LodashWrapper.prototype.thru;
        if (fromRight) {
          funcs.reverse();
        }
        while (index--) {
          var func = funcs[index];
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
            var wrapper = new LodashWrapper([], true);
          }
        }
        index = wrapper ? index : length;
        while (++index < length) {
          func = funcs[index];
          var funcName = getFuncName(func),
              data = funcName == 'wrapper' ? getData(func) : undefined$1;
          if (data && isLaziable(data[0]) &&
                data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) &&
                !data[4].length && data[9] == 1
              ) {
            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
          } else {
            wrapper = (func.length == 1 && isLaziable(func))
              ? wrapper[funcName]()
              : wrapper.thru(func);
          }
        }
        return function() {
          var args = arguments,
              value = args[0];
          if (wrapper && args.length == 1 && isArray(value)) {
            return wrapper.plant(value).value();
          }
          var index = 0,
              result = length ? funcs[index].apply(this, args) : value;
          while (++index < length) {
            result = funcs[index].call(this, result);
          }
          return result;
        };
      });
    }
    function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
      var isAry = bitmask & WRAP_ARY_FLAG,
          isBind = bitmask & WRAP_BIND_FLAG,
          isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
          isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
          isFlip = bitmask & WRAP_FLIP_FLAG,
          Ctor = isBindKey ? undefined$1 : createCtor(func);
      function wrapper() {
        var length = arguments.length,
            args = Array(length),
            index = length;
        while (index--) {
          args[index] = arguments[index];
        }
        if (isCurried) {
          var placeholder = getHolder(wrapper),
              holdersCount = countHolders(args, placeholder);
        }
        if (partials) {
          args = composeArgs(args, partials, holders, isCurried);
        }
        if (partialsRight) {
          args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
        }
        length -= holdersCount;
        if (isCurried && length < arity) {
          var newHolders = replaceHolders(args, placeholder);
          return createRecurry(
            func, bitmask, createHybrid, wrapper.placeholder, thisArg,
            args, newHolders, argPos, ary, arity - length
          );
        }
        var thisBinding = isBind ? thisArg : this,
            fn = isBindKey ? thisBinding[func] : func;
        length = args.length;
        if (argPos) {
          args = reorder(args, argPos);
        } else if (isFlip && length > 1) {
          args.reverse();
        }
        if (isAry && ary < length) {
          args.length = ary;
        }
        if (this && this !== root && this instanceof wrapper) {
          fn = Ctor || createCtor(fn);
        }
        return fn.apply(thisBinding, args);
      }
      return wrapper;
    }
    function createInverter(setter, toIteratee) {
      return function(object, iteratee) {
        return baseInverter(object, setter, toIteratee(iteratee), {});
      };
    }
    function createMathOperation(operator, defaultValue) {
      return function(value, other) {
        var result;
        if (value === undefined$1 && other === undefined$1) {
          return defaultValue;
        }
        if (value !== undefined$1) {
          result = value;
        }
        if (other !== undefined$1) {
          if (result === undefined$1) {
            return other;
          }
          if (typeof value == 'string' || typeof other == 'string') {
            value = baseToString(value);
            other = baseToString(other);
          } else {
            value = baseToNumber(value);
            other = baseToNumber(other);
          }
          result = operator(value, other);
        }
        return result;
      };
    }
    function createOver(arrayFunc) {
      return flatRest(function(iteratees) {
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        return baseRest(function(args) {
          var thisArg = this;
          return arrayFunc(iteratees, function(iteratee) {
            return apply(iteratee, thisArg, args);
          });
        });
      });
    }
    function createPadding(length, chars) {
      chars = chars === undefined$1 ? ' ' : baseToString(chars);
      var charsLength = chars.length;
      if (charsLength < 2) {
        return charsLength ? baseRepeat(chars, length) : chars;
      }
      var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
      return hasUnicode(chars)
        ? castSlice(stringToArray(result), 0, length).join('')
        : result.slice(0, length);
    }
    function createPartial(func, bitmask, thisArg, partials) {
      var isBind = bitmask & WRAP_BIND_FLAG,
          Ctor = createCtor(func);
      function wrapper() {
        var argsIndex = -1,
            argsLength = arguments.length,
            leftIndex = -1,
            leftLength = partials.length,
            args = Array(leftLength + argsLength),
            fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        while (++leftIndex < leftLength) {
          args[leftIndex] = partials[leftIndex];
        }
        while (argsLength--) {
          args[leftIndex++] = arguments[++argsIndex];
        }
        return apply(fn, isBind ? thisArg : this, args);
      }
      return wrapper;
    }
    function createRange(fromRight) {
      return function(start, end, step) {
        if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
          end = step = undefined$1;
        }
        start = toFinite(start);
        if (end === undefined$1) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        step = step === undefined$1 ? (start < end ? 1 : -1) : toFinite(step);
        return baseRange(start, end, step, fromRight);
      };
    }
    function createRelationalOperation(operator) {
      return function(value, other) {
        if (!(typeof value == 'string' && typeof other == 'string')) {
          value = toNumber(value);
          other = toNumber(other);
        }
        return operator(value, other);
      };
    }
    function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
      var isCurry = bitmask & WRAP_CURRY_FLAG,
          newHolders = isCurry ? holders : undefined$1,
          newHoldersRight = isCurry ? undefined$1 : holders,
          newPartials = isCurry ? partials : undefined$1,
          newPartialsRight = isCurry ? undefined$1 : partials;
      bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
      bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
      if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
        bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
      }
      var newData = [
        func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
        newHoldersRight, argPos, ary, arity
      ];
      var result = wrapFunc.apply(undefined$1, newData);
      if (isLaziable(func)) {
        setData(result, newData);
      }
      result.placeholder = placeholder;
      return setWrapToString(result, func, bitmask);
    }
    function createRound(methodName) {
      var func = Math[methodName];
      return function(number, precision) {
        number = toNumber(number);
        precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
        if (precision && nativeIsFinite(number)) {
          var pair = (toString(number) + 'e').split('e'),
              value = func(pair[0] + 'e' + (+pair[1] + precision));
          pair = (toString(value) + 'e').split('e');
          return +(pair[0] + 'e' + (+pair[1] - precision));
        }
        return func(number);
      };
    }
    var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
      return new Set(values);
    };
    function createToPairs(keysFunc) {
      return function(object) {
        var tag = getTag(object);
        if (tag == mapTag) {
          return mapToArray(object);
        }
        if (tag == setTag) {
          return setToPairs(object);
        }
        return baseToPairs(object, keysFunc(object));
      };
    }
    function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
      var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
      if (!isBindKey && typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var length = partials ? partials.length : 0;
      if (!length) {
        bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
        partials = holders = undefined$1;
      }
      ary = ary === undefined$1 ? ary : nativeMax(toInteger(ary), 0);
      arity = arity === undefined$1 ? arity : toInteger(arity);
      length -= holders ? holders.length : 0;
      if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
        var partialsRight = partials,
            holdersRight = holders;
        partials = holders = undefined$1;
      }
      var data = isBindKey ? undefined$1 : getData(func);
      var newData = [
        func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
        argPos, ary, arity
      ];
      if (data) {
        mergeData(newData, data);
      }
      func = newData[0];
      bitmask = newData[1];
      thisArg = newData[2];
      partials = newData[3];
      holders = newData[4];
      arity = newData[9] = newData[9] === undefined$1
        ? (isBindKey ? 0 : func.length)
        : nativeMax(newData[9] - length, 0);
      if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
        bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
      }
      if (!bitmask || bitmask == WRAP_BIND_FLAG) {
        var result = createBind(func, bitmask, thisArg);
      } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
        result = createCurry(func, bitmask, arity);
      } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
        result = createPartial(func, bitmask, thisArg, partials);
      } else {
        result = createHybrid.apply(undefined$1, newData);
      }
      var setter = data ? baseSetData : setData;
      return setWrapToString(setter(result, newData), func, bitmask);
    }
    function customDefaultsAssignIn(objValue, srcValue, key, object) {
      if (objValue === undefined$1 ||
          (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        return srcValue;
      }
      return objValue;
    }
    function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
      if (isObject(objValue) && isObject(srcValue)) {
        stack.set(srcValue, objValue);
        baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
        stack['delete'](srcValue);
      }
      return objValue;
    }
    function customOmitClone(value) {
      return isPlainObject(value) ? undefined$1 : value;
    }
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined$1;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];
        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined$1) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == (other + '');
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];
        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === undefined$1
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }
    function flatRest(func) {
      return setToString(overRest(func, undefined$1, flatten), func + '');
    }
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }
    var getData = !metaMap ? noop : function(func) {
      return metaMap.get(func);
    };
    function getFuncName(func) {
      var result = (func.name + ''),
          array = realNames[result],
          length = hasOwnProperty.call(realNames, result) ? array.length : 0;
      while (length--) {
        var data = array[length],
            otherFunc = data.func;
        if (otherFunc == null || otherFunc == func) {
          return data.name;
        }
      }
      return result;
    }
    function getHolder(func) {
      var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
      return object.placeholder;
    }
    function getIteratee() {
      var result = lodash.iteratee || iteratee;
      result = result === iteratee ? baseIteratee : result;
      return arguments.length ? result(arguments[0], arguments[1]) : result;
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }
    function getMatchData(object) {
      var result = keys(object),
          length = result.length;
      while (length--) {
        var key = result[length],
            value = object[key];
        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined$1;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];
      try {
        value[symToStringTag] = undefined$1;
        var unmasked = true;
      } catch (e) {}
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };
    var getTag = baseGetTag;
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map && getTag(new Map) != mapTag) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag ? value.constructor : undefined$1,
            ctorString = Ctor ? toSource(Ctor) : '';
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }
    function getView(start, end, transforms) {
      var index = -1,
          length = transforms.length;
      while (++index < length) {
        var data = transforms[index],
            size = data.size;
        switch (data.type) {
          case 'drop':      start += size; break;
          case 'dropRight': end -= size; break;
          case 'take':      end = nativeMin(end, start + size); break;
          case 'takeRight': start = nativeMax(start, end - size); break;
        }
      }
      return { 'start': start, 'end': end };
    }
    function getWrapDetails(source) {
      var match = source.match(reWrapDetails);
      return match ? match[1].split(reSplitDetails) : [];
    }
    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);
      var index = -1,
          length = path.length,
          result = false;
      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) &&
        (isArray(object) || isArguments(object));
    }
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);
      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return new Ctor;
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return new Ctor;
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    function insertWrapDetails(source, details) {
      var length = details.length;
      if (!length) {
        return source;
      }
      var lastIndex = length - 1;
      details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
      details = details.join(length > 2 ? ', ' : ' ');
      return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
    }
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
    }
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }
    function isLaziable(func) {
      var funcName = getFuncName(func),
          other = lodash[funcName];
      if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
        return false;
      }
      if (func === other) {
        return true;
      }
      var data = getData(other);
      return !!data && func === data[0];
    }
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }
    var isMaskable = coreJsData ? isFunction : stubFalse;
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
      return value === proto;
    }
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined$1 || (key in Object(object)));
      };
    }
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });
      var cache = result.cache;
      return result;
    }
    function mergeData(data, source) {
      var bitmask = data[1],
          srcBitmask = source[1],
          newBitmask = bitmask | srcBitmask,
          isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
      var isCombo =
        ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
        ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
        ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));
      if (!(isCommon || isCombo)) {
        return data;
      }
      if (srcBitmask & WRAP_BIND_FLAG) {
        data[2] = source[2];
        newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
      }
      var value = source[3];
      if (value) {
        var partials = data[3];
        data[3] = partials ? composeArgs(partials, value, source[4]) : value;
        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
      }
      value = source[5];
      if (value) {
        partials = data[5];
        data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
      }
      value = source[7];
      if (value) {
        data[7] = value;
      }
      if (srcBitmask & WRAP_ARY_FLAG) {
        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
      }
      if (data[9] == null) {
        data[9] = source[9];
      }
      data[0] = source[0];
      data[1] = newBitmask;
      return data;
    }
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined$1 ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function parent(object, path) {
      return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
    }
    function reorder(array, indexes) {
      var arrLength = array.length,
          length = nativeMin(indexes.length, arrLength),
          oldArray = copyArray(array);
      while (length--) {
        var index = indexes[length];
        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
      }
      return array;
    }
    function safeGet(object, key) {
      if (key === 'constructor' && typeof object[key] === 'function') {
        return;
      }
      if (key == '__proto__') {
        return;
      }
      return object[key];
    }
    var setData = shortOut(baseSetData);
    var setTimeout = ctxSetTimeout || function(func, wait) {
      return root.setTimeout(func, wait);
    };
    var setToString = shortOut(baseSetToString);
    function setWrapToString(wrapper, reference, bitmask) {
      var source = (reference + '');
      return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
    }
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;
      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined$1, arguments);
      };
    }
    function shuffleSelf(array, size) {
      var index = -1,
          length = array.length,
          lastIndex = length - 1;
      size = size === undefined$1 ? length : size;
      while (++index < size) {
        var rand = baseRandom(index, lastIndex),
            value = array[rand];
        array[rand] = array[index];
        array[index] = value;
      }
      array.length = size;
      return array;
    }
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 ) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }
    function updateWrapDetails(details, bitmask) {
      arrayEach(wrapFlags, function(pair) {
        var value = '_.' + pair[0];
        if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
          details.push(value);
        }
      });
      return details.sort();
    }
    function wrapperClone(wrapper) {
      if (wrapper instanceof LazyWrapper) {
        return wrapper.clone();
      }
      var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
      result.__actions__ = copyArray(wrapper.__actions__);
      result.__index__  = wrapper.__index__;
      result.__values__ = wrapper.__values__;
      return result;
    }
    function chunk(array, size, guard) {
      if ((guard ? isIterateeCall(array, size, guard) : size === undefined$1)) {
        size = 1;
      } else {
        size = nativeMax(toInteger(size), 0);
      }
      var length = array == null ? 0 : array.length;
      if (!length || size < 1) {
        return [];
      }
      var index = 0,
          resIndex = 0,
          result = Array(nativeCeil(length / size));
      while (index < length) {
        result[resIndex++] = baseSlice(array, index, (index += size));
      }
      return result;
    }
    function compact(array) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];
      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function concat() {
      var length = arguments.length;
      if (!length) {
        return [];
      }
      var args = Array(length - 1),
          array = arguments[0],
          index = length;
      while (index--) {
        args[index - 1] = arguments[index];
      }
      return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
    }
    var difference = baseRest(function(array, values) {
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
        : [];
    });
    var differenceBy = baseRest(function(array, values) {
      var iteratee = last(values);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined$1;
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2))
        : [];
    });
    var differenceWith = baseRest(function(array, values) {
      var comparator = last(values);
      if (isArrayLikeObject(comparator)) {
        comparator = undefined$1;
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined$1, comparator)
        : [];
    });
    function drop(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined$1) ? 1 : toInteger(n);
      return baseSlice(array, n < 0 ? 0 : n, length);
    }
    function dropRight(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined$1) ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }
    function dropRightWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), true, true)
        : [];
    }
    function dropWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), true)
        : [];
    }
    function fill(array, value, start, end) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
        start = 0;
        end = length;
      }
      return baseFill(array, value, start, end);
    }
    function findIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return baseFindIndex(array, getIteratee(predicate, 3), index);
    }
    function findLastIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = length - 1;
      if (fromIndex !== undefined$1) {
        index = toInteger(fromIndex);
        index = fromIndex < 0
          ? nativeMax(length + index, 0)
          : nativeMin(index, length - 1);
      }
      return baseFindIndex(array, getIteratee(predicate, 3), index, true);
    }
    function flatten(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, 1) : [];
    }
    function flattenDeep(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, INFINITY) : [];
    }
    function flattenDepth(array, depth) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      depth = depth === undefined$1 ? 1 : toInteger(depth);
      return baseFlatten(array, depth);
    }
    function fromPairs(pairs) {
      var index = -1,
          length = pairs == null ? 0 : pairs.length,
          result = {};
      while (++index < length) {
        var pair = pairs[index];
        result[pair[0]] = pair[1];
      }
      return result;
    }
    function head(array) {
      return (array && array.length) ? array[0] : undefined$1;
    }
    function indexOf(array, value, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return baseIndexOf(array, value, index);
    }
    function initial(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseSlice(array, 0, -1) : [];
    }
    var intersection = baseRest(function(arrays) {
      var mapped = arrayMap(arrays, castArrayLikeObject);
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped)
        : [];
    });
    var intersectionBy = baseRest(function(arrays) {
      var iteratee = last(arrays),
          mapped = arrayMap(arrays, castArrayLikeObject);
      if (iteratee === last(mapped)) {
        iteratee = undefined$1;
      } else {
        mapped.pop();
      }
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, getIteratee(iteratee, 2))
        : [];
    });
    var intersectionWith = baseRest(function(arrays) {
      var comparator = last(arrays),
          mapped = arrayMap(arrays, castArrayLikeObject);
      comparator = typeof comparator == 'function' ? comparator : undefined$1;
      if (comparator) {
        mapped.pop();
      }
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, undefined$1, comparator)
        : [];
    });
    function join(array, separator) {
      return array == null ? '' : nativeJoin.call(array, separator);
    }
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : undefined$1;
    }
    function lastIndexOf(array, value, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = length;
      if (fromIndex !== undefined$1) {
        index = toInteger(fromIndex);
        index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
      }
      return value === value
        ? strictLastIndexOf(array, value, index)
        : baseFindIndex(array, baseIsNaN, index, true);
    }
    function nth(array, n) {
      return (array && array.length) ? baseNth(array, toInteger(n)) : undefined$1;
    }
    var pull = baseRest(pullAll);
    function pullAll(array, values) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values)
        : array;
    }
    function pullAllBy(array, values, iteratee) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values, getIteratee(iteratee, 2))
        : array;
    }
    function pullAllWith(array, values, comparator) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values, undefined$1, comparator)
        : array;
    }
    var pullAt = flatRest(function(array, indexes) {
      var length = array == null ? 0 : array.length,
          result = baseAt(array, indexes);
      basePullAt(array, arrayMap(indexes, function(index) {
        return isIndex(index, length) ? +index : index;
      }).sort(compareAscending));
      return result;
    });
    function remove(array, predicate) {
      var result = [];
      if (!(array && array.length)) {
        return result;
      }
      var index = -1,
          indexes = [],
          length = array.length;
      predicate = getIteratee(predicate, 3);
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result.push(value);
          indexes.push(index);
        }
      }
      basePullAt(array, indexes);
      return result;
    }
    function reverse(array) {
      return array == null ? array : nativeReverse.call(array);
    }
    function slice(array, start, end) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
        start = 0;
        end = length;
      }
      else {
        start = start == null ? 0 : toInteger(start);
        end = end === undefined$1 ? length : toInteger(end);
      }
      return baseSlice(array, start, end);
    }
    function sortedIndex(array, value) {
      return baseSortedIndex(array, value);
    }
    function sortedIndexBy(array, value, iteratee) {
      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
    }
    function sortedIndexOf(array, value) {
      var length = array == null ? 0 : array.length;
      if (length) {
        var index = baseSortedIndex(array, value);
        if (index < length && eq(array[index], value)) {
          return index;
        }
      }
      return -1;
    }
    function sortedLastIndex(array, value) {
      return baseSortedIndex(array, value, true);
    }
    function sortedLastIndexBy(array, value, iteratee) {
      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
    }
    function sortedLastIndexOf(array, value) {
      var length = array == null ? 0 : array.length;
      if (length) {
        var index = baseSortedIndex(array, value, true) - 1;
        if (eq(array[index], value)) {
          return index;
        }
      }
      return -1;
    }
    function sortedUniq(array) {
      return (array && array.length)
        ? baseSortedUniq(array)
        : [];
    }
    function sortedUniqBy(array, iteratee) {
      return (array && array.length)
        ? baseSortedUniq(array, getIteratee(iteratee, 2))
        : [];
    }
    function tail(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseSlice(array, 1, length) : [];
    }
    function take(array, n, guard) {
      if (!(array && array.length)) {
        return [];
      }
      n = (guard || n === undefined$1) ? 1 : toInteger(n);
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }
    function takeRight(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined$1) ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, n < 0 ? 0 : n, length);
    }
    function takeRightWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), false, true)
        : [];
    }
    function takeWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3))
        : [];
    }
    var union = baseRest(function(arrays) {
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
    });
    var unionBy = baseRest(function(arrays) {
      var iteratee = last(arrays);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined$1;
      }
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
    });
    var unionWith = baseRest(function(arrays) {
      var comparator = last(arrays);
      comparator = typeof comparator == 'function' ? comparator : undefined$1;
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
    });
    function uniq(array) {
      return (array && array.length) ? baseUniq(array) : [];
    }
    function uniqBy(array, iteratee) {
      return (array && array.length) ? baseUniq(array, getIteratee(iteratee, 2)) : [];
    }
    function uniqWith(array, comparator) {
      comparator = typeof comparator == 'function' ? comparator : undefined$1;
      return (array && array.length) ? baseUniq(array, undefined$1, comparator) : [];
    }
    function unzip(array) {
      if (!(array && array.length)) {
        return [];
      }
      var length = 0;
      array = arrayFilter(array, function(group) {
        if (isArrayLikeObject(group)) {
          length = nativeMax(group.length, length);
          return true;
        }
      });
      return baseTimes(length, function(index) {
        return arrayMap(array, baseProperty(index));
      });
    }
    function unzipWith(array, iteratee) {
      if (!(array && array.length)) {
        return [];
      }
      var result = unzip(array);
      if (iteratee == null) {
        return result;
      }
      return arrayMap(result, function(group) {
        return apply(iteratee, undefined$1, group);
      });
    }
    var without = baseRest(function(array, values) {
      return isArrayLikeObject(array)
        ? baseDifference(array, values)
        : [];
    });
    var xor = baseRest(function(arrays) {
      return baseXor(arrayFilter(arrays, isArrayLikeObject));
    });
    var xorBy = baseRest(function(arrays) {
      var iteratee = last(arrays);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined$1;
      }
      return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
    });
    var xorWith = baseRest(function(arrays) {
      var comparator = last(arrays);
      comparator = typeof comparator == 'function' ? comparator : undefined$1;
      return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
    });
    var zip = baseRest(unzip);
    function zipObject(props, values) {
      return baseZipObject(props || [], values || [], assignValue);
    }
    function zipObjectDeep(props, values) {
      return baseZipObject(props || [], values || [], baseSet);
    }
    var zipWith = baseRest(function(arrays) {
      var length = arrays.length,
          iteratee = length > 1 ? arrays[length - 1] : undefined$1;
      iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined$1;
      return unzipWith(arrays, iteratee);
    });
    function chain(value) {
      var result = lodash(value);
      result.__chain__ = true;
      return result;
    }
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }
    function thru(value, interceptor) {
      return interceptor(value);
    }
    var wrapperAt = flatRest(function(paths) {
      var length = paths.length,
          start = length ? paths[0] : 0,
          value = this.__wrapped__,
          interceptor = function(object) { return baseAt(object, paths); };
      if (length > 1 || this.__actions__.length ||
          !(value instanceof LazyWrapper) || !isIndex(start)) {
        return this.thru(interceptor);
      }
      value = value.slice(start, +start + (length ? 1 : 0));
      value.__actions__.push({
        'func': thru,
        'args': [interceptor],
        'thisArg': undefined$1
      });
      return new LodashWrapper(value, this.__chain__).thru(function(array) {
        if (length && !array.length) {
          array.push(undefined$1);
        }
        return array;
      });
    });
    function wrapperChain() {
      return chain(this);
    }
    function wrapperCommit() {
      return new LodashWrapper(this.value(), this.__chain__);
    }
    function wrapperNext() {
      if (this.__values__ === undefined$1) {
        this.__values__ = toArray(this.value());
      }
      var done = this.__index__ >= this.__values__.length,
          value = done ? undefined$1 : this.__values__[this.__index__++];
      return { 'done': done, 'value': value };
    }
    function wrapperToIterator() {
      return this;
    }
    function wrapperPlant(value) {
      var result,
          parent = this;
      while (parent instanceof baseLodash) {
        var clone = wrapperClone(parent);
        clone.__index__ = 0;
        clone.__values__ = undefined$1;
        if (result) {
          previous.__wrapped__ = clone;
        } else {
          result = clone;
        }
        var previous = clone;
        parent = parent.__wrapped__;
      }
      previous.__wrapped__ = value;
      return result;
    }
    function wrapperReverse() {
      var value = this.__wrapped__;
      if (value instanceof LazyWrapper) {
        var wrapped = value;
        if (this.__actions__.length) {
          wrapped = new LazyWrapper(this);
        }
        wrapped = wrapped.reverse();
        wrapped.__actions__.push({
          'func': thru,
          'args': [reverse],
          'thisArg': undefined$1
        });
        return new LodashWrapper(wrapped, this.__chain__);
      }
      return this.thru(reverse);
    }
    function wrapperValue() {
      return baseWrapperValue(this.__wrapped__, this.__actions__);
    }
    var countBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        ++result[key];
      } else {
        baseAssignValue(result, key, 1);
      }
    });
    function every(collection, predicate, guard) {
      var func = isArray(collection) ? arrayEvery : baseEvery;
      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined$1;
      }
      return func(collection, getIteratee(predicate, 3));
    }
    function filter(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, getIteratee(predicate, 3));
    }
    var find = createFind(findIndex);
    var findLast = createFind(findLastIndex);
    function flatMap(collection, iteratee) {
      return baseFlatten(map(collection, iteratee), 1);
    }
    function flatMapDeep(collection, iteratee) {
      return baseFlatten(map(collection, iteratee), INFINITY);
    }
    function flatMapDepth(collection, iteratee, depth) {
      depth = depth === undefined$1 ? 1 : toInteger(depth);
      return baseFlatten(map(collection, iteratee), depth);
    }
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, getIteratee(iteratee, 3));
    }
    function forEachRight(collection, iteratee) {
      var func = isArray(collection) ? arrayEachRight : baseEachRight;
      return func(collection, getIteratee(iteratee, 3));
    }
    var groupBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        result[key].push(value);
      } else {
        baseAssignValue(result, key, [value]);
      }
    });
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;
      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
    }
    var invokeMap = baseRest(function(collection, path, args) {
      var index = -1,
          isFunc = typeof path == 'function',
          result = isArrayLike(collection) ? Array(collection.length) : [];
      baseEach(collection, function(value) {
        result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
      });
      return result;
    });
    var keyBy = createAggregator(function(result, value, key) {
      baseAssignValue(result, key, value);
    });
    function map(collection, iteratee) {
      var func = isArray(collection) ? arrayMap : baseMap;
      return func(collection, getIteratee(iteratee, 3));
    }
    function orderBy(collection, iteratees, orders, guard) {
      if (collection == null) {
        return [];
      }
      if (!isArray(iteratees)) {
        iteratees = iteratees == null ? [] : [iteratees];
      }
      orders = guard ? undefined$1 : orders;
      if (!isArray(orders)) {
        orders = orders == null ? [] : [orders];
      }
      return baseOrderBy(collection, iteratees, orders);
    }
    var partition = createAggregator(function(result, value, key) {
      result[key ? 0 : 1].push(value);
    }, function() { return [[], []]; });
    function reduce(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduce : baseReduce,
          initAccum = arguments.length < 3;
      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
    }
    function reduceRight(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduceRight : baseReduce,
          initAccum = arguments.length < 3;
      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
    }
    function reject(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, negate(getIteratee(predicate, 3)));
    }
    function sample(collection) {
      var func = isArray(collection) ? arraySample : baseSample;
      return func(collection);
    }
    function sampleSize(collection, n, guard) {
      if ((guard ? isIterateeCall(collection, n, guard) : n === undefined$1)) {
        n = 1;
      } else {
        n = toInteger(n);
      }
      var func = isArray(collection) ? arraySampleSize : baseSampleSize;
      return func(collection, n);
    }
    function shuffle(collection) {
      var func = isArray(collection) ? arrayShuffle : baseShuffle;
      return func(collection);
    }
    function size(collection) {
      if (collection == null) {
        return 0;
      }
      if (isArrayLike(collection)) {
        return isString(collection) ? stringSize(collection) : collection.length;
      }
      var tag = getTag(collection);
      if (tag == mapTag || tag == setTag) {
        return collection.size;
      }
      return baseKeys(collection).length;
    }
    function some(collection, predicate, guard) {
      var func = isArray(collection) ? arraySome : baseSome;
      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined$1;
      }
      return func(collection, getIteratee(predicate, 3));
    }
    var sortBy = baseRest(function(collection, iteratees) {
      if (collection == null) {
        return [];
      }
      var length = iteratees.length;
      if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
        iteratees = [];
      } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
        iteratees = [iteratees[0]];
      }
      return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
    });
    var now = ctxNow || function() {
      return root.Date.now();
    };
    function after(n, func) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }
    function ary(func, n, guard) {
      n = guard ? undefined$1 : n;
      n = (func && n == null) ? func.length : n;
      return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
    }
    function before(n, func) {
      var result;
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = undefined$1;
        }
        return result;
      };
    }
    var bind = baseRest(function(func, thisArg, partials) {
      var bitmask = WRAP_BIND_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, getHolder(bind));
        bitmask |= WRAP_PARTIAL_FLAG;
      }
      return createWrap(func, bitmask, thisArg, partials, holders);
    });
    var bindKey = baseRest(function(object, key, partials) {
      var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, getHolder(bindKey));
        bitmask |= WRAP_PARTIAL_FLAG;
      }
      return createWrap(key, bitmask, object, partials, holders);
    });
    function curry(func, arity, guard) {
      arity = guard ? undefined$1 : arity;
      var result = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
      result.placeholder = curry.placeholder;
      return result;
    }
    function curryRight(func, arity, guard) {
      arity = guard ? undefined$1 : arity;
      var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
      result.placeholder = curryRight.placeholder;
      return result;
    }
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;
        lastArgs = lastThis = undefined$1;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;
        return maxing
          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;
        return (lastCallTime === undefined$1 || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = undefined$1;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined$1;
        return result;
      }
      function cancel() {
        if (timerId !== undefined$1) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined$1;
      }
      function flush() {
        return timerId === undefined$1 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === undefined$1) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined$1) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    var defer = baseRest(function(func, args) {
      return baseDelay(func, 1, args);
    });
    var delay = baseRest(function(func, wait, args) {
      return baseDelay(func, toNumber(wait) || 0, args);
    });
    function flip(func) {
      return createWrap(func, WRAP_FLIP_FLAG);
    }
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }
    memoize.Cache = MapCache;
    function negate(predicate) {
      if (typeof predicate != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function() {
        var args = arguments;
        switch (args.length) {
          case 0: return !predicate.call(this);
          case 1: return !predicate.call(this, args[0]);
          case 2: return !predicate.call(this, args[0], args[1]);
          case 3: return !predicate.call(this, args[0], args[1], args[2]);
        }
        return !predicate.apply(this, args);
      };
    }
    function once(func) {
      return before(2, func);
    }
    var overArgs = castRest(function(func, transforms) {
      transforms = (transforms.length == 1 && isArray(transforms[0]))
        ? arrayMap(transforms[0], baseUnary(getIteratee()))
        : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
      var funcsLength = transforms.length;
      return baseRest(function(args) {
        var index = -1,
            length = nativeMin(args.length, funcsLength);
        while (++index < length) {
          args[index] = transforms[index].call(this, args[index]);
        }
        return apply(func, this, args);
      });
    });
    var partial = baseRest(function(func, partials) {
      var holders = replaceHolders(partials, getHolder(partial));
      return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
    });
    var partialRight = baseRest(function(func, partials) {
      var holders = replaceHolders(partials, getHolder(partialRight));
      return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
    });
    var rearg = flatRest(function(func, indexes) {
      return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
    });
    function rest(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = start === undefined$1 ? start : toInteger(start);
      return baseRest(func, start);
    }
    function spread(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = start == null ? 0 : nativeMax(toInteger(start), 0);
      return baseRest(function(args) {
        var array = args[start],
            otherArgs = castSlice(args, 0, start);
        if (array) {
          arrayPush(otherArgs, array);
        }
        return apply(func, this, otherArgs);
      });
    }
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        'leading': leading,
        'maxWait': wait,
        'trailing': trailing
      });
    }
    function unary(func) {
      return ary(func, 1);
    }
    function wrap(value, wrapper) {
      return partial(castFunction(wrapper), value);
    }
    function castArray() {
      if (!arguments.length) {
        return [];
      }
      var value = arguments[0];
      return isArray(value) ? value : [value];
    }
    function clone(value) {
      return baseClone(value, CLONE_SYMBOLS_FLAG);
    }
    function cloneWith(value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined$1;
      return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
    }
    function cloneDeep(value) {
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }
    function cloneDeepWith(value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined$1;
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
    }
    function conformsTo(object, source) {
      return source == null || baseConformsTo(object, source, keys(source));
    }
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }
    var gt = createRelationalOperation(baseGt);
    var gte = createRelationalOperation(function(value, other) {
      return value >= other;
    });
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };
    var isArray = Array.isArray;
    var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    function isBoolean(value) {
      return value === true || value === false ||
        (isObjectLike(value) && baseGetTag(value) == boolTag);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
    function isElement(value) {
      return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
    }
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike(value) &&
          (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
            isBuffer(value) || isTypedArray(value) || isArguments(value))) {
        return !value.length;
      }
      var tag = getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (isPrototype(value)) {
        return !baseKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty.call(value, key)) {
          return false;
        }
      }
      return true;
    }
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    function isEqualWith(value, other, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined$1;
      var result = customizer ? customizer(value, other) : undefined$1;
      return result === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result;
    }
    function isError(value) {
      if (!isObjectLike(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == errorTag || tag == domExcTag ||
        (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
    }
    function isFinite(value) {
      return typeof value == 'number' && nativeIsFinite(value);
    }
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isInteger(value) {
      return typeof value == 'number' && value == toInteger(value);
    }
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    function isMatch(object, source) {
      return object === source || baseIsMatch(object, source, getMatchData(source));
    }
    function isMatchWith(object, source, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined$1;
      return baseIsMatch(object, source, getMatchData(source), customizer);
    }
    function isNaN(value) {
      return isNumber(value) && value != +value;
    }
    function isNative(value) {
      if (isMaskable(value)) {
        throw new Error(CORE_ERROR_TEXT);
      }
      return baseIsNative(value);
    }
    function isNull(value) {
      return value === null;
    }
    function isNil(value) {
      return value == null;
    }
    function isNumber(value) {
      return typeof value == 'number' ||
        (isObjectLike(value) && baseGetTag(value) == numberTag);
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString.call(Ctor) == objectCtorString;
    }
    var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
    function isSafeInteger(value) {
      return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
    }
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
    }
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function isUndefined(value) {
      return value === undefined$1;
    }
    function isWeakMap(value) {
      return isObjectLike(value) && getTag(value) == weakMapTag;
    }
    function isWeakSet(value) {
      return isObjectLike(value) && baseGetTag(value) == weakSetTag;
    }
    var lt = createRelationalOperation(baseLt);
    var lte = createRelationalOperation(function(value, other) {
      return value <= other;
    });
    function toArray(value) {
      if (!value) {
        return [];
      }
      if (isArrayLike(value)) {
        return isString(value) ? stringToArray(value) : copyArray(value);
      }
      if (symIterator && value[symIterator]) {
        return iteratorToArray(value[symIterator]());
      }
      var tag = getTag(value),
          func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);
      return func(value);
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;
      return result === result ? (remainder ? result - remainder : result) : 0;
    }
    function toLength(value) {
      return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
    }
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    function toSafeInteger(value) {
      return value
        ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)
        : (value === 0 ? value : 0);
    }
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }
    var assign = createAssigner(function(object, source) {
      if (isPrototype(source) || isArrayLike(source)) {
        copyObject(source, keys(source), object);
        return;
      }
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          assignValue(object, key, source[key]);
        }
      }
    });
    var assignIn = createAssigner(function(object, source) {
      copyObject(source, keysIn(source), object);
    });
    var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keysIn(source), object, customizer);
    });
    var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keys(source), object, customizer);
    });
    var at = flatRest(baseAt);
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties == null ? result : baseAssign(result, properties);
    }
    var defaults = baseRest(function(object, sources) {
      object = Object(object);
      var index = -1;
      var length = sources.length;
      var guard = length > 2 ? sources[2] : undefined$1;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        length = 1;
      }
      while (++index < length) {
        var source = sources[index];
        var props = keysIn(source);
        var propsIndex = -1;
        var propsLength = props.length;
        while (++propsIndex < propsLength) {
          var key = props[propsIndex];
          var value = object[key];
          if (value === undefined$1 ||
              (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
            object[key] = source[key];
          }
        }
      }
      return object;
    });
    var defaultsDeep = baseRest(function(args) {
      args.push(undefined$1, customDefaultsMerge);
      return apply(mergeWith, undefined$1, args);
    });
    function findKey(object, predicate) {
      return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
    }
    function findLastKey(object, predicate) {
      return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
    }
    function forIn(object, iteratee) {
      return object == null
        ? object
        : baseFor(object, getIteratee(iteratee, 3), keysIn);
    }
    function forInRight(object, iteratee) {
      return object == null
        ? object
        : baseForRight(object, getIteratee(iteratee, 3), keysIn);
    }
    function forOwn(object, iteratee) {
      return object && baseForOwn(object, getIteratee(iteratee, 3));
    }
    function forOwnRight(object, iteratee) {
      return object && baseForOwnRight(object, getIteratee(iteratee, 3));
    }
    function functions(object) {
      return object == null ? [] : baseFunctions(object, keys(object));
    }
    function functionsIn(object) {
      return object == null ? [] : baseFunctions(object, keysIn(object));
    }
    function get(object, path, defaultValue) {
      var result = object == null ? undefined$1 : baseGet(object, path);
      return result === undefined$1 ? defaultValue : result;
    }
    function has(object, path) {
      return object != null && hasPath(object, path, baseHas);
    }
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }
    var invert = createInverter(function(result, value, key) {
      if (value != null &&
          typeof value.toString != 'function') {
        value = nativeObjectToString.call(value);
      }
      result[value] = key;
    }, constant(identity));
    var invertBy = createInverter(function(result, value, key) {
      if (value != null &&
          typeof value.toString != 'function') {
        value = nativeObjectToString.call(value);
      }
      if (hasOwnProperty.call(result, value)) {
        result[value].push(key);
      } else {
        result[value] = [key];
      }
    }, getIteratee);
    var invoke = baseRest(baseInvoke);
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    function mapKeys(object, iteratee) {
      var result = {};
      iteratee = getIteratee(iteratee, 3);
      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, iteratee(value, key, object), value);
      });
      return result;
    }
    function mapValues(object, iteratee) {
      var result = {};
      iteratee = getIteratee(iteratee, 3);
      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, key, iteratee(value, key, object));
      });
      return result;
    }
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
      baseMerge(object, source, srcIndex, customizer);
    });
    var omit = flatRest(function(object, paths) {
      var result = {};
      if (object == null) {
        return result;
      }
      var isDeep = false;
      paths = arrayMap(paths, function(path) {
        path = castPath(path, object);
        isDeep || (isDeep = path.length > 1);
        return path;
      });
      copyObject(object, getAllKeysIn(object), result);
      if (isDeep) {
        result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
      }
      var length = paths.length;
      while (length--) {
        baseUnset(result, paths[length]);
      }
      return result;
    });
    function omitBy(object, predicate) {
      return pickBy(object, negate(getIteratee(predicate)));
    }
    var pick = flatRest(function(object, paths) {
      return object == null ? {} : basePick(object, paths);
    });
    function pickBy(object, predicate) {
      if (object == null) {
        return {};
      }
      var props = arrayMap(getAllKeysIn(object), function(prop) {
        return [prop];
      });
      predicate = getIteratee(predicate);
      return basePickBy(object, props, function(value, path) {
        return predicate(value, path[0]);
      });
    }
    function result(object, path, defaultValue) {
      path = castPath(path, object);
      var index = -1,
          length = path.length;
      if (!length) {
        length = 1;
        object = undefined$1;
      }
      while (++index < length) {
        var value = object == null ? undefined$1 : object[toKey(path[index])];
        if (value === undefined$1) {
          index = length;
          value = defaultValue;
        }
        object = isFunction(value) ? value.call(object) : value;
      }
      return object;
    }
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }
    function setWith(object, path, value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined$1;
      return object == null ? object : baseSet(object, path, value, customizer);
    }
    var toPairs = createToPairs(keys);
    var toPairsIn = createToPairs(keysIn);
    function transform(object, iteratee, accumulator) {
      var isArr = isArray(object),
          isArrLike = isArr || isBuffer(object) || isTypedArray(object);
      iteratee = getIteratee(iteratee, 4);
      if (accumulator == null) {
        var Ctor = object && object.constructor;
        if (isArrLike) {
          accumulator = isArr ? new Ctor : [];
        }
        else if (isObject(object)) {
          accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
        }
        else {
          accumulator = {};
        }
      }
      (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
        return iteratee(accumulator, value, index, object);
      });
      return accumulator;
    }
    function unset(object, path) {
      return object == null ? true : baseUnset(object, path);
    }
    function update(object, path, updater) {
      return object == null ? object : baseUpdate(object, path, castFunction(updater));
    }
    function updateWith(object, path, updater, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined$1;
      return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
    }
    function values(object) {
      return object == null ? [] : baseValues(object, keys(object));
    }
    function valuesIn(object) {
      return object == null ? [] : baseValues(object, keysIn(object));
    }
    function clamp(number, lower, upper) {
      if (upper === undefined$1) {
        upper = lower;
        lower = undefined$1;
      }
      if (upper !== undefined$1) {
        upper = toNumber(upper);
        upper = upper === upper ? upper : 0;
      }
      if (lower !== undefined$1) {
        lower = toNumber(lower);
        lower = lower === lower ? lower : 0;
      }
      return baseClamp(toNumber(number), lower, upper);
    }
    function inRange(number, start, end) {
      start = toFinite(start);
      if (end === undefined$1) {
        end = start;
        start = 0;
      } else {
        end = toFinite(end);
      }
      number = toNumber(number);
      return baseInRange(number, start, end);
    }
    function random(lower, upper, floating) {
      if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
        upper = floating = undefined$1;
      }
      if (floating === undefined$1) {
        if (typeof upper == 'boolean') {
          floating = upper;
          upper = undefined$1;
        }
        else if (typeof lower == 'boolean') {
          floating = lower;
          lower = undefined$1;
        }
      }
      if (lower === undefined$1 && upper === undefined$1) {
        lower = 0;
        upper = 1;
      }
      else {
        lower = toFinite(lower);
        if (upper === undefined$1) {
          upper = lower;
          lower = 0;
        } else {
          upper = toFinite(upper);
        }
      }
      if (lower > upper) {
        var temp = lower;
        lower = upper;
        upper = temp;
      }
      if (floating || lower % 1 || upper % 1) {
        var rand = nativeRandom();
        return nativeMin(lower + (rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1)))), upper);
      }
      return baseRandom(lower, upper);
    }
    var camelCase = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? capitalize(word) : word);
    });
    function capitalize(string) {
      return upperFirst(toString(string).toLowerCase());
    }
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
    }
    function endsWith(string, target, position) {
      string = toString(string);
      target = baseToString(target);
      var length = string.length;
      position = position === undefined$1
        ? length
        : baseClamp(toInteger(position), 0, length);
      var end = position;
      position -= target.length;
      return position >= 0 && string.slice(position, end) == target;
    }
    function escape(string) {
      string = toString(string);
      return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }
    function escapeRegExp(string) {
      string = toString(string);
      return (string && reHasRegExpChar.test(string))
        ? string.replace(reRegExpChar, '\\$&')
        : string;
    }
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? '-' : '') + word.toLowerCase();
    });
    var lowerCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + word.toLowerCase();
    });
    var lowerFirst = createCaseFirst('toLowerCase');
    function pad(string, length, chars) {
      string = toString(string);
      length = toInteger(length);
      var strLength = length ? stringSize(string) : 0;
      if (!length || strLength >= length) {
        return string;
      }
      var mid = (length - strLength) / 2;
      return (
        createPadding(nativeFloor(mid), chars) +
        string +
        createPadding(nativeCeil(mid), chars)
      );
    }
    function padEnd(string, length, chars) {
      string = toString(string);
      length = toInteger(length);
      var strLength = length ? stringSize(string) : 0;
      return (length && strLength < length)
        ? (string + createPadding(length - strLength, chars))
        : string;
    }
    function padStart(string, length, chars) {
      string = toString(string);
      length = toInteger(length);
      var strLength = length ? stringSize(string) : 0;
      return (length && strLength < length)
        ? (createPadding(length - strLength, chars) + string)
        : string;
    }
    function parseInt(string, radix, guard) {
      if (guard || radix == null) {
        radix = 0;
      } else if (radix) {
        radix = +radix;
      }
      return nativeParseInt(toString(string).replace(reTrimStart, ''), radix || 0);
    }
    function repeat(string, n, guard) {
      if ((guard ? isIterateeCall(string, n, guard) : n === undefined$1)) {
        n = 1;
      } else {
        n = toInteger(n);
      }
      return baseRepeat(toString(string), n);
    }
    function replace() {
      var args = arguments,
          string = toString(args[0]);
      return args.length < 3 ? string : string.replace(args[1], args[2]);
    }
    var snakeCase = createCompounder(function(result, word, index) {
      return result + (index ? '_' : '') + word.toLowerCase();
    });
    function split(string, separator, limit) {
      if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
        separator = limit = undefined$1;
      }
      limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
      if (!limit) {
        return [];
      }
      string = toString(string);
      if (string && (
            typeof separator == 'string' ||
            (separator != null && !isRegExp(separator))
          )) {
        separator = baseToString(separator);
        if (!separator && hasUnicode(string)) {
          return castSlice(stringToArray(string), 0, limit);
        }
      }
      return string.split(separator, limit);
    }
    var startCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + upperFirst(word);
    });
    function startsWith(string, target, position) {
      string = toString(string);
      position = position == null
        ? 0
        : baseClamp(toInteger(position), 0, string.length);
      target = baseToString(target);
      return string.slice(position, position + target.length) == target;
    }
    function template(string, options, guard) {
      var settings = lodash.templateSettings;
      if (guard && isIterateeCall(string, options, guard)) {
        options = undefined$1;
      }
      string = toString(string);
      options = assignInWith({}, options, settings, customDefaultsAssignIn);
      var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
          importsKeys = keys(imports),
          importsValues = baseValues(imports, importsKeys);
      var isEscaping,
          isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');
      var sourceURL = '//# sourceURL=' +
        (hasOwnProperty.call(options, 'sourceURL')
          ? (options.sourceURL + '').replace(/[\r\n]/g, ' ')
          : ('lodash.templateSources[' + (++templateCounter) + ']')
        ) + '\n';
      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);
        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
        if (escapeValue) {
          isEscaping = true;
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;
        return match;
      });
      source += "';\n";
      var variable = hasOwnProperty.call(options, 'variable') && options.variable;
      if (!variable) {
        source = 'with (obj) {\n' + source + '\n}\n';
      }
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');
      source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
          ? ''
          : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
           ? ', __e = _.escape'
           : ''
        ) +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';
      var result = attempt(function() {
        return Function(importsKeys, sourceURL + 'return ' + source)
          .apply(undefined$1, importsValues);
      });
      result.source = source;
      if (isError(result)) {
        throw result;
      }
      return result;
    }
    function toLower(value) {
      return toString(value).toLowerCase();
    }
    function toUpper(value) {
      return toString(value).toUpperCase();
    }
    function trim(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined$1)) {
        return string.replace(reTrim, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          chrSymbols = stringToArray(chars),
          start = charsStartIndex(strSymbols, chrSymbols),
          end = charsEndIndex(strSymbols, chrSymbols) + 1;
      return castSlice(strSymbols, start, end).join('');
    }
    function trimEnd(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined$1)) {
        return string.replace(reTrimEnd, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
      return castSlice(strSymbols, 0, end).join('');
    }
    function trimStart(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined$1)) {
        return string.replace(reTrimStart, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          start = charsStartIndex(strSymbols, stringToArray(chars));
      return castSlice(strSymbols, start).join('');
    }
    function truncate(string, options) {
      var length = DEFAULT_TRUNC_LENGTH,
          omission = DEFAULT_TRUNC_OMISSION;
      if (isObject(options)) {
        var separator = 'separator' in options ? options.separator : separator;
        length = 'length' in options ? toInteger(options.length) : length;
        omission = 'omission' in options ? baseToString(options.omission) : omission;
      }
      string = toString(string);
      var strLength = string.length;
      if (hasUnicode(string)) {
        var strSymbols = stringToArray(string);
        strLength = strSymbols.length;
      }
      if (length >= strLength) {
        return string;
      }
      var end = length - stringSize(omission);
      if (end < 1) {
        return omission;
      }
      var result = strSymbols
        ? castSlice(strSymbols, 0, end).join('')
        : string.slice(0, end);
      if (separator === undefined$1) {
        return result + omission;
      }
      if (strSymbols) {
        end += (result.length - end);
      }
      if (isRegExp(separator)) {
        if (string.slice(end).search(separator)) {
          var match,
              substring = result;
          if (!separator.global) {
            separator = RegExp(separator.source, toString(reFlags.exec(separator)) + 'g');
          }
          separator.lastIndex = 0;
          while ((match = separator.exec(substring))) {
            var newEnd = match.index;
          }
          result = result.slice(0, newEnd === undefined$1 ? end : newEnd);
        }
      } else if (string.indexOf(baseToString(separator), end) != end) {
        var index = result.lastIndexOf(separator);
        if (index > -1) {
          result = result.slice(0, index);
        }
      }
      return result + omission;
    }
    function unescape(string) {
      string = toString(string);
      return (string && reHasEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, unescapeHtmlChar)
        : string;
    }
    var upperCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + word.toUpperCase();
    });
    var upperFirst = createCaseFirst('toUpperCase');
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? undefined$1 : pattern;
      if (pattern === undefined$1) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    var attempt = baseRest(function(func, args) {
      try {
        return apply(func, undefined$1, args);
      } catch (e) {
        return isError(e) ? e : new Error(e);
      }
    });
    var bindAll = flatRest(function(object, methodNames) {
      arrayEach(methodNames, function(key) {
        key = toKey(key);
        baseAssignValue(object, key, bind(object[key], object));
      });
      return object;
    });
    function cond(pairs) {
      var length = pairs == null ? 0 : pairs.length,
          toIteratee = getIteratee();
      pairs = !length ? [] : arrayMap(pairs, function(pair) {
        if (typeof pair[1] != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return [toIteratee(pair[0]), pair[1]];
      });
      return baseRest(function(args) {
        var index = -1;
        while (++index < length) {
          var pair = pairs[index];
          if (apply(pair[0], this, args)) {
            return apply(pair[1], this, args);
          }
        }
      });
    }
    function conforms(source) {
      return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
    }
    function constant(value) {
      return function() {
        return value;
      };
    }
    function defaultTo(value, defaultValue) {
      return (value == null || value !== value) ? defaultValue : value;
    }
    var flow = createFlow();
    var flowRight = createFlow(true);
    function identity(value) {
      return value;
    }
    function iteratee(func) {
      return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
    }
    function matches(source) {
      return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
    }
    function matchesProperty(path, srcValue) {
      return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
    }
    var method = baseRest(function(path, args) {
      return function(object) {
        return baseInvoke(object, path, args);
      };
    });
    var methodOf = baseRest(function(object, args) {
      return function(path) {
        return baseInvoke(object, path, args);
      };
    });
    function mixin(object, source, options) {
      var props = keys(source),
          methodNames = baseFunctions(source, props);
      if (options == null &&
          !(isObject(source) && (methodNames.length || !props.length))) {
        options = source;
        source = object;
        object = this;
        methodNames = baseFunctions(source, keys(source));
      }
      var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
          isFunc = isFunction(object);
      arrayEach(methodNames, function(methodName) {
        var func = source[methodName];
        object[methodName] = func;
        if (isFunc) {
          object.prototype[methodName] = function() {
            var chainAll = this.__chain__;
            if (chain || chainAll) {
              var result = object(this.__wrapped__),
                  actions = result.__actions__ = copyArray(this.__actions__);
              actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
              result.__chain__ = chainAll;
              return result;
            }
            return func.apply(object, arrayPush([this.value()], arguments));
          };
        }
      });
      return object;
    }
    function noConflict() {
      if (root._ === this) {
        root._ = oldDash;
      }
      return this;
    }
    function noop() {
    }
    function nthArg(n) {
      n = toInteger(n);
      return baseRest(function(args) {
        return baseNth(args, n);
      });
    }
    var over = createOver(arrayMap);
    var overEvery = createOver(arrayEvery);
    var overSome = createOver(arraySome);
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }
    function propertyOf(object) {
      return function(path) {
        return object == null ? undefined$1 : baseGet(object, path);
      };
    }
    var range = createRange();
    var rangeRight = createRange(true);
    function stubArray() {
      return [];
    }
    function stubFalse() {
      return false;
    }
    function stubObject() {
      return {};
    }
    function stubString() {
      return '';
    }
    function stubTrue() {
      return true;
    }
    function times(n, iteratee) {
      n = toInteger(n);
      if (n < 1 || n > MAX_SAFE_INTEGER) {
        return [];
      }
      var index = MAX_ARRAY_LENGTH,
          length = nativeMin(n, MAX_ARRAY_LENGTH);
      iteratee = getIteratee(iteratee);
      n -= MAX_ARRAY_LENGTH;
      var result = baseTimes(length, iteratee);
      while (++index < n) {
        iteratee(index);
      }
      return result;
    }
    function toPath(value) {
      if (isArray(value)) {
        return arrayMap(value, toKey);
      }
      return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
    }
    function uniqueId(prefix) {
      var id = ++idCounter;
      return toString(prefix) + id;
    }
    var add = createMathOperation(function(augend, addend) {
      return augend + addend;
    }, 0);
    var ceil = createRound('ceil');
    var divide = createMathOperation(function(dividend, divisor) {
      return dividend / divisor;
    }, 1);
    var floor = createRound('floor');
    function max(array) {
      return (array && array.length)
        ? baseExtremum(array, identity, baseGt)
        : undefined$1;
    }
    function maxBy(array, iteratee) {
      return (array && array.length)
        ? baseExtremum(array, getIteratee(iteratee, 2), baseGt)
        : undefined$1;
    }
    function mean(array) {
      return baseMean(array, identity);
    }
    function meanBy(array, iteratee) {
      return baseMean(array, getIteratee(iteratee, 2));
    }
    function min(array) {
      return (array && array.length)
        ? baseExtremum(array, identity, baseLt)
        : undefined$1;
    }
    function minBy(array, iteratee) {
      return (array && array.length)
        ? baseExtremum(array, getIteratee(iteratee, 2), baseLt)
        : undefined$1;
    }
    var multiply = createMathOperation(function(multiplier, multiplicand) {
      return multiplier * multiplicand;
    }, 1);
    var round = createRound('round');
    var subtract = createMathOperation(function(minuend, subtrahend) {
      return minuend - subtrahend;
    }, 0);
    function sum(array) {
      return (array && array.length)
        ? baseSum(array, identity)
        : 0;
    }
    function sumBy(array, iteratee) {
      return (array && array.length)
        ? baseSum(array, getIteratee(iteratee, 2))
        : 0;
    }
    lodash.after = after;
    lodash.ary = ary;
    lodash.assign = assign;
    lodash.assignIn = assignIn;
    lodash.assignInWith = assignInWith;
    lodash.assignWith = assignWith;
    lodash.at = at;
    lodash.before = before;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.castArray = castArray;
    lodash.chain = chain;
    lodash.chunk = chunk;
    lodash.compact = compact;
    lodash.concat = concat;
    lodash.cond = cond;
    lodash.conforms = conforms;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.curry = curry;
    lodash.curryRight = curryRight;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defaultsDeep = defaultsDeep;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.differenceBy = differenceBy;
    lodash.differenceWith = differenceWith;
    lodash.drop = drop;
    lodash.dropRight = dropRight;
    lodash.dropRightWhile = dropRightWhile;
    lodash.dropWhile = dropWhile;
    lodash.fill = fill;
    lodash.filter = filter;
    lodash.flatMap = flatMap;
    lodash.flatMapDeep = flatMapDeep;
    lodash.flatMapDepth = flatMapDepth;
    lodash.flatten = flatten;
    lodash.flattenDeep = flattenDeep;
    lodash.flattenDepth = flattenDepth;
    lodash.flip = flip;
    lodash.flow = flow;
    lodash.flowRight = flowRight;
    lodash.fromPairs = fromPairs;
    lodash.functions = functions;
    lodash.functionsIn = functionsIn;
    lodash.groupBy = groupBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.intersectionBy = intersectionBy;
    lodash.intersectionWith = intersectionWith;
    lodash.invert = invert;
    lodash.invertBy = invertBy;
    lodash.invokeMap = invokeMap;
    lodash.iteratee = iteratee;
    lodash.keyBy = keyBy;
    lodash.keys = keys;
    lodash.keysIn = keysIn;
    lodash.map = map;
    lodash.mapKeys = mapKeys;
    lodash.mapValues = mapValues;
    lodash.matches = matches;
    lodash.matchesProperty = matchesProperty;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.mergeWith = mergeWith;
    lodash.method = method;
    lodash.methodOf = methodOf;
    lodash.mixin = mixin;
    lodash.negate = negate;
    lodash.nthArg = nthArg;
    lodash.omit = omit;
    lodash.omitBy = omitBy;
    lodash.once = once;
    lodash.orderBy = orderBy;
    lodash.over = over;
    lodash.overArgs = overArgs;
    lodash.overEvery = overEvery;
    lodash.overSome = overSome;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.partition = partition;
    lodash.pick = pick;
    lodash.pickBy = pickBy;
    lodash.property = property;
    lodash.propertyOf = propertyOf;
    lodash.pull = pull;
    lodash.pullAll = pullAll;
    lodash.pullAllBy = pullAllBy;
    lodash.pullAllWith = pullAllWith;
    lodash.pullAt = pullAt;
    lodash.range = range;
    lodash.rangeRight = rangeRight;
    lodash.rearg = rearg;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.reverse = reverse;
    lodash.sampleSize = sampleSize;
    lodash.set = set;
    lodash.setWith = setWith;
    lodash.shuffle = shuffle;
    lodash.slice = slice;
    lodash.sortBy = sortBy;
    lodash.sortedUniq = sortedUniq;
    lodash.sortedUniqBy = sortedUniqBy;
    lodash.split = split;
    lodash.spread = spread;
    lodash.tail = tail;
    lodash.take = take;
    lodash.takeRight = takeRight;
    lodash.takeRightWhile = takeRightWhile;
    lodash.takeWhile = takeWhile;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.thru = thru;
    lodash.toArray = toArray;
    lodash.toPairs = toPairs;
    lodash.toPairsIn = toPairsIn;
    lodash.toPath = toPath;
    lodash.toPlainObject = toPlainObject;
    lodash.transform = transform;
    lodash.unary = unary;
    lodash.union = union;
    lodash.unionBy = unionBy;
    lodash.unionWith = unionWith;
    lodash.uniq = uniq;
    lodash.uniqBy = uniqBy;
    lodash.uniqWith = uniqWith;
    lodash.unset = unset;
    lodash.unzip = unzip;
    lodash.unzipWith = unzipWith;
    lodash.update = update;
    lodash.updateWith = updateWith;
    lodash.values = values;
    lodash.valuesIn = valuesIn;
    lodash.without = without;
    lodash.words = words;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.xorBy = xorBy;
    lodash.xorWith = xorWith;
    lodash.zip = zip;
    lodash.zipObject = zipObject;
    lodash.zipObjectDeep = zipObjectDeep;
    lodash.zipWith = zipWith;
    lodash.entries = toPairs;
    lodash.entriesIn = toPairsIn;
    lodash.extend = assignIn;
    lodash.extendWith = assignInWith;
    mixin(lodash, lodash);
    lodash.add = add;
    lodash.attempt = attempt;
    lodash.camelCase = camelCase;
    lodash.capitalize = capitalize;
    lodash.ceil = ceil;
    lodash.clamp = clamp;
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.cloneDeepWith = cloneDeepWith;
    lodash.cloneWith = cloneWith;
    lodash.conformsTo = conformsTo;
    lodash.deburr = deburr;
    lodash.defaultTo = defaultTo;
    lodash.divide = divide;
    lodash.endsWith = endsWith;
    lodash.eq = eq;
    lodash.escape = escape;
    lodash.escapeRegExp = escapeRegExp;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.floor = floor;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.get = get;
    lodash.gt = gt;
    lodash.gte = gte;
    lodash.has = has;
    lodash.hasIn = hasIn;
    lodash.head = head;
    lodash.identity = identity;
    lodash.includes = includes;
    lodash.indexOf = indexOf;
    lodash.inRange = inRange;
    lodash.invoke = invoke;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isArrayBuffer = isArrayBuffer;
    lodash.isArrayLike = isArrayLike;
    lodash.isArrayLikeObject = isArrayLikeObject;
    lodash.isBoolean = isBoolean;
    lodash.isBuffer = isBuffer;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isEqualWith = isEqualWith;
    lodash.isError = isError;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isInteger = isInteger;
    lodash.isLength = isLength;
    lodash.isMap = isMap;
    lodash.isMatch = isMatch;
    lodash.isMatchWith = isMatchWith;
    lodash.isNaN = isNaN;
    lodash.isNative = isNative;
    lodash.isNil = isNil;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isObjectLike = isObjectLike;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isSafeInteger = isSafeInteger;
    lodash.isSet = isSet;
    lodash.isString = isString;
    lodash.isSymbol = isSymbol;
    lodash.isTypedArray = isTypedArray;
    lodash.isUndefined = isUndefined;
    lodash.isWeakMap = isWeakMap;
    lodash.isWeakSet = isWeakSet;
    lodash.join = join;
    lodash.kebabCase = kebabCase;
    lodash.last = last;
    lodash.lastIndexOf = lastIndexOf;
    lodash.lowerCase = lowerCase;
    lodash.lowerFirst = lowerFirst;
    lodash.lt = lt;
    lodash.lte = lte;
    lodash.max = max;
    lodash.maxBy = maxBy;
    lodash.mean = mean;
    lodash.meanBy = meanBy;
    lodash.min = min;
    lodash.minBy = minBy;
    lodash.stubArray = stubArray;
    lodash.stubFalse = stubFalse;
    lodash.stubObject = stubObject;
    lodash.stubString = stubString;
    lodash.stubTrue = stubTrue;
    lodash.multiply = multiply;
    lodash.nth = nth;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.pad = pad;
    lodash.padEnd = padEnd;
    lodash.padStart = padStart;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.repeat = repeat;
    lodash.replace = replace;
    lodash.result = result;
    lodash.round = round;
    lodash.runInContext = runInContext;
    lodash.sample = sample;
    lodash.size = size;
    lodash.snakeCase = snakeCase;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.sortedIndexBy = sortedIndexBy;
    lodash.sortedIndexOf = sortedIndexOf;
    lodash.sortedLastIndex = sortedLastIndex;
    lodash.sortedLastIndexBy = sortedLastIndexBy;
    lodash.sortedLastIndexOf = sortedLastIndexOf;
    lodash.startCase = startCase;
    lodash.startsWith = startsWith;
    lodash.subtract = subtract;
    lodash.sum = sum;
    lodash.sumBy = sumBy;
    lodash.template = template;
    lodash.times = times;
    lodash.toFinite = toFinite;
    lodash.toInteger = toInteger;
    lodash.toLength = toLength;
    lodash.toLower = toLower;
    lodash.toNumber = toNumber;
    lodash.toSafeInteger = toSafeInteger;
    lodash.toString = toString;
    lodash.toUpper = toUpper;
    lodash.trim = trim;
    lodash.trimEnd = trimEnd;
    lodash.trimStart = trimStart;
    lodash.truncate = truncate;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;
    lodash.upperCase = upperCase;
    lodash.upperFirst = upperFirst;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.first = head;
    mixin(lodash, (function() {
      var source = {};
      baseForOwn(lodash, function(func, methodName) {
        if (!hasOwnProperty.call(lodash.prototype, methodName)) {
          source[methodName] = func;
        }
      });
      return source;
    }()), { 'chain': false });
    lodash.VERSION = VERSION;
    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
      lodash[methodName].placeholder = lodash;
    });
    arrayEach(['drop', 'take'], function(methodName, index) {
      LazyWrapper.prototype[methodName] = function(n) {
        n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);
        var result = (this.__filtered__ && !index)
          ? new LazyWrapper(this)
          : this.clone();
        if (result.__filtered__) {
          result.__takeCount__ = nativeMin(n, result.__takeCount__);
        } else {
          result.__views__.push({
            'size': nativeMin(n, MAX_ARRAY_LENGTH),
            'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
          });
        }
        return result;
      };
      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
        return this.reverse()[methodName](n).reverse();
      };
    });
    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
      var type = index + 1,
          isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
      LazyWrapper.prototype[methodName] = function(iteratee) {
        var result = this.clone();
        result.__iteratees__.push({
          'iteratee': getIteratee(iteratee, 3),
          'type': type
        });
        result.__filtered__ = result.__filtered__ || isFilter;
        return result;
      };
    });
    arrayEach(['head', 'last'], function(methodName, index) {
      var takeName = 'take' + (index ? 'Right' : '');
      LazyWrapper.prototype[methodName] = function() {
        return this[takeName](1).value()[0];
      };
    });
    arrayEach(['initial', 'tail'], function(methodName, index) {
      var dropName = 'drop' + (index ? '' : 'Right');
      LazyWrapper.prototype[methodName] = function() {
        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
      };
    });
    LazyWrapper.prototype.compact = function() {
      return this.filter(identity);
    };
    LazyWrapper.prototype.find = function(predicate) {
      return this.filter(predicate).head();
    };
    LazyWrapper.prototype.findLast = function(predicate) {
      return this.reverse().find(predicate);
    };
    LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
      if (typeof path == 'function') {
        return new LazyWrapper(this);
      }
      return this.map(function(value) {
        return baseInvoke(value, path, args);
      });
    });
    LazyWrapper.prototype.reject = function(predicate) {
      return this.filter(negate(getIteratee(predicate)));
    };
    LazyWrapper.prototype.slice = function(start, end) {
      start = toInteger(start);
      var result = this;
      if (result.__filtered__ && (start > 0 || end < 0)) {
        return new LazyWrapper(result);
      }
      if (start < 0) {
        result = result.takeRight(-start);
      } else if (start) {
        result = result.drop(start);
      }
      if (end !== undefined$1) {
        end = toInteger(end);
        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
      }
      return result;
    };
    LazyWrapper.prototype.takeRightWhile = function(predicate) {
      return this.reverse().takeWhile(predicate).reverse();
    };
    LazyWrapper.prototype.toArray = function() {
      return this.take(MAX_ARRAY_LENGTH);
    };
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
          isTaker = /^(?:head|last)$/.test(methodName),
          lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
          retUnwrapped = isTaker || /^find/.test(methodName);
      if (!lodashFunc) {
        return;
      }
      lodash.prototype[methodName] = function() {
        var value = this.__wrapped__,
            args = isTaker ? [1] : arguments,
            isLazy = value instanceof LazyWrapper,
            iteratee = args[0],
            useLazy = isLazy || isArray(value);
        var interceptor = function(value) {
          var result = lodashFunc.apply(lodash, arrayPush([value], args));
          return (isTaker && chainAll) ? result[0] : result;
        };
        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
          isLazy = useLazy = false;
        }
        var chainAll = this.__chain__,
            isHybrid = !!this.__actions__.length,
            isUnwrapped = retUnwrapped && !chainAll,
            onlyLazy = isLazy && !isHybrid;
        if (!retUnwrapped && useLazy) {
          value = onlyLazy ? value : new LazyWrapper(this);
          var result = func.apply(value, args);
          result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined$1 });
          return new LodashWrapper(result, chainAll);
        }
        if (isUnwrapped && onlyLazy) {
          return func.apply(this, args);
        }
        result = this.thru(interceptor);
        return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
      };
    });
    arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
      var func = arrayProto[methodName],
          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
          retUnwrapped = /^(?:pop|shift)$/.test(methodName);
      lodash.prototype[methodName] = function() {
        var args = arguments;
        if (retUnwrapped && !this.__chain__) {
          var value = this.value();
          return func.apply(isArray(value) ? value : [], args);
        }
        return this[chainName](function(value) {
          return func.apply(isArray(value) ? value : [], args);
        });
      };
    });
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var lodashFunc = lodash[methodName];
      if (lodashFunc) {
        var key = lodashFunc.name + '';
        if (!hasOwnProperty.call(realNames, key)) {
          realNames[key] = [];
        }
        realNames[key].push({ 'name': methodName, 'func': lodashFunc });
      }
    });
    realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
      'name': 'wrapper',
      'func': undefined$1
    }];
    LazyWrapper.prototype.clone = lazyClone;
    LazyWrapper.prototype.reverse = lazyReverse;
    LazyWrapper.prototype.value = lazyValue;
    lodash.prototype.at = wrapperAt;
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.commit = wrapperCommit;
    lodash.prototype.next = wrapperNext;
    lodash.prototype.plant = wrapperPlant;
    lodash.prototype.reverse = wrapperReverse;
    lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
    lodash.prototype.first = lodash.prototype.head;
    if (symIterator) {
      lodash.prototype[symIterator] = wrapperToIterator;
    }
    return lodash;
  });
  var _ = runInContext();
  if (freeModule) {
    (freeModule.exports = _)._ = _;
    freeExports._ = _;
  }
  else {
    root._ = _;
  }
}.call(commonjsGlobal));
});

const nowUnix = persianDateToUnix(new persianDate());
const config = writable(defaultconfig);
const isDirty = writable(false);
const selectedUnix = writable(nowUnix);
const viewUnix = writable(nowUnix);
const privateViewModeDerived = derived(config, ($config) => {
   return ($config && $config.viewMode) ? $config.viewMode : 'day'
});
const dateObject = writable(persianDate);
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
    obj.toCalendar(payload);
    obj.toLocale(currentLocale);
    obj.toLeapYearMode(get_store_value(config).calendar.persian.leapYearMode);
    dateObject.set( obj );
    viewUnix.set(get_store_value(selectedUnix));
  },
  setConfig (payload) {
    config.set(payload);
    this.onSetCalendar(get_store_value(config).calendarType);
  },
  updateConfig (key) {
    let ob = {};
    ob[key[0]] = key[1];
    let conf = JSON.stringify(get_store_value(config));
    conf = JSON.parse(conf);
    conf[key[0]] = key[1];
    config.update(() => {
      return {
        ...get_store_value(config),
        ...ob
      }
    });
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
    let conf = get_store_value(config);
    config.set(lodash.merge(conf, {
      viewMode: mode
    }));
  },
  setViewModeToUpperAvailableLevel() {
    let currentViewMode = get_store_value(privateViewModeDerived);
    let $config = get_store_value(config);
    if (currentViewMode === 'time') {
       if ($config.dayPicker.enabled) {
         this.setViewMode('day');
       } else if ($config.monthPicker.enabled) {
         this.setViewMode('month');
       } else if ($config.yearPicker.enabled) {
         this.setViewMode('year');
       }
    } else if (currentViewMode === 'day') {
       if ($config.monthPicker.enabled) {
         this.setViewMode('month');
       } else if ($config.yearPicker.enabled) {
         this.setViewMode('year');
       }
    } else if (currentViewMode === 'month') {
       if ($config.yearPicker.enabled) {
         this.setViewMode('year');
       }
    }
  },
  setViewModeToLowerAvailableLevel() {
    let currentViewMode = get_store_value(privateViewModeDerived);
    let $config = get_store_value(config);
    if (currentViewMode === 'year') {
       if ($config.monthPicker.enabled) {
         this.setViewMode('month');
       } else if ($config.dayPicker.enabled) {
         this.setViewMode('day');
       } else if ($config.timePicker.enabled) {
         this.setViewMode('time');
       }
    } else if (currentViewMode === 'month') {
       if ($config.dayPicker.enabled) {
         this.setViewMode('day');
       } else if ($config.timePicker.enabled) {
         this.setViewMode('time');
       }
    } else if (currentViewMode === 'day') {
       if ($config.timePicker.enabled && $config.timePicker.showAsLastStep) {
         this.setViewMode('time');
       }
    }
  },
  updateIsDirty(value) {
    isDirty.set(value);
  },
  onSelectNextView() {
    if (get_store_value(privateViewModeDerived) === 'day') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('month', 1)));
    }
    if (get_store_value(privateViewModeDerived) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('year', 1)));
    }
    if (get_store_value(privateViewModeDerived) === 'year') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('year', 12)));
    }
  },
  onSelectPrevView() {
    if (get_store_value(privateViewModeDerived) === 'day') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('month', 1)));
    }
    if (get_store_value(privateViewModeDerived) === 'month') {
      viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('year', 1)));
    }
    if (get_store_value(privateViewModeDerived) === 'year') {
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

// (5:2) {#each yearRange as year}
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
			add_location(span, file, 9, 3, 311);
			toggle_class(div, "disable", ctx.isDisable(ctx.year));
			toggle_class(div, "selected", ctx.currentYear === ctx.year);
			add_location(div, file, 5, 4, 153);

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
		source: "(5:2) {#each yearRange as year}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
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
		if ("visible" in $$props) visible = $$props.visible;
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
				visible = false;

				setTimeout(
					() => {
						visible = true;
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

// (5:2) {#each monthRange as month, index}
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
			add_location(span, file$1, 9, 4, 422);
			toggle_class(div, "disable", ctx.isDisable(ctx.currentViewYear, ctx.index + 1));
			toggle_class(div, "selected", ctx.currentMonth - 1 === ctx.index && ctx.currentViewYear === ctx.currentSelectedYear);
			add_location(div, file$1, 5, 3, 164);

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
		source: "(5:2) {#each monthRange as month, index}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
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
			add_location(div, file$1, 0, 1, 1);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
		if ("visible" in $$props) visible = $$props.visible;
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
				visible = false;

				setTimeout(
					() => {
						visible = true;
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
function create_if_block(ctx) {
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
		id: create_if_block.name,
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
	let if_block1 = ctx.visible && create_if_block(ctx);

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
					if_block1 = create_if_block(ctx);
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

		if ($config.calendarType === "persian") {
			$dateObject.toCalendar("gregorian");
			out = new $dateObject(day.valueOf()).format("D");
			$dateObject.toCalendar("persian");
		}

		if ($config.calendarType === "gregorian") {
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
function create_if_block$1(ctx) {
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
		id: create_if_block$1.name,
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
	let if_block3 = ctx.$config.timePicker.meridian.enabled && create_if_block$1(ctx);

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
					if_block3 = create_if_block$1(ctx);
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

// (2:1) {#if viewMode !== 'time'}
function create_if_block_4$1(ctx) {
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
			attr_dev(path0, "d", "M5.649,24c-0.143,0-0.279-0.061-0.374-0.168c-0.183-0.207-0.163-0.524,0.043-0.706L17.893,12L5.318,0.875\n\t\t\t\t\tC5.111,0.692,5.092,0.375,5.274,0.169C5.37,0.062,5.506,0,5.649,0c0.122,0,0.24,0.045,0.331,0.125l12.576,11.126\n\t\t\t\t\tc0.029,0.026,0.056,0.052,0.081,0.08c0.369,0.416,0.332,1.051-0.08,1.416L5.98,23.875C5.888,23.956,5.771,24,5.649,24z");
			add_location(path0, file$4, 9, 4, 195);
			attr_dev(svg0, "width", "12");
			attr_dev(svg0, "height", "12");
			attr_dev(svg0, "viewBox", "0 0 24 24");
			add_location(svg0, file$4, 5, 3, 129);
			attr_dev(button0, "class", "pwt-date-navigator-prev");
			add_location(button0, file$4, 2, 2, 62);
			attr_dev(path1, "d", "M18.401,24c-0.122,0-0.24-0.044-0.331-0.125L5.495,12.748c-0.03-0.027-0.058-0.055-0.084-0.084\n\t\t\t\t\tc-0.366-0.413-0.329-1.047,0.083-1.412L18.069,0.125C18.161,0.044,18.279,0,18.401,0c0.143,0,0.28,0.062,0.375,0.169\n\t\t\t\t\tc0.182,0.206,0.163,0.523-0.043,0.705L6.157,12l12.575,11.125c0.206,0.183,0.226,0.5,0.043,0.706C18.68,23.939,18.544,24,18.401,24\n\t\t\t\t\tz");
			add_location(path1, file$4, 21, 4, 702);
			attr_dev(svg1, "width", "12");
			attr_dev(svg1, "height", "12");
			attr_dev(svg1, "viewBox", "0 0 24 24");
			add_location(svg1, file$4, 17, 3, 636);
			attr_dev(button1, "class", "pwt-date-navigator-next");
			add_location(button1, file$4, 14, 2, 567);

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
		id: create_if_block_4$1.name,
		type: "if",
		source: "(2:1) {#if viewMode !== 'time'}",
		ctx
	});

	return block;
}

// (31:2) {#if viewMode === 'year' && visible}
function create_if_block_3$2(ctx) {
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
			add_location(button, file$4, 31, 3, 1177);
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
		id: create_if_block_3$2.name,
		type: "if",
		source: "(31:2) {#if viewMode === 'year' && visible}",
		ctx
	});

	return block;
}

// (39:2) {#if viewMode === 'month' && visible}
function create_if_block_2$2(ctx) {
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
			add_location(button, file$4, 39, 3, 1416);
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
		id: create_if_block_2$2.name,
		type: "if",
		source: "(39:2) {#if viewMode === 'month' && visible}",
		ctx
	});

	return block;
}

// (48:2) {#if viewMode === 'day' && visible}
function create_if_block_1$2(ctx) {
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
			add_location(button, file$4, 48, 3, 1677);
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
		id: create_if_block_1$2.name,
		type: "if",
		source: "(48:2) {#if viewMode === 'day' && visible}",
		ctx
	});

	return block;
}

// (57:3) {#if viewMode === 'time' && visible}
function create_if_block$2(ctx) {
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
			add_location(button, file$4, 57, 3, 1953);
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
		id: create_if_block$2.name,
		type: "if",
		source: "(57:3) {#if viewMode === 'time' && visible}",
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
	let if_block0 = ctx.viewMode !== "time" && create_if_block_4$1(ctx);
	let if_block1 = ctx.viewMode === "year" && ctx.visible && create_if_block_3$2(ctx);
	let if_block2 = ctx.viewMode === "month" && ctx.visible && create_if_block_2$2(ctx);
	let if_block3 = ctx.viewMode === "day" && ctx.visible && create_if_block_1$2(ctx);
	let if_block4 = ctx.viewMode === "time" && ctx.visible && create_if_block$2(ctx);

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
			add_location(div0, file$4, 28, 1, 1093);
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
					if_block0 = create_if_block_4$1(ctx);
					if_block0.c();
					if_block0.m(div1, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.viewMode === "year" && ctx.visible) {
				if (if_block1) {
					if_block1.p(changed, ctx);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_3$2(ctx);
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

			if (ctx.viewMode === "month" && ctx.visible) {
				if (if_block2) {
					if_block2.p(changed, ctx);
					transition_in(if_block2, 1);
				} else {
					if_block2 = create_if_block_2$2(ctx);
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

			if (ctx.viewMode === "day" && ctx.visible) {
				if (if_block3) {
					if_block3.p(changed, ctx);
					transition_in(if_block3, 1);
				} else {
					if_block3 = create_if_block_1$2(ctx);
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

			if (ctx.viewMode === "time" && ctx.visible) {
				if (if_block4) {
					if_block4.p(changed, ctx);
					transition_in(if_block4, 1);
				} else {
					if_block4 = create_if_block$2(ctx);
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
						400
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
function create_if_block$3(ctx) {
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
		id: create_if_block$3.name,
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
	let if_block = ctx.visible && create_if_block$3(ctx);

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
					if_block = create_if_block$3(ctx);
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
function create_if_block_6(ctx) {
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
		id: create_if_block_6.name,
		type: "if",
		source: "(2:1) {#if viewMode !== 'time'}",
		ctx
	});

	return block;
}

// (9:1) {#if viewMode === 'time'}
function create_if_block_5(ctx) {
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
		id: create_if_block_5.name,
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
function create_if_block$4(ctx) {
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
		id: create_if_block$4.name,
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
	let if_block0 = ctx.viewMode !== "time" && create_if_block_6(ctx);
	let if_block1 = ctx.viewMode === "time" && create_if_block_5(ctx);
	let if_block2 = ctx.$config.toolbox.todayButton.enabled && create_if_block_4$2(ctx);
	let if_block3 = ctx.$config.toolbox.calendarSwitch.enabled && create_if_block_1$3(ctx);
	let if_block4 = ctx.$config.toolbox.submitButton.enabled && create_if_block$4(ctx);

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
					if_block0 = create_if_block_6(ctx);
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
					if_block1 = create_if_block_5(ctx);
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
					if_block4 = create_if_block$4(ctx);
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
const file$7 = "src/app.svelte";

// (2:0) {#if isVisbile}
function create_if_block$5(ctx) {
	let div1;
	let t0;
	let t1;
	let div0;
	let t2;
	let t3;
	let current;
	let dispose;
	let if_block0 = ctx.$config.infobox.enabled && create_if_block_8(ctx);
	let if_block1 = ctx.$config.navigator.enabled && create_if_block_7(ctx);
	let if_block2 = !ctx.$config.onlyTimePicker && create_if_block_3$4(ctx);
	let if_block3 = (ctx.$privateViewModeDerived === "time" && ctx.$config.timePicker.enabled || ctx.$config.onlyTimePicker) && create_if_block_2$4(ctx);
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
			add_location(div0, file$7, 21, 3, 538);
			attr_dev(div1, "class", "pwt-datepicker");
			add_location(div1, file$7, 2, 1, 39);
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
					if_block0 = create_if_block_8(ctx);
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
					if_block1 = create_if_block_7(ctx);
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

			if (ctx.$privateViewModeDerived === "time" && ctx.$config.timePicker.enabled || ctx.$config.onlyTimePicker) {
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
		id: create_if_block$5.name,
		type: "if",
		source: "(2:0) {#if isVisbile}",
		ctx
	});

	return block;
}

// (7:2) {#if $config.infobox.enabled}
function create_if_block_8(ctx) {
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
		id: create_if_block_8.name,
		type: "if",
		source: "(7:2) {#if $config.infobox.enabled}",
		ctx
	});

	return block;
}

// (12:3) {#if $config.navigator.enabled}
function create_if_block_7(ctx) {
	let current;

	const navigator = new Navigator({
			props: {
				viewMode: ctx.$privateViewModeDerived,
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
			if (changed.$privateViewModeDerived) navigator_changes.viewMode = ctx.$privateViewModeDerived;
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
		id: create_if_block_7.name,
		type: "if",
		source: "(12:3) {#if $config.navigator.enabled}",
		ctx
	});

	return block;
}

// (24:4) {#if !$config.onlyTimePicker}
function create_if_block_3$4(ctx) {
	let t0;
	let t1;
	let if_block2_anchor;
	let current;
	let if_block0 = ctx.$privateViewModeDerived === "year" && ctx.$config.yearPicker.enabled && create_if_block_6$1(ctx);
	let if_block1 = ctx.$privateViewModeDerived === "month" && ctx.$config.monthPicker.enabled && create_if_block_5$1(ctx);
	let if_block2 = ctx.$privateViewModeDerived === "day" && ctx.$config.dayPicker.enabled && create_if_block_4$3(ctx);

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
			if (ctx.$privateViewModeDerived === "year" && ctx.$config.yearPicker.enabled) {
				if (if_block0) {
					if_block0.p(changed, ctx);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_6$1(ctx);
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

			if (ctx.$privateViewModeDerived === "month" && ctx.$config.monthPicker.enabled) {
				if (if_block1) {
					if_block1.p(changed, ctx);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_5$1(ctx);
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

			if (ctx.$privateViewModeDerived === "day" && ctx.$config.dayPicker.enabled) {
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
		source: "(24:4) {#if !$config.onlyTimePicker}",
		ctx
	});

	return block;
}

// (25:5) {#if $privateViewModeDerived === 'year' && $config.yearPicker.enabled}
function create_if_block_6$1(ctx) {
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
			add_location(div, file$7, 25, 6, 702);
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
		id: create_if_block_6$1.name,
		type: "if",
		source: "(25:5) {#if $privateViewModeDerived === 'year' && $config.yearPicker.enabled}",
		ctx
	});

	return block;
}

// (34:5) {#if $privateViewModeDerived === 'month' && $config.monthPicker.enabled}
function create_if_block_5$1(ctx) {
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
			add_location(div, file$7, 34, 6, 980);
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
		id: create_if_block_5$1.name,
		type: "if",
		source: "(34:5) {#if $privateViewModeDerived === 'month' && $config.monthPicker.enabled}",
		ctx
	});

	return block;
}

// (43:5) {#if $privateViewModeDerived === 'day' && $config.dayPicker.enabled}
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
			add_location(div, file$7, 43, 6, 1256);
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
		source: "(43:5) {#if $privateViewModeDerived === 'day' && $config.dayPicker.enabled}",
		ctx
	});

	return block;
}

// (55:4) {#if ($privateViewModeDerived === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}
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
			add_location(div, file$7, 55, 5, 1627);
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
		source: "(55:4) {#if ($privateViewModeDerived === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}",
		ctx
	});

	return block;
}

// (64:3) {#if $config.toolbox.enabled}
function create_if_block_1$4(ctx) {
	let current;

	const toolbox = new Toolbox({
			props: {
				viewMode: ctx.$privateViewModeDerived,
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
			if (changed.$privateViewModeDerived) toolbox_changes.viewMode = ctx.$privateViewModeDerived;
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
		source: "(64:3) {#if $config.toolbox.enabled}",
		ctx
	});

	return block;
}

function create_fragment$8(ctx) {
	let t0;
	let t1;
	let t2;
	let current;
	let if_block = ctx.isVisbile && create_if_block$5(ctx);

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
			t0 = text(ctx.originalContainer);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			create_component(input.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(input, target, anchor);
			current = true;
		},
		p: function update(changed, ctx) {
			if (!current || changed.originalContainer) set_data_dev(t0, ctx.originalContainer);

			if (ctx.isVisbile) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(t2.parentNode, t2);
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
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(t2);
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
	let $privateViewModeDerived;
	validate_store(config, "config");
	component_subscribe($$self, config, $$value => $$invalidate("$config", $config = $$value));
	validate_store(viewUnix, "viewUnix");
	component_subscribe($$self, viewUnix, $$value => $$invalidate("$viewUnix", $viewUnix = $$value));
	validate_store(selectedUnix, "selectedUnix");
	component_subscribe($$self, selectedUnix, $$value => $$invalidate("$selectedUnix", $selectedUnix = $$value));
	validate_store(privateViewModeDerived, "privateViewModeDerived");
	component_subscribe($$self, privateViewModeDerived, $$value => $$invalidate("$privateViewModeDerived", $privateViewModeDerived = $$value));
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

	const writable_props = ["options", "originalContainer"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate("plotarea", plotarea = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("options" in $$props) $$invalidate("options", options = $$props.options);
		if ("originalContainer" in $$props) $$invalidate("originalContainer", originalContainer = $$props.originalContainer);
	};

	$$self.$capture_state = () => {
		return {
			options,
			originalContainer,
			plotarea,
			isVisbile,
			$config,
			$viewUnix,
			$selectedUnix,
			$privateViewModeDerived
		};
	};

	$$self.$inject_state = $$props => {
		if ("options" in $$props) $$invalidate("options", options = $$props.options);
		if ("originalContainer" in $$props) $$invalidate("originalContainer", originalContainer = $$props.originalContainer);
		if ("plotarea" in $$props) $$invalidate("plotarea", plotarea = $$props.plotarea);
		if ("isVisbile" in $$props) $$invalidate("isVisbile", isVisbile = $$props.isVisbile);
		if ("$config" in $$props) config.set($config = $$props.$config);
		if ("$viewUnix" in $$props) viewUnix.set($viewUnix = $$props.$viewUnix);
		if ("$selectedUnix" in $$props) selectedUnix.set($selectedUnix = $$props.$selectedUnix);
		if ("$privateViewModeDerived" in $$props) privateViewModeDerived.set($privateViewModeDerived = $$props.$privateViewModeDerived);
	};

	$$self.$$.update = (changed = { options: 1 }) => {
		if (changed.options) {
			 {
				if (!options) {
					$$invalidate("options", options = defaultconfig);
				} else {
					$$invalidate("options", options = lodash.merge(defaultconfig, options));
				}

				dispatcher("setConfig")(options);
			}
		}
	};

	return {
		options,
		originalContainer,
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
		$privateViewModeDerived,
		div1_binding
	};
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$8, create_fragment$8, safe_not_equal, { options: 0, originalContainer: 0 });

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
}

var toReact = (Component, style = {}, tag = "span") => props => {
  const container = useRef(null);
  const component = useRef(null);
  const [mounted, setMount] = useState(false);
  useEffect(() => {
    const eventRe = /on([A-Z]{1,}[a-zA-Z]*)/;
    const watchRe = /watch([A-Z]{1,}[a-zA-Z]*)/;
    component.current = new Component({ target: container.current, props });
    let watchers = [];
    for (const key in props) {
      const eventMatch = key.match(eventRe);
      const watchMatch = key.match(watchRe);
      if (eventMatch && typeof props[key] === "function") {
        component.current.$on(
          `${eventMatch[1][0].toLowerCase()}${eventMatch[1].slice(1)}`,
          props[key]
        );
      }
      if (watchMatch && typeof props[key] === "function") {
        watchers.push([
          `${watchMatch[1][0].toLowerCase()}${watchMatch[1].slice(1)}`,
          props[key]
        ]);
      }
    }
    if (watchers.length) {
      const update = component.current.$$.update;
      component.current.$$.update = function() {
        watchers.forEach(([name, callback]) => {
          callback(component.current.$$.ctx[name]);
        });
        update.apply(null, arguments);
      };
    }
    return () => {
      component.current.$destroy();
    };
  }, []);
  useEffect(() => {
    if (!mounted) {
      setMount(true);
      return;
    }
    component.current.$set(props);
  }, [props]);
  return React.createElement(tag, { ref: container, style });
};

var pluginReact = toReact(App, {}, 'div');

export default pluginReact;
//# sourceMappingURL=zerounip-react.js.map
