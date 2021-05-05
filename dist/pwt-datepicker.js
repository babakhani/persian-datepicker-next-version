/**
 * 
 * persian-datepicker-next-version
 * v0.0.1
 * babakhani.reza@gmail.com
 * license MIT
 * 
 *     
 */

<<<<<<< HEAD

(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
this['persian-datepicker-next-version'] = (function () {
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
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
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

    const active_docs = new Set();
    let active = 0;
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
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
        $capture_state() { }
        $inject_state() { }
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

            //String.prototype.toEnglishDigits = function () {
            //    let charCodeZero = '۰'.charCodeAt(0);
            //    return this.replace(/[۰-۹]/g, function (w) {
            //        return w.charCodeAt(0) - charCodeZero;
            //    });
            //};
            //inputString = inputString //.toEnglishDigits();
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var lodash = createCommonjsModule(function (module, exports) {
    (function() {

      /** Used as a safe reference for `undefined` in pre-ES5 environments. */
      var undefined$1;

      /** Used as the semantic version number. */
      var VERSION = '4.17.15';

      /** Used as the size to enable large array optimizations. */
      var LARGE_ARRAY_SIZE = 200;

      /** Error message constants. */
      var CORE_ERROR_TEXT = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
          FUNC_ERROR_TEXT = 'Expected a function';

      /** Used to stand-in for `undefined` hash values. */
      var HASH_UNDEFINED = '__lodash_hash_undefined__';

      /** Used as the maximum memoize cache size. */
      var MAX_MEMOIZE_SIZE = 500;

      /** Used as the internal argument placeholder. */
      var PLACEHOLDER = '__lodash_placeholder__';

      /** Used to compose bitmasks for cloning. */
      var CLONE_DEEP_FLAG = 1,
          CLONE_FLAT_FLAG = 2,
          CLONE_SYMBOLS_FLAG = 4;

      /** Used to compose bitmasks for value comparisons. */
      var COMPARE_PARTIAL_FLAG = 1,
          COMPARE_UNORDERED_FLAG = 2;

      /** Used to compose bitmasks for function metadata. */
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

      /** Used as default options for `_.truncate`. */
      var DEFAULT_TRUNC_LENGTH = 30,
          DEFAULT_TRUNC_OMISSION = '...';

      /** Used to detect hot functions by number of calls within a span of milliseconds. */
      var HOT_COUNT = 800,
          HOT_SPAN = 16;

      /** Used to indicate the type of lazy iteratees. */
      var LAZY_FILTER_FLAG = 1,
          LAZY_MAP_FLAG = 2,
          LAZY_WHILE_FLAG = 3;

      /** Used as references for various `Number` constants. */
      var INFINITY = 1 / 0,
          MAX_SAFE_INTEGER = 9007199254740991,
          MAX_INTEGER = 1.7976931348623157e+308,
          NAN = 0 / 0;

      /** Used as references for the maximum length and index of an array. */
      var MAX_ARRAY_LENGTH = 4294967295,
          MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
          HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

      /** Used to associate wrap methods with their bit flags. */
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

      /** `Object#toString` result references. */
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

      /** Used to match empty string literals in compiled template source. */
      var reEmptyStringLeading = /\b__p \+= '';/g,
          reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
          reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

      /** Used to match HTML entities and HTML characters. */
      var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
          reUnescapedHtml = /[&<>"']/g,
          reHasEscapedHtml = RegExp(reEscapedHtml.source),
          reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

      /** Used to match template delimiters. */
      var reEscape = /<%-([\s\S]+?)%>/g,
          reEvaluate = /<%([\s\S]+?)%>/g,
          reInterpolate = /<%=([\s\S]+?)%>/g;

      /** Used to match property names within property paths. */
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
          reIsPlainProp = /^\w*$/,
          rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

      /**
       * Used to match `RegExp`
       * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
       */
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
          reHasRegExpChar = RegExp(reRegExpChar.source);

      /** Used to match leading and trailing whitespace. */
      var reTrim = /^\s+|\s+$/g,
          reTrimStart = /^\s+/,
          reTrimEnd = /\s+$/;

      /** Used to match wrap detail comments. */
      var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
          reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
          reSplitDetails = /,? & /;

      /** Used to match words composed of alphanumeric characters. */
      var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

      /** Used to match backslashes in property paths. */
      var reEscapeChar = /\\(\\)?/g;

      /**
       * Used to match
       * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
       */
      var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

      /** Used to match `RegExp` flags from their coerced string values. */
      var reFlags = /\w*$/;

      /** Used to detect bad signed hexadecimal string values. */
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

      /** Used to detect binary string values. */
      var reIsBinary = /^0b[01]+$/i;

      /** Used to detect host constructors (Safari). */
      var reIsHostCtor = /^\[object .+?Constructor\]$/;

      /** Used to detect octal string values. */
      var reIsOctal = /^0o[0-7]+$/i;

      /** Used to detect unsigned integer values. */
      var reIsUint = /^(?:0|[1-9]\d*)$/;

      /** Used to match Latin Unicode letters (excluding mathematical operators). */
      var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

      /** Used to ensure capturing order of template delimiters. */
      var reNoMatch = /($^)/;

      /** Used to match unescaped characters in compiled string literals. */
      var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

      /** Used to compose unicode character classes. */
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

      /** Used to compose unicode capture groups. */
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

      /** Used to compose unicode regexes. */
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

      /** Used to match apostrophes. */
      var reApos = RegExp(rsApos, 'g');

      /**
       * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
       * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
       */
      var reComboMark = RegExp(rsCombo, 'g');

      /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
      var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

      /** Used to match complex or compound words. */
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

      /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
      var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

      /** Used to detect strings that need a more robust regexp to match words. */
      var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

      /** Used to assign default `context` object properties. */
      var contextProps = [
        'Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array',
        'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object',
        'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array',
        'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
        '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'
      ];

      /** Used to make template sourceURLs easier to identify. */
      var templateCounter = -1;

      /** Used to identify `toStringTag` values of typed arrays. */
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

      /** Used to identify `toStringTag` values supported by `_.clone`. */
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

      /** Used to map Latin Unicode letters to basic Latin letters. */
      var deburredLetters = {
        // Latin-1 Supplement block.
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
        // Latin Extended-A block.
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

      /** Used to map characters to HTML entities. */
      var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      /** Used to map HTML entities to characters. */
      var htmlUnescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
      };

      /** Used to escape characters for inclusion in compiled string literals. */
      var stringEscapes = {
        '\\': '\\',
        "'": "'",
        '\n': 'n',
        '\r': 'r',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };

      /** Built-in method references without a dependency on `root`. */
      var freeParseFloat = parseFloat,
          freeParseInt = parseInt;

      /** Detect free variable `global` from Node.js. */
      var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

      /** Detect free variable `self`. */
      var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

      /** Used as a reference to the global object. */
      var root = freeGlobal || freeSelf || Function('return this')();

      /** Detect free variable `exports`. */
      var freeExports =  exports && !exports.nodeType && exports;

      /** Detect free variable `module`. */
      var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

      /** Detect the popular CommonJS extension `module.exports`. */
      var moduleExports = freeModule && freeModule.exports === freeExports;

      /** Detect free variable `process` from Node.js. */
      var freeProcess = moduleExports && freeGlobal.process;

      /** Used to access faster Node.js helpers. */
      var nodeUtil = (function() {
        try {
          // Use `util.types` for Node.js 10+.
          var types = freeModule && freeModule.require && freeModule.require('util').types;

          if (types) {
            return types;
          }

          // Legacy `process.binding('util')` for Node.js < 10.
          return freeProcess && freeProcess.binding && freeProcess.binding('util');
        } catch (e) {}
      }());

      /* Node.js helper references. */
      var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
          nodeIsDate = nodeUtil && nodeUtil.isDate,
          nodeIsMap = nodeUtil && nodeUtil.isMap,
          nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
          nodeIsSet = nodeUtil && nodeUtil.isSet,
          nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

      /*--------------------------------------------------------------------------*/

      /**
       * A faster alternative to `Function#apply`, this function invokes `func`
       * with the `this` binding of `thisArg` and the arguments of `args`.
       *
       * @private
       * @param {Function} func The function to invoke.
       * @param {*} thisArg The `this` binding of `func`.
       * @param {Array} args The arguments to invoke `func` with.
       * @returns {*} Returns the result of `func`.
       */
      function apply(func, thisArg, args) {
        switch (args.length) {
          case 0: return func.call(thisArg);
          case 1: return func.call(thisArg, args[0]);
          case 2: return func.call(thisArg, args[0], args[1]);
          case 3: return func.call(thisArg, args[0], args[1], args[2]);
        }
        return func.apply(thisArg, args);
      }

      /**
       * A specialized version of `baseAggregator` for arrays.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} setter The function to set `accumulator` values.
       * @param {Function} iteratee The iteratee to transform keys.
       * @param {Object} accumulator The initial aggregated object.
       * @returns {Function} Returns `accumulator`.
       */
      function arrayAggregator(array, setter, iteratee, accumulator) {
        var index = -1,
            length = array == null ? 0 : array.length;

        while (++index < length) {
          var value = array[index];
          setter(accumulator, value, iteratee(value), array);
        }
        return accumulator;
      }

      /**
       * A specialized version of `_.forEach` for arrays without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array} Returns `array`.
       */
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

      /**
       * A specialized version of `_.forEachRight` for arrays without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array} Returns `array`.
       */
      function arrayEachRight(array, iteratee) {
        var length = array == null ? 0 : array.length;

        while (length--) {
          if (iteratee(array[length], length, array) === false) {
            break;
          }
        }
        return array;
      }

      /**
       * A specialized version of `_.every` for arrays without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {boolean} Returns `true` if all elements pass the predicate check,
       *  else `false`.
       */
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

      /**
       * A specialized version of `_.filter` for arrays without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {Array} Returns the new filtered array.
       */
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

      /**
       * A specialized version of `_.includes` for arrays without support for
       * specifying an index to search from.
       *
       * @private
       * @param {Array} [array] The array to inspect.
       * @param {*} target The value to search for.
       * @returns {boolean} Returns `true` if `target` is found, else `false`.
       */
      function arrayIncludes(array, value) {
        var length = array == null ? 0 : array.length;
        return !!length && baseIndexOf(array, value, 0) > -1;
      }

      /**
       * This function is like `arrayIncludes` except that it accepts a comparator.
       *
       * @private
       * @param {Array} [array] The array to inspect.
       * @param {*} target The value to search for.
       * @param {Function} comparator The comparator invoked per element.
       * @returns {boolean} Returns `true` if `target` is found, else `false`.
       */
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

      /**
       * A specialized version of `_.map` for arrays without support for iteratee
       * shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array} Returns the new mapped array.
       */
      function arrayMap(array, iteratee) {
        var index = -1,
            length = array == null ? 0 : array.length,
            result = Array(length);

        while (++index < length) {
          result[index] = iteratee(array[index], index, array);
        }
        return result;
      }

      /**
       * Appends the elements of `values` to `array`.
       *
       * @private
       * @param {Array} array The array to modify.
       * @param {Array} values The values to append.
       * @returns {Array} Returns `array`.
       */
      function arrayPush(array, values) {
        var index = -1,
            length = values.length,
            offset = array.length;

        while (++index < length) {
          array[offset + index] = values[index];
        }
        return array;
      }

      /**
       * A specialized version of `_.reduce` for arrays without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @param {*} [accumulator] The initial value.
       * @param {boolean} [initAccum] Specify using the first element of `array` as
       *  the initial value.
       * @returns {*} Returns the accumulated value.
       */
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

      /**
       * A specialized version of `_.reduceRight` for arrays without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @param {*} [accumulator] The initial value.
       * @param {boolean} [initAccum] Specify using the last element of `array` as
       *  the initial value.
       * @returns {*} Returns the accumulated value.
       */
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

      /**
       * A specialized version of `_.some` for arrays without support for iteratee
       * shorthands.
       *
       * @private
       * @param {Array} [array] The array to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {boolean} Returns `true` if any element passes the predicate check,
       *  else `false`.
       */
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

      /**
       * Gets the size of an ASCII `string`.
       *
       * @private
       * @param {string} string The string inspect.
       * @returns {number} Returns the string size.
       */
      var asciiSize = baseProperty('length');

      /**
       * Converts an ASCII `string` to an array.
       *
       * @private
       * @param {string} string The string to convert.
       * @returns {Array} Returns the converted array.
       */
      function asciiToArray(string) {
        return string.split('');
      }

      /**
       * Splits an ASCII `string` into an array of its words.
       *
       * @private
       * @param {string} The string to inspect.
       * @returns {Array} Returns the words of `string`.
       */
      function asciiWords(string) {
        return string.match(reAsciiWord) || [];
      }

      /**
       * The base implementation of methods like `_.findKey` and `_.findLastKey`,
       * without support for iteratee shorthands, which iterates over `collection`
       * using `eachFunc`.
       *
       * @private
       * @param {Array|Object} collection The collection to inspect.
       * @param {Function} predicate The function invoked per iteration.
       * @param {Function} eachFunc The function to iterate over `collection`.
       * @returns {*} Returns the found element or its key, else `undefined`.
       */
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

      /**
       * The base implementation of `_.findIndex` and `_.findLastIndex` without
       * support for iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {Function} predicate The function invoked per iteration.
       * @param {number} fromIndex The index to search from.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
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

      /**
       * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} fromIndex The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
      function baseIndexOf(array, value, fromIndex) {
        return value === value
          ? strictIndexOf(array, value, fromIndex)
          : baseFindIndex(array, baseIsNaN, fromIndex);
      }

      /**
       * This function is like `baseIndexOf` except that it accepts a comparator.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} fromIndex The index to search from.
       * @param {Function} comparator The comparator invoked per element.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
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

      /**
       * The base implementation of `_.isNaN` without support for number objects.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
       */
      function baseIsNaN(value) {
        return value !== value;
      }

      /**
       * The base implementation of `_.mean` and `_.meanBy` without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {number} Returns the mean.
       */
      function baseMean(array, iteratee) {
        var length = array == null ? 0 : array.length;
        return length ? (baseSum(array, iteratee) / length) : NAN;
      }

      /**
       * The base implementation of `_.property` without support for deep paths.
       *
       * @private
       * @param {string} key The key of the property to get.
       * @returns {Function} Returns the new accessor function.
       */
      function baseProperty(key) {
        return function(object) {
          return object == null ? undefined$1 : object[key];
        };
      }

      /**
       * The base implementation of `_.propertyOf` without support for deep paths.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Function} Returns the new accessor function.
       */
      function basePropertyOf(object) {
        return function(key) {
          return object == null ? undefined$1 : object[key];
        };
      }

      /**
       * The base implementation of `_.reduce` and `_.reduceRight`, without support
       * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @param {*} accumulator The initial value.
       * @param {boolean} initAccum Specify using the first or last element of
       *  `collection` as the initial value.
       * @param {Function} eachFunc The function to iterate over `collection`.
       * @returns {*} Returns the accumulated value.
       */
      function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
        eachFunc(collection, function(value, index, collection) {
          accumulator = initAccum
            ? (initAccum = false, value)
            : iteratee(accumulator, value, index, collection);
        });
        return accumulator;
      }

      /**
       * The base implementation of `_.sortBy` which uses `comparer` to define the
       * sort order of `array` and replaces criteria objects with their corresponding
       * values.
       *
       * @private
       * @param {Array} array The array to sort.
       * @param {Function} comparer The function to define sort order.
       * @returns {Array} Returns `array`.
       */
      function baseSortBy(array, comparer) {
        var length = array.length;

        array.sort(comparer);
        while (length--) {
          array[length] = array[length].value;
        }
        return array;
      }

      /**
       * The base implementation of `_.sum` and `_.sumBy` without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {number} Returns the sum.
       */
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

      /**
       * The base implementation of `_.times` without support for iteratee shorthands
       * or max array length checks.
       *
       * @private
       * @param {number} n The number of times to invoke `iteratee`.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array} Returns the array of results.
       */
      function baseTimes(n, iteratee) {
        var index = -1,
            result = Array(n);

        while (++index < n) {
          result[index] = iteratee(index);
        }
        return result;
      }

      /**
       * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
       * of key-value pairs for `object` corresponding to the property names of `props`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array} props The property names to get values for.
       * @returns {Object} Returns the key-value pairs.
       */
      function baseToPairs(object, props) {
        return arrayMap(props, function(key) {
          return [key, object[key]];
        });
      }

      /**
       * The base implementation of `_.unary` without support for storing metadata.
       *
       * @private
       * @param {Function} func The function to cap arguments for.
       * @returns {Function} Returns the new capped function.
       */
      function baseUnary(func) {
        return function(value) {
          return func(value);
        };
      }

      /**
       * The base implementation of `_.values` and `_.valuesIn` which creates an
       * array of `object` property values corresponding to the property names
       * of `props`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array} props The property names to get values for.
       * @returns {Object} Returns the array of property values.
       */
      function baseValues(object, props) {
        return arrayMap(props, function(key) {
          return object[key];
        });
      }

      /**
       * Checks if a `cache` value for `key` exists.
       *
       * @private
       * @param {Object} cache The cache to query.
       * @param {string} key The key of the entry to check.
       * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
       */
      function cacheHas(cache, key) {
        return cache.has(key);
      }

      /**
       * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
       * that is not found in the character symbols.
       *
       * @private
       * @param {Array} strSymbols The string symbols to inspect.
       * @param {Array} chrSymbols The character symbols to find.
       * @returns {number} Returns the index of the first unmatched string symbol.
       */
      function charsStartIndex(strSymbols, chrSymbols) {
        var index = -1,
            length = strSymbols.length;

        while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
        return index;
      }

      /**
       * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
       * that is not found in the character symbols.
       *
       * @private
       * @param {Array} strSymbols The string symbols to inspect.
       * @param {Array} chrSymbols The character symbols to find.
       * @returns {number} Returns the index of the last unmatched string symbol.
       */
      function charsEndIndex(strSymbols, chrSymbols) {
        var index = strSymbols.length;

        while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
        return index;
      }

      /**
       * Gets the number of `placeholder` occurrences in `array`.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} placeholder The placeholder to search for.
       * @returns {number} Returns the placeholder count.
       */
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

      /**
       * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
       * letters to basic Latin letters.
       *
       * @private
       * @param {string} letter The matched letter to deburr.
       * @returns {string} Returns the deburred letter.
       */
      var deburrLetter = basePropertyOf(deburredLetters);

      /**
       * Used by `_.escape` to convert characters to HTML entities.
       *
       * @private
       * @param {string} chr The matched character to escape.
       * @returns {string} Returns the escaped character.
       */
      var escapeHtmlChar = basePropertyOf(htmlEscapes);

      /**
       * Used by `_.template` to escape characters for inclusion in compiled string literals.
       *
       * @private
       * @param {string} chr The matched character to escape.
       * @returns {string} Returns the escaped character.
       */
      function escapeStringChar(chr) {
        return '\\' + stringEscapes[chr];
      }

      /**
       * Gets the value at `key` of `object`.
       *
       * @private
       * @param {Object} [object] The object to query.
       * @param {string} key The key of the property to get.
       * @returns {*} Returns the property value.
       */
      function getValue(object, key) {
        return object == null ? undefined$1 : object[key];
      }

      /**
       * Checks if `string` contains Unicode symbols.
       *
       * @private
       * @param {string} string The string to inspect.
       * @returns {boolean} Returns `true` if a symbol is found, else `false`.
       */
      function hasUnicode(string) {
        return reHasUnicode.test(string);
      }

      /**
       * Checks if `string` contains a word composed of Unicode symbols.
       *
       * @private
       * @param {string} string The string to inspect.
       * @returns {boolean} Returns `true` if a word is found, else `false`.
       */
      function hasUnicodeWord(string) {
        return reHasUnicodeWord.test(string);
      }

      /**
       * Converts `iterator` to an array.
       *
       * @private
       * @param {Object} iterator The iterator to convert.
       * @returns {Array} Returns the converted array.
       */
      function iteratorToArray(iterator) {
        var data,
            result = [];

        while (!(data = iterator.next()).done) {
          result.push(data.value);
        }
        return result;
      }

      /**
       * Converts `map` to its key-value pairs.
       *
       * @private
       * @param {Object} map The map to convert.
       * @returns {Array} Returns the key-value pairs.
       */
      function mapToArray(map) {
        var index = -1,
            result = Array(map.size);

        map.forEach(function(value, key) {
          result[++index] = [key, value];
        });
        return result;
      }

      /**
       * Creates a unary function that invokes `func` with its argument transformed.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {Function} transform The argument transform.
       * @returns {Function} Returns the new function.
       */
      function overArg(func, transform) {
        return function(arg) {
          return func(transform(arg));
        };
      }

      /**
       * Replaces all `placeholder` elements in `array` with an internal placeholder
       * and returns an array of their indexes.
       *
       * @private
       * @param {Array} array The array to modify.
       * @param {*} placeholder The placeholder to replace.
       * @returns {Array} Returns the new array of placeholder indexes.
       */
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

      /**
       * Converts `set` to an array of its values.
       *
       * @private
       * @param {Object} set The set to convert.
       * @returns {Array} Returns the values.
       */
      function setToArray(set) {
        var index = -1,
            result = Array(set.size);

        set.forEach(function(value) {
          result[++index] = value;
        });
        return result;
      }

      /**
       * Converts `set` to its value-value pairs.
       *
       * @private
       * @param {Object} set The set to convert.
       * @returns {Array} Returns the value-value pairs.
       */
      function setToPairs(set) {
        var index = -1,
            result = Array(set.size);

        set.forEach(function(value) {
          result[++index] = [value, value];
        });
        return result;
      }

      /**
       * A specialized version of `_.indexOf` which performs strict equality
       * comparisons of values, i.e. `===`.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} fromIndex The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
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

      /**
       * A specialized version of `_.lastIndexOf` which performs strict equality
       * comparisons of values, i.e. `===`.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} fromIndex The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
      function strictLastIndexOf(array, value, fromIndex) {
        var index = fromIndex + 1;
        while (index--) {
          if (array[index] === value) {
            return index;
          }
        }
        return index;
      }

      /**
       * Gets the number of symbols in `string`.
       *
       * @private
       * @param {string} string The string to inspect.
       * @returns {number} Returns the string size.
       */
      function stringSize(string) {
        return hasUnicode(string)
          ? unicodeSize(string)
          : asciiSize(string);
      }

      /**
       * Converts `string` to an array.
       *
       * @private
       * @param {string} string The string to convert.
       * @returns {Array} Returns the converted array.
       */
      function stringToArray(string) {
        return hasUnicode(string)
          ? unicodeToArray(string)
          : asciiToArray(string);
      }

      /**
       * Used by `_.unescape` to convert HTML entities to characters.
       *
       * @private
       * @param {string} chr The matched character to unescape.
       * @returns {string} Returns the unescaped character.
       */
      var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

      /**
       * Gets the size of a Unicode `string`.
       *
       * @private
       * @param {string} string The string inspect.
       * @returns {number} Returns the string size.
       */
      function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
          ++result;
        }
        return result;
      }

      /**
       * Converts a Unicode `string` to an array.
       *
       * @private
       * @param {string} string The string to convert.
       * @returns {Array} Returns the converted array.
       */
      function unicodeToArray(string) {
        return string.match(reUnicode) || [];
      }

      /**
       * Splits a Unicode `string` into an array of its words.
       *
       * @private
       * @param {string} The string to inspect.
       * @returns {Array} Returns the words of `string`.
       */
      function unicodeWords(string) {
        return string.match(reUnicodeWord) || [];
      }

      /*--------------------------------------------------------------------------*/

      /**
       * Create a new pristine `lodash` function using the `context` object.
       *
       * @static
       * @memberOf _
       * @since 1.1.0
       * @category Util
       * @param {Object} [context=root] The context object.
       * @returns {Function} Returns a new `lodash` function.
       * @example
       *
       * _.mixin({ 'foo': _.constant('foo') });
       *
       * var lodash = _.runInContext();
       * lodash.mixin({ 'bar': lodash.constant('bar') });
       *
       * _.isFunction(_.foo);
       * // => true
       * _.isFunction(_.bar);
       * // => false
       *
       * lodash.isFunction(lodash.foo);
       * // => false
       * lodash.isFunction(lodash.bar);
       * // => true
       *
       * // Create a suped-up `defer` in Node.js.
       * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
       */
      var runInContext = (function runInContext(context) {
        context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));

        /** Built-in constructor references. */
        var Array = context.Array,
            Date = context.Date,
            Error = context.Error,
            Function = context.Function,
            Math = context.Math,
            Object = context.Object,
            RegExp = context.RegExp,
            String = context.String,
            TypeError = context.TypeError;

        /** Used for built-in method references. */
        var arrayProto = Array.prototype,
            funcProto = Function.prototype,
            objectProto = Object.prototype;

        /** Used to detect overreaching core-js shims. */
        var coreJsData = context['__core-js_shared__'];

        /** Used to resolve the decompiled source of functions. */
        var funcToString = funcProto.toString;

        /** Used to check objects for own properties. */
        var hasOwnProperty = objectProto.hasOwnProperty;

        /** Used to generate unique IDs. */
        var idCounter = 0;

        /** Used to detect methods masquerading as native. */
        var maskSrcKey = (function() {
          var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
          return uid ? ('Symbol(src)_1.' + uid) : '';
        }());

        /**
         * Used to resolve the
         * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
         * of values.
         */
        var nativeObjectToString = objectProto.toString;

        /** Used to infer the `Object` constructor. */
        var objectCtorString = funcToString.call(Object);

        /** Used to restore the original `_` reference in `_.noConflict`. */
        var oldDash = root._;

        /** Used to detect if a method is native. */
        var reIsNative = RegExp('^' +
          funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
        );

        /** Built-in value references. */
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

        /** Mocked built-ins. */
        var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
            ctxNow = Date && Date.now !== root.Date.now && Date.now,
            ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;

        /* Built-in method references for those with the same name as other `lodash` methods. */
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

        /* Built-in method references that are verified to be native. */
        var DataView = getNative(context, 'DataView'),
            Map = getNative(context, 'Map'),
            Promise = getNative(context, 'Promise'),
            Set = getNative(context, 'Set'),
            WeakMap = getNative(context, 'WeakMap'),
            nativeCreate = getNative(Object, 'create');

        /** Used to store function metadata. */
        var metaMap = WeakMap && new WeakMap;

        /** Used to lookup unminified function names. */
        var realNames = {};

        /** Used to detect maps, sets, and weakmaps. */
        var dataViewCtorString = toSource(DataView),
            mapCtorString = toSource(Map),
            promiseCtorString = toSource(Promise),
            setCtorString = toSource(Set),
            weakMapCtorString = toSource(WeakMap);

        /** Used to convert symbols to primitives and strings. */
        var symbolProto = Symbol ? Symbol.prototype : undefined$1,
            symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1,
            symbolToString = symbolProto ? symbolProto.toString : undefined$1;

        /*------------------------------------------------------------------------*/

        /**
         * Creates a `lodash` object which wraps `value` to enable implicit method
         * chain sequences. Methods that operate on and return arrays, collections,
         * and functions can be chained together. Methods that retrieve a single value
         * or may return a primitive value will automatically end the chain sequence
         * and return the unwrapped value. Otherwise, the value must be unwrapped
         * with `_#value`.
         *
         * Explicit chain sequences, which must be unwrapped with `_#value`, may be
         * enabled using `_.chain`.
         *
         * The execution of chained methods is lazy, that is, it's deferred until
         * `_#value` is implicitly or explicitly called.
         *
         * Lazy evaluation allows several methods to support shortcut fusion.
         * Shortcut fusion is an optimization to merge iteratee calls; this avoids
         * the creation of intermediate arrays and can greatly reduce the number of
         * iteratee executions. Sections of a chain sequence qualify for shortcut
         * fusion if the section is applied to an array and iteratees accept only
         * one argument. The heuristic for whether a section qualifies for shortcut
         * fusion is subject to change.
         *
         * Chaining is supported in custom builds as long as the `_#value` method is
         * directly or indirectly included in the build.
         *
         * In addition to lodash methods, wrappers have `Array` and `String` methods.
         *
         * The wrapper `Array` methods are:
         * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
         *
         * The wrapper `String` methods are:
         * `replace` and `split`
         *
         * The wrapper methods that support shortcut fusion are:
         * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
         * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
         * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
         *
         * The chainable wrapper methods are:
         * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
         * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
         * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
         * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
         * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
         * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
         * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
         * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
         * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
         * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
         * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
         * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
         * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
         * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
         * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
         * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
         * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
         * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
         * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
         * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
         * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
         * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
         * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
         * `zipObject`, `zipObjectDeep`, and `zipWith`
         *
         * The wrapper methods that are **not** chainable by default are:
         * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
         * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
         * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
         * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
         * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
         * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
         * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
         * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
         * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
         * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
         * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
         * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
         * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
         * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
         * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
         * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
         * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
         * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
         * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
         * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
         * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
         * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
         * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
         * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
         * `upperFirst`, `value`, and `words`
         *
         * @name _
         * @constructor
         * @category Seq
         * @param {*} value The value to wrap in a `lodash` instance.
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * function square(n) {
         *   return n * n;
         * }
         *
         * var wrapped = _([1, 2, 3]);
         *
         * // Returns an unwrapped value.
         * wrapped.reduce(_.add);
         * // => 6
         *
         * // Returns a wrapped value.
         * var squares = wrapped.map(square);
         *
         * _.isArray(squares);
         * // => false
         *
         * _.isArray(squares.value());
         * // => true
         */
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

        /**
         * The base implementation of `_.create` without support for assigning
         * properties to the created object.
         *
         * @private
         * @param {Object} proto The object to inherit from.
         * @returns {Object} Returns the new object.
         */
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

        /**
         * The function whose prototype chain sequence wrappers inherit from.
         *
         * @private
         */
        function baseLodash() {
          // No operation performed.
        }

        /**
         * The base constructor for creating `lodash` wrapper objects.
         *
         * @private
         * @param {*} value The value to wrap.
         * @param {boolean} [chainAll] Enable explicit method chain sequences.
         */
        function LodashWrapper(value, chainAll) {
          this.__wrapped__ = value;
          this.__actions__ = [];
          this.__chain__ = !!chainAll;
          this.__index__ = 0;
          this.__values__ = undefined$1;
        }

        /**
         * By default, the template delimiters used by lodash are like those in
         * embedded Ruby (ERB) as well as ES2015 template strings. Change the
         * following template settings to use alternative delimiters.
         *
         * @static
         * @memberOf _
         * @type {Object}
         */
        lodash.templateSettings = {

          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          'escape': reEscape,

          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          'evaluate': reEvaluate,

          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          'interpolate': reInterpolate,

          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          'variable': '',

          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          'imports': {

            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            '_': lodash
          }
        };

        // Ensure wrappers are instances of `baseLodash`.
        lodash.prototype = baseLodash.prototype;
        lodash.prototype.constructor = lodash;

        LodashWrapper.prototype = baseCreate(baseLodash.prototype);
        LodashWrapper.prototype.constructor = LodashWrapper;

        /*------------------------------------------------------------------------*/

        /**
         * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
         *
         * @private
         * @constructor
         * @param {*} value The value to wrap.
         */
        function LazyWrapper(value) {
          this.__wrapped__ = value;
          this.__actions__ = [];
          this.__dir__ = 1;
          this.__filtered__ = false;
          this.__iteratees__ = [];
          this.__takeCount__ = MAX_ARRAY_LENGTH;
          this.__views__ = [];
        }

        /**
         * Creates a clone of the lazy wrapper object.
         *
         * @private
         * @name clone
         * @memberOf LazyWrapper
         * @returns {Object} Returns the cloned `LazyWrapper` object.
         */
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

        /**
         * Reverses the direction of lazy iteration.
         *
         * @private
         * @name reverse
         * @memberOf LazyWrapper
         * @returns {Object} Returns the new reversed `LazyWrapper` object.
         */
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

        /**
         * Extracts the unwrapped value from its lazy wrapper.
         *
         * @private
         * @name value
         * @memberOf LazyWrapper
         * @returns {*} Returns the unwrapped value.
         */
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

        // Ensure `LazyWrapper` is an instance of `baseLodash`.
        LazyWrapper.prototype = baseCreate(baseLodash.prototype);
        LazyWrapper.prototype.constructor = LazyWrapper;

        /*------------------------------------------------------------------------*/

        /**
         * Creates a hash object.
         *
         * @private
         * @constructor
         * @param {Array} [entries] The key-value pairs to cache.
         */
        function Hash(entries) {
          var index = -1,
              length = entries == null ? 0 : entries.length;

          this.clear();
          while (++index < length) {
            var entry = entries[index];
            this.set(entry[0], entry[1]);
          }
        }

        /**
         * Removes all key-value entries from the hash.
         *
         * @private
         * @name clear
         * @memberOf Hash
         */
        function hashClear() {
          this.__data__ = nativeCreate ? nativeCreate(null) : {};
          this.size = 0;
        }

        /**
         * Removes `key` and its value from the hash.
         *
         * @private
         * @name delete
         * @memberOf Hash
         * @param {Object} hash The hash to modify.
         * @param {string} key The key of the value to remove.
         * @returns {boolean} Returns `true` if the entry was removed, else `false`.
         */
        function hashDelete(key) {
          var result = this.has(key) && delete this.__data__[key];
          this.size -= result ? 1 : 0;
          return result;
        }

        /**
         * Gets the hash value for `key`.
         *
         * @private
         * @name get
         * @memberOf Hash
         * @param {string} key The key of the value to get.
         * @returns {*} Returns the entry value.
         */
        function hashGet(key) {
          var data = this.__data__;
          if (nativeCreate) {
            var result = data[key];
            return result === HASH_UNDEFINED ? undefined$1 : result;
          }
          return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
        }

        /**
         * Checks if a hash value for `key` exists.
         *
         * @private
         * @name has
         * @memberOf Hash
         * @param {string} key The key of the entry to check.
         * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
         */
        function hashHas(key) {
          var data = this.__data__;
          return nativeCreate ? (data[key] !== undefined$1) : hasOwnProperty.call(data, key);
        }

        /**
         * Sets the hash `key` to `value`.
         *
         * @private
         * @name set
         * @memberOf Hash
         * @param {string} key The key of the value to set.
         * @param {*} value The value to set.
         * @returns {Object} Returns the hash instance.
         */
        function hashSet(key, value) {
          var data = this.__data__;
          this.size += this.has(key) ? 0 : 1;
          data[key] = (nativeCreate && value === undefined$1) ? HASH_UNDEFINED : value;
          return this;
        }

        // Add methods to `Hash`.
        Hash.prototype.clear = hashClear;
        Hash.prototype['delete'] = hashDelete;
        Hash.prototype.get = hashGet;
        Hash.prototype.has = hashHas;
        Hash.prototype.set = hashSet;

        /*------------------------------------------------------------------------*/

        /**
         * Creates an list cache object.
         *
         * @private
         * @constructor
         * @param {Array} [entries] The key-value pairs to cache.
         */
        function ListCache(entries) {
          var index = -1,
              length = entries == null ? 0 : entries.length;

          this.clear();
          while (++index < length) {
            var entry = entries[index];
            this.set(entry[0], entry[1]);
          }
        }

        /**
         * Removes all key-value entries from the list cache.
         *
         * @private
         * @name clear
         * @memberOf ListCache
         */
        function listCacheClear() {
          this.__data__ = [];
          this.size = 0;
        }

        /**
         * Removes `key` and its value from the list cache.
         *
         * @private
         * @name delete
         * @memberOf ListCache
         * @param {string} key The key of the value to remove.
         * @returns {boolean} Returns `true` if the entry was removed, else `false`.
         */
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

        /**
         * Gets the list cache value for `key`.
         *
         * @private
         * @name get
         * @memberOf ListCache
         * @param {string} key The key of the value to get.
         * @returns {*} Returns the entry value.
         */
        function listCacheGet(key) {
          var data = this.__data__,
              index = assocIndexOf(data, key);

          return index < 0 ? undefined$1 : data[index][1];
        }

        /**
         * Checks if a list cache value for `key` exists.
         *
         * @private
         * @name has
         * @memberOf ListCache
         * @param {string} key The key of the entry to check.
         * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
         */
        function listCacheHas(key) {
          return assocIndexOf(this.__data__, key) > -1;
        }

        /**
         * Sets the list cache `key` to `value`.
         *
         * @private
         * @name set
         * @memberOf ListCache
         * @param {string} key The key of the value to set.
         * @param {*} value The value to set.
         * @returns {Object} Returns the list cache instance.
         */
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

        // Add methods to `ListCache`.
        ListCache.prototype.clear = listCacheClear;
        ListCache.prototype['delete'] = listCacheDelete;
        ListCache.prototype.get = listCacheGet;
        ListCache.prototype.has = listCacheHas;
        ListCache.prototype.set = listCacheSet;

        /*------------------------------------------------------------------------*/

        /**
         * Creates a map cache object to store key-value pairs.
         *
         * @private
         * @constructor
         * @param {Array} [entries] The key-value pairs to cache.
         */
        function MapCache(entries) {
          var index = -1,
              length = entries == null ? 0 : entries.length;

          this.clear();
          while (++index < length) {
            var entry = entries[index];
            this.set(entry[0], entry[1]);
          }
        }

        /**
         * Removes all key-value entries from the map.
         *
         * @private
         * @name clear
         * @memberOf MapCache
         */
        function mapCacheClear() {
          this.size = 0;
          this.__data__ = {
            'hash': new Hash,
            'map': new (Map || ListCache),
            'string': new Hash
          };
        }

        /**
         * Removes `key` and its value from the map.
         *
         * @private
         * @name delete
         * @memberOf MapCache
         * @param {string} key The key of the value to remove.
         * @returns {boolean} Returns `true` if the entry was removed, else `false`.
         */
        function mapCacheDelete(key) {
          var result = getMapData(this, key)['delete'](key);
          this.size -= result ? 1 : 0;
          return result;
        }

        /**
         * Gets the map value for `key`.
         *
         * @private
         * @name get
         * @memberOf MapCache
         * @param {string} key The key of the value to get.
         * @returns {*} Returns the entry value.
         */
        function mapCacheGet(key) {
          return getMapData(this, key).get(key);
        }

        /**
         * Checks if a map value for `key` exists.
         *
         * @private
         * @name has
         * @memberOf MapCache
         * @param {string} key The key of the entry to check.
         * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
         */
        function mapCacheHas(key) {
          return getMapData(this, key).has(key);
        }

        /**
         * Sets the map `key` to `value`.
         *
         * @private
         * @name set
         * @memberOf MapCache
         * @param {string} key The key of the value to set.
         * @param {*} value The value to set.
         * @returns {Object} Returns the map cache instance.
         */
        function mapCacheSet(key, value) {
          var data = getMapData(this, key),
              size = data.size;

          data.set(key, value);
          this.size += data.size == size ? 0 : 1;
          return this;
        }

        // Add methods to `MapCache`.
        MapCache.prototype.clear = mapCacheClear;
        MapCache.prototype['delete'] = mapCacheDelete;
        MapCache.prototype.get = mapCacheGet;
        MapCache.prototype.has = mapCacheHas;
        MapCache.prototype.set = mapCacheSet;

        /*------------------------------------------------------------------------*/

        /**
         *
         * Creates an array cache object to store unique values.
         *
         * @private
         * @constructor
         * @param {Array} [values] The values to cache.
         */
        function SetCache(values) {
          var index = -1,
              length = values == null ? 0 : values.length;

          this.__data__ = new MapCache;
          while (++index < length) {
            this.add(values[index]);
          }
        }

        /**
         * Adds `value` to the array cache.
         *
         * @private
         * @name add
         * @memberOf SetCache
         * @alias push
         * @param {*} value The value to cache.
         * @returns {Object} Returns the cache instance.
         */
        function setCacheAdd(value) {
          this.__data__.set(value, HASH_UNDEFINED);
          return this;
        }

        /**
         * Checks if `value` is in the array cache.
         *
         * @private
         * @name has
         * @memberOf SetCache
         * @param {*} value The value to search for.
         * @returns {number} Returns `true` if `value` is found, else `false`.
         */
        function setCacheHas(value) {
          return this.__data__.has(value);
        }

        // Add methods to `SetCache`.
        SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
        SetCache.prototype.has = setCacheHas;

        /*------------------------------------------------------------------------*/

        /**
         * Creates a stack cache object to store key-value pairs.
         *
         * @private
         * @constructor
         * @param {Array} [entries] The key-value pairs to cache.
         */
        function Stack(entries) {
          var data = this.__data__ = new ListCache(entries);
          this.size = data.size;
        }

        /**
         * Removes all key-value entries from the stack.
         *
         * @private
         * @name clear
         * @memberOf Stack
         */
        function stackClear() {
          this.__data__ = new ListCache;
          this.size = 0;
        }

        /**
         * Removes `key` and its value from the stack.
         *
         * @private
         * @name delete
         * @memberOf Stack
         * @param {string} key The key of the value to remove.
         * @returns {boolean} Returns `true` if the entry was removed, else `false`.
         */
        function stackDelete(key) {
          var data = this.__data__,
              result = data['delete'](key);

          this.size = data.size;
          return result;
        }

        /**
         * Gets the stack value for `key`.
         *
         * @private
         * @name get
         * @memberOf Stack
         * @param {string} key The key of the value to get.
         * @returns {*} Returns the entry value.
         */
        function stackGet(key) {
          return this.__data__.get(key);
        }

        /**
         * Checks if a stack value for `key` exists.
         *
         * @private
         * @name has
         * @memberOf Stack
         * @param {string} key The key of the entry to check.
         * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
         */
        function stackHas(key) {
          return this.__data__.has(key);
        }

        /**
         * Sets the stack `key` to `value`.
         *
         * @private
         * @name set
         * @memberOf Stack
         * @param {string} key The key of the value to set.
         * @param {*} value The value to set.
         * @returns {Object} Returns the stack cache instance.
         */
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

        // Add methods to `Stack`.
        Stack.prototype.clear = stackClear;
        Stack.prototype['delete'] = stackDelete;
        Stack.prototype.get = stackGet;
        Stack.prototype.has = stackHas;
        Stack.prototype.set = stackSet;

        /*------------------------------------------------------------------------*/

        /**
         * Creates an array of the enumerable property names of the array-like `value`.
         *
         * @private
         * @param {*} value The value to query.
         * @param {boolean} inherited Specify returning inherited property names.
         * @returns {Array} Returns the array of property names.
         */
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
                   // Safari 9 has enumerable `arguments.length` in strict mode.
                   key == 'length' ||
                   // Node.js 0.10 has enumerable non-index properties on buffers.
                   (isBuff && (key == 'offset' || key == 'parent')) ||
                   // PhantomJS 2 has enumerable non-index properties on typed arrays.
                   (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
                   // Skip index properties.
                   isIndex(key, length)
                ))) {
              result.push(key);
            }
          }
          return result;
        }

        /**
         * A specialized version of `_.sample` for arrays.
         *
         * @private
         * @param {Array} array The array to sample.
         * @returns {*} Returns the random element.
         */
        function arraySample(array) {
          var length = array.length;
          return length ? array[baseRandom(0, length - 1)] : undefined$1;
        }

        /**
         * A specialized version of `_.sampleSize` for arrays.
         *
         * @private
         * @param {Array} array The array to sample.
         * @param {number} n The number of elements to sample.
         * @returns {Array} Returns the random elements.
         */
        function arraySampleSize(array, n) {
          return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
        }

        /**
         * A specialized version of `_.shuffle` for arrays.
         *
         * @private
         * @param {Array} array The array to shuffle.
         * @returns {Array} Returns the new shuffled array.
         */
        function arrayShuffle(array) {
          return shuffleSelf(copyArray(array));
        }

        /**
         * This function is like `assignValue` except that it doesn't assign
         * `undefined` values.
         *
         * @private
         * @param {Object} object The object to modify.
         * @param {string} key The key of the property to assign.
         * @param {*} value The value to assign.
         */
        function assignMergeValue(object, key, value) {
          if ((value !== undefined$1 && !eq(object[key], value)) ||
              (value === undefined$1 && !(key in object))) {
            baseAssignValue(object, key, value);
          }
        }

        /**
         * Assigns `value` to `key` of `object` if the existing value is not equivalent
         * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * @private
         * @param {Object} object The object to modify.
         * @param {string} key The key of the property to assign.
         * @param {*} value The value to assign.
         */
        function assignValue(object, key, value) {
          var objValue = object[key];
          if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
              (value === undefined$1 && !(key in object))) {
            baseAssignValue(object, key, value);
          }
        }

        /**
         * Gets the index at which the `key` is found in `array` of key-value pairs.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {*} key The key to search for.
         * @returns {number} Returns the index of the matched value, else `-1`.
         */
        function assocIndexOf(array, key) {
          var length = array.length;
          while (length--) {
            if (eq(array[length][0], key)) {
              return length;
            }
          }
          return -1;
        }

        /**
         * Aggregates elements of `collection` on `accumulator` with keys transformed
         * by `iteratee` and values set by `setter`.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} setter The function to set `accumulator` values.
         * @param {Function} iteratee The iteratee to transform keys.
         * @param {Object} accumulator The initial aggregated object.
         * @returns {Function} Returns `accumulator`.
         */
        function baseAggregator(collection, setter, iteratee, accumulator) {
          baseEach(collection, function(value, key, collection) {
            setter(accumulator, value, iteratee(value), collection);
          });
          return accumulator;
        }

        /**
         * The base implementation of `_.assign` without support for multiple sources
         * or `customizer` functions.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @returns {Object} Returns `object`.
         */
        function baseAssign(object, source) {
          return object && copyObject(source, keys(source), object);
        }

        /**
         * The base implementation of `_.assignIn` without support for multiple sources
         * or `customizer` functions.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @returns {Object} Returns `object`.
         */
        function baseAssignIn(object, source) {
          return object && copyObject(source, keysIn(source), object);
        }

        /**
         * The base implementation of `assignValue` and `assignMergeValue` without
         * value checks.
         *
         * @private
         * @param {Object} object The object to modify.
         * @param {string} key The key of the property to assign.
         * @param {*} value The value to assign.
         */
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

        /**
         * The base implementation of `_.at` without support for individual paths.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {string[]} paths The property paths to pick.
         * @returns {Array} Returns the picked elements.
         */
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

        /**
         * The base implementation of `_.clamp` which doesn't coerce arguments.
         *
         * @private
         * @param {number} number The number to clamp.
         * @param {number} [lower] The lower bound.
         * @param {number} upper The upper bound.
         * @returns {number} Returns the clamped number.
         */
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

        /**
         * The base implementation of `_.clone` and `_.cloneDeep` which tracks
         * traversed objects.
         *
         * @private
         * @param {*} value The value to clone.
         * @param {boolean} bitmask The bitmask flags.
         *  1 - Deep clone
         *  2 - Flatten inherited properties
         *  4 - Clone symbols
         * @param {Function} [customizer] The function to customize cloning.
         * @param {string} [key] The key of `value`.
         * @param {Object} [object] The parent object of `value`.
         * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
         * @returns {*} Returns the cloned value.
         */
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
          // Check for circular references and return its corresponding clone.
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
            // Recursively populate clone (susceptible to call stack limits).
            assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
          });
          return result;
        }

        /**
         * The base implementation of `_.conforms` which doesn't clone `source`.
         *
         * @private
         * @param {Object} source The object of property predicates to conform to.
         * @returns {Function} Returns the new spec function.
         */
        function baseConforms(source) {
          var props = keys(source);
          return function(object) {
            return baseConformsTo(object, source, props);
          };
        }

        /**
         * The base implementation of `_.conformsTo` which accepts `props` to check.
         *
         * @private
         * @param {Object} object The object to inspect.
         * @param {Object} source The object of property predicates to conform to.
         * @returns {boolean} Returns `true` if `object` conforms, else `false`.
         */
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

        /**
         * The base implementation of `_.delay` and `_.defer` which accepts `args`
         * to provide to `func`.
         *
         * @private
         * @param {Function} func The function to delay.
         * @param {number} wait The number of milliseconds to delay invocation.
         * @param {Array} args The arguments to provide to `func`.
         * @returns {number|Object} Returns the timer id or timeout object.
         */
        function baseDelay(func, wait, args) {
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          return setTimeout(function() { func.apply(undefined$1, args); }, wait);
        }

        /**
         * The base implementation of methods like `_.difference` without support
         * for excluding multiple arrays or iteratee shorthands.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {Array} values The values to exclude.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of filtered values.
         */
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

        /**
         * The base implementation of `_.forEach` without support for iteratee shorthands.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array|Object} Returns `collection`.
         */
        var baseEach = createBaseEach(baseForOwn);

        /**
         * The base implementation of `_.forEachRight` without support for iteratee shorthands.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array|Object} Returns `collection`.
         */
        var baseEachRight = createBaseEach(baseForOwnRight, true);

        /**
         * The base implementation of `_.every` without support for iteratee shorthands.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {boolean} Returns `true` if all elements pass the predicate check,
         *  else `false`
         */
        function baseEvery(collection, predicate) {
          var result = true;
          baseEach(collection, function(value, index, collection) {
            result = !!predicate(value, index, collection);
            return result;
          });
          return result;
        }

        /**
         * The base implementation of methods like `_.max` and `_.min` which accepts a
         * `comparator` to determine the extremum value.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The iteratee invoked per iteration.
         * @param {Function} comparator The comparator used to compare values.
         * @returns {*} Returns the extremum value.
         */
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

        /**
         * The base implementation of `_.fill` without an iteratee call guard.
         *
         * @private
         * @param {Array} array The array to fill.
         * @param {*} value The value to fill `array` with.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns `array`.
         */
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

        /**
         * The base implementation of `_.filter` without support for iteratee shorthands.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {Array} Returns the new filtered array.
         */
        function baseFilter(collection, predicate) {
          var result = [];
          baseEach(collection, function(value, index, collection) {
            if (predicate(value, index, collection)) {
              result.push(value);
            }
          });
          return result;
        }

        /**
         * The base implementation of `_.flatten` with support for restricting flattening.
         *
         * @private
         * @param {Array} array The array to flatten.
         * @param {number} depth The maximum recursion depth.
         * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
         * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
         * @param {Array} [result=[]] The initial result value.
         * @returns {Array} Returns the new flattened array.
         */
        function baseFlatten(array, depth, predicate, isStrict, result) {
          var index = -1,
              length = array.length;

          predicate || (predicate = isFlattenable);
          result || (result = []);

          while (++index < length) {
            var value = array[index];
            if (depth > 0 && predicate(value)) {
              if (depth > 1) {
                // Recursively flatten arrays (susceptible to call stack limits).
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

        /**
         * The base implementation of `baseForOwn` which iterates over `object`
         * properties returned by `keysFunc` and invokes `iteratee` for each property.
         * Iteratee functions may exit iteration early by explicitly returning `false`.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {Function} keysFunc The function to get the keys of `object`.
         * @returns {Object} Returns `object`.
         */
        var baseFor = createBaseFor();

        /**
         * This function is like `baseFor` except that it iterates over properties
         * in the opposite order.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {Function} keysFunc The function to get the keys of `object`.
         * @returns {Object} Returns `object`.
         */
        var baseForRight = createBaseFor(true);

        /**
         * The base implementation of `_.forOwn` without support for iteratee shorthands.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Object} Returns `object`.
         */
        function baseForOwn(object, iteratee) {
          return object && baseFor(object, iteratee, keys);
        }

        /**
         * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Object} Returns `object`.
         */
        function baseForOwnRight(object, iteratee) {
          return object && baseForRight(object, iteratee, keys);
        }

        /**
         * The base implementation of `_.functions` which creates an array of
         * `object` function property names filtered from `props`.
         *
         * @private
         * @param {Object} object The object to inspect.
         * @param {Array} props The property names to filter.
         * @returns {Array} Returns the function names.
         */
        function baseFunctions(object, props) {
          return arrayFilter(props, function(key) {
            return isFunction(object[key]);
          });
        }

        /**
         * The base implementation of `_.get` without support for default values.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the property to get.
         * @returns {*} Returns the resolved value.
         */
        function baseGet(object, path) {
          path = castPath(path, object);

          var index = 0,
              length = path.length;

          while (object != null && index < length) {
            object = object[toKey(path[index++])];
          }
          return (index && index == length) ? object : undefined$1;
        }

        /**
         * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
         * `keysFunc` and `symbolsFunc` to get the enumerable property names and
         * symbols of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Function} keysFunc The function to get the keys of `object`.
         * @param {Function} symbolsFunc The function to get the symbols of `object`.
         * @returns {Array} Returns the array of property names and symbols.
         */
        function baseGetAllKeys(object, keysFunc, symbolsFunc) {
          var result = keysFunc(object);
          return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
        }

        /**
         * The base implementation of `getTag` without fallbacks for buggy environments.
         *
         * @private
         * @param {*} value The value to query.
         * @returns {string} Returns the `toStringTag`.
         */
        function baseGetTag(value) {
          if (value == null) {
            return value === undefined$1 ? undefinedTag : nullTag;
          }
          return (symToStringTag && symToStringTag in Object(value))
            ? getRawTag(value)
            : objectToString(value);
        }

        /**
         * The base implementation of `_.gt` which doesn't coerce arguments.
         *
         * @private
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is greater than `other`,
         *  else `false`.
         */
        function baseGt(value, other) {
          return value > other;
        }

        /**
         * The base implementation of `_.has` without support for deep paths.
         *
         * @private
         * @param {Object} [object] The object to query.
         * @param {Array|string} key The key to check.
         * @returns {boolean} Returns `true` if `key` exists, else `false`.
         */
        function baseHas(object, key) {
          return object != null && hasOwnProperty.call(object, key);
        }

        /**
         * The base implementation of `_.hasIn` without support for deep paths.
         *
         * @private
         * @param {Object} [object] The object to query.
         * @param {Array|string} key The key to check.
         * @returns {boolean} Returns `true` if `key` exists, else `false`.
         */
        function baseHasIn(object, key) {
          return object != null && key in Object(object);
        }

        /**
         * The base implementation of `_.inRange` which doesn't coerce arguments.
         *
         * @private
         * @param {number} number The number to check.
         * @param {number} start The start of the range.
         * @param {number} end The end of the range.
         * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
         */
        function baseInRange(number, start, end) {
          return number >= nativeMin(start, end) && number < nativeMax(start, end);
        }

        /**
         * The base implementation of methods like `_.intersection`, without support
         * for iteratee shorthands, that accepts an array of arrays to inspect.
         *
         * @private
         * @param {Array} arrays The arrays to inspect.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of shared values.
         */
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

        /**
         * The base implementation of `_.invert` and `_.invertBy` which inverts
         * `object` with values transformed by `iteratee` and set by `setter`.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} setter The function to set `accumulator` values.
         * @param {Function} iteratee The iteratee to transform values.
         * @param {Object} accumulator The initial inverted object.
         * @returns {Function} Returns `accumulator`.
         */
        function baseInverter(object, setter, iteratee, accumulator) {
          baseForOwn(object, function(value, key, object) {
            setter(accumulator, iteratee(value), key, object);
          });
          return accumulator;
        }

        /**
         * The base implementation of `_.invoke` without support for individual
         * method arguments.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the method to invoke.
         * @param {Array} args The arguments to invoke the method with.
         * @returns {*} Returns the result of the invoked method.
         */
        function baseInvoke(object, path, args) {
          path = castPath(path, object);
          object = parent(object, path);
          var func = object == null ? object : object[toKey(last(path))];
          return func == null ? undefined$1 : apply(func, object, args);
        }

        /**
         * The base implementation of `_.isArguments`.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an `arguments` object,
         */
        function baseIsArguments(value) {
          return isObjectLike(value) && baseGetTag(value) == argsTag;
        }

        /**
         * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
         */
        function baseIsArrayBuffer(value) {
          return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
        }

        /**
         * The base implementation of `_.isDate` without Node.js optimizations.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
         */
        function baseIsDate(value) {
          return isObjectLike(value) && baseGetTag(value) == dateTag;
        }

        /**
         * The base implementation of `_.isEqual` which supports partial comparisons
         * and tracks traversed objects.
         *
         * @private
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @param {boolean} bitmask The bitmask flags.
         *  1 - Unordered comparison
         *  2 - Partial comparison
         * @param {Function} [customizer] The function to customize comparisons.
         * @param {Object} [stack] Tracks traversed `value` and `other` objects.
         * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
         */
        function baseIsEqual(value, other, bitmask, customizer, stack) {
          if (value === other) {
            return true;
          }
          if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
            return value !== value && other !== other;
          }
          return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
        }

        /**
         * A specialized version of `baseIsEqual` for arrays and objects which performs
         * deep comparisons and tracks traversed objects enabling objects with circular
         * references to be compared.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
         * @param {Function} customizer The function to customize comparisons.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Object} [stack] Tracks traversed `object` and `other` objects.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
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

        /**
         * The base implementation of `_.isMap` without Node.js optimizations.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a map, else `false`.
         */
        function baseIsMap(value) {
          return isObjectLike(value) && getTag(value) == mapTag;
        }

        /**
         * The base implementation of `_.isMatch` without support for iteratee shorthands.
         *
         * @private
         * @param {Object} object The object to inspect.
         * @param {Object} source The object of property values to match.
         * @param {Array} matchData The property names, values, and compare flags to match.
         * @param {Function} [customizer] The function to customize comparisons.
         * @returns {boolean} Returns `true` if `object` is a match, else `false`.
         */
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

        /**
         * The base implementation of `_.isNative` without bad shim checks.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a native function,
         *  else `false`.
         */
        function baseIsNative(value) {
          if (!isObject(value) || isMasked(value)) {
            return false;
          }
          var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
          return pattern.test(toSource(value));
        }

        /**
         * The base implementation of `_.isRegExp` without Node.js optimizations.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
         */
        function baseIsRegExp(value) {
          return isObjectLike(value) && baseGetTag(value) == regexpTag;
        }

        /**
         * The base implementation of `_.isSet` without Node.js optimizations.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a set, else `false`.
         */
        function baseIsSet(value) {
          return isObjectLike(value) && getTag(value) == setTag;
        }

        /**
         * The base implementation of `_.isTypedArray` without Node.js optimizations.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
         */
        function baseIsTypedArray(value) {
          return isObjectLike(value) &&
            isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
        }

        /**
         * The base implementation of `_.iteratee`.
         *
         * @private
         * @param {*} [value=_.identity] The value to convert to an iteratee.
         * @returns {Function} Returns the iteratee.
         */
        function baseIteratee(value) {
          // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
          // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
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

        /**
         * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         */
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

        /**
         * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         */
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

        /**
         * The base implementation of `_.lt` which doesn't coerce arguments.
         *
         * @private
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is less than `other`,
         *  else `false`.
         */
        function baseLt(value, other) {
          return value < other;
        }

        /**
         * The base implementation of `_.map` without support for iteratee shorthands.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array} Returns the new mapped array.
         */
        function baseMap(collection, iteratee) {
          var index = -1,
              result = isArrayLike(collection) ? Array(collection.length) : [];

          baseEach(collection, function(value, key, collection) {
            result[++index] = iteratee(value, key, collection);
          });
          return result;
        }

        /**
         * The base implementation of `_.matches` which doesn't clone `source`.
         *
         * @private
         * @param {Object} source The object of property values to match.
         * @returns {Function} Returns the new spec function.
         */
        function baseMatches(source) {
          var matchData = getMatchData(source);
          if (matchData.length == 1 && matchData[0][2]) {
            return matchesStrictComparable(matchData[0][0], matchData[0][1]);
          }
          return function(object) {
            return object === source || baseIsMatch(object, source, matchData);
          };
        }

        /**
         * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
         *
         * @private
         * @param {string} path The path of the property to get.
         * @param {*} srcValue The value to match.
         * @returns {Function} Returns the new spec function.
         */
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

        /**
         * The base implementation of `_.merge` without support for multiple sources.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @param {number} srcIndex The index of `source`.
         * @param {Function} [customizer] The function to customize merged values.
         * @param {Object} [stack] Tracks traversed source values and their merged
         *  counterparts.
         */
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

        /**
         * A specialized version of `baseMerge` for arrays and objects which performs
         * deep merges and tracks traversed objects enabling objects with circular
         * references to be merged.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @param {string} key The key of the value to merge.
         * @param {number} srcIndex The index of `source`.
         * @param {Function} mergeFunc The function to merge values.
         * @param {Function} [customizer] The function to customize assigned values.
         * @param {Object} [stack] Tracks traversed source values and their merged
         *  counterparts.
         */
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
            // Recursively merge objects and arrays (susceptible to call stack limits).
            stack.set(srcValue, newValue);
            mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
            stack['delete'](srcValue);
          }
          assignMergeValue(object, key, newValue);
        }

        /**
         * The base implementation of `_.nth` which doesn't coerce arguments.
         *
         * @private
         * @param {Array} array The array to query.
         * @param {number} n The index of the element to return.
         * @returns {*} Returns the nth element of `array`.
         */
        function baseNth(array, n) {
          var length = array.length;
          if (!length) {
            return;
          }
          n += n < 0 ? length : 0;
          return isIndex(n, length) ? array[n] : undefined$1;
        }

        /**
         * The base implementation of `_.orderBy` without param guards.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
         * @param {string[]} orders The sort orders of `iteratees`.
         * @returns {Array} Returns the new sorted array.
         */
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

        /**
         * The base implementation of `_.pick` without support for individual
         * property identifiers.
         *
         * @private
         * @param {Object} object The source object.
         * @param {string[]} paths The property paths to pick.
         * @returns {Object} Returns the new object.
         */
        function basePick(object, paths) {
          return basePickBy(object, paths, function(value, path) {
            return hasIn(object, path);
          });
        }

        /**
         * The base implementation of  `_.pickBy` without support for iteratee shorthands.
         *
         * @private
         * @param {Object} object The source object.
         * @param {string[]} paths The property paths to pick.
         * @param {Function} predicate The function invoked per property.
         * @returns {Object} Returns the new object.
         */
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

        /**
         * A specialized version of `baseProperty` which supports deep paths.
         *
         * @private
         * @param {Array|string} path The path of the property to get.
         * @returns {Function} Returns the new accessor function.
         */
        function basePropertyDeep(path) {
          return function(object) {
            return baseGet(object, path);
          };
        }

        /**
         * The base implementation of `_.pullAllBy` without support for iteratee
         * shorthands.
         *
         * @private
         * @param {Array} array The array to modify.
         * @param {Array} values The values to remove.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns `array`.
         */
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

        /**
         * The base implementation of `_.pullAt` without support for individual
         * indexes or capturing the removed elements.
         *
         * @private
         * @param {Array} array The array to modify.
         * @param {number[]} indexes The indexes of elements to remove.
         * @returns {Array} Returns `array`.
         */
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

        /**
         * The base implementation of `_.random` without support for returning
         * floating-point numbers.
         *
         * @private
         * @param {number} lower The lower bound.
         * @param {number} upper The upper bound.
         * @returns {number} Returns the random number.
         */
        function baseRandom(lower, upper) {
          return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
        }

        /**
         * The base implementation of `_.range` and `_.rangeRight` which doesn't
         * coerce arguments.
         *
         * @private
         * @param {number} start The start of the range.
         * @param {number} end The end of the range.
         * @param {number} step The value to increment or decrement by.
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Array} Returns the range of numbers.
         */
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

        /**
         * The base implementation of `_.repeat` which doesn't coerce arguments.
         *
         * @private
         * @param {string} string The string to repeat.
         * @param {number} n The number of times to repeat the string.
         * @returns {string} Returns the repeated string.
         */
        function baseRepeat(string, n) {
          var result = '';
          if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
            return result;
          }
          // Leverage the exponentiation by squaring algorithm for a faster repeat.
          // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
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

        /**
         * The base implementation of `_.rest` which doesn't validate or coerce arguments.
         *
         * @private
         * @param {Function} func The function to apply a rest parameter to.
         * @param {number} [start=func.length-1] The start position of the rest parameter.
         * @returns {Function} Returns the new function.
         */
        function baseRest(func, start) {
          return setToString(overRest(func, start, identity), func + '');
        }

        /**
         * The base implementation of `_.sample`.
         *
         * @private
         * @param {Array|Object} collection The collection to sample.
         * @returns {*} Returns the random element.
         */
        function baseSample(collection) {
          return arraySample(values(collection));
        }

        /**
         * The base implementation of `_.sampleSize` without param guards.
         *
         * @private
         * @param {Array|Object} collection The collection to sample.
         * @param {number} n The number of elements to sample.
         * @returns {Array} Returns the random elements.
         */
        function baseSampleSize(collection, n) {
          var array = values(collection);
          return shuffleSelf(array, baseClamp(n, 0, array.length));
        }

        /**
         * The base implementation of `_.set`.
         *
         * @private
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to set.
         * @param {*} value The value to set.
         * @param {Function} [customizer] The function to customize path creation.
         * @returns {Object} Returns `object`.
         */
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

        /**
         * The base implementation of `setData` without support for hot loop shorting.
         *
         * @private
         * @param {Function} func The function to associate metadata with.
         * @param {*} data The metadata.
         * @returns {Function} Returns `func`.
         */
        var baseSetData = !metaMap ? identity : function(func, data) {
          metaMap.set(func, data);
          return func;
        };

        /**
         * The base implementation of `setToString` without support for hot loop shorting.
         *
         * @private
         * @param {Function} func The function to modify.
         * @param {Function} string The `toString` result.
         * @returns {Function} Returns `func`.
         */
        var baseSetToString = !defineProperty ? identity : function(func, string) {
          return defineProperty(func, 'toString', {
            'configurable': true,
            'enumerable': false,
            'value': constant(string),
            'writable': true
          });
        };

        /**
         * The base implementation of `_.shuffle`.
         *
         * @private
         * @param {Array|Object} collection The collection to shuffle.
         * @returns {Array} Returns the new shuffled array.
         */
        function baseShuffle(collection) {
          return shuffleSelf(values(collection));
        }

        /**
         * The base implementation of `_.slice` without an iteratee call guard.
         *
         * @private
         * @param {Array} array The array to slice.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns the slice of `array`.
         */
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

        /**
         * The base implementation of `_.some` without support for iteratee shorthands.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {boolean} Returns `true` if any element passes the predicate check,
         *  else `false`.
         */
        function baseSome(collection, predicate) {
          var result;

          baseEach(collection, function(value, index, collection) {
            result = predicate(value, index, collection);
            return !result;
          });
          return !!result;
        }

        /**
         * The base implementation of `_.sortedIndex` and `_.sortedLastIndex` which
         * performs a binary search of `array` to determine the index at which `value`
         * should be inserted into `array` in order to maintain its sort order.
         *
         * @private
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {boolean} [retHighest] Specify returning the highest qualified index.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         */
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

        /**
         * The base implementation of `_.sortedIndexBy` and `_.sortedLastIndexBy`
         * which invokes `iteratee` for `value` and each element of `array` to compute
         * their sort ranking. The iteratee is invoked with one argument; (value).
         *
         * @private
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {Function} iteratee The iteratee invoked per element.
         * @param {boolean} [retHighest] Specify returning the highest qualified index.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         */
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

        /**
         * The base implementation of `_.sortedUniq` and `_.sortedUniqBy` without
         * support for iteratee shorthands.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @returns {Array} Returns the new duplicate free array.
         */
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

        /**
         * The base implementation of `_.toNumber` which doesn't ensure correct
         * conversions of binary, hexadecimal, or octal string values.
         *
         * @private
         * @param {*} value The value to process.
         * @returns {number} Returns the number.
         */
        function baseToNumber(value) {
          if (typeof value == 'number') {
            return value;
          }
          if (isSymbol(value)) {
            return NAN;
          }
          return +value;
        }

        /**
         * The base implementation of `_.toString` which doesn't convert nullish
         * values to empty strings.
         *
         * @private
         * @param {*} value The value to process.
         * @returns {string} Returns the string.
         */
        function baseToString(value) {
          // Exit early for strings to avoid a performance hit in some environments.
          if (typeof value == 'string') {
            return value;
          }
          if (isArray(value)) {
            // Recursively convert values (susceptible to call stack limits).
            return arrayMap(value, baseToString) + '';
          }
          if (isSymbol(value)) {
            return symbolToString ? symbolToString.call(value) : '';
          }
          var result = (value + '');
          return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
        }

        /**
         * The base implementation of `_.uniqBy` without support for iteratee shorthands.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new duplicate free array.
         */
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

        /**
         * The base implementation of `_.unset`.
         *
         * @private
         * @param {Object} object The object to modify.
         * @param {Array|string} path The property path to unset.
         * @returns {boolean} Returns `true` if the property is deleted, else `false`.
         */
        function baseUnset(object, path) {
          path = castPath(path, object);
          object = parent(object, path);
          return object == null || delete object[toKey(last(path))];
        }

        /**
         * The base implementation of `_.update`.
         *
         * @private
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to update.
         * @param {Function} updater The function to produce the updated value.
         * @param {Function} [customizer] The function to customize path creation.
         * @returns {Object} Returns `object`.
         */
        function baseUpdate(object, path, updater, customizer) {
          return baseSet(object, path, updater(baseGet(object, path)), customizer);
        }

        /**
         * The base implementation of methods like `_.dropWhile` and `_.takeWhile`
         * without support for iteratee shorthands.
         *
         * @private
         * @param {Array} array The array to query.
         * @param {Function} predicate The function invoked per iteration.
         * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Array} Returns the slice of `array`.
         */
        function baseWhile(array, predicate, isDrop, fromRight) {
          var length = array.length,
              index = fromRight ? length : -1;

          while ((fromRight ? index-- : ++index < length) &&
            predicate(array[index], index, array)) {}

          return isDrop
            ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
            : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
        }

        /**
         * The base implementation of `wrapperValue` which returns the result of
         * performing a sequence of actions on the unwrapped `value`, where each
         * successive action is supplied the return value of the previous.
         *
         * @private
         * @param {*} value The unwrapped value.
         * @param {Array} actions Actions to perform to resolve the unwrapped value.
         * @returns {*} Returns the resolved value.
         */
        function baseWrapperValue(value, actions) {
          var result = value;
          if (result instanceof LazyWrapper) {
            result = result.value();
          }
          return arrayReduce(actions, function(result, action) {
            return action.func.apply(action.thisArg, arrayPush([result], action.args));
          }, result);
        }

        /**
         * The base implementation of methods like `_.xor`, without support for
         * iteratee shorthands, that accepts an array of arrays to inspect.
         *
         * @private
         * @param {Array} arrays The arrays to inspect.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of values.
         */
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

        /**
         * This base implementation of `_.zipObject` which assigns values using `assignFunc`.
         *
         * @private
         * @param {Array} props The property identifiers.
         * @param {Array} values The property values.
         * @param {Function} assignFunc The function to assign values.
         * @returns {Object} Returns the new object.
         */
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

        /**
         * Casts `value` to an empty array if it's not an array like object.
         *
         * @private
         * @param {*} value The value to inspect.
         * @returns {Array|Object} Returns the cast array-like object.
         */
        function castArrayLikeObject(value) {
          return isArrayLikeObject(value) ? value : [];
        }

        /**
         * Casts `value` to `identity` if it's not a function.
         *
         * @private
         * @param {*} value The value to inspect.
         * @returns {Function} Returns cast function.
         */
        function castFunction(value) {
          return typeof value == 'function' ? value : identity;
        }

        /**
         * Casts `value` to a path array if it's not one.
         *
         * @private
         * @param {*} value The value to inspect.
         * @param {Object} [object] The object to query keys on.
         * @returns {Array} Returns the cast property path array.
         */
        function castPath(value, object) {
          if (isArray(value)) {
            return value;
          }
          return isKey(value, object) ? [value] : stringToPath(toString(value));
        }

        /**
         * A `baseRest` alias which can be replaced with `identity` by module
         * replacement plugins.
         *
         * @private
         * @type {Function}
         * @param {Function} func The function to apply a rest parameter to.
         * @returns {Function} Returns the new function.
         */
        var castRest = baseRest;

        /**
         * Casts `array` to a slice if it's needed.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {number} start The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns the cast slice.
         */
        function castSlice(array, start, end) {
          var length = array.length;
          end = end === undefined$1 ? length : end;
          return (!start && end >= length) ? array : baseSlice(array, start, end);
        }

        /**
         * A simple wrapper around the global [`clearTimeout`](https://mdn.io/clearTimeout).
         *
         * @private
         * @param {number|Object} id The timer id or timeout object of the timer to clear.
         */
        var clearTimeout = ctxClearTimeout || function(id) {
          return root.clearTimeout(id);
        };

        /**
         * Creates a clone of  `buffer`.
         *
         * @private
         * @param {Buffer} buffer The buffer to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @returns {Buffer} Returns the cloned buffer.
         */
        function cloneBuffer(buffer, isDeep) {
          if (isDeep) {
            return buffer.slice();
          }
          var length = buffer.length,
              result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

          buffer.copy(result);
          return result;
        }

        /**
         * Creates a clone of `arrayBuffer`.
         *
         * @private
         * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
         * @returns {ArrayBuffer} Returns the cloned array buffer.
         */
        function cloneArrayBuffer(arrayBuffer) {
          var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
          new Uint8Array(result).set(new Uint8Array(arrayBuffer));
          return result;
        }

        /**
         * Creates a clone of `dataView`.
         *
         * @private
         * @param {Object} dataView The data view to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @returns {Object} Returns the cloned data view.
         */
        function cloneDataView(dataView, isDeep) {
          var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
          return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
        }

        /**
         * Creates a clone of `regexp`.
         *
         * @private
         * @param {Object} regexp The regexp to clone.
         * @returns {Object} Returns the cloned regexp.
         */
        function cloneRegExp(regexp) {
          var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
          result.lastIndex = regexp.lastIndex;
          return result;
        }

        /**
         * Creates a clone of the `symbol` object.
         *
         * @private
         * @param {Object} symbol The symbol object to clone.
         * @returns {Object} Returns the cloned symbol object.
         */
        function cloneSymbol(symbol) {
          return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
        }

        /**
         * Creates a clone of `typedArray`.
         *
         * @private
         * @param {Object} typedArray The typed array to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @returns {Object} Returns the cloned typed array.
         */
        function cloneTypedArray(typedArray, isDeep) {
          var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
          return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
        }

        /**
         * Compares values to sort them in ascending order.
         *
         * @private
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {number} Returns the sort order indicator for `value`.
         */
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

        /**
         * Used by `_.orderBy` to compare multiple properties of a value to another
         * and stable sort them.
         *
         * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
         * specify an order of "desc" for descending or "asc" for ascending sort order
         * of corresponding values.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {boolean[]|string[]} orders The order to sort by for each property.
         * @returns {number} Returns the sort order indicator for `object`.
         */
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
          // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
          // that causes it, under certain circumstances, to provide the same value for
          // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
          // for more details.
          //
          // This also ensures a stable sort in V8 and other engines.
          // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
          return object.index - other.index;
        }

        /**
         * Creates an array that is the composition of partially applied arguments,
         * placeholders, and provided arguments into a single array of arguments.
         *
         * @private
         * @param {Array} args The provided arguments.
         * @param {Array} partials The arguments to prepend to those provided.
         * @param {Array} holders The `partials` placeholder indexes.
         * @params {boolean} [isCurried] Specify composing for a curried function.
         * @returns {Array} Returns the new array of composed arguments.
         */
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

        /**
         * This function is like `composeArgs` except that the arguments composition
         * is tailored for `_.partialRight`.
         *
         * @private
         * @param {Array} args The provided arguments.
         * @param {Array} partials The arguments to append to those provided.
         * @param {Array} holders The `partials` placeholder indexes.
         * @params {boolean} [isCurried] Specify composing for a curried function.
         * @returns {Array} Returns the new array of composed arguments.
         */
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

        /**
         * Copies the values of `source` to `array`.
         *
         * @private
         * @param {Array} source The array to copy values from.
         * @param {Array} [array=[]] The array to copy values to.
         * @returns {Array} Returns `array`.
         */
        function copyArray(source, array) {
          var index = -1,
              length = source.length;

          array || (array = Array(length));
          while (++index < length) {
            array[index] = source[index];
          }
          return array;
        }

        /**
         * Copies properties of `source` to `object`.
         *
         * @private
         * @param {Object} source The object to copy properties from.
         * @param {Array} props The property identifiers to copy.
         * @param {Object} [object={}] The object to copy properties to.
         * @param {Function} [customizer] The function to customize copied values.
         * @returns {Object} Returns `object`.
         */
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

        /**
         * Copies own symbols of `source` to `object`.
         *
         * @private
         * @param {Object} source The object to copy symbols from.
         * @param {Object} [object={}] The object to copy symbols to.
         * @returns {Object} Returns `object`.
         */
        function copySymbols(source, object) {
          return copyObject(source, getSymbols(source), object);
        }

        /**
         * Copies own and inherited symbols of `source` to `object`.
         *
         * @private
         * @param {Object} source The object to copy symbols from.
         * @param {Object} [object={}] The object to copy symbols to.
         * @returns {Object} Returns `object`.
         */
        function copySymbolsIn(source, object) {
          return copyObject(source, getSymbolsIn(source), object);
        }

        /**
         * Creates a function like `_.groupBy`.
         *
         * @private
         * @param {Function} setter The function to set accumulator values.
         * @param {Function} [initializer] The accumulator object initializer.
         * @returns {Function} Returns the new aggregator function.
         */
        function createAggregator(setter, initializer) {
          return function(collection, iteratee) {
            var func = isArray(collection) ? arrayAggregator : baseAggregator,
                accumulator = initializer ? initializer() : {};

            return func(collection, setter, getIteratee(iteratee, 2), accumulator);
          };
        }

        /**
         * Creates a function like `_.assign`.
         *
         * @private
         * @param {Function} assigner The function to assign values.
         * @returns {Function} Returns the new assigner function.
         */
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

        /**
         * Creates a `baseEach` or `baseEachRight` function.
         *
         * @private
         * @param {Function} eachFunc The function to iterate over a collection.
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new base function.
         */
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

        /**
         * Creates a base function for methods like `_.forIn` and `_.forOwn`.
         *
         * @private
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new base function.
         */
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

        /**
         * Creates a function that wraps `func` to invoke it with the optional `this`
         * binding of `thisArg`.
         *
         * @private
         * @param {Function} func The function to wrap.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
        function createBind(func, bitmask, thisArg) {
          var isBind = bitmask & WRAP_BIND_FLAG,
              Ctor = createCtor(func);

          function wrapper() {
            var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
            return fn.apply(isBind ? thisArg : this, arguments);
          }
          return wrapper;
        }

        /**
         * Creates a function like `_.lowerFirst`.
         *
         * @private
         * @param {string} methodName The name of the `String` case method to use.
         * @returns {Function} Returns the new case function.
         */
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

        /**
         * Creates a function like `_.camelCase`.
         *
         * @private
         * @param {Function} callback The function to combine each word.
         * @returns {Function} Returns the new compounder function.
         */
        function createCompounder(callback) {
          return function(string) {
            return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
          };
        }

        /**
         * Creates a function that produces an instance of `Ctor` regardless of
         * whether it was invoked as part of a `new` expression or by `call` or `apply`.
         *
         * @private
         * @param {Function} Ctor The constructor to wrap.
         * @returns {Function} Returns the new wrapped function.
         */
        function createCtor(Ctor) {
          return function() {
            // Use a `switch` statement to work with class constructors. See
            // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
            // for more details.
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

            // Mimic the constructor's `return` behavior.
            // See https://es5.github.io/#x13.2.2 for more details.
            return isObject(result) ? result : thisBinding;
          };
        }

        /**
         * Creates a function that wraps `func` to enable currying.
         *
         * @private
         * @param {Function} func The function to wrap.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @param {number} arity The arity of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
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

        /**
         * Creates a `_.find` or `_.findLast` function.
         *
         * @private
         * @param {Function} findIndexFunc The function to find the collection index.
         * @returns {Function} Returns the new find function.
         */
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

        /**
         * Creates a `_.flow` or `_.flowRight` function.
         *
         * @private
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new flow function.
         */
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

        /**
         * Creates a function that wraps `func` to invoke it with optional `this`
         * binding of `thisArg`, partial application, and currying.
         *
         * @private
         * @param {Function|string} func The function or method name to wrap.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param {Array} [partials] The arguments to prepend to those provided to
         *  the new function.
         * @param {Array} [holders] The `partials` placeholder indexes.
         * @param {Array} [partialsRight] The arguments to append to those provided
         *  to the new function.
         * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
         * @param {Array} [argPos] The argument positions of the new function.
         * @param {number} [ary] The arity cap of `func`.
         * @param {number} [arity] The arity of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
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

        /**
         * Creates a function like `_.invertBy`.
         *
         * @private
         * @param {Function} setter The function to set accumulator values.
         * @param {Function} toIteratee The function to resolve iteratees.
         * @returns {Function} Returns the new inverter function.
         */
        function createInverter(setter, toIteratee) {
          return function(object, iteratee) {
            return baseInverter(object, setter, toIteratee(iteratee), {});
          };
        }

        /**
         * Creates a function that performs a mathematical operation on two values.
         *
         * @private
         * @param {Function} operator The function to perform the operation.
         * @param {number} [defaultValue] The value used for `undefined` arguments.
         * @returns {Function} Returns the new mathematical operation function.
         */
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

        /**
         * Creates a function like `_.over`.
         *
         * @private
         * @param {Function} arrayFunc The function to iterate over iteratees.
         * @returns {Function} Returns the new over function.
         */
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

        /**
         * Creates the padding for `string` based on `length`. The `chars` string
         * is truncated if the number of characters exceeds `length`.
         *
         * @private
         * @param {number} length The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padding for `string`.
         */
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

        /**
         * Creates a function that wraps `func` to invoke it with the `this` binding
         * of `thisArg` and `partials` prepended to the arguments it receives.
         *
         * @private
         * @param {Function} func The function to wrap.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @param {*} thisArg The `this` binding of `func`.
         * @param {Array} partials The arguments to prepend to those provided to
         *  the new function.
         * @returns {Function} Returns the new wrapped function.
         */
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

        /**
         * Creates a `_.range` or `_.rangeRight` function.
         *
         * @private
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new range function.
         */
        function createRange(fromRight) {
          return function(start, end, step) {
            if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
              end = step = undefined$1;
            }
            // Ensure the sign of `-0` is preserved.
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

        /**
         * Creates a function that performs a relational operation on two values.
         *
         * @private
         * @param {Function} operator The function to perform the operation.
         * @returns {Function} Returns the new relational operation function.
         */
        function createRelationalOperation(operator) {
          return function(value, other) {
            if (!(typeof value == 'string' && typeof other == 'string')) {
              value = toNumber(value);
              other = toNumber(other);
            }
            return operator(value, other);
          };
        }

        /**
         * Creates a function that wraps `func` to continue currying.
         *
         * @private
         * @param {Function} func The function to wrap.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @param {Function} wrapFunc The function to create the `func` wrapper.
         * @param {*} placeholder The placeholder value.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param {Array} [partials] The arguments to prepend to those provided to
         *  the new function.
         * @param {Array} [holders] The `partials` placeholder indexes.
         * @param {Array} [argPos] The argument positions of the new function.
         * @param {number} [ary] The arity cap of `func`.
         * @param {number} [arity] The arity of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
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

        /**
         * Creates a function like `_.round`.
         *
         * @private
         * @param {string} methodName The name of the `Math` method to use when rounding.
         * @returns {Function} Returns the new round function.
         */
        function createRound(methodName) {
          var func = Math[methodName];
          return function(number, precision) {
            number = toNumber(number);
            precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
            if (precision && nativeIsFinite(number)) {
              // Shift with exponential notation to avoid floating-point issues.
              // See [MDN](https://mdn.io/round#Examples) for more details.
              var pair = (toString(number) + 'e').split('e'),
                  value = func(pair[0] + 'e' + (+pair[1] + precision));

              pair = (toString(value) + 'e').split('e');
              return +(pair[0] + 'e' + (+pair[1] - precision));
            }
            return func(number);
          };
        }

        /**
         * Creates a set object of `values`.
         *
         * @private
         * @param {Array} values The values to add to the set.
         * @returns {Object} Returns the new set.
         */
        var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
          return new Set(values);
        };

        /**
         * Creates a `_.toPairs` or `_.toPairsIn` function.
         *
         * @private
         * @param {Function} keysFunc The function to get the keys of a given object.
         * @returns {Function} Returns the new pairs function.
         */
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

        /**
         * Creates a function that either curries or invokes `func` with optional
         * `this` binding and partially applied arguments.
         *
         * @private
         * @param {Function|string} func The function or method name to wrap.
         * @param {number} bitmask The bitmask flags.
         *    1 - `_.bind`
         *    2 - `_.bindKey`
         *    4 - `_.curry` or `_.curryRight` of a bound function
         *    8 - `_.curry`
         *   16 - `_.curryRight`
         *   32 - `_.partial`
         *   64 - `_.partialRight`
         *  128 - `_.rearg`
         *  256 - `_.ary`
         *  512 - `_.flip`
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param {Array} [partials] The arguments to be partially applied.
         * @param {Array} [holders] The `partials` placeholder indexes.
         * @param {Array} [argPos] The argument positions of the new function.
         * @param {number} [ary] The arity cap of `func`.
         * @param {number} [arity] The arity of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
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

        /**
         * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
         * of source objects to the destination object for all destination properties
         * that resolve to `undefined`.
         *
         * @private
         * @param {*} objValue The destination value.
         * @param {*} srcValue The source value.
         * @param {string} key The key of the property to assign.
         * @param {Object} object The parent object of `objValue`.
         * @returns {*} Returns the value to assign.
         */
        function customDefaultsAssignIn(objValue, srcValue, key, object) {
          if (objValue === undefined$1 ||
              (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
            return srcValue;
          }
          return objValue;
        }

        /**
         * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
         * objects into destination objects that are passed thru.
         *
         * @private
         * @param {*} objValue The destination value.
         * @param {*} srcValue The source value.
         * @param {string} key The key of the property to merge.
         * @param {Object} object The parent object of `objValue`.
         * @param {Object} source The parent object of `srcValue`.
         * @param {Object} [stack] Tracks traversed source values and their merged
         *  counterparts.
         * @returns {*} Returns the value to assign.
         */
        function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
          if (isObject(objValue) && isObject(srcValue)) {
            // Recursively merge objects and arrays (susceptible to call stack limits).
            stack.set(srcValue, objValue);
            baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
            stack['delete'](srcValue);
          }
          return objValue;
        }

        /**
         * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
         * objects.
         *
         * @private
         * @param {*} value The value to inspect.
         * @param {string} key The key of the property to inspect.
         * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
         */
        function customOmitClone(value) {
          return isPlainObject(value) ? undefined$1 : value;
        }

        /**
         * A specialized version of `baseIsEqualDeep` for arrays with support for
         * partial deep comparisons.
         *
         * @private
         * @param {Array} array The array to compare.
         * @param {Array} other The other array to compare.
         * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
         * @param {Function} customizer The function to customize comparisons.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Object} stack Tracks traversed `array` and `other` objects.
         * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
         */
        function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
              arrLength = array.length,
              othLength = other.length;

          if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(array);
          if (stacked && stack.get(other)) {
            return stacked == other;
          }
          var index = -1,
              result = true,
              seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined$1;

          stack.set(array, other);
          stack.set(other, array);

          // Ignore non-index properties.
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
            // Recursively compare arrays (susceptible to call stack limits).
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

        /**
         * A specialized version of `baseIsEqualDeep` for comparing objects of
         * the same `toStringTag`.
         *
         * **Note:** This function only supports comparing values with tags of
         * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {string} tag The `toStringTag` of the objects to compare.
         * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
         * @param {Function} customizer The function to customize comparisons.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Object} stack Tracks traversed `object` and `other` objects.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
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
              // Coerce booleans to `1` or `0` and dates to milliseconds.
              // Invalid dates are coerced to `NaN`.
              return eq(+object, +other);

            case errorTag:
              return object.name == other.name && object.message == other.message;

            case regexpTag:
            case stringTag:
              // Coerce regexes to strings and treat strings, primitives and objects,
              // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
              // for more details.
              return object == (other + '');

            case mapTag:
              var convert = mapToArray;

            case setTag:
              var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
              convert || (convert = setToArray);

              if (object.size != other.size && !isPartial) {
                return false;
              }
              // Assume cyclic values are equal.
              var stacked = stack.get(object);
              if (stacked) {
                return stacked == other;
              }
              bitmask |= COMPARE_UNORDERED_FLAG;

              // Recursively compare objects (susceptible to call stack limits).
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

        /**
         * A specialized version of `baseIsEqualDeep` for objects with support for
         * partial deep comparisons.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
         * @param {Function} customizer The function to customize comparisons.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Object} stack Tracks traversed `object` and `other` objects.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
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
          // Assume cyclic values are equal.
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
            // Recursively compare objects (susceptible to call stack limits).
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

            // Non `Object` object instances with different constructors are not equal.
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

        /**
         * A specialized version of `baseRest` which flattens the rest array.
         *
         * @private
         * @param {Function} func The function to apply a rest parameter to.
         * @returns {Function} Returns the new function.
         */
        function flatRest(func) {
          return setToString(overRest(func, undefined$1, flatten), func + '');
        }

        /**
         * Creates an array of own enumerable property names and symbols of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names and symbols.
         */
        function getAllKeys(object) {
          return baseGetAllKeys(object, keys, getSymbols);
        }

        /**
         * Creates an array of own and inherited enumerable property names and
         * symbols of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names and symbols.
         */
        function getAllKeysIn(object) {
          return baseGetAllKeys(object, keysIn, getSymbolsIn);
        }

        /**
         * Gets metadata for `func`.
         *
         * @private
         * @param {Function} func The function to query.
         * @returns {*} Returns the metadata for `func`.
         */
        var getData = !metaMap ? noop : function(func) {
          return metaMap.get(func);
        };

        /**
         * Gets the name of `func`.
         *
         * @private
         * @param {Function} func The function to query.
         * @returns {string} Returns the function name.
         */
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

        /**
         * Gets the argument placeholder value for `func`.
         *
         * @private
         * @param {Function} func The function to inspect.
         * @returns {*} Returns the placeholder value.
         */
        function getHolder(func) {
          var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
          return object.placeholder;
        }

        /**
         * Gets the appropriate "iteratee" function. If `_.iteratee` is customized,
         * this function returns the custom method, otherwise it returns `baseIteratee`.
         * If arguments are provided, the chosen function is invoked with them and
         * its result is returned.
         *
         * @private
         * @param {*} [value] The value to convert to an iteratee.
         * @param {number} [arity] The arity of the created iteratee.
         * @returns {Function} Returns the chosen function or its result.
         */
        function getIteratee() {
          var result = lodash.iteratee || iteratee;
          result = result === iteratee ? baseIteratee : result;
          return arguments.length ? result(arguments[0], arguments[1]) : result;
        }

        /**
         * Gets the data for `map`.
         *
         * @private
         * @param {Object} map The map to query.
         * @param {string} key The reference key.
         * @returns {*} Returns the map data.
         */
        function getMapData(map, key) {
          var data = map.__data__;
          return isKeyable(key)
            ? data[typeof key == 'string' ? 'string' : 'hash']
            : data.map;
        }

        /**
         * Gets the property names, values, and compare flags of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the match data of `object`.
         */
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

        /**
         * Gets the native function at `key` of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {string} key The key of the method to get.
         * @returns {*} Returns the function if it's native, else `undefined`.
         */
        function getNative(object, key) {
          var value = getValue(object, key);
          return baseIsNative(value) ? value : undefined$1;
        }

        /**
         * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
         *
         * @private
         * @param {*} value The value to query.
         * @returns {string} Returns the raw `toStringTag`.
         */
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

        /**
         * Creates an array of the own enumerable symbols of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of symbols.
         */
        var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
          if (object == null) {
            return [];
          }
          object = Object(object);
          return arrayFilter(nativeGetSymbols(object), function(symbol) {
            return propertyIsEnumerable.call(object, symbol);
          });
        };

        /**
         * Creates an array of the own and inherited enumerable symbols of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of symbols.
         */
        var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
          var result = [];
          while (object) {
            arrayPush(result, getSymbols(object));
            object = getPrototype(object);
          }
          return result;
        };

        /**
         * Gets the `toStringTag` of `value`.
         *
         * @private
         * @param {*} value The value to query.
         * @returns {string} Returns the `toStringTag`.
         */
        var getTag = baseGetTag;

        // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
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

        /**
         * Gets the view, applying any `transforms` to the `start` and `end` positions.
         *
         * @private
         * @param {number} start The start of the view.
         * @param {number} end The end of the view.
         * @param {Array} transforms The transformations to apply to the view.
         * @returns {Object} Returns an object containing the `start` and `end`
         *  positions of the view.
         */
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

        /**
         * Extracts wrapper details from the `source` body comment.
         *
         * @private
         * @param {string} source The source to inspect.
         * @returns {Array} Returns the wrapper details.
         */
        function getWrapDetails(source) {
          var match = source.match(reWrapDetails);
          return match ? match[1].split(reSplitDetails) : [];
        }

        /**
         * Checks if `path` exists on `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array|string} path The path to check.
         * @param {Function} hasFunc The function to check properties.
         * @returns {boolean} Returns `true` if `path` exists, else `false`.
         */
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

        /**
         * Initializes an array clone.
         *
         * @private
         * @param {Array} array The array to clone.
         * @returns {Array} Returns the initialized clone.
         */
        function initCloneArray(array) {
          var length = array.length,
              result = new array.constructor(length);

          // Add properties assigned by `RegExp#exec`.
          if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
            result.index = array.index;
            result.input = array.input;
          }
          return result;
        }

        /**
         * Initializes an object clone.
         *
         * @private
         * @param {Object} object The object to clone.
         * @returns {Object} Returns the initialized clone.
         */
        function initCloneObject(object) {
          return (typeof object.constructor == 'function' && !isPrototype(object))
            ? baseCreate(getPrototype(object))
            : {};
        }

        /**
         * Initializes an object clone based on its `toStringTag`.
         *
         * **Note:** This function only supports cloning values with tags of
         * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
         *
         * @private
         * @param {Object} object The object to clone.
         * @param {string} tag The `toStringTag` of the object to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @returns {Object} Returns the initialized clone.
         */
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

        /**
         * Inserts wrapper `details` in a comment at the top of the `source` body.
         *
         * @private
         * @param {string} source The source to modify.
         * @returns {Array} details The details to insert.
         * @returns {string} Returns the modified source.
         */
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

        /**
         * Checks if `value` is a flattenable `arguments` object or array.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
         */
        function isFlattenable(value) {
          return isArray(value) || isArguments(value) ||
            !!(spreadableSymbol && value && value[spreadableSymbol]);
        }

        /**
         * Checks if `value` is a valid array-like index.
         *
         * @private
         * @param {*} value The value to check.
         * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
         * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
         */
        function isIndex(value, length) {
          var type = typeof value;
          length = length == null ? MAX_SAFE_INTEGER : length;

          return !!length &&
            (type == 'number' ||
              (type != 'symbol' && reIsUint.test(value))) &&
                (value > -1 && value % 1 == 0 && value < length);
        }

        /**
         * Checks if the given arguments are from an iteratee call.
         *
         * @private
         * @param {*} value The potential iteratee value argument.
         * @param {*} index The potential iteratee index or key argument.
         * @param {*} object The potential iteratee object argument.
         * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
         *  else `false`.
         */
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

        /**
         * Checks if `value` is a property name and not a property path.
         *
         * @private
         * @param {*} value The value to check.
         * @param {Object} [object] The object to query keys on.
         * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
         */
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

        /**
         * Checks if `value` is suitable for use as unique object key.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
         */
        function isKeyable(value) {
          var type = typeof value;
          return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
            ? (value !== '__proto__')
            : (value === null);
        }

        /**
         * Checks if `func` has a lazy counterpart.
         *
         * @private
         * @param {Function} func The function to check.
         * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
         *  else `false`.
         */
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

        /**
         * Checks if `func` has its source masked.
         *
         * @private
         * @param {Function} func The function to check.
         * @returns {boolean} Returns `true` if `func` is masked, else `false`.
         */
        function isMasked(func) {
          return !!maskSrcKey && (maskSrcKey in func);
        }

        /**
         * Checks if `func` is capable of being masked.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
         */
        var isMaskable = coreJsData ? isFunction : stubFalse;

        /**
         * Checks if `value` is likely a prototype object.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
         */
        function isPrototype(value) {
          var Ctor = value && value.constructor,
              proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

          return value === proto;
        }

        /**
         * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` if suitable for strict
         *  equality comparisons, else `false`.
         */
        function isStrictComparable(value) {
          return value === value && !isObject(value);
        }

        /**
         * A specialized version of `matchesProperty` for source values suitable
         * for strict equality comparisons, i.e. `===`.
         *
         * @private
         * @param {string} key The key of the property to get.
         * @param {*} srcValue The value to match.
         * @returns {Function} Returns the new spec function.
         */
        function matchesStrictComparable(key, srcValue) {
          return function(object) {
            if (object == null) {
              return false;
            }
            return object[key] === srcValue &&
              (srcValue !== undefined$1 || (key in Object(object)));
          };
        }

        /**
         * A specialized version of `_.memoize` which clears the memoized function's
         * cache when it exceeds `MAX_MEMOIZE_SIZE`.
         *
         * @private
         * @param {Function} func The function to have its output memoized.
         * @returns {Function} Returns the new memoized function.
         */
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

        /**
         * Merges the function metadata of `source` into `data`.
         *
         * Merging metadata reduces the number of wrappers used to invoke a function.
         * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
         * may be applied regardless of execution order. Methods like `_.ary` and
         * `_.rearg` modify function arguments, making the order in which they are
         * executed important, preventing the merging of metadata. However, we make
         * an exception for a safe combined case where curried functions have `_.ary`
         * and or `_.rearg` applied.
         *
         * @private
         * @param {Array} data The destination metadata.
         * @param {Array} source The source metadata.
         * @returns {Array} Returns `data`.
         */
        function mergeData(data, source) {
          var bitmask = data[1],
              srcBitmask = source[1],
              newBitmask = bitmask | srcBitmask,
              isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);

          var isCombo =
            ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
            ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
            ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));

          // Exit early if metadata can't be merged.
          if (!(isCommon || isCombo)) {
            return data;
          }
          // Use source `thisArg` if available.
          if (srcBitmask & WRAP_BIND_FLAG) {
            data[2] = source[2];
            // Set when currying a bound function.
            newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
          }
          // Compose partial arguments.
          var value = source[3];
          if (value) {
            var partials = data[3];
            data[3] = partials ? composeArgs(partials, value, source[4]) : value;
            data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
          }
          // Compose partial right arguments.
          value = source[5];
          if (value) {
            partials = data[5];
            data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
            data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
          }
          // Use source `argPos` if available.
          value = source[7];
          if (value) {
            data[7] = value;
          }
          // Use source `ary` if it's smaller.
          if (srcBitmask & WRAP_ARY_FLAG) {
            data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
          }
          // Use source `arity` if one is not provided.
          if (data[9] == null) {
            data[9] = source[9];
          }
          // Use source `func` and merge bitmasks.
          data[0] = source[0];
          data[1] = newBitmask;

          return data;
        }

        /**
         * This function is like
         * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
         * except that it includes inherited enumerable properties.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         */
        function nativeKeysIn(object) {
          var result = [];
          if (object != null) {
            for (var key in Object(object)) {
              result.push(key);
            }
          }
          return result;
        }

        /**
         * Converts `value` to a string using `Object.prototype.toString`.
         *
         * @private
         * @param {*} value The value to convert.
         * @returns {string} Returns the converted string.
         */
        function objectToString(value) {
          return nativeObjectToString.call(value);
        }

        /**
         * A specialized version of `baseRest` which transforms the rest array.
         *
         * @private
         * @param {Function} func The function to apply a rest parameter to.
         * @param {number} [start=func.length-1] The start position of the rest parameter.
         * @param {Function} transform The rest array transform.
         * @returns {Function} Returns the new function.
         */
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

        /**
         * Gets the parent value at `path` of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array} path The path to get the parent value of.
         * @returns {*} Returns the parent value.
         */
        function parent(object, path) {
          return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
        }

        /**
         * Reorder `array` according to the specified indexes where the element at
         * the first index is assigned as the first element, the element at
         * the second index is assigned as the second element, and so on.
         *
         * @private
         * @param {Array} array The array to reorder.
         * @param {Array} indexes The arranged array indexes.
         * @returns {Array} Returns `array`.
         */
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

        /**
         * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
         *
         * @private
         * @param {Object} object The object to query.
         * @param {string} key The key of the property to get.
         * @returns {*} Returns the property value.
         */
        function safeGet(object, key) {
          if (key === 'constructor' && typeof object[key] === 'function') {
            return;
          }

          if (key == '__proto__') {
            return;
          }

          return object[key];
        }

        /**
         * Sets metadata for `func`.
         *
         * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
         * period of time, it will trip its breaker and transition to an identity
         * function to avoid garbage collection pauses in V8. See
         * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
         * for more details.
         *
         * @private
         * @param {Function} func The function to associate metadata with.
         * @param {*} data The metadata.
         * @returns {Function} Returns `func`.
         */
        var setData = shortOut(baseSetData);

        /**
         * A simple wrapper around the global [`setTimeout`](https://mdn.io/setTimeout).
         *
         * @private
         * @param {Function} func The function to delay.
         * @param {number} wait The number of milliseconds to delay invocation.
         * @returns {number|Object} Returns the timer id or timeout object.
         */
        var setTimeout = ctxSetTimeout || function(func, wait) {
          return root.setTimeout(func, wait);
        };

        /**
         * Sets the `toString` method of `func` to return `string`.
         *
         * @private
         * @param {Function} func The function to modify.
         * @param {Function} string The `toString` result.
         * @returns {Function} Returns `func`.
         */
        var setToString = shortOut(baseSetToString);

        /**
         * Sets the `toString` method of `wrapper` to mimic the source of `reference`
         * with wrapper details in a comment at the top of the source body.
         *
         * @private
         * @param {Function} wrapper The function to modify.
         * @param {Function} reference The reference function.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @returns {Function} Returns `wrapper`.
         */
        function setWrapToString(wrapper, reference, bitmask) {
          var source = (reference + '');
          return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
        }

        /**
         * Creates a function that'll short out and invoke `identity` instead
         * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
         * milliseconds.
         *
         * @private
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new shortable function.
         */
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

        /**
         * A specialized version of `_.shuffle` which mutates and sets the size of `array`.
         *
         * @private
         * @param {Array} array The array to shuffle.
         * @param {number} [size=array.length] The size of `array`.
         * @returns {Array} Returns `array`.
         */
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

        /**
         * Converts `string` to a property path array.
         *
         * @private
         * @param {string} string The string to convert.
         * @returns {Array} Returns the property path array.
         */
        var stringToPath = memoizeCapped(function(string) {
          var result = [];
          if (string.charCodeAt(0) === 46 /* . */) {
            result.push('');
          }
          string.replace(rePropName, function(match, number, quote, subString) {
            result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
          });
          return result;
        });

        /**
         * Converts `value` to a string key if it's not a string or symbol.
         *
         * @private
         * @param {*} value The value to inspect.
         * @returns {string|symbol} Returns the key.
         */
        function toKey(value) {
          if (typeof value == 'string' || isSymbol(value)) {
            return value;
          }
          var result = (value + '');
          return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
        }

        /**
         * Converts `func` to its source code.
         *
         * @private
         * @param {Function} func The function to convert.
         * @returns {string} Returns the source code.
         */
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

        /**
         * Updates wrapper `details` based on `bitmask` flags.
         *
         * @private
         * @returns {Array} details The details to modify.
         * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
         * @returns {Array} Returns `details`.
         */
        function updateWrapDetails(details, bitmask) {
          arrayEach(wrapFlags, function(pair) {
            var value = '_.' + pair[0];
            if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
              details.push(value);
            }
          });
          return details.sort();
        }

        /**
         * Creates a clone of `wrapper`.
         *
         * @private
         * @param {Object} wrapper The wrapper to clone.
         * @returns {Object} Returns the cloned wrapper.
         */
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

        /*------------------------------------------------------------------------*/

        /**
         * Creates an array of elements split into groups the length of `size`.
         * If `array` can't be split evenly, the final chunk will be the remaining
         * elements.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to process.
         * @param {number} [size=1] The length of each chunk
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the new array of chunks.
         * @example
         *
         * _.chunk(['a', 'b', 'c', 'd'], 2);
         * // => [['a', 'b'], ['c', 'd']]
         *
         * _.chunk(['a', 'b', 'c', 'd'], 3);
         * // => [['a', 'b', 'c'], ['d']]
         */
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

        /**
         * Creates an array with all falsey values removed. The values `false`, `null`,
         * `0`, `""`, `undefined`, and `NaN` are falsey.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to compact.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * _.compact([0, 1, false, 2, '', 3]);
         * // => [1, 2, 3]
         */
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

        /**
         * Creates a new array concatenating `array` with any additional arrays
         * and/or values.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to concatenate.
         * @param {...*} [values] The values to concatenate.
         * @returns {Array} Returns the new concatenated array.
         * @example
         *
         * var array = [1];
         * var other = _.concat(array, 2, [3], [[4]]);
         *
         * console.log(other);
         * // => [1, 2, 3, [4]]
         *
         * console.log(array);
         * // => [1]
         */
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

        /**
         * Creates an array of `array` values not included in the other given arrays
         * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons. The order and references of result values are
         * determined by the first array.
         *
         * **Note:** Unlike `_.pullAll`, this method returns a new array.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {...Array} [values] The values to exclude.
         * @returns {Array} Returns the new array of filtered values.
         * @see _.without, _.xor
         * @example
         *
         * _.difference([2, 1], [2, 3]);
         * // => [1]
         */
        var difference = baseRest(function(array, values) {
          return isArrayLikeObject(array)
            ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
            : [];
        });

        /**
         * This method is like `_.difference` except that it accepts `iteratee` which
         * is invoked for each element of `array` and `values` to generate the criterion
         * by which they're compared. The order and references of result values are
         * determined by the first array. The iteratee is invoked with one argument:
         * (value).
         *
         * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {...Array} [values] The values to exclude.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
         * // => [1.2]
         *
         * // The `_.property` iteratee shorthand.
         * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
         * // => [{ 'x': 2 }]
         */
        var differenceBy = baseRest(function(array, values) {
          var iteratee = last(values);
          if (isArrayLikeObject(iteratee)) {
            iteratee = undefined$1;
          }
          return isArrayLikeObject(array)
            ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2))
            : [];
        });

        /**
         * This method is like `_.difference` except that it accepts `comparator`
         * which is invoked to compare elements of `array` to `values`. The order and
         * references of result values are determined by the first array. The comparator
         * is invoked with two arguments: (arrVal, othVal).
         *
         * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {...Array} [values] The values to exclude.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
         *
         * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
         * // => [{ 'x': 2, 'y': 1 }]
         */
        var differenceWith = baseRest(function(array, values) {
          var comparator = last(values);
          if (isArrayLikeObject(comparator)) {
            comparator = undefined$1;
          }
          return isArrayLikeObject(array)
            ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined$1, comparator)
            : [];
        });

        /**
         * Creates a slice of `array` with `n` elements dropped from the beginning.
         *
         * @static
         * @memberOf _
         * @since 0.5.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to drop.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.drop([1, 2, 3]);
         * // => [2, 3]
         *
         * _.drop([1, 2, 3], 2);
         * // => [3]
         *
         * _.drop([1, 2, 3], 5);
         * // => []
         *
         * _.drop([1, 2, 3], 0);
         * // => [1, 2, 3]
         */
        function drop(array, n, guard) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          n = (guard || n === undefined$1) ? 1 : toInteger(n);
          return baseSlice(array, n < 0 ? 0 : n, length);
        }

        /**
         * Creates a slice of `array` with `n` elements dropped from the end.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to drop.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.dropRight([1, 2, 3]);
         * // => [1, 2]
         *
         * _.dropRight([1, 2, 3], 2);
         * // => [1]
         *
         * _.dropRight([1, 2, 3], 5);
         * // => []
         *
         * _.dropRight([1, 2, 3], 0);
         * // => [1, 2, 3]
         */
        function dropRight(array, n, guard) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          n = (guard || n === undefined$1) ? 1 : toInteger(n);
          n = length - n;
          return baseSlice(array, 0, n < 0 ? 0 : n);
        }

        /**
         * Creates a slice of `array` excluding elements dropped from the end.
         * Elements are dropped until `predicate` returns falsey. The predicate is
         * invoked with three arguments: (value, index, array).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': true },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': false }
         * ];
         *
         * _.dropRightWhile(users, function(o) { return !o.active; });
         * // => objects for ['barney']
         *
         * // The `_.matches` iteratee shorthand.
         * _.dropRightWhile(users, { 'user': 'pebbles', 'active': false });
         * // => objects for ['barney', 'fred']
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.dropRightWhile(users, ['active', false]);
         * // => objects for ['barney']
         *
         * // The `_.property` iteratee shorthand.
         * _.dropRightWhile(users, 'active');
         * // => objects for ['barney', 'fred', 'pebbles']
         */
        function dropRightWhile(array, predicate) {
          return (array && array.length)
            ? baseWhile(array, getIteratee(predicate, 3), true, true)
            : [];
        }

        /**
         * Creates a slice of `array` excluding elements dropped from the beginning.
         * Elements are dropped until `predicate` returns falsey. The predicate is
         * invoked with three arguments: (value, index, array).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': false },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': true }
         * ];
         *
         * _.dropWhile(users, function(o) { return !o.active; });
         * // => objects for ['pebbles']
         *
         * // The `_.matches` iteratee shorthand.
         * _.dropWhile(users, { 'user': 'barney', 'active': false });
         * // => objects for ['fred', 'pebbles']
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.dropWhile(users, ['active', false]);
         * // => objects for ['pebbles']
         *
         * // The `_.property` iteratee shorthand.
         * _.dropWhile(users, 'active');
         * // => objects for ['barney', 'fred', 'pebbles']
         */
        function dropWhile(array, predicate) {
          return (array && array.length)
            ? baseWhile(array, getIteratee(predicate, 3), true)
            : [];
        }

        /**
         * Fills elements of `array` with `value` from `start` up to, but not
         * including, `end`.
         *
         * **Note:** This method mutates `array`.
         *
         * @static
         * @memberOf _
         * @since 3.2.0
         * @category Array
         * @param {Array} array The array to fill.
         * @param {*} value The value to fill `array` with.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = [1, 2, 3];
         *
         * _.fill(array, 'a');
         * console.log(array);
         * // => ['a', 'a', 'a']
         *
         * _.fill(Array(3), 2);
         * // => [2, 2, 2]
         *
         * _.fill([4, 6, 8, 10], '*', 1, 3);
         * // => [4, '*', '*', 10]
         */
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

        /**
         * This method is like `_.find` except that it returns the index of the first
         * element `predicate` returns truthy for instead of the element itself.
         *
         * @static
         * @memberOf _
         * @since 1.1.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @param {number} [fromIndex=0] The index to search from.
         * @returns {number} Returns the index of the found element, else `-1`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': false },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': true }
         * ];
         *
         * _.findIndex(users, function(o) { return o.user == 'barney'; });
         * // => 0
         *
         * // The `_.matches` iteratee shorthand.
         * _.findIndex(users, { 'user': 'fred', 'active': false });
         * // => 1
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.findIndex(users, ['active', false]);
         * // => 0
         *
         * // The `_.property` iteratee shorthand.
         * _.findIndex(users, 'active');
         * // => 2
         */
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

        /**
         * This method is like `_.findIndex` except that it iterates over elements
         * of `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @param {number} [fromIndex=array.length-1] The index to search from.
         * @returns {number} Returns the index of the found element, else `-1`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': true },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': false }
         * ];
         *
         * _.findLastIndex(users, function(o) { return o.user == 'pebbles'; });
         * // => 2
         *
         * // The `_.matches` iteratee shorthand.
         * _.findLastIndex(users, { 'user': 'barney', 'active': true });
         * // => 0
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.findLastIndex(users, ['active', false]);
         * // => 2
         *
         * // The `_.property` iteratee shorthand.
         * _.findLastIndex(users, 'active');
         * // => 0
         */
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

        /**
         * Flattens `array` a single level deep.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to flatten.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * _.flatten([1, [2, [3, [4]], 5]]);
         * // => [1, 2, [3, [4]], 5]
         */
        function flatten(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseFlatten(array, 1) : [];
        }

        /**
         * Recursively flattens `array`.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to flatten.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * _.flattenDeep([1, [2, [3, [4]], 5]]);
         * // => [1, 2, 3, 4, 5]
         */
        function flattenDeep(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseFlatten(array, INFINITY) : [];
        }

        /**
         * Recursively flatten `array` up to `depth` times.
         *
         * @static
         * @memberOf _
         * @since 4.4.0
         * @category Array
         * @param {Array} array The array to flatten.
         * @param {number} [depth=1] The maximum recursion depth.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * var array = [1, [2, [3, [4]], 5]];
         *
         * _.flattenDepth(array, 1);
         * // => [1, 2, [3, [4]], 5]
         *
         * _.flattenDepth(array, 2);
         * // => [1, 2, 3, [4], 5]
         */
        function flattenDepth(array, depth) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          depth = depth === undefined$1 ? 1 : toInteger(depth);
          return baseFlatten(array, depth);
        }

        /**
         * The inverse of `_.toPairs`; this method returns an object composed
         * from key-value `pairs`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} pairs The key-value pairs.
         * @returns {Object} Returns the new object.
         * @example
         *
         * _.fromPairs([['a', 1], ['b', 2]]);
         * // => { 'a': 1, 'b': 2 }
         */
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

        /**
         * Gets the first element of `array`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @alias first
         * @category Array
         * @param {Array} array The array to query.
         * @returns {*} Returns the first element of `array`.
         * @example
         *
         * _.head([1, 2, 3]);
         * // => 1
         *
         * _.head([]);
         * // => undefined
         */
        function head(array) {
          return (array && array.length) ? array[0] : undefined$1;
        }

        /**
         * Gets the index at which the first occurrence of `value` is found in `array`
         * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons. If `fromIndex` is negative, it's used as the
         * offset from the end of `array`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {*} value The value to search for.
         * @param {number} [fromIndex=0] The index to search from.
         * @returns {number} Returns the index of the matched value, else `-1`.
         * @example
         *
         * _.indexOf([1, 2, 1, 2], 2);
         * // => 1
         *
         * // Search from the `fromIndex`.
         * _.indexOf([1, 2, 1, 2], 2, 2);
         * // => 3
         */
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

        /**
         * Gets all but the last element of `array`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to query.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.initial([1, 2, 3]);
         * // => [1, 2]
         */
        function initial(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseSlice(array, 0, -1) : [];
        }

        /**
         * Creates an array of unique values that are included in all given arrays
         * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons. The order and references of result values are
         * determined by the first array.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @returns {Array} Returns the new array of intersecting values.
         * @example
         *
         * _.intersection([2, 1], [2, 3]);
         * // => [2]
         */
        var intersection = baseRest(function(arrays) {
          var mapped = arrayMap(arrays, castArrayLikeObject);
          return (mapped.length && mapped[0] === arrays[0])
            ? baseIntersection(mapped)
            : [];
        });

        /**
         * This method is like `_.intersection` except that it accepts `iteratee`
         * which is invoked for each element of each `arrays` to generate the criterion
         * by which they're compared. The order and references of result values are
         * determined by the first array. The iteratee is invoked with one argument:
         * (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Array} Returns the new array of intersecting values.
         * @example
         *
         * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
         * // => [2.1]
         *
         * // The `_.property` iteratee shorthand.
         * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
         * // => [{ 'x': 1 }]
         */
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

        /**
         * This method is like `_.intersection` except that it accepts `comparator`
         * which is invoked to compare elements of `arrays`. The order and references
         * of result values are determined by the first array. The comparator is
         * invoked with two arguments: (arrVal, othVal).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of intersecting values.
         * @example
         *
         * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
         * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
         *
         * _.intersectionWith(objects, others, _.isEqual);
         * // => [{ 'x': 1, 'y': 2 }]
         */
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

        /**
         * Converts all elements in `array` into a string separated by `separator`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to convert.
         * @param {string} [separator=','] The element separator.
         * @returns {string} Returns the joined string.
         * @example
         *
         * _.join(['a', 'b', 'c'], '~');
         * // => 'a~b~c'
         */
        function join(array, separator) {
          return array == null ? '' : nativeJoin.call(array, separator);
        }

        /**
         * Gets the last element of `array`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to query.
         * @returns {*} Returns the last element of `array`.
         * @example
         *
         * _.last([1, 2, 3]);
         * // => 3
         */
        function last(array) {
          var length = array == null ? 0 : array.length;
          return length ? array[length - 1] : undefined$1;
        }

        /**
         * This method is like `_.indexOf` except that it iterates over elements of
         * `array` from right to left.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {*} value The value to search for.
         * @param {number} [fromIndex=array.length-1] The index to search from.
         * @returns {number} Returns the index of the matched value, else `-1`.
         * @example
         *
         * _.lastIndexOf([1, 2, 1, 2], 2);
         * // => 3
         *
         * // Search from the `fromIndex`.
         * _.lastIndexOf([1, 2, 1, 2], 2, 2);
         * // => 1
         */
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

        /**
         * Gets the element at index `n` of `array`. If `n` is negative, the nth
         * element from the end is returned.
         *
         * @static
         * @memberOf _
         * @since 4.11.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=0] The index of the element to return.
         * @returns {*} Returns the nth element of `array`.
         * @example
         *
         * var array = ['a', 'b', 'c', 'd'];
         *
         * _.nth(array, 1);
         * // => 'b'
         *
         * _.nth(array, -2);
         * // => 'c';
         */
        function nth(array, n) {
          return (array && array.length) ? baseNth(array, toInteger(n)) : undefined$1;
        }

        /**
         * Removes all given values from `array` using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
         * to remove elements from an array by predicate.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Array
         * @param {Array} array The array to modify.
         * @param {...*} [values] The values to remove.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
         *
         * _.pull(array, 'a', 'c');
         * console.log(array);
         * // => ['b', 'b']
         */
        var pull = baseRest(pullAll);

        /**
         * This method is like `_.pull` except that it accepts an array of values to remove.
         *
         * **Note:** Unlike `_.difference`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to modify.
         * @param {Array} values The values to remove.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
         *
         * _.pullAll(array, ['a', 'c']);
         * console.log(array);
         * // => ['b', 'b']
         */
        function pullAll(array, values) {
          return (array && array.length && values && values.length)
            ? basePullAll(array, values)
            : array;
        }

        /**
         * This method is like `_.pullAll` except that it accepts `iteratee` which is
         * invoked for each element of `array` and `values` to generate the criterion
         * by which they're compared. The iteratee is invoked with one argument: (value).
         *
         * **Note:** Unlike `_.differenceBy`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to modify.
         * @param {Array} values The values to remove.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }];
         *
         * _.pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x');
         * console.log(array);
         * // => [{ 'x': 2 }]
         */
        function pullAllBy(array, values, iteratee) {
          return (array && array.length && values && values.length)
            ? basePullAll(array, values, getIteratee(iteratee, 2))
            : array;
        }

        /**
         * This method is like `_.pullAll` except that it accepts `comparator` which
         * is invoked to compare elements of `array` to `values`. The comparator is
         * invoked with two arguments: (arrVal, othVal).
         *
         * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @since 4.6.0
         * @category Array
         * @param {Array} array The array to modify.
         * @param {Array} values The values to remove.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
         *
         * _.pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
         * console.log(array);
         * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
         */
        function pullAllWith(array, values, comparator) {
          return (array && array.length && values && values.length)
            ? basePullAll(array, values, undefined$1, comparator)
            : array;
        }

        /**
         * Removes elements from `array` corresponding to `indexes` and returns an
         * array of removed elements.
         *
         * **Note:** Unlike `_.at`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to modify.
         * @param {...(number|number[])} [indexes] The indexes of elements to remove.
         * @returns {Array} Returns the new array of removed elements.
         * @example
         *
         * var array = ['a', 'b', 'c', 'd'];
         * var pulled = _.pullAt(array, [1, 3]);
         *
         * console.log(array);
         * // => ['a', 'c']
         *
         * console.log(pulled);
         * // => ['b', 'd']
         */
        var pullAt = flatRest(function(array, indexes) {
          var length = array == null ? 0 : array.length,
              result = baseAt(array, indexes);

          basePullAt(array, arrayMap(indexes, function(index) {
            return isIndex(index, length) ? +index : index;
          }).sort(compareAscending));

          return result;
        });

        /**
         * Removes all elements from `array` that `predicate` returns truthy for
         * and returns an array of the removed elements. The predicate is invoked
         * with three arguments: (value, index, array).
         *
         * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
         * to pull elements from an array by value.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Array
         * @param {Array} array The array to modify.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the new array of removed elements.
         * @example
         *
         * var array = [1, 2, 3, 4];
         * var evens = _.remove(array, function(n) {
         *   return n % 2 == 0;
         * });
         *
         * console.log(array);
         * // => [1, 3]
         *
         * console.log(evens);
         * // => [2, 4]
         */
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

        /**
         * Reverses `array` so that the first element becomes the last, the second
         * element becomes the second to last, and so on.
         *
         * **Note:** This method mutates `array` and is based on
         * [`Array#reverse`](https://mdn.io/Array/reverse).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to modify.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = [1, 2, 3];
         *
         * _.reverse(array);
         * // => [3, 2, 1]
         *
         * console.log(array);
         * // => [3, 2, 1]
         */
        function reverse(array) {
          return array == null ? array : nativeReverse.call(array);
        }

        /**
         * Creates a slice of `array` from `start` up to, but not including, `end`.
         *
         * **Note:** This method is used instead of
         * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
         * returned.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to slice.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns the slice of `array`.
         */
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

        /**
         * Uses a binary search to determine the lowest index at which `value`
         * should be inserted into `array` in order to maintain its sort order.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         * @example
         *
         * _.sortedIndex([30, 50], 40);
         * // => 1
         */
        function sortedIndex(array, value) {
          return baseSortedIndex(array, value);
        }

        /**
         * This method is like `_.sortedIndex` except that it accepts `iteratee`
         * which is invoked for `value` and each element of `array` to compute their
         * sort ranking. The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         * @example
         *
         * var objects = [{ 'x': 4 }, { 'x': 5 }];
         *
         * _.sortedIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
         * // => 0
         *
         * // The `_.property` iteratee shorthand.
         * _.sortedIndexBy(objects, { 'x': 4 }, 'x');
         * // => 0
         */
        function sortedIndexBy(array, value, iteratee) {
          return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
        }

        /**
         * This method is like `_.indexOf` except that it performs a binary
         * search on a sorted `array`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {*} value The value to search for.
         * @returns {number} Returns the index of the matched value, else `-1`.
         * @example
         *
         * _.sortedIndexOf([4, 5, 5, 5, 6], 5);
         * // => 1
         */
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

        /**
         * This method is like `_.sortedIndex` except that it returns the highest
         * index at which `value` should be inserted into `array` in order to
         * maintain its sort order.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         * @example
         *
         * _.sortedLastIndex([4, 5, 5, 5, 6], 5);
         * // => 4
         */
        function sortedLastIndex(array, value) {
          return baseSortedIndex(array, value, true);
        }

        /**
         * This method is like `_.sortedLastIndex` except that it accepts `iteratee`
         * which is invoked for `value` and each element of `array` to compute their
         * sort ranking. The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         * @example
         *
         * var objects = [{ 'x': 4 }, { 'x': 5 }];
         *
         * _.sortedLastIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
         * // => 1
         *
         * // The `_.property` iteratee shorthand.
         * _.sortedLastIndexBy(objects, { 'x': 4 }, 'x');
         * // => 1
         */
        function sortedLastIndexBy(array, value, iteratee) {
          return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
        }

        /**
         * This method is like `_.lastIndexOf` except that it performs a binary
         * search on a sorted `array`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {*} value The value to search for.
         * @returns {number} Returns the index of the matched value, else `-1`.
         * @example
         *
         * _.sortedLastIndexOf([4, 5, 5, 5, 6], 5);
         * // => 3
         */
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

        /**
         * This method is like `_.uniq` except that it's designed and optimized
         * for sorted arrays.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @returns {Array} Returns the new duplicate free array.
         * @example
         *
         * _.sortedUniq([1, 1, 2]);
         * // => [1, 2]
         */
        function sortedUniq(array) {
          return (array && array.length)
            ? baseSortedUniq(array)
            : [];
        }

        /**
         * This method is like `_.uniqBy` except that it's designed and optimized
         * for sorted arrays.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {Function} [iteratee] The iteratee invoked per element.
         * @returns {Array} Returns the new duplicate free array.
         * @example
         *
         * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
         * // => [1.1, 2.3]
         */
        function sortedUniqBy(array, iteratee) {
          return (array && array.length)
            ? baseSortedUniq(array, getIteratee(iteratee, 2))
            : [];
        }

        /**
         * Gets all but the first element of `array`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.tail([1, 2, 3]);
         * // => [2, 3]
         */
        function tail(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseSlice(array, 1, length) : [];
        }

        /**
         * Creates a slice of `array` with `n` elements taken from the beginning.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to take.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.take([1, 2, 3]);
         * // => [1]
         *
         * _.take([1, 2, 3], 2);
         * // => [1, 2]
         *
         * _.take([1, 2, 3], 5);
         * // => [1, 2, 3]
         *
         * _.take([1, 2, 3], 0);
         * // => []
         */
        function take(array, n, guard) {
          if (!(array && array.length)) {
            return [];
          }
          n = (guard || n === undefined$1) ? 1 : toInteger(n);
          return baseSlice(array, 0, n < 0 ? 0 : n);
        }

        /**
         * Creates a slice of `array` with `n` elements taken from the end.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to take.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.takeRight([1, 2, 3]);
         * // => [3]
         *
         * _.takeRight([1, 2, 3], 2);
         * // => [2, 3]
         *
         * _.takeRight([1, 2, 3], 5);
         * // => [1, 2, 3]
         *
         * _.takeRight([1, 2, 3], 0);
         * // => []
         */
        function takeRight(array, n, guard) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          n = (guard || n === undefined$1) ? 1 : toInteger(n);
          n = length - n;
          return baseSlice(array, n < 0 ? 0 : n, length);
        }

        /**
         * Creates a slice of `array` with elements taken from the end. Elements are
         * taken until `predicate` returns falsey. The predicate is invoked with
         * three arguments: (value, index, array).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': true },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': false }
         * ];
         *
         * _.takeRightWhile(users, function(o) { return !o.active; });
         * // => objects for ['fred', 'pebbles']
         *
         * // The `_.matches` iteratee shorthand.
         * _.takeRightWhile(users, { 'user': 'pebbles', 'active': false });
         * // => objects for ['pebbles']
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.takeRightWhile(users, ['active', false]);
         * // => objects for ['fred', 'pebbles']
         *
         * // The `_.property` iteratee shorthand.
         * _.takeRightWhile(users, 'active');
         * // => []
         */
        function takeRightWhile(array, predicate) {
          return (array && array.length)
            ? baseWhile(array, getIteratee(predicate, 3), false, true)
            : [];
        }

        /**
         * Creates a slice of `array` with elements taken from the beginning. Elements
         * are taken until `predicate` returns falsey. The predicate is invoked with
         * three arguments: (value, index, array).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': false },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': true }
         * ];
         *
         * _.takeWhile(users, function(o) { return !o.active; });
         * // => objects for ['barney', 'fred']
         *
         * // The `_.matches` iteratee shorthand.
         * _.takeWhile(users, { 'user': 'barney', 'active': false });
         * // => objects for ['barney']
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.takeWhile(users, ['active', false]);
         * // => objects for ['barney', 'fred']
         *
         * // The `_.property` iteratee shorthand.
         * _.takeWhile(users, 'active');
         * // => []
         */
        function takeWhile(array, predicate) {
          return (array && array.length)
            ? baseWhile(array, getIteratee(predicate, 3))
            : [];
        }

        /**
         * Creates an array of unique values, in order, from all given arrays using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @returns {Array} Returns the new array of combined values.
         * @example
         *
         * _.union([2], [1, 2]);
         * // => [2, 1]
         */
        var union = baseRest(function(arrays) {
          return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
        });

        /**
         * This method is like `_.union` except that it accepts `iteratee` which is
         * invoked for each element of each `arrays` to generate the criterion by
         * which uniqueness is computed. Result values are chosen from the first
         * array in which the value occurs. The iteratee is invoked with one argument:
         * (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Array} Returns the new array of combined values.
         * @example
         *
         * _.unionBy([2.1], [1.2, 2.3], Math.floor);
         * // => [2.1, 1.2]
         *
         * // The `_.property` iteratee shorthand.
         * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
         * // => [{ 'x': 1 }, { 'x': 2 }]
         */
        var unionBy = baseRest(function(arrays) {
          var iteratee = last(arrays);
          if (isArrayLikeObject(iteratee)) {
            iteratee = undefined$1;
          }
          return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
        });

        /**
         * This method is like `_.union` except that it accepts `comparator` which
         * is invoked to compare elements of `arrays`. Result values are chosen from
         * the first array in which the value occurs. The comparator is invoked
         * with two arguments: (arrVal, othVal).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of combined values.
         * @example
         *
         * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
         * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
         *
         * _.unionWith(objects, others, _.isEqual);
         * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
         */
        var unionWith = baseRest(function(arrays) {
          var comparator = last(arrays);
          comparator = typeof comparator == 'function' ? comparator : undefined$1;
          return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
        });

        /**
         * Creates a duplicate-free version of an array, using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons, in which only the first occurrence of each element
         * is kept. The order of result values is determined by the order they occur
         * in the array.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @returns {Array} Returns the new duplicate free array.
         * @example
         *
         * _.uniq([2, 1, 2]);
         * // => [2, 1]
         */
        function uniq(array) {
          return (array && array.length) ? baseUniq(array) : [];
        }

        /**
         * This method is like `_.uniq` except that it accepts `iteratee` which is
         * invoked for each element in `array` to generate the criterion by which
         * uniqueness is computed. The order of result values is determined by the
         * order they occur in the array. The iteratee is invoked with one argument:
         * (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Array} Returns the new duplicate free array.
         * @example
         *
         * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
         * // => [2.1, 1.2]
         *
         * // The `_.property` iteratee shorthand.
         * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
         * // => [{ 'x': 1 }, { 'x': 2 }]
         */
        function uniqBy(array, iteratee) {
          return (array && array.length) ? baseUniq(array, getIteratee(iteratee, 2)) : [];
        }

        /**
         * This method is like `_.uniq` except that it accepts `comparator` which
         * is invoked to compare elements of `array`. The order of result values is
         * determined by the order they occur in the array.The comparator is invoked
         * with two arguments: (arrVal, othVal).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new duplicate free array.
         * @example
         *
         * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
         *
         * _.uniqWith(objects, _.isEqual);
         * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
         */
        function uniqWith(array, comparator) {
          comparator = typeof comparator == 'function' ? comparator : undefined$1;
          return (array && array.length) ? baseUniq(array, undefined$1, comparator) : [];
        }

        /**
         * This method is like `_.zip` except that it accepts an array of grouped
         * elements and creates an array regrouping the elements to their pre-zip
         * configuration.
         *
         * @static
         * @memberOf _
         * @since 1.2.0
         * @category Array
         * @param {Array} array The array of grouped elements to process.
         * @returns {Array} Returns the new array of regrouped elements.
         * @example
         *
         * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
         * // => [['a', 1, true], ['b', 2, false]]
         *
         * _.unzip(zipped);
         * // => [['a', 'b'], [1, 2], [true, false]]
         */
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

        /**
         * This method is like `_.unzip` except that it accepts `iteratee` to specify
         * how regrouped values should be combined. The iteratee is invoked with the
         * elements of each group: (...group).
         *
         * @static
         * @memberOf _
         * @since 3.8.0
         * @category Array
         * @param {Array} array The array of grouped elements to process.
         * @param {Function} [iteratee=_.identity] The function to combine
         *  regrouped values.
         * @returns {Array} Returns the new array of regrouped elements.
         * @example
         *
         * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
         * // => [[1, 10, 100], [2, 20, 200]]
         *
         * _.unzipWith(zipped, _.add);
         * // => [3, 30, 300]
         */
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

        /**
         * Creates an array excluding all given values using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * **Note:** Unlike `_.pull`, this method returns a new array.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {...*} [values] The values to exclude.
         * @returns {Array} Returns the new array of filtered values.
         * @see _.difference, _.xor
         * @example
         *
         * _.without([2, 1, 2, 3], 1, 2);
         * // => [3]
         */
        var without = baseRest(function(array, values) {
          return isArrayLikeObject(array)
            ? baseDifference(array, values)
            : [];
        });

        /**
         * Creates an array of unique values that is the
         * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
         * of the given arrays. The order of result values is determined by the order
         * they occur in the arrays.
         *
         * @static
         * @memberOf _
         * @since 2.4.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @returns {Array} Returns the new array of filtered values.
         * @see _.difference, _.without
         * @example
         *
         * _.xor([2, 1], [2, 3]);
         * // => [1, 3]
         */
        var xor = baseRest(function(arrays) {
          return baseXor(arrayFilter(arrays, isArrayLikeObject));
        });

        /**
         * This method is like `_.xor` except that it accepts `iteratee` which is
         * invoked for each element of each `arrays` to generate the criterion by
         * which by which they're compared. The order of result values is determined
         * by the order they occur in the arrays. The iteratee is invoked with one
         * argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * _.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor);
         * // => [1.2, 3.4]
         *
         * // The `_.property` iteratee shorthand.
         * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
         * // => [{ 'x': 2 }]
         */
        var xorBy = baseRest(function(arrays) {
          var iteratee = last(arrays);
          if (isArrayLikeObject(iteratee)) {
            iteratee = undefined$1;
          }
          return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
        });

        /**
         * This method is like `_.xor` except that it accepts `comparator` which is
         * invoked to compare elements of `arrays`. The order of result values is
         * determined by the order they occur in the arrays. The comparator is invoked
         * with two arguments: (arrVal, othVal).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @param {Function} [comparator] The comparator invoked per element.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
         * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
         *
         * _.xorWith(objects, others, _.isEqual);
         * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
         */
        var xorWith = baseRest(function(arrays) {
          var comparator = last(arrays);
          comparator = typeof comparator == 'function' ? comparator : undefined$1;
          return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
        });

        /**
         * Creates an array of grouped elements, the first of which contains the
         * first elements of the given arrays, the second of which contains the
         * second elements of the given arrays, and so on.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Array
         * @param {...Array} [arrays] The arrays to process.
         * @returns {Array} Returns the new array of grouped elements.
         * @example
         *
         * _.zip(['a', 'b'], [1, 2], [true, false]);
         * // => [['a', 1, true], ['b', 2, false]]
         */
        var zip = baseRest(unzip);

        /**
         * This method is like `_.fromPairs` except that it accepts two arrays,
         * one of property identifiers and one of corresponding values.
         *
         * @static
         * @memberOf _
         * @since 0.4.0
         * @category Array
         * @param {Array} [props=[]] The property identifiers.
         * @param {Array} [values=[]] The property values.
         * @returns {Object} Returns the new object.
         * @example
         *
         * _.zipObject(['a', 'b'], [1, 2]);
         * // => { 'a': 1, 'b': 2 }
         */
        function zipObject(props, values) {
          return baseZipObject(props || [], values || [], assignValue);
        }

        /**
         * This method is like `_.zipObject` except that it supports property paths.
         *
         * @static
         * @memberOf _
         * @since 4.1.0
         * @category Array
         * @param {Array} [props=[]] The property identifiers.
         * @param {Array} [values=[]] The property values.
         * @returns {Object} Returns the new object.
         * @example
         *
         * _.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
         * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
         */
        function zipObjectDeep(props, values) {
          return baseZipObject(props || [], values || [], baseSet);
        }

        /**
         * This method is like `_.zip` except that it accepts `iteratee` to specify
         * how grouped values should be combined. The iteratee is invoked with the
         * elements of each group: (...group).
         *
         * @static
         * @memberOf _
         * @since 3.8.0
         * @category Array
         * @param {...Array} [arrays] The arrays to process.
         * @param {Function} [iteratee=_.identity] The function to combine
         *  grouped values.
         * @returns {Array} Returns the new array of grouped elements.
         * @example
         *
         * _.zipWith([1, 2], [10, 20], [100, 200], function(a, b, c) {
         *   return a + b + c;
         * });
         * // => [111, 222]
         */
        var zipWith = baseRest(function(arrays) {
          var length = arrays.length,
              iteratee = length > 1 ? arrays[length - 1] : undefined$1;

          iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined$1;
          return unzipWith(arrays, iteratee);
        });

        /*------------------------------------------------------------------------*/

        /**
         * Creates a `lodash` wrapper instance that wraps `value` with explicit method
         * chain sequences enabled. The result of such sequences must be unwrapped
         * with `_#value`.
         *
         * @static
         * @memberOf _
         * @since 1.3.0
         * @category Seq
         * @param {*} value The value to wrap.
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'age': 36 },
         *   { 'user': 'fred',    'age': 40 },
         *   { 'user': 'pebbles', 'age': 1 }
         * ];
         *
         * var youngest = _
         *   .chain(users)
         *   .sortBy('age')
         *   .map(function(o) {
         *     return o.user + ' is ' + o.age;
         *   })
         *   .head()
         *   .value();
         * // => 'pebbles is 1'
         */
        function chain(value) {
          var result = lodash(value);
          result.__chain__ = true;
          return result;
        }

        /**
         * This method invokes `interceptor` and returns `value`. The interceptor
         * is invoked with one argument; (value). The purpose of this method is to
         * "tap into" a method chain sequence in order to modify intermediate results.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Seq
         * @param {*} value The value to provide to `interceptor`.
         * @param {Function} interceptor The function to invoke.
         * @returns {*} Returns `value`.
         * @example
         *
         * _([1, 2, 3])
         *  .tap(function(array) {
         *    // Mutate input array.
         *    array.pop();
         *  })
         *  .reverse()
         *  .value();
         * // => [2, 1]
         */
        function tap(value, interceptor) {
          interceptor(value);
          return value;
        }

        /**
         * This method is like `_.tap` except that it returns the result of `interceptor`.
         * The purpose of this method is to "pass thru" values replacing intermediate
         * results in a method chain sequence.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Seq
         * @param {*} value The value to provide to `interceptor`.
         * @param {Function} interceptor The function to invoke.
         * @returns {*} Returns the result of `interceptor`.
         * @example
         *
         * _('  abc  ')
         *  .chain()
         *  .trim()
         *  .thru(function(value) {
         *    return [value];
         *  })
         *  .value();
         * // => ['abc']
         */
        function thru(value, interceptor) {
          return interceptor(value);
        }

        /**
         * This method is the wrapper version of `_.at`.
         *
         * @name at
         * @memberOf _
         * @since 1.0.0
         * @category Seq
         * @param {...(string|string[])} [paths] The property paths to pick.
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
         *
         * _(object).at(['a[0].b.c', 'a[1]']).value();
         * // => [3, 4]
         */
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

        /**
         * Creates a `lodash` wrapper instance with explicit method chain sequences enabled.
         *
         * @name chain
         * @memberOf _
         * @since 0.1.0
         * @category Seq
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 }
         * ];
         *
         * // A sequence without explicit chaining.
         * _(users).head();
         * // => { 'user': 'barney', 'age': 36 }
         *
         * // A sequence with explicit chaining.
         * _(users)
         *   .chain()
         *   .head()
         *   .pick('user')
         *   .value();
         * // => { 'user': 'barney' }
         */
        function wrapperChain() {
          return chain(this);
        }

        /**
         * Executes the chain sequence and returns the wrapped result.
         *
         * @name commit
         * @memberOf _
         * @since 3.2.0
         * @category Seq
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var array = [1, 2];
         * var wrapped = _(array).push(3);
         *
         * console.log(array);
         * // => [1, 2]
         *
         * wrapped = wrapped.commit();
         * console.log(array);
         * // => [1, 2, 3]
         *
         * wrapped.last();
         * // => 3
         *
         * console.log(array);
         * // => [1, 2, 3]
         */
        function wrapperCommit() {
          return new LodashWrapper(this.value(), this.__chain__);
        }

        /**
         * Gets the next value on a wrapped object following the
         * [iterator protocol](https://mdn.io/iteration_protocols#iterator).
         *
         * @name next
         * @memberOf _
         * @since 4.0.0
         * @category Seq
         * @returns {Object} Returns the next iterator value.
         * @example
         *
         * var wrapped = _([1, 2]);
         *
         * wrapped.next();
         * // => { 'done': false, 'value': 1 }
         *
         * wrapped.next();
         * // => { 'done': false, 'value': 2 }
         *
         * wrapped.next();
         * // => { 'done': true, 'value': undefined }
         */
        function wrapperNext() {
          if (this.__values__ === undefined$1) {
            this.__values__ = toArray(this.value());
          }
          var done = this.__index__ >= this.__values__.length,
              value = done ? undefined$1 : this.__values__[this.__index__++];

          return { 'done': done, 'value': value };
        }

        /**
         * Enables the wrapper to be iterable.
         *
         * @name Symbol.iterator
         * @memberOf _
         * @since 4.0.0
         * @category Seq
         * @returns {Object} Returns the wrapper object.
         * @example
         *
         * var wrapped = _([1, 2]);
         *
         * wrapped[Symbol.iterator]() === wrapped;
         * // => true
         *
         * Array.from(wrapped);
         * // => [1, 2]
         */
        function wrapperToIterator() {
          return this;
        }

        /**
         * Creates a clone of the chain sequence planting `value` as the wrapped value.
         *
         * @name plant
         * @memberOf _
         * @since 3.2.0
         * @category Seq
         * @param {*} value The value to plant.
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * function square(n) {
         *   return n * n;
         * }
         *
         * var wrapped = _([1, 2]).map(square);
         * var other = wrapped.plant([3, 4]);
         *
         * other.value();
         * // => [9, 16]
         *
         * wrapped.value();
         * // => [1, 4]
         */
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

        /**
         * This method is the wrapper version of `_.reverse`.
         *
         * **Note:** This method mutates the wrapped array.
         *
         * @name reverse
         * @memberOf _
         * @since 0.1.0
         * @category Seq
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var array = [1, 2, 3];
         *
         * _(array).reverse().value()
         * // => [3, 2, 1]
         *
         * console.log(array);
         * // => [3, 2, 1]
         */
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

        /**
         * Executes the chain sequence to resolve the unwrapped value.
         *
         * @name value
         * @memberOf _
         * @since 0.1.0
         * @alias toJSON, valueOf
         * @category Seq
         * @returns {*} Returns the resolved unwrapped value.
         * @example
         *
         * _([1, 2, 3]).value();
         * // => [1, 2, 3]
         */
        function wrapperValue() {
          return baseWrapperValue(this.__wrapped__, this.__actions__);
        }

        /*------------------------------------------------------------------------*/

        /**
         * Creates an object composed of keys generated from the results of running
         * each element of `collection` thru `iteratee`. The corresponding value of
         * each key is the number of times the key was returned by `iteratee`. The
         * iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 0.5.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
         * @returns {Object} Returns the composed aggregate object.
         * @example
         *
         * _.countBy([6.1, 4.2, 6.3], Math.floor);
         * // => { '4': 1, '6': 2 }
         *
         * // The `_.property` iteratee shorthand.
         * _.countBy(['one', 'two', 'three'], 'length');
         * // => { '3': 2, '5': 1 }
         */
        var countBy = createAggregator(function(result, value, key) {
          if (hasOwnProperty.call(result, key)) {
            ++result[key];
          } else {
            baseAssignValue(result, key, 1);
          }
        });

        /**
         * Checks if `predicate` returns truthy for **all** elements of `collection`.
         * Iteration is stopped once `predicate` returns falsey. The predicate is
         * invoked with three arguments: (value, index|key, collection).
         *
         * **Note:** This method returns `true` for
         * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
         * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
         * elements of empty collections.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {boolean} Returns `true` if all elements pass the predicate check,
         *  else `false`.
         * @example
         *
         * _.every([true, 1, null, 'yes'], Boolean);
         * // => false
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': false },
         *   { 'user': 'fred',   'age': 40, 'active': false }
         * ];
         *
         * // The `_.matches` iteratee shorthand.
         * _.every(users, { 'user': 'barney', 'active': false });
         * // => false
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.every(users, ['active', false]);
         * // => true
         *
         * // The `_.property` iteratee shorthand.
         * _.every(users, 'active');
         * // => false
         */
        function every(collection, predicate, guard) {
          var func = isArray(collection) ? arrayEvery : baseEvery;
          if (guard && isIterateeCall(collection, predicate, guard)) {
            predicate = undefined$1;
          }
          return func(collection, getIteratee(predicate, 3));
        }

        /**
         * Iterates over elements of `collection`, returning an array of all elements
         * `predicate` returns truthy for. The predicate is invoked with three
         * arguments: (value, index|key, collection).
         *
         * **Note:** Unlike `_.remove`, this method returns a new array.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the new filtered array.
         * @see _.reject
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': true },
         *   { 'user': 'fred',   'age': 40, 'active': false }
         * ];
         *
         * _.filter(users, function(o) { return !o.active; });
         * // => objects for ['fred']
         *
         * // The `_.matches` iteratee shorthand.
         * _.filter(users, { 'age': 36, 'active': true });
         * // => objects for ['barney']
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.filter(users, ['active', false]);
         * // => objects for ['fred']
         *
         * // The `_.property` iteratee shorthand.
         * _.filter(users, 'active');
         * // => objects for ['barney']
         */
        function filter(collection, predicate) {
          var func = isArray(collection) ? arrayFilter : baseFilter;
          return func(collection, getIteratee(predicate, 3));
        }

        /**
         * Iterates over elements of `collection`, returning the first element
         * `predicate` returns truthy for. The predicate is invoked with three
         * arguments: (value, index|key, collection).
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to inspect.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @param {number} [fromIndex=0] The index to search from.
         * @returns {*} Returns the matched element, else `undefined`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'age': 36, 'active': true },
         *   { 'user': 'fred',    'age': 40, 'active': false },
         *   { 'user': 'pebbles', 'age': 1,  'active': true }
         * ];
         *
         * _.find(users, function(o) { return o.age < 40; });
         * // => object for 'barney'
         *
         * // The `_.matches` iteratee shorthand.
         * _.find(users, { 'age': 1, 'active': true });
         * // => object for 'pebbles'
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.find(users, ['active', false]);
         * // => object for 'fred'
         *
         * // The `_.property` iteratee shorthand.
         * _.find(users, 'active');
         * // => object for 'barney'
         */
        var find = createFind(findIndex);

        /**
         * This method is like `_.find` except that it iterates over elements of
         * `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to inspect.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @param {number} [fromIndex=collection.length-1] The index to search from.
         * @returns {*} Returns the matched element, else `undefined`.
         * @example
         *
         * _.findLast([1, 2, 3, 4], function(n) {
         *   return n % 2 == 1;
         * });
         * // => 3
         */
        var findLast = createFind(findLastIndex);

        /**
         * Creates a flattened array of values by running each element in `collection`
         * thru `iteratee` and flattening the mapped results. The iteratee is invoked
         * with three arguments: (value, index|key, collection).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * function duplicate(n) {
         *   return [n, n];
         * }
         *
         * _.flatMap([1, 2], duplicate);
         * // => [1, 1, 2, 2]
         */
        function flatMap(collection, iteratee) {
          return baseFlatten(map(collection, iteratee), 1);
        }

        /**
         * This method is like `_.flatMap` except that it recursively flattens the
         * mapped results.
         *
         * @static
         * @memberOf _
         * @since 4.7.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * function duplicate(n) {
         *   return [[[n, n]]];
         * }
         *
         * _.flatMapDeep([1, 2], duplicate);
         * // => [1, 1, 2, 2]
         */
        function flatMapDeep(collection, iteratee) {
          return baseFlatten(map(collection, iteratee), INFINITY);
        }

        /**
         * This method is like `_.flatMap` except that it recursively flattens the
         * mapped results up to `depth` times.
         *
         * @static
         * @memberOf _
         * @since 4.7.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {number} [depth=1] The maximum recursion depth.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * function duplicate(n) {
         *   return [[[n, n]]];
         * }
         *
         * _.flatMapDepth([1, 2], duplicate, 2);
         * // => [[1, 1], [2, 2]]
         */
        function flatMapDepth(collection, iteratee, depth) {
          depth = depth === undefined$1 ? 1 : toInteger(depth);
          return baseFlatten(map(collection, iteratee), depth);
        }

        /**
         * Iterates over elements of `collection` and invokes `iteratee` for each element.
         * The iteratee is invoked with three arguments: (value, index|key, collection).
         * Iteratee functions may exit iteration early by explicitly returning `false`.
         *
         * **Note:** As with other "Collections" methods, objects with a "length"
         * property are iterated like arrays. To avoid this behavior use `_.forIn`
         * or `_.forOwn` for object iteration.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @alias each
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Array|Object} Returns `collection`.
         * @see _.forEachRight
         * @example
         *
         * _.forEach([1, 2], function(value) {
         *   console.log(value);
         * });
         * // => Logs `1` then `2`.
         *
         * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
         *   console.log(key);
         * });
         * // => Logs 'a' then 'b' (iteration order is not guaranteed).
         */
        function forEach(collection, iteratee) {
          var func = isArray(collection) ? arrayEach : baseEach;
          return func(collection, getIteratee(iteratee, 3));
        }

        /**
         * This method is like `_.forEach` except that it iterates over elements of
         * `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @alias eachRight
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Array|Object} Returns `collection`.
         * @see _.forEach
         * @example
         *
         * _.forEachRight([1, 2], function(value) {
         *   console.log(value);
         * });
         * // => Logs `2` then `1`.
         */
        function forEachRight(collection, iteratee) {
          var func = isArray(collection) ? arrayEachRight : baseEachRight;
          return func(collection, getIteratee(iteratee, 3));
        }

        /**
         * Creates an object composed of keys generated from the results of running
         * each element of `collection` thru `iteratee`. The order of grouped values
         * is determined by the order they occur in `collection`. The corresponding
         * value of each key is an array of elements responsible for generating the
         * key. The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
         * @returns {Object} Returns the composed aggregate object.
         * @example
         *
         * _.groupBy([6.1, 4.2, 6.3], Math.floor);
         * // => { '4': [4.2], '6': [6.1, 6.3] }
         *
         * // The `_.property` iteratee shorthand.
         * _.groupBy(['one', 'two', 'three'], 'length');
         * // => { '3': ['one', 'two'], '5': ['three'] }
         */
        var groupBy = createAggregator(function(result, value, key) {
          if (hasOwnProperty.call(result, key)) {
            result[key].push(value);
          } else {
            baseAssignValue(result, key, [value]);
          }
        });

        /**
         * Checks if `value` is in `collection`. If `collection` is a string, it's
         * checked for a substring of `value`, otherwise
         * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * is used for equality comparisons. If `fromIndex` is negative, it's used as
         * the offset from the end of `collection`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object|string} collection The collection to inspect.
         * @param {*} value The value to search for.
         * @param {number} [fromIndex=0] The index to search from.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
         * @returns {boolean} Returns `true` if `value` is found, else `false`.
         * @example
         *
         * _.includes([1, 2, 3], 1);
         * // => true
         *
         * _.includes([1, 2, 3], 1, 2);
         * // => false
         *
         * _.includes({ 'a': 1, 'b': 2 }, 1);
         * // => true
         *
         * _.includes('abcd', 'bc');
         * // => true
         */
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

        /**
         * Invokes the method at `path` of each element in `collection`, returning
         * an array of the results of each invoked method. Any additional arguments
         * are provided to each invoked method. If `path` is a function, it's invoked
         * for, and `this` bound to, each element in `collection`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Array|Function|string} path The path of the method to invoke or
         *  the function invoked per iteration.
         * @param {...*} [args] The arguments to invoke each method with.
         * @returns {Array} Returns the array of results.
         * @example
         *
         * _.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
         * // => [[1, 5, 7], [1, 2, 3]]
         *
         * _.invokeMap([123, 456], String.prototype.split, '');
         * // => [['1', '2', '3'], ['4', '5', '6']]
         */
        var invokeMap = baseRest(function(collection, path, args) {
          var index = -1,
              isFunc = typeof path == 'function',
              result = isArrayLike(collection) ? Array(collection.length) : [];

          baseEach(collection, function(value) {
            result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
          });
          return result;
        });

        /**
         * Creates an object composed of keys generated from the results of running
         * each element of `collection` thru `iteratee`. The corresponding value of
         * each key is the last element responsible for generating the key. The
         * iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
         * @returns {Object} Returns the composed aggregate object.
         * @example
         *
         * var array = [
         *   { 'dir': 'left', 'code': 97 },
         *   { 'dir': 'right', 'code': 100 }
         * ];
         *
         * _.keyBy(array, function(o) {
         *   return String.fromCharCode(o.code);
         * });
         * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
         *
         * _.keyBy(array, 'dir');
         * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
         */
        var keyBy = createAggregator(function(result, value, key) {
          baseAssignValue(result, key, value);
        });

        /**
         * Creates an array of values by running each element in `collection` thru
         * `iteratee`. The iteratee is invoked with three arguments:
         * (value, index|key, collection).
         *
         * Many lodash methods are guarded to work as iteratees for methods like
         * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
         *
         * The guarded methods are:
         * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
         * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
         * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
         * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the new mapped array.
         * @example
         *
         * function square(n) {
         *   return n * n;
         * }
         *
         * _.map([4, 8], square);
         * // => [16, 64]
         *
         * _.map({ 'a': 4, 'b': 8 }, square);
         * // => [16, 64] (iteration order is not guaranteed)
         *
         * var users = [
         *   { 'user': 'barney' },
         *   { 'user': 'fred' }
         * ];
         *
         * // The `_.property` iteratee shorthand.
         * _.map(users, 'user');
         * // => ['barney', 'fred']
         */
        function map(collection, iteratee) {
          var func = isArray(collection) ? arrayMap : baseMap;
          return func(collection, getIteratee(iteratee, 3));
        }

        /**
         * This method is like `_.sortBy` except that it allows specifying the sort
         * orders of the iteratees to sort by. If `orders` is unspecified, all values
         * are sorted in ascending order. Otherwise, specify an order of "desc" for
         * descending or "asc" for ascending sort order of corresponding values.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
         *  The iteratees to sort by.
         * @param {string[]} [orders] The sort orders of `iteratees`.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
         * @returns {Array} Returns the new sorted array.
         * @example
         *
         * var users = [
         *   { 'user': 'fred',   'age': 48 },
         *   { 'user': 'barney', 'age': 34 },
         *   { 'user': 'fred',   'age': 40 },
         *   { 'user': 'barney', 'age': 36 }
         * ];
         *
         * // Sort by `user` in ascending order and by `age` in descending order.
         * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
         * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
         */
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

        /**
         * Creates an array of elements split into two groups, the first of which
         * contains elements `predicate` returns truthy for, the second of which
         * contains elements `predicate` returns falsey for. The predicate is
         * invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the array of grouped elements.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'age': 36, 'active': false },
         *   { 'user': 'fred',    'age': 40, 'active': true },
         *   { 'user': 'pebbles', 'age': 1,  'active': false }
         * ];
         *
         * _.partition(users, function(o) { return o.active; });
         * // => objects for [['fred'], ['barney', 'pebbles']]
         *
         * // The `_.matches` iteratee shorthand.
         * _.partition(users, { 'age': 1, 'active': false });
         * // => objects for [['pebbles'], ['barney', 'fred']]
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.partition(users, ['active', false]);
         * // => objects for [['barney', 'pebbles'], ['fred']]
         *
         * // The `_.property` iteratee shorthand.
         * _.partition(users, 'active');
         * // => objects for [['fred'], ['barney', 'pebbles']]
         */
        var partition = createAggregator(function(result, value, key) {
          result[key ? 0 : 1].push(value);
        }, function() { return [[], []]; });

        /**
         * Reduces `collection` to a value which is the accumulated result of running
         * each element in `collection` thru `iteratee`, where each successive
         * invocation is supplied the return value of the previous. If `accumulator`
         * is not given, the first element of `collection` is used as the initial
         * value. The iteratee is invoked with four arguments:
         * (accumulator, value, index|key, collection).
         *
         * Many lodash methods are guarded to work as iteratees for methods like
         * `_.reduce`, `_.reduceRight`, and `_.transform`.
         *
         * The guarded methods are:
         * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
         * and `sortBy`
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [accumulator] The initial value.
         * @returns {*} Returns the accumulated value.
         * @see _.reduceRight
         * @example
         *
         * _.reduce([1, 2], function(sum, n) {
         *   return sum + n;
         * }, 0);
         * // => 3
         *
         * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
         *   (result[value] || (result[value] = [])).push(key);
         *   return result;
         * }, {});
         * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
         */
        function reduce(collection, iteratee, accumulator) {
          var func = isArray(collection) ? arrayReduce : baseReduce,
              initAccum = arguments.length < 3;

          return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
        }

        /**
         * This method is like `_.reduce` except that it iterates over elements of
         * `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [accumulator] The initial value.
         * @returns {*} Returns the accumulated value.
         * @see _.reduce
         * @example
         *
         * var array = [[0, 1], [2, 3], [4, 5]];
         *
         * _.reduceRight(array, function(flattened, other) {
         *   return flattened.concat(other);
         * }, []);
         * // => [4, 5, 2, 3, 0, 1]
         */
        function reduceRight(collection, iteratee, accumulator) {
          var func = isArray(collection) ? arrayReduceRight : baseReduce,
              initAccum = arguments.length < 3;

          return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
        }

        /**
         * The opposite of `_.filter`; this method returns the elements of `collection`
         * that `predicate` does **not** return truthy for.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the new filtered array.
         * @see _.filter
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': false },
         *   { 'user': 'fred',   'age': 40, 'active': true }
         * ];
         *
         * _.reject(users, function(o) { return !o.active; });
         * // => objects for ['fred']
         *
         * // The `_.matches` iteratee shorthand.
         * _.reject(users, { 'age': 40, 'active': true });
         * // => objects for ['barney']
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.reject(users, ['active', false]);
         * // => objects for ['fred']
         *
         * // The `_.property` iteratee shorthand.
         * _.reject(users, 'active');
         * // => objects for ['barney']
         */
        function reject(collection, predicate) {
          var func = isArray(collection) ? arrayFilter : baseFilter;
          return func(collection, negate(getIteratee(predicate, 3)));
        }

        /**
         * Gets a random element from `collection`.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to sample.
         * @returns {*} Returns the random element.
         * @example
         *
         * _.sample([1, 2, 3, 4]);
         * // => 2
         */
        function sample(collection) {
          var func = isArray(collection) ? arraySample : baseSample;
          return func(collection);
        }

        /**
         * Gets `n` random elements at unique keys from `collection` up to the
         * size of `collection`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Collection
         * @param {Array|Object} collection The collection to sample.
         * @param {number} [n=1] The number of elements to sample.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the random elements.
         * @example
         *
         * _.sampleSize([1, 2, 3], 2);
         * // => [3, 1]
         *
         * _.sampleSize([1, 2, 3], 4);
         * // => [2, 3, 1]
         */
        function sampleSize(collection, n, guard) {
          if ((guard ? isIterateeCall(collection, n, guard) : n === undefined$1)) {
            n = 1;
          } else {
            n = toInteger(n);
          }
          var func = isArray(collection) ? arraySampleSize : baseSampleSize;
          return func(collection, n);
        }

        /**
         * Creates an array of shuffled values, using a version of the
         * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to shuffle.
         * @returns {Array} Returns the new shuffled array.
         * @example
         *
         * _.shuffle([1, 2, 3, 4]);
         * // => [4, 1, 3, 2]
         */
        function shuffle(collection) {
          var func = isArray(collection) ? arrayShuffle : baseShuffle;
          return func(collection);
        }

        /**
         * Gets the size of `collection` by returning its length for array-like
         * values or the number of own enumerable string keyed properties for objects.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object|string} collection The collection to inspect.
         * @returns {number} Returns the collection size.
         * @example
         *
         * _.size([1, 2, 3]);
         * // => 3
         *
         * _.size({ 'a': 1, 'b': 2 });
         * // => 2
         *
         * _.size('pebbles');
         * // => 7
         */
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

        /**
         * Checks if `predicate` returns truthy for **any** element of `collection`.
         * Iteration is stopped once `predicate` returns truthy. The predicate is
         * invoked with three arguments: (value, index|key, collection).
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {boolean} Returns `true` if any element passes the predicate check,
         *  else `false`.
         * @example
         *
         * _.some([null, 0, 'yes', false], Boolean);
         * // => true
         *
         * var users = [
         *   { 'user': 'barney', 'active': true },
         *   { 'user': 'fred',   'active': false }
         * ];
         *
         * // The `_.matches` iteratee shorthand.
         * _.some(users, { 'user': 'barney', 'active': false });
         * // => false
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.some(users, ['active', false]);
         * // => true
         *
         * // The `_.property` iteratee shorthand.
         * _.some(users, 'active');
         * // => true
         */
        function some(collection, predicate, guard) {
          var func = isArray(collection) ? arraySome : baseSome;
          if (guard && isIterateeCall(collection, predicate, guard)) {
            predicate = undefined$1;
          }
          return func(collection, getIteratee(predicate, 3));
        }

        /**
         * Creates an array of elements, sorted in ascending order by the results of
         * running each element in a collection thru each iteratee. This method
         * performs a stable sort, that is, it preserves the original sort order of
         * equal elements. The iteratees are invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Collection
         * @param {Array|Object} collection The collection to iterate over.
         * @param {...(Function|Function[])} [iteratees=[_.identity]]
         *  The iteratees to sort by.
         * @returns {Array} Returns the new sorted array.
         * @example
         *
         * var users = [
         *   { 'user': 'fred',   'age': 48 },
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 },
         *   { 'user': 'barney', 'age': 34 }
         * ];
         *
         * _.sortBy(users, [function(o) { return o.user; }]);
         * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
         *
         * _.sortBy(users, ['user', 'age']);
         * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
         */
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

        /*------------------------------------------------------------------------*/

        /**
         * Gets the timestamp of the number of milliseconds that have elapsed since
         * the Unix epoch (1 January 1970 00:00:00 UTC).
         *
         * @static
         * @memberOf _
         * @since 2.4.0
         * @category Date
         * @returns {number} Returns the timestamp.
         * @example
         *
         * _.defer(function(stamp) {
         *   console.log(_.now() - stamp);
         * }, _.now());
         * // => Logs the number of milliseconds it took for the deferred invocation.
         */
        var now = ctxNow || function() {
          return root.Date.now();
        };

        /*------------------------------------------------------------------------*/

        /**
         * The opposite of `_.before`; this method creates a function that invokes
         * `func` once it's called `n` or more times.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {number} n The number of calls before `func` is invoked.
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new restricted function.
         * @example
         *
         * var saves = ['profile', 'settings'];
         *
         * var done = _.after(saves.length, function() {
         *   console.log('done saving!');
         * });
         *
         * _.forEach(saves, function(type) {
         *   asyncSave({ 'type': type, 'complete': done });
         * });
         * // => Logs 'done saving!' after the two async saves have completed.
         */
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

        /**
         * Creates a function that invokes `func`, with up to `n` arguments,
         * ignoring any additional arguments.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Function
         * @param {Function} func The function to cap arguments for.
         * @param {number} [n=func.length] The arity cap.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Function} Returns the new capped function.
         * @example
         *
         * _.map(['6', '8', '10'], _.ary(parseInt, 1));
         * // => [6, 8, 10]
         */
        function ary(func, n, guard) {
          n = guard ? undefined$1 : n;
          n = (func && n == null) ? func.length : n;
          return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
        }

        /**
         * Creates a function that invokes `func`, with the `this` binding and arguments
         * of the created function, while it's called less than `n` times. Subsequent
         * calls to the created function return the result of the last `func` invocation.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Function
         * @param {number} n The number of calls at which `func` is no longer invoked.
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new restricted function.
         * @example
         *
         * jQuery(element).on('click', _.before(5, addContactToList));
         * // => Allows adding up to 4 contacts to the list.
         */
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

        /**
         * Creates a function that invokes `func` with the `this` binding of `thisArg`
         * and `partials` prepended to the arguments it receives.
         *
         * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
         * may be used as a placeholder for partially applied arguments.
         *
         * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
         * property of bound functions.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to bind.
         * @param {*} thisArg The `this` binding of `func`.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new bound function.
         * @example
         *
         * function greet(greeting, punctuation) {
         *   return greeting + ' ' + this.user + punctuation;
         * }
         *
         * var object = { 'user': 'fred' };
         *
         * var bound = _.bind(greet, object, 'hi');
         * bound('!');
         * // => 'hi fred!'
         *
         * // Bound with placeholders.
         * var bound = _.bind(greet, object, _, '!');
         * bound('hi');
         * // => 'hi fred!'
         */
        var bind = baseRest(function(func, thisArg, partials) {
          var bitmask = WRAP_BIND_FLAG;
          if (partials.length) {
            var holders = replaceHolders(partials, getHolder(bind));
            bitmask |= WRAP_PARTIAL_FLAG;
          }
          return createWrap(func, bitmask, thisArg, partials, holders);
        });

        /**
         * Creates a function that invokes the method at `object[key]` with `partials`
         * prepended to the arguments it receives.
         *
         * This method differs from `_.bind` by allowing bound functions to reference
         * methods that may be redefined or don't yet exist. See
         * [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
         * for more details.
         *
         * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for partially applied arguments.
         *
         * @static
         * @memberOf _
         * @since 0.10.0
         * @category Function
         * @param {Object} object The object to invoke the method on.
         * @param {string} key The key of the method.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new bound function.
         * @example
         *
         * var object = {
         *   'user': 'fred',
         *   'greet': function(greeting, punctuation) {
         *     return greeting + ' ' + this.user + punctuation;
         *   }
         * };
         *
         * var bound = _.bindKey(object, 'greet', 'hi');
         * bound('!');
         * // => 'hi fred!'
         *
         * object.greet = function(greeting, punctuation) {
         *   return greeting + 'ya ' + this.user + punctuation;
         * };
         *
         * bound('!');
         * // => 'hiya fred!'
         *
         * // Bound with placeholders.
         * var bound = _.bindKey(object, 'greet', _, '!');
         * bound('hi');
         * // => 'hiya fred!'
         */
        var bindKey = baseRest(function(object, key, partials) {
          var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
          if (partials.length) {
            var holders = replaceHolders(partials, getHolder(bindKey));
            bitmask |= WRAP_PARTIAL_FLAG;
          }
          return createWrap(key, bitmask, object, partials, holders);
        });

        /**
         * Creates a function that accepts arguments of `func` and either invokes
         * `func` returning its result, if at least `arity` number of arguments have
         * been provided, or returns a function that accepts the remaining `func`
         * arguments, and so on. The arity of `func` may be specified if `func.length`
         * is not sufficient.
         *
         * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
         * may be used as a placeholder for provided arguments.
         *
         * **Note:** This method doesn't set the "length" property of curried functions.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Function
         * @param {Function} func The function to curry.
         * @param {number} [arity=func.length] The arity of `func`.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Function} Returns the new curried function.
         * @example
         *
         * var abc = function(a, b, c) {
         *   return [a, b, c];
         * };
         *
         * var curried = _.curry(abc);
         *
         * curried(1)(2)(3);
         * // => [1, 2, 3]
         *
         * curried(1, 2)(3);
         * // => [1, 2, 3]
         *
         * curried(1, 2, 3);
         * // => [1, 2, 3]
         *
         * // Curried with placeholders.
         * curried(1)(_, 3)(2);
         * // => [1, 2, 3]
         */
        function curry(func, arity, guard) {
          arity = guard ? undefined$1 : arity;
          var result = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
          result.placeholder = curry.placeholder;
          return result;
        }

        /**
         * This method is like `_.curry` except that arguments are applied to `func`
         * in the manner of `_.partialRight` instead of `_.partial`.
         *
         * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for provided arguments.
         *
         * **Note:** This method doesn't set the "length" property of curried functions.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Function
         * @param {Function} func The function to curry.
         * @param {number} [arity=func.length] The arity of `func`.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Function} Returns the new curried function.
         * @example
         *
         * var abc = function(a, b, c) {
         *   return [a, b, c];
         * };
         *
         * var curried = _.curryRight(abc);
         *
         * curried(3)(2)(1);
         * // => [1, 2, 3]
         *
         * curried(2, 3)(1);
         * // => [1, 2, 3]
         *
         * curried(1, 2, 3);
         * // => [1, 2, 3]
         *
         * // Curried with placeholders.
         * curried(3)(1, _)(2);
         * // => [1, 2, 3]
         */
        function curryRight(func, arity, guard) {
          arity = guard ? undefined$1 : arity;
          var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
          result.placeholder = curryRight.placeholder;
          return result;
        }

        /**
         * Creates a debounced function that delays invoking `func` until after `wait`
         * milliseconds have elapsed since the last time the debounced function was
         * invoked. The debounced function comes with a `cancel` method to cancel
         * delayed `func` invocations and a `flush` method to immediately invoke them.
         * Provide `options` to indicate whether `func` should be invoked on the
         * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
         * with the last arguments provided to the debounced function. Subsequent
         * calls to the debounced function return the result of the last `func`
         * invocation.
         *
         * **Note:** If `leading` and `trailing` options are `true`, `func` is
         * invoked on the trailing edge of the timeout only if the debounced function
         * is invoked more than once during the `wait` timeout.
         *
         * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
         * until to the next tick, similar to `setTimeout` with a timeout of `0`.
         *
         * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
         * for details over the differences between `_.debounce` and `_.throttle`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to debounce.
         * @param {number} [wait=0] The number of milliseconds to delay.
         * @param {Object} [options={}] The options object.
         * @param {boolean} [options.leading=false]
         *  Specify invoking on the leading edge of the timeout.
         * @param {number} [options.maxWait]
         *  The maximum time `func` is allowed to be delayed before it's invoked.
         * @param {boolean} [options.trailing=true]
         *  Specify invoking on the trailing edge of the timeout.
         * @returns {Function} Returns the new debounced function.
         * @example
         *
         * // Avoid costly calculations while the window size is in flux.
         * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
         *
         * // Invoke `sendMail` when clicked, debouncing subsequent calls.
         * jQuery(element).on('click', _.debounce(sendMail, 300, {
         *   'leading': true,
         *   'trailing': false
         * }));
         *
         * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
         * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
         * var source = new EventSource('/stream');
         * jQuery(source).on('message', debounced);
         *
         * // Cancel the trailing debounced invocation.
         * jQuery(window).on('popstate', debounced.cancel);
         */
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
            // Reset any `maxWait` timer.
            lastInvokeTime = time;
            // Start the timer for the trailing edge.
            timerId = setTimeout(timerExpired, wait);
            // Invoke the leading edge.
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

            // Either this is the first call, activity has stopped and we're at the
            // trailing edge, the system time has gone backwards and we're treating
            // it as the trailing edge, or we've hit the `maxWait` limit.
            return (lastCallTime === undefined$1 || (timeSinceLastCall >= wait) ||
              (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
          }

          function timerExpired() {
            var time = now();
            if (shouldInvoke(time)) {
              return trailingEdge(time);
            }
            // Restart the timer.
            timerId = setTimeout(timerExpired, remainingWait(time));
          }

          function trailingEdge(time) {
            timerId = undefined$1;

            // Only invoke if we have `lastArgs` which means `func` has been
            // debounced at least once.
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
                // Handle invocations in a tight loop.
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

        /**
         * Defers invoking the `func` until the current call stack has cleared. Any
         * additional arguments are provided to `func` when it's invoked.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to defer.
         * @param {...*} [args] The arguments to invoke `func` with.
         * @returns {number} Returns the timer id.
         * @example
         *
         * _.defer(function(text) {
         *   console.log(text);
         * }, 'deferred');
         * // => Logs 'deferred' after one millisecond.
         */
        var defer = baseRest(function(func, args) {
          return baseDelay(func, 1, args);
        });

        /**
         * Invokes `func` after `wait` milliseconds. Any additional arguments are
         * provided to `func` when it's invoked.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to delay.
         * @param {number} wait The number of milliseconds to delay invocation.
         * @param {...*} [args] The arguments to invoke `func` with.
         * @returns {number} Returns the timer id.
         * @example
         *
         * _.delay(function(text) {
         *   console.log(text);
         * }, 1000, 'later');
         * // => Logs 'later' after one second.
         */
        var delay = baseRest(function(func, wait, args) {
          return baseDelay(func, toNumber(wait) || 0, args);
        });

        /**
         * Creates a function that invokes `func` with arguments reversed.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Function
         * @param {Function} func The function to flip arguments for.
         * @returns {Function} Returns the new flipped function.
         * @example
         *
         * var flipped = _.flip(function() {
         *   return _.toArray(arguments);
         * });
         *
         * flipped('a', 'b', 'c', 'd');
         * // => ['d', 'c', 'b', 'a']
         */
        function flip(func) {
          return createWrap(func, WRAP_FLIP_FLAG);
        }

        /**
         * Creates a function that memoizes the result of `func`. If `resolver` is
         * provided, it determines the cache key for storing the result based on the
         * arguments provided to the memoized function. By default, the first argument
         * provided to the memoized function is used as the map cache key. The `func`
         * is invoked with the `this` binding of the memoized function.
         *
         * **Note:** The cache is exposed as the `cache` property on the memoized
         * function. Its creation may be customized by replacing the `_.memoize.Cache`
         * constructor with one whose instances implement the
         * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
         * method interface of `clear`, `delete`, `get`, `has`, and `set`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to have its output memoized.
         * @param {Function} [resolver] The function to resolve the cache key.
         * @returns {Function} Returns the new memoized function.
         * @example
         *
         * var object = { 'a': 1, 'b': 2 };
         * var other = { 'c': 3, 'd': 4 };
         *
         * var values = _.memoize(_.values);
         * values(object);
         * // => [1, 2]
         *
         * values(other);
         * // => [3, 4]
         *
         * object.a = 2;
         * values(object);
         * // => [1, 2]
         *
         * // Modify the result cache.
         * values.cache.set(object, ['a', 'b']);
         * values(object);
         * // => ['a', 'b']
         *
         * // Replace `_.memoize.Cache`.
         * _.memoize.Cache = WeakMap;
         */
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

        // Expose `MapCache`.
        memoize.Cache = MapCache;

        /**
         * Creates a function that negates the result of the predicate `func`. The
         * `func` predicate is invoked with the `this` binding and arguments of the
         * created function.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Function
         * @param {Function} predicate The predicate to negate.
         * @returns {Function} Returns the new negated function.
         * @example
         *
         * function isEven(n) {
         *   return n % 2 == 0;
         * }
         *
         * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
         * // => [1, 3, 5]
         */
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

        /**
         * Creates a function that is restricted to invoking `func` once. Repeat calls
         * to the function return the value of the first invocation. The `func` is
         * invoked with the `this` binding and arguments of the created function.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new restricted function.
         * @example
         *
         * var initialize = _.once(createApplication);
         * initialize();
         * initialize();
         * // => `createApplication` is invoked once
         */
        function once(func) {
          return before(2, func);
        }

        /**
         * Creates a function that invokes `func` with its arguments transformed.
         *
         * @static
         * @since 4.0.0
         * @memberOf _
         * @category Function
         * @param {Function} func The function to wrap.
         * @param {...(Function|Function[])} [transforms=[_.identity]]
         *  The argument transforms.
         * @returns {Function} Returns the new function.
         * @example
         *
         * function doubled(n) {
         *   return n * 2;
         * }
         *
         * function square(n) {
         *   return n * n;
         * }
         *
         * var func = _.overArgs(function(x, y) {
         *   return [x, y];
         * }, [square, doubled]);
         *
         * func(9, 3);
         * // => [81, 6]
         *
         * func(10, 5);
         * // => [100, 10]
         */
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

        /**
         * Creates a function that invokes `func` with `partials` prepended to the
         * arguments it receives. This method is like `_.bind` except it does **not**
         * alter the `this` binding.
         *
         * The `_.partial.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for partially applied arguments.
         *
         * **Note:** This method doesn't set the "length" property of partially
         * applied functions.
         *
         * @static
         * @memberOf _
         * @since 0.2.0
         * @category Function
         * @param {Function} func The function to partially apply arguments to.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new partially applied function.
         * @example
         *
         * function greet(greeting, name) {
         *   return greeting + ' ' + name;
         * }
         *
         * var sayHelloTo = _.partial(greet, 'hello');
         * sayHelloTo('fred');
         * // => 'hello fred'
         *
         * // Partially applied with placeholders.
         * var greetFred = _.partial(greet, _, 'fred');
         * greetFred('hi');
         * // => 'hi fred'
         */
        var partial = baseRest(function(func, partials) {
          var holders = replaceHolders(partials, getHolder(partial));
          return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
        });

        /**
         * This method is like `_.partial` except that partially applied arguments
         * are appended to the arguments it receives.
         *
         * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for partially applied arguments.
         *
         * **Note:** This method doesn't set the "length" property of partially
         * applied functions.
         *
         * @static
         * @memberOf _
         * @since 1.0.0
         * @category Function
         * @param {Function} func The function to partially apply arguments to.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new partially applied function.
         * @example
         *
         * function greet(greeting, name) {
         *   return greeting + ' ' + name;
         * }
         *
         * var greetFred = _.partialRight(greet, 'fred');
         * greetFred('hi');
         * // => 'hi fred'
         *
         * // Partially applied with placeholders.
         * var sayHelloTo = _.partialRight(greet, 'hello', _);
         * sayHelloTo('fred');
         * // => 'hello fred'
         */
        var partialRight = baseRest(function(func, partials) {
          var holders = replaceHolders(partials, getHolder(partialRight));
          return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
        });

        /**
         * Creates a function that invokes `func` with arguments arranged according
         * to the specified `indexes` where the argument value at the first index is
         * provided as the first argument, the argument value at the second index is
         * provided as the second argument, and so on.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Function
         * @param {Function} func The function to rearrange arguments for.
         * @param {...(number|number[])} indexes The arranged argument indexes.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var rearged = _.rearg(function(a, b, c) {
         *   return [a, b, c];
         * }, [2, 0, 1]);
         *
         * rearged('b', 'c', 'a')
         * // => ['a', 'b', 'c']
         */
        var rearg = flatRest(function(func, indexes) {
          return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
        });

        /**
         * Creates a function that invokes `func` with the `this` binding of the
         * created function and arguments from `start` and beyond provided as
         * an array.
         *
         * **Note:** This method is based on the
         * [rest parameter](https://mdn.io/rest_parameters).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Function
         * @param {Function} func The function to apply a rest parameter to.
         * @param {number} [start=func.length-1] The start position of the rest parameter.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var say = _.rest(function(what, names) {
         *   return what + ' ' + _.initial(names).join(', ') +
         *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
         * });
         *
         * say('hello', 'fred', 'barney', 'pebbles');
         * // => 'hello fred, barney, & pebbles'
         */
        function rest(func, start) {
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          start = start === undefined$1 ? start : toInteger(start);
          return baseRest(func, start);
        }

        /**
         * Creates a function that invokes `func` with the `this` binding of the
         * create function and an array of arguments much like
         * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
         *
         * **Note:** This method is based on the
         * [spread operator](https://mdn.io/spread_operator).
         *
         * @static
         * @memberOf _
         * @since 3.2.0
         * @category Function
         * @param {Function} func The function to spread arguments over.
         * @param {number} [start=0] The start position of the spread.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var say = _.spread(function(who, what) {
         *   return who + ' says ' + what;
         * });
         *
         * say(['fred', 'hello']);
         * // => 'fred says hello'
         *
         * var numbers = Promise.all([
         *   Promise.resolve(40),
         *   Promise.resolve(36)
         * ]);
         *
         * numbers.then(_.spread(function(x, y) {
         *   return x + y;
         * }));
         * // => a Promise of 76
         */
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

        /**
         * Creates a throttled function that only invokes `func` at most once per
         * every `wait` milliseconds. The throttled function comes with a `cancel`
         * method to cancel delayed `func` invocations and a `flush` method to
         * immediately invoke them. Provide `options` to indicate whether `func`
         * should be invoked on the leading and/or trailing edge of the `wait`
         * timeout. The `func` is invoked with the last arguments provided to the
         * throttled function. Subsequent calls to the throttled function return the
         * result of the last `func` invocation.
         *
         * **Note:** If `leading` and `trailing` options are `true`, `func` is
         * invoked on the trailing edge of the timeout only if the throttled function
         * is invoked more than once during the `wait` timeout.
         *
         * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
         * until to the next tick, similar to `setTimeout` with a timeout of `0`.
         *
         * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
         * for details over the differences between `_.throttle` and `_.debounce`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {Function} func The function to throttle.
         * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
         * @param {Object} [options={}] The options object.
         * @param {boolean} [options.leading=true]
         *  Specify invoking on the leading edge of the timeout.
         * @param {boolean} [options.trailing=true]
         *  Specify invoking on the trailing edge of the timeout.
         * @returns {Function} Returns the new throttled function.
         * @example
         *
         * // Avoid excessively updating the position while scrolling.
         * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
         *
         * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
         * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
         * jQuery(element).on('click', throttled);
         *
         * // Cancel the trailing throttled invocation.
         * jQuery(window).on('popstate', throttled.cancel);
         */
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

        /**
         * Creates a function that accepts up to one argument, ignoring any
         * additional arguments.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Function
         * @param {Function} func The function to cap arguments for.
         * @returns {Function} Returns the new capped function.
         * @example
         *
         * _.map(['6', '8', '10'], _.unary(parseInt));
         * // => [6, 8, 10]
         */
        function unary(func) {
          return ary(func, 1);
        }

        /**
         * Creates a function that provides `value` to `wrapper` as its first
         * argument. Any additional arguments provided to the function are appended
         * to those provided to the `wrapper`. The wrapper is invoked with the `this`
         * binding of the created function.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Function
         * @param {*} value The value to wrap.
         * @param {Function} [wrapper=identity] The wrapper function.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var p = _.wrap(_.escape, function(func, text) {
         *   return '<p>' + func(text) + '</p>';
         * });
         *
         * p('fred, barney, & pebbles');
         * // => '<p>fred, barney, &amp; pebbles</p>'
         */
        function wrap(value, wrapper) {
          return partial(castFunction(wrapper), value);
        }

        /*------------------------------------------------------------------------*/

        /**
         * Casts `value` as an array if it's not one.
         *
         * @static
         * @memberOf _
         * @since 4.4.0
         * @category Lang
         * @param {*} value The value to inspect.
         * @returns {Array} Returns the cast array.
         * @example
         *
         * _.castArray(1);
         * // => [1]
         *
         * _.castArray({ 'a': 1 });
         * // => [{ 'a': 1 }]
         *
         * _.castArray('abc');
         * // => ['abc']
         *
         * _.castArray(null);
         * // => [null]
         *
         * _.castArray(undefined);
         * // => [undefined]
         *
         * _.castArray();
         * // => []
         *
         * var array = [1, 2, 3];
         * console.log(_.castArray(array) === array);
         * // => true
         */
        function castArray() {
          if (!arguments.length) {
            return [];
          }
          var value = arguments[0];
          return isArray(value) ? value : [value];
        }

        /**
         * Creates a shallow clone of `value`.
         *
         * **Note:** This method is loosely based on the
         * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
         * and supports cloning arrays, array buffers, booleans, date objects, maps,
         * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
         * arrays. The own enumerable properties of `arguments` objects are cloned
         * as plain objects. An empty object is returned for uncloneable values such
         * as error objects, functions, DOM nodes, and WeakMaps.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to clone.
         * @returns {*} Returns the cloned value.
         * @see _.cloneDeep
         * @example
         *
         * var objects = [{ 'a': 1 }, { 'b': 2 }];
         *
         * var shallow = _.clone(objects);
         * console.log(shallow[0] === objects[0]);
         * // => true
         */
        function clone(value) {
          return baseClone(value, CLONE_SYMBOLS_FLAG);
        }

        /**
         * This method is like `_.clone` except that it accepts `customizer` which
         * is invoked to produce the cloned value. If `customizer` returns `undefined`,
         * cloning is handled by the method instead. The `customizer` is invoked with
         * up to four arguments; (value [, index|key, object, stack]).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to clone.
         * @param {Function} [customizer] The function to customize cloning.
         * @returns {*} Returns the cloned value.
         * @see _.cloneDeepWith
         * @example
         *
         * function customizer(value) {
         *   if (_.isElement(value)) {
         *     return value.cloneNode(false);
         *   }
         * }
         *
         * var el = _.cloneWith(document.body, customizer);
         *
         * console.log(el === document.body);
         * // => false
         * console.log(el.nodeName);
         * // => 'BODY'
         * console.log(el.childNodes.length);
         * // => 0
         */
        function cloneWith(value, customizer) {
          customizer = typeof customizer == 'function' ? customizer : undefined$1;
          return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
        }

        /**
         * This method is like `_.clone` except that it recursively clones `value`.
         *
         * @static
         * @memberOf _
         * @since 1.0.0
         * @category Lang
         * @param {*} value The value to recursively clone.
         * @returns {*} Returns the deep cloned value.
         * @see _.clone
         * @example
         *
         * var objects = [{ 'a': 1 }, { 'b': 2 }];
         *
         * var deep = _.cloneDeep(objects);
         * console.log(deep[0] === objects[0]);
         * // => false
         */
        function cloneDeep(value) {
          return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
        }

        /**
         * This method is like `_.cloneWith` except that it recursively clones `value`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to recursively clone.
         * @param {Function} [customizer] The function to customize cloning.
         * @returns {*} Returns the deep cloned value.
         * @see _.cloneWith
         * @example
         *
         * function customizer(value) {
         *   if (_.isElement(value)) {
         *     return value.cloneNode(true);
         *   }
         * }
         *
         * var el = _.cloneDeepWith(document.body, customizer);
         *
         * console.log(el === document.body);
         * // => false
         * console.log(el.nodeName);
         * // => 'BODY'
         * console.log(el.childNodes.length);
         * // => 20
         */
        function cloneDeepWith(value, customizer) {
          customizer = typeof customizer == 'function' ? customizer : undefined$1;
          return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
        }

        /**
         * Checks if `object` conforms to `source` by invoking the predicate
         * properties of `source` with the corresponding property values of `object`.
         *
         * **Note:** This method is equivalent to `_.conforms` when `source` is
         * partially applied.
         *
         * @static
         * @memberOf _
         * @since 4.14.0
         * @category Lang
         * @param {Object} object The object to inspect.
         * @param {Object} source The object of property predicates to conform to.
         * @returns {boolean} Returns `true` if `object` conforms, else `false`.
         * @example
         *
         * var object = { 'a': 1, 'b': 2 };
         *
         * _.conformsTo(object, { 'b': function(n) { return n > 1; } });
         * // => true
         *
         * _.conformsTo(object, { 'b': function(n) { return n > 2; } });
         * // => false
         */
        function conformsTo(object, source) {
          return source == null || baseConformsTo(object, source, keys(source));
        }

        /**
         * Performs a
         * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
         * comparison between two values to determine if they are equivalent.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
         * @example
         *
         * var object = { 'a': 1 };
         * var other = { 'a': 1 };
         *
         * _.eq(object, object);
         * // => true
         *
         * _.eq(object, other);
         * // => false
         *
         * _.eq('a', 'a');
         * // => true
         *
         * _.eq('a', Object('a'));
         * // => false
         *
         * _.eq(NaN, NaN);
         * // => true
         */
        function eq(value, other) {
          return value === other || (value !== value && other !== other);
        }

        /**
         * Checks if `value` is greater than `other`.
         *
         * @static
         * @memberOf _
         * @since 3.9.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is greater than `other`,
         *  else `false`.
         * @see _.lt
         * @example
         *
         * _.gt(3, 1);
         * // => true
         *
         * _.gt(3, 3);
         * // => false
         *
         * _.gt(1, 3);
         * // => false
         */
        var gt = createRelationalOperation(baseGt);

        /**
         * Checks if `value` is greater than or equal to `other`.
         *
         * @static
         * @memberOf _
         * @since 3.9.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is greater than or equal to
         *  `other`, else `false`.
         * @see _.lte
         * @example
         *
         * _.gte(3, 1);
         * // => true
         *
         * _.gte(3, 3);
         * // => true
         *
         * _.gte(1, 3);
         * // => false
         */
        var gte = createRelationalOperation(function(value, other) {
          return value >= other;
        });

        /**
         * Checks if `value` is likely an `arguments` object.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an `arguments` object,
         *  else `false`.
         * @example
         *
         * _.isArguments(function() { return arguments; }());
         * // => true
         *
         * _.isArguments([1, 2, 3]);
         * // => false
         */
        var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
          return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
            !propertyIsEnumerable.call(value, 'callee');
        };

        /**
         * Checks if `value` is classified as an `Array` object.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an array, else `false`.
         * @example
         *
         * _.isArray([1, 2, 3]);
         * // => true
         *
         * _.isArray(document.body.children);
         * // => false
         *
         * _.isArray('abc');
         * // => false
         *
         * _.isArray(_.noop);
         * // => false
         */
        var isArray = Array.isArray;

        /**
         * Checks if `value` is classified as an `ArrayBuffer` object.
         *
         * @static
         * @memberOf _
         * @since 4.3.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
         * @example
         *
         * _.isArrayBuffer(new ArrayBuffer(2));
         * // => true
         *
         * _.isArrayBuffer(new Array(2));
         * // => false
         */
        var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;

        /**
         * Checks if `value` is array-like. A value is considered array-like if it's
         * not a function and has a `value.length` that's an integer greater than or
         * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
         * @example
         *
         * _.isArrayLike([1, 2, 3]);
         * // => true
         *
         * _.isArrayLike(document.body.children);
         * // => true
         *
         * _.isArrayLike('abc');
         * // => true
         *
         * _.isArrayLike(_.noop);
         * // => false
         */
        function isArrayLike(value) {
          return value != null && isLength(value.length) && !isFunction(value);
        }

        /**
         * This method is like `_.isArrayLike` except that it also checks if `value`
         * is an object.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an array-like object,
         *  else `false`.
         * @example
         *
         * _.isArrayLikeObject([1, 2, 3]);
         * // => true
         *
         * _.isArrayLikeObject(document.body.children);
         * // => true
         *
         * _.isArrayLikeObject('abc');
         * // => false
         *
         * _.isArrayLikeObject(_.noop);
         * // => false
         */
        function isArrayLikeObject(value) {
          return isObjectLike(value) && isArrayLike(value);
        }

        /**
         * Checks if `value` is classified as a boolean primitive or object.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
         * @example
         *
         * _.isBoolean(false);
         * // => true
         *
         * _.isBoolean(null);
         * // => false
         */
        function isBoolean(value) {
          return value === true || value === false ||
            (isObjectLike(value) && baseGetTag(value) == boolTag);
        }

        /**
         * Checks if `value` is a buffer.
         *
         * @static
         * @memberOf _
         * @since 4.3.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
         * @example
         *
         * _.isBuffer(new Buffer(2));
         * // => true
         *
         * _.isBuffer(new Uint8Array(2));
         * // => false
         */
        var isBuffer = nativeIsBuffer || stubFalse;

        /**
         * Checks if `value` is classified as a `Date` object.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
         * @example
         *
         * _.isDate(new Date);
         * // => true
         *
         * _.isDate('Mon April 23 2012');
         * // => false
         */
        var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

        /**
         * Checks if `value` is likely a DOM element.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
         * @example
         *
         * _.isElement(document.body);
         * // => true
         *
         * _.isElement('<body>');
         * // => false
         */
        function isElement(value) {
          return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
        }

        /**
         * Checks if `value` is an empty object, collection, map, or set.
         *
         * Objects are considered empty if they have no own enumerable string keyed
         * properties.
         *
         * Array-like values such as `arguments` objects, arrays, buffers, strings, or
         * jQuery-like collections are considered empty if they have a `length` of `0`.
         * Similarly, maps and sets are considered empty if they have a `size` of `0`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is empty, else `false`.
         * @example
         *
         * _.isEmpty(null);
         * // => true
         *
         * _.isEmpty(true);
         * // => true
         *
         * _.isEmpty(1);
         * // => true
         *
         * _.isEmpty([1, 2, 3]);
         * // => false
         *
         * _.isEmpty({ 'a': 1 });
         * // => false
         */
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

        /**
         * Performs a deep comparison between two values to determine if they are
         * equivalent.
         *
         * **Note:** This method supports comparing arrays, array buffers, booleans,
         * date objects, error objects, maps, numbers, `Object` objects, regexes,
         * sets, strings, symbols, and typed arrays. `Object` objects are compared
         * by their own, not inherited, enumerable properties. Functions and DOM
         * nodes are compared by strict equality, i.e. `===`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
         * @example
         *
         * var object = { 'a': 1 };
         * var other = { 'a': 1 };
         *
         * _.isEqual(object, other);
         * // => true
         *
         * object === other;
         * // => false
         */
        function isEqual(value, other) {
          return baseIsEqual(value, other);
        }

        /**
         * This method is like `_.isEqual` except that it accepts `customizer` which
         * is invoked to compare values. If `customizer` returns `undefined`, comparisons
         * are handled by the method instead. The `customizer` is invoked with up to
         * six arguments: (objValue, othValue [, index|key, object, other, stack]).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @param {Function} [customizer] The function to customize comparisons.
         * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
         * @example
         *
         * function isGreeting(value) {
         *   return /^h(?:i|ello)$/.test(value);
         * }
         *
         * function customizer(objValue, othValue) {
         *   if (isGreeting(objValue) && isGreeting(othValue)) {
         *     return true;
         *   }
         * }
         *
         * var array = ['hello', 'goodbye'];
         * var other = ['hi', 'goodbye'];
         *
         * _.isEqualWith(array, other, customizer);
         * // => true
         */
        function isEqualWith(value, other, customizer) {
          customizer = typeof customizer == 'function' ? customizer : undefined$1;
          var result = customizer ? customizer(value, other) : undefined$1;
          return result === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result;
        }

        /**
         * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
         * `SyntaxError`, `TypeError`, or `URIError` object.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
         * @example
         *
         * _.isError(new Error);
         * // => true
         *
         * _.isError(Error);
         * // => false
         */
        function isError(value) {
          if (!isObjectLike(value)) {
            return false;
          }
          var tag = baseGetTag(value);
          return tag == errorTag || tag == domExcTag ||
            (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
        }

        /**
         * Checks if `value` is a finite primitive number.
         *
         * **Note:** This method is based on
         * [`Number.isFinite`](https://mdn.io/Number/isFinite).
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
         * @example
         *
         * _.isFinite(3);
         * // => true
         *
         * _.isFinite(Number.MIN_VALUE);
         * // => true
         *
         * _.isFinite(Infinity);
         * // => false
         *
         * _.isFinite('3');
         * // => false
         */
        function isFinite(value) {
          return typeof value == 'number' && nativeIsFinite(value);
        }

        /**
         * Checks if `value` is classified as a `Function` object.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a function, else `false`.
         * @example
         *
         * _.isFunction(_);
         * // => true
         *
         * _.isFunction(/abc/);
         * // => false
         */
        function isFunction(value) {
          if (!isObject(value)) {
            return false;
          }
          // The use of `Object#toString` avoids issues with the `typeof` operator
          // in Safari 9 which returns 'object' for typed arrays and other constructors.
          var tag = baseGetTag(value);
          return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
        }

        /**
         * Checks if `value` is an integer.
         *
         * **Note:** This method is based on
         * [`Number.isInteger`](https://mdn.io/Number/isInteger).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
         * @example
         *
         * _.isInteger(3);
         * // => true
         *
         * _.isInteger(Number.MIN_VALUE);
         * // => false
         *
         * _.isInteger(Infinity);
         * // => false
         *
         * _.isInteger('3');
         * // => false
         */
        function isInteger(value) {
          return typeof value == 'number' && value == toInteger(value);
        }

        /**
         * Checks if `value` is a valid array-like length.
         *
         * **Note:** This method is loosely based on
         * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
         * @example
         *
         * _.isLength(3);
         * // => true
         *
         * _.isLength(Number.MIN_VALUE);
         * // => false
         *
         * _.isLength(Infinity);
         * // => false
         *
         * _.isLength('3');
         * // => false
         */
        function isLength(value) {
          return typeof value == 'number' &&
            value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }

        /**
         * Checks if `value` is the
         * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
         * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an object, else `false`.
         * @example
         *
         * _.isObject({});
         * // => true
         *
         * _.isObject([1, 2, 3]);
         * // => true
         *
         * _.isObject(_.noop);
         * // => true
         *
         * _.isObject(null);
         * // => false
         */
        function isObject(value) {
          var type = typeof value;
          return value != null && (type == 'object' || type == 'function');
        }

        /**
         * Checks if `value` is object-like. A value is object-like if it's not `null`
         * and has a `typeof` result of "object".
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
         * @example
         *
         * _.isObjectLike({});
         * // => true
         *
         * _.isObjectLike([1, 2, 3]);
         * // => true
         *
         * _.isObjectLike(_.noop);
         * // => false
         *
         * _.isObjectLike(null);
         * // => false
         */
        function isObjectLike(value) {
          return value != null && typeof value == 'object';
        }

        /**
         * Checks if `value` is classified as a `Map` object.
         *
         * @static
         * @memberOf _
         * @since 4.3.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a map, else `false`.
         * @example
         *
         * _.isMap(new Map);
         * // => true
         *
         * _.isMap(new WeakMap);
         * // => false
         */
        var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

        /**
         * Performs a partial deep comparison between `object` and `source` to
         * determine if `object` contains equivalent property values.
         *
         * **Note:** This method is equivalent to `_.matches` when `source` is
         * partially applied.
         *
         * Partial comparisons will match empty array and empty object `source`
         * values against any array or object value, respectively. See `_.isEqual`
         * for a list of supported value comparisons.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Lang
         * @param {Object} object The object to inspect.
         * @param {Object} source The object of property values to match.
         * @returns {boolean} Returns `true` if `object` is a match, else `false`.
         * @example
         *
         * var object = { 'a': 1, 'b': 2 };
         *
         * _.isMatch(object, { 'b': 2 });
         * // => true
         *
         * _.isMatch(object, { 'b': 1 });
         * // => false
         */
        function isMatch(object, source) {
          return object === source || baseIsMatch(object, source, getMatchData(source));
        }

        /**
         * This method is like `_.isMatch` except that it accepts `customizer` which
         * is invoked to compare values. If `customizer` returns `undefined`, comparisons
         * are handled by the method instead. The `customizer` is invoked with five
         * arguments: (objValue, srcValue, index|key, object, source).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {Object} object The object to inspect.
         * @param {Object} source The object of property values to match.
         * @param {Function} [customizer] The function to customize comparisons.
         * @returns {boolean} Returns `true` if `object` is a match, else `false`.
         * @example
         *
         * function isGreeting(value) {
         *   return /^h(?:i|ello)$/.test(value);
         * }
         *
         * function customizer(objValue, srcValue) {
         *   if (isGreeting(objValue) && isGreeting(srcValue)) {
         *     return true;
         *   }
         * }
         *
         * var object = { 'greeting': 'hello' };
         * var source = { 'greeting': 'hi' };
         *
         * _.isMatchWith(object, source, customizer);
         * // => true
         */
        function isMatchWith(object, source, customizer) {
          customizer = typeof customizer == 'function' ? customizer : undefined$1;
          return baseIsMatch(object, source, getMatchData(source), customizer);
        }

        /**
         * Checks if `value` is `NaN`.
         *
         * **Note:** This method is based on
         * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
         * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
         * `undefined` and other non-number values.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
         * @example
         *
         * _.isNaN(NaN);
         * // => true
         *
         * _.isNaN(new Number(NaN));
         * // => true
         *
         * isNaN(undefined);
         * // => true
         *
         * _.isNaN(undefined);
         * // => false
         */
        function isNaN(value) {
          // An `NaN` primitive is the only value that is not equal to itself.
          // Perform the `toStringTag` check first to avoid errors with some
          // ActiveX objects in IE.
          return isNumber(value) && value != +value;
        }

        /**
         * Checks if `value` is a pristine native function.
         *
         * **Note:** This method can't reliably detect native functions in the presence
         * of the core-js package because core-js circumvents this kind of detection.
         * Despite multiple requests, the core-js maintainer has made it clear: any
         * attempt to fix the detection will be obstructed. As a result, we're left
         * with little choice but to throw an error. Unfortunately, this also affects
         * packages, like [babel-polyfill](https://www.npmjs.com/package/babel-polyfill),
         * which rely on core-js.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a native function,
         *  else `false`.
         * @example
         *
         * _.isNative(Array.prototype.push);
         * // => true
         *
         * _.isNative(_);
         * // => false
         */
        function isNative(value) {
          if (isMaskable(value)) {
            throw new Error(CORE_ERROR_TEXT);
          }
          return baseIsNative(value);
        }

        /**
         * Checks if `value` is `null`.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
         * @example
         *
         * _.isNull(null);
         * // => true
         *
         * _.isNull(void 0);
         * // => false
         */
        function isNull(value) {
          return value === null;
        }

        /**
         * Checks if `value` is `null` or `undefined`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
         * @example
         *
         * _.isNil(null);
         * // => true
         *
         * _.isNil(void 0);
         * // => true
         *
         * _.isNil(NaN);
         * // => false
         */
        function isNil(value) {
          return value == null;
        }

        /**
         * Checks if `value` is classified as a `Number` primitive or object.
         *
         * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
         * classified as numbers, use the `_.isFinite` method.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a number, else `false`.
         * @example
         *
         * _.isNumber(3);
         * // => true
         *
         * _.isNumber(Number.MIN_VALUE);
         * // => true
         *
         * _.isNumber(Infinity);
         * // => true
         *
         * _.isNumber('3');
         * // => false
         */
        function isNumber(value) {
          return typeof value == 'number' ||
            (isObjectLike(value) && baseGetTag(value) == numberTag);
        }

        /**
         * Checks if `value` is a plain object, that is, an object created by the
         * `Object` constructor or one with a `[[Prototype]]` of `null`.
         *
         * @static
         * @memberOf _
         * @since 0.8.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         * }
         *
         * _.isPlainObject(new Foo);
         * // => false
         *
         * _.isPlainObject([1, 2, 3]);
         * // => false
         *
         * _.isPlainObject({ 'x': 0, 'y': 0 });
         * // => true
         *
         * _.isPlainObject(Object.create(null));
         * // => true
         */
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

        /**
         * Checks if `value` is classified as a `RegExp` object.
         *
         * @static
         * @memberOf _
         * @since 0.1.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
         * @example
         *
         * _.isRegExp(/abc/);
         * // => true
         *
         * _.isRegExp('/abc/');
         * // => false
         */
        var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

        /**
         * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
         * double precision number which isn't the result of a rounded unsafe integer.
         *
         * **Note:** This method is based on
         * [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a safe integer, else `false`.
         * @example
         *
         * _.isSafeInteger(3);
         * // => true
         *
         * _.isSafeInteger(Number.MIN_VALUE);
         * // => false
         *
         * _.isSafeInteger(Infinity);
         * // => false
         *
         * _.isSafeInteger('3');
         * // => false
         */
        function isSafeInteger(value) {
          return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
        }

        /**
         * Checks if `value` is classified as a `Set` object.
         *
         * @static
         * @memberOf _
         * @since 4.3.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a set, else `false`.
         * @example
         *
         * _.isSet(new Set);
         * // => true
         *
         * _.isSet(new WeakSet);
         * // => false
         */
        var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

        /**
         * Checks if `value` is classified as a `String` primitive or object.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a string, else `false`.
         * @example
         *
         * _.isString('abc');
         * // => true
         *
         * _.isString(1);
         * // => false
         */
        function isString(value) {
          return typeof value == 'string' ||
            (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
        }

        /**
         * Checks if `value` is classified as a `Symbol` primitive or object.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
         * @example
         *
         * _.isSymbol(Symbol.iterator);
         * // => true
         *
         * _.isSymbol('abc');
         * // => false
         */
        function isSymbol(value) {
          return typeof value == 'symbol' ||
            (isObjectLike(value) && baseGetTag(value) == symbolTag);
        }

        /**
         * Checks if `value` is classified as a typed array.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
         * @example
         *
         * _.isTypedArray(new Uint8Array);
         * // => true
         *
         * _.isTypedArray([]);
         * // => false
         */
        var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

        /**
         * Checks if `value` is `undefined`.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
         * @example
         *
         * _.isUndefined(void 0);
         * // => true
         *
         * _.isUndefined(null);
         * // => false
         */
        function isUndefined(value) {
          return value === undefined$1;
        }

        /**
         * Checks if `value` is classified as a `WeakMap` object.
         *
         * @static
         * @memberOf _
         * @since 4.3.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
         * @example
         *
         * _.isWeakMap(new WeakMap);
         * // => true
         *
         * _.isWeakMap(new Map);
         * // => false
         */
        function isWeakMap(value) {
          return isObjectLike(value) && getTag(value) == weakMapTag;
        }

        /**
         * Checks if `value` is classified as a `WeakSet` object.
         *
         * @static
         * @memberOf _
         * @since 4.3.0
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
         * @example
         *
         * _.isWeakSet(new WeakSet);
         * // => true
         *
         * _.isWeakSet(new Set);
         * // => false
         */
        function isWeakSet(value) {
          return isObjectLike(value) && baseGetTag(value) == weakSetTag;
        }

        /**
         * Checks if `value` is less than `other`.
         *
         * @static
         * @memberOf _
         * @since 3.9.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is less than `other`,
         *  else `false`.
         * @see _.gt
         * @example
         *
         * _.lt(1, 3);
         * // => true
         *
         * _.lt(3, 3);
         * // => false
         *
         * _.lt(3, 1);
         * // => false
         */
        var lt = createRelationalOperation(baseLt);

        /**
         * Checks if `value` is less than or equal to `other`.
         *
         * @static
         * @memberOf _
         * @since 3.9.0
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is less than or equal to
         *  `other`, else `false`.
         * @see _.gte
         * @example
         *
         * _.lte(1, 3);
         * // => true
         *
         * _.lte(3, 3);
         * // => true
         *
         * _.lte(3, 1);
         * // => false
         */
        var lte = createRelationalOperation(function(value, other) {
          return value <= other;
        });

        /**
         * Converts `value` to an array.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {Array} Returns the converted array.
         * @example
         *
         * _.toArray({ 'a': 1, 'b': 2 });
         * // => [1, 2]
         *
         * _.toArray('abc');
         * // => ['a', 'b', 'c']
         *
         * _.toArray(1);
         * // => []
         *
         * _.toArray(null);
         * // => []
         */
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

        /**
         * Converts `value` to a finite number.
         *
         * @static
         * @memberOf _
         * @since 4.12.0
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {number} Returns the converted number.
         * @example
         *
         * _.toFinite(3.2);
         * // => 3.2
         *
         * _.toFinite(Number.MIN_VALUE);
         * // => 5e-324
         *
         * _.toFinite(Infinity);
         * // => 1.7976931348623157e+308
         *
         * _.toFinite('3.2');
         * // => 3.2
         */
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

        /**
         * Converts `value` to an integer.
         *
         * **Note:** This method is loosely based on
         * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {number} Returns the converted integer.
         * @example
         *
         * _.toInteger(3.2);
         * // => 3
         *
         * _.toInteger(Number.MIN_VALUE);
         * // => 0
         *
         * _.toInteger(Infinity);
         * // => 1.7976931348623157e+308
         *
         * _.toInteger('3.2');
         * // => 3
         */
        function toInteger(value) {
          var result = toFinite(value),
              remainder = result % 1;

          return result === result ? (remainder ? result - remainder : result) : 0;
        }

        /**
         * Converts `value` to an integer suitable for use as the length of an
         * array-like object.
         *
         * **Note:** This method is based on
         * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {number} Returns the converted integer.
         * @example
         *
         * _.toLength(3.2);
         * // => 3
         *
         * _.toLength(Number.MIN_VALUE);
         * // => 0
         *
         * _.toLength(Infinity);
         * // => 4294967295
         *
         * _.toLength('3.2');
         * // => 3
         */
        function toLength(value) {
          return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
        }

        /**
         * Converts `value` to a number.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to process.
         * @returns {number} Returns the number.
         * @example
         *
         * _.toNumber(3.2);
         * // => 3.2
         *
         * _.toNumber(Number.MIN_VALUE);
         * // => 5e-324
         *
         * _.toNumber(Infinity);
         * // => Infinity
         *
         * _.toNumber('3.2');
         * // => 3.2
         */
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

        /**
         * Converts `value` to a plain object flattening inherited enumerable string
         * keyed properties of `value` to own properties of the plain object.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {Object} Returns the converted plain object.
         * @example
         *
         * function Foo() {
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.assign({ 'a': 1 }, new Foo);
         * // => { 'a': 1, 'b': 2 }
         *
         * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
         * // => { 'a': 1, 'b': 2, 'c': 3 }
         */
        function toPlainObject(value) {
          return copyObject(value, keysIn(value));
        }

        /**
         * Converts `value` to a safe integer. A safe integer can be compared and
         * represented correctly.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {number} Returns the converted integer.
         * @example
         *
         * _.toSafeInteger(3.2);
         * // => 3
         *
         * _.toSafeInteger(Number.MIN_VALUE);
         * // => 0
         *
         * _.toSafeInteger(Infinity);
         * // => 9007199254740991
         *
         * _.toSafeInteger('3.2');
         * // => 3
         */
        function toSafeInteger(value) {
          return value
            ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)
            : (value === 0 ? value : 0);
        }

        /**
         * Converts `value` to a string. An empty string is returned for `null`
         * and `undefined` values. The sign of `-0` is preserved.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {string} Returns the converted string.
         * @example
         *
         * _.toString(null);
         * // => ''
         *
         * _.toString(-0);
         * // => '-0'
         *
         * _.toString([1, 2, 3]);
         * // => '1,2,3'
         */
        function toString(value) {
          return value == null ? '' : baseToString(value);
        }

        /*------------------------------------------------------------------------*/

        /**
         * Assigns own enumerable string keyed properties of source objects to the
         * destination object. Source objects are applied from left to right.
         * Subsequent sources overwrite property assignments of previous sources.
         *
         * **Note:** This method mutates `object` and is loosely based on
         * [`Object.assign`](https://mdn.io/Object/assign).
         *
         * @static
         * @memberOf _
         * @since 0.10.0
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @see _.assignIn
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         * }
         *
         * function Bar() {
         *   this.c = 3;
         * }
         *
         * Foo.prototype.b = 2;
         * Bar.prototype.d = 4;
         *
         * _.assign({ 'a': 0 }, new Foo, new Bar);
         * // => { 'a': 1, 'c': 3 }
         */
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

        /**
         * This method is like `_.assign` except that it iterates over own and
         * inherited source properties.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @alias extend
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @see _.assign
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         * }
         *
         * function Bar() {
         *   this.c = 3;
         * }
         *
         * Foo.prototype.b = 2;
         * Bar.prototype.d = 4;
         *
         * _.assignIn({ 'a': 0 }, new Foo, new Bar);
         * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
         */
        var assignIn = createAssigner(function(object, source) {
          copyObject(source, keysIn(source), object);
        });

        /**
         * This method is like `_.assignIn` except that it accepts `customizer`
         * which is invoked to produce the assigned values. If `customizer` returns
         * `undefined`, assignment is handled by the method instead. The `customizer`
         * is invoked with five arguments: (objValue, srcValue, key, object, source).
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @alias extendWith
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} sources The source objects.
         * @param {Function} [customizer] The function to customize assigned values.
         * @returns {Object} Returns `object`.
         * @see _.assignWith
         * @example
         *
         * function customizer(objValue, srcValue) {
         *   return _.isUndefined(objValue) ? srcValue : objValue;
         * }
         *
         * var defaults = _.partialRight(_.assignInWith, customizer);
         *
         * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
         * // => { 'a': 1, 'b': 2 }
         */
        var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
          copyObject(source, keysIn(source), object, customizer);
        });

        /**
         * This method is like `_.assign` except that it accepts `customizer`
         * which is invoked to produce the assigned values. If `customizer` returns
         * `undefined`, assignment is handled by the method instead. The `customizer`
         * is invoked with five arguments: (objValue, srcValue, key, object, source).
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} sources The source objects.
         * @param {Function} [customizer] The function to customize assigned values.
         * @returns {Object} Returns `object`.
         * @see _.assignInWith
         * @example
         *
         * function customizer(objValue, srcValue) {
         *   return _.isUndefined(objValue) ? srcValue : objValue;
         * }
         *
         * var defaults = _.partialRight(_.assignWith, customizer);
         *
         * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
         * // => { 'a': 1, 'b': 2 }
         */
        var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
          copyObject(source, keys(source), object, customizer);
        });

        /**
         * Creates an array of values corresponding to `paths` of `object`.
         *
         * @static
         * @memberOf _
         * @since 1.0.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {...(string|string[])} [paths] The property paths to pick.
         * @returns {Array} Returns the picked values.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
         *
         * _.at(object, ['a[0].b.c', 'a[1]']);
         * // => [3, 4]
         */
        var at = flatRest(baseAt);

        /**
         * Creates an object that inherits from the `prototype` object. If a
         * `properties` object is given, its own enumerable string keyed properties
         * are assigned to the created object.
         *
         * @static
         * @memberOf _
         * @since 2.3.0
         * @category Object
         * @param {Object} prototype The object to inherit from.
         * @param {Object} [properties] The properties to assign to the object.
         * @returns {Object} Returns the new object.
         * @example
         *
         * function Shape() {
         *   this.x = 0;
         *   this.y = 0;
         * }
         *
         * function Circle() {
         *   Shape.call(this);
         * }
         *
         * Circle.prototype = _.create(Shape.prototype, {
         *   'constructor': Circle
         * });
         *
         * var circle = new Circle;
         * circle instanceof Circle;
         * // => true
         *
         * circle instanceof Shape;
         * // => true
         */
        function create(prototype, properties) {
          var result = baseCreate(prototype);
          return properties == null ? result : baseAssign(result, properties);
        }

        /**
         * Assigns own and inherited enumerable string keyed properties of source
         * objects to the destination object for all destination properties that
         * resolve to `undefined`. Source objects are applied from left to right.
         * Once a property is set, additional values of the same property are ignored.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @see _.defaultsDeep
         * @example
         *
         * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
         * // => { 'a': 1, 'b': 2 }
         */
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

        /**
         * This method is like `_.defaults` except that it recursively assigns
         * default properties.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 3.10.0
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @see _.defaults
         * @example
         *
         * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
         * // => { 'a': { 'b': 2, 'c': 3 } }
         */
        var defaultsDeep = baseRest(function(args) {
          args.push(undefined$1, customDefaultsMerge);
          return apply(mergeWith, undefined$1, args);
        });

        /**
         * This method is like `_.find` except that it returns the key of the first
         * element `predicate` returns truthy for instead of the element itself.
         *
         * @static
         * @memberOf _
         * @since 1.1.0
         * @category Object
         * @param {Object} object The object to inspect.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {string|undefined} Returns the key of the matched element,
         *  else `undefined`.
         * @example
         *
         * var users = {
         *   'barney':  { 'age': 36, 'active': true },
         *   'fred':    { 'age': 40, 'active': false },
         *   'pebbles': { 'age': 1,  'active': true }
         * };
         *
         * _.findKey(users, function(o) { return o.age < 40; });
         * // => 'barney' (iteration order is not guaranteed)
         *
         * // The `_.matches` iteratee shorthand.
         * _.findKey(users, { 'age': 1, 'active': true });
         * // => 'pebbles'
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.findKey(users, ['active', false]);
         * // => 'fred'
         *
         * // The `_.property` iteratee shorthand.
         * _.findKey(users, 'active');
         * // => 'barney'
         */
        function findKey(object, predicate) {
          return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
        }

        /**
         * This method is like `_.findKey` except that it iterates over elements of
         * a collection in the opposite order.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Object
         * @param {Object} object The object to inspect.
         * @param {Function} [predicate=_.identity] The function invoked per iteration.
         * @returns {string|undefined} Returns the key of the matched element,
         *  else `undefined`.
         * @example
         *
         * var users = {
         *   'barney':  { 'age': 36, 'active': true },
         *   'fred':    { 'age': 40, 'active': false },
         *   'pebbles': { 'age': 1,  'active': true }
         * };
         *
         * _.findLastKey(users, function(o) { return o.age < 40; });
         * // => returns 'pebbles' assuming `_.findKey` returns 'barney'
         *
         * // The `_.matches` iteratee shorthand.
         * _.findLastKey(users, { 'age': 36, 'active': true });
         * // => 'barney'
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.findLastKey(users, ['active', false]);
         * // => 'fred'
         *
         * // The `_.property` iteratee shorthand.
         * _.findLastKey(users, 'active');
         * // => 'pebbles'
         */
        function findLastKey(object, predicate) {
          return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
        }

        /**
         * Iterates over own and inherited enumerable string keyed properties of an
         * object and invokes `iteratee` for each property. The iteratee is invoked
         * with three arguments: (value, key, object). Iteratee functions may exit
         * iteration early by explicitly returning `false`.
         *
         * @static
         * @memberOf _
         * @since 0.3.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Object} Returns `object`.
         * @see _.forInRight
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forIn(new Foo, function(value, key) {
         *   console.log(key);
         * });
         * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
         */
        function forIn(object, iteratee) {
          return object == null
            ? object
            : baseFor(object, getIteratee(iteratee, 3), keysIn);
        }

        /**
         * This method is like `_.forIn` except that it iterates over properties of
         * `object` in the opposite order.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Object} Returns `object`.
         * @see _.forIn
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forInRight(new Foo, function(value, key) {
         *   console.log(key);
         * });
         * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
         */
        function forInRight(object, iteratee) {
          return object == null
            ? object
            : baseForRight(object, getIteratee(iteratee, 3), keysIn);
        }

        /**
         * Iterates over own enumerable string keyed properties of an object and
         * invokes `iteratee` for each property. The iteratee is invoked with three
         * arguments: (value, key, object). Iteratee functions may exit iteration
         * early by explicitly returning `false`.
         *
         * @static
         * @memberOf _
         * @since 0.3.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Object} Returns `object`.
         * @see _.forOwnRight
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forOwn(new Foo, function(value, key) {
         *   console.log(key);
         * });
         * // => Logs 'a' then 'b' (iteration order is not guaranteed).
         */
        function forOwn(object, iteratee) {
          return object && baseForOwn(object, getIteratee(iteratee, 3));
        }

        /**
         * This method is like `_.forOwn` except that it iterates over properties of
         * `object` in the opposite order.
         *
         * @static
         * @memberOf _
         * @since 2.0.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Object} Returns `object`.
         * @see _.forOwn
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forOwnRight(new Foo, function(value, key) {
         *   console.log(key);
         * });
         * // => Logs 'b' then 'a' assuming `_.forOwn` logs 'a' then 'b'.
         */
        function forOwnRight(object, iteratee) {
          return object && baseForOwnRight(object, getIteratee(iteratee, 3));
        }

        /**
         * Creates an array of function property names from own enumerable properties
         * of `object`.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The object to inspect.
         * @returns {Array} Returns the function names.
         * @see _.functionsIn
         * @example
         *
         * function Foo() {
         *   this.a = _.constant('a');
         *   this.b = _.constant('b');
         * }
         *
         * Foo.prototype.c = _.constant('c');
         *
         * _.functions(new Foo);
         * // => ['a', 'b']
         */
        function functions(object) {
          return object == null ? [] : baseFunctions(object, keys(object));
        }

        /**
         * Creates an array of function property names from own and inherited
         * enumerable properties of `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The object to inspect.
         * @returns {Array} Returns the function names.
         * @see _.functions
         * @example
         *
         * function Foo() {
         *   this.a = _.constant('a');
         *   this.b = _.constant('b');
         * }
         *
         * Foo.prototype.c = _.constant('c');
         *
         * _.functionsIn(new Foo);
         * // => ['a', 'b', 'c']
         */
        function functionsIn(object) {
          return object == null ? [] : baseFunctions(object, keysIn(object));
        }

        /**
         * Gets the value at `path` of `object`. If the resolved value is
         * `undefined`, the `defaultValue` is returned in its place.
         *
         * @static
         * @memberOf _
         * @since 3.7.0
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the property to get.
         * @param {*} [defaultValue] The value returned for `undefined` resolved values.
         * @returns {*} Returns the resolved value.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }] };
         *
         * _.get(object, 'a[0].b.c');
         * // => 3
         *
         * _.get(object, ['a', '0', 'b', 'c']);
         * // => 3
         *
         * _.get(object, 'a.b.c', 'default');
         * // => 'default'
         */
        function get(object, path, defaultValue) {
          var result = object == null ? undefined$1 : baseGet(object, path);
          return result === undefined$1 ? defaultValue : result;
        }

        /**
         * Checks if `path` is a direct property of `object`.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path to check.
         * @returns {boolean} Returns `true` if `path` exists, else `false`.
         * @example
         *
         * var object = { 'a': { 'b': 2 } };
         * var other = _.create({ 'a': _.create({ 'b': 2 }) });
         *
         * _.has(object, 'a');
         * // => true
         *
         * _.has(object, 'a.b');
         * // => true
         *
         * _.has(object, ['a', 'b']);
         * // => true
         *
         * _.has(other, 'a');
         * // => false
         */
        function has(object, path) {
          return object != null && hasPath(object, path, baseHas);
        }

        /**
         * Checks if `path` is a direct or inherited property of `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path to check.
         * @returns {boolean} Returns `true` if `path` exists, else `false`.
         * @example
         *
         * var object = _.create({ 'a': _.create({ 'b': 2 }) });
         *
         * _.hasIn(object, 'a');
         * // => true
         *
         * _.hasIn(object, 'a.b');
         * // => true
         *
         * _.hasIn(object, ['a', 'b']);
         * // => true
         *
         * _.hasIn(object, 'b');
         * // => false
         */
        function hasIn(object, path) {
          return object != null && hasPath(object, path, baseHasIn);
        }

        /**
         * Creates an object composed of the inverted keys and values of `object`.
         * If `object` contains duplicate values, subsequent values overwrite
         * property assignments of previous values.
         *
         * @static
         * @memberOf _
         * @since 0.7.0
         * @category Object
         * @param {Object} object The object to invert.
         * @returns {Object} Returns the new inverted object.
         * @example
         *
         * var object = { 'a': 1, 'b': 2, 'c': 1 };
         *
         * _.invert(object);
         * // => { '1': 'c', '2': 'b' }
         */
        var invert = createInverter(function(result, value, key) {
          if (value != null &&
              typeof value.toString != 'function') {
            value = nativeObjectToString.call(value);
          }

          result[value] = key;
        }, constant(identity));

        /**
         * This method is like `_.invert` except that the inverted object is generated
         * from the results of running each element of `object` thru `iteratee`. The
         * corresponding inverted value of each inverted key is an array of keys
         * responsible for generating the inverted value. The iteratee is invoked
         * with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.1.0
         * @category Object
         * @param {Object} object The object to invert.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {Object} Returns the new inverted object.
         * @example
         *
         * var object = { 'a': 1, 'b': 2, 'c': 1 };
         *
         * _.invertBy(object);
         * // => { '1': ['a', 'c'], '2': ['b'] }
         *
         * _.invertBy(object, function(value) {
         *   return 'group' + value;
         * });
         * // => { 'group1': ['a', 'c'], 'group2': ['b'] }
         */
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

        /**
         * Invokes the method at `path` of `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the method to invoke.
         * @param {...*} [args] The arguments to invoke the method with.
         * @returns {*} Returns the result of the invoked method.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
         *
         * _.invoke(object, 'a[0].b.c.slice', 1, 3);
         * // => [2, 3]
         */
        var invoke = baseRest(baseInvoke);

        /**
         * Creates an array of the own enumerable property names of `object`.
         *
         * **Note:** Non-object values are coerced to objects. See the
         * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
         * for more details.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.keys(new Foo);
         * // => ['a', 'b'] (iteration order is not guaranteed)
         *
         * _.keys('hi');
         * // => ['0', '1']
         */
        function keys(object) {
          return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
        }

        /**
         * Creates an array of the own and inherited enumerable property names of `object`.
         *
         * **Note:** Non-object values are coerced to objects.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.keysIn(new Foo);
         * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
         */
        function keysIn(object) {
          return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
        }

        /**
         * The opposite of `_.mapValues`; this method creates an object with the
         * same values as `object` and keys generated by running each own enumerable
         * string keyed property of `object` thru `iteratee`. The iteratee is invoked
         * with three arguments: (value, key, object).
         *
         * @static
         * @memberOf _
         * @since 3.8.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Object} Returns the new mapped object.
         * @see _.mapValues
         * @example
         *
         * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
         *   return key + value;
         * });
         * // => { 'a1': 1, 'b2': 2 }
         */
        function mapKeys(object, iteratee) {
          var result = {};
          iteratee = getIteratee(iteratee, 3);

          baseForOwn(object, function(value, key, object) {
            baseAssignValue(result, iteratee(value, key, object), value);
          });
          return result;
        }

        /**
         * Creates an object with the same keys as `object` and values generated
         * by running each own enumerable string keyed property of `object` thru
         * `iteratee`. The iteratee is invoked with three arguments:
         * (value, key, object).
         *
         * @static
         * @memberOf _
         * @since 2.4.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Object} Returns the new mapped object.
         * @see _.mapKeys
         * @example
         *
         * var users = {
         *   'fred':    { 'user': 'fred',    'age': 40 },
         *   'pebbles': { 'user': 'pebbles', 'age': 1 }
         * };
         *
         * _.mapValues(users, function(o) { return o.age; });
         * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
         *
         * // The `_.property` iteratee shorthand.
         * _.mapValues(users, 'age');
         * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
         */
        function mapValues(object, iteratee) {
          var result = {};
          iteratee = getIteratee(iteratee, 3);

          baseForOwn(object, function(value, key, object) {
            baseAssignValue(result, key, iteratee(value, key, object));
          });
          return result;
        }

        /**
         * This method is like `_.assign` except that it recursively merges own and
         * inherited enumerable string keyed properties of source objects into the
         * destination object. Source properties that resolve to `undefined` are
         * skipped if a destination value exists. Array and plain object properties
         * are merged recursively. Other objects and value types are overridden by
         * assignment. Source objects are applied from left to right. Subsequent
         * sources overwrite property assignments of previous sources.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 0.5.0
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var object = {
         *   'a': [{ 'b': 2 }, { 'd': 4 }]
         * };
         *
         * var other = {
         *   'a': [{ 'c': 3 }, { 'e': 5 }]
         * };
         *
         * _.merge(object, other);
         * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
         */
        var merge = createAssigner(function(object, source, srcIndex) {
          baseMerge(object, source, srcIndex);
        });

        /**
         * This method is like `_.merge` except that it accepts `customizer` which
         * is invoked to produce the merged values of the destination and source
         * properties. If `customizer` returns `undefined`, merging is handled by the
         * method instead. The `customizer` is invoked with six arguments:
         * (objValue, srcValue, key, object, source, stack).
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} sources The source objects.
         * @param {Function} customizer The function to customize assigned values.
         * @returns {Object} Returns `object`.
         * @example
         *
         * function customizer(objValue, srcValue) {
         *   if (_.isArray(objValue)) {
         *     return objValue.concat(srcValue);
         *   }
         * }
         *
         * var object = { 'a': [1], 'b': [2] };
         * var other = { 'a': [3], 'b': [4] };
         *
         * _.mergeWith(object, other, customizer);
         * // => { 'a': [1, 3], 'b': [2, 4] }
         */
        var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
          baseMerge(object, source, srcIndex, customizer);
        });

        /**
         * The opposite of `_.pick`; this method creates an object composed of the
         * own and inherited enumerable property paths of `object` that are not omitted.
         *
         * **Note:** This method is considerably slower than `_.pick`.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The source object.
         * @param {...(string|string[])} [paths] The property paths to omit.
         * @returns {Object} Returns the new object.
         * @example
         *
         * var object = { 'a': 1, 'b': '2', 'c': 3 };
         *
         * _.omit(object, ['a', 'c']);
         * // => { 'b': '2' }
         */
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

        /**
         * The opposite of `_.pickBy`; this method creates an object composed of
         * the own and inherited enumerable string keyed properties of `object` that
         * `predicate` doesn't return truthy for. The predicate is invoked with two
         * arguments: (value, key).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The source object.
         * @param {Function} [predicate=_.identity] The function invoked per property.
         * @returns {Object} Returns the new object.
         * @example
         *
         * var object = { 'a': 1, 'b': '2', 'c': 3 };
         *
         * _.omitBy(object, _.isNumber);
         * // => { 'b': '2' }
         */
        function omitBy(object, predicate) {
          return pickBy(object, negate(getIteratee(predicate)));
        }

        /**
         * Creates an object composed of the picked `object` properties.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The source object.
         * @param {...(string|string[])} [paths] The property paths to pick.
         * @returns {Object} Returns the new object.
         * @example
         *
         * var object = { 'a': 1, 'b': '2', 'c': 3 };
         *
         * _.pick(object, ['a', 'c']);
         * // => { 'a': 1, 'c': 3 }
         */
        var pick = flatRest(function(object, paths) {
          return object == null ? {} : basePick(object, paths);
        });

        /**
         * Creates an object composed of the `object` properties `predicate` returns
         * truthy for. The predicate is invoked with two arguments: (value, key).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The source object.
         * @param {Function} [predicate=_.identity] The function invoked per property.
         * @returns {Object} Returns the new object.
         * @example
         *
         * var object = { 'a': 1, 'b': '2', 'c': 3 };
         *
         * _.pickBy(object, _.isNumber);
         * // => { 'a': 1, 'c': 3 }
         */
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

        /**
         * This method is like `_.get` except that if the resolved value is a
         * function it's invoked with the `this` binding of its parent object and
         * its result is returned.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the property to resolve.
         * @param {*} [defaultValue] The value returned for `undefined` resolved values.
         * @returns {*} Returns the resolved value.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
         *
         * _.result(object, 'a[0].b.c1');
         * // => 3
         *
         * _.result(object, 'a[0].b.c2');
         * // => 4
         *
         * _.result(object, 'a[0].b.c3', 'default');
         * // => 'default'
         *
         * _.result(object, 'a[0].b.c3', _.constant('default'));
         * // => 'default'
         */
        function result(object, path, defaultValue) {
          path = castPath(path, object);

          var index = -1,
              length = path.length;

          // Ensure the loop is entered when path is empty.
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

        /**
         * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
         * it's created. Arrays are created for missing index properties while objects
         * are created for all other missing properties. Use `_.setWith` to customize
         * `path` creation.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 3.7.0
         * @category Object
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to set.
         * @param {*} value The value to set.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }] };
         *
         * _.set(object, 'a[0].b.c', 4);
         * console.log(object.a[0].b.c);
         * // => 4
         *
         * _.set(object, ['x', '0', 'y', 'z'], 5);
         * console.log(object.x[0].y.z);
         * // => 5
         */
        function set(object, path, value) {
          return object == null ? object : baseSet(object, path, value);
        }

        /**
         * This method is like `_.set` except that it accepts `customizer` which is
         * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
         * path creation is handled by the method instead. The `customizer` is invoked
         * with three arguments: (nsValue, key, nsObject).
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to set.
         * @param {*} value The value to set.
         * @param {Function} [customizer] The function to customize assigned values.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var object = {};
         *
         * _.setWith(object, '[0][1]', 'a', Object);
         * // => { '0': { '1': 'a' } }
         */
        function setWith(object, path, value, customizer) {
          customizer = typeof customizer == 'function' ? customizer : undefined$1;
          return object == null ? object : baseSet(object, path, value, customizer);
        }

        /**
         * Creates an array of own enumerable string keyed-value pairs for `object`
         * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
         * entries are returned.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @alias entries
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the key-value pairs.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.toPairs(new Foo);
         * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
         */
        var toPairs = createToPairs(keys);

        /**
         * Creates an array of own and inherited enumerable string keyed-value pairs
         * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
         * or set, its entries are returned.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @alias entriesIn
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the key-value pairs.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.toPairsIn(new Foo);
         * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
         */
        var toPairsIn = createToPairs(keysIn);

        /**
         * An alternative to `_.reduce`; this method transforms `object` to a new
         * `accumulator` object which is the result of running each of its own
         * enumerable string keyed properties thru `iteratee`, with each invocation
         * potentially mutating the `accumulator` object. If `accumulator` is not
         * provided, a new object with the same `[[Prototype]]` will be used. The
         * iteratee is invoked with four arguments: (accumulator, value, key, object).
         * Iteratee functions may exit iteration early by explicitly returning `false`.
         *
         * @static
         * @memberOf _
         * @since 1.3.0
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [accumulator] The custom accumulator value.
         * @returns {*} Returns the accumulated value.
         * @example
         *
         * _.transform([2, 3, 4], function(result, n) {
         *   result.push(n *= n);
         *   return n % 2 == 0;
         * }, []);
         * // => [4, 9]
         *
         * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
         *   (result[value] || (result[value] = [])).push(key);
         * }, {});
         * // => { '1': ['a', 'c'], '2': ['b'] }
         */
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

        /**
         * Removes the property at `path` of `object`.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Object
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to unset.
         * @returns {boolean} Returns `true` if the property is deleted, else `false`.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 7 } }] };
         * _.unset(object, 'a[0].b.c');
         * // => true
         *
         * console.log(object);
         * // => { 'a': [{ 'b': {} }] };
         *
         * _.unset(object, ['a', '0', 'b', 'c']);
         * // => true
         *
         * console.log(object);
         * // => { 'a': [{ 'b': {} }] };
         */
        function unset(object, path) {
          return object == null ? true : baseUnset(object, path);
        }

        /**
         * This method is like `_.set` except that accepts `updater` to produce the
         * value to set. Use `_.updateWith` to customize `path` creation. The `updater`
         * is invoked with one argument: (value).
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.6.0
         * @category Object
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to set.
         * @param {Function} updater The function to produce the updated value.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }] };
         *
         * _.update(object, 'a[0].b.c', function(n) { return n * n; });
         * console.log(object.a[0].b.c);
         * // => 9
         *
         * _.update(object, 'x[0].y.z', function(n) { return n ? n + 1 : 0; });
         * console.log(object.x[0].y.z);
         * // => 0
         */
        function update(object, path, updater) {
          return object == null ? object : baseUpdate(object, path, castFunction(updater));
        }

        /**
         * This method is like `_.update` except that it accepts `customizer` which is
         * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
         * path creation is handled by the method instead. The `customizer` is invoked
         * with three arguments: (nsValue, key, nsObject).
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @since 4.6.0
         * @category Object
         * @param {Object} object The object to modify.
         * @param {Array|string} path The path of the property to set.
         * @param {Function} updater The function to produce the updated value.
         * @param {Function} [customizer] The function to customize assigned values.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var object = {};
         *
         * _.updateWith(object, '[0][1]', _.constant('a'), Object);
         * // => { '0': { '1': 'a' } }
         */
        function updateWith(object, path, updater, customizer) {
          customizer = typeof customizer == 'function' ? customizer : undefined$1;
          return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
        }

        /**
         * Creates an array of the own enumerable string keyed property values of `object`.
         *
         * **Note:** Non-object values are coerced to objects.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property values.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.values(new Foo);
         * // => [1, 2] (iteration order is not guaranteed)
         *
         * _.values('hi');
         * // => ['h', 'i']
         */
        function values(object) {
          return object == null ? [] : baseValues(object, keys(object));
        }

        /**
         * Creates an array of the own and inherited enumerable string keyed property
         * values of `object`.
         *
         * **Note:** Non-object values are coerced to objects.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property values.
         * @example
         *
         * function Foo() {
         *   this.a = 1;
         *   this.b = 2;
         * }
         *
         * Foo.prototype.c = 3;
         *
         * _.valuesIn(new Foo);
         * // => [1, 2, 3] (iteration order is not guaranteed)
         */
        function valuesIn(object) {
          return object == null ? [] : baseValues(object, keysIn(object));
        }

        /*------------------------------------------------------------------------*/

        /**
         * Clamps `number` within the inclusive `lower` and `upper` bounds.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Number
         * @param {number} number The number to clamp.
         * @param {number} [lower] The lower bound.
         * @param {number} upper The upper bound.
         * @returns {number} Returns the clamped number.
         * @example
         *
         * _.clamp(-10, -5, 5);
         * // => -5
         *
         * _.clamp(10, -5, 5);
         * // => 5
         */
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

        /**
         * Checks if `n` is between `start` and up to, but not including, `end`. If
         * `end` is not specified, it's set to `start` with `start` then set to `0`.
         * If `start` is greater than `end` the params are swapped to support
         * negative ranges.
         *
         * @static
         * @memberOf _
         * @since 3.3.0
         * @category Number
         * @param {number} number The number to check.
         * @param {number} [start=0] The start of the range.
         * @param {number} end The end of the range.
         * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
         * @see _.range, _.rangeRight
         * @example
         *
         * _.inRange(3, 2, 4);
         * // => true
         *
         * _.inRange(4, 8);
         * // => true
         *
         * _.inRange(4, 2);
         * // => false
         *
         * _.inRange(2, 2);
         * // => false
         *
         * _.inRange(1.2, 2);
         * // => true
         *
         * _.inRange(5.2, 4);
         * // => false
         *
         * _.inRange(-3, -2, -6);
         * // => true
         */
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

        /**
         * Produces a random number between the inclusive `lower` and `upper` bounds.
         * If only one argument is provided a number between `0` and the given number
         * is returned. If `floating` is `true`, or either `lower` or `upper` are
         * floats, a floating-point number is returned instead of an integer.
         *
         * **Note:** JavaScript follows the IEEE-754 standard for resolving
         * floating-point values which can produce unexpected results.
         *
         * @static
         * @memberOf _
         * @since 0.7.0
         * @category Number
         * @param {number} [lower=0] The lower bound.
         * @param {number} [upper=1] The upper bound.
         * @param {boolean} [floating] Specify returning a floating-point number.
         * @returns {number} Returns the random number.
         * @example
         *
         * _.random(0, 5);
         * // => an integer between 0 and 5
         *
         * _.random(5);
         * // => also an integer between 0 and 5
         *
         * _.random(5, true);
         * // => a floating-point number between 0 and 5
         *
         * _.random(1.2, 5.2);
         * // => a floating-point number between 1.2 and 5.2
         */
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

        /*------------------------------------------------------------------------*/

        /**
         * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the camel cased string.
         * @example
         *
         * _.camelCase('Foo Bar');
         * // => 'fooBar'
         *
         * _.camelCase('--foo-bar--');
         * // => 'fooBar'
         *
         * _.camelCase('__FOO_BAR__');
         * // => 'fooBar'
         */
        var camelCase = createCompounder(function(result, word, index) {
          word = word.toLowerCase();
          return result + (index ? capitalize(word) : word);
        });

        /**
         * Converts the first character of `string` to upper case and the remaining
         * to lower case.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to capitalize.
         * @returns {string} Returns the capitalized string.
         * @example
         *
         * _.capitalize('FRED');
         * // => 'Fred'
         */
        function capitalize(string) {
          return upperFirst(toString(string).toLowerCase());
        }

        /**
         * Deburrs `string` by converting
         * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
         * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
         * letters to basic Latin letters and removing
         * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to deburr.
         * @returns {string} Returns the deburred string.
         * @example
         *
         * _.deburr('déjà vu');
         * // => 'deja vu'
         */
        function deburr(string) {
          string = toString(string);
          return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
        }

        /**
         * Checks if `string` ends with the given target string.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to inspect.
         * @param {string} [target] The string to search for.
         * @param {number} [position=string.length] The position to search up to.
         * @returns {boolean} Returns `true` if `string` ends with `target`,
         *  else `false`.
         * @example
         *
         * _.endsWith('abc', 'c');
         * // => true
         *
         * _.endsWith('abc', 'b');
         * // => false
         *
         * _.endsWith('abc', 'b', 2);
         * // => true
         */
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

        /**
         * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
         * corresponding HTML entities.
         *
         * **Note:** No other characters are escaped. To escape additional
         * characters use a third-party library like [_he_](https://mths.be/he).
         *
         * Though the ">" character is escaped for symmetry, characters like
         * ">" and "/" don't need escaping in HTML and have no special meaning
         * unless they're part of a tag or unquoted attribute value. See
         * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
         * (under "semi-related fun fact") for more details.
         *
         * When working with HTML you should always
         * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
         * XSS vectors.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to escape.
         * @returns {string} Returns the escaped string.
         * @example
         *
         * _.escape('fred, barney, & pebbles');
         * // => 'fred, barney, &amp; pebbles'
         */
        function escape(string) {
          string = toString(string);
          return (string && reHasUnescapedHtml.test(string))
            ? string.replace(reUnescapedHtml, escapeHtmlChar)
            : string;
        }

        /**
         * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
         * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to escape.
         * @returns {string} Returns the escaped string.
         * @example
         *
         * _.escapeRegExp('[lodash](https://lodash.com/)');
         * // => '\[lodash\]\(https://lodash\.com/\)'
         */
        function escapeRegExp(string) {
          string = toString(string);
          return (string && reHasRegExpChar.test(string))
            ? string.replace(reRegExpChar, '\\$&')
            : string;
        }

        /**
         * Converts `string` to
         * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the kebab cased string.
         * @example
         *
         * _.kebabCase('Foo Bar');
         * // => 'foo-bar'
         *
         * _.kebabCase('fooBar');
         * // => 'foo-bar'
         *
         * _.kebabCase('__FOO_BAR__');
         * // => 'foo-bar'
         */
        var kebabCase = createCompounder(function(result, word, index) {
          return result + (index ? '-' : '') + word.toLowerCase();
        });

        /**
         * Converts `string`, as space separated words, to lower case.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the lower cased string.
         * @example
         *
         * _.lowerCase('--Foo-Bar--');
         * // => 'foo bar'
         *
         * _.lowerCase('fooBar');
         * // => 'foo bar'
         *
         * _.lowerCase('__FOO_BAR__');
         * // => 'foo bar'
         */
        var lowerCase = createCompounder(function(result, word, index) {
          return result + (index ? ' ' : '') + word.toLowerCase();
        });

        /**
         * Converts the first character of `string` to lower case.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the converted string.
         * @example
         *
         * _.lowerFirst('Fred');
         * // => 'fred'
         *
         * _.lowerFirst('FRED');
         * // => 'fRED'
         */
        var lowerFirst = createCaseFirst('toLowerCase');

        /**
         * Pads `string` on the left and right sides if it's shorter than `length`.
         * Padding characters are truncated if they can't be evenly divided by `length`.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to pad.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padded string.
         * @example
         *
         * _.pad('abc', 8);
         * // => '  abc   '
         *
         * _.pad('abc', 8, '_-');
         * // => '_-abc_-_'
         *
         * _.pad('abc', 3);
         * // => 'abc'
         */
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

        /**
         * Pads `string` on the right side if it's shorter than `length`. Padding
         * characters are truncated if they exceed `length`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to pad.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padded string.
         * @example
         *
         * _.padEnd('abc', 6);
         * // => 'abc   '
         *
         * _.padEnd('abc', 6, '_-');
         * // => 'abc_-_'
         *
         * _.padEnd('abc', 3);
         * // => 'abc'
         */
        function padEnd(string, length, chars) {
          string = toString(string);
          length = toInteger(length);

          var strLength = length ? stringSize(string) : 0;
          return (length && strLength < length)
            ? (string + createPadding(length - strLength, chars))
            : string;
        }

        /**
         * Pads `string` on the left side if it's shorter than `length`. Padding
         * characters are truncated if they exceed `length`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to pad.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padded string.
         * @example
         *
         * _.padStart('abc', 6);
         * // => '   abc'
         *
         * _.padStart('abc', 6, '_-');
         * // => '_-_abc'
         *
         * _.padStart('abc', 3);
         * // => 'abc'
         */
        function padStart(string, length, chars) {
          string = toString(string);
          length = toInteger(length);

          var strLength = length ? stringSize(string) : 0;
          return (length && strLength < length)
            ? (createPadding(length - strLength, chars) + string)
            : string;
        }

        /**
         * Converts `string` to an integer of the specified radix. If `radix` is
         * `undefined` or `0`, a `radix` of `10` is used unless `value` is a
         * hexadecimal, in which case a `radix` of `16` is used.
         *
         * **Note:** This method aligns with the
         * [ES5 implementation](https://es5.github.io/#x15.1.2.2) of `parseInt`.
         *
         * @static
         * @memberOf _
         * @since 1.1.0
         * @category String
         * @param {string} string The string to convert.
         * @param {number} [radix=10] The radix to interpret `value` by.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {number} Returns the converted integer.
         * @example
         *
         * _.parseInt('08');
         * // => 8
         *
         * _.map(['6', '08', '10'], _.parseInt);
         * // => [6, 8, 10]
         */
        function parseInt(string, radix, guard) {
          if (guard || radix == null) {
            radix = 0;
          } else if (radix) {
            radix = +radix;
          }
          return nativeParseInt(toString(string).replace(reTrimStart, ''), radix || 0);
        }

        /**
         * Repeats the given string `n` times.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to repeat.
         * @param {number} [n=1] The number of times to repeat the string.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {string} Returns the repeated string.
         * @example
         *
         * _.repeat('*', 3);
         * // => '***'
         *
         * _.repeat('abc', 2);
         * // => 'abcabc'
         *
         * _.repeat('abc', 0);
         * // => ''
         */
        function repeat(string, n, guard) {
          if ((guard ? isIterateeCall(string, n, guard) : n === undefined$1)) {
            n = 1;
          } else {
            n = toInteger(n);
          }
          return baseRepeat(toString(string), n);
        }

        /**
         * Replaces matches for `pattern` in `string` with `replacement`.
         *
         * **Note:** This method is based on
         * [`String#replace`](https://mdn.io/String/replace).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to modify.
         * @param {RegExp|string} pattern The pattern to replace.
         * @param {Function|string} replacement The match replacement.
         * @returns {string} Returns the modified string.
         * @example
         *
         * _.replace('Hi Fred', 'Fred', 'Barney');
         * // => 'Hi Barney'
         */
        function replace() {
          var args = arguments,
              string = toString(args[0]);

          return args.length < 3 ? string : string.replace(args[1], args[2]);
        }

        /**
         * Converts `string` to
         * [snake case](https://en.wikipedia.org/wiki/Snake_case).
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the snake cased string.
         * @example
         *
         * _.snakeCase('Foo Bar');
         * // => 'foo_bar'
         *
         * _.snakeCase('fooBar');
         * // => 'foo_bar'
         *
         * _.snakeCase('--FOO-BAR--');
         * // => 'foo_bar'
         */
        var snakeCase = createCompounder(function(result, word, index) {
          return result + (index ? '_' : '') + word.toLowerCase();
        });

        /**
         * Splits `string` by `separator`.
         *
         * **Note:** This method is based on
         * [`String#split`](https://mdn.io/String/split).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to split.
         * @param {RegExp|string} separator The separator pattern to split by.
         * @param {number} [limit] The length to truncate results to.
         * @returns {Array} Returns the string segments.
         * @example
         *
         * _.split('a-b-c', '-', 2);
         * // => ['a', 'b']
         */
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

        /**
         * Converts `string` to
         * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
         *
         * @static
         * @memberOf _
         * @since 3.1.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the start cased string.
         * @example
         *
         * _.startCase('--foo-bar--');
         * // => 'Foo Bar'
         *
         * _.startCase('fooBar');
         * // => 'Foo Bar'
         *
         * _.startCase('__FOO_BAR__');
         * // => 'FOO BAR'
         */
        var startCase = createCompounder(function(result, word, index) {
          return result + (index ? ' ' : '') + upperFirst(word);
        });

        /**
         * Checks if `string` starts with the given target string.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to inspect.
         * @param {string} [target] The string to search for.
         * @param {number} [position=0] The position to search from.
         * @returns {boolean} Returns `true` if `string` starts with `target`,
         *  else `false`.
         * @example
         *
         * _.startsWith('abc', 'a');
         * // => true
         *
         * _.startsWith('abc', 'b');
         * // => false
         *
         * _.startsWith('abc', 'b', 1);
         * // => true
         */
        function startsWith(string, target, position) {
          string = toString(string);
          position = position == null
            ? 0
            : baseClamp(toInteger(position), 0, string.length);

          target = baseToString(target);
          return string.slice(position, position + target.length) == target;
        }

        /**
         * Creates a compiled template function that can interpolate data properties
         * in "interpolate" delimiters, HTML-escape interpolated data properties in
         * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
         * properties may be accessed as free variables in the template. If a setting
         * object is given, it takes precedence over `_.templateSettings` values.
         *
         * **Note:** In the development build `_.template` utilizes
         * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
         * for easier debugging.
         *
         * For more information on precompiling templates see
         * [lodash's custom builds documentation](https://lodash.com/custom-builds).
         *
         * For more information on Chrome extension sandboxes see
         * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category String
         * @param {string} [string=''] The template string.
         * @param {Object} [options={}] The options object.
         * @param {RegExp} [options.escape=_.templateSettings.escape]
         *  The HTML "escape" delimiter.
         * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
         *  The "evaluate" delimiter.
         * @param {Object} [options.imports=_.templateSettings.imports]
         *  An object to import into the template as free variables.
         * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
         *  The "interpolate" delimiter.
         * @param {string} [options.sourceURL='lodash.templateSources[n]']
         *  The sourceURL of the compiled template.
         * @param {string} [options.variable='obj']
         *  The data object variable name.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Function} Returns the compiled template function.
         * @example
         *
         * // Use the "interpolate" delimiter to create a compiled template.
         * var compiled = _.template('hello <%= user %>!');
         * compiled({ 'user': 'fred' });
         * // => 'hello fred!'
         *
         * // Use the HTML "escape" delimiter to escape data property values.
         * var compiled = _.template('<b><%- value %></b>');
         * compiled({ 'value': '<script>' });
         * // => '<b>&lt;script&gt;</b>'
         *
         * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
         * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
         * compiled({ 'users': ['fred', 'barney'] });
         * // => '<li>fred</li><li>barney</li>'
         *
         * // Use the internal `print` function in "evaluate" delimiters.
         * var compiled = _.template('<% print("hello " + user); %>!');
         * compiled({ 'user': 'barney' });
         * // => 'hello barney!'
         *
         * // Use the ES template literal delimiter as an "interpolate" delimiter.
         * // Disable support by replacing the "interpolate" delimiter.
         * var compiled = _.template('hello ${ user }!');
         * compiled({ 'user': 'pebbles' });
         * // => 'hello pebbles!'
         *
         * // Use backslashes to treat delimiters as plain text.
         * var compiled = _.template('<%= "\\<%- value %\\>" %>');
         * compiled({ 'value': 'ignored' });
         * // => '<%- value %>'
         *
         * // Use the `imports` option to import `jQuery` as `jq`.
         * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
         * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
         * compiled({ 'users': ['fred', 'barney'] });
         * // => '<li>fred</li><li>barney</li>'
         *
         * // Use the `sourceURL` option to specify a custom sourceURL for the template.
         * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
         * compiled(data);
         * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
         *
         * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
         * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
         * compiled.source;
         * // => function(data) {
         * //   var __t, __p = '';
         * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
         * //   return __p;
         * // }
         *
         * // Use custom template delimiters.
         * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
         * var compiled = _.template('hello {{ user }}!');
         * compiled({ 'user': 'mustache' });
         * // => 'hello mustache!'
         *
         * // Use the `source` property to inline compiled templates for meaningful
         * // line numbers in error messages and stack traces.
         * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
         *   var JST = {\
         *     "main": ' + _.template(mainText).source + '\
         *   };\
         * ');
         */
        function template(string, options, guard) {
          // Based on John Resig's `tmpl` implementation
          // (http://ejohn.org/blog/javascript-micro-templating/)
          // and Laura Doktorova's doT.js (https://github.com/olado/doT).
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

          // Compile the regexp to match each delimiter.
          var reDelimiters = RegExp(
            (options.escape || reNoMatch).source + '|' +
            interpolate.source + '|' +
            (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
            (options.evaluate || reNoMatch).source + '|$'
          , 'g');

          // Use a sourceURL for easier debugging.
          // The sourceURL gets injected into the source that's eval-ed, so be careful
          // with lookup (in case of e.g. prototype pollution), and strip newlines if any.
          // A newline wouldn't be a valid sourceURL anyway, and it'd enable code injection.
          var sourceURL = '//# sourceURL=' +
            (hasOwnProperty.call(options, 'sourceURL')
              ? (options.sourceURL + '').replace(/[\r\n]/g, ' ')
              : ('lodash.templateSources[' + (++templateCounter) + ']')
            ) + '\n';

          string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
            interpolateValue || (interpolateValue = esTemplateValue);

            // Escape characters that can't be included in string literals.
            source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

            // Replace delimiters with snippets.
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

            // The JS engine embedded in Adobe products needs `match` returned in
            // order to produce the correct `offset` value.
            return match;
          });

          source += "';\n";

          // If `variable` is not specified wrap a with-statement around the generated
          // code to add the data object to the top of the scope chain.
          // Like with sourceURL, we take care to not check the option's prototype,
          // as this configuration is a code injection vector.
          var variable = hasOwnProperty.call(options, 'variable') && options.variable;
          if (!variable) {
            source = 'with (obj) {\n' + source + '\n}\n';
          }
          // Cleanup code by stripping empty strings.
          source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
            .replace(reEmptyStringMiddle, '$1')
            .replace(reEmptyStringTrailing, '$1;');

          // Frame code as the function body.
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

          // Provide the compiled function's source by its `toString` method or
          // the `source` property as a convenience for inlining compiled templates.
          result.source = source;
          if (isError(result)) {
            throw result;
          }
          return result;
        }

        /**
         * Converts `string`, as a whole, to lower case just like
         * [String#toLowerCase](https://mdn.io/toLowerCase).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the lower cased string.
         * @example
         *
         * _.toLower('--Foo-Bar--');
         * // => '--foo-bar--'
         *
         * _.toLower('fooBar');
         * // => 'foobar'
         *
         * _.toLower('__FOO_BAR__');
         * // => '__foo_bar__'
         */
        function toLower(value) {
          return toString(value).toLowerCase();
        }

        /**
         * Converts `string`, as a whole, to upper case just like
         * [String#toUpperCase](https://mdn.io/toUpperCase).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the upper cased string.
         * @example
         *
         * _.toUpper('--foo-bar--');
         * // => '--FOO-BAR--'
         *
         * _.toUpper('fooBar');
         * // => 'FOOBAR'
         *
         * _.toUpper('__foo_bar__');
         * // => '__FOO_BAR__'
         */
        function toUpper(value) {
          return toString(value).toUpperCase();
        }

        /**
         * Removes leading and trailing whitespace or specified characters from `string`.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to trim.
         * @param {string} [chars=whitespace] The characters to trim.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {string} Returns the trimmed string.
         * @example
         *
         * _.trim('  abc  ');
         * // => 'abc'
         *
         * _.trim('-_-abc-_-', '_-');
         * // => 'abc'
         *
         * _.map(['  foo  ', '  bar  '], _.trim);
         * // => ['foo', 'bar']
         */
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

        /**
         * Removes trailing whitespace or specified characters from `string`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to trim.
         * @param {string} [chars=whitespace] The characters to trim.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {string} Returns the trimmed string.
         * @example
         *
         * _.trimEnd('  abc  ');
         * // => '  abc'
         *
         * _.trimEnd('-_-abc-_-', '_-');
         * // => '-_-abc'
         */
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

        /**
         * Removes leading whitespace or specified characters from `string`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to trim.
         * @param {string} [chars=whitespace] The characters to trim.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {string} Returns the trimmed string.
         * @example
         *
         * _.trimStart('  abc  ');
         * // => 'abc  '
         *
         * _.trimStart('-_-abc-_-', '_-');
         * // => 'abc-_-'
         */
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

        /**
         * Truncates `string` if it's longer than the given maximum string length.
         * The last characters of the truncated string are replaced with the omission
         * string which defaults to "...".
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to truncate.
         * @param {Object} [options={}] The options object.
         * @param {number} [options.length=30] The maximum string length.
         * @param {string} [options.omission='...'] The string to indicate text is omitted.
         * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
         * @returns {string} Returns the truncated string.
         * @example
         *
         * _.truncate('hi-diddly-ho there, neighborino');
         * // => 'hi-diddly-ho there, neighbo...'
         *
         * _.truncate('hi-diddly-ho there, neighborino', {
         *   'length': 24,
         *   'separator': ' '
         * });
         * // => 'hi-diddly-ho there,...'
         *
         * _.truncate('hi-diddly-ho there, neighborino', {
         *   'length': 24,
         *   'separator': /,? +/
         * });
         * // => 'hi-diddly-ho there...'
         *
         * _.truncate('hi-diddly-ho there, neighborino', {
         *   'omission': ' [...]'
         * });
         * // => 'hi-diddly-ho there, neig [...]'
         */
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

        /**
         * The inverse of `_.escape`; this method converts the HTML entities
         * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to
         * their corresponding characters.
         *
         * **Note:** No other HTML entities are unescaped. To unescape additional
         * HTML entities use a third-party library like [_he_](https://mths.be/he).
         *
         * @static
         * @memberOf _
         * @since 0.6.0
         * @category String
         * @param {string} [string=''] The string to unescape.
         * @returns {string} Returns the unescaped string.
         * @example
         *
         * _.unescape('fred, barney, &amp; pebbles');
         * // => 'fred, barney, & pebbles'
         */
        function unescape(string) {
          string = toString(string);
          return (string && reHasEscapedHtml.test(string))
            ? string.replace(reEscapedHtml, unescapeHtmlChar)
            : string;
        }

        /**
         * Converts `string`, as space separated words, to upper case.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the upper cased string.
         * @example
         *
         * _.upperCase('--foo-bar');
         * // => 'FOO BAR'
         *
         * _.upperCase('fooBar');
         * // => 'FOO BAR'
         *
         * _.upperCase('__foo_bar__');
         * // => 'FOO BAR'
         */
        var upperCase = createCompounder(function(result, word, index) {
          return result + (index ? ' ' : '') + word.toUpperCase();
        });

        /**
         * Converts the first character of `string` to upper case.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the converted string.
         * @example
         *
         * _.upperFirst('fred');
         * // => 'Fred'
         *
         * _.upperFirst('FRED');
         * // => 'FRED'
         */
        var upperFirst = createCaseFirst('toUpperCase');

        /**
         * Splits `string` into an array of its words.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category String
         * @param {string} [string=''] The string to inspect.
         * @param {RegExp|string} [pattern] The pattern to match words.
         * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
         * @returns {Array} Returns the words of `string`.
         * @example
         *
         * _.words('fred, barney, & pebbles');
         * // => ['fred', 'barney', 'pebbles']
         *
         * _.words('fred, barney, & pebbles', /[^, ]+/g);
         * // => ['fred', 'barney', '&', 'pebbles']
         */
        function words(string, pattern, guard) {
          string = toString(string);
          pattern = guard ? undefined$1 : pattern;

          if (pattern === undefined$1) {
            return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
          }
          return string.match(pattern) || [];
        }

        /*------------------------------------------------------------------------*/

        /**
         * Attempts to invoke `func`, returning either the result or the caught error
         * object. Any additional arguments are provided to `func` when it's invoked.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Util
         * @param {Function} func The function to attempt.
         * @param {...*} [args] The arguments to invoke `func` with.
         * @returns {*} Returns the `func` result or error object.
         * @example
         *
         * // Avoid throwing errors for invalid selectors.
         * var elements = _.attempt(function(selector) {
         *   return document.querySelectorAll(selector);
         * }, '>_>');
         *
         * if (_.isError(elements)) {
         *   elements = [];
         * }
         */
        var attempt = baseRest(function(func, args) {
          try {
            return apply(func, undefined$1, args);
          } catch (e) {
            return isError(e) ? e : new Error(e);
          }
        });

        /**
         * Binds methods of an object to the object itself, overwriting the existing
         * method.
         *
         * **Note:** This method doesn't set the "length" property of bound functions.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @param {Object} object The object to bind and assign the bound methods to.
         * @param {...(string|string[])} methodNames The object method names to bind.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var view = {
         *   'label': 'docs',
         *   'click': function() {
         *     console.log('clicked ' + this.label);
         *   }
         * };
         *
         * _.bindAll(view, ['click']);
         * jQuery(element).on('click', view.click);
         * // => Logs 'clicked docs' when clicked.
         */
        var bindAll = flatRest(function(object, methodNames) {
          arrayEach(methodNames, function(key) {
            key = toKey(key);
            baseAssignValue(object, key, bind(object[key], object));
          });
          return object;
        });

        /**
         * Creates a function that iterates over `pairs` and invokes the corresponding
         * function of the first predicate to return truthy. The predicate-function
         * pairs are invoked with the `this` binding and arguments of the created
         * function.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {Array} pairs The predicate-function pairs.
         * @returns {Function} Returns the new composite function.
         * @example
         *
         * var func = _.cond([
         *   [_.matches({ 'a': 1 }),           _.constant('matches A')],
         *   [_.conforms({ 'b': _.isNumber }), _.constant('matches B')],
         *   [_.stubTrue,                      _.constant('no match')]
         * ]);
         *
         * func({ 'a': 1, 'b': 2 });
         * // => 'matches A'
         *
         * func({ 'a': 0, 'b': 1 });
         * // => 'matches B'
         *
         * func({ 'a': '1', 'b': '2' });
         * // => 'no match'
         */
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

        /**
         * Creates a function that invokes the predicate properties of `source` with
         * the corresponding property values of a given object, returning `true` if
         * all predicates return truthy, else `false`.
         *
         * **Note:** The created function is equivalent to `_.conformsTo` with
         * `source` partially applied.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {Object} source The object of property predicates to conform to.
         * @returns {Function} Returns the new spec function.
         * @example
         *
         * var objects = [
         *   { 'a': 2, 'b': 1 },
         *   { 'a': 1, 'b': 2 }
         * ];
         *
         * _.filter(objects, _.conforms({ 'b': function(n) { return n > 1; } }));
         * // => [{ 'a': 1, 'b': 2 }]
         */
        function conforms(source) {
          return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
        }

        /**
         * Creates a function that returns `value`.
         *
         * @static
         * @memberOf _
         * @since 2.4.0
         * @category Util
         * @param {*} value The value to return from the new function.
         * @returns {Function} Returns the new constant function.
         * @example
         *
         * var objects = _.times(2, _.constant({ 'a': 1 }));
         *
         * console.log(objects);
         * // => [{ 'a': 1 }, { 'a': 1 }]
         *
         * console.log(objects[0] === objects[1]);
         * // => true
         */
        function constant(value) {
          return function() {
            return value;
          };
        }

        /**
         * Checks `value` to determine whether a default value should be returned in
         * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
         * or `undefined`.
         *
         * @static
         * @memberOf _
         * @since 4.14.0
         * @category Util
         * @param {*} value The value to check.
         * @param {*} defaultValue The default value.
         * @returns {*} Returns the resolved value.
         * @example
         *
         * _.defaultTo(1, 10);
         * // => 1
         *
         * _.defaultTo(undefined, 10);
         * // => 10
         */
        function defaultTo(value, defaultValue) {
          return (value == null || value !== value) ? defaultValue : value;
        }

        /**
         * Creates a function that returns the result of invoking the given functions
         * with the `this` binding of the created function, where each successive
         * invocation is supplied the return value of the previous.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Util
         * @param {...(Function|Function[])} [funcs] The functions to invoke.
         * @returns {Function} Returns the new composite function.
         * @see _.flowRight
         * @example
         *
         * function square(n) {
         *   return n * n;
         * }
         *
         * var addSquare = _.flow([_.add, square]);
         * addSquare(1, 2);
         * // => 9
         */
        var flow = createFlow();

        /**
         * This method is like `_.flow` except that it creates a function that
         * invokes the given functions from right to left.
         *
         * @static
         * @since 3.0.0
         * @memberOf _
         * @category Util
         * @param {...(Function|Function[])} [funcs] The functions to invoke.
         * @returns {Function} Returns the new composite function.
         * @see _.flow
         * @example
         *
         * function square(n) {
         *   return n * n;
         * }
         *
         * var addSquare = _.flowRight([square, _.add]);
         * addSquare(1, 2);
         * // => 9
         */
        var flowRight = createFlow(true);

        /**
         * This method returns the first argument it receives.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @param {*} value Any value.
         * @returns {*} Returns `value`.
         * @example
         *
         * var object = { 'a': 1 };
         *
         * console.log(_.identity(object) === object);
         * // => true
         */
        function identity(value) {
          return value;
        }

        /**
         * Creates a function that invokes `func` with the arguments of the created
         * function. If `func` is a property name, the created function returns the
         * property value for a given element. If `func` is an array or object, the
         * created function returns `true` for elements that contain the equivalent
         * source properties, otherwise it returns `false`.
         *
         * @static
         * @since 4.0.0
         * @memberOf _
         * @category Util
         * @param {*} [func=_.identity] The value to convert to a callback.
         * @returns {Function} Returns the callback.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': true },
         *   { 'user': 'fred',   'age': 40, 'active': false }
         * ];
         *
         * // The `_.matches` iteratee shorthand.
         * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
         * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
         *
         * // The `_.matchesProperty` iteratee shorthand.
         * _.filter(users, _.iteratee(['user', 'fred']));
         * // => [{ 'user': 'fred', 'age': 40 }]
         *
         * // The `_.property` iteratee shorthand.
         * _.map(users, _.iteratee('user'));
         * // => ['barney', 'fred']
         *
         * // Create custom iteratee shorthands.
         * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
         *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
         *     return func.test(string);
         *   };
         * });
         *
         * _.filter(['abc', 'def'], /ef/);
         * // => ['def']
         */
        function iteratee(func) {
          return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
        }

        /**
         * Creates a function that performs a partial deep comparison between a given
         * object and `source`, returning `true` if the given object has equivalent
         * property values, else `false`.
         *
         * **Note:** The created function is equivalent to `_.isMatch` with `source`
         * partially applied.
         *
         * Partial comparisons will match empty array and empty object `source`
         * values against any array or object value, respectively. See `_.isEqual`
         * for a list of supported value comparisons.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Util
         * @param {Object} source The object of property values to match.
         * @returns {Function} Returns the new spec function.
         * @example
         *
         * var objects = [
         *   { 'a': 1, 'b': 2, 'c': 3 },
         *   { 'a': 4, 'b': 5, 'c': 6 }
         * ];
         *
         * _.filter(objects, _.matches({ 'a': 4, 'c': 6 }));
         * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
         */
        function matches(source) {
          return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
        }

        /**
         * Creates a function that performs a partial deep comparison between the
         * value at `path` of a given object to `srcValue`, returning `true` if the
         * object value is equivalent, else `false`.
         *
         * **Note:** Partial comparisons will match empty array and empty object
         * `srcValue` values against any array or object value, respectively. See
         * `_.isEqual` for a list of supported value comparisons.
         *
         * @static
         * @memberOf _
         * @since 3.2.0
         * @category Util
         * @param {Array|string} path The path of the property to get.
         * @param {*} srcValue The value to match.
         * @returns {Function} Returns the new spec function.
         * @example
         *
         * var objects = [
         *   { 'a': 1, 'b': 2, 'c': 3 },
         *   { 'a': 4, 'b': 5, 'c': 6 }
         * ];
         *
         * _.find(objects, _.matchesProperty('a', 4));
         * // => { 'a': 4, 'b': 5, 'c': 6 }
         */
        function matchesProperty(path, srcValue) {
          return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
        }

        /**
         * Creates a function that invokes the method at `path` of a given object.
         * Any additional arguments are provided to the invoked method.
         *
         * @static
         * @memberOf _
         * @since 3.7.0
         * @category Util
         * @param {Array|string} path The path of the method to invoke.
         * @param {...*} [args] The arguments to invoke the method with.
         * @returns {Function} Returns the new invoker function.
         * @example
         *
         * var objects = [
         *   { 'a': { 'b': _.constant(2) } },
         *   { 'a': { 'b': _.constant(1) } }
         * ];
         *
         * _.map(objects, _.method('a.b'));
         * // => [2, 1]
         *
         * _.map(objects, _.method(['a', 'b']));
         * // => [2, 1]
         */
        var method = baseRest(function(path, args) {
          return function(object) {
            return baseInvoke(object, path, args);
          };
        });

        /**
         * The opposite of `_.method`; this method creates a function that invokes
         * the method at a given path of `object`. Any additional arguments are
         * provided to the invoked method.
         *
         * @static
         * @memberOf _
         * @since 3.7.0
         * @category Util
         * @param {Object} object The object to query.
         * @param {...*} [args] The arguments to invoke the method with.
         * @returns {Function} Returns the new invoker function.
         * @example
         *
         * var array = _.times(3, _.constant),
         *     object = { 'a': array, 'b': array, 'c': array };
         *
         * _.map(['a[2]', 'c[0]'], _.methodOf(object));
         * // => [2, 0]
         *
         * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
         * // => [2, 0]
         */
        var methodOf = baseRest(function(object, args) {
          return function(path) {
            return baseInvoke(object, path, args);
          };
        });

        /**
         * Adds all own enumerable string keyed function properties of a source
         * object to the destination object. If `object` is a function, then methods
         * are added to its prototype as well.
         *
         * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
         * avoid conflicts caused by modifying the original.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @param {Function|Object} [object=lodash] The destination object.
         * @param {Object} source The object of functions to add.
         * @param {Object} [options={}] The options object.
         * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
         * @returns {Function|Object} Returns `object`.
         * @example
         *
         * function vowels(string) {
         *   return _.filter(string, function(v) {
         *     return /[aeiou]/i.test(v);
         *   });
         * }
         *
         * _.mixin({ 'vowels': vowels });
         * _.vowels('fred');
         * // => ['e']
         *
         * _('fred').vowels().value();
         * // => ['e']
         *
         * _.mixin({ 'vowels': vowels }, { 'chain': false });
         * _('fred').vowels();
         * // => ['e']
         */
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

        /**
         * Reverts the `_` variable to its previous value and returns a reference to
         * the `lodash` function.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @returns {Function} Returns the `lodash` function.
         * @example
         *
         * var lodash = _.noConflict();
         */
        function noConflict() {
          if (root._ === this) {
            root._ = oldDash;
          }
          return this;
        }

        /**
         * This method returns `undefined`.
         *
         * @static
         * @memberOf _
         * @since 2.3.0
         * @category Util
         * @example
         *
         * _.times(2, _.noop);
         * // => [undefined, undefined]
         */
        function noop() {
          // No operation performed.
        }

        /**
         * Creates a function that gets the argument at index `n`. If `n` is negative,
         * the nth argument from the end is returned.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {number} [n=0] The index of the argument to return.
         * @returns {Function} Returns the new pass-thru function.
         * @example
         *
         * var func = _.nthArg(1);
         * func('a', 'b', 'c', 'd');
         * // => 'b'
         *
         * var func = _.nthArg(-2);
         * func('a', 'b', 'c', 'd');
         * // => 'c'
         */
        function nthArg(n) {
          n = toInteger(n);
          return baseRest(function(args) {
            return baseNth(args, n);
          });
        }

        /**
         * Creates a function that invokes `iteratees` with the arguments it receives
         * and returns their results.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {...(Function|Function[])} [iteratees=[_.identity]]
         *  The iteratees to invoke.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var func = _.over([Math.max, Math.min]);
         *
         * func(1, 2, 3, 4);
         * // => [4, 1]
         */
        var over = createOver(arrayMap);

        /**
         * Creates a function that checks if **all** of the `predicates` return
         * truthy when invoked with the arguments it receives.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {...(Function|Function[])} [predicates=[_.identity]]
         *  The predicates to check.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var func = _.overEvery([Boolean, isFinite]);
         *
         * func('1');
         * // => true
         *
         * func(null);
         * // => false
         *
         * func(NaN);
         * // => false
         */
        var overEvery = createOver(arrayEvery);

        /**
         * Creates a function that checks if **any** of the `predicates` return
         * truthy when invoked with the arguments it receives.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {...(Function|Function[])} [predicates=[_.identity]]
         *  The predicates to check.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var func = _.overSome([Boolean, isFinite]);
         *
         * func('1');
         * // => true
         *
         * func(null);
         * // => true
         *
         * func(NaN);
         * // => false
         */
        var overSome = createOver(arraySome);

        /**
         * Creates a function that returns the value at `path` of a given object.
         *
         * @static
         * @memberOf _
         * @since 2.4.0
         * @category Util
         * @param {Array|string} path The path of the property to get.
         * @returns {Function} Returns the new accessor function.
         * @example
         *
         * var objects = [
         *   { 'a': { 'b': 2 } },
         *   { 'a': { 'b': 1 } }
         * ];
         *
         * _.map(objects, _.property('a.b'));
         * // => [2, 1]
         *
         * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
         * // => [1, 2]
         */
        function property(path) {
          return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
        }

        /**
         * The opposite of `_.property`; this method creates a function that returns
         * the value at a given path of `object`.
         *
         * @static
         * @memberOf _
         * @since 3.0.0
         * @category Util
         * @param {Object} object The object to query.
         * @returns {Function} Returns the new accessor function.
         * @example
         *
         * var array = [0, 1, 2],
         *     object = { 'a': array, 'b': array, 'c': array };
         *
         * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
         * // => [2, 0]
         *
         * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
         * // => [2, 0]
         */
        function propertyOf(object) {
          return function(path) {
            return object == null ? undefined$1 : baseGet(object, path);
          };
        }

        /**
         * Creates an array of numbers (positive and/or negative) progressing from
         * `start` up to, but not including, `end`. A step of `-1` is used if a negative
         * `start` is specified without an `end` or `step`. If `end` is not specified,
         * it's set to `start` with `start` then set to `0`.
         *
         * **Note:** JavaScript follows the IEEE-754 standard for resolving
         * floating-point values which can produce unexpected results.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @param {number} [start=0] The start of the range.
         * @param {number} end The end of the range.
         * @param {number} [step=1] The value to increment or decrement by.
         * @returns {Array} Returns the range of numbers.
         * @see _.inRange, _.rangeRight
         * @example
         *
         * _.range(4);
         * // => [0, 1, 2, 3]
         *
         * _.range(-4);
         * // => [0, -1, -2, -3]
         *
         * _.range(1, 5);
         * // => [1, 2, 3, 4]
         *
         * _.range(0, 20, 5);
         * // => [0, 5, 10, 15]
         *
         * _.range(0, -4, -1);
         * // => [0, -1, -2, -3]
         *
         * _.range(1, 4, 0);
         * // => [1, 1, 1]
         *
         * _.range(0);
         * // => []
         */
        var range = createRange();

        /**
         * This method is like `_.range` except that it populates values in
         * descending order.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {number} [start=0] The start of the range.
         * @param {number} end The end of the range.
         * @param {number} [step=1] The value to increment or decrement by.
         * @returns {Array} Returns the range of numbers.
         * @see _.inRange, _.range
         * @example
         *
         * _.rangeRight(4);
         * // => [3, 2, 1, 0]
         *
         * _.rangeRight(-4);
         * // => [-3, -2, -1, 0]
         *
         * _.rangeRight(1, 5);
         * // => [4, 3, 2, 1]
         *
         * _.rangeRight(0, 20, 5);
         * // => [15, 10, 5, 0]
         *
         * _.rangeRight(0, -4, -1);
         * // => [-3, -2, -1, 0]
         *
         * _.rangeRight(1, 4, 0);
         * // => [1, 1, 1]
         *
         * _.rangeRight(0);
         * // => []
         */
        var rangeRight = createRange(true);

        /**
         * This method returns a new empty array.
         *
         * @static
         * @memberOf _
         * @since 4.13.0
         * @category Util
         * @returns {Array} Returns the new empty array.
         * @example
         *
         * var arrays = _.times(2, _.stubArray);
         *
         * console.log(arrays);
         * // => [[], []]
         *
         * console.log(arrays[0] === arrays[1]);
         * // => false
         */
        function stubArray() {
          return [];
        }

        /**
         * This method returns `false`.
         *
         * @static
         * @memberOf _
         * @since 4.13.0
         * @category Util
         * @returns {boolean} Returns `false`.
         * @example
         *
         * _.times(2, _.stubFalse);
         * // => [false, false]
         */
        function stubFalse() {
          return false;
        }

        /**
         * This method returns a new empty object.
         *
         * @static
         * @memberOf _
         * @since 4.13.0
         * @category Util
         * @returns {Object} Returns the new empty object.
         * @example
         *
         * var objects = _.times(2, _.stubObject);
         *
         * console.log(objects);
         * // => [{}, {}]
         *
         * console.log(objects[0] === objects[1]);
         * // => false
         */
        function stubObject() {
          return {};
        }

        /**
         * This method returns an empty string.
         *
         * @static
         * @memberOf _
         * @since 4.13.0
         * @category Util
         * @returns {string} Returns the empty string.
         * @example
         *
         * _.times(2, _.stubString);
         * // => ['', '']
         */
        function stubString() {
          return '';
        }

        /**
         * This method returns `true`.
         *
         * @static
         * @memberOf _
         * @since 4.13.0
         * @category Util
         * @returns {boolean} Returns `true`.
         * @example
         *
         * _.times(2, _.stubTrue);
         * // => [true, true]
         */
        function stubTrue() {
          return true;
        }

        /**
         * Invokes the iteratee `n` times, returning an array of the results of
         * each invocation. The iteratee is invoked with one argument; (index).
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @param {number} n The number of times to invoke `iteratee`.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @returns {Array} Returns the array of results.
         * @example
         *
         * _.times(3, String);
         * // => ['0', '1', '2']
         *
         *  _.times(4, _.constant(0));
         * // => [0, 0, 0, 0]
         */
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

        /**
         * Converts `value` to a property path array.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Util
         * @param {*} value The value to convert.
         * @returns {Array} Returns the new property path array.
         * @example
         *
         * _.toPath('a.b.c');
         * // => ['a', 'b', 'c']
         *
         * _.toPath('a[0].b.c');
         * // => ['a', '0', 'b', 'c']
         */
        function toPath(value) {
          if (isArray(value)) {
            return arrayMap(value, toKey);
          }
          return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
        }

        /**
         * Generates a unique ID. If `prefix` is given, the ID is appended to it.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Util
         * @param {string} [prefix=''] The value to prefix the ID with.
         * @returns {string} Returns the unique ID.
         * @example
         *
         * _.uniqueId('contact_');
         * // => 'contact_104'
         *
         * _.uniqueId();
         * // => '105'
         */
        function uniqueId(prefix) {
          var id = ++idCounter;
          return toString(prefix) + id;
        }

        /*------------------------------------------------------------------------*/

        /**
         * Adds two numbers.
         *
         * @static
         * @memberOf _
         * @since 3.4.0
         * @category Math
         * @param {number} augend The first number in an addition.
         * @param {number} addend The second number in an addition.
         * @returns {number} Returns the total.
         * @example
         *
         * _.add(6, 4);
         * // => 10
         */
        var add = createMathOperation(function(augend, addend) {
          return augend + addend;
        }, 0);

        /**
         * Computes `number` rounded up to `precision`.
         *
         * @static
         * @memberOf _
         * @since 3.10.0
         * @category Math
         * @param {number} number The number to round up.
         * @param {number} [precision=0] The precision to round up to.
         * @returns {number} Returns the rounded up number.
         * @example
         *
         * _.ceil(4.006);
         * // => 5
         *
         * _.ceil(6.004, 2);
         * // => 6.01
         *
         * _.ceil(6040, -2);
         * // => 6100
         */
        var ceil = createRound('ceil');

        /**
         * Divide two numbers.
         *
         * @static
         * @memberOf _
         * @since 4.7.0
         * @category Math
         * @param {number} dividend The first number in a division.
         * @param {number} divisor The second number in a division.
         * @returns {number} Returns the quotient.
         * @example
         *
         * _.divide(6, 4);
         * // => 1.5
         */
        var divide = createMathOperation(function(dividend, divisor) {
          return dividend / divisor;
        }, 1);

        /**
         * Computes `number` rounded down to `precision`.
         *
         * @static
         * @memberOf _
         * @since 3.10.0
         * @category Math
         * @param {number} number The number to round down.
         * @param {number} [precision=0] The precision to round down to.
         * @returns {number} Returns the rounded down number.
         * @example
         *
         * _.floor(4.006);
         * // => 4
         *
         * _.floor(0.046, 2);
         * // => 0.04
         *
         * _.floor(4060, -2);
         * // => 4000
         */
        var floor = createRound('floor');

        /**
         * Computes the maximum value of `array`. If `array` is empty or falsey,
         * `undefined` is returned.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Math
         * @param {Array} array The array to iterate over.
         * @returns {*} Returns the maximum value.
         * @example
         *
         * _.max([4, 2, 8, 6]);
         * // => 8
         *
         * _.max([]);
         * // => undefined
         */
        function max(array) {
          return (array && array.length)
            ? baseExtremum(array, identity, baseGt)
            : undefined$1;
        }

        /**
         * This method is like `_.max` except that it accepts `iteratee` which is
         * invoked for each element in `array` to generate the criterion by which
         * the value is ranked. The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Math
         * @param {Array} array The array to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {*} Returns the maximum value.
         * @example
         *
         * var objects = [{ 'n': 1 }, { 'n': 2 }];
         *
         * _.maxBy(objects, function(o) { return o.n; });
         * // => { 'n': 2 }
         *
         * // The `_.property` iteratee shorthand.
         * _.maxBy(objects, 'n');
         * // => { 'n': 2 }
         */
        function maxBy(array, iteratee) {
          return (array && array.length)
            ? baseExtremum(array, getIteratee(iteratee, 2), baseGt)
            : undefined$1;
        }

        /**
         * Computes the mean of the values in `array`.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Math
         * @param {Array} array The array to iterate over.
         * @returns {number} Returns the mean.
         * @example
         *
         * _.mean([4, 2, 8, 6]);
         * // => 5
         */
        function mean(array) {
          return baseMean(array, identity);
        }

        /**
         * This method is like `_.mean` except that it accepts `iteratee` which is
         * invoked for each element in `array` to generate the value to be averaged.
         * The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.7.0
         * @category Math
         * @param {Array} array The array to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {number} Returns the mean.
         * @example
         *
         * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
         *
         * _.meanBy(objects, function(o) { return o.n; });
         * // => 5
         *
         * // The `_.property` iteratee shorthand.
         * _.meanBy(objects, 'n');
         * // => 5
         */
        function meanBy(array, iteratee) {
          return baseMean(array, getIteratee(iteratee, 2));
        }

        /**
         * Computes the minimum value of `array`. If `array` is empty or falsey,
         * `undefined` is returned.
         *
         * @static
         * @since 0.1.0
         * @memberOf _
         * @category Math
         * @param {Array} array The array to iterate over.
         * @returns {*} Returns the minimum value.
         * @example
         *
         * _.min([4, 2, 8, 6]);
         * // => 2
         *
         * _.min([]);
         * // => undefined
         */
        function min(array) {
          return (array && array.length)
            ? baseExtremum(array, identity, baseLt)
            : undefined$1;
        }

        /**
         * This method is like `_.min` except that it accepts `iteratee` which is
         * invoked for each element in `array` to generate the criterion by which
         * the value is ranked. The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Math
         * @param {Array} array The array to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {*} Returns the minimum value.
         * @example
         *
         * var objects = [{ 'n': 1 }, { 'n': 2 }];
         *
         * _.minBy(objects, function(o) { return o.n; });
         * // => { 'n': 1 }
         *
         * // The `_.property` iteratee shorthand.
         * _.minBy(objects, 'n');
         * // => { 'n': 1 }
         */
        function minBy(array, iteratee) {
          return (array && array.length)
            ? baseExtremum(array, getIteratee(iteratee, 2), baseLt)
            : undefined$1;
        }

        /**
         * Multiply two numbers.
         *
         * @static
         * @memberOf _
         * @since 4.7.0
         * @category Math
         * @param {number} multiplier The first number in a multiplication.
         * @param {number} multiplicand The second number in a multiplication.
         * @returns {number} Returns the product.
         * @example
         *
         * _.multiply(6, 4);
         * // => 24
         */
        var multiply = createMathOperation(function(multiplier, multiplicand) {
          return multiplier * multiplicand;
        }, 1);

        /**
         * Computes `number` rounded to `precision`.
         *
         * @static
         * @memberOf _
         * @since 3.10.0
         * @category Math
         * @param {number} number The number to round.
         * @param {number} [precision=0] The precision to round to.
         * @returns {number} Returns the rounded number.
         * @example
         *
         * _.round(4.006);
         * // => 4
         *
         * _.round(4.006, 2);
         * // => 4.01
         *
         * _.round(4060, -2);
         * // => 4100
         */
        var round = createRound('round');

        /**
         * Subtract two numbers.
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Math
         * @param {number} minuend The first number in a subtraction.
         * @param {number} subtrahend The second number in a subtraction.
         * @returns {number} Returns the difference.
         * @example
         *
         * _.subtract(6, 4);
         * // => 2
         */
        var subtract = createMathOperation(function(minuend, subtrahend) {
          return minuend - subtrahend;
        }, 0);

        /**
         * Computes the sum of the values in `array`.
         *
         * @static
         * @memberOf _
         * @since 3.4.0
         * @category Math
         * @param {Array} array The array to iterate over.
         * @returns {number} Returns the sum.
         * @example
         *
         * _.sum([4, 2, 8, 6]);
         * // => 20
         */
        function sum(array) {
          return (array && array.length)
            ? baseSum(array, identity)
            : 0;
        }

        /**
         * This method is like `_.sum` except that it accepts `iteratee` which is
         * invoked for each element in `array` to generate the value to be summed.
         * The iteratee is invoked with one argument: (value).
         *
         * @static
         * @memberOf _
         * @since 4.0.0
         * @category Math
         * @param {Array} array The array to iterate over.
         * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
         * @returns {number} Returns the sum.
         * @example
         *
         * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
         *
         * _.sumBy(objects, function(o) { return o.n; });
         * // => 20
         *
         * // The `_.property` iteratee shorthand.
         * _.sumBy(objects, 'n');
         * // => 20
         */
        function sumBy(array, iteratee) {
          return (array && array.length)
            ? baseSum(array, getIteratee(iteratee, 2))
            : 0;
        }

        /*------------------------------------------------------------------------*/

        // Add methods that return wrapped values in chain sequences.
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

        // Add aliases.
        lodash.entries = toPairs;
        lodash.entriesIn = toPairsIn;
        lodash.extend = assignIn;
        lodash.extendWith = assignInWith;

        // Add methods to `lodash.prototype`.
        mixin(lodash, lodash);

        /*------------------------------------------------------------------------*/

        // Add methods that return unwrapped values in chain sequences.
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

        // Add aliases.
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

        /*------------------------------------------------------------------------*/

        /**
         * The semantic version number.
         *
         * @static
         * @memberOf _
         * @type {string}
         */
        lodash.VERSION = VERSION;

        // Assign default placeholders.
        arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
          lodash[methodName].placeholder = lodash;
        });

        // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
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

        // Add `LazyWrapper` methods that accept an `iteratee` value.
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

        // Add `LazyWrapper` methods for `_.head` and `_.last`.
        arrayEach(['head', 'last'], function(methodName, index) {
          var takeName = 'take' + (index ? 'Right' : '');

          LazyWrapper.prototype[methodName] = function() {
            return this[takeName](1).value()[0];
          };
        });

        // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
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

        // Add `LazyWrapper` methods to `lodash.prototype`.
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
              // Avoid lazy use if the iteratee has a "length" value other than `1`.
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

        // Add `Array` methods to `lodash.prototype`.
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

        // Map minified method names to their real names.
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

        // Add methods to `LazyWrapper`.
        LazyWrapper.prototype.clone = lazyClone;
        LazyWrapper.prototype.reverse = lazyReverse;
        LazyWrapper.prototype.value = lazyValue;

        // Add chain sequence methods to the `lodash` wrapper.
        lodash.prototype.at = wrapperAt;
        lodash.prototype.chain = wrapperChain;
        lodash.prototype.commit = wrapperCommit;
        lodash.prototype.next = wrapperNext;
        lodash.prototype.plant = wrapperPlant;
        lodash.prototype.reverse = wrapperReverse;
        lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

        // Add lazy aliases.
        lodash.prototype.first = lodash.prototype.head;

        if (symIterator) {
          lodash.prototype[symIterator] = wrapperToIterator;
        }
        return lodash;
      });

      /*--------------------------------------------------------------------------*/

      // Export lodash.
      var _ = runInContext();

      // Some AMD build optimizers, like r.js, check for condition patterns like:
      if (freeModule) {
        // Export for Node.js.
        (freeModule.exports = _)._ = _;
        // Export for CommonJS support.
        freeExports._ = _;
      }
      else {
        // Export to the global object.
        root._ = _;
      }
    }.call(commonjsGlobal));
    });

    // TODO get default value from config by more priority

    const nowUnix = persianDateToUnix(new persianDate());

    const config = writable(defaultconfig);
    const isDirty = writable(false);
    const selectedUnix = writable(nowUnix);
    const viewUnix = writable(nowUnix);
    const privateViewMode = writable('day');
    // [date, month, year]
    const dateObject = writable(persianDate);


    const actions = {
      setDate (unix) {
        this.updateIsDirty(true);
        viewUnix.set(unix);
        selectedUnix.set(unix);
      },
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
        if (payload.onlyTimePicker) {
          this.setViewMode('time');
        } else {
          this.setViewMode(payload.viewMode);
        }
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
        } else {
          this.setViewModeToLowerAvailableLevel();
        }
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
        } else {
          this.setViewModeToLowerAvailableLevel();
        }
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
        privateViewMode.set(mode);
      },
      setViewModeToUpperAvailableLevel() {
        let currentViewMode = get_store_value(privateViewMode);
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
        let currentViewMode = get_store_value(privateViewMode);
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
        if (get_store_value(privateViewMode) === 'day') {
          viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('month', 1)));
        }
        if (get_store_value(privateViewMode) === 'month') {
          viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('year', 1)));
        }
        if (get_store_value(privateViewMode) === 'year') {
          viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).add('year', 12)));
        }
      },
      onSelectPrevView() {
        if (get_store_value(privateViewMode) === 'day') {
          viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('month', 1)));
        }
        if (get_store_value(privateViewMode) === 'month') {
          viewUnix.set(persianDateToUnix(new persianDate(get_store_value(viewUnix)).subtract('year', 1)));
        }
        if (get_store_value(privateViewMode) === 'year') {
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

    /* src/components/YearView.svelte generated by Svelte v3.21.0 */
    const file = "src/components/YearView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (1:0) {#if visible}
    function create_if_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let each_value = /*yearRange*/ ctx[0];
    	validate_each_argument(each_value);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*isDisable, yearRange, currentYear, select, getPersianYear*/ 357) {
    				each_value = /*yearRange*/ ctx[0];
    				validate_each_argument(each_value);
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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*fadeIn*/ ctx[4], { duration: /*animateSpeed*/ ctx[7] });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*fadeOut*/ ctx[3], { duration: /*animateSpeed*/ ctx[7] });
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
    	let t0_value = /*getPersianYear*/ ctx[8](/*year*/ ctx[19]) + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[18](/*year*/ ctx[19], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "pwt-text");
    			add_location(span, file, 10, 3, 325);
    			toggle_class(div, "disable", /*isDisable*/ ctx[5](/*year*/ ctx[19]));
    			toggle_class(div, "selected", /*currentYear*/ ctx[2] === /*year*/ ctx[19]);
    			add_location(div, file, 6, 4, 167);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*yearRange*/ 1 && t0_value !== (t0_value = /*getPersianYear*/ ctx[8](/*year*/ ctx[19]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*isDisable, yearRange*/ 33) {
    				toggle_class(div, "disable", /*isDisable*/ ctx[5](/*year*/ ctx[19]));
    			}

    			if (dirty & /*currentYear, yearRange*/ 5) {
    				toggle_class(div, "selected", /*currentYear*/ ctx[2] === /*year*/ ctx[19]);
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
    	let if_block = /*visible*/ ctx[1] && create_if_block(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 2) {
    						transition_in(if_block, 1);
    					}
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

    function instance($$self, $$props, $$invalidate) {
    	let $config;
    	let $dateObject;
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(14, $config = $$value));
    	validate_store(dateObject, "dateObject");
    	component_subscribe($$self, dateObject, $$value => $$invalidate(15, $dateObject = $$value));
    	let { selectedUnix } = $$props;
    	let { viewUnix } = $$props;

    	function fadeOut(node, { duration, delay }) {
    		return {
    			duration,
    			delay,
    			css: t => {
    				//console.log(t)
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
    	let animateSpeed = $config.animateSpeed;
    	let cachedViewUnix = viewUnix;
    	let transitionDirectionForward = true;

    	let getPersianYear = function (i) {
    		return new $dateObject([i]).format("YYYY");
    	};

    	const writable_props = ["selectedUnix", "viewUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<YearView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("YearView", $$slots, []);

    	const click_handler = (year, event) => {
    		if (!isDisable(year)) select(year);
    	};

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(9, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(10, viewUnix = $$props.viewUnix);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		config,
    		dateObject,
    		selectedUnix,
    		viewUnix,
    		fadeOut,
    		fadeIn,
    		isDisable,
    		dispatch,
    		select,
    		yearRange,
    		startYear,
    		visible,
    		animateSpeed,
    		cachedViewUnix,
    		transitionDirectionForward,
    		getPersianYear,
    		$config,
    		$dateObject,
    		currentYear,
    		currentViewYear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(9, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(10, viewUnix = $$props.viewUnix);
    		if ("yearRange" in $$props) $$invalidate(0, yearRange = $$props.yearRange);
    		if ("startYear" in $$props) $$invalidate(11, startYear = $$props.startYear);
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("animateSpeed" in $$props) $$invalidate(7, animateSpeed = $$props.animateSpeed);
    		if ("cachedViewUnix" in $$props) $$invalidate(12, cachedViewUnix = $$props.cachedViewUnix);
    		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
    		if ("getPersianYear" in $$props) $$invalidate(8, getPersianYear = $$props.getPersianYear);
    		if ("currentYear" in $$props) $$invalidate(2, currentYear = $$props.currentYear);
    		if ("currentViewYear" in $$props) $$invalidate(16, currentViewYear = $$props.currentViewYear);
    	};

    	let currentYear;
    	let currentViewYear;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 33280) {
    			 $$invalidate(2, currentYear = new $dateObject(selectedUnix).year());
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 33792) {
    			 $$invalidate(16, currentViewYear = new $dateObject(viewUnix).year());
    		}

    		if ($$self.$$.dirty & /*currentViewYear, yearRange, startYear, viewUnix, cachedViewUnix, $config*/ 89089) {
    			 {
    				$$invalidate(0, yearRange = []);
    				$$invalidate(11, startYear = currentViewYear - currentViewYear % 12);
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

    				$$invalidate(12, cachedViewUnix = viewUnix);

    				if ($config.animate) {
    					$$invalidate(1, visible = false);

    					setTimeout(
    						() => {
    							$$invalidate(1, visible = true);
    						},
    						animateSpeed * 2
    					);
    				}
    			}
    		}
    	};

    	return [
    		yearRange,
    		visible,
    		currentYear,
    		fadeOut,
    		fadeIn,
    		isDisable,
    		select,
    		animateSpeed,
    		getPersianYear,
    		selectedUnix,
    		viewUnix,
    		startYear,
    		cachedViewUnix,
    		transitionDirectionForward,
    		$config,
    		$dateObject,
    		currentViewYear,
    		dispatch,
    		click_handler
    	];
    }

    class YearView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { selectedUnix: 9, viewUnix: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "YearView",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[9] === undefined && !("selectedUnix" in props)) {
    			console.warn("<YearView> was created without expected prop 'selectedUnix'");
    		}

    		if (/*viewUnix*/ ctx[10] === undefined && !("viewUnix" in props)) {
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

    /* src/components/MonthView.svelte generated by Svelte v3.21.0 */
    const file$1 = "src/components/MonthView.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (1:0) {#if visible}
    function create_if_block$1(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let each_value = /*monthRange*/ ctx[1];
    	validate_each_argument(each_value);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*isDisable, currentViewYear, currentMonth, currentSelectedYear, select, monthRange*/ 414) {
    				each_value = /*monthRange*/ ctx[1];
    				validate_each_argument(each_value);
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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*fadeIn*/ ctx[6], { duration: /*animateSpeed*/ ctx[9] });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*fadeOut*/ ctx[5], { duration: /*animateSpeed*/ ctx[9] });
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
    	let t0_value = /*month*/ ctx[18] + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[17](/*index*/ ctx[20], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "pwt-text");
    			add_location(span, file$1, 10, 4, 436);
    			toggle_class(div, "disable", /*isDisable*/ ctx[7](/*currentViewYear*/ ctx[4], /*index*/ ctx[20] + 1));
    			toggle_class(div, "selected", /*currentMonth*/ ctx[2] - 1 === /*index*/ ctx[20] && /*currentViewYear*/ ctx[4] === /*currentSelectedYear*/ ctx[3]);
    			add_location(div, file$1, 6, 3, 178);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*monthRange*/ 2 && t0_value !== (t0_value = /*month*/ ctx[18] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*isDisable, currentViewYear*/ 144) {
    				toggle_class(div, "disable", /*isDisable*/ ctx[7](/*currentViewYear*/ ctx[4], /*index*/ ctx[20] + 1));
    			}

    			if (dirty & /*currentMonth, currentViewYear, currentSelectedYear*/ 28) {
    				toggle_class(div, "selected", /*currentMonth*/ ctx[2] - 1 === /*index*/ ctx[20] && /*currentViewYear*/ ctx[4] === /*currentSelectedYear*/ ctx[3]);
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
    	let if_block = /*visible*/ ctx[0] && create_if_block$1(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $config;
    	let $dateObject;
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(14, $config = $$value));
    	validate_store(dateObject, "dateObject");
    	component_subscribe($$self, dateObject, $$value => $$invalidate(15, $dateObject = $$value));
    	let { selectedUnix } = $$props;
    	let { viewUnix } = $$props;

    	function fadeOut(node, { duration, delay }) {
    		return {
    			duration,
    			delay,
    			css: t => {
    				//console.log(t)
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
    	let animateSpeed = $config.animateSpeed;
    	let cachedViewUnix = viewUnix;
    	let transitionDirectionForward = true;
    	const writable_props = ["selectedUnix", "viewUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MonthView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MonthView", $$slots, []);

    	const click_handler = (index, event) => {
    		if (!isDisable(currentViewYear, index + 1)) select(index + 1);
    	};

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(10, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(11, viewUnix = $$props.viewUnix);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		config,
    		dateObject,
    		selectedUnix,
    		viewUnix,
    		fadeOut,
    		fadeIn,
    		isDisable,
    		dispatch,
    		select,
    		visible,
    		animateSpeed,
    		cachedViewUnix,
    		transitionDirectionForward,
    		$config,
    		$dateObject,
    		monthRange,
    		currentMonth,
    		currentSelectedYear,
    		currentViewYear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(10, selectedUnix = $$props.selectedUnix);
    		if ("viewUnix" in $$props) $$invalidate(11, viewUnix = $$props.viewUnix);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("animateSpeed" in $$props) $$invalidate(9, animateSpeed = $$props.animateSpeed);
    		if ("cachedViewUnix" in $$props) $$invalidate(12, cachedViewUnix = $$props.cachedViewUnix);
    		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
    		if ("monthRange" in $$props) $$invalidate(1, monthRange = $$props.monthRange);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("currentSelectedYear" in $$props) $$invalidate(3, currentSelectedYear = $$props.currentSelectedYear);
    		if ("currentViewYear" in $$props) $$invalidate(4, currentViewYear = $$props.currentViewYear);
    	};

    	let monthRange;
    	let currentMonth;
    	let currentSelectedYear;
    	let currentViewYear;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dateObject*/ 32768) {
    			 $$invalidate(1, monthRange = new $dateObject().rangeName().months);
    		}

    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 33792) {
    			 $$invalidate(2, currentMonth = new $dateObject(selectedUnix).month());
    		}

    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 33792) {
    			 $$invalidate(3, currentSelectedYear = new $dateObject(selectedUnix).year());
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 34816) {
    			 $$invalidate(4, currentViewYear = new $dateObject(viewUnix).year());
    		}

    		if ($$self.$$.dirty & /*viewUnix, cachedViewUnix, $config*/ 22528) {
    			 {
    				if (viewUnix > cachedViewUnix) {
    					transitionDirectionForward = true;
    				} else {
    					transitionDirectionForward = false;
    				}

    				$$invalidate(12, cachedViewUnix = viewUnix);

    				if ($config.animate) {
    					$$invalidate(0, visible = false);

    					setTimeout(
    						() => {
    							$$invalidate(0, visible = true);
    						},
    						animateSpeed * 2
    					);
    				}
    			}
    		}
    	};

    	return [
    		visible,
    		monthRange,
    		currentMonth,
    		currentSelectedYear,
    		currentViewYear,
    		fadeOut,
    		fadeIn,
    		isDisable,
    		select,
    		animateSpeed,
    		selectedUnix,
    		viewUnix,
    		cachedViewUnix,
    		transitionDirectionForward,
    		$config,
    		$dateObject,
    		dispatch,
    		click_handler
    	];
    }

    class MonthView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { selectedUnix: 10, viewUnix: 11 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MonthView",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[10] === undefined && !("selectedUnix" in props)) {
    			console.warn("<MonthView> was created without expected prop 'selectedUnix'");
    		}

    		if (/*viewUnix*/ ctx[11] === undefined && !("viewUnix" in props)) {
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

    /* src/components/DateView.svelte generated by Svelte v3.21.0 */
    const file$2 = "src/components/DateView.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (7:4) {#if groupedDay[1]}
    function create_if_block_4(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*groupedDay*/ ctx[0][1];
    	validate_each_argument(each_value_2);
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
    			if (dirty & /*groupedDay*/ 1) {
    				each_value_2 = /*groupedDay*/ ctx[0][1];
    				validate_each_argument(each_value_2);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(7:4) {#if groupedDay[1]}",
    		ctx
    	});

    	return block;
    }

    // (8:5) {#each groupedDay[1] as day}
    function create_each_block_2(ctx) {
    	let th;
    	let span;
    	let t0_value = /*day*/ ctx[26].format("ddd") + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(span, file$2, 9, 7, 177);
    			add_location(th, file$2, 8, 6, 165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, span);
    			append_dev(span, t0);
    			append_dev(th, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay*/ 1 && t0_value !== (t0_value = /*day*/ ctx[26].format("ddd") + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(8:5) {#each groupedDay[1] as day}",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#if visible}
    function create_if_block$2(ctx) {
    	let tbody;
    	let tbody_intro;
    	let tbody_outro;
    	let current;
    	let each_value = /*groupedDay*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tbody, file$2, 18, 3, 301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay, isDisable, checkDate, isSameDate, selectedDay, today, currentViewMonth, selectDate, getHintText, $config*/ 7997) {
    				each_value = /*groupedDay*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
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
    				if (tbody_outro) tbody_outro.end(1);
    				if (!tbody_intro) tbody_intro = create_in_transition(tbody, /*fadeIn*/ ctx[7], { duration: /*animateSpeed*/ ctx[13] });
    				tbody_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (tbody_intro) tbody_intro.invalidate();
    			tbody_outro = create_out_transition(tbody, /*fadeOut*/ ctx[6], { duration: /*animateSpeed*/ ctx[13] });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    			if (detaching && tbody_outro) tbody_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (24:6) {#if week.length > 1}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*week*/ ctx[23];
    	validate_each_argument(each_value_1);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay, isDisable, checkDate, isSameDate, selectedDay, today, currentViewMonth, selectDate, getHintText, $config*/ 7997) {
    				each_value_1 = /*week*/ ctx[23];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    		source: "(24:6) {#if week.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (33:9) {#if day && day.month && day.format && currentViewMonth === day.month()}
    function create_if_block_2(ctx) {
    	let span;
    	let t0_value = /*day*/ ctx[26].format("D") + "";
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let if_block = /*$config*/ ctx[2].calendar[/*$config*/ ctx[2].calendarType].showHint && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "pwt-date-view-text");
    			add_location(span, file$2, 33, 10, 1028);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay*/ 1 && t0_value !== (t0_value = /*day*/ ctx[26].format("D") + "")) set_data_dev(t0, t0_value);

    			if (/*$config*/ ctx[2].calendar[/*$config*/ ctx[2].calendarType].showHint) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
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
    		source: "(33:9) {#if day && day.month && day.format && currentViewMonth === day.month()}",
    		ctx
    	});

    	return block;
    }

    // (37:10) {#if $config.calendar[$config.calendarType].showHint}
    function create_if_block_3(ctx) {
    	let span;
    	let t_value = /*getHintText*/ ctx[12](/*day*/ ctx[26]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "pwt-date-view-hint");
    			add_location(span, file$2, 37, 11, 1184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupedDay*/ 1 && t_value !== (t_value = /*getHintText*/ ctx[12](/*day*/ ctx[26]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(37:10) {#if $config.calendar[$config.calendarType].showHint}",
    		ctx
    	});

    	return block;
    }

    // (25:7) {#each week as day}
    function create_each_block_1(ctx) {
    	let td;
    	let show_if = /*day*/ ctx[26] && /*day*/ ctx[26].month && /*day*/ ctx[26].format && /*currentViewMonth*/ ctx[5] === /*day*/ ctx[26].month();
    	let t;
    	let dispose;
    	let if_block = show_if && create_if_block_2(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[22](/*day*/ ctx[26], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if (if_block) if_block.c();
    			t = space();
    			toggle_class(td, "othermonth", !/*day*/ ctx[26].month);
    			toggle_class(td, "disable", /*isDisable*/ ctx[10](/*day*/ ctx[26]) || !/*checkDate*/ ctx[9](/*day*/ ctx[26]));
    			toggle_class(td, "selected", /*day*/ ctx[26] && /*day*/ ctx[26].isPersianDate && /*isSameDate*/ ctx[8](/*day*/ ctx[26].valueOf(), /*selectedDay*/ ctx[3]));
    			toggle_class(td, "today", /*day*/ ctx[26] && /*day*/ ctx[26].isPersianDate && /*isSameDate*/ ctx[8](/*day*/ ctx[26].valueOf(), /*today*/ ctx[4]));
    			add_location(td, file$2, 25, 8, 506);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, td, anchor);
    			if (if_block) if_block.m(td, null);
    			append_dev(td, t);
    			if (remount) dispose();
    			dispose = listen_dev(td, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*groupedDay, currentViewMonth*/ 33) show_if = /*day*/ ctx[26] && /*day*/ ctx[26].month && /*day*/ ctx[26].format && /*currentViewMonth*/ ctx[5] === /*day*/ ctx[26].month();

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(td, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*groupedDay*/ 1) {
    				toggle_class(td, "othermonth", !/*day*/ ctx[26].month);
    			}

    			if (dirty & /*isDisable, groupedDay, checkDate*/ 1537) {
    				toggle_class(td, "disable", /*isDisable*/ ctx[10](/*day*/ ctx[26]) || !/*checkDate*/ ctx[9](/*day*/ ctx[26]));
    			}

    			if (dirty & /*groupedDay, isSameDate, selectedDay*/ 265) {
    				toggle_class(td, "selected", /*day*/ ctx[26] && /*day*/ ctx[26].isPersianDate && /*isSameDate*/ ctx[8](/*day*/ ctx[26].valueOf(), /*selectedDay*/ ctx[3]));
    			}

    			if (dirty & /*groupedDay, isSameDate, today*/ 273) {
    				toggle_class(td, "today", /*day*/ ctx[26] && /*day*/ ctx[26].isPersianDate && /*isSameDate*/ ctx[8](/*day*/ ctx[26].valueOf(), /*today*/ ctx[4]));
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
    		source: "(25:7) {#each week as day}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#each groupedDay as week, i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let if_block = /*week*/ ctx[23].length > 1 && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(tr, file$2, 22, 5, 438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*week*/ ctx[23].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(22:4) {#each groupedDay as week, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let t;
    	let current;
    	let if_block0 = /*groupedDay*/ ctx[0][1] && create_if_block_4(ctx);
    	let if_block1 = /*visible*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(tr, file$2, 5, 3, 96);
    			add_location(thead, file$2, 4, 2, 85);
    			attr_dev(table, "class", "pwt-month-table next");
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
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			if (if_block0) if_block0.m(tr, null);
    			append_dev(table, t);
    			if (if_block1) if_block1.m(table, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*groupedDay*/ ctx[0][1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(tr, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*visible*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*visible*/ 2) {
    						transition_in(if_block1, 1);
    					}
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $dateObject;
    	let $config;
    	validate_store(dateObject, "dateObject");
    	component_subscribe($$self, dateObject, $$value => $$invalidate(20, $dateObject = $$value));
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(2, $config = $$value));

    	function fadeOut(node, { duration, delay }) {
    		return {
    			duration,
    			delay,
    			css: t => {
    				//console.log(t)
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
    	let animateSpeed = $config.animateSpeed;
    	let cachedViewUnix = viewUnix;
    	let transitionDirectionForward = true;
    	let animateTimer = null;
    	const writable_props = ["viewUnix", "selectedUnix", "todayUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DateView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DateView", $$slots, []);

    	const click_handler = (day, event) => {
    		if (!isDisable(day) && day.month && currentViewMonth === day.month()) selectDate(day.valueOf());
    	};

    	$$self.$set = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(14, viewUnix = $$props.viewUnix);
    		if ("selectedUnix" in $$props) $$invalidate(15, selectedUnix = $$props.selectedUnix);
    		if ("todayUnix" in $$props) $$invalidate(16, todayUnix = $$props.todayUnix);
    	};

    	$$self.$capture_state = () => ({
    		config,
    		dateObject,
    		fadeOut,
    		fadeIn,
    		isSameDate,
    		checkDate,
    		isDisable,
    		viewUnix,
    		selectedUnix,
    		todayUnix,
    		createEventDispatcher,
    		dispatch,
    		selectDate,
    		getHintText,
    		groupedDay,
    		visible,
    		animateSpeed,
    		cachedViewUnix,
    		transitionDirectionForward,
    		animateTimer,
    		$dateObject,
    		$config,
    		selectedDay,
    		today,
    		currentViewMonth
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(14, viewUnix = $$props.viewUnix);
    		if ("selectedUnix" in $$props) $$invalidate(15, selectedUnix = $$props.selectedUnix);
    		if ("todayUnix" in $$props) $$invalidate(16, todayUnix = $$props.todayUnix);
    		if ("groupedDay" in $$props) $$invalidate(0, groupedDay = $$props.groupedDay);
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("animateSpeed" in $$props) $$invalidate(13, animateSpeed = $$props.animateSpeed);
    		if ("cachedViewUnix" in $$props) $$invalidate(17, cachedViewUnix = $$props.cachedViewUnix);
    		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
    		if ("animateTimer" in $$props) $$invalidate(19, animateTimer = $$props.animateTimer);
    		if ("selectedDay" in $$props) $$invalidate(3, selectedDay = $$props.selectedDay);
    		if ("today" in $$props) $$invalidate(4, today = $$props.today);
    		if ("currentViewMonth" in $$props) $$invalidate(5, currentViewMonth = $$props.currentViewMonth);
    	};

    	let selectedDay;
    	let today;
    	let currentViewMonth;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 1081344) {
    			 $$invalidate(3, selectedDay = new $dateObject(selectedUnix).startOf("day"));
    		}

    		if ($$self.$$.dirty & /*$dateObject, todayUnix*/ 1114112) {
    			 $$invalidate(4, today = new $dateObject(todayUnix));
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 1064960) {
    			 $$invalidate(5, currentViewMonth = new $dateObject(viewUnix).month());
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix, $config, groupedDay, cachedViewUnix, animateTimer*/ 1720325) {
    			 {
    				$$invalidate(0, groupedDay = []);
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
    						$$invalidate(0, groupedDay[weekindex] = [], groupedDay);
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

    				if ($config.animate && new $dateObject(viewUnix).month() !== new $dateObject(cachedViewUnix).month()) {
    					$$invalidate(1, visible = false);
    					clearTimeout(animateTimer);

    					$$invalidate(19, animateTimer = setTimeout(
    						() => {
    							$$invalidate(1, visible = true);
    						},
    						animateSpeed * 2
    					));
    				}

    				$$invalidate(17, cachedViewUnix = viewUnix);
    			}
    		}
    	};

    	return [
    		groupedDay,
    		visible,
    		$config,
    		selectedDay,
    		today,
    		currentViewMonth,
    		fadeOut,
    		fadeIn,
    		isSameDate,
    		checkDate,
    		isDisable,
    		selectDate,
    		getHintText,
    		animateSpeed,
    		viewUnix,
    		selectedUnix,
    		todayUnix,
    		cachedViewUnix,
    		transitionDirectionForward,
    		animateTimer,
    		$dateObject,
    		dispatch,
    		click_handler
    	];
    }

    class DateView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			viewUnix: 14,
    			selectedUnix: 15,
    			todayUnix: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateView",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewUnix*/ ctx[14] === undefined && !("viewUnix" in props)) {
    			console.warn("<DateView> was created without expected prop 'viewUnix'");
    		}

    		if (/*selectedUnix*/ ctx[15] === undefined && !("selectedUnix" in props)) {
    			console.warn("<DateView> was created without expected prop 'selectedUnix'");
    		}

    		if (/*todayUnix*/ ctx[16] === undefined && !("todayUnix" in props)) {
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

    /* src/components/TimeView.svelte generated by Svelte v3.21.0 */
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
    			t1 = text(/*currentHour*/ ctx[0]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z");
    			add_location(path0, file$3, 12, 5, 349);
    			attr_dev(svg0, "width", "12");
    			attr_dev(svg0, "height", "12");
    			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
    			add_location(svg0, file$3, 8, 4, 268);
    			attr_dev(button0, "class", "pwt-date-time-arrow");
    			add_location(button0, file$3, 5, 3, 175);
    			add_location(span, file$3, 17, 3, 634);
    			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
    			add_location(path1, file$3, 27, 5, 850);
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "12");
    			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
    			add_location(svg1, file$3, 23, 4, 770);
    			attr_dev(button1, "class", "pwt-date-time-arrow");
    			add_location(button1, file$3, 20, 3, 675);
    			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-hour");
    			add_location(div, file$3, 2, 2, 69);
    		},
    		m: function mount(target, anchor, remount) {
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
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[13], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[14], false, false, false),
    				listen_dev(div, "wheel", /*wheel_handler*/ ctx[15], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentHour*/ 1) set_data_dev(t1, /*currentHour*/ ctx[0]);
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

    // (35:1) {#if $config.timePicker.minute.enabled}
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
    			t1 = text(/*currentMinute*/ ctx[1]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z");
    			add_location(path0, file$3, 45, 5, 1508);
    			attr_dev(svg0, "width", "12");
    			attr_dev(svg0, "height", "12");
    			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
    			add_location(svg0, file$3, 41, 4, 1427);
    			attr_dev(button0, "class", "pwt-date-time-arrow");
    			add_location(button0, file$3, 38, 3, 1332);
    			add_location(span, file$3, 50, 3, 1793);
    			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
    			add_location(path1, file$3, 60, 5, 2013);
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "12");
    			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
    			add_location(svg1, file$3, 56, 4, 1933);
    			attr_dev(button1, "class", "pwt-date-time-arrow");
    			add_location(button1, file$3, 53, 3, 1836);
    			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-minute");
    			add_location(div, file$3, 35, 2, 1222);
    		},
    		m: function mount(target, anchor, remount) {
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
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler_2*/ ctx[16], false, false, false),
    				listen_dev(button1, "click", /*click_handler_3*/ ctx[17], false, false, false),
    				listen_dev(div, "wheel", /*wheel_handler_1*/ ctx[18], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentMinute*/ 2) set_data_dev(t1, /*currentMinute*/ ctx[1]);
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
    		source: "(35:1) {#if $config.timePicker.minute.enabled}",
    		ctx
    	});

    	return block;
    }

    // (68:1) {#if $config.timePicker.second.enabled}
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
    			t1 = text(/*currentSecond*/ ctx[2]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z");
    			add_location(path0, file$3, 78, 5, 2671);
    			attr_dev(svg0, "width", "12");
    			attr_dev(svg0, "height", "12");
    			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
    			add_location(svg0, file$3, 74, 4, 2590);
    			attr_dev(button0, "class", "pwt-date-time-arrow");
    			add_location(button0, file$3, 71, 3, 2495);
    			add_location(span, file$3, 83, 3, 2956);
    			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
    			add_location(path1, file$3, 93, 5, 3176);
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "12");
    			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
    			add_location(svg1, file$3, 89, 4, 3096);
    			attr_dev(button1, "class", "pwt-date-time-arrow");
    			add_location(button1, file$3, 86, 3, 2999);
    			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-second");
    			add_location(div, file$3, 68, 2, 2385);
    		},
    		m: function mount(target, anchor, remount) {
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
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler_4*/ ctx[19], false, false, false),
    				listen_dev(button1, "click", /*click_handler_5*/ ctx[20], false, false, false),
    				listen_dev(div, "wheel", /*wheel_handler_2*/ ctx[21], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentSecond*/ 4) set_data_dev(t1, /*currentSecond*/ ctx[2]);
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
    		source: "(68:1) {#if $config.timePicker.second.enabled}",
    		ctx
    	});

    	return block;
    }

    // (101:1) {#if $config.timePicker.meridian.enabled}
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
    			t1 = text(/*currentMeridian*/ ctx[3]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z");
    			add_location(path0, file$3, 111, 5, 3841);
    			attr_dev(svg0, "width", "12");
    			attr_dev(svg0, "height", "12");
    			attr_dev(svg0, "viewBox", "0 0 240.811 240.811");
    			add_location(svg0, file$3, 107, 4, 3760);
    			attr_dev(button0, "class", "pwt-date-time-arrow");
    			add_location(button0, file$3, 104, 3, 3664);
    			add_location(span, file$3, 116, 3, 4126);
    			attr_dev(path1, "d", "M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z");
    			add_location(path1, file$3, 126, 5, 4350);
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "12");
    			attr_dev(svg1, "viewBox", "0 0 240.811 240.811");
    			add_location(svg1, file$3, 122, 4, 4270);
    			attr_dev(button1, "class", "pwt-date-time-arrow");
    			add_location(button1, file$3, 119, 3, 4171);
    			attr_dev(div, "class", "pwt-date-time-section pwt-date-time-meridian");
    			add_location(div, file$3, 101, 2, 3550);
    		},
    		m: function mount(target, anchor, remount) {
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
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler_6*/ ctx[22], false, false, false),
    				listen_dev(button1, "click", /*click_handler_7*/ ctx[23], false, false, false),
    				listen_dev(div, "wheel", /*wheel_handler_3*/ ctx[24], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentMeridian*/ 8) set_data_dev(t1, /*currentMeridian*/ ctx[3]);
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
    		source: "(101:1) {#if $config.timePicker.meridian.enabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let if_block0 = /*$config*/ ctx[4].timePicker.hour.enabled && create_if_block_3$1(ctx);
    	let if_block1 = /*$config*/ ctx[4].timePicker.minute.enabled && create_if_block_2$1(ctx);
    	let if_block2 = /*$config*/ ctx[4].timePicker.second.enabled && create_if_block_1$1(ctx);
    	let if_block3 = /*$config*/ ctx[4].timePicker.meridian.enabled && create_if_block$3(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*$config*/ ctx[4].timePicker.hour.enabled) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$config*/ ctx[4].timePicker.minute.enabled) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$config*/ ctx[4].timePicker.second.enabled) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*$config*/ ctx[4].timePicker.meridian.enabled) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
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
    	component_subscribe($$self, dateObject, $$value => $$invalidate(8, $dateObject = $$value));
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(4, $config = $$value));
    	const dispatch = createEventDispatcher();
    	let { selectedUnix } = $$props;
    	let tempDate = $dateObject;

    	const handleWheel = (e, timeKey) => {
    		if ($config.navigator.scroll.enabled) {
    			if (e.deltaY > 0 || e.deltaX > 0) {
    				updateTime(timeKey, "down");
    			}

    			if (e.deltaY < 0 || e.deltaX < 0) {
    				updateTime(timeKey, "up");
    			}
    		}
    	};

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

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TimeView", $$slots, []);
    	const click_handler = () => updateTime("hour", "up");
    	const click_handler_1 = () => updateTime("hour", "down");
    	const wheel_handler = e => handleWheel(e, "hour");
    	const click_handler_2 = () => updateTime("minute", "up");
    	const click_handler_3 = () => updateTime("minute", "down");
    	const wheel_handler_1 = e => handleWheel(e, "minute");
    	const click_handler_4 = () => updateTime("second", "up");
    	const click_handler_5 = () => updateTime("second", "down");
    	const wheel_handler_2 = e => handleWheel(e, "second");
    	const click_handler_6 = () => updateTime("meridian", "up");
    	const click_handler_7 = () => updateTime("meridian", "down");
    	const wheel_handler_3 = e => handleWheel(e, "meridian");

    	$$self.$set = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(7, selectedUnix = $$props.selectedUnix);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		config,
    		dateObject,
    		createEventDispatcher,
    		dispatch,
    		selectedUnix,
    		tempDate,
    		handleWheel,
    		updateTime,
    		selectDate,
    		currentHour,
    		$dateObject,
    		currentMinute,
    		currentSecond,
    		currentMeridian,
    		currentGregorianMeridian,
    		$config
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedUnix" in $$props) $$invalidate(7, selectedUnix = $$props.selectedUnix);
    		if ("tempDate" in $$props) $$invalidate(11, tempDate = $$props.tempDate);
    		if ("currentHour" in $$props) $$invalidate(0, currentHour = $$props.currentHour);
    		if ("currentMinute" in $$props) $$invalidate(1, currentMinute = $$props.currentMinute);
    		if ("currentSecond" in $$props) $$invalidate(2, currentSecond = $$props.currentSecond);
    		if ("currentMeridian" in $$props) $$invalidate(3, currentMeridian = $$props.currentMeridian);
    		if ("currentGregorianMeridian" in $$props) currentGregorianMeridian = $$props.currentGregorianMeridian;
    	};

    	let currentHour;
    	let currentMinute;
    	let currentSecond;
    	let currentMeridian;
    	let currentGregorianMeridian;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 384) {
    			 $$invalidate(0, currentHour = new $dateObject(selectedUnix).format("hh"));
    		}

    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 384) {
    			 $$invalidate(1, currentMinute = new $dateObject(selectedUnix).format("mm"));
    		}

    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 384) {
    			 $$invalidate(2, currentSecond = new $dateObject(selectedUnix).format("ss"));
    		}

    		if ($$self.$$.dirty & /*$dateObject, selectedUnix*/ 384) {
    			 $$invalidate(3, currentMeridian = new $dateObject(selectedUnix).format("a"));
    		}

    		if ($$self.$$.dirty & /*selectedUnix*/ 128) {
    			 currentGregorianMeridian = new tempDate(selectedUnix).toLocale("en").format("a");
    		}
    	};

    	return [
    		currentHour,
    		currentMinute,
    		currentSecond,
    		currentMeridian,
    		$config,
    		handleWheel,
    		updateTime,
    		selectedUnix,
    		$dateObject,
    		currentGregorianMeridian,
    		dispatch,
    		tempDate,
    		selectDate,
    		click_handler,
    		click_handler_1,
    		wheel_handler,
    		click_handler_2,
    		click_handler_3,
    		wheel_handler_1,
    		click_handler_4,
    		click_handler_5,
    		wheel_handler_2,
    		click_handler_6,
    		click_handler_7,
    		wheel_handler_3
    	];
    }

    class TimeView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { selectedUnix: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeView",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedUnix*/ ctx[7] === undefined && !("selectedUnix" in props)) {
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

    /* src/components/Navigator.svelte generated by Svelte v3.21.0 */
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button0, anchor);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*next*/ ctx[10], false, false, false),
    				listen_dev(button1, "click", /*prev*/ ctx[11], false, false, false)
    			];
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
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let span_intro;
    	let span_outro;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*visualStartYear*/ ctx[2]);
    			t1 = text(" - ");
    			t2 = text(/*visualEndYear*/ ctx[3]);
    			attr_dev(span, "class", "pwt-date-navigator-text");
    			add_location(span, file$4, 31, 3, 1177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*visualStartYear*/ 4) set_data_dev(t0, /*visualStartYear*/ ctx[2]);
    			if (!current || dirty & /*visualEndYear*/ 8) set_data_dev(t2, /*visualEndYear*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (span_outro) span_outro.end(1);
    				if (!span_intro) span_intro = create_in_transition(span, /*fadeIn*/ ctx[8], { duration: /*animateSpeed*/ ctx[12] });
    				span_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (span_intro) span_intro.invalidate();
    			span_outro = create_out_transition(span, /*fadeOut*/ ctx[7], { duration: /*animateSpeed*/ ctx[12] });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_outro) span_outro.end();
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
    			t = text(/*monthViewText*/ ctx[6]);
    			attr_dev(button, "class", "pwt-date-navigator-button");
    			add_location(button, file$4, 39, 3, 1414);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[25], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*monthViewText*/ 64) set_data_dev(t, /*monthViewText*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (button_outro) button_outro.end(1);
    				if (!button_intro) button_intro = create_in_transition(button, /*fadeIn*/ ctx[8], { duration: /*animateSpeed*/ ctx[12] });
    				button_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (button_intro) button_intro.invalidate();
    			button_outro = create_out_transition(button, /*fadeOut*/ ctx[7], { duration: /*animateSpeed*/ ctx[12] });
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
    			t = text(/*dateViewText*/ ctx[4]);
    			attr_dev(button, "class", "pwt-date-navigator-button");
    			add_location(button, file$4, 48, 3, 1675);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[26], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*dateViewText*/ 16) set_data_dev(t, /*dateViewText*/ ctx[4]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (button_outro) button_outro.end(1);

    				if (!button_intro) button_intro = create_in_transition(button, /*fadeIn*/ ctx[8], {
    					duration: /*animateSpeed*/ ctx[12],
    					delay: 10
    				});

    				button_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (button_intro) button_intro.invalidate();
    			button_outro = create_out_transition(button, /*fadeOut*/ ctx[7], { duration: /*animateSpeed*/ ctx[12] });
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
    function create_if_block$4(ctx) {
    	let button;
    	let t;
    	let button_intro;
    	let button_outro;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*timeViewText*/ ctx[5]);
    			attr_dev(button, "class", "pwt-date-navigator-button");
    			add_location(button, file$4, 57, 3, 1951);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[27], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*timeViewText*/ 32) set_data_dev(t, /*timeViewText*/ ctx[5]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (button_outro) button_outro.end(1);

    				if (!button_intro) button_intro = create_in_transition(button, /*fadeIn*/ ctx[8], {
    					duration: /*animateSpeed*/ ctx[12],
    					delay: 10
    				});

    				button_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (button_intro) button_intro.invalidate();
    			button_outro = create_out_transition(button, /*fadeOut*/ ctx[7], { duration: /*animateSpeed*/ ctx[12] });
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
    		id: create_if_block$4.name,
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
    	let if_block0 = /*viewMode*/ ctx[0] !== "time" && create_if_block_4$1(ctx);
    	let if_block1 = /*viewMode*/ ctx[0] === "year" && /*visible*/ ctx[1] && create_if_block_3$2(ctx);
    	let if_block2 = /*viewMode*/ ctx[0] === "month" && /*visible*/ ctx[1] && create_if_block_2$2(ctx);
    	let if_block3 = /*viewMode*/ ctx[0] === "day" && /*visible*/ ctx[1] && create_if_block_1$2(ctx);
    	let if_block4 = /*viewMode*/ ctx[0] === "time" && /*visible*/ ctx[1] && create_if_block$4(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*viewMode*/ ctx[0] !== "time") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*viewMode*/ ctx[0] === "year" && /*visible*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*viewMode, visible*/ 3) {
    						transition_in(if_block1, 1);
    					}
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

    			if (/*viewMode*/ ctx[0] === "month" && /*visible*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*viewMode, visible*/ 3) {
    						transition_in(if_block2, 1);
    					}
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

    			if (/*viewMode*/ ctx[0] === "day" && /*visible*/ ctx[1]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*viewMode, visible*/ 3) {
    						transition_in(if_block3, 1);
    					}
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

    			if (/*viewMode*/ ctx[0] === "time" && /*visible*/ ctx[1]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*viewMode, visible*/ 3) {
    						transition_in(if_block4, 1);
    					}
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

    function instance$4($$self, $$props, $$invalidate) {
    	let $dateObject;
    	let $config;
    	validate_store(dateObject, "dateObject");
    	component_subscribe($$self, dateObject, $$value => $$invalidate(18, $dateObject = $$value));
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(21, $config = $$value));

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

    	function today(payload) {
    		dispatch("today", payload);
    	}

    	function next(payload) {
    		dispatch("next", payload);
    	}

    	function prev(payload) {
    		dispatch("prev", payload);
    	}

    	let startYear;
    	let visible = true;
    	let animateSpeed = $config.animateSpeed;
    	let cachedViewUnix = viewUnix;
    	let transitionDirectionForward = true;
    	const writable_props = ["viewUnix", "viewMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigator> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navigator", $$slots, []);
    	const click_handler = () => setViewMode("year");
    	const click_handler_1 = () => setViewMode("month");
    	const click_handler_2 = () => setViewMode("date");

    	$$self.$set = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(13, viewUnix = $$props.viewUnix);
    		if ("viewMode" in $$props) $$invalidate(0, viewMode = $$props.viewMode);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		config,
    		dateObject,
    		fadeOut,
    		fadeIn,
    		viewUnix,
    		viewMode,
    		dispatch,
    		setViewMode,
    		today,
    		next,
    		prev,
    		startYear,
    		visible,
    		animateSpeed,
    		cachedViewUnix,
    		transitionDirectionForward,
    		selectedYear,
    		$dateObject,
    		visualStartYear,
    		visualEndYear,
    		selectedMonth,
    		selectedDate,
    		dateViewText,
    		$config,
    		timeViewText,
    		monthViewText,
    		yearViewText
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(13, viewUnix = $$props.viewUnix);
    		if ("viewMode" in $$props) $$invalidate(0, viewMode = $$props.viewMode);
    		if ("startYear" in $$props) startYear = $$props.startYear;
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("animateSpeed" in $$props) $$invalidate(12, animateSpeed = $$props.animateSpeed);
    		if ("cachedViewUnix" in $$props) $$invalidate(15, cachedViewUnix = $$props.cachedViewUnix);
    		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
    		if ("selectedYear" in $$props) $$invalidate(17, selectedYear = $$props.selectedYear);
    		if ("visualStartYear" in $$props) $$invalidate(2, visualStartYear = $$props.visualStartYear);
    		if ("visualEndYear" in $$props) $$invalidate(3, visualEndYear = $$props.visualEndYear);
    		if ("selectedMonth" in $$props) selectedMonth = $$props.selectedMonth;
    		if ("selectedDate" in $$props) selectedDate = $$props.selectedDate;
    		if ("dateViewText" in $$props) $$invalidate(4, dateViewText = $$props.dateViewText);
    		if ("timeViewText" in $$props) $$invalidate(5, timeViewText = $$props.timeViewText);
    		if ("monthViewText" in $$props) $$invalidate(6, monthViewText = $$props.monthViewText);
    		if ("yearViewText" in $$props) yearViewText = $$props.yearViewText;
    	};

    	let selectedYear;
    	let visualStartYear;
    	let visualEndYear;
    	let selectedMonth;
    	let selectedDate;
    	let dateViewText;
    	let timeViewText;
    	let monthViewText;
    	let yearViewText;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 270336) {
    			 $$invalidate(17, selectedYear = new $dateObject(viewUnix).year());
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 270336) {
    			 $$invalidate(2, visualStartYear = new $dateObject(viewUnix).format("YYYY"));
    		}

    		if ($$self.$$.dirty & /*$dateObject, selectedYear*/ 393216) {
    			 $$invalidate(3, visualEndYear = new $dateObject([selectedYear + 12]).format("YYYY"));
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 270336) {
    			 selectedMonth = new $dateObject(viewUnix).format("MMMM");
    		}

    		if ($$self.$$.dirty & /*$dateObject, viewUnix*/ 270336) {
    			 selectedDate = new $dateObject(viewUnix).format("DD");
    		}

    		if ($$self.$$.dirty & /*$config, viewUnix, $dateObject*/ 2367488) {
    			 $$invalidate(4, dateViewText = $config.dayPicker.titleFormatter(viewUnix, $dateObject));
    		}

    		if ($$self.$$.dirty & /*$config, viewUnix, $dateObject*/ 2367488) {
    			 $$invalidate(5, timeViewText = $config.timePicker.titleFormatter(viewUnix, $dateObject));
    		}

    		if ($$self.$$.dirty & /*$config, viewUnix, $dateObject*/ 2367488) {
    			 $$invalidate(6, monthViewText = $config.monthPicker.titleFormatter(viewUnix, $dateObject));
    		}

    		if ($$self.$$.dirty & /*$config, viewUnix, $dateObject*/ 2367488) {
    			 yearViewText = $config.yearPicker.titleFormatter(viewUnix, $dateObject);
    		}

    		if ($$self.$$.dirty & /*viewUnix, selectedYear, cachedViewUnix, $config*/ 2269184) {
    			 {
    				if (viewUnix) {
    					startYear = selectedYear - selectedYear % 12;

    					if (viewUnix > cachedViewUnix) {
    						transitionDirectionForward = true;
    					} else {
    						transitionDirectionForward = false;
    					}

    					$$invalidate(15, cachedViewUnix = viewUnix);

    					if ($config.animate) {
    						$$invalidate(1, visible = false);

    						setTimeout(
    							() => {
    								$$invalidate(1, visible = true);
    							},
    							animateSpeed * 2
    						);
    					}
    				}
    			}
    		}
    	};

    	return [
    		viewMode,
    		visible,
    		visualStartYear,
    		visualEndYear,
    		dateViewText,
    		timeViewText,
    		monthViewText,
    		fadeOut,
    		fadeIn,
    		setViewMode,
    		next,
    		prev,
    		animateSpeed,
    		viewUnix,
    		startYear,
    		cachedViewUnix,
    		transitionDirectionForward,
    		selectedYear,
    		$dateObject,
    		selectedMonth,
    		selectedDate,
    		$config,
    		yearViewText,
    		dispatch,
    		today,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Navigator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { viewUnix: 13, viewMode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigator",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewUnix*/ ctx[13] === undefined && !("viewUnix" in props)) {
    			console.warn("<Navigator> was created without expected prop 'viewUnix'");
    		}

    		if (/*viewMode*/ ctx[0] === undefined && !("viewMode" in props)) {
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

    /* src/components/Infobox.svelte generated by Svelte v3.21.0 */
    const file$5 = "src/components/Infobox.svelte";

    // (3:1) {#if visible}
    function create_if_block_1$3(ctx) {
    	let div;
    	let span;
    	let t;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(/*selectedDate*/ ctx[3]);
    			attr_dev(span, "class", "pwt-date-info--sub-title");
    			add_location(span, file$5, 6, 3, 217);
    			add_location(div, file$5, 3, 2, 96);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*selectedDate*/ 8) set_data_dev(t, /*selectedDate*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				if (!div_intro) div_intro = create_in_transition(div, /*fadeIn*/ ctx[6], {
    					duration: /*animateSpeed*/ ctx[7],
    					offset: 10
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();

    			div_outro = create_out_transition(div, /*fadeOut*/ ctx[5], {
    				duration: /*animateSpeed*/ ctx[7],
    				offset: 10
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(3:1) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if $config.timePicker.hour.enabled}
    function create_if_block$5(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*selectedTime*/ ctx[4]);
    			attr_dev(span, "class", "pwt-date-info--time");
    			add_location(span, file$5, 12, 3, 346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedTime*/ 16) set_data_dev(t, /*selectedTime*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(12:2) {#if $config.timePicker.hour.enabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*visible*/ ctx[0] && create_if_block_1$3(ctx);
    	let if_block1 = /*$config*/ ctx[2].timePicker.hour.enabled && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "pwt-date-info--title");
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
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (/*visible*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$config*/ ctx[2].timePicker.hour.enabled) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $config;
    	let $dateObject;
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(2, $config = $$value));
    	validate_store(dateObject, "dateObject");
    	component_subscribe($$self, dateObject, $$value => $$invalidate(12, $dateObject = $$value));

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
    	let visible = true;
    	let animateSpeed = $config.animateSpeed;
    	let cachedSelectedUnix = viewUnix;
    	let transitionDirectionForward = true;
    	const writable_props = ["viewUnix", "selectedUnix"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Infobox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Infobox", $$slots, []);

    	$$self.$set = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(8, viewUnix = $$props.viewUnix);
    		if ("selectedUnix" in $$props) $$invalidate(9, selectedUnix = $$props.selectedUnix);
    	};

    	$$self.$capture_state = () => ({
    		config,
    		dateObject,
    		fadeOut,
    		fadeIn,
    		viewUnix,
    		selectedUnix,
    		oldotherPart,
    		visible,
    		animateSpeed,
    		cachedSelectedUnix,
    		transitionDirectionForward,
    		title,
    		$config,
    		$dateObject,
    		selectedDate,
    		selectedTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(8, viewUnix = $$props.viewUnix);
    		if ("selectedUnix" in $$props) $$invalidate(9, selectedUnix = $$props.selectedUnix);
    		if ("oldotherPart" in $$props) oldotherPart = $$props.oldotherPart;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("animateSpeed" in $$props) $$invalidate(7, animateSpeed = $$props.animateSpeed);
    		if ("cachedSelectedUnix" in $$props) $$invalidate(10, cachedSelectedUnix = $$props.cachedSelectedUnix);
    		if ("transitionDirectionForward" in $$props) transitionDirectionForward = $$props.transitionDirectionForward;
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("selectedDate" in $$props) $$invalidate(3, selectedDate = $$props.selectedDate);
    		if ("selectedTime" in $$props) $$invalidate(4, selectedTime = $$props.selectedTime);
    	};

    	let title;
    	let selectedDate;
    	let selectedTime;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$config, selectedUnix, $dateObject*/ 4612) {
    			 $$invalidate(1, title = $config.infobox.titleFormatter(selectedUnix, $dateObject));
    		}

    		if ($$self.$$.dirty & /*$config, selectedUnix, $dateObject*/ 4612) {
    			 $$invalidate(3, selectedDate = $config.infobox.selectedDateFormatter(selectedUnix, $dateObject));
    		}

    		if ($$self.$$.dirty & /*$config, selectedUnix, $dateObject*/ 4612) {
    			 $$invalidate(4, selectedTime = $config.infobox.selectedTimeFormatter(selectedUnix, $dateObject));
    		}

    		if ($$self.$$.dirty & /*selectedDate, selectedUnix, cachedSelectedUnix, $config*/ 1548) {
    			 if (selectedDate) {
    				if (selectedUnix > cachedSelectedUnix) {
    					transitionDirectionForward = true;
    				} else {
    					transitionDirectionForward = false;
    				}

    				$$invalidate(10, cachedSelectedUnix = selectedUnix);

    				if ($config.animate) {
    					$$invalidate(0, visible = false);

    					setTimeout(
    						() => {
    							$$invalidate(0, visible = true);
    						},
    						animateSpeed * 2
    					);
    				}
    			}
    		}
    	};

    	return [
    		visible,
    		title,
    		$config,
    		selectedDate,
    		selectedTime,
    		fadeOut,
    		fadeIn,
    		animateSpeed,
    		viewUnix,
    		selectedUnix
    	];
    }

    class Infobox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { viewUnix: 8, selectedUnix: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Infobox",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewUnix*/ ctx[8] === undefined && !("viewUnix" in props)) {
    			console.warn("<Infobox> was created without expected prop 'viewUnix'");
    		}

    		if (/*selectedUnix*/ ctx[9] === undefined && !("selectedUnix" in props)) {
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

    /* src/components/Toolbox.svelte generated by Svelte v3.21.0 */
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[13], false, false, false);
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[14], false, false, false);
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*today*/ ctx[4], false, false, false);
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
    function create_if_block_1$4(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*$config*/ ctx[1].calendarType === "persian" && create_if_block_3$3(ctx);
    	let if_block1 = /*$config*/ ctx[1].calendarType === "gregorian" && create_if_block_2$3(ctx);

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
    		p: function update(ctx, dirty) {
    			if (/*$config*/ ctx[1].calendarType === "persian") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$3(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$config*/ ctx[1].calendarType === "gregorian") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
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
    		id: create_if_block_1$4.name,
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[15], false, false, false);
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[16], false, false, false);
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
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler_4*/ ctx[17], false, false, false);
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
    	let if_block0 = /*viewMode*/ ctx[0] !== "time" && create_if_block_6(ctx);
    	let if_block1 = /*viewMode*/ ctx[0] === "time" && create_if_block_5(ctx);
    	let if_block2 = /*$config*/ ctx[1].toolbox.todayButton.enabled && create_if_block_4$2(ctx);
    	let if_block3 = /*$config*/ ctx[1].toolbox.calendarSwitch.enabled && create_if_block_1$4(ctx);
    	let if_block4 = /*$config*/ ctx[1].toolbox.submitButton.enabled && create_if_block$6(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*viewMode*/ ctx[0] !== "time") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*viewMode*/ ctx[0] === "time") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$config*/ ctx[1].toolbox.todayButton.enabled) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$2(ctx);
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*$config*/ ctx[1].toolbox.calendarSwitch.enabled) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$4(ctx);
    					if_block3.c();
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*$config*/ ctx[1].toolbox.submitButton.enabled) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
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
    	component_subscribe($$self, config, $$value => $$invalidate(1, $config = $$value));
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

    	function next(payload) {
    		dispatch("next", payload);
    	}

    	function prev(payload) {
    		dispatch("prev", payload);
    	}

    	let yearRange;
    	let startYear;
    	const writable_props = ["viewUnix", "viewMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Toolbox", $$slots, []);
    	const click_handler = () => setViewMode("time");
    	const click_handler_1 = () => setViewMode("day");
    	const click_handler_2 = () => setcalendar("gregorian");
    	const click_handler_3 = () => setcalendar("persian");

    	const click_handler_4 = () => {
    		alert("Please implement submit button");
    	};

    	$$self.$set = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(5, viewUnix = $$props.viewUnix);
    		if ("viewMode" in $$props) $$invalidate(0, viewMode = $$props.viewMode);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		config,
    		viewUnix,
    		viewMode,
    		dispatch,
    		setViewMode,
    		setcalendar,
    		today,
    		next,
    		prev,
    		yearRange,
    		startYear,
    		selectedYear,
    		selectedMonth,
    		$config
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewUnix" in $$props) $$invalidate(5, viewUnix = $$props.viewUnix);
    		if ("viewMode" in $$props) $$invalidate(0, viewMode = $$props.viewMode);
    		if ("yearRange" in $$props) $$invalidate(6, yearRange = $$props.yearRange);
    		if ("startYear" in $$props) $$invalidate(7, startYear = $$props.startYear);
    		if ("selectedYear" in $$props) $$invalidate(8, selectedYear = $$props.selectedYear);
    		if ("selectedMonth" in $$props) selectedMonth = $$props.selectedMonth;
    	};

    	let selectedYear;
    	let selectedMonth;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*viewUnix*/ 32) {
    			 $$invalidate(8, selectedYear = new persianDate(viewUnix).year());
    		}

    		if ($$self.$$.dirty & /*viewUnix*/ 32) {
    			 selectedMonth = new persianDate(viewUnix).format("MMMM");
    		}

    		if ($$self.$$.dirty & /*selectedYear, yearRange, startYear*/ 448) {
    			 {
    				$$invalidate(6, yearRange = []);
    				$$invalidate(7, startYear = selectedYear - selectedYear % 12);
    				let i = 0;

    				while (i < 12) {
    					yearRange.push(startYear + i);
    					i++;
    				}
    			}
    		}
    	};

    	return [
    		viewMode,
    		$config,
    		setViewMode,
    		setcalendar,
    		today,
    		viewUnix,
    		yearRange,
    		startYear,
    		selectedYear,
    		selectedMonth,
    		dispatch,
    		next,
    		prev,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Toolbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { viewUnix: 5, viewMode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolbox",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewUnix*/ ctx[5] === undefined && !("viewUnix" in props)) {
    			console.warn("<Toolbox> was created without expected prop 'viewUnix'");
    		}

    		if (/*viewMode*/ ctx[0] === undefined && !("viewMode" in props)) {
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

    /* src/components/Input.svelte generated by Svelte v3.21.0 */

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
    	component_subscribe($$self, config, $$value => $$invalidate(3, $config = $$value));
    	validate_store(isDirty, "isDirty");
    	component_subscribe($$self, isDirty, $$value => $$invalidate(4, $isDirty = $$value));
    	validate_store(selectedUnix, "selectedUnix");
    	component_subscribe($$self, selectedUnix, $$value => $$invalidate(5, $selectedUnix = $$value));
    	validate_store(dateObject, "dateObject");
    	component_subscribe($$self, dateObject, $$value => $$invalidate(6, $dateObject = $$value));
    	let { originalContainer } = $$props;
    	let { plotarea } = $$props;

    	let { setPlotPostion = function () {
    		let configLeft = $config.position !== "auto" ? $config.position[0] : 0;
    		let configTop = $config.position !== "auto" ? $config.position[1] : 0;

    		let set = () => {
    			if (plotarea) {
    				if (originalContainer && originalContainer.tagName === "INPUT") {
    					$$invalidate(1, plotarea.style.position = "absolute", plotarea);
    					$$invalidate(1, plotarea.style.left = originalContainer.offsetLeft + configLeft + "px", plotarea);
    					$$invalidate(1, plotarea.style.top = parseInt(originalContainer.offsetTop) + configTop + parseInt(originalContainer.clientHeight) + document.body.scrollTop + "px", plotarea);
    				}
    			}
    		};

    		set();

    		setTimeout(
    			() => {
    				set();
    			},
    			0
    		);
    	} } = $$props;

    	const dispatch = createEventDispatcher();

    	let initInputEvents = function () {
    		let bodyListener = e => {
    			if (plotarea && plotarea.contains(e.target) || e.target == originalContainer || e.target.className === "pwt-date-navigator-button" || e.target.className === "pwt-date-toolbox-button") ; else {
    				dispatch("setvisibility", false);
    				document.removeEventListener("click", bodyListener);
    			}
    		};

    		if (originalContainer && originalContainer.tagName === "INPUT") {
    			originalContainer.addEventListener("focus", () => {
    				setPlotPostion();
    				dispatch("setvisibility", true);
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
    				$$invalidate(0, originalContainer.value = selected, originalContainer);
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

    	const writable_props = ["originalContainer", "plotarea", "setPlotPostion"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	$$self.$set = $$props => {
    		if ("originalContainer" in $$props) $$invalidate(0, originalContainer = $$props.originalContainer);
    		if ("plotarea" in $$props) $$invalidate(1, plotarea = $$props.plotarea);
    		if ("setPlotPostion" in $$props) $$invalidate(2, setPlotPostion = $$props.setPlotPostion);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		isDirty,
    		selectedUnix,
    		config,
    		dateObject,
    		originalContainer,
    		plotarea,
    		setPlotPostion,
    		dispatch,
    		initInputEvents,
    		initInputObserver,
    		updateInputs,
    		getInputInitialValue,
    		$config,
    		$isDirty,
    		$selectedUnix,
    		$dateObject
    	});

    	$$self.$inject_state = $$props => {
    		if ("originalContainer" in $$props) $$invalidate(0, originalContainer = $$props.originalContainer);
    		if ("plotarea" in $$props) $$invalidate(1, plotarea = $$props.plotarea);
    		if ("setPlotPostion" in $$props) $$invalidate(2, setPlotPostion = $$props.setPlotPostion);
    		if ("initInputEvents" in $$props) initInputEvents = $$props.initInputEvents;
    		if ("initInputObserver" in $$props) initInputObserver = $$props.initInputObserver;
    		if ("updateInputs" in $$props) $$invalidate(10, updateInputs = $$props.updateInputs);
    		if ("getInputInitialValue" in $$props) getInputInitialValue = $$props.getInputInitialValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedUnix*/ 32) {
    			 {
    				if ($selectedUnix) {
    					updateInputs();
    				}
    			}
    		}
    	};

    	return [originalContainer, plotarea, setPlotPostion];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			originalContainer: 0,
    			plotarea: 1,
    			setPlotPostion: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*originalContainer*/ ctx[0] === undefined && !("originalContainer" in props)) {
    			console.warn("<Input> was created without expected prop 'originalContainer'");
    		}

    		if (/*plotarea*/ ctx[1] === undefined && !("plotarea" in props)) {
    			console.warn("<Input> was created without expected prop 'plotarea'");
    		}
    	}

    	get originalContainer() {
    		return this.$$.ctx[0];
    	}

    	set originalContainer(originalContainer) {
    		this.$set({ originalContainer });
    		flush();
    	}

    	get plotarea() {
    		return this.$$.ctx[1];
    	}

    	set plotarea(plotarea) {
    		this.$set({ plotarea });
    		flush();
    	}

    	get setPlotPostion() {
    		return this.$$.ctx[2];
    	}

    	set setPlotPostion(setPlotPostion) {
    		this.$set({ setPlotPostion });
    		flush();
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */
    const file$7 = "src/App.svelte";

    // (2:0) {#if isVisbile}
    function create_if_block$7(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let current;
    	let dispose;
<<<<<<< HEAD
    	let if_block0 = /*$config*/ ctx[6].infobox.enabled && create_if_block_8(ctx);
    	let if_block1 = /*$config*/ ctx[6].navigator.enabled && create_if_block_7(ctx);
    	let if_block2 = !/*$config*/ ctx[6].onlyTimePicker && create_if_block_3$4(ctx);
    	let if_block3 = (/*$privateViewMode*/ ctx[7] === "time" && /*$config*/ ctx[6].timePicker.enabled || /*$config*/ ctx[6].onlyTimePicker) && create_if_block_2$4(ctx);
    	let if_block4 = /*$config*/ ctx[6].toolbox.enabled && create_if_block_1$4(ctx);
=======
    	let if_block0 = /*$config*/ ctx[4].infobox.enabled && create_if_block_8(ctx);
    	let if_block1 = /*$config*/ ctx[4].navigator.enabled && create_if_block_7(ctx);
    	let if_block2 = !/*$config*/ ctx[4].onlyTimePicker && create_if_block_3$4(ctx);
    	let if_block3 = (/*$privateViewModeDerived*/ ctx[7] === "time" && /*$config*/ ctx[4].timePicker.enabled || /*$config*/ ctx[4].onlyTimePicker) && create_if_block_2$4(ctx);
    	let if_block4 = /*$config*/ ctx[4].toolbox.enabled && create_if_block_1$5(ctx);
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue

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
    			add_location(div0, file$7, 21, 3, 562);
    			attr_dev(div1, "class", "pwt-datepicker");
    			add_location(div1, file$7, 2, 1, 70);
    		},
    		m: function mount(target, anchor, remount) {
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
    			/*div1_binding*/ ctx[37](div1);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div1, "wheel", /*handleWheel*/ ctx[21], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*$config*/ ctx[4].infobox.enabled) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*$config*/ 16) {
    						transition_in(if_block0, 1);
    					}
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

    			if (/*$config*/ ctx[4].navigator.enabled) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*$config*/ 16) {
    						transition_in(if_block1, 1);
    					}
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

    			if (!/*$config*/ ctx[4].onlyTimePicker) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*$config*/ 16) {
    						transition_in(if_block2, 1);
    					}
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

<<<<<<< HEAD
    			if (/*$privateViewMode*/ ctx[7] === "time" && /*$config*/ ctx[6].timePicker.enabled || /*$config*/ ctx[6].onlyTimePicker) {
=======
    			if (/*$privateViewModeDerived*/ ctx[7] === "time" && /*$config*/ ctx[4].timePicker.enabled || /*$config*/ ctx[4].onlyTimePicker) {
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*$privateViewModeDerived, $config*/ 144) {
    						transition_in(if_block3, 1);
    					}
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

    			if (/*$config*/ ctx[4].toolbox.enabled) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*$config*/ 16) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1$5(ctx);
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
    			/*div1_binding*/ ctx[37](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
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
    				viewUnix: /*$viewUnix*/ ctx[6],
    				selectedUnix: /*$selectedUnix*/ ctx[5]
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
    		p: function update(ctx, dirty) {
    			const infobox_changes = {};
    			if (dirty[0] & /*$viewUnix*/ 64) infobox_changes.viewUnix = /*$viewUnix*/ ctx[6];
    			if (dirty[0] & /*$selectedUnix*/ 32) infobox_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
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
<<<<<<< HEAD
    				viewMode: /*$privateViewMode*/ ctx[7],
    				viewUnix: /*$viewUnix*/ ctx[5],
    				selectedUnix: /*$selectedUnix*/ ctx[4]
=======
    				viewMode: /*$privateViewModeDerived*/ ctx[7],
    				viewUnix: /*$viewUnix*/ ctx[6],
    				selectedUnix: /*$selectedUnix*/ ctx[5]
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    			},
    			$$inline: true
    		});

    	navigator.$on("selectmode", /*setViewModeToUpperAvailableLevel*/ ctx[20]);
    	navigator.$on("today", /*today*/ ctx[17]);
    	navigator.$on("next", /*navNext*/ ctx[18]);
    	navigator.$on("prev", /*navPrev*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(navigator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navigator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navigator_changes = {};
<<<<<<< HEAD
    			if (dirty[0] & /*$privateViewMode*/ 128) navigator_changes.viewMode = /*$privateViewMode*/ ctx[7];
    			if (dirty[0] & /*$viewUnix*/ 32) navigator_changes.viewUnix = /*$viewUnix*/ ctx[5];
    			if (dirty[0] & /*$selectedUnix*/ 16) navigator_changes.selectedUnix = /*$selectedUnix*/ ctx[4];
=======
    			if (dirty[0] & /*$privateViewModeDerived*/ 128) navigator_changes.viewMode = /*$privateViewModeDerived*/ ctx[7];
    			if (dirty[0] & /*$viewUnix*/ 64) navigator_changes.viewUnix = /*$viewUnix*/ ctx[6];
    			if (dirty[0] & /*$selectedUnix*/ 32) navigator_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
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
<<<<<<< HEAD
    	let if_block0 = /*$privateViewMode*/ ctx[7] === "year" && /*$config*/ ctx[6].yearPicker.enabled && create_if_block_6$1(ctx);
    	let if_block1 = /*$privateViewMode*/ ctx[7] === "month" && /*$config*/ ctx[6].monthPicker.enabled && create_if_block_5$1(ctx);
    	let if_block2 = /*$privateViewMode*/ ctx[7] === "day" && /*$config*/ ctx[6].dayPicker.enabled && create_if_block_4$3(ctx);
=======
    	let if_block0 = /*$privateViewModeDerived*/ ctx[7] === "year" && /*$config*/ ctx[4].yearPicker.enabled && create_if_block_6$1(ctx);
    	let if_block1 = /*$privateViewModeDerived*/ ctx[7] === "month" && /*$config*/ ctx[4].monthPicker.enabled && create_if_block_5$1(ctx);
    	let if_block2 = /*$privateViewModeDerived*/ ctx[7] === "day" && /*$config*/ ctx[4].dayPicker.enabled && create_if_block_4$3(ctx);
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue

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
    		p: function update(ctx, dirty) {
<<<<<<< HEAD
    			if (/*$privateViewMode*/ ctx[7] === "year" && /*$config*/ ctx[6].yearPicker.enabled) {
=======
    			if (/*$privateViewModeDerived*/ ctx[7] === "year" && /*$config*/ ctx[4].yearPicker.enabled) {
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*$privateViewModeDerived, $config*/ 144) {
    						transition_in(if_block0, 1);
    					}
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

<<<<<<< HEAD
    			if (/*$privateViewMode*/ ctx[7] === "month" && /*$config*/ ctx[6].monthPicker.enabled) {
=======
    			if (/*$privateViewModeDerived*/ ctx[7] === "month" && /*$config*/ ctx[4].monthPicker.enabled) {
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*$privateViewModeDerived, $config*/ 144) {
    						transition_in(if_block1, 1);
    					}
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

<<<<<<< HEAD
    			if (/*$privateViewMode*/ ctx[7] === "day" && /*$config*/ ctx[6].dayPicker.enabled) {
=======
    			if (/*$privateViewModeDerived*/ ctx[7] === "day" && /*$config*/ ctx[4].dayPicker.enabled) {
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*$privateViewModeDerived, $config*/ 144) {
    						transition_in(if_block2, 1);
    					}
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

    // (25:5) {#if $privateViewMode === 'year' && $config.yearPicker.enabled}
    function create_if_block_6$1(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const yearview = new YearView({
    			props: {
    				viewUnix: /*$viewUnix*/ ctx[6],
    				selectedUnix: /*$selectedUnix*/ ctx[5]
    			},
    			$$inline: true
    		});

    	yearview.$on("select", /*onSelectYear*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(yearview.$$.fragment);
    			add_location(div, file$7, 25, 6, 719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(yearview, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const yearview_changes = {};
    			if (dirty[0] & /*$viewUnix*/ 64) yearview_changes.viewUnix = /*$viewUnix*/ ctx[6];
    			if (dirty[0] & /*$selectedUnix*/ 32) yearview_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
    			yearview.$set(yearview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(yearview.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(yearview.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, false);
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
    		source: "(25:5) {#if $privateViewMode === 'year' && $config.yearPicker.enabled}",
    		ctx
    	});

    	return block;
    }

    // (34:5) {#if $privateViewMode === 'month' && $config.monthPicker.enabled}
    function create_if_block_5$1(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const monthview = new MonthView({
    			props: {
    				viewUnix: /*$viewUnix*/ ctx[6],
    				selectedUnix: /*$selectedUnix*/ ctx[5]
    			},
    			$$inline: true
    		});

    	monthview.$on("select", /*onSelectMonth*/ ctx[15]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(monthview.$$.fragment);
<<<<<<< HEAD
    			add_location(div, file$7, 34, 6, 990);
=======
    			add_location(div, file$7, 34, 6, 1022);
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(monthview, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const monthview_changes = {};
    			if (dirty[0] & /*$viewUnix*/ 64) monthview_changes.viewUnix = /*$viewUnix*/ ctx[6];
    			if (dirty[0] & /*$selectedUnix*/ 32) monthview_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
    			monthview.$set(monthview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monthview.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monthview.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, false);
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
    		source: "(34:5) {#if $privateViewMode === 'month' && $config.monthPicker.enabled}",
    		ctx
    	});

    	return block;
    }

    // (43:5) {#if $privateViewMode === 'day' && $config.dayPicker.enabled}
    function create_if_block_4$3(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const dateview = new DateView({
    			props: {
    				viewUnix: /*$viewUnix*/ ctx[6],
    				selectedUnix: /*$selectedUnix*/ ctx[5]
    			},
    			$$inline: true
    		});

    	dateview.$on("prev", /*navPrev*/ ctx[19]);
    	dateview.$on("next", /*navNext*/ ctx[18]);
    	dateview.$on("selectDate", /*onSelectDate*/ ctx[13]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(dateview.$$.fragment);
<<<<<<< HEAD
    			add_location(div, file$7, 43, 6, 1259);
=======
    			add_location(div, file$7, 43, 6, 1309);
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dateview, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dateview_changes = {};
    			if (dirty[0] & /*$viewUnix*/ 64) dateview_changes.viewUnix = /*$viewUnix*/ ctx[6];
    			if (dirty[0] & /*$selectedUnix*/ 32) dateview_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
    			dateview.$set(dateview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dateview.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dateview.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, false);
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
    		source: "(43:5) {#if $privateViewMode === 'day' && $config.dayPicker.enabled}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#if ($privateViewMode === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}
    function create_if_block_2$4(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const timeview = new TimeView({
    			props: { selectedUnix: /*$selectedUnix*/ ctx[5] },
    			$$inline: true
    		});

    	timeview.$on("selectTime", /*onSelectTime*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(timeview.$$.fragment);
<<<<<<< HEAD
    			add_location(div, file$7, 55, 5, 1623);
=======
    			add_location(div, file$7, 55, 5, 1691);
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(timeview, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const timeview_changes = {};
    			if (dirty[0] & /*$selectedUnix*/ 32) timeview_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
    			timeview.$set(timeview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeview.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeview.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: /*animateSpeed*/ ctx[8] }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(timeview);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(55:4) {#if ($privateViewMode === 'time' && $config.timePicker.enabled) || $config.onlyTimePicker}",
    		ctx
    	});

    	return block;
    }

    // (64:3) {#if $config.toolbox.enabled}
    function create_if_block_1$5(ctx) {
    	let current;

    	const toolbox = new Toolbox({
    			props: {
<<<<<<< HEAD
    				viewMode: /*$privateViewMode*/ ctx[7],
    				viewUnix: /*$viewUnix*/ ctx[5],
    				selectedUnix: /*$selectedUnix*/ ctx[4]
=======
    				viewMode: /*$privateViewModeDerived*/ ctx[7],
    				viewUnix: /*$viewUnix*/ ctx[6],
    				selectedUnix: /*$selectedUnix*/ ctx[5]
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    			},
    			$$inline: true
    		});

    	toolbox.$on("setcalendar", /*setcalendar*/ ctx[12]);
    	toolbox.$on("selectmode", /*setViewMode*/ ctx[11]);
    	toolbox.$on("today", /*today*/ ctx[17]);
    	toolbox.$on("next", /*navNext*/ ctx[18]);
    	toolbox.$on("prev", /*navPrev*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(toolbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toolbox_changes = {};
<<<<<<< HEAD
    			if (dirty[0] & /*$privateViewMode*/ 128) toolbox_changes.viewMode = /*$privateViewMode*/ ctx[7];
    			if (dirty[0] & /*$viewUnix*/ 32) toolbox_changes.viewUnix = /*$viewUnix*/ ctx[5];
    			if (dirty[0] & /*$selectedUnix*/ 16) toolbox_changes.selectedUnix = /*$selectedUnix*/ ctx[4];
=======
    			if (dirty[0] & /*$privateViewModeDerived*/ 128) toolbox_changes.viewMode = /*$privateViewModeDerived*/ ctx[7];
    			if (dirty[0] & /*$viewUnix*/ 64) toolbox_changes.viewUnix = /*$viewUnix*/ ctx[6];
    			if (dirty[0] & /*$selectedUnix*/ 32) toolbox_changes.selectedUnix = /*$selectedUnix*/ ctx[5];
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(64:3) {#if $config.toolbox.enabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t;
    	let current;
    	let if_block = /*isVisbile*/ ctx[3] && create_if_block$7(ctx);

    	let input_props = {
    		plotarea: /*plotarea*/ ctx[1],
    		originalContainer: /*originalContainer*/ ctx[0]
    	};

    	const input = new Input({ props: input_props, $$inline: true });
    	/*input_binding*/ ctx[38](input);
    	input.$on("setinitialvalue", /*setInitialValue*/ ctx[10]);
    	input.$on("setvisibility", /*setvisibility*/ ctx[9]);

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
    		p: function update(ctx, dirty) {
    			if (/*isVisbile*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isVisbile*/ 8) {
    						transition_in(if_block, 1);
    					}
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
    			if (dirty[0] & /*plotarea*/ 2) input_changes.plotarea = /*plotarea*/ ctx[1];
    			if (dirty[0] & /*originalContainer*/ 1) input_changes.originalContainer = /*originalContainer*/ ctx[0];
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
    			/*input_binding*/ ctx[38](null);
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
    	let $selectedUnix;
    	let $viewUnix;
    	let $dateObject;
<<<<<<< HEAD
    	let $privateViewMode;
=======
    	let $privateViewModeDerived;
    	validate_store(config, "config");
    	component_subscribe($$self, config, $$value => $$invalidate(4, $config = $$value));
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    	validate_store(selectedUnix, "selectedUnix");
    	component_subscribe($$self, selectedUnix, $$value => $$invalidate(5, $selectedUnix = $$value));
    	validate_store(viewUnix, "viewUnix");
    	component_subscribe($$self, viewUnix, $$value => $$invalidate(6, $viewUnix = $$value));
    	validate_store(dateObject, "dateObject");
<<<<<<< HEAD
    	component_subscribe($$self, dateObject, $$value => $$invalidate(33, $dateObject = $$value));
    	validate_store(privateViewMode, "privateViewMode");
    	component_subscribe($$self, privateViewMode, $$value => $$invalidate(7, $privateViewMode = $$value));
=======
    	component_subscribe($$self, dateObject, $$value => $$invalidate(34, $dateObject = $$value));
    	validate_store(privateViewModeDerived, "privateViewModeDerived");
    	component_subscribe($$self, privateViewModeDerived, $$value => $$invalidate(7, $privateViewModeDerived = $$value));
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    	let plotarea;
    	let inputComp;
    	let isVisbile = false;
    	let animateSpeed = $config.animate ? $config.animateSpeed : 0;
    	let { options = {} } = $$props;
    	let { originalContainer = null } = $$props;
    	let { model = null } = $$props;

    	const setDate = function (unix) {
    		dispatcher("setDate")(unix);
    	};

    	const show = function () {
    		setvisibility({ detail: true });
    	};

    	const hide = function () {
    		setvisibility({ detail: false });
    	};

    	const toggle = function () {
    		setvisibility({ detail: !isVisbile });
    	};

    	const destroy = function () {
    		if (plotarea.parentNode && plotarea.parentNode.removeChild) {
    			plotarea.parentNode.removeChild(plotarea);
    		}
    	};

    	const getState = function () {
    		return {
    			selected: $selectedUnix,
    			view: $viewUnix,
    			// Added In v2.0.0
    			config: $config,
    			// Added In v2.0.0
    			dateObject: $dateObject
    		};
    	};

    	const setOptions = function (newOptions) {
    		dispatcher("setConfig")(lodash.merge($config, newOptions));
    	};

    	const getOptions = function () {
    		return $config;
    	};

    	const dispatch = createEventDispatcher();

    	// Handle global event and store events
    	const dispatcher = function (input) {
    		return event => {
    			dispatch(input, event);

    			if (options[input]) {
    				return event => options[input](event);
    			}

    			if (actions[input]) {
    				actions[input](event);
    			}
    		};
    	};

    	let cashedoptions = options;

    	if (!options) {
    		options = defaultconfig;
    	} else {
    		options = lodash.merge(defaultconfig, options);
    	}

    	dispatcher("setConfig")(options);

    	// Update DAtepicker Via from reactivity models, like v-model
    	let cashedSelectedDate = $selectedUnix;

    	if (model) {
    		dispatcher("setDate")(parseInt(model));
    		cashedSelectedDate = parseInt(model);
    	}

    	// Methods that would called by component events
    	const setvisibility = function (payload) {
    		$$invalidate(3, isVisbile = payload.detail);

    		if (inputComp) {
    			inputComp.setPlotPostion();
    		}

    		setTimeout(
    			() => {
    				if (plotarea) {
    					$$invalidate(1, plotarea.style.display = isVisbile ? "block" : "none", plotarea);
    				}

    				if (isVisbile) {
    					$config.onShow();
    				} else {
    					$config.onHide();
    				}
    			},
    			150
    		);
    	};

    	if ($config.inline) {
    		setvisibility({ detail: true });
    	}

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

    		dispatcher("onSelect")($config.altFieldFormatter($selectedUnix, $dateObject));
    	};

    	const onSelectTime = function (event) {
    		dispatcher("onSelectTime")(event);
    		dispatcher("onSelect")($selectedUnix);
    	};

    	const onSelectMonth = function (event) {
    		dispatcher("onSelectMonth")(event.detail);
    		$config.monthPicker.onSelect(event.detail);
    		dispatcher("onSelect")($selectedUnix);
    	};

    	const onSelectYear = function (event) {
    		dispatcher("onSelectYear")(event.detail);
    		$config.yearPicker.onSelect(event.detail);
    		dispatcher("onSelect")($selectedUnix);
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

    	const writable_props = ["options", "originalContainer", "model"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, plotarea = $$value);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, inputComp = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("options" in $$props) $$invalidate(22, options = $$props.options);
    		if ("originalContainer" in $$props) $$invalidate(0, originalContainer = $$props.originalContainer);
    		if ("model" in $$props) $$invalidate(23, model = $$props.model);
    	};

<<<<<<< HEAD
    	$$self.$capture_state = () => {
    		return {
    			plotarea,
    			inputComp,
    			isVisbile,
    			options,
    			originalContainer,
    			model,
    			cashedoptions,
    			cashedSelectedDate,
    			$selectedUnix,
    			$viewUnix,
    			$config,
    			$dateObject,
    			$privateViewMode
    		};
    	};
=======
    	$$self.$capture_state = () => ({
    		fade,
    		YearView,
    		MonthView,
    		DateView,
    		TimeView,
    		Navigator,
    		Infobox,
    		Toolbox,
    		Input,
    		defaultconfig,
    		config,
    		actions,
    		selectedUnix,
    		viewUnix,
    		privateViewModeDerived,
    		dateObject,
    		createEventDispatcher,
    		lodash,
    		plotarea,
    		inputComp,
    		isVisbile,
    		animateSpeed,
    		options,
    		originalContainer,
    		model,
    		setDate,
    		show,
    		hide,
    		toggle,
    		destroy,
    		getState,
    		setOptions,
    		getOptions,
    		dispatch,
    		dispatcher,
    		cashedoptions,
    		cashedSelectedDate,
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
    		$selectedUnix,
    		$viewUnix,
    		$dateObject,
    		$privateViewModeDerived
    	});
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue

    	$$self.$inject_state = $$props => {
    		if ("plotarea" in $$props) $$invalidate(1, plotarea = $$props.plotarea);
    		if ("inputComp" in $$props) $$invalidate(2, inputComp = $$props.inputComp);
    		if ("isVisbile" in $$props) $$invalidate(3, isVisbile = $$props.isVisbile);
    		if ("animateSpeed" in $$props) $$invalidate(8, animateSpeed = $$props.animateSpeed);
    		if ("options" in $$props) $$invalidate(22, options = $$props.options);
    		if ("originalContainer" in $$props) $$invalidate(0, originalContainer = $$props.originalContainer);
<<<<<<< HEAD
    		if ("model" in $$props) $$invalidate(22, model = $$props.model);
    		if ("cashedoptions" in $$props) $$invalidate(31, cashedoptions = $$props.cashedoptions);
    		if ("cashedSelectedDate" in $$props) $$invalidate(32, cashedSelectedDate = $$props.cashedSelectedDate);
    		if ("$selectedUnix" in $$props) selectedUnix.set($selectedUnix = $$props.$selectedUnix);
    		if ("$viewUnix" in $$props) viewUnix.set($viewUnix = $$props.$viewUnix);
    		if ("$config" in $$props) config.set($config = $$props.$config);
    		if ("$dateObject" in $$props) dateObject.set($dateObject = $$props.$dateObject);
    		if ("$privateViewMode" in $$props) privateViewMode.set($privateViewMode = $$props.$privateViewMode);
=======
    		if ("model" in $$props) $$invalidate(23, model = $$props.model);
    		if ("cashedoptions" in $$props) $$invalidate(32, cashedoptions = $$props.cashedoptions);
    		if ("cashedSelectedDate" in $$props) $$invalidate(33, cashedSelectedDate = $$props.cashedSelectedDate);
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*options*/ 4194304 | $$self.$$.dirty[1] & /*cashedoptions*/ 2) {
    			 {
    				if (JSON.stringify(cashedoptions) !== JSON.stringify(options)) {
    					if (!options) {
    						$$invalidate(22, options = defaultconfig);
    					} else {
    						$$invalidate(22, options = lodash.merge(defaultconfig, options));
    					}

    					dispatcher("setConfig")(options);
    					$$invalidate(32, cashedoptions = options);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*model, $selectedUnix*/ 8388640 | $$self.$$.dirty[1] & /*cashedSelectedDate*/ 4) {
    			 {
    				if (model && model !== cashedSelectedDate) {
    					dispatcher("setDate")(parseInt(model));
    					$$invalidate(33, cashedSelectedDate = $selectedUnix);
    				}
    			}
    		}
    	};

    	return [
    		originalContainer,
    		plotarea,
    		inputComp,
    		isVisbile,
    		$config,
    		$selectedUnix,
    		$viewUnix,
<<<<<<< HEAD
    		$config,
    		$privateViewMode,
=======
    		$privateViewModeDerived,
    		animateSpeed,
>>>>>>> d15bf23... fix timepicker layout, fix animation issues with layout, add timepicker onwheel event, add showAsLastStep to timePicer config, fix yearPicker navigator title, fix yearPicker persian digit issue
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
    		options,
    		model,
    		setDate,
    		show,
    		hide,
    		toggle,
    		destroy,
    		getState,
    		setOptions,
    		getOptions,
    		cashedoptions,
    		cashedSelectedDate,
    		$dateObject,
    		dispatch,
    		dispatcher,
    		div1_binding,
    		input_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			not_equal,
    			{
    				options: 22,
    				originalContainer: 0,
    				model: 23,
    				setDate: 24,
    				show: 25,
    				hide: 26,
    				toggle: 27,
    				destroy: 28,
    				getState: 29,
    				setOptions: 30,
    				getOptions: 31
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get options() {
    		return this.$$.ctx[22];
    	}

    	set options(options) {
    		this.$set({ options });
    		flush();
    	}

    	get originalContainer() {
    		return this.$$.ctx[0];
    	}

    	set originalContainer(originalContainer) {
    		this.$set({ originalContainer });
    		flush();
    	}

    	get model() {
    		return this.$$.ctx[23];
    	}

    	set model(model) {
    		this.$set({ model });
    		flush();
    	}

    	get setDate() {
    		return this.$$.ctx[24];
    	}

    	set setDate(value) {
    		throw new Error("<App>: Cannot set read-only property 'setDate'");
    	}

    	get show() {
    		return this.$$.ctx[25];
    	}

    	set show(value) {
    		throw new Error("<App>: Cannot set read-only property 'show'");
    	}

    	get hide() {
    		return this.$$.ctx[26];
    	}

    	set hide(value) {
    		throw new Error("<App>: Cannot set read-only property 'hide'");
    	}

    	get toggle() {
    		return this.$$.ctx[27];
    	}

    	set toggle(value) {
    		throw new Error("<App>: Cannot set read-only property 'toggle'");
    	}

    	get destroy() {
    		return this.$$.ctx[28];
    	}

    	set destroy(value) {
    		throw new Error("<App>: Cannot set read-only property 'destroy'");
    	}

    	get getState() {
    		return this.$$.ctx[29];
    	}

    	set getState(value) {
    		throw new Error("<App>: Cannot set read-only property 'getState'");
    	}

    	get setOptions() {
    		return this.$$.ctx[30];
    	}

    	set setOptions(value) {
    		throw new Error("<App>: Cannot set read-only property 'setOptions'");
    	}

    	get getOptions() {
    		return this.$$.ctx[31];
    	}

    	set getOptions(value) {
    		throw new Error("<App>: Cannot set read-only property 'getOptions'");
    	}
    }

    const attrs =  document.getElementById('container').attributes;

    // TODO: clean up this functions
    function clearAndUpper(text) {
      return text.replace(/-/, "").toUpperCase();
    }

    function toCamelCase(text) {
      return text.replace(/-\w/g, clearAndUpper);
    }

    let options = {};
    Object.keys(attrs).forEach((value) => {
      let sanitizedValue = attrs[value].value;
      if (/^\d+$/.test(sanitizedValue)) {
        sanitizedValue = parseInt(sanitizedValue);
      }
      if (sanitizedValue === 'true') {
        sanitizedValue = true;
      }
      if (sanitizedValue === 'false') {
        sanitizedValue = false;
      }
      options[toCamelCase(attrs[value].name)] = sanitizedValue;
    });

    console.log(options);

    const app = new App({
      target: document.getElementById('container'),
      props: {
        options: options
      }
    });

    return app;

}());
=======
this["persian-datepicker-next-version"]=function(){"use strict";function t(){}const n=t=>t;function e(t){return t()}function r(){return Object.create(null)}function i(t){t.forEach(e)}function o(t){return"function"==typeof t}function u(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function a(t,n){return t!=t?n==n:t!==n}function c(n,...e){if(null==n)return t;const r=n.subscribe(...e);return r.unsubscribe?()=>r.unsubscribe():r}function l(t){let n;return c(t,t=>n=t)(),n}function f(t,n,e){t.$$.on_destroy.push(c(n,e))}const s="undefined"!=typeof window;let d=s?()=>window.performance.now():()=>Date.now(),p=s?t=>requestAnimationFrame(t):t;const h=new Set;function v(t){h.forEach(n=>{n.c(t)||(h.delete(n),n.f())}),0!==h.size&&p(v)}function g(t){let n;return 0===h.size&&p(v),{promise:new Promise(e=>{h.add(n={c:t,f:e})}),abort(){h.delete(n)}}}function m(t,n){t.appendChild(n)}function y(t,n,e){t.insertBefore(n,e||null)}function _(t){t.parentNode.removeChild(t)}function w(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function b(t){return document.createElement(t)}function x(t){return document.createTextNode(t)}function $(){return x(" ")}function k(){return x("")}function D(t,n,e,r){return t.addEventListener(n,e,r),()=>t.removeEventListener(n,e,r)}function S(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function M(t,n){n=""+n,t.data!==n&&(t.data=n)}function U(t,n,e){t.classList[e?"add":"remove"](n)}function T(t,n){const e=document.createEvent("CustomEvent");return e.initCustomEvent(t,!1,!1,n),e}const P=new Set;let L,C=0;function O(t,n,e,r,i,o,u,a=0){const c=16.666/r;let l="{\n";for(let t=0;t<=1;t+=c){const r=n+(e-n)*o(t);l+=100*t+`%{${u(r,1-r)}}\n`}const f=l+`100% {${u(e,1-e)}}\n}`,s=`__svelte_${function(t){let n=5381,e=t.length;for(;e--;)n=(n<<5)-n^t.charCodeAt(e);return n>>>0}(f)}_${a}`,d=t.ownerDocument;P.add(d);const p=d.__svelte_stylesheet||(d.__svelte_stylesheet=d.head.appendChild(b("style")).sheet),h=d.__svelte_rules||(d.__svelte_rules={});h[s]||(h[s]=!0,p.insertRule(`@keyframes ${s} ${f}`,p.cssRules.length));const v=t.style.animation||"";return t.style.animation=`${v?`${v}, `:""}${s} ${r}ms linear ${i}ms 1 both`,C+=1,s}function A(t,n){const e=(t.style.animation||"").split(", "),r=e.filter(n?t=>t.indexOf(n)<0:t=>-1===t.indexOf("__svelte")),i=e.length-r.length;i&&(t.style.animation=r.join(", "),(C-=i)||p(()=>{C||(P.forEach(t=>{const n=t.__svelte_stylesheet;let e=n.cssRules.length;for(;e--;)n.deleteRule(e);t.__svelte_rules={}}),P.clear())}))}function j(t){L=t}function I(){const t=function(){if(!L)throw new Error("Function called outside component initialization");return L}();return(n,e)=>{const r=t.$$.callbacks[n];if(r){const i=T(n,e);r.slice().forEach(n=>{n.call(t,i)})}}}const E=[],F=[],z=[],N=[],R=Promise.resolve();let B=!1;function V(t){z.push(t)}let Y=!1;const W=new Set;function H(){if(!Y){Y=!0;do{for(let t=0;t<E.length;t+=1){const n=E[t];j(n),q(n.$$)}for(E.length=0;F.length;)F.pop()();for(let t=0;t<z.length;t+=1){const n=z[t];W.has(n)||(W.add(n),n())}z.length=0}while(E.length);for(;N.length;)N.pop()();B=!1,Y=!1,W.clear()}}function q(t){if(null!==t.fragment){t.update(),i(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(V)}}let Z;function J(){return Z||(Z=Promise.resolve()).then(()=>{Z=null}),Z}function K(t,n,e){t.dispatchEvent(T(`${n?"intro":"outro"}${e}`))}const G=new Set;let X;function Q(){X={r:0,c:[],p:X}}function tt(){X.r||i(X.c),X=X.p}function nt(t,n){t&&t.i&&(G.delete(t),t.i(n))}function et(t,n,e,r){if(t&&t.o){if(G.has(t))return;G.add(t),X.c.push(()=>{G.delete(t),r&&(e&&t.d(1),r())}),t.o(n)}}const rt={duration:0};function it(e,r,i){let u,a,c=r(e,i),l=!1,f=0;function s(){u&&A(e,u)}function p(){const{delay:r=0,duration:i=300,easing:o=n,tick:p=t,css:h}=c||rt;h&&(u=O(e,0,1,i,r,o,h,f++)),p(0,1);const v=d()+r,m=v+i;a&&a.abort(),l=!0,V(()=>K(e,!0,"start")),a=g(t=>{if(l){if(t>=m)return p(1,0),K(e,!0,"end"),s(),l=!1;if(t>=v){const n=o((t-v)/i);p(n,1-n)}}return l})}let h=!1;return{start(){h||(A(e),o(c)?(c=c(),J().then(p)):p())},invalidate(){h=!1},end(){l&&(s(),l=!1)}}}function ot(e,r,u){let a,c=r(e,u),l=!0;const f=X;function s(){const{delay:r=0,duration:o=300,easing:u=n,tick:s=t,css:p}=c||rt;p&&(a=O(e,1,0,o,r,u,p));const h=d()+r,v=h+o;V(()=>K(e,!1,"start")),g(t=>{if(l){if(t>=v)return s(0,1),K(e,!1,"end"),--f.r||i(f.c),!1;if(t>=h){const n=u((t-h)/o);s(1-n,n)}}return l})}return f.r+=1,o(c)?J().then(()=>{c=c(),s()}):s(),{end(t){t&&c.tick&&c.tick(1,0),l&&(a&&A(e,a),l=!1)}}}function ut(e,r,u,a){let c=r(e,u),l=a?0:1,f=null,s=null,p=null;function h(){p&&A(e,p)}function v(t,n){const e=t.b-l;return n*=Math.abs(e),{a:l,b:t.b,d:e,duration:n,start:t.start,end:t.start+n,group:t.group}}function m(r){const{delay:o=0,duration:u=300,easing:a=n,tick:m=t,css:y}=c||rt,_={start:d()+o,b:r};r||(_.group=X,X.r+=1),f?s=_:(y&&(h(),p=O(e,l,r,u,o,a,y)),r&&m(0,1),f=v(_,u),V(()=>K(e,r,"start")),g(t=>{if(s&&t>s.start&&(f=v(s,u),s=null,K(e,f.b,"start"),y&&(h(),p=O(e,l,f.b,f.duration,0,a,c.css))),f)if(t>=f.end)m(l=f.b,1-l),K(e,f.b,"end"),s||(f.b?h():--f.group.r||i(f.group.c)),f=null;else if(t>=f.start){const n=t-f.start;l=f.a+f.d*a(n/f.duration),m(l,1-l)}return!(!f&&!s)}))}return{run(t){o(c)?J().then(()=>{c=c(),m(t)}):m(t)},end(){h(),f=s=null}}}function at(t){t&&t.c()}function ct(t,n,r){const{fragment:u,on_mount:a,on_destroy:c,after_update:l}=t.$$;u&&u.m(n,r),V(()=>{const n=a.map(e).filter(o);c?c.push(...n):i(n),t.$$.on_mount=[]}),l.forEach(V)}function lt(t,n){const e=t.$$;null!==e.fragment&&(i(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function ft(t,n){-1===t.$$.dirty[0]&&(E.push(t),B||(B=!0,R.then(H)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function st(n,e,o,u,a,c,l=[-1]){const f=L;j(n);const s=e.props||{},d=n.$$={fragment:null,ctx:null,props:c,update:t,not_equal:a,bound:r(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:r(),dirty:l};let p=!1;if(d.ctx=o?o(n,s,(t,e,...r)=>{const i=r.length?r[0]:e;return d.ctx&&a(d.ctx[t],d.ctx[t]=i)&&(d.bound[t]&&d.bound[t](i),p&&ft(n,t)),e}):[],d.update(),p=!0,i(d.before_update),d.fragment=!!u&&u(d.ctx),e.target){if(e.hydrate){const t=function(t){return Array.from(t.childNodes)}(e.target);d.fragment&&d.fragment.l(t),t.forEach(_)}else d.fragment&&d.fragment.c();e.intro&&nt(n.$$.fragment),ct(n,e.target,e.anchor),H()}j(f)}class dt{$destroy(){lt(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(){}}function pt(t,{delay:e=0,duration:r=400,easing:i=n}){const o=+getComputedStyle(t).opacity;return{delay:e,duration:r,easing:i,css:t=>`opacity: ${t*o}`}}class ht{constructor(){this.pattern={iso:/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/g,jalali:/^[1-4]\d{3}(\/|-|\.)((0?[1-6](\/|-|\.)((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))(\/|-|\.)(30|([1-2][0-9])|(0?[1-9]))))$/g}}parse(t){let n,e=new RegExp(this.pattern.iso);return new RegExp(this.pattern.jalali).test(t)?n=t.split(/\/|-|\,|\./).map(Number):e.test(t)?n=t.split(/\/|-|\,|\:|\T|\Z/g).map(Number):void 0}}function vt(t){return 1e3*t.unix()}function gt(t){const n=new persianDate(t);return{hour:n.hour(),minute:n.minute(),second:n.second()}}const mt=[];function yt(n,e=t){let r;const i=[];function o(t){if(u(n,t)&&(n=t,r)){const t=!mt.length;for(let t=0;t<i.length;t+=1){const e=i[t];e[1](),mt.push(e,n)}if(t){for(let t=0;t<mt.length;t+=2)mt[t][0](mt[t+1]);mt.length=0}}}return{set:o,update:function(t){o(t(n))},subscribe:function(u,a=t){const c=[u,a];return i.push(c),1===i.length&&(r=e(o)||t),u(n),()=>{const t=i.indexOf(c);-1!==t&&i.splice(t,1),0===i.length&&(r(),r=null)}}}}var _t={animate:!0,animateSpeed:180,calendarType:"persian",calendar:{persian:{locale:"fa",showHint:!1,leapYearMode:"algorithmic"},gregorian:{locale:"en",showHint:!1}},responsive:!0,inline:!1,initialValue:!0,initialValueType:"gregorian",persianDigit:!0,viewMode:"day",format:"LLLL",formatter:function(t,n){return new n(t).format(this.format)},altField:!1,altFormat:"unix",altFieldFormatter:function(t,n){return"gregorian"===this.altFormat||"g"===this.altFormat?new Date(t):"unix"===this.altFormat||"u"===this.altFormat?new n(t).valueOf():new n(t).format(this.altFormat)},minDate:null,maxDate:null,navigator:{enabled:!0,scroll:{enabled:!0},text:{btnNextText:"<",btnPrevText:">"},onNext:function(t){},onPrev:function(t){},onSwitch:function(t){}},toolbox:{enabled:!0,text:{btnToday:"امروز"},submitButton:{enabled:{debug(){}}.isMobile,text:{fa:"تایید",en:"submit"},onSubmit:function(t){}},todayButton:{enabled:!0,text:{fa:"امروز",en:"today"},onToday:function(t){}},calendarSwitch:{enabled:!0,format:"MMMM",onSwitch:function(t){}},onToday:function(t){}},onlyTimePicker:!1,onlySelectOnDate:!0,checkDate:function(){return!0},checkMonth:function(){return!0},checkYear:function(){return!0},timePicker:{enabled:!0,showAsLastStep:!0,step:1,titleFormat:"MMMM DD",titleFormatter:function(t,n){return new n(t).format(this.titleFormat)},hour:{enabled:!0,step:null},minute:{enabled:!0,step:null},second:{enabled:!0,step:null},meridian:{enabled:!0}},dayPicker:{enabled:!0,titleFormat:"YYYY MMMM",titleFormatter:function(t,n){return new n(t).format(this.titleFormat)},onSelect:function(t){}},monthPicker:{enabled:!0,titleFormat:"YYYY",titleFormatter:function(t,n){return new n(t).format(this.titleFormat)},onSelect:function(t){}},yearPicker:{enabled:!0,titleFormat:"YYYY",titleFormatter:function(t,n){let e=new n(t).year(),r=e-e%12;return new n(t).year(r).format(this.titleFormat)+"-"+new n(t).year(r+11).format(this.titleFormat)},onSelect:function(t){}},infobox:{enabled:!0,titleFormat:"YYYY",titleFormatter:function(t,n){return new n(t).format(this.titleFormat)},selectedDateFormat:"dddd DD MMMM",selectedDateFormatter:function(t,n){return new n(t).format(this.selectedDateFormat)},selectedTimeFormat:"hh:mm:ss a",selectedTimeFormatter:function(t,n){return new n(t).format(this.selectedTimeFormat)}},onSelect:function(t){},onSet:function(t){},position:"auto",onShow:function(t){},onHide:function(t){},onToggle:function(t){},onDestroy:function(t){},autoClose:!1,template:null,observer:!1,inputDelay:800},wt="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var bt=function(t,n){return t(n={exports:{}},n.exports),n.exports}((function(t,n){(function(){var e,r=200,i="Unsupported core-js use. Try https://npms.io/search?q=ponyfill.",o="Expected a function",u="__lodash_hash_undefined__",a=500,c="__lodash_placeholder__",l=1,f=2,s=4,d=1,p=2,h=1,v=2,g=4,m=8,y=16,_=32,w=64,b=128,x=256,$=512,k=30,D="...",S=800,M=16,U=1,T=2,P=1/0,L=9007199254740991,C=17976931348623157e292,O=NaN,A=4294967295,j=A-1,I=A>>>1,E=[["ary",b],["bind",h],["bindKey",v],["curry",m],["curryRight",y],["flip",$],["partial",_],["partialRight",w],["rearg",x]],F="[object Arguments]",z="[object Array]",N="[object AsyncFunction]",R="[object Boolean]",B="[object Date]",V="[object DOMException]",Y="[object Error]",W="[object Function]",H="[object GeneratorFunction]",q="[object Map]",Z="[object Number]",J="[object Null]",K="[object Object]",G="[object Proxy]",X="[object RegExp]",Q="[object Set]",tt="[object String]",nt="[object Symbol]",et="[object Undefined]",rt="[object WeakMap]",it="[object WeakSet]",ot="[object ArrayBuffer]",ut="[object DataView]",at="[object Float32Array]",ct="[object Float64Array]",lt="[object Int8Array]",ft="[object Int16Array]",st="[object Int32Array]",dt="[object Uint8Array]",pt="[object Uint8ClampedArray]",ht="[object Uint16Array]",vt="[object Uint32Array]",gt=/\b__p \+= '';/g,mt=/\b(__p \+=) '' \+/g,yt=/(__e\(.*?\)|\b__t\)) \+\n'';/g,_t=/&(?:amp|lt|gt|quot|#39);/g,bt=/[&<>"']/g,xt=RegExp(_t.source),$t=RegExp(bt.source),kt=/<%-([\s\S]+?)%>/g,Dt=/<%([\s\S]+?)%>/g,St=/<%=([\s\S]+?)%>/g,Mt=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Ut=/^\w*$/,Tt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Pt=/[\\^$.*+?()[\]{}|]/g,Lt=RegExp(Pt.source),Ct=/^\s+|\s+$/g,Ot=/^\s+/,At=/\s+$/,jt=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,It=/\{\n\/\* \[wrapped with (.+)\] \*/,Et=/,? & /,Ft=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,zt=/\\(\\)?/g,Nt=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,Rt=/\w*$/,Bt=/^[-+]0x[0-9a-f]+$/i,Vt=/^0b[01]+$/i,Yt=/^\[object .+?Constructor\]$/,Wt=/^0o[0-7]+$/i,Ht=/^(?:0|[1-9]\d*)$/,qt=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,Zt=/($^)/,Jt=/['\n\r\u2028\u2029\\]/g,Kt="\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff",Gt="\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",Xt="[\\ud800-\\udfff]",Qt="["+Gt+"]",tn="["+Kt+"]",nn="\\d+",en="[\\u2700-\\u27bf]",rn="[a-z\\xdf-\\xf6\\xf8-\\xff]",on="[^\\ud800-\\udfff"+Gt+nn+"\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde]",un="\\ud83c[\\udffb-\\udfff]",an="[^\\ud800-\\udfff]",cn="(?:\\ud83c[\\udde6-\\uddff]){2}",ln="[\\ud800-\\udbff][\\udc00-\\udfff]",fn="[A-Z\\xc0-\\xd6\\xd8-\\xde]",sn="(?:"+rn+"|"+on+")",dn="(?:"+fn+"|"+on+")",pn="(?:"+tn+"|"+un+")"+"?",hn="[\\ufe0e\\ufe0f]?"+pn+("(?:\\u200d(?:"+[an,cn,ln].join("|")+")[\\ufe0e\\ufe0f]?"+pn+")*"),vn="(?:"+[en,cn,ln].join("|")+")"+hn,gn="(?:"+[an+tn+"?",tn,cn,ln,Xt].join("|")+")",mn=RegExp("['’]","g"),yn=RegExp(tn,"g"),_n=RegExp(un+"(?="+un+")|"+gn+hn,"g"),wn=RegExp([fn+"?"+rn+"+(?:['’](?:d|ll|m|re|s|t|ve))?(?="+[Qt,fn,"$"].join("|")+")",dn+"+(?:['’](?:D|LL|M|RE|S|T|VE))?(?="+[Qt,fn+sn,"$"].join("|")+")",fn+"?"+sn+"+(?:['’](?:d|ll|m|re|s|t|ve))?",fn+"+(?:['’](?:D|LL|M|RE|S|T|VE))?","\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])","\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])",nn,vn].join("|"),"g"),bn=RegExp("[\\u200d\\ud800-\\udfff"+Kt+"\\ufe0e\\ufe0f]"),xn=/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,$n=["Array","Buffer","DataView","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Math","Object","Promise","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseInt","setTimeout"],kn=-1,Dn={};Dn[at]=Dn[ct]=Dn[lt]=Dn[ft]=Dn[st]=Dn[dt]=Dn[pt]=Dn[ht]=Dn[vt]=!0,Dn[F]=Dn[z]=Dn[ot]=Dn[R]=Dn[ut]=Dn[B]=Dn[Y]=Dn[W]=Dn[q]=Dn[Z]=Dn[K]=Dn[X]=Dn[Q]=Dn[tt]=Dn[rt]=!1;var Sn={};Sn[F]=Sn[z]=Sn[ot]=Sn[ut]=Sn[R]=Sn[B]=Sn[at]=Sn[ct]=Sn[lt]=Sn[ft]=Sn[st]=Sn[q]=Sn[Z]=Sn[K]=Sn[X]=Sn[Q]=Sn[tt]=Sn[nt]=Sn[dt]=Sn[pt]=Sn[ht]=Sn[vt]=!0,Sn[Y]=Sn[W]=Sn[rt]=!1;var Mn={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Un=parseFloat,Tn=parseInt,Pn="object"==typeof wt&&wt&&wt.Object===Object&&wt,Ln="object"==typeof self&&self&&self.Object===Object&&self,Cn=Pn||Ln||Function("return this")(),On=n&&!n.nodeType&&n,An=On&&t&&!t.nodeType&&t,jn=An&&An.exports===On,In=jn&&Pn.process,En=function(){try{var t=An&&An.require&&An.require("util").types;return t||In&&In.binding&&In.binding("util")}catch(t){}}(),Fn=En&&En.isArrayBuffer,zn=En&&En.isDate,Nn=En&&En.isMap,Rn=En&&En.isRegExp,Bn=En&&En.isSet,Vn=En&&En.isTypedArray;function Yn(t,n,e){switch(e.length){case 0:return t.call(n);case 1:return t.call(n,e[0]);case 2:return t.call(n,e[0],e[1]);case 3:return t.call(n,e[0],e[1],e[2])}return t.apply(n,e)}function Wn(t,n,e,r){for(var i=-1,o=null==t?0:t.length;++i<o;){var u=t[i];n(r,u,e(u),t)}return r}function Hn(t,n){for(var e=-1,r=null==t?0:t.length;++e<r&&!1!==n(t[e],e,t););return t}function qn(t,n){for(var e=null==t?0:t.length;e--&&!1!==n(t[e],e,t););return t}function Zn(t,n){for(var e=-1,r=null==t?0:t.length;++e<r;)if(!n(t[e],e,t))return!1;return!0}function Jn(t,n){for(var e=-1,r=null==t?0:t.length,i=0,o=[];++e<r;){var u=t[e];n(u,e,t)&&(o[i++]=u)}return o}function Kn(t,n){return!!(null==t?0:t.length)&&ue(t,n,0)>-1}function Gn(t,n,e){for(var r=-1,i=null==t?0:t.length;++r<i;)if(e(n,t[r]))return!0;return!1}function Xn(t,n){for(var e=-1,r=null==t?0:t.length,i=Array(r);++e<r;)i[e]=n(t[e],e,t);return i}function Qn(t,n){for(var e=-1,r=n.length,i=t.length;++e<r;)t[i+e]=n[e];return t}function te(t,n,e,r){var i=-1,o=null==t?0:t.length;for(r&&o&&(e=t[++i]);++i<o;)e=n(e,t[i],i,t);return e}function ne(t,n,e,r){var i=null==t?0:t.length;for(r&&i&&(e=t[--i]);i--;)e=n(e,t[i],i,t);return e}function ee(t,n){for(var e=-1,r=null==t?0:t.length;++e<r;)if(n(t[e],e,t))return!0;return!1}var re=fe("length");function ie(t,n,e){var r;return e(t,(function(t,e,i){if(n(t,e,i))return r=e,!1})),r}function oe(t,n,e,r){for(var i=t.length,o=e+(r?1:-1);r?o--:++o<i;)if(n(t[o],o,t))return o;return-1}function ue(t,n,e){return n==n?function(t,n,e){var r=e-1,i=t.length;for(;++r<i;)if(t[r]===n)return r;return-1}(t,n,e):oe(t,ce,e)}function ae(t,n,e,r){for(var i=e-1,o=t.length;++i<o;)if(r(t[i],n))return i;return-1}function ce(t){return t!=t}function le(t,n){var e=null==t?0:t.length;return e?pe(t,n)/e:O}function fe(t){return function(n){return null==n?e:n[t]}}function se(t){return function(n){return null==t?e:t[n]}}function de(t,n,e,r,i){return i(t,(function(t,i,o){e=r?(r=!1,t):n(e,t,i,o)})),e}function pe(t,n){for(var r,i=-1,o=t.length;++i<o;){var u=n(t[i]);u!==e&&(r=r===e?u:r+u)}return r}function he(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}function ve(t){return function(n){return t(n)}}function ge(t,n){return Xn(n,(function(n){return t[n]}))}function me(t,n){return t.has(n)}function ye(t,n){for(var e=-1,r=t.length;++e<r&&ue(n,t[e],0)>-1;);return e}function _e(t,n){for(var e=t.length;e--&&ue(n,t[e],0)>-1;);return e}var we=se({"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss","Ā":"A","Ă":"A","Ą":"A","ā":"a","ă":"a","ą":"a","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","ć":"c","ĉ":"c","ċ":"c","č":"c","Ď":"D","Đ":"D","ď":"d","đ":"d","Ē":"E","Ĕ":"E","Ė":"E","Ę":"E","Ě":"E","ē":"e","ĕ":"e","ė":"e","ę":"e","ě":"e","Ĝ":"G","Ğ":"G","Ġ":"G","Ģ":"G","ĝ":"g","ğ":"g","ġ":"g","ģ":"g","Ĥ":"H","Ħ":"H","ĥ":"h","ħ":"h","Ĩ":"I","Ī":"I","Ĭ":"I","Į":"I","İ":"I","ĩ":"i","ī":"i","ĭ":"i","į":"i","ı":"i","Ĵ":"J","ĵ":"j","Ķ":"K","ķ":"k","ĸ":"k","Ĺ":"L","Ļ":"L","Ľ":"L","Ŀ":"L","Ł":"L","ĺ":"l","ļ":"l","ľ":"l","ŀ":"l","ł":"l","Ń":"N","Ņ":"N","Ň":"N","Ŋ":"N","ń":"n","ņ":"n","ň":"n","ŋ":"n","Ō":"O","Ŏ":"O","Ő":"O","ō":"o","ŏ":"o","ő":"o","Ŕ":"R","Ŗ":"R","Ř":"R","ŕ":"r","ŗ":"r","ř":"r","Ś":"S","Ŝ":"S","Ş":"S","Š":"S","ś":"s","ŝ":"s","ş":"s","š":"s","Ţ":"T","Ť":"T","Ŧ":"T","ţ":"t","ť":"t","ŧ":"t","Ũ":"U","Ū":"U","Ŭ":"U","Ů":"U","Ű":"U","Ų":"U","ũ":"u","ū":"u","ŭ":"u","ů":"u","ű":"u","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","Ż":"Z","Ž":"Z","ź":"z","ż":"z","ž":"z","Ĳ":"IJ","ĳ":"ij","Œ":"Oe","œ":"oe","ŉ":"'n","ſ":"s"}),be=se({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"});function xe(t){return"\\"+Mn[t]}function $e(t){return bn.test(t)}function ke(t){var n=-1,e=Array(t.size);return t.forEach((function(t,r){e[++n]=[r,t]})),e}function De(t,n){return function(e){return t(n(e))}}function Se(t,n){for(var e=-1,r=t.length,i=0,o=[];++e<r;){var u=t[e];u!==n&&u!==c||(t[e]=c,o[i++]=e)}return o}function Me(t){var n=-1,e=Array(t.size);return t.forEach((function(t){e[++n]=t})),e}function Ue(t){var n=-1,e=Array(t.size);return t.forEach((function(t){e[++n]=[t,t]})),e}function Te(t){return $e(t)?function(t){var n=_n.lastIndex=0;for(;_n.test(t);)++n;return n}(t):re(t)}function Pe(t){return $e(t)?function(t){return t.match(_n)||[]}(t):function(t){return t.split("")}(t)}var Le=se({"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"});var Ce=function t(n){var wt,Kt=(n=null==n?Cn:Ce.defaults(Cn.Object(),n,Ce.pick(Cn,$n))).Array,Gt=n.Date,Xt=n.Error,Qt=n.Function,tn=n.Math,nn=n.Object,en=n.RegExp,rn=n.String,on=n.TypeError,un=Kt.prototype,an=Qt.prototype,cn=nn.prototype,ln=n["__core-js_shared__"],fn=an.toString,sn=cn.hasOwnProperty,dn=0,pn=(wt=/[^.]+$/.exec(ln&&ln.keys&&ln.keys.IE_PROTO||""))?"Symbol(src)_1."+wt:"",hn=cn.toString,vn=fn.call(nn),gn=Cn._,_n=en("^"+fn.call(sn).replace(Pt,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),bn=jn?n.Buffer:e,Mn=n.Symbol,Pn=n.Uint8Array,Ln=bn?bn.allocUnsafe:e,On=De(nn.getPrototypeOf,nn),An=nn.create,In=cn.propertyIsEnumerable,En=un.splice,re=Mn?Mn.isConcatSpreadable:e,se=Mn?Mn.iterator:e,Oe=Mn?Mn.toStringTag:e,Ae=function(){try{var t=zo(nn,"defineProperty");return t({},"",{}),t}catch(t){}}(),je=n.clearTimeout!==Cn.clearTimeout&&n.clearTimeout,Ie=Gt&&Gt.now!==Cn.Date.now&&Gt.now,Ee=n.setTimeout!==Cn.setTimeout&&n.setTimeout,Fe=tn.ceil,ze=tn.floor,Ne=nn.getOwnPropertySymbols,Re=bn?bn.isBuffer:e,Be=n.isFinite,Ve=un.join,Ye=De(nn.keys,nn),We=tn.max,He=tn.min,qe=Gt.now,Ze=n.parseInt,Je=tn.random,Ke=un.reverse,Ge=zo(n,"DataView"),Xe=zo(n,"Map"),Qe=zo(n,"Promise"),tr=zo(n,"Set"),nr=zo(n,"WeakMap"),er=zo(nn,"create"),rr=nr&&new nr,ir={},or=su(Ge),ur=su(Xe),ar=su(Qe),cr=su(tr),lr=su(nr),fr=Mn?Mn.prototype:e,sr=fr?fr.valueOf:e,dr=fr?fr.toString:e;function pr(t){if(Ua(t)&&!ma(t)&&!(t instanceof mr)){if(t instanceof gr)return t;if(sn.call(t,"__wrapped__"))return du(t)}return new gr(t)}var hr=function(){function t(){}return function(n){if(!Ma(n))return{};if(An)return An(n);t.prototype=n;var r=new t;return t.prototype=e,r}}();function vr(){}function gr(t,n){this.__wrapped__=t,this.__actions__=[],this.__chain__=!!n,this.__index__=0,this.__values__=e}function mr(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=A,this.__views__=[]}function yr(t){var n=-1,e=null==t?0:t.length;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}function _r(t){var n=-1,e=null==t?0:t.length;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}function wr(t){var n=-1,e=null==t?0:t.length;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}function br(t){var n=-1,e=null==t?0:t.length;for(this.__data__=new wr;++n<e;)this.add(t[n])}function xr(t){var n=this.__data__=new _r(t);this.size=n.size}function $r(t,n){var e=ma(t),r=!e&&ga(t),i=!e&&!r&&ba(t),o=!e&&!r&&!i&&Ia(t),u=e||r||i||o,a=u?he(t.length,rn):[],c=a.length;for(var l in t)!n&&!sn.call(t,l)||u&&("length"==l||i&&("offset"==l||"parent"==l)||o&&("buffer"==l||"byteLength"==l||"byteOffset"==l)||Ho(l,c))||a.push(l);return a}function kr(t){var n=t.length;return n?t[bi(0,n-1)]:e}function Dr(t,n){return cu(eo(t),Ar(n,0,t.length))}function Sr(t){return cu(eo(t))}function Mr(t,n,r){(r===e||pa(t[n],r))&&(r!==e||n in t)||Cr(t,n,r)}function Ur(t,n,r){var i=t[n];sn.call(t,n)&&pa(i,r)&&(r!==e||n in t)||Cr(t,n,r)}function Tr(t,n){for(var e=t.length;e--;)if(pa(t[e][0],n))return e;return-1}function Pr(t,n,e,r){return zr(t,(function(t,i,o){n(r,t,e(t),o)})),r}function Lr(t,n){return t&&ro(n,ic(n),t)}function Cr(t,n,e){"__proto__"==n&&Ae?Ae(t,n,{configurable:!0,enumerable:!0,value:e,writable:!0}):t[n]=e}function Or(t,n){for(var r=-1,i=n.length,o=Kt(i),u=null==t;++r<i;)o[r]=u?e:Qa(t,n[r]);return o}function Ar(t,n,r){return t==t&&(r!==e&&(t=t<=r?t:r),n!==e&&(t=t>=n?t:n)),t}function jr(t,n,r,i,o,u){var a,c=n&l,d=n&f,p=n&s;if(r&&(a=o?r(t,i,o,u):r(t)),a!==e)return a;if(!Ma(t))return t;var h=ma(t);if(h){if(a=function(t){var n=t.length,e=new t.constructor(n);n&&"string"==typeof t[0]&&sn.call(t,"index")&&(e.index=t.index,e.input=t.input);return e}(t),!c)return eo(t,a)}else{var v=Bo(t),g=v==W||v==H;if(ba(t))return Ki(t,c);if(v==K||v==F||g&&!o){if(a=d||g?{}:Yo(t),!c)return d?function(t,n){return ro(t,Ro(t),n)}(t,function(t,n){return t&&ro(n,oc(n),t)}(a,t)):function(t,n){return ro(t,No(t),n)}(t,Lr(a,t))}else{if(!Sn[v])return o?t:{};a=function(t,n,e){var r=t.constructor;switch(n){case ot:return Gi(t);case R:case B:return new r(+t);case ut:return function(t,n){var e=n?Gi(t.buffer):t.buffer;return new t.constructor(e,t.byteOffset,t.byteLength)}(t,e);case at:case ct:case lt:case ft:case st:case dt:case pt:case ht:case vt:return Xi(t,e);case q:return new r;case Z:case tt:return new r(t);case X:return function(t){var n=new t.constructor(t.source,Rt.exec(t));return n.lastIndex=t.lastIndex,n}(t);case Q:return new r;case nt:return i=t,sr?nn(sr.call(i)):{}}var i}(t,v,c)}}u||(u=new xr);var m=u.get(t);if(m)return m;u.set(t,a),Oa(t)?t.forEach((function(e){a.add(jr(e,n,r,e,t,u))})):Ta(t)&&t.forEach((function(e,i){a.set(i,jr(e,n,r,i,t,u))}));var y=h?e:(p?d?Co:Lo:d?oc:ic)(t);return Hn(y||t,(function(e,i){y&&(e=t[i=e]),Ur(a,i,jr(e,n,r,i,t,u))})),a}function Ir(t,n,r){var i=r.length;if(null==t)return!i;for(t=nn(t);i--;){var o=r[i],u=n[o],a=t[o];if(a===e&&!(o in t)||!u(a))return!1}return!0}function Er(t,n,r){if("function"!=typeof t)throw new on(o);return iu((function(){t.apply(e,r)}),n)}function Fr(t,n,e,i){var o=-1,u=Kn,a=!0,c=t.length,l=[],f=n.length;if(!c)return l;e&&(n=Xn(n,ve(e))),i?(u=Gn,a=!1):n.length>=r&&(u=me,a=!1,n=new br(n));t:for(;++o<c;){var s=t[o],d=null==e?s:e(s);if(s=i||0!==s?s:0,a&&d==d){for(var p=f;p--;)if(n[p]===d)continue t;l.push(s)}else u(n,d,i)||l.push(s)}return l}pr.templateSettings={escape:kt,evaluate:Dt,interpolate:St,variable:"",imports:{_:pr}},pr.prototype=vr.prototype,pr.prototype.constructor=pr,gr.prototype=hr(vr.prototype),gr.prototype.constructor=gr,mr.prototype=hr(vr.prototype),mr.prototype.constructor=mr,yr.prototype.clear=function(){this.__data__=er?er(null):{},this.size=0},yr.prototype.delete=function(t){var n=this.has(t)&&delete this.__data__[t];return this.size-=n?1:0,n},yr.prototype.get=function(t){var n=this.__data__;if(er){var r=n[t];return r===u?e:r}return sn.call(n,t)?n[t]:e},yr.prototype.has=function(t){var n=this.__data__;return er?n[t]!==e:sn.call(n,t)},yr.prototype.set=function(t,n){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=er&&n===e?u:n,this},_r.prototype.clear=function(){this.__data__=[],this.size=0},_r.prototype.delete=function(t){var n=this.__data__,e=Tr(n,t);return!(e<0)&&(e==n.length-1?n.pop():En.call(n,e,1),--this.size,!0)},_r.prototype.get=function(t){var n=this.__data__,r=Tr(n,t);return r<0?e:n[r][1]},_r.prototype.has=function(t){return Tr(this.__data__,t)>-1},_r.prototype.set=function(t,n){var e=this.__data__,r=Tr(e,t);return r<0?(++this.size,e.push([t,n])):e[r][1]=n,this},wr.prototype.clear=function(){this.size=0,this.__data__={hash:new yr,map:new(Xe||_r),string:new yr}},wr.prototype.delete=function(t){var n=Eo(this,t).delete(t);return this.size-=n?1:0,n},wr.prototype.get=function(t){return Eo(this,t).get(t)},wr.prototype.has=function(t){return Eo(this,t).has(t)},wr.prototype.set=function(t,n){var e=Eo(this,t),r=e.size;return e.set(t,n),this.size+=e.size==r?0:1,this},br.prototype.add=br.prototype.push=function(t){return this.__data__.set(t,u),this},br.prototype.has=function(t){return this.__data__.has(t)},xr.prototype.clear=function(){this.__data__=new _r,this.size=0},xr.prototype.delete=function(t){var n=this.__data__,e=n.delete(t);return this.size=n.size,e},xr.prototype.get=function(t){return this.__data__.get(t)},xr.prototype.has=function(t){return this.__data__.has(t)},xr.prototype.set=function(t,n){var e=this.__data__;if(e instanceof _r){var i=e.__data__;if(!Xe||i.length<r-1)return i.push([t,n]),this.size=++e.size,this;e=this.__data__=new wr(i)}return e.set(t,n),this.size=e.size,this};var zr=uo(qr),Nr=uo(Zr,!0);function Rr(t,n){var e=!0;return zr(t,(function(t,r,i){return e=!!n(t,r,i)})),e}function Br(t,n,r){for(var i=-1,o=t.length;++i<o;){var u=t[i],a=n(u);if(null!=a&&(c===e?a==a&&!ja(a):r(a,c)))var c=a,l=u}return l}function Vr(t,n){var e=[];return zr(t,(function(t,r,i){n(t,r,i)&&e.push(t)})),e}function Yr(t,n,e,r,i){var o=-1,u=t.length;for(e||(e=Wo),i||(i=[]);++o<u;){var a=t[o];n>0&&e(a)?n>1?Yr(a,n-1,e,r,i):Qn(i,a):r||(i[i.length]=a)}return i}var Wr=ao(),Hr=ao(!0);function qr(t,n){return t&&Wr(t,n,ic)}function Zr(t,n){return t&&Hr(t,n,ic)}function Jr(t,n){return Jn(n,(function(n){return ka(t[n])}))}function Kr(t,n){for(var r=0,i=(n=Hi(n,t)).length;null!=t&&r<i;)t=t[fu(n[r++])];return r&&r==i?t:e}function Gr(t,n,e){var r=n(t);return ma(t)?r:Qn(r,e(t))}function Xr(t){return null==t?t===e?et:J:Oe&&Oe in nn(t)?function(t){var n=sn.call(t,Oe),r=t[Oe];try{t[Oe]=e;var i=!0}catch(t){}var o=hn.call(t);i&&(n?t[Oe]=r:delete t[Oe]);return o}(t):function(t){return hn.call(t)}(t)}function Qr(t,n){return t>n}function ti(t,n){return null!=t&&sn.call(t,n)}function ni(t,n){return null!=t&&n in nn(t)}function ei(t,n,r){for(var i=r?Gn:Kn,o=t[0].length,u=t.length,a=u,c=Kt(u),l=1/0,f=[];a--;){var s=t[a];a&&n&&(s=Xn(s,ve(n))),l=He(s.length,l),c[a]=!r&&(n||o>=120&&s.length>=120)?new br(a&&s):e}s=t[0];var d=-1,p=c[0];t:for(;++d<o&&f.length<l;){var h=s[d],v=n?n(h):h;if(h=r||0!==h?h:0,!(p?me(p,v):i(f,v,r))){for(a=u;--a;){var g=c[a];if(!(g?me(g,v):i(t[a],v,r)))continue t}p&&p.push(v),f.push(h)}}return f}function ri(t,n,r){var i=null==(t=nu(t,n=Hi(n,t)))?t:t[fu($u(n))];return null==i?e:Yn(i,t,r)}function ii(t){return Ua(t)&&Xr(t)==F}function oi(t,n,r,i,o){return t===n||(null==t||null==n||!Ua(t)&&!Ua(n)?t!=t&&n!=n:function(t,n,r,i,o,u){var a=ma(t),c=ma(n),l=a?z:Bo(t),f=c?z:Bo(n),s=(l=l==F?K:l)==K,h=(f=f==F?K:f)==K,v=l==f;if(v&&ba(t)){if(!ba(n))return!1;a=!0,s=!1}if(v&&!s)return u||(u=new xr),a||Ia(t)?To(t,n,r,i,o,u):function(t,n,e,r,i,o,u){switch(e){case ut:if(t.byteLength!=n.byteLength||t.byteOffset!=n.byteOffset)return!1;t=t.buffer,n=n.buffer;case ot:return!(t.byteLength!=n.byteLength||!o(new Pn(t),new Pn(n)));case R:case B:case Z:return pa(+t,+n);case Y:return t.name==n.name&&t.message==n.message;case X:case tt:return t==n+"";case q:var a=ke;case Q:var c=r&d;if(a||(a=Me),t.size!=n.size&&!c)return!1;var l=u.get(t);if(l)return l==n;r|=p,u.set(t,n);var f=To(a(t),a(n),r,i,o,u);return u.delete(t),f;case nt:if(sr)return sr.call(t)==sr.call(n)}return!1}(t,n,l,r,i,o,u);if(!(r&d)){var g=s&&sn.call(t,"__wrapped__"),m=h&&sn.call(n,"__wrapped__");if(g||m){var y=g?t.value():t,_=m?n.value():n;return u||(u=new xr),o(y,_,r,i,u)}}if(!v)return!1;return u||(u=new xr),function(t,n,r,i,o,u){var a=r&d,c=Lo(t),l=c.length,f=Lo(n).length;if(l!=f&&!a)return!1;var s=l;for(;s--;){var p=c[s];if(!(a?p in n:sn.call(n,p)))return!1}var h=u.get(t);if(h&&u.get(n))return h==n;var v=!0;u.set(t,n),u.set(n,t);var g=a;for(;++s<l;){p=c[s];var m=t[p],y=n[p];if(i)var _=a?i(y,m,p,n,t,u):i(m,y,p,t,n,u);if(!(_===e?m===y||o(m,y,r,i,u):_)){v=!1;break}g||(g="constructor"==p)}if(v&&!g){var w=t.constructor,b=n.constructor;w!=b&&"constructor"in t&&"constructor"in n&&!("function"==typeof w&&w instanceof w&&"function"==typeof b&&b instanceof b)&&(v=!1)}return u.delete(t),u.delete(n),v}(t,n,r,i,o,u)}(t,n,r,i,oi,o))}function ui(t,n,r,i){var o=r.length,u=o,a=!i;if(null==t)return!u;for(t=nn(t);o--;){var c=r[o];if(a&&c[2]?c[1]!==t[c[0]]:!(c[0]in t))return!1}for(;++o<u;){var l=(c=r[o])[0],f=t[l],s=c[1];if(a&&c[2]){if(f===e&&!(l in t))return!1}else{var h=new xr;if(i)var v=i(f,s,l,t,n,h);if(!(v===e?oi(s,f,d|p,i,h):v))return!1}}return!0}function ai(t){return!(!Ma(t)||(n=t,pn&&pn in n))&&(ka(t)?_n:Yt).test(su(t));var n}function ci(t){return"function"==typeof t?t:null==t?Pc:"object"==typeof t?ma(t)?hi(t[0],t[1]):pi(t):zc(t)}function li(t){if(!Go(t))return Ye(t);var n=[];for(var e in nn(t))sn.call(t,e)&&"constructor"!=e&&n.push(e);return n}function fi(t){if(!Ma(t))return function(t){var n=[];if(null!=t)for(var e in nn(t))n.push(e);return n}(t);var n=Go(t),e=[];for(var r in t)("constructor"!=r||!n&&sn.call(t,r))&&e.push(r);return e}function si(t,n){return t<n}function di(t,n){var e=-1,r=_a(t)?Kt(t.length):[];return zr(t,(function(t,i,o){r[++e]=n(t,i,o)})),r}function pi(t){var n=Fo(t);return 1==n.length&&n[0][2]?Qo(n[0][0],n[0][1]):function(e){return e===t||ui(e,t,n)}}function hi(t,n){return Zo(t)&&Xo(n)?Qo(fu(t),n):function(r){var i=Qa(r,t);return i===e&&i===n?tc(r,t):oi(n,i,d|p)}}function vi(t,n,r,i,o){t!==n&&Wr(n,(function(u,a){if(o||(o=new xr),Ma(u))!function(t,n,r,i,o,u,a){var c=eu(t,r),l=eu(n,r),f=a.get(l);if(f)return void Mr(t,r,f);var s=u?u(c,l,r+"",t,n,a):e,d=s===e;if(d){var p=ma(l),h=!p&&ba(l),v=!p&&!h&&Ia(l);s=l,p||h||v?ma(c)?s=c:wa(c)?s=eo(c):h?(d=!1,s=Ki(l,!0)):v?(d=!1,s=Xi(l,!0)):s=[]:La(l)||ga(l)?(s=c,ga(c)?s=Ya(c):Ma(c)&&!ka(c)||(s=Yo(l))):d=!1}d&&(a.set(l,s),o(s,l,i,u,a),a.delete(l));Mr(t,r,s)}(t,n,a,r,vi,i,o);else{var c=i?i(eu(t,a),u,a+"",t,n,o):e;c===e&&(c=u),Mr(t,a,c)}}),oc)}function gi(t,n){var r=t.length;if(r)return Ho(n+=n<0?r:0,r)?t[n]:e}function mi(t,n,e){var r=-1;return n=Xn(n.length?n:[Pc],ve(Io())),function(t,n){var e=t.length;for(t.sort(n);e--;)t[e]=t[e].value;return t}(di(t,(function(t,e,i){return{criteria:Xn(n,(function(n){return n(t)})),index:++r,value:t}})),(function(t,n){return function(t,n,e){var r=-1,i=t.criteria,o=n.criteria,u=i.length,a=e.length;for(;++r<u;){var c=Qi(i[r],o[r]);if(c){if(r>=a)return c;var l=e[r];return c*("desc"==l?-1:1)}}return t.index-n.index}(t,n,e)}))}function yi(t,n,e){for(var r=-1,i=n.length,o={};++r<i;){var u=n[r],a=Kr(t,u);e(a,u)&&Si(o,Hi(u,t),a)}return o}function _i(t,n,e,r){var i=r?ae:ue,o=-1,u=n.length,a=t;for(t===n&&(n=eo(n)),e&&(a=Xn(t,ve(e)));++o<u;)for(var c=0,l=n[o],f=e?e(l):l;(c=i(a,f,c,r))>-1;)a!==t&&En.call(a,c,1),En.call(t,c,1);return t}function wi(t,n){for(var e=t?n.length:0,r=e-1;e--;){var i=n[e];if(e==r||i!==o){var o=i;Ho(i)?En.call(t,i,1):Fi(t,i)}}return t}function bi(t,n){return t+ze(Je()*(n-t+1))}function xi(t,n){var e="";if(!t||n<1||n>L)return e;do{n%2&&(e+=t),(n=ze(n/2))&&(t+=t)}while(n);return e}function $i(t,n){return ou(tu(t,n,Pc),t+"")}function ki(t){return kr(pc(t))}function Di(t,n){var e=pc(t);return cu(e,Ar(n,0,e.length))}function Si(t,n,r,i){if(!Ma(t))return t;for(var o=-1,u=(n=Hi(n,t)).length,a=u-1,c=t;null!=c&&++o<u;){var l=fu(n[o]),f=r;if(o!=a){var s=c[l];(f=i?i(s,l,c):e)===e&&(f=Ma(s)?s:Ho(n[o+1])?[]:{})}Ur(c,l,f),c=c[l]}return t}var Mi=rr?function(t,n){return rr.set(t,n),t}:Pc,Ui=Ae?function(t,n){return Ae(t,"toString",{configurable:!0,enumerable:!1,value:Mc(n),writable:!0})}:Pc;function Ti(t){return cu(pc(t))}function Pi(t,n,e){var r=-1,i=t.length;n<0&&(n=-n>i?0:i+n),(e=e>i?i:e)<0&&(e+=i),i=n>e?0:e-n>>>0,n>>>=0;for(var o=Kt(i);++r<i;)o[r]=t[r+n];return o}function Li(t,n){var e;return zr(t,(function(t,r,i){return!(e=n(t,r,i))})),!!e}function Ci(t,n,e){var r=0,i=null==t?r:t.length;if("number"==typeof n&&n==n&&i<=I){for(;r<i;){var o=r+i>>>1,u=t[o];null!==u&&!ja(u)&&(e?u<=n:u<n)?r=o+1:i=o}return i}return Oi(t,n,Pc,e)}function Oi(t,n,r,i){n=r(n);for(var o=0,u=null==t?0:t.length,a=n!=n,c=null===n,l=ja(n),f=n===e;o<u;){var s=ze((o+u)/2),d=r(t[s]),p=d!==e,h=null===d,v=d==d,g=ja(d);if(a)var m=i||v;else m=f?v&&(i||p):c?v&&p&&(i||!h):l?v&&p&&!h&&(i||!g):!h&&!g&&(i?d<=n:d<n);m?o=s+1:u=s}return He(u,j)}function Ai(t,n){for(var e=-1,r=t.length,i=0,o=[];++e<r;){var u=t[e],a=n?n(u):u;if(!e||!pa(a,c)){var c=a;o[i++]=0===u?0:u}}return o}function ji(t){return"number"==typeof t?t:ja(t)?O:+t}function Ii(t){if("string"==typeof t)return t;if(ma(t))return Xn(t,Ii)+"";if(ja(t))return dr?dr.call(t):"";var n=t+"";return"0"==n&&1/t==-P?"-0":n}function Ei(t,n,e){var i=-1,o=Kn,u=t.length,a=!0,c=[],l=c;if(e)a=!1,o=Gn;else if(u>=r){var f=n?null:$o(t);if(f)return Me(f);a=!1,o=me,l=new br}else l=n?[]:c;t:for(;++i<u;){var s=t[i],d=n?n(s):s;if(s=e||0!==s?s:0,a&&d==d){for(var p=l.length;p--;)if(l[p]===d)continue t;n&&l.push(d),c.push(s)}else o(l,d,e)||(l!==c&&l.push(d),c.push(s))}return c}function Fi(t,n){return null==(t=nu(t,n=Hi(n,t)))||delete t[fu($u(n))]}function zi(t,n,e,r){return Si(t,n,e(Kr(t,n)),r)}function Ni(t,n,e,r){for(var i=t.length,o=r?i:-1;(r?o--:++o<i)&&n(t[o],o,t););return e?Pi(t,r?0:o,r?o+1:i):Pi(t,r?o+1:0,r?i:o)}function Ri(t,n){var e=t;return e instanceof mr&&(e=e.value()),te(n,(function(t,n){return n.func.apply(n.thisArg,Qn([t],n.args))}),e)}function Bi(t,n,e){var r=t.length;if(r<2)return r?Ei(t[0]):[];for(var i=-1,o=Kt(r);++i<r;)for(var u=t[i],a=-1;++a<r;)a!=i&&(o[i]=Fr(o[i]||u,t[a],n,e));return Ei(Yr(o,1),n,e)}function Vi(t,n,r){for(var i=-1,o=t.length,u=n.length,a={};++i<o;){var c=i<u?n[i]:e;r(a,t[i],c)}return a}function Yi(t){return wa(t)?t:[]}function Wi(t){return"function"==typeof t?t:Pc}function Hi(t,n){return ma(t)?t:Zo(t,n)?[t]:lu(Wa(t))}var qi=$i;function Zi(t,n,r){var i=t.length;return r=r===e?i:r,!n&&r>=i?t:Pi(t,n,r)}var Ji=je||function(t){return Cn.clearTimeout(t)};function Ki(t,n){if(n)return t.slice();var e=t.length,r=Ln?Ln(e):new t.constructor(e);return t.copy(r),r}function Gi(t){var n=new t.constructor(t.byteLength);return new Pn(n).set(new Pn(t)),n}function Xi(t,n){var e=n?Gi(t.buffer):t.buffer;return new t.constructor(e,t.byteOffset,t.length)}function Qi(t,n){if(t!==n){var r=t!==e,i=null===t,o=t==t,u=ja(t),a=n!==e,c=null===n,l=n==n,f=ja(n);if(!c&&!f&&!u&&t>n||u&&a&&l&&!c&&!f||i&&a&&l||!r&&l||!o)return 1;if(!i&&!u&&!f&&t<n||f&&r&&o&&!i&&!u||c&&r&&o||!a&&o||!l)return-1}return 0}function to(t,n,e,r){for(var i=-1,o=t.length,u=e.length,a=-1,c=n.length,l=We(o-u,0),f=Kt(c+l),s=!r;++a<c;)f[a]=n[a];for(;++i<u;)(s||i<o)&&(f[e[i]]=t[i]);for(;l--;)f[a++]=t[i++];return f}function no(t,n,e,r){for(var i=-1,o=t.length,u=-1,a=e.length,c=-1,l=n.length,f=We(o-a,0),s=Kt(f+l),d=!r;++i<f;)s[i]=t[i];for(var p=i;++c<l;)s[p+c]=n[c];for(;++u<a;)(d||i<o)&&(s[p+e[u]]=t[i++]);return s}function eo(t,n){var e=-1,r=t.length;for(n||(n=Kt(r));++e<r;)n[e]=t[e];return n}function ro(t,n,r,i){var o=!r;r||(r={});for(var u=-1,a=n.length;++u<a;){var c=n[u],l=i?i(r[c],t[c],c,r,t):e;l===e&&(l=t[c]),o?Cr(r,c,l):Ur(r,c,l)}return r}function io(t,n){return function(e,r){var i=ma(e)?Wn:Pr,o=n?n():{};return i(e,t,Io(r,2),o)}}function oo(t){return $i((function(n,r){var i=-1,o=r.length,u=o>1?r[o-1]:e,a=o>2?r[2]:e;for(u=t.length>3&&"function"==typeof u?(o--,u):e,a&&qo(r[0],r[1],a)&&(u=o<3?e:u,o=1),n=nn(n);++i<o;){var c=r[i];c&&t(n,c,i,u)}return n}))}function uo(t,n){return function(e,r){if(null==e)return e;if(!_a(e))return t(e,r);for(var i=e.length,o=n?i:-1,u=nn(e);(n?o--:++o<i)&&!1!==r(u[o],o,u););return e}}function ao(t){return function(n,e,r){for(var i=-1,o=nn(n),u=r(n),a=u.length;a--;){var c=u[t?a:++i];if(!1===e(o[c],c,o))break}return n}}function co(t){return function(n){var r=$e(n=Wa(n))?Pe(n):e,i=r?r[0]:n.charAt(0),o=r?Zi(r,1).join(""):n.slice(1);return i[t]()+o}}function lo(t){return function(n){return te(kc(gc(n).replace(mn,"")),t,"")}}function fo(t){return function(){var n=arguments;switch(n.length){case 0:return new t;case 1:return new t(n[0]);case 2:return new t(n[0],n[1]);case 3:return new t(n[0],n[1],n[2]);case 4:return new t(n[0],n[1],n[2],n[3]);case 5:return new t(n[0],n[1],n[2],n[3],n[4]);case 6:return new t(n[0],n[1],n[2],n[3],n[4],n[5]);case 7:return new t(n[0],n[1],n[2],n[3],n[4],n[5],n[6])}var e=hr(t.prototype),r=t.apply(e,n);return Ma(r)?r:e}}function so(t){return function(n,r,i){var o=nn(n);if(!_a(n)){var u=Io(r,3);n=ic(n),r=function(t){return u(o[t],t,o)}}var a=t(n,r,i);return a>-1?o[u?n[a]:a]:e}}function po(t){return Po((function(n){var r=n.length,i=r,u=gr.prototype.thru;for(t&&n.reverse();i--;){var a=n[i];if("function"!=typeof a)throw new on(o);if(u&&!c&&"wrapper"==Ao(a))var c=new gr([],!0)}for(i=c?i:r;++i<r;){var l=Ao(a=n[i]),f="wrapper"==l?Oo(a):e;c=f&&Jo(f[0])&&f[1]==(b|m|_|x)&&!f[4].length&&1==f[9]?c[Ao(f[0])].apply(c,f[3]):1==a.length&&Jo(a)?c[l]():c.thru(a)}return function(){var t=arguments,e=t[0];if(c&&1==t.length&&ma(e))return c.plant(e).value();for(var i=0,o=r?n[i].apply(this,t):e;++i<r;)o=n[i].call(this,o);return o}}))}function ho(t,n,r,i,o,u,a,c,l,f){var s=n&b,d=n&h,p=n&v,g=n&(m|y),_=n&$,w=p?e:fo(t);return function h(){for(var v=arguments.length,m=Kt(v),y=v;y--;)m[y]=arguments[y];if(g)var b=jo(h),x=function(t,n){for(var e=t.length,r=0;e--;)t[e]===n&&++r;return r}(m,b);if(i&&(m=to(m,i,o,g)),u&&(m=no(m,u,a,g)),v-=x,g&&v<f){var $=Se(m,b);return bo(t,n,ho,h.placeholder,r,m,$,c,l,f-v)}var k=d?r:this,D=p?k[t]:t;return v=m.length,c?m=function(t,n){var r=t.length,i=He(n.length,r),o=eo(t);for(;i--;){var u=n[i];t[i]=Ho(u,r)?o[u]:e}return t}(m,c):_&&v>1&&m.reverse(),s&&l<v&&(m.length=l),this&&this!==Cn&&this instanceof h&&(D=w||fo(D)),D.apply(k,m)}}function vo(t,n){return function(e,r){return function(t,n,e,r){return qr(t,(function(t,i,o){n(r,e(t),i,o)})),r}(e,t,n(r),{})}}function go(t,n){return function(r,i){var o;if(r===e&&i===e)return n;if(r!==e&&(o=r),i!==e){if(o===e)return i;"string"==typeof r||"string"==typeof i?(r=Ii(r),i=Ii(i)):(r=ji(r),i=ji(i)),o=t(r,i)}return o}}function mo(t){return Po((function(n){return n=Xn(n,ve(Io())),$i((function(e){var r=this;return t(n,(function(t){return Yn(t,r,e)}))}))}))}function yo(t,n){var r=(n=n===e?" ":Ii(n)).length;if(r<2)return r?xi(n,t):n;var i=xi(n,Fe(t/Te(n)));return $e(n)?Zi(Pe(i),0,t).join(""):i.slice(0,t)}function _o(t){return function(n,r,i){return i&&"number"!=typeof i&&qo(n,r,i)&&(r=i=e),n=Na(n),r===e?(r=n,n=0):r=Na(r),function(t,n,e,r){for(var i=-1,o=We(Fe((n-t)/(e||1)),0),u=Kt(o);o--;)u[r?o:++i]=t,t+=e;return u}(n,r,i=i===e?n<r?1:-1:Na(i),t)}}function wo(t){return function(n,e){return"string"==typeof n&&"string"==typeof e||(n=Va(n),e=Va(e)),t(n,e)}}function bo(t,n,r,i,o,u,a,c,l,f){var s=n&m;n|=s?_:w,(n&=~(s?w:_))&g||(n&=~(h|v));var d=[t,n,o,s?u:e,s?a:e,s?e:u,s?e:a,c,l,f],p=r.apply(e,d);return Jo(t)&&ru(p,d),p.placeholder=i,uu(p,t,n)}function xo(t){var n=tn[t];return function(t,e){if(t=Va(t),(e=null==e?0:He(Ra(e),292))&&Be(t)){var r=(Wa(t)+"e").split("e");return+((r=(Wa(n(r[0]+"e"+(+r[1]+e)))+"e").split("e"))[0]+"e"+(+r[1]-e))}return n(t)}}var $o=tr&&1/Me(new tr([,-0]))[1]==P?function(t){return new tr(t)}:jc;function ko(t){return function(n){var e=Bo(n);return e==q?ke(n):e==Q?Ue(n):function(t,n){return Xn(n,(function(n){return[n,t[n]]}))}(n,t(n))}}function Do(t,n,r,i,u,a,l,f){var s=n&v;if(!s&&"function"!=typeof t)throw new on(o);var d=i?i.length:0;if(d||(n&=~(_|w),i=u=e),l=l===e?l:We(Ra(l),0),f=f===e?f:Ra(f),d-=u?u.length:0,n&w){var p=i,$=u;i=u=e}var k=s?e:Oo(t),D=[t,n,r,i,u,p,$,a,l,f];if(k&&function(t,n){var e=t[1],r=n[1],i=e|r,o=i<(h|v|b),u=r==b&&e==m||r==b&&e==x&&t[7].length<=n[8]||r==(b|x)&&n[7].length<=n[8]&&e==m;if(!o&&!u)return t;r&h&&(t[2]=n[2],i|=e&h?0:g);var a=n[3];if(a){var l=t[3];t[3]=l?to(l,a,n[4]):a,t[4]=l?Se(t[3],c):n[4]}(a=n[5])&&(l=t[5],t[5]=l?no(l,a,n[6]):a,t[6]=l?Se(t[5],c):n[6]);(a=n[7])&&(t[7]=a);r&b&&(t[8]=null==t[8]?n[8]:He(t[8],n[8]));null==t[9]&&(t[9]=n[9]);t[0]=n[0],t[1]=i}(D,k),t=D[0],n=D[1],r=D[2],i=D[3],u=D[4],!(f=D[9]=D[9]===e?s?0:t.length:We(D[9]-d,0))&&n&(m|y)&&(n&=~(m|y)),n&&n!=h)S=n==m||n==y?function(t,n,r){var i=fo(t);return function o(){for(var u=arguments.length,a=Kt(u),c=u,l=jo(o);c--;)a[c]=arguments[c];var f=u<3&&a[0]!==l&&a[u-1]!==l?[]:Se(a,l);return(u-=f.length)<r?bo(t,n,ho,o.placeholder,e,a,f,e,e,r-u):Yn(this&&this!==Cn&&this instanceof o?i:t,this,a)}}(t,n,f):n!=_&&n!=(h|_)||u.length?ho.apply(e,D):function(t,n,e,r){var i=n&h,o=fo(t);return function n(){for(var u=-1,a=arguments.length,c=-1,l=r.length,f=Kt(l+a),s=this&&this!==Cn&&this instanceof n?o:t;++c<l;)f[c]=r[c];for(;a--;)f[c++]=arguments[++u];return Yn(s,i?e:this,f)}}(t,n,r,i);else var S=function(t,n,e){var r=n&h,i=fo(t);return function n(){return(this&&this!==Cn&&this instanceof n?i:t).apply(r?e:this,arguments)}}(t,n,r);return uu((k?Mi:ru)(S,D),t,n)}function So(t,n,r,i){return t===e||pa(t,cn[r])&&!sn.call(i,r)?n:t}function Mo(t,n,r,i,o,u){return Ma(t)&&Ma(n)&&(u.set(n,t),vi(t,n,e,Mo,u),u.delete(n)),t}function Uo(t){return La(t)?e:t}function To(t,n,r,i,o,u){var a=r&d,c=t.length,l=n.length;if(c!=l&&!(a&&l>c))return!1;var f=u.get(t);if(f&&u.get(n))return f==n;var s=-1,h=!0,v=r&p?new br:e;for(u.set(t,n),u.set(n,t);++s<c;){var g=t[s],m=n[s];if(i)var y=a?i(m,g,s,n,t,u):i(g,m,s,t,n,u);if(y!==e){if(y)continue;h=!1;break}if(v){if(!ee(n,(function(t,n){if(!me(v,n)&&(g===t||o(g,t,r,i,u)))return v.push(n)}))){h=!1;break}}else if(g!==m&&!o(g,m,r,i,u)){h=!1;break}}return u.delete(t),u.delete(n),h}function Po(t){return ou(tu(t,e,yu),t+"")}function Lo(t){return Gr(t,ic,No)}function Co(t){return Gr(t,oc,Ro)}var Oo=rr?function(t){return rr.get(t)}:jc;function Ao(t){for(var n=t.name+"",e=ir[n],r=sn.call(ir,n)?e.length:0;r--;){var i=e[r],o=i.func;if(null==o||o==t)return i.name}return n}function jo(t){return(sn.call(pr,"placeholder")?pr:t).placeholder}function Io(){var t=pr.iteratee||Lc;return t=t===Lc?ci:t,arguments.length?t(arguments[0],arguments[1]):t}function Eo(t,n){var e,r,i=t.__data__;return("string"==(r=typeof(e=n))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==e:null===e)?i["string"==typeof n?"string":"hash"]:i.map}function Fo(t){for(var n=ic(t),e=n.length;e--;){var r=n[e],i=t[r];n[e]=[r,i,Xo(i)]}return n}function zo(t,n){var r=function(t,n){return null==t?e:t[n]}(t,n);return ai(r)?r:e}var No=Ne?function(t){return null==t?[]:(t=nn(t),Jn(Ne(t),(function(n){return In.call(t,n)})))}:Bc,Ro=Ne?function(t){for(var n=[];t;)Qn(n,No(t)),t=On(t);return n}:Bc,Bo=Xr;function Vo(t,n,e){for(var r=-1,i=(n=Hi(n,t)).length,o=!1;++r<i;){var u=fu(n[r]);if(!(o=null!=t&&e(t,u)))break;t=t[u]}return o||++r!=i?o:!!(i=null==t?0:t.length)&&Sa(i)&&Ho(u,i)&&(ma(t)||ga(t))}function Yo(t){return"function"!=typeof t.constructor||Go(t)?{}:hr(On(t))}function Wo(t){return ma(t)||ga(t)||!!(re&&t&&t[re])}function Ho(t,n){var e=typeof t;return!!(n=null==n?L:n)&&("number"==e||"symbol"!=e&&Ht.test(t))&&t>-1&&t%1==0&&t<n}function qo(t,n,e){if(!Ma(e))return!1;var r=typeof n;return!!("number"==r?_a(e)&&Ho(n,e.length):"string"==r&&n in e)&&pa(e[n],t)}function Zo(t,n){if(ma(t))return!1;var e=typeof t;return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!ja(t))||(Ut.test(t)||!Mt.test(t)||null!=n&&t in nn(n))}function Jo(t){var n=Ao(t),e=pr[n];if("function"!=typeof e||!(n in mr.prototype))return!1;if(t===e)return!0;var r=Oo(e);return!!r&&t===r[0]}(Ge&&Bo(new Ge(new ArrayBuffer(1)))!=ut||Xe&&Bo(new Xe)!=q||Qe&&"[object Promise]"!=Bo(Qe.resolve())||tr&&Bo(new tr)!=Q||nr&&Bo(new nr)!=rt)&&(Bo=function(t){var n=Xr(t),r=n==K?t.constructor:e,i=r?su(r):"";if(i)switch(i){case or:return ut;case ur:return q;case ar:return"[object Promise]";case cr:return Q;case lr:return rt}return n});var Ko=ln?ka:Vc;function Go(t){var n=t&&t.constructor;return t===("function"==typeof n&&n.prototype||cn)}function Xo(t){return t==t&&!Ma(t)}function Qo(t,n){return function(r){return null!=r&&(r[t]===n&&(n!==e||t in nn(r)))}}function tu(t,n,r){return n=We(n===e?t.length-1:n,0),function(){for(var e=arguments,i=-1,o=We(e.length-n,0),u=Kt(o);++i<o;)u[i]=e[n+i];i=-1;for(var a=Kt(n+1);++i<n;)a[i]=e[i];return a[n]=r(u),Yn(t,this,a)}}function nu(t,n){return n.length<2?t:Kr(t,Pi(n,0,-1))}function eu(t,n){if(("constructor"!==n||"function"!=typeof t[n])&&"__proto__"!=n)return t[n]}var ru=au(Mi),iu=Ee||function(t,n){return Cn.setTimeout(t,n)},ou=au(Ui);function uu(t,n,e){var r=n+"";return ou(t,function(t,n){var e=n.length;if(!e)return t;var r=e-1;return n[r]=(e>1?"& ":"")+n[r],n=n.join(e>2?", ":" "),t.replace(jt,"{\n/* [wrapped with "+n+"] */\n")}(r,function(t,n){return Hn(E,(function(e){var r="_."+e[0];n&e[1]&&!Kn(t,r)&&t.push(r)})),t.sort()}(function(t){var n=t.match(It);return n?n[1].split(Et):[]}(r),e)))}function au(t){var n=0,r=0;return function(){var i=qe(),o=M-(i-r);if(r=i,o>0){if(++n>=S)return arguments[0]}else n=0;return t.apply(e,arguments)}}function cu(t,n){var r=-1,i=t.length,o=i-1;for(n=n===e?i:n;++r<n;){var u=bi(r,o),a=t[u];t[u]=t[r],t[r]=a}return t.length=n,t}var lu=function(t){var n=aa(t,(function(t){return e.size===a&&e.clear(),t})),e=n.cache;return n}((function(t){var n=[];return 46===t.charCodeAt(0)&&n.push(""),t.replace(Tt,(function(t,e,r,i){n.push(r?i.replace(zt,"$1"):e||t)})),n}));function fu(t){if("string"==typeof t||ja(t))return t;var n=t+"";return"0"==n&&1/t==-P?"-0":n}function su(t){if(null!=t){try{return fn.call(t)}catch(t){}try{return t+""}catch(t){}}return""}function du(t){if(t instanceof mr)return t.clone();var n=new gr(t.__wrapped__,t.__chain__);return n.__actions__=eo(t.__actions__),n.__index__=t.__index__,n.__values__=t.__values__,n}var pu=$i((function(t,n){return wa(t)?Fr(t,Yr(n,1,wa,!0)):[]})),hu=$i((function(t,n){var r=$u(n);return wa(r)&&(r=e),wa(t)?Fr(t,Yr(n,1,wa,!0),Io(r,2)):[]})),vu=$i((function(t,n){var r=$u(n);return wa(r)&&(r=e),wa(t)?Fr(t,Yr(n,1,wa,!0),e,r):[]}));function gu(t,n,e){var r=null==t?0:t.length;if(!r)return-1;var i=null==e?0:Ra(e);return i<0&&(i=We(r+i,0)),oe(t,Io(n,3),i)}function mu(t,n,r){var i=null==t?0:t.length;if(!i)return-1;var o=i-1;return r!==e&&(o=Ra(r),o=r<0?We(i+o,0):He(o,i-1)),oe(t,Io(n,3),o,!0)}function yu(t){return(null==t?0:t.length)?Yr(t,1):[]}function _u(t){return t&&t.length?t[0]:e}var wu=$i((function(t){var n=Xn(t,Yi);return n.length&&n[0]===t[0]?ei(n):[]})),bu=$i((function(t){var n=$u(t),r=Xn(t,Yi);return n===$u(r)?n=e:r.pop(),r.length&&r[0]===t[0]?ei(r,Io(n,2)):[]})),xu=$i((function(t){var n=$u(t),r=Xn(t,Yi);return(n="function"==typeof n?n:e)&&r.pop(),r.length&&r[0]===t[0]?ei(r,e,n):[]}));function $u(t){var n=null==t?0:t.length;return n?t[n-1]:e}var ku=$i(Du);function Du(t,n){return t&&t.length&&n&&n.length?_i(t,n):t}var Su=Po((function(t,n){var e=null==t?0:t.length,r=Or(t,n);return wi(t,Xn(n,(function(t){return Ho(t,e)?+t:t})).sort(Qi)),r}));function Mu(t){return null==t?t:Ke.call(t)}var Uu=$i((function(t){return Ei(Yr(t,1,wa,!0))})),Tu=$i((function(t){var n=$u(t);return wa(n)&&(n=e),Ei(Yr(t,1,wa,!0),Io(n,2))})),Pu=$i((function(t){var n=$u(t);return n="function"==typeof n?n:e,Ei(Yr(t,1,wa,!0),e,n)}));function Lu(t){if(!t||!t.length)return[];var n=0;return t=Jn(t,(function(t){if(wa(t))return n=We(t.length,n),!0})),he(n,(function(n){return Xn(t,fe(n))}))}function Cu(t,n){if(!t||!t.length)return[];var r=Lu(t);return null==n?r:Xn(r,(function(t){return Yn(n,e,t)}))}var Ou=$i((function(t,n){return wa(t)?Fr(t,n):[]})),Au=$i((function(t){return Bi(Jn(t,wa))})),ju=$i((function(t){var n=$u(t);return wa(n)&&(n=e),Bi(Jn(t,wa),Io(n,2))})),Iu=$i((function(t){var n=$u(t);return n="function"==typeof n?n:e,Bi(Jn(t,wa),e,n)})),Eu=$i(Lu);var Fu=$i((function(t){var n=t.length,r=n>1?t[n-1]:e;return r="function"==typeof r?(t.pop(),r):e,Cu(t,r)}));function zu(t){var n=pr(t);return n.__chain__=!0,n}function Nu(t,n){return n(t)}var Ru=Po((function(t){var n=t.length,r=n?t[0]:0,i=this.__wrapped__,o=function(n){return Or(n,t)};return!(n>1||this.__actions__.length)&&i instanceof mr&&Ho(r)?((i=i.slice(r,+r+(n?1:0))).__actions__.push({func:Nu,args:[o],thisArg:e}),new gr(i,this.__chain__).thru((function(t){return n&&!t.length&&t.push(e),t}))):this.thru(o)}));var Bu=io((function(t,n,e){sn.call(t,e)?++t[e]:Cr(t,e,1)}));var Vu=so(gu),Yu=so(mu);function Wu(t,n){return(ma(t)?Hn:zr)(t,Io(n,3))}function Hu(t,n){return(ma(t)?qn:Nr)(t,Io(n,3))}var qu=io((function(t,n,e){sn.call(t,e)?t[e].push(n):Cr(t,e,[n])}));var Zu=$i((function(t,n,e){var r=-1,i="function"==typeof n,o=_a(t)?Kt(t.length):[];return zr(t,(function(t){o[++r]=i?Yn(n,t,e):ri(t,n,e)})),o})),Ju=io((function(t,n,e){Cr(t,e,n)}));function Ku(t,n){return(ma(t)?Xn:di)(t,Io(n,3))}var Gu=io((function(t,n,e){t[e?0:1].push(n)}),(function(){return[[],[]]}));var Xu=$i((function(t,n){if(null==t)return[];var e=n.length;return e>1&&qo(t,n[0],n[1])?n=[]:e>2&&qo(n[0],n[1],n[2])&&(n=[n[0]]),mi(t,Yr(n,1),[])})),Qu=Ie||function(){return Cn.Date.now()};function ta(t,n,r){return n=r?e:n,n=t&&null==n?t.length:n,Do(t,b,e,e,e,e,n)}function na(t,n){var r;if("function"!=typeof n)throw new on(o);return t=Ra(t),function(){return--t>0&&(r=n.apply(this,arguments)),t<=1&&(n=e),r}}var ea=$i((function(t,n,e){var r=h;if(e.length){var i=Se(e,jo(ea));r|=_}return Do(t,r,n,e,i)})),ra=$i((function(t,n,e){var r=h|v;if(e.length){var i=Se(e,jo(ra));r|=_}return Do(n,r,t,e,i)}));function ia(t,n,r){var i,u,a,c,l,f,s=0,d=!1,p=!1,h=!0;if("function"!=typeof t)throw new on(o);function v(n){var r=i,o=u;return i=u=e,s=n,c=t.apply(o,r)}function g(t){var r=t-f;return f===e||r>=n||r<0||p&&t-s>=a}function m(){var t=Qu();if(g(t))return y(t);l=iu(m,function(t){var e=n-(t-f);return p?He(e,a-(t-s)):e}(t))}function y(t){return l=e,h&&i?v(t):(i=u=e,c)}function _(){var t=Qu(),r=g(t);if(i=arguments,u=this,f=t,r){if(l===e)return function(t){return s=t,l=iu(m,n),d?v(t):c}(f);if(p)return Ji(l),l=iu(m,n),v(f)}return l===e&&(l=iu(m,n)),c}return n=Va(n)||0,Ma(r)&&(d=!!r.leading,a=(p="maxWait"in r)?We(Va(r.maxWait)||0,n):a,h="trailing"in r?!!r.trailing:h),_.cancel=function(){l!==e&&Ji(l),s=0,i=f=u=l=e},_.flush=function(){return l===e?c:y(Qu())},_}var oa=$i((function(t,n){return Er(t,1,n)})),ua=$i((function(t,n,e){return Er(t,Va(n)||0,e)}));function aa(t,n){if("function"!=typeof t||null!=n&&"function"!=typeof n)throw new on(o);var e=function(){var r=arguments,i=n?n.apply(this,r):r[0],o=e.cache;if(o.has(i))return o.get(i);var u=t.apply(this,r);return e.cache=o.set(i,u)||o,u};return e.cache=new(aa.Cache||wr),e}function ca(t){if("function"!=typeof t)throw new on(o);return function(){var n=arguments;switch(n.length){case 0:return!t.call(this);case 1:return!t.call(this,n[0]);case 2:return!t.call(this,n[0],n[1]);case 3:return!t.call(this,n[0],n[1],n[2])}return!t.apply(this,n)}}aa.Cache=wr;var la=qi((function(t,n){var e=(n=1==n.length&&ma(n[0])?Xn(n[0],ve(Io())):Xn(Yr(n,1),ve(Io()))).length;return $i((function(r){for(var i=-1,o=He(r.length,e);++i<o;)r[i]=n[i].call(this,r[i]);return Yn(t,this,r)}))})),fa=$i((function(t,n){var r=Se(n,jo(fa));return Do(t,_,e,n,r)})),sa=$i((function(t,n){var r=Se(n,jo(sa));return Do(t,w,e,n,r)})),da=Po((function(t,n){return Do(t,x,e,e,e,n)}));function pa(t,n){return t===n||t!=t&&n!=n}var ha=wo(Qr),va=wo((function(t,n){return t>=n})),ga=ii(function(){return arguments}())?ii:function(t){return Ua(t)&&sn.call(t,"callee")&&!In.call(t,"callee")},ma=Kt.isArray,ya=Fn?ve(Fn):function(t){return Ua(t)&&Xr(t)==ot};function _a(t){return null!=t&&Sa(t.length)&&!ka(t)}function wa(t){return Ua(t)&&_a(t)}var ba=Re||Vc,xa=zn?ve(zn):function(t){return Ua(t)&&Xr(t)==B};function $a(t){if(!Ua(t))return!1;var n=Xr(t);return n==Y||n==V||"string"==typeof t.message&&"string"==typeof t.name&&!La(t)}function ka(t){if(!Ma(t))return!1;var n=Xr(t);return n==W||n==H||n==N||n==G}function Da(t){return"number"==typeof t&&t==Ra(t)}function Sa(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=L}function Ma(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)}function Ua(t){return null!=t&&"object"==typeof t}var Ta=Nn?ve(Nn):function(t){return Ua(t)&&Bo(t)==q};function Pa(t){return"number"==typeof t||Ua(t)&&Xr(t)==Z}function La(t){if(!Ua(t)||Xr(t)!=K)return!1;var n=On(t);if(null===n)return!0;var e=sn.call(n,"constructor")&&n.constructor;return"function"==typeof e&&e instanceof e&&fn.call(e)==vn}var Ca=Rn?ve(Rn):function(t){return Ua(t)&&Xr(t)==X};var Oa=Bn?ve(Bn):function(t){return Ua(t)&&Bo(t)==Q};function Aa(t){return"string"==typeof t||!ma(t)&&Ua(t)&&Xr(t)==tt}function ja(t){return"symbol"==typeof t||Ua(t)&&Xr(t)==nt}var Ia=Vn?ve(Vn):function(t){return Ua(t)&&Sa(t.length)&&!!Dn[Xr(t)]};var Ea=wo(si),Fa=wo((function(t,n){return t<=n}));function za(t){if(!t)return[];if(_a(t))return Aa(t)?Pe(t):eo(t);if(se&&t[se])return function(t){for(var n,e=[];!(n=t.next()).done;)e.push(n.value);return e}(t[se]());var n=Bo(t);return(n==q?ke:n==Q?Me:pc)(t)}function Na(t){return t?(t=Va(t))===P||t===-P?(t<0?-1:1)*C:t==t?t:0:0===t?t:0}function Ra(t){var n=Na(t),e=n%1;return n==n?e?n-e:n:0}function Ba(t){return t?Ar(Ra(t),0,A):0}function Va(t){if("number"==typeof t)return t;if(ja(t))return O;if(Ma(t)){var n="function"==typeof t.valueOf?t.valueOf():t;t=Ma(n)?n+"":n}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(Ct,"");var e=Vt.test(t);return e||Wt.test(t)?Tn(t.slice(2),e?2:8):Bt.test(t)?O:+t}function Ya(t){return ro(t,oc(t))}function Wa(t){return null==t?"":Ii(t)}var Ha=oo((function(t,n){if(Go(n)||_a(n))ro(n,ic(n),t);else for(var e in n)sn.call(n,e)&&Ur(t,e,n[e])})),qa=oo((function(t,n){ro(n,oc(n),t)})),Za=oo((function(t,n,e,r){ro(n,oc(n),t,r)})),Ja=oo((function(t,n,e,r){ro(n,ic(n),t,r)})),Ka=Po(Or);var Ga=$i((function(t,n){t=nn(t);var r=-1,i=n.length,o=i>2?n[2]:e;for(o&&qo(n[0],n[1],o)&&(i=1);++r<i;)for(var u=n[r],a=oc(u),c=-1,l=a.length;++c<l;){var f=a[c],s=t[f];(s===e||pa(s,cn[f])&&!sn.call(t,f))&&(t[f]=u[f])}return t})),Xa=$i((function(t){return t.push(e,Mo),Yn(ac,e,t)}));function Qa(t,n,r){var i=null==t?e:Kr(t,n);return i===e?r:i}function tc(t,n){return null!=t&&Vo(t,n,ni)}var nc=vo((function(t,n,e){null!=n&&"function"!=typeof n.toString&&(n=hn.call(n)),t[n]=e}),Mc(Pc)),ec=vo((function(t,n,e){null!=n&&"function"!=typeof n.toString&&(n=hn.call(n)),sn.call(t,n)?t[n].push(e):t[n]=[e]}),Io),rc=$i(ri);function ic(t){return _a(t)?$r(t):li(t)}function oc(t){return _a(t)?$r(t,!0):fi(t)}var uc=oo((function(t,n,e){vi(t,n,e)})),ac=oo((function(t,n,e,r){vi(t,n,e,r)})),cc=Po((function(t,n){var e={};if(null==t)return e;var r=!1;n=Xn(n,(function(n){return n=Hi(n,t),r||(r=n.length>1),n})),ro(t,Co(t),e),r&&(e=jr(e,l|f|s,Uo));for(var i=n.length;i--;)Fi(e,n[i]);return e}));var lc=Po((function(t,n){return null==t?{}:function(t,n){return yi(t,n,(function(n,e){return tc(t,e)}))}(t,n)}));function fc(t,n){if(null==t)return{};var e=Xn(Co(t),(function(t){return[t]}));return n=Io(n),yi(t,e,(function(t,e){return n(t,e[0])}))}var sc=ko(ic),dc=ko(oc);function pc(t){return null==t?[]:ge(t,ic(t))}var hc=lo((function(t,n,e){return n=n.toLowerCase(),t+(e?vc(n):n)}));function vc(t){return $c(Wa(t).toLowerCase())}function gc(t){return(t=Wa(t))&&t.replace(qt,we).replace(yn,"")}var mc=lo((function(t,n,e){return t+(e?"-":"")+n.toLowerCase()})),yc=lo((function(t,n,e){return t+(e?" ":"")+n.toLowerCase()})),_c=co("toLowerCase");var wc=lo((function(t,n,e){return t+(e?"_":"")+n.toLowerCase()}));var bc=lo((function(t,n,e){return t+(e?" ":"")+$c(n)}));var xc=lo((function(t,n,e){return t+(e?" ":"")+n.toUpperCase()})),$c=co("toUpperCase");function kc(t,n,r){return t=Wa(t),(n=r?e:n)===e?function(t){return xn.test(t)}(t)?function(t){return t.match(wn)||[]}(t):function(t){return t.match(Ft)||[]}(t):t.match(n)||[]}var Dc=$i((function(t,n){try{return Yn(t,e,n)}catch(t){return $a(t)?t:new Xt(t)}})),Sc=Po((function(t,n){return Hn(n,(function(n){n=fu(n),Cr(t,n,ea(t[n],t))})),t}));function Mc(t){return function(){return t}}var Uc=po(),Tc=po(!0);function Pc(t){return t}function Lc(t){return ci("function"==typeof t?t:jr(t,l))}var Cc=$i((function(t,n){return function(e){return ri(e,t,n)}})),Oc=$i((function(t,n){return function(e){return ri(t,e,n)}}));function Ac(t,n,e){var r=ic(n),i=Jr(n,r);null!=e||Ma(n)&&(i.length||!r.length)||(e=n,n=t,t=this,i=Jr(n,ic(n)));var o=!(Ma(e)&&"chain"in e&&!e.chain),u=ka(t);return Hn(i,(function(e){var r=n[e];t[e]=r,u&&(t.prototype[e]=function(){var n=this.__chain__;if(o||n){var e=t(this.__wrapped__),i=e.__actions__=eo(this.__actions__);return i.push({func:r,args:arguments,thisArg:t}),e.__chain__=n,e}return r.apply(t,Qn([this.value()],arguments))})})),t}function jc(){}var Ic=mo(Xn),Ec=mo(Zn),Fc=mo(ee);function zc(t){return Zo(t)?fe(fu(t)):function(t){return function(n){return Kr(n,t)}}(t)}var Nc=_o(),Rc=_o(!0);function Bc(){return[]}function Vc(){return!1}var Yc=go((function(t,n){return t+n}),0),Wc=xo("ceil"),Hc=go((function(t,n){return t/n}),1),qc=xo("floor");var Zc,Jc=go((function(t,n){return t*n}),1),Kc=xo("round"),Gc=go((function(t,n){return t-n}),0);return pr.after=function(t,n){if("function"!=typeof n)throw new on(o);return t=Ra(t),function(){if(--t<1)return n.apply(this,arguments)}},pr.ary=ta,pr.assign=Ha,pr.assignIn=qa,pr.assignInWith=Za,pr.assignWith=Ja,pr.at=Ka,pr.before=na,pr.bind=ea,pr.bindAll=Sc,pr.bindKey=ra,pr.castArray=function(){if(!arguments.length)return[];var t=arguments[0];return ma(t)?t:[t]},pr.chain=zu,pr.chunk=function(t,n,r){n=(r?qo(t,n,r):n===e)?1:We(Ra(n),0);var i=null==t?0:t.length;if(!i||n<1)return[];for(var o=0,u=0,a=Kt(Fe(i/n));o<i;)a[u++]=Pi(t,o,o+=n);return a},pr.compact=function(t){for(var n=-1,e=null==t?0:t.length,r=0,i=[];++n<e;){var o=t[n];o&&(i[r++]=o)}return i},pr.concat=function(){var t=arguments.length;if(!t)return[];for(var n=Kt(t-1),e=arguments[0],r=t;r--;)n[r-1]=arguments[r];return Qn(ma(e)?eo(e):[e],Yr(n,1))},pr.cond=function(t){var n=null==t?0:t.length,e=Io();return t=n?Xn(t,(function(t){if("function"!=typeof t[1])throw new on(o);return[e(t[0]),t[1]]})):[],$i((function(e){for(var r=-1;++r<n;){var i=t[r];if(Yn(i[0],this,e))return Yn(i[1],this,e)}}))},pr.conforms=function(t){return function(t){var n=ic(t);return function(e){return Ir(e,t,n)}}(jr(t,l))},pr.constant=Mc,pr.countBy=Bu,pr.create=function(t,n){var e=hr(t);return null==n?e:Lr(e,n)},pr.curry=function t(n,r,i){var o=Do(n,m,e,e,e,e,e,r=i?e:r);return o.placeholder=t.placeholder,o},pr.curryRight=function t(n,r,i){var o=Do(n,y,e,e,e,e,e,r=i?e:r);return o.placeholder=t.placeholder,o},pr.debounce=ia,pr.defaults=Ga,pr.defaultsDeep=Xa,pr.defer=oa,pr.delay=ua,pr.difference=pu,pr.differenceBy=hu,pr.differenceWith=vu,pr.drop=function(t,n,r){var i=null==t?0:t.length;return i?Pi(t,(n=r||n===e?1:Ra(n))<0?0:n,i):[]},pr.dropRight=function(t,n,r){var i=null==t?0:t.length;return i?Pi(t,0,(n=i-(n=r||n===e?1:Ra(n)))<0?0:n):[]},pr.dropRightWhile=function(t,n){return t&&t.length?Ni(t,Io(n,3),!0,!0):[]},pr.dropWhile=function(t,n){return t&&t.length?Ni(t,Io(n,3),!0):[]},pr.fill=function(t,n,r,i){var o=null==t?0:t.length;return o?(r&&"number"!=typeof r&&qo(t,n,r)&&(r=0,i=o),function(t,n,r,i){var o=t.length;for((r=Ra(r))<0&&(r=-r>o?0:o+r),(i=i===e||i>o?o:Ra(i))<0&&(i+=o),i=r>i?0:Ba(i);r<i;)t[r++]=n;return t}(t,n,r,i)):[]},pr.filter=function(t,n){return(ma(t)?Jn:Vr)(t,Io(n,3))},pr.flatMap=function(t,n){return Yr(Ku(t,n),1)},pr.flatMapDeep=function(t,n){return Yr(Ku(t,n),P)},pr.flatMapDepth=function(t,n,r){return r=r===e?1:Ra(r),Yr(Ku(t,n),r)},pr.flatten=yu,pr.flattenDeep=function(t){return(null==t?0:t.length)?Yr(t,P):[]},pr.flattenDepth=function(t,n){return(null==t?0:t.length)?Yr(t,n=n===e?1:Ra(n)):[]},pr.flip=function(t){return Do(t,$)},pr.flow=Uc,pr.flowRight=Tc,pr.fromPairs=function(t){for(var n=-1,e=null==t?0:t.length,r={};++n<e;){var i=t[n];r[i[0]]=i[1]}return r},pr.functions=function(t){return null==t?[]:Jr(t,ic(t))},pr.functionsIn=function(t){return null==t?[]:Jr(t,oc(t))},pr.groupBy=qu,pr.initial=function(t){return(null==t?0:t.length)?Pi(t,0,-1):[]},pr.intersection=wu,pr.intersectionBy=bu,pr.intersectionWith=xu,pr.invert=nc,pr.invertBy=ec,pr.invokeMap=Zu,pr.iteratee=Lc,pr.keyBy=Ju,pr.keys=ic,pr.keysIn=oc,pr.map=Ku,pr.mapKeys=function(t,n){var e={};return n=Io(n,3),qr(t,(function(t,r,i){Cr(e,n(t,r,i),t)})),e},pr.mapValues=function(t,n){var e={};return n=Io(n,3),qr(t,(function(t,r,i){Cr(e,r,n(t,r,i))})),e},pr.matches=function(t){return pi(jr(t,l))},pr.matchesProperty=function(t,n){return hi(t,jr(n,l))},pr.memoize=aa,pr.merge=uc,pr.mergeWith=ac,pr.method=Cc,pr.methodOf=Oc,pr.mixin=Ac,pr.negate=ca,pr.nthArg=function(t){return t=Ra(t),$i((function(n){return gi(n,t)}))},pr.omit=cc,pr.omitBy=function(t,n){return fc(t,ca(Io(n)))},pr.once=function(t){return na(2,t)},pr.orderBy=function(t,n,r,i){return null==t?[]:(ma(n)||(n=null==n?[]:[n]),ma(r=i?e:r)||(r=null==r?[]:[r]),mi(t,n,r))},pr.over=Ic,pr.overArgs=la,pr.overEvery=Ec,pr.overSome=Fc,pr.partial=fa,pr.partialRight=sa,pr.partition=Gu,pr.pick=lc,pr.pickBy=fc,pr.property=zc,pr.propertyOf=function(t){return function(n){return null==t?e:Kr(t,n)}},pr.pull=ku,pr.pullAll=Du,pr.pullAllBy=function(t,n,e){return t&&t.length&&n&&n.length?_i(t,n,Io(e,2)):t},pr.pullAllWith=function(t,n,r){return t&&t.length&&n&&n.length?_i(t,n,e,r):t},pr.pullAt=Su,pr.range=Nc,pr.rangeRight=Rc,pr.rearg=da,pr.reject=function(t,n){return(ma(t)?Jn:Vr)(t,ca(Io(n,3)))},pr.remove=function(t,n){var e=[];if(!t||!t.length)return e;var r=-1,i=[],o=t.length;for(n=Io(n,3);++r<o;){var u=t[r];n(u,r,t)&&(e.push(u),i.push(r))}return wi(t,i),e},pr.rest=function(t,n){if("function"!=typeof t)throw new on(o);return $i(t,n=n===e?n:Ra(n))},pr.reverse=Mu,pr.sampleSize=function(t,n,r){return n=(r?qo(t,n,r):n===e)?1:Ra(n),(ma(t)?Dr:Di)(t,n)},pr.set=function(t,n,e){return null==t?t:Si(t,n,e)},pr.setWith=function(t,n,r,i){return i="function"==typeof i?i:e,null==t?t:Si(t,n,r,i)},pr.shuffle=function(t){return(ma(t)?Sr:Ti)(t)},pr.slice=function(t,n,r){var i=null==t?0:t.length;return i?(r&&"number"!=typeof r&&qo(t,n,r)?(n=0,r=i):(n=null==n?0:Ra(n),r=r===e?i:Ra(r)),Pi(t,n,r)):[]},pr.sortBy=Xu,pr.sortedUniq=function(t){return t&&t.length?Ai(t):[]},pr.sortedUniqBy=function(t,n){return t&&t.length?Ai(t,Io(n,2)):[]},pr.split=function(t,n,r){return r&&"number"!=typeof r&&qo(t,n,r)&&(n=r=e),(r=r===e?A:r>>>0)?(t=Wa(t))&&("string"==typeof n||null!=n&&!Ca(n))&&!(n=Ii(n))&&$e(t)?Zi(Pe(t),0,r):t.split(n,r):[]},pr.spread=function(t,n){if("function"!=typeof t)throw new on(o);return n=null==n?0:We(Ra(n),0),$i((function(e){var r=e[n],i=Zi(e,0,n);return r&&Qn(i,r),Yn(t,this,i)}))},pr.tail=function(t){var n=null==t?0:t.length;return n?Pi(t,1,n):[]},pr.take=function(t,n,r){return t&&t.length?Pi(t,0,(n=r||n===e?1:Ra(n))<0?0:n):[]},pr.takeRight=function(t,n,r){var i=null==t?0:t.length;return i?Pi(t,(n=i-(n=r||n===e?1:Ra(n)))<0?0:n,i):[]},pr.takeRightWhile=function(t,n){return t&&t.length?Ni(t,Io(n,3),!1,!0):[]},pr.takeWhile=function(t,n){return t&&t.length?Ni(t,Io(n,3)):[]},pr.tap=function(t,n){return n(t),t},pr.throttle=function(t,n,e){var r=!0,i=!0;if("function"!=typeof t)throw new on(o);return Ma(e)&&(r="leading"in e?!!e.leading:r,i="trailing"in e?!!e.trailing:i),ia(t,n,{leading:r,maxWait:n,trailing:i})},pr.thru=Nu,pr.toArray=za,pr.toPairs=sc,pr.toPairsIn=dc,pr.toPath=function(t){return ma(t)?Xn(t,fu):ja(t)?[t]:eo(lu(Wa(t)))},pr.toPlainObject=Ya,pr.transform=function(t,n,e){var r=ma(t),i=r||ba(t)||Ia(t);if(n=Io(n,4),null==e){var o=t&&t.constructor;e=i?r?new o:[]:Ma(t)&&ka(o)?hr(On(t)):{}}return(i?Hn:qr)(t,(function(t,r,i){return n(e,t,r,i)})),e},pr.unary=function(t){return ta(t,1)},pr.union=Uu,pr.unionBy=Tu,pr.unionWith=Pu,pr.uniq=function(t){return t&&t.length?Ei(t):[]},pr.uniqBy=function(t,n){return t&&t.length?Ei(t,Io(n,2)):[]},pr.uniqWith=function(t,n){return n="function"==typeof n?n:e,t&&t.length?Ei(t,e,n):[]},pr.unset=function(t,n){return null==t||Fi(t,n)},pr.unzip=Lu,pr.unzipWith=Cu,pr.update=function(t,n,e){return null==t?t:zi(t,n,Wi(e))},pr.updateWith=function(t,n,r,i){return i="function"==typeof i?i:e,null==t?t:zi(t,n,Wi(r),i)},pr.values=pc,pr.valuesIn=function(t){return null==t?[]:ge(t,oc(t))},pr.without=Ou,pr.words=kc,pr.wrap=function(t,n){return fa(Wi(n),t)},pr.xor=Au,pr.xorBy=ju,pr.xorWith=Iu,pr.zip=Eu,pr.zipObject=function(t,n){return Vi(t||[],n||[],Ur)},pr.zipObjectDeep=function(t,n){return Vi(t||[],n||[],Si)},pr.zipWith=Fu,pr.entries=sc,pr.entriesIn=dc,pr.extend=qa,pr.extendWith=Za,Ac(pr,pr),pr.add=Yc,pr.attempt=Dc,pr.camelCase=hc,pr.capitalize=vc,pr.ceil=Wc,pr.clamp=function(t,n,r){return r===e&&(r=n,n=e),r!==e&&(r=(r=Va(r))==r?r:0),n!==e&&(n=(n=Va(n))==n?n:0),Ar(Va(t),n,r)},pr.clone=function(t){return jr(t,s)},pr.cloneDeep=function(t){return jr(t,l|s)},pr.cloneDeepWith=function(t,n){return jr(t,l|s,n="function"==typeof n?n:e)},pr.cloneWith=function(t,n){return jr(t,s,n="function"==typeof n?n:e)},pr.conformsTo=function(t,n){return null==n||Ir(t,n,ic(n))},pr.deburr=gc,pr.defaultTo=function(t,n){return null==t||t!=t?n:t},pr.divide=Hc,pr.endsWith=function(t,n,r){t=Wa(t),n=Ii(n);var i=t.length,o=r=r===e?i:Ar(Ra(r),0,i);return(r-=n.length)>=0&&t.slice(r,o)==n},pr.eq=pa,pr.escape=function(t){return(t=Wa(t))&&$t.test(t)?t.replace(bt,be):t},pr.escapeRegExp=function(t){return(t=Wa(t))&&Lt.test(t)?t.replace(Pt,"\\$&"):t},pr.every=function(t,n,r){var i=ma(t)?Zn:Rr;return r&&qo(t,n,r)&&(n=e),i(t,Io(n,3))},pr.find=Vu,pr.findIndex=gu,pr.findKey=function(t,n){return ie(t,Io(n,3),qr)},pr.findLast=Yu,pr.findLastIndex=mu,pr.findLastKey=function(t,n){return ie(t,Io(n,3),Zr)},pr.floor=qc,pr.forEach=Wu,pr.forEachRight=Hu,pr.forIn=function(t,n){return null==t?t:Wr(t,Io(n,3),oc)},pr.forInRight=function(t,n){return null==t?t:Hr(t,Io(n,3),oc)},pr.forOwn=function(t,n){return t&&qr(t,Io(n,3))},pr.forOwnRight=function(t,n){return t&&Zr(t,Io(n,3))},pr.get=Qa,pr.gt=ha,pr.gte=va,pr.has=function(t,n){return null!=t&&Vo(t,n,ti)},pr.hasIn=tc,pr.head=_u,pr.identity=Pc,pr.includes=function(t,n,e,r){t=_a(t)?t:pc(t),e=e&&!r?Ra(e):0;var i=t.length;return e<0&&(e=We(i+e,0)),Aa(t)?e<=i&&t.indexOf(n,e)>-1:!!i&&ue(t,n,e)>-1},pr.indexOf=function(t,n,e){var r=null==t?0:t.length;if(!r)return-1;var i=null==e?0:Ra(e);return i<0&&(i=We(r+i,0)),ue(t,n,i)},pr.inRange=function(t,n,r){return n=Na(n),r===e?(r=n,n=0):r=Na(r),function(t,n,e){return t>=He(n,e)&&t<We(n,e)}(t=Va(t),n,r)},pr.invoke=rc,pr.isArguments=ga,pr.isArray=ma,pr.isArrayBuffer=ya,pr.isArrayLike=_a,pr.isArrayLikeObject=wa,pr.isBoolean=function(t){return!0===t||!1===t||Ua(t)&&Xr(t)==R},pr.isBuffer=ba,pr.isDate=xa,pr.isElement=function(t){return Ua(t)&&1===t.nodeType&&!La(t)},pr.isEmpty=function(t){if(null==t)return!0;if(_a(t)&&(ma(t)||"string"==typeof t||"function"==typeof t.splice||ba(t)||Ia(t)||ga(t)))return!t.length;var n=Bo(t);if(n==q||n==Q)return!t.size;if(Go(t))return!li(t).length;for(var e in t)if(sn.call(t,e))return!1;return!0},pr.isEqual=function(t,n){return oi(t,n)},pr.isEqualWith=function(t,n,r){var i=(r="function"==typeof r?r:e)?r(t,n):e;return i===e?oi(t,n,e,r):!!i},pr.isError=$a,pr.isFinite=function(t){return"number"==typeof t&&Be(t)},pr.isFunction=ka,pr.isInteger=Da,pr.isLength=Sa,pr.isMap=Ta,pr.isMatch=function(t,n){return t===n||ui(t,n,Fo(n))},pr.isMatchWith=function(t,n,r){return r="function"==typeof r?r:e,ui(t,n,Fo(n),r)},pr.isNaN=function(t){return Pa(t)&&t!=+t},pr.isNative=function(t){if(Ko(t))throw new Xt(i);return ai(t)},pr.isNil=function(t){return null==t},pr.isNull=function(t){return null===t},pr.isNumber=Pa,pr.isObject=Ma,pr.isObjectLike=Ua,pr.isPlainObject=La,pr.isRegExp=Ca,pr.isSafeInteger=function(t){return Da(t)&&t>=-L&&t<=L},pr.isSet=Oa,pr.isString=Aa,pr.isSymbol=ja,pr.isTypedArray=Ia,pr.isUndefined=function(t){return t===e},pr.isWeakMap=function(t){return Ua(t)&&Bo(t)==rt},pr.isWeakSet=function(t){return Ua(t)&&Xr(t)==it},pr.join=function(t,n){return null==t?"":Ve.call(t,n)},pr.kebabCase=mc,pr.last=$u,pr.lastIndexOf=function(t,n,r){var i=null==t?0:t.length;if(!i)return-1;var o=i;return r!==e&&(o=(o=Ra(r))<0?We(i+o,0):He(o,i-1)),n==n?function(t,n,e){for(var r=e+1;r--;)if(t[r]===n)return r;return r}(t,n,o):oe(t,ce,o,!0)},pr.lowerCase=yc,pr.lowerFirst=_c,pr.lt=Ea,pr.lte=Fa,pr.max=function(t){return t&&t.length?Br(t,Pc,Qr):e},pr.maxBy=function(t,n){return t&&t.length?Br(t,Io(n,2),Qr):e},pr.mean=function(t){return le(t,Pc)},pr.meanBy=function(t,n){return le(t,Io(n,2))},pr.min=function(t){return t&&t.length?Br(t,Pc,si):e},pr.minBy=function(t,n){return t&&t.length?Br(t,Io(n,2),si):e},pr.stubArray=Bc,pr.stubFalse=Vc,pr.stubObject=function(){return{}},pr.stubString=function(){return""},pr.stubTrue=function(){return!0},pr.multiply=Jc,pr.nth=function(t,n){return t&&t.length?gi(t,Ra(n)):e},pr.noConflict=function(){return Cn._===this&&(Cn._=gn),this},pr.noop=jc,pr.now=Qu,pr.pad=function(t,n,e){t=Wa(t);var r=(n=Ra(n))?Te(t):0;if(!n||r>=n)return t;var i=(n-r)/2;return yo(ze(i),e)+t+yo(Fe(i),e)},pr.padEnd=function(t,n,e){t=Wa(t);var r=(n=Ra(n))?Te(t):0;return n&&r<n?t+yo(n-r,e):t},pr.padStart=function(t,n,e){t=Wa(t);var r=(n=Ra(n))?Te(t):0;return n&&r<n?yo(n-r,e)+t:t},pr.parseInt=function(t,n,e){return e||null==n?n=0:n&&(n=+n),Ze(Wa(t).replace(Ot,""),n||0)},pr.random=function(t,n,r){if(r&&"boolean"!=typeof r&&qo(t,n,r)&&(n=r=e),r===e&&("boolean"==typeof n?(r=n,n=e):"boolean"==typeof t&&(r=t,t=e)),t===e&&n===e?(t=0,n=1):(t=Na(t),n===e?(n=t,t=0):n=Na(n)),t>n){var i=t;t=n,n=i}if(r||t%1||n%1){var o=Je();return He(t+o*(n-t+Un("1e-"+((o+"").length-1))),n)}return bi(t,n)},pr.reduce=function(t,n,e){var r=ma(t)?te:de,i=arguments.length<3;return r(t,Io(n,4),e,i,zr)},pr.reduceRight=function(t,n,e){var r=ma(t)?ne:de,i=arguments.length<3;return r(t,Io(n,4),e,i,Nr)},pr.repeat=function(t,n,r){return n=(r?qo(t,n,r):n===e)?1:Ra(n),xi(Wa(t),n)},pr.replace=function(){var t=arguments,n=Wa(t[0]);return t.length<3?n:n.replace(t[1],t[2])},pr.result=function(t,n,r){var i=-1,o=(n=Hi(n,t)).length;for(o||(o=1,t=e);++i<o;){var u=null==t?e:t[fu(n[i])];u===e&&(i=o,u=r),t=ka(u)?u.call(t):u}return t},pr.round=Kc,pr.runInContext=t,pr.sample=function(t){return(ma(t)?kr:ki)(t)},pr.size=function(t){if(null==t)return 0;if(_a(t))return Aa(t)?Te(t):t.length;var n=Bo(t);return n==q||n==Q?t.size:li(t).length},pr.snakeCase=wc,pr.some=function(t,n,r){var i=ma(t)?ee:Li;return r&&qo(t,n,r)&&(n=e),i(t,Io(n,3))},pr.sortedIndex=function(t,n){return Ci(t,n)},pr.sortedIndexBy=function(t,n,e){return Oi(t,n,Io(e,2))},pr.sortedIndexOf=function(t,n){var e=null==t?0:t.length;if(e){var r=Ci(t,n);if(r<e&&pa(t[r],n))return r}return-1},pr.sortedLastIndex=function(t,n){return Ci(t,n,!0)},pr.sortedLastIndexBy=function(t,n,e){return Oi(t,n,Io(e,2),!0)},pr.sortedLastIndexOf=function(t,n){if(null==t?0:t.length){var e=Ci(t,n,!0)-1;if(pa(t[e],n))return e}return-1},pr.startCase=bc,pr.startsWith=function(t,n,e){return t=Wa(t),e=null==e?0:Ar(Ra(e),0,t.length),n=Ii(n),t.slice(e,e+n.length)==n},pr.subtract=Gc,pr.sum=function(t){return t&&t.length?pe(t,Pc):0},pr.sumBy=function(t,n){return t&&t.length?pe(t,Io(n,2)):0},pr.template=function(t,n,r){var i=pr.templateSettings;r&&qo(t,n,r)&&(n=e),t=Wa(t),n=Za({},n,i,So);var o,u,a=Za({},n.imports,i.imports,So),c=ic(a),l=ge(a,c),f=0,s=n.interpolate||Zt,d="__p += '",p=en((n.escape||Zt).source+"|"+s.source+"|"+(s===St?Nt:Zt).source+"|"+(n.evaluate||Zt).source+"|$","g"),h="//# sourceURL="+(sn.call(n,"sourceURL")?(n.sourceURL+"").replace(/[\r\n]/g," "):"lodash.templateSources["+ ++kn+"]")+"\n";t.replace(p,(function(n,e,r,i,a,c){return r||(r=i),d+=t.slice(f,c).replace(Jt,xe),e&&(o=!0,d+="' +\n__e("+e+") +\n'"),a&&(u=!0,d+="';\n"+a+";\n__p += '"),r&&(d+="' +\n((__t = ("+r+")) == null ? '' : __t) +\n'"),f=c+n.length,n})),d+="';\n";var v=sn.call(n,"variable")&&n.variable;v||(d="with (obj) {\n"+d+"\n}\n"),d=(u?d.replace(gt,""):d).replace(mt,"$1").replace(yt,"$1;"),d="function("+(v||"obj")+") {\n"+(v?"":"obj || (obj = {});\n")+"var __t, __p = ''"+(o?", __e = _.escape":"")+(u?", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n":";\n")+d+"return __p\n}";var g=Dc((function(){return Qt(c,h+"return "+d).apply(e,l)}));if(g.source=d,$a(g))throw g;return g},pr.times=function(t,n){if((t=Ra(t))<1||t>L)return[];var e=A,r=He(t,A);n=Io(n),t-=A;for(var i=he(r,n);++e<t;)n(e);return i},pr.toFinite=Na,pr.toInteger=Ra,pr.toLength=Ba,pr.toLower=function(t){return Wa(t).toLowerCase()},pr.toNumber=Va,pr.toSafeInteger=function(t){return t?Ar(Ra(t),-L,L):0===t?t:0},pr.toString=Wa,pr.toUpper=function(t){return Wa(t).toUpperCase()},pr.trim=function(t,n,r){if((t=Wa(t))&&(r||n===e))return t.replace(Ct,"");if(!t||!(n=Ii(n)))return t;var i=Pe(t),o=Pe(n);return Zi(i,ye(i,o),_e(i,o)+1).join("")},pr.trimEnd=function(t,n,r){if((t=Wa(t))&&(r||n===e))return t.replace(At,"");if(!t||!(n=Ii(n)))return t;var i=Pe(t);return Zi(i,0,_e(i,Pe(n))+1).join("")},pr.trimStart=function(t,n,r){if((t=Wa(t))&&(r||n===e))return t.replace(Ot,"");if(!t||!(n=Ii(n)))return t;var i=Pe(t);return Zi(i,ye(i,Pe(n))).join("")},pr.truncate=function(t,n){var r=k,i=D;if(Ma(n)){var o="separator"in n?n.separator:o;r="length"in n?Ra(n.length):r,i="omission"in n?Ii(n.omission):i}var u=(t=Wa(t)).length;if($e(t)){var a=Pe(t);u=a.length}if(r>=u)return t;var c=r-Te(i);if(c<1)return i;var l=a?Zi(a,0,c).join(""):t.slice(0,c);if(o===e)return l+i;if(a&&(c+=l.length-c),Ca(o)){if(t.slice(c).search(o)){var f,s=l;for(o.global||(o=en(o.source,Wa(Rt.exec(o))+"g")),o.lastIndex=0;f=o.exec(s);)var d=f.index;l=l.slice(0,d===e?c:d)}}else if(t.indexOf(Ii(o),c)!=c){var p=l.lastIndexOf(o);p>-1&&(l=l.slice(0,p))}return l+i},pr.unescape=function(t){return(t=Wa(t))&&xt.test(t)?t.replace(_t,Le):t},pr.uniqueId=function(t){var n=++dn;return Wa(t)+n},pr.upperCase=xc,pr.upperFirst=$c,pr.each=Wu,pr.eachRight=Hu,pr.first=_u,Ac(pr,(Zc={},qr(pr,(function(t,n){sn.call(pr.prototype,n)||(Zc[n]=t)})),Zc),{chain:!1}),pr.VERSION="4.17.15",Hn(["bind","bindKey","curry","curryRight","partial","partialRight"],(function(t){pr[t].placeholder=pr})),Hn(["drop","take"],(function(t,n){mr.prototype[t]=function(r){r=r===e?1:We(Ra(r),0);var i=this.__filtered__&&!n?new mr(this):this.clone();return i.__filtered__?i.__takeCount__=He(r,i.__takeCount__):i.__views__.push({size:He(r,A),type:t+(i.__dir__<0?"Right":"")}),i},mr.prototype[t+"Right"]=function(n){return this.reverse()[t](n).reverse()}})),Hn(["filter","map","takeWhile"],(function(t,n){var e=n+1,r=e==U||3==e;mr.prototype[t]=function(t){var n=this.clone();return n.__iteratees__.push({iteratee:Io(t,3),type:e}),n.__filtered__=n.__filtered__||r,n}})),Hn(["head","last"],(function(t,n){var e="take"+(n?"Right":"");mr.prototype[t]=function(){return this[e](1).value()[0]}})),Hn(["initial","tail"],(function(t,n){var e="drop"+(n?"":"Right");mr.prototype[t]=function(){return this.__filtered__?new mr(this):this[e](1)}})),mr.prototype.compact=function(){return this.filter(Pc)},mr.prototype.find=function(t){return this.filter(t).head()},mr.prototype.findLast=function(t){return this.reverse().find(t)},mr.prototype.invokeMap=$i((function(t,n){return"function"==typeof t?new mr(this):this.map((function(e){return ri(e,t,n)}))})),mr.prototype.reject=function(t){return this.filter(ca(Io(t)))},mr.prototype.slice=function(t,n){t=Ra(t);var r=this;return r.__filtered__&&(t>0||n<0)?new mr(r):(t<0?r=r.takeRight(-t):t&&(r=r.drop(t)),n!==e&&(r=(n=Ra(n))<0?r.dropRight(-n):r.take(n-t)),r)},mr.prototype.takeRightWhile=function(t){return this.reverse().takeWhile(t).reverse()},mr.prototype.toArray=function(){return this.take(A)},qr(mr.prototype,(function(t,n){var r=/^(?:filter|find|map|reject)|While$/.test(n),i=/^(?:head|last)$/.test(n),o=pr[i?"take"+("last"==n?"Right":""):n],u=i||/^find/.test(n);o&&(pr.prototype[n]=function(){var n=this.__wrapped__,a=i?[1]:arguments,c=n instanceof mr,l=a[0],f=c||ma(n),s=function(t){var n=o.apply(pr,Qn([t],a));return i&&d?n[0]:n};f&&r&&"function"==typeof l&&1!=l.length&&(c=f=!1);var d=this.__chain__,p=!!this.__actions__.length,h=u&&!d,v=c&&!p;if(!u&&f){n=v?n:new mr(this);var g=t.apply(n,a);return g.__actions__.push({func:Nu,args:[s],thisArg:e}),new gr(g,d)}return h&&v?t.apply(this,a):(g=this.thru(s),h?i?g.value()[0]:g.value():g)})})),Hn(["pop","push","shift","sort","splice","unshift"],(function(t){var n=un[t],e=/^(?:push|sort|unshift)$/.test(t)?"tap":"thru",r=/^(?:pop|shift)$/.test(t);pr.prototype[t]=function(){var t=arguments;if(r&&!this.__chain__){var i=this.value();return n.apply(ma(i)?i:[],t)}return this[e]((function(e){return n.apply(ma(e)?e:[],t)}))}})),qr(mr.prototype,(function(t,n){var e=pr[n];if(e){var r=e.name+"";sn.call(ir,r)||(ir[r]=[]),ir[r].push({name:n,func:e})}})),ir[ho(e,v).name]=[{name:"wrapper",func:e}],mr.prototype.clone=function(){var t=new mr(this.__wrapped__);return t.__actions__=eo(this.__actions__),t.__dir__=this.__dir__,t.__filtered__=this.__filtered__,t.__iteratees__=eo(this.__iteratees__),t.__takeCount__=this.__takeCount__,t.__views__=eo(this.__views__),t},mr.prototype.reverse=function(){if(this.__filtered__){var t=new mr(this);t.__dir__=-1,t.__filtered__=!0}else(t=this.clone()).__dir__*=-1;return t},mr.prototype.value=function(){var t=this.__wrapped__.value(),n=this.__dir__,e=ma(t),r=n<0,i=e?t.length:0,o=function(t,n,e){var r=-1,i=e.length;for(;++r<i;){var o=e[r],u=o.size;switch(o.type){case"drop":t+=u;break;case"dropRight":n-=u;break;case"take":n=He(n,t+u);break;case"takeRight":t=We(t,n-u)}}return{start:t,end:n}}(0,i,this.__views__),u=o.start,a=o.end,c=a-u,l=r?a:u-1,f=this.__iteratees__,s=f.length,d=0,p=He(c,this.__takeCount__);if(!e||!r&&i==c&&p==c)return Ri(t,this.__actions__);var h=[];t:for(;c--&&d<p;){for(var v=-1,g=t[l+=n];++v<s;){var m=f[v],y=m.iteratee,_=m.type,w=y(g);if(_==T)g=w;else if(!w){if(_==U)continue t;break t}}h[d++]=g}return h},pr.prototype.at=Ru,pr.prototype.chain=function(){return zu(this)},pr.prototype.commit=function(){return new gr(this.value(),this.__chain__)},pr.prototype.next=function(){this.__values__===e&&(this.__values__=za(this.value()));var t=this.__index__>=this.__values__.length;return{done:t,value:t?e:this.__values__[this.__index__++]}},pr.prototype.plant=function(t){for(var n,r=this;r instanceof vr;){var i=du(r);i.__index__=0,i.__values__=e,n?o.__wrapped__=i:n=i;var o=i;r=r.__wrapped__}return o.__wrapped__=t,n},pr.prototype.reverse=function(){var t=this.__wrapped__;if(t instanceof mr){var n=t;return this.__actions__.length&&(n=new mr(this)),(n=n.reverse()).__actions__.push({func:Nu,args:[Mu],thisArg:e}),new gr(n,this.__chain__)}return this.thru(Mu)},pr.prototype.toJSON=pr.prototype.valueOf=pr.prototype.value=function(){return Ri(this.__wrapped__,this.__actions__)},pr.prototype.first=pr.prototype.head,se&&(pr.prototype[se]=function(){return this}),pr}();An?((An.exports=Ce)._=Ce,On._=Ce):Cn._=Ce}).call(wt)}));const xt=vt(new persianDate),$t=yt(_t),kt=yt(!1),Dt=yt(xt),St=yt(xt),Mt=yt("day"),Ut=(function(n,e,r){const u=!Array.isArray(n),a=u?[n]:n,l=e.length<2;yt(r,n=>{let r=!1;const f=[];let s=0,d=t;const p=()=>{if(s)return;d();const r=e(u?f[0]:f,n);l?n(r):d=o(r)?r:t},h=a.map((t,n)=>c(t,t=>{f[n]=t,s&=~(1<<n),r&&p()},()=>{s|=1<<n}));return r=!0,p(),function(){i(h),d()}}).subscribe}($t,t=>t&&t.viewMode?t.viewMode:"day"),yt(persianDate)),Tt={setDate(t){this.updateIsDirty(!0),St.set(t),Dt.set(t)},parsInitialValue(t){let n=l(Ut),e=new ht;if(void 0!==e.parse(t)){n.toCalendar(l($t).initialValueType);let r=new n(e.parse(t));this.updateIsDirty(!0),St.set(r.valueOf()),this.setSelectedDate(r),n.toCalendar(l($t).calendarType)}},setFromDefaultValue(t){this.parsInitialValue(t)},onSetCalendar(t){$t.set({...l($t),calendarType:t});let n=l($t).calendar[t].locale,e=persianDate;e.toCalendar(t),e.toLocale(n),e.toLeapYearMode(l($t).calendar.persian.leapYearMode),Ut.set(e),St.set(l(Dt))},setConfig(t){$t.set(t),this.onSetCalendar(l($t).calendarType),t.onlyTimePicker?this.setViewMode("time"):this.setViewMode(t.viewMode)},updateConfig(t){let n={};n[t[0]]=t[1];let e=JSON.stringify(l($t));(e=JSON.parse(e))[t[0]]=t[1],$t.update(()=>({...l($t),...n})),this.onSetCalendar(l($t).calendarType)},onSelectTime(t){const n=l(Ut),e=t.detail,{hour:r,minute:i,second:o}=gt(e),u=new n(l(Dt)).hour(r).minute(i).second(o);this.updateIsDirty(!0),this.setSelectedDate(u)},onSelectDate(t){const n=l(Ut),{hour:e,minute:r,second:i}=gt(l(Dt)),o=new n(t),u=o.date(),a=o.month(),c=o.year();o.hour(e).minute(r).second(i).date(u).month(a).year(c),this.setSelectedDate(o),this.updateIsDirty(!0)},setSelectedDate(t){const n=new(l(Ut))(t).valueOf();Dt.set(n),this.setViewModeToLowerAvailableLevel(),l($t).onSelect(n)},onSelectMonth(t){const n=l(Ut);St.set(new n(l(St)).month(t).valueOf()),l($t).onlySelectOnDate?this.setViewModeToLowerAvailableLevel():this.setSelectedDate(new n(l(St)).month(t)),this.updateIsDirty(!0)},onSelectYear(t){const n=l(Ut);St.set(new n(l(Dt)).year(t).valueOf()),l($t).onlySelectOnDate?this.setViewModeToLowerAvailableLevel():this.setSelectedDate(new n(l(Dt)).year(t)),this.updateIsDirty(!0)},onSetHour(t){const n=l(Ut);this.setSelectedDate(new n(l(Dt)).hour(t)),this.updateIsDirty(!0)},onSetMinute(t){const n=l(Ut);this.setSelectedDate(new n(l(Dt)).minute(t)),this.updateIsDirty(!0)},setSecond(t){const n=l(Ut);this.setSelectedDate(new n(l(Dt)).second(t))},setViewMode(t){let n=l($t);$t.set(bt.merge(n,{viewMode:t})),Mt.set(t)},setViewModeToUpperAvailableLevel(){let t=l(Mt),n=l($t);"time"===t?n.dayPicker.enabled?this.setViewMode("day"):n.monthPicker.enabled?this.setViewMode("month"):n.yearPicker.enabled&&this.setViewMode("year"):"day"===t?n.monthPicker.enabled?this.setViewMode("month"):n.yearPicker.enabled&&this.setViewMode("year"):"month"===t&&n.yearPicker.enabled&&this.setViewMode("year")},setViewModeToLowerAvailableLevel(){let t=l(Mt),n=l($t);"year"===t?n.monthPicker.enabled?this.setViewMode("month"):n.dayPicker.enabled?this.setViewMode("day"):n.timePicker.enabled&&this.setViewMode("time"):"month"===t?n.dayPicker.enabled?this.setViewMode("day"):n.timePicker.enabled&&this.setViewMode("time"):"day"===t&&n.timePicker.enabled&&n.timePicker.showAsLastStep&&this.setViewMode("time")},updateIsDirty(t){kt.set(t)},onSelectNextView(){"day"===l(Mt)&&St.set(vt(new persianDate(l(St)).add("month",1))),"month"===l(Mt)&&St.set(vt(new persianDate(l(St)).add("year",1))),"year"===l(Mt)&&St.set(vt(new persianDate(l(St)).add("year",12)))},onSelectPrevView(){"day"===l(Mt)&&St.set(vt(new persianDate(l(St)).subtract("month",1))),"month"===l(Mt)&&St.set(vt(new persianDate(l(St)).subtract("year",1))),"year"===l(Mt)&&St.set(vt(new persianDate(l(St)).subtract("year",12)))},setViewUnix(t){St.set(vt(t))},onSelectToday(){St.set(vt((new persianDate).startOf("day")))}};function Pt(t,n,e){const r=t.slice();return r[19]=n[e],r}function Lt(t){let n,e,r,i,o=t[0],u=[];for(let n=0;n<o.length;n+=1)u[n]=Ct(Pt(t,o,n));return{c(){n=b("div");for(let t=0;t<u.length;t+=1)u[t].c();S(n,"class","pwt-date-year-view")},m(t,e){y(t,n,e);for(let t=0;t<u.length;t+=1)u[t].m(n,null);i=!0},p(t,e){if(357&e){let r;for(o=t[0],r=0;r<o.length;r+=1){const i=Pt(t,o,r);u[r]?u[r].p(i,e):(u[r]=Ct(i),u[r].c(),u[r].m(n,null))}for(;r<u.length;r+=1)u[r].d(1);u.length=o.length}},i(o){i||(V(()=>{r&&r.end(1),e||(e=it(n,t[4],{duration:t[7]})),e.start()}),i=!0)},o(o){e&&e.invalidate(),r=ot(n,t[3],{duration:t[7]}),i=!1},d(t){t&&_(n),w(u,t),t&&r&&r.end()}}}function Ct(t){let n,e,r,i,o,u=t[8](t[19])+"";function a(...n){return t[18](t[19],...n)}return{c(){n=b("div"),e=b("span"),r=x(u),i=$(),S(e,"class","pwt-text"),U(n,"disable",t[5](t[19])),U(n,"selected",t[2]===t[19])},m(t,u,c){y(t,n,u),m(n,e),m(e,r),m(n,i),c&&o(),o=D(n,"click",a)},p(e,i){t=e,1&i&&u!==(u=t[8](t[19])+"")&&M(r,u),33&i&&U(n,"disable",t[5](t[19])),5&i&&U(n,"selected",t[2]===t[19])},d(t){t&&_(n),o()}}}function Ot(t){let n,e,r=t[1]&&Lt(t);return{c(){r&&r.c(),n=k()},m(t,i){r&&r.m(t,i),y(t,n,i),e=!0},p(t,[e]){t[1]?r?(r.p(t,e),2&e&&nt(r,1)):((r=Lt(t)).c(),nt(r,1),r.m(n.parentNode,n)):r&&(Q(),et(r,1,1,()=>{r=null}),tt())},i(t){e||(nt(r),e=!0)},o(t){et(r),e=!1},d(t){r&&r.d(t),t&&_(n)}}}function At(t,n,e){let r,i;f(t,$t,t=>e(14,r=t)),f(t,Ut,t=>e(15,i=t));let{selectedUnix:o}=n,{viewUnix:u}=n;const a=t=>{let n,e;if(!r.checkYear(t))return!0;if(r.minDate&&r.maxDate){if(n=new i(r.minDate).year(),t>(e=new i(r.maxDate).year())||t<n)return!0}else if(r.maxDate){if(t>(e=new i(r.maxDate).year()))return!0}else if(r.minDate&&t<(n=new i(r.minDate).year()))return!0},c=I();function l(t){c("select",t)}let s,d,p=!0,h=r.animateSpeed,v=u,g=!0;let m,y;return t.$set=t=>{"selectedUnix"in t&&e(9,o=t.selectedUnix),"viewUnix"in t&&e(10,u=t.viewUnix)},t.$$.update=()=>{if(33280&t.$$.dirty&&e(2,m=new i(o).year()),33792&t.$$.dirty&&e(16,y=new i(u).year()),89089&t.$$.dirty){e(0,s=[]),e(11,d=y-y%12);let t=0;for(;t<12;)s.push(d+t),t++;g=u>v,e(12,v=u),r.animate&&(e(1,p=!1),setTimeout(()=>{e(1,p=!0)},2*h))}},[s,p,m,function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${g?"-":""}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${g?"":"-"}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},a,l,h,function(t){return new i([t]).format("YYYY")},o,u,d,v,g,r,i,y,c,(t,n)=>{a(t)||l(t)}]}class jt extends dt{constructor(t){super(),st(this,t,At,Ot,u,{selectedUnix:9,viewUnix:10})}}function It(t,n,e){const r=t.slice();return r[18]=n[e],r[20]=e,r}function Et(t){let n,e,r,i,o=t[1],u=[];for(let n=0;n<o.length;n+=1)u[n]=Ft(It(t,o,n));return{c(){n=b("div");for(let t=0;t<u.length;t+=1)u[t].c();S(n,"class","pwt-date-month-view")},m(t,e){y(t,n,e);for(let t=0;t<u.length;t+=1)u[t].m(n,null);i=!0},p(t,e){if(414&e){let r;for(o=t[1],r=0;r<o.length;r+=1){const i=It(t,o,r);u[r]?u[r].p(i,e):(u[r]=Ft(i),u[r].c(),u[r].m(n,null))}for(;r<u.length;r+=1)u[r].d(1);u.length=o.length}},i(o){i||(V(()=>{r&&r.end(1),e||(e=it(n,t[6],{duration:t[9]})),e.start()}),i=!0)},o(o){e&&e.invalidate(),r=ot(n,t[5],{duration:t[9]}),i=!1},d(t){t&&_(n),w(u,t),t&&r&&r.end()}}}function Ft(t){let n,e,r,i,o,u=t[18]+"";function a(...n){return t[17](t[20],...n)}return{c(){n=b("div"),e=b("span"),r=x(u),i=$(),S(e,"class","pwt-text"),U(n,"disable",t[7](t[4],t[20]+1)),U(n,"selected",t[2]-1===t[20]&&t[4]===t[3])},m(t,u,c){y(t,n,u),m(n,e),m(e,r),m(n,i),c&&o(),o=D(n,"click",a)},p(e,i){t=e,2&i&&u!==(u=t[18]+"")&&M(r,u),144&i&&U(n,"disable",t[7](t[4],t[20]+1)),28&i&&U(n,"selected",t[2]-1===t[20]&&t[4]===t[3])},d(t){t&&_(n),o()}}}function zt(t){let n,e,r=t[0]&&Et(t);return{c(){r&&r.c(),n=k()},m(t,i){r&&r.m(t,i),y(t,n,i),e=!0},p(t,[e]){t[0]?r?(r.p(t,e),1&e&&nt(r,1)):((r=Et(t)).c(),nt(r,1),r.m(n.parentNode,n)):r&&(Q(),et(r,1,1,()=>{r=null}),tt())},i(t){e||(nt(r),e=!0)},o(t){et(r),e=!1},d(t){r&&r.d(t),t&&_(n)}}}function Nt(t,n,e){let r,i;f(t,$t,t=>e(14,r=t)),f(t,Ut,t=>e(15,i=t));let{selectedUnix:o}=n,{viewUnix:u}=n;const a=(t,n)=>{let e,o,u,a;if(!r.checkMonth(t,n))return!0;if(r.minDate&&r.maxDate){if(e=new i(r.minDate).year(),o=new i(r.minDate).month(),u=new i(r.maxDate).year(),a=new i(r.maxDate).month(),t==u&&n>a||t>u||t==e&&n<o||t<e)return!0}else if(r.maxDate){if(u=new i(r.maxDate).year(),a=new i(r.maxDate).month(),t==u&&n>a||t>u)return!0}else if(r.minDate&&(e=new i(r.minDate).year(),o=new i(r.minDate).month(),t==e&&n<o||t<e))return!0},c=I();function l(t){c("select",t)}let s=!0,d=r.animateSpeed,p=u,h=!0;let v,g,m,y;return t.$set=t=>{"selectedUnix"in t&&e(10,o=t.selectedUnix),"viewUnix"in t&&e(11,u=t.viewUnix)},t.$$.update=()=>{32768&t.$$.dirty&&e(1,v=(new i).rangeName().months),33792&t.$$.dirty&&e(2,g=new i(o).month()),33792&t.$$.dirty&&e(3,m=new i(o).year()),34816&t.$$.dirty&&e(4,y=new i(u).year()),22528&t.$$.dirty&&(h=u>p,e(12,p=u),r.animate&&(e(0,s=!1),setTimeout(()=>{e(0,s=!0)},2*d)))},[s,v,g,m,y,function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${h?"-":""}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${h?"":"-"}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},a,l,d,o,u,p,h,r,i,c,(t,n)=>{a(y,t+1)||l(t+1)}]}class Rt extends dt{constructor(t){super(),st(this,t,Nt,zt,u,{selectedUnix:10,viewUnix:11})}}function Bt(t,n,e){const r=t.slice();return r[26]=n[e],r}function Vt(t,n,e){const r=t.slice();return r[23]=n[e],r[25]=e,r}function Yt(t,n,e){const r=t.slice();return r[26]=n[e],r}function Wt(t){let n,e=t[0][1],r=[];for(let n=0;n<e.length;n+=1)r[n]=Ht(Yt(t,e,n));return{c(){for(let t=0;t<r.length;t+=1)r[t].c();n=k()},m(t,e){for(let n=0;n<r.length;n+=1)r[n].m(t,e);y(t,n,e)},p(t,i){if(1&i){let o;for(e=t[0][1],o=0;o<e.length;o+=1){const u=Yt(t,e,o);r[o]?r[o].p(u,i):(r[o]=Ht(u),r[o].c(),r[o].m(n.parentNode,n))}for(;o<r.length;o+=1)r[o].d(1);r.length=e.length}},d(t){w(r,t),t&&_(n)}}}function Ht(t){let n,e,r,i,o=t[26].format("ddd")+"";return{c(){n=b("th"),e=b("span"),r=x(o),i=$()},m(t,o){y(t,n,o),m(n,e),m(e,r),m(n,i)},p(t,n){1&n&&o!==(o=t[26].format("ddd")+"")&&M(r,o)},d(t){t&&_(n)}}}function qt(t){let n,e,r,i,o=t[0],u=[];for(let n=0;n<o.length;n+=1)u[n]=Xt(Vt(t,o,n));return{c(){n=b("tbody");for(let t=0;t<u.length;t+=1)u[t].c()},m(t,e){y(t,n,e);for(let t=0;t<u.length;t+=1)u[t].m(n,null);i=!0},p(t,e){if(7997&e){let r;for(o=t[0],r=0;r<o.length;r+=1){const i=Vt(t,o,r);u[r]?u[r].p(i,e):(u[r]=Xt(i),u[r].c(),u[r].m(n,null))}for(;r<u.length;r+=1)u[r].d(1);u.length=o.length}},i(o){i||(V(()=>{r&&r.end(1),e||(e=it(n,t[7],{duration:t[13]})),e.start()}),i=!0)},o(o){e&&e.invalidate(),r=ot(n,t[6],{duration:t[13]}),i=!1},d(t){t&&_(n),w(u,t),t&&r&&r.end()}}}function Zt(t){let n,e=t[23],r=[];for(let n=0;n<e.length;n+=1)r[n]=Gt(Bt(t,e,n));return{c(){for(let t=0;t<r.length;t+=1)r[t].c();n=k()},m(t,e){for(let n=0;n<r.length;n+=1)r[n].m(t,e);y(t,n,e)},p(t,i){if(7997&i){let o;for(e=t[23],o=0;o<e.length;o+=1){const u=Bt(t,e,o);r[o]?r[o].p(u,i):(r[o]=Gt(u),r[o].c(),r[o].m(n.parentNode,n))}for(;o<r.length;o+=1)r[o].d(1);r.length=e.length}},d(t){w(r,t),t&&_(n)}}}function Jt(t){let n,e,r,i,o=t[26].format("D")+"",u=t[2].calendar[t[2].calendarType].showHint&&Kt(t);return{c(){n=b("span"),e=x(o),r=$(),u&&u.c(),i=k(),S(n,"class","pwt-date-view-text")},m(t,o){y(t,n,o),m(n,e),y(t,r,o),u&&u.m(t,o),y(t,i,o)},p(t,n){1&n&&o!==(o=t[26].format("D")+"")&&M(e,o),t[2].calendar[t[2].calendarType].showHint?u?u.p(t,n):((u=Kt(t)).c(),u.m(i.parentNode,i)):u&&(u.d(1),u=null)},d(t){t&&_(n),t&&_(r),u&&u.d(t),t&&_(i)}}}function Kt(t){let n,e,r=t[12](t[26])+"";return{c(){n=b("span"),e=x(r),S(n,"class","pwt-date-view-hint")},m(t,r){y(t,n,r),m(n,e)},p(t,n){1&n&&r!==(r=t[12](t[26])+"")&&M(e,r)},d(t){t&&_(n)}}}function Gt(t){let n,e,r,i=t[26]&&t[26].month&&t[26].format&&t[5]===t[26].month(),o=i&&Jt(t);function u(...n){return t[22](t[26],...n)}return{c(){n=b("td"),o&&o.c(),e=$(),U(n,"othermonth",!t[26].month),U(n,"disable",t[10](t[26])||!t[9](t[26])),U(n,"selected",t[26]&&t[26].isPersianDate&&t[8](t[26].valueOf(),t[3])),U(n,"today",t[26]&&t[26].isPersianDate&&t[8](t[26].valueOf(),t[4]))},m(t,i,a){y(t,n,i),o&&o.m(n,null),m(n,e),a&&r(),r=D(n,"click",u)},p(r,u){t=r,33&u&&(i=t[26]&&t[26].month&&t[26].format&&t[5]===t[26].month()),i?o?o.p(t,u):((o=Jt(t)).c(),o.m(n,e)):o&&(o.d(1),o=null),1&u&&U(n,"othermonth",!t[26].month),1537&u&&U(n,"disable",t[10](t[26])||!t[9](t[26])),265&u&&U(n,"selected",t[26]&&t[26].isPersianDate&&t[8](t[26].valueOf(),t[3])),273&u&&U(n,"today",t[26]&&t[26].isPersianDate&&t[8](t[26].valueOf(),t[4]))},d(t){t&&_(n),o&&o.d(),r()}}}function Xt(t){let n,e,r=t[23].length>1&&Zt(t);return{c(){n=b("tr"),r&&r.c(),e=$()},m(t,i){y(t,n,i),r&&r.m(n,null),m(n,e)},p(t,i){t[23].length>1?r?r.p(t,i):((r=Zt(t)).c(),r.m(n,e)):r&&(r.d(1),r=null)},d(t){t&&_(n),r&&r.d()}}}function Qt(t){let n,e,r,i,o,u,a=t[0][1]&&Wt(t),c=t[1]&&qt(t);return{c(){n=b("div"),e=b("table"),r=b("thead"),i=b("tr"),a&&a.c(),o=$(),c&&c.c(),S(e,"class","pwt-month-table next"),S(e,"border","0"),S(n,"class","pwt-date-view")},m(t,l){y(t,n,l),m(n,e),m(e,r),m(r,i),a&&a.m(i,null),m(e,o),c&&c.m(e,null),u=!0},p(t,[n]){t[0][1]?a?a.p(t,n):((a=Wt(t)).c(),a.m(i,null)):a&&(a.d(1),a=null),t[1]?c?(c.p(t,n),2&n&&nt(c,1)):((c=qt(t)).c(),nt(c,1),c.m(e,null)):c&&(Q(),et(c,1,1,()=>{c=null}),tt())},i(t){u||(nt(c),u=!0)},o(t){et(c),u=!1},d(t){t&&_(n),a&&a.d(),c&&c.d()}}}function tn(t,n,e){let r,i;f(t,Ut,t=>e(20,r=t)),f(t,$t,t=>e(2,i=t));const o=t=>{if(t.valueOf){let n=t.valueOf();if(i.minDate&&i.maxDate){if(!(n>=i.minDate&&n<=i.maxDate))return!0}else if(i.minDate){if(n<=i.minDate)return!0}else if(i.maxDate&&n>=i.maxDate)return!0}};let{viewUnix:u}=n,{selectedUnix:a}=n,{todayUnix:c}=n;const l=I();function s(t){l("selectDate",t)}let d=[],p=!0,h=i.animateSpeed,v=u,g=!0,m=null;let y,_,w;return t.$set=t=>{"viewUnix"in t&&e(14,u=t.viewUnix),"selectedUnix"in t&&e(15,a=t.selectedUnix),"todayUnix"in t&&e(16,c=t.todayUnix)},t.$$.update=()=>{if(1081344&t.$$.dirty&&e(3,y=new r(a).startOf("day")),1114112&t.$$.dirty&&e(4,_=new r(c)),1064960&t.$$.dirty&&e(5,w=new r(u).month()),1720325&t.$$.dirty){e(0,d=[]);let t=[],n=new r(u);r.toCalendar("persian");let o=n.startOf("month"),a=n.daysInMonth(),c=n.startOf("month").day();"persian"===i.calendarType&&(c-=1);let l=8-n.endOf("month").day(),f=(o.subtract("day",c),o.subtract("day",c),0);if(c<7)for(;f<c;)t.push({}),f++;let s=0;for(;s<a;)t.push(new r([o.year(),o.month(),o.date()+s])),s++;let y=0;for(;y<l;)t.push({}),y++;let _=0;t.forEach((t,n)=>{n%7==0&&e(0,d[_]=[],d),d[_].push(t),n%7==6&&_++}),g=u>v,i.animate&&new r(u).month()!==new r(v).month()&&(e(1,p=!1),clearTimeout(m),e(19,m=setTimeout(()=>{e(1,p=!0)},2*h))),e(17,v=u)}},[d,p,i,y,_,w,function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${g?"-":""}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${g?"":"-"}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},(t,n)=>new r(t).isSameDay(n),t=>t.valueOf&&i.checkDate(t.valueOf()),o,s,function(t){let n;return"persian"===i.calendarType&&(r.toCalendar("gregorian"),n=new r(t.valueOf()).format("D"),r.toCalendar("persian")),"gregorian"===i.calendarType&&(r.toCalendar("persian"),n=new r(t.valueOf()).format("D"),r.toCalendar("gregorian")),n},h,u,a,c,v,g,m,r,l,(t,n)=>{!o(t)&&t.month&&w===t.month()&&s(t.valueOf())}]}class nn extends dt{constructor(t){super(),st(this,t,tn,Qt,u,{viewUnix:14,selectedUnix:15,todayUnix:16})}}function en(t){let n,e,r,o,u,a,c,l;return{c(){n=b("div"),(e=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z"></path></svg>',r=$(),o=b("span"),u=x(t[0]),a=$(),(c=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"></path></svg>',S(e,"class","pwt-date-time-arrow"),S(c,"class","pwt-date-time-arrow"),S(n,"class","pwt-date-time-section pwt-date-time-hour")},m(f,s,d){y(f,n,s),m(n,e),m(n,r),m(n,o),m(o,u),m(n,a),m(n,c),d&&i(l),l=[D(e,"click",t[13]),D(c,"click",t[14]),D(n,"wheel",t[15])]},p(t,n){1&n&&M(u,t[0])},d(t){t&&_(n),i(l)}}}function rn(t){let n,e,r,o,u,a,c,l;return{c(){n=b("div"),(e=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z"></path></svg>',r=$(),o=b("span"),u=x(t[1]),a=$(),(c=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"></path></svg>',S(e,"class","pwt-date-time-arrow"),S(c,"class","pwt-date-time-arrow"),S(n,"class","pwt-date-time-section pwt-date-time-minute")},m(f,s,d){y(f,n,s),m(n,e),m(n,r),m(n,o),m(o,u),m(n,a),m(n,c),d&&i(l),l=[D(e,"click",t[16]),D(c,"click",t[17]),D(n,"wheel",t[18])]},p(t,n){2&n&&M(u,t[1])},d(t){t&&_(n),i(l)}}}function on(t){let n,e,r,o,u,a,c,l;return{c(){n=b("div"),(e=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z"></path></svg>',r=$(),o=b("span"),u=x(t[2]),a=$(),(c=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"></path></svg>',S(e,"class","pwt-date-time-arrow"),S(c,"class","pwt-date-time-arrow"),S(n,"class","pwt-date-time-section pwt-date-time-second")},m(f,s,d){y(f,n,s),m(n,e),m(n,r),m(n,o),m(o,u),m(n,a),m(n,c),d&&i(l),l=[D(e,"click",t[19]),D(c,"click",t[20]),D(n,"wheel",t[21])]},p(t,n){4&n&&M(u,t[2])},d(t){t&&_(n),i(l)}}}function un(t){let n,e,r,o,u,a,c,l;return{c(){n=b("div"),(e=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n\t\t\t\t\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n\t\t\t\t\t\tL129.007,57.819z"></path></svg>',r=$(),o=b("span"),u=x(t[3]),a=$(),(c=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 240.811 240.811"><path d="M220.088,57.667l-99.671,99.695L20.746,57.655c-4.752-4.752-12.439-4.752-17.191,0\n\t\t\t\t\t\tc-4.74,4.752-4.74,12.451,0,17.203l108.261,108.297l0,0l0,0c4.74,4.752,12.439,4.752,17.179,0L237.256,74.859\n\t\t\t\t\t\tc4.74-4.752,4.74-12.463,0-17.215C232.528,52.915,224.828,52.915,220.088,57.667z"></path></svg>',S(e,"class","pwt-date-time-arrow"),S(c,"class","pwt-date-time-arrow"),S(n,"class","pwt-date-time-section pwt-date-time-meridian")},m(f,s,d){y(f,n,s),m(n,e),m(n,r),m(n,o),m(o,u),m(n,a),m(n,c),d&&i(l),l=[D(e,"click",t[22]),D(c,"click",t[23]),D(n,"wheel",t[24])]},p(t,n){8&n&&M(u,t[3])},d(t){t&&_(n),i(l)}}}function an(n){let e,r,i,o,u=n[4].timePicker.hour.enabled&&en(n),a=n[4].timePicker.minute.enabled&&rn(n),c=n[4].timePicker.second.enabled&&on(n),l=n[4].timePicker.meridian.enabled&&un(n);return{c(){e=b("div"),u&&u.c(),r=$(),a&&a.c(),i=$(),c&&c.c(),o=$(),l&&l.c(),S(e,"class","pwt-date-time")},m(t,n){y(t,e,n),u&&u.m(e,null),m(e,r),a&&a.m(e,null),m(e,i),c&&c.m(e,null),m(e,o),l&&l.m(e,null)},p(t,[n]){t[4].timePicker.hour.enabled?u?u.p(t,n):((u=en(t)).c(),u.m(e,r)):u&&(u.d(1),u=null),t[4].timePicker.minute.enabled?a?a.p(t,n):((a=rn(t)).c(),a.m(e,i)):a&&(a.d(1),a=null),t[4].timePicker.second.enabled?c?c.p(t,n):((c=on(t)).c(),c.m(e,o)):c&&(c.d(1),c=null),t[4].timePicker.meridian.enabled?l?l.p(t,n):((l=un(t)).c(),l.m(e,null)):l&&(l.d(1),l=null)},i:t,o:t,d(t){t&&_(e),u&&u.d(),a&&a.d(),c&&c.d(),l&&l.d()}}}function cn(t,n,e){let r,i;f(t,Ut,t=>e(8,r=t)),f(t,$t,t=>e(4,i=t));const o=I();let{selectedUnix:u}=n,a=r;const c=(t,n)=>{i.navigator.scroll.enabled&&((t.deltaY>0||t.deltaX>0)&&l(n,"down"),(t.deltaY<0||t.deltaX<0)&&l(n,"up"))},l=function(t,n){let e=new r(u);if("meridian"===t)e="PM"===g?e.add("hour",12).clone():e.subtract("hour",12).clone();else{let r=i.timePicker[t].step?i.timePicker[t].step:i.timePicker.step;e="up"===n?e.add(t,r).clone():e.subtract(t,r).clone()}s(e)};function s(t){o("selectTime",t)}let d,p,h,v,g;return t.$set=t=>{"selectedUnix"in t&&e(7,u=t.selectedUnix)},t.$$.update=()=>{384&t.$$.dirty&&e(0,d=new r(u).format("hh")),384&t.$$.dirty&&e(1,p=new r(u).format("mm")),384&t.$$.dirty&&e(2,h=new r(u).format("ss")),384&t.$$.dirty&&e(3,v=new r(u).format("a")),128&t.$$.dirty&&(g=new a(u).toLocale("en").format("a"))},[d,p,h,v,i,c,l,u,r,g,o,a,s,()=>l("hour","up"),()=>l("hour","down"),t=>c(t,"hour"),()=>l("minute","up"),()=>l("minute","down"),t=>c(t,"minute"),()=>l("second","up"),()=>l("second","down"),t=>c(t,"second"),()=>l("meridian","up"),()=>l("meridian","down"),t=>c(t,"meridian")]}class ln extends dt{constructor(t){super(),st(this,t,cn,an,u,{selectedUnix:7})}}function fn(n){let e,r,o,u;return{c(){(e=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 24 24"><path d="M5.649,24c-0.143,0-0.279-0.061-0.374-0.168c-0.183-0.207-0.163-0.524,0.043-0.706L17.893,12L5.318,0.875\n\t\t\t\t\tC5.111,0.692,5.092,0.375,5.274,0.169C5.37,0.062,5.506,0,5.649,0c0.122,0,0.24,0.045,0.331,0.125l12.576,11.126\n\t\t\t\t\tc0.029,0.026,0.056,0.052,0.081,0.08c0.369,0.416,0.332,1.051-0.08,1.416L5.98,23.875C5.888,23.956,5.771,24,5.649,24z"></path></svg>',r=$(),(o=b("button")).innerHTML='<svg width="12" height="12" viewBox="0 0 24 24"><path d="M18.401,24c-0.122,0-0.24-0.044-0.331-0.125L5.495,12.748c-0.03-0.027-0.058-0.055-0.084-0.084\n\t\t\t\t\tc-0.366-0.413-0.329-1.047,0.083-1.412L18.069,0.125C18.161,0.044,18.279,0,18.401,0c0.143,0,0.28,0.062,0.375,0.169\n\t\t\t\t\tc0.182,0.206,0.163,0.523-0.043,0.705L6.157,12l12.575,11.125c0.206,0.183,0.226,0.5,0.043,0.706C18.68,23.939,18.544,24,18.401,24\n\t\t\t\t\tz"></path></svg>',S(e,"class","pwt-date-navigator-prev"),S(o,"class","pwt-date-navigator-next")},m(t,a,c){y(t,e,a),y(t,r,a),y(t,o,a),c&&i(u),u=[D(e,"click",n[10]),D(o,"click",n[11])]},p:t,d(t){t&&_(e),t&&_(r),t&&_(o),i(u)}}}function sn(t){let n,e,r,i,o,u,a;return{c(){n=b("span"),e=x(t[2]),r=x(" - "),i=x(t[3]),S(n,"class","pwt-date-navigator-text")},m(t,o){y(t,n,o),m(n,e),m(n,r),m(n,i),a=!0},p(t,n){(!a||4&n)&&M(e,t[2]),(!a||8&n)&&M(i,t[3])},i(e){a||(V(()=>{u&&u.end(1),o||(o=it(n,t[8],{duration:t[12]})),o.start()}),a=!0)},o(e){o&&o.invalidate(),u=ot(n,t[7],{duration:t[12]}),a=!1},d(t){t&&_(n),t&&u&&u.end()}}}function dn(t){let n,e,r,i,o,u;return{c(){n=b("button"),e=x(t[6]),S(n,"class","pwt-date-navigator-button")},m(r,i,a){y(r,n,i),m(n,e),o=!0,a&&u(),u=D(n,"click",t[25])},p(t,n){(!o||64&n)&&M(e,t[6])},i(e){o||(V(()=>{i&&i.end(1),r||(r=it(n,t[8],{duration:t[12]})),r.start()}),o=!0)},o(e){r&&r.invalidate(),i=ot(n,t[7],{duration:t[12]}),o=!1},d(t){t&&_(n),t&&i&&i.end(),u()}}}function pn(t){let n,e,r,i,o,u;return{c(){n=b("button"),e=x(t[4]),S(n,"class","pwt-date-navigator-button")},m(r,i,a){y(r,n,i),m(n,e),o=!0,a&&u(),u=D(n,"click",t[26])},p(t,n){(!o||16&n)&&M(e,t[4])},i(e){o||(V(()=>{i&&i.end(1),r||(r=it(n,t[8],{duration:t[12],delay:10})),r.start()}),o=!0)},o(e){r&&r.invalidate(),i=ot(n,t[7],{duration:t[12]}),o=!1},d(t){t&&_(n),t&&i&&i.end(),u()}}}function hn(t){let n,e,r,i,o,u;return{c(){n=b("button"),e=x(t[5]),S(n,"class","pwt-date-navigator-button")},m(r,i,a){y(r,n,i),m(n,e),o=!0,a&&u(),u=D(n,"click",t[27])},p(t,n){(!o||32&n)&&M(e,t[5])},i(e){o||(V(()=>{i&&i.end(1),r||(r=it(n,t[8],{duration:t[12],delay:10})),r.start()}),o=!0)},o(e){r&&r.invalidate(),i=ot(n,t[7],{duration:t[12]}),o=!1},d(t){t&&_(n),t&&i&&i.end(),u()}}}function vn(t){let n,e,r,i,o,u,a,c="time"!==t[0]&&fn(t),l="year"===t[0]&&t[1]&&sn(t),f="month"===t[0]&&t[1]&&dn(t),s="day"===t[0]&&t[1]&&pn(t),d="time"===t[0]&&t[1]&&hn(t);return{c(){n=b("div"),c&&c.c(),e=$(),r=b("div"),l&&l.c(),i=$(),f&&f.c(),o=$(),s&&s.c(),u=$(),d&&d.c(),S(r,"class","pwt-date-navigator-center"),S(n,"class","pwt-date-navigator")},m(t,p){y(t,n,p),c&&c.m(n,null),m(n,e),m(n,r),l&&l.m(r,null),m(r,i),f&&f.m(r,null),m(r,o),s&&s.m(r,null),m(r,u),d&&d.m(r,null),a=!0},p(t,[a]){"time"!==t[0]?c?c.p(t,a):((c=fn(t)).c(),c.m(n,e)):c&&(c.d(1),c=null),"year"===t[0]&&t[1]?l?(l.p(t,a),3&a&&nt(l,1)):((l=sn(t)).c(),nt(l,1),l.m(r,i)):l&&(Q(),et(l,1,1,()=>{l=null}),tt()),"month"===t[0]&&t[1]?f?(f.p(t,a),3&a&&nt(f,1)):((f=dn(t)).c(),nt(f,1),f.m(r,o)):f&&(Q(),et(f,1,1,()=>{f=null}),tt()),"day"===t[0]&&t[1]?s?(s.p(t,a),3&a&&nt(s,1)):((s=pn(t)).c(),nt(s,1),s.m(r,u)):s&&(Q(),et(s,1,1,()=>{s=null}),tt()),"time"===t[0]&&t[1]?d?(d.p(t,a),3&a&&nt(d,1)):((d=hn(t)).c(),nt(d,1),d.m(r,null)):d&&(Q(),et(d,1,1,()=>{d=null}),tt())},i(t){a||(nt(l),nt(f),nt(s),nt(d),a=!0)},o(t){et(l),et(f),et(s),et(d),a=!1},d(t){t&&_(n),c&&c.d(),l&&l.d(),f&&f.d(),s&&s.d(),d&&d.d()}}}function gn(t,n,e){let r,i;f(t,Ut,t=>e(18,r=t)),f(t,$t,t=>e(21,i=t));let{viewUnix:o}=n,{viewMode:u}=n;const a=I();function c(t){a("selectmode",t)}let l,s=!0,d=i.animateSpeed,p=o,h=!0;let v,g,m,y,_,w,b,x,$;return t.$set=t=>{"viewUnix"in t&&e(13,o=t.viewUnix),"viewMode"in t&&e(0,u=t.viewMode)},t.$$.update=()=>{270336&t.$$.dirty&&e(17,v=new r(o).year()),270336&t.$$.dirty&&e(2,g=new r(o).format("YYYY")),393216&t.$$.dirty&&e(3,m=new r([v+12]).format("YYYY")),270336&t.$$.dirty&&(y=new r(o).format("MMMM")),270336&t.$$.dirty&&(_=new r(o).format("DD")),2367488&t.$$.dirty&&e(4,w=i.dayPicker.titleFormatter(o,r)),2367488&t.$$.dirty&&e(5,b=i.timePicker.titleFormatter(o,r)),2367488&t.$$.dirty&&e(6,x=i.monthPicker.titleFormatter(o,r)),2367488&t.$$.dirty&&($=i.yearPicker.titleFormatter(o,r)),2269184&t.$$.dirty&&o&&(l=v-v%12,h=o>p,e(15,p=o),i.animate&&(e(1,s=!1),setTimeout(()=>{e(1,s=!0)},2*d)))},[u,s,g,m,w,b,x,function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${h?"-":""}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},function(t,{duration:n,delay:e}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(${h?"":"-"}${20-20*t}px, 0);\n\t\t\t\topacity: ${t};\n\t\t\t\t`}},c,function(t){a("next",t)},function(t){a("prev",t)},d,o,l,p,h,v,r,y,_,i,$,a,function(t){a("today",t)},()=>c("year"),()=>c("month"),()=>c("date")]}class mn extends dt{constructor(t){super(),st(this,t,gn,vn,u,{viewUnix:13,viewMode:0})}}function yn(t){let n,e,r,i,o,u;return{c(){n=b("div"),e=b("span"),r=x(t[3]),S(e,"class","pwt-date-info--sub-title")},m(t,i){y(t,n,i),m(n,e),m(e,r),u=!0},p(t,n){(!u||8&n)&&M(r,t[3])},i(e){u||(V(()=>{o&&o.end(1),i||(i=it(n,t[6],{duration:t[7],offset:10})),i.start()}),u=!0)},o(e){i&&i.invalidate(),o=ot(n,t[5],{duration:t[7],offset:10}),u=!1},d(t){t&&_(n),t&&o&&o.end()}}}function _n(t){let n,e;return{c(){n=b("span"),e=x(t[4]),S(n,"class","pwt-date-info--time")},m(t,r){y(t,n,r),m(n,e)},p(t,n){16&n&&M(e,t[4])},d(t){t&&_(n)}}}function wn(t){let n,e,r,i,o,u,a=t[0]&&yn(t),c=t[2].timePicker.hour.enabled&&_n(t);return{c(){n=b("div"),e=b("span"),r=x(t[1]),i=$(),a&&a.c(),o=$(),c&&c.c(),S(e,"class","pwt-date-info--title"),S(n,"class","pwt-date-info")},m(t,l){y(t,n,l),m(n,e),m(e,r),m(n,i),a&&a.m(n,null),m(n,o),c&&c.m(n,null),u=!0},p(t,[e]){(!u||2&e)&&M(r,t[1]),t[0]?a?(a.p(t,e),1&e&&nt(a,1)):((a=yn(t)).c(),nt(a,1),a.m(n,o)):a&&(Q(),et(a,1,1,()=>{a=null}),tt()),t[2].timePicker.hour.enabled?c?c.p(t,e):((c=_n(t)).c(),c.m(n,null)):c&&(c.d(1),c=null)},i(t){u||(nt(a),u=!0)},o(t){et(a),u=!1},d(t){t&&_(n),a&&a.d(),c&&c.d()}}}function bn(t,n,e){let r,i;f(t,$t,t=>e(2,r=t)),f(t,Ut,t=>e(12,i=t));let o,u,a,{viewUnix:c}=n,{selectedUnix:l}=n,s=!0,d=r.animateSpeed,p=c,h=!0;return t.$set=t=>{"viewUnix"in t&&e(8,c=t.viewUnix),"selectedUnix"in t&&e(9,l=t.selectedUnix)},t.$$.update=()=>{4612&t.$$.dirty&&e(1,o=r.infobox.titleFormatter(l,i)),4612&t.$$.dirty&&e(3,u=r.infobox.selectedDateFormatter(l,i)),4612&t.$$.dirty&&e(4,a=r.infobox.selectedTimeFormatter(l,i)),1548&t.$$.dirty&&u&&(h=l>p,e(10,p=l),r.animate&&(e(0,s=!1),setTimeout(()=>{e(0,s=!0)},2*d)))},[s,o,r,u,a,function(t,{duration:n,delay:e,offset:r}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(0, ${h?"-":""}${r-t*r}px);\n\t\t\t\t`}},function(t,{duration:n,delay:e,offset:r}){return{duration:n,delay:e,css:t=>`\n\t\t\t\ttransform: translate(0, ${h?"":"-"}${r-t*r}px);\n\t\t\t\t`}},d,c,l]}class xn extends dt{constructor(t){super(),st(this,t,bn,wn,u,{viewUnix:8,selectedUnix:9})}}function $n(n){let e,r;return{c(){(e=b("button")).textContent="Time",S(e,"class","pwt-date-toolbox-button")},m(t,i,o){y(t,e,i),o&&r(),r=D(e,"click",n[13])},p:t,d(t){t&&_(e),r()}}}function kn(n){let e,r;return{c(){(e=b("button")).textContent="Date",S(e,"class","pwt-date-toolbox-button")},m(t,i,o){y(t,e,i),o&&r(),r=D(e,"click",n[14])},p:t,d(t){t&&_(e),r()}}}function Dn(n){let e,r;return{c(){(e=b("button")).textContent="Today",S(e,"class","pwt-date-toolbox-button")},m(t,i,o){y(t,e,i),o&&r(),r=D(e,"click",n[4])},p:t,d(t){t&&_(e),r()}}}function Sn(t){let n,e,r="persian"===t[1].calendarType&&Mn(t),i="gregorian"===t[1].calendarType&&Un(t);return{c(){r&&r.c(),n=$(),i&&i.c(),e=k()},m(t,o){r&&r.m(t,o),y(t,n,o),i&&i.m(t,o),y(t,e,o)},p(t,o){"persian"===t[1].calendarType?r?r.p(t,o):((r=Mn(t)).c(),r.m(n.parentNode,n)):r&&(r.d(1),r=null),"gregorian"===t[1].calendarType?i?i.p(t,o):((i=Un(t)).c(),i.m(e.parentNode,e)):i&&(i.d(1),i=null)},d(t){r&&r.d(t),t&&_(n),i&&i.d(t),t&&_(e)}}}function Mn(n){let e,r;return{c(){(e=b("button")).textContent="gregorian",S(e,"class","pwt-date-toolbox-button")},m(t,i,o){y(t,e,i),o&&r(),r=D(e,"click",n[15])},p:t,d(t){t&&_(e),r()}}}function Un(n){let e,r;return{c(){(e=b("button")).textContent="Jalali",S(e,"class","pwt-date-toolbox-button")},m(t,i,o){y(t,e,i),o&&r(),r=D(e,"click",n[16])},p:t,d(t){t&&_(e),r()}}}function Tn(n){let e,r;return{c(){(e=b("button")).textContent="Submit",S(e,"class","pwt-date-toolbox-button")},m(t,i,o){y(t,e,i),o&&r(),r=D(e,"click",n[17])},p:t,d(t){t&&_(e),r()}}}function Pn(n){let e,r,i,o,u,a="time"!==n[0]&&$n(n),c="time"===n[0]&&kn(n),l=n[1].toolbox.todayButton.enabled&&Dn(n),f=n[1].toolbox.calendarSwitch.enabled&&Sn(n),s=n[1].toolbox.submitButton.enabled&&Tn(n);return{c(){e=b("div"),a&&a.c(),r=$(),c&&c.c(),i=$(),l&&l.c(),o=$(),f&&f.c(),u=$(),s&&s.c(),S(e,"class","pwt-date-toolbox")},m(t,n){y(t,e,n),a&&a.m(e,null),m(e,r),c&&c.m(e,null),m(e,i),l&&l.m(e,null),m(e,o),f&&f.m(e,null),m(e,u),s&&s.m(e,null)},p(t,[n]){"time"!==t[0]?a?a.p(t,n):((a=$n(t)).c(),a.m(e,r)):a&&(a.d(1),a=null),"time"===t[0]?c?c.p(t,n):((c=kn(t)).c(),c.m(e,i)):c&&(c.d(1),c=null),t[1].toolbox.todayButton.enabled?l?l.p(t,n):((l=Dn(t)).c(),l.m(e,o)):l&&(l.d(1),l=null),t[1].toolbox.calendarSwitch.enabled?f?f.p(t,n):((f=Sn(t)).c(),f.m(e,u)):f&&(f.d(1),f=null),t[1].toolbox.submitButton.enabled?s?s.p(t,n):((s=Tn(t)).c(),s.m(e,null)):s&&(s.d(1),s=null)},i:t,o:t,d(t){t&&_(e),a&&a.d(),c&&c.d(),l&&l.d(),f&&f.d(),s&&s.d()}}}function Ln(t,n,e){let r;f(t,$t,t=>e(1,r=t));let{viewUnix:i}=n,{viewMode:o}=n;const u=I();function a(t){u("selectmode",t)}function c(t){u("setcalendar",t)}let l,s;let d,p;return t.$set=t=>{"viewUnix"in t&&e(5,i=t.viewUnix),"viewMode"in t&&e(0,o=t.viewMode)},t.$$.update=()=>{if(32&t.$$.dirty&&e(8,d=new persianDate(i).year()),32&t.$$.dirty&&(p=new persianDate(i).format("MMMM")),448&t.$$.dirty){e(6,l=[]),e(7,s=d-d%12);let t=0;for(;t<12;)l.push(s+t),t++}},[o,r,a,c,function(t){u("today",t)},i,l,s,d,p,u,function(t){u("next",t)},function(t){u("prev",t)},()=>a("time"),()=>a("day"),()=>c("gregorian"),()=>c("persian"),()=>{alert("Please implement submit button")}]}class Cn extends dt{constructor(t){super(),st(this,t,Ln,Pn,u,{viewUnix:5,viewMode:0})}}function On(t,n,e){let r,i,o,u;f(t,$t,t=>e(3,r=t)),f(t,kt,t=>e(4,i=t)),f(t,Dt,t=>e(5,o=t)),f(t,Ut,t=>e(6,u=t));let{originalContainer:a}=n,{plotarea:c}=n,{setPlotPostion:l=function(){let t="auto"!==r.position?r.position[0]:0,n="auto"!==r.position?r.position[1]:0,i=()=>{c&&a&&"INPUT"===a.tagName&&(e(1,c.style.position="absolute",c),e(1,c.style.left=a.offsetLeft+t+"px",c),e(1,c.style.top=parseInt(a.offsetTop)+n+parseInt(a.clientHeight)+document.body.scrollTop+"px",c))};i(),setTimeout(()=>{i()},0)}}=n;const s=I();let d=function(){if(a){let t=a.value;setTimeout(()=>{s("setinitialvalue",t)},0)}};return d(),l(),function(){let t=n=>{c&&c.contains(n.target)||n.target==a||"pwt-date-navigator-button"===n.target.className||"pwt-date-toolbox-button"===n.target.className||(s("setvisibility",!1),document.removeEventListener("click",t))};a&&"INPUT"===a.tagName&&a.addEventListener("focus",()=>{l(),s("setvisibility",!0),document.addEventListener("click",t)})}(),r.observer&&a&&"INPUT"===a.tagName&&(a.addEventListener("paste",t=>{setTimeout(()=>{d()},0)}),a.addEventListener("keyup",t=>{setTimeout(()=>{d()},0)})),t.$set=t=>{"originalContainer"in t&&e(0,a=t.originalContainer),"plotarea"in t&&e(1,c=t.plotarea),"setPlotPostion"in t&&e(2,l=t.setPlotPostion)},t.$$.update=()=>{32&t.$$.dirty&&o&&function(){if(a&&"INPUT"===a.tagName&&r.initialValue||i){let t=r.formatter(o,u);if(a&&"INPUT"===a.tagName&&e(0,a.value=t,a),r.altField){let t=document.querySelector(r.altField);t&&"INPUT"===a.altField&&(t.value=r.altFieldFormatter(o,u))}}}()},[a,c,l]}class An extends dt{constructor(t){super(),st(this,t,On,null,u,{originalContainer:0,plotarea:1,setPlotPostion:2})}get originalContainer(){return this.$$.ctx[0]}set originalContainer(t){this.$set({originalContainer:t}),H()}get plotarea(){return this.$$.ctx[1]}set plotarea(t){this.$set({plotarea:t}),H()}get setPlotPostion(){return this.$$.ctx[2]}set setPlotPostion(t){this.$set({setPlotPostion:t}),H()}}function jn(t){let n,e,r,i,o,u,a,c,l=t[4].infobox.enabled&&In(t),f=t[4].navigator.enabled&&En(t),s=!t[4].onlyTimePicker&&Fn(t),d=("time"===t[7]&&t[4].timePicker.enabled||t[4].onlyTimePicker)&&Bn(t),p=t[4].toolbox.enabled&&Vn(t);return{c(){n=b("div"),l&&l.c(),e=$(),f&&f.c(),r=$(),i=b("div"),s&&s.c(),o=$(),d&&d.c(),u=$(),p&&p.c(),S(i,"class","pwt-datepicker-picker-section"),S(n,"class","pwt-datepicker")},m(h,v,g){y(h,n,v),l&&l.m(n,null),m(n,e),f&&f.m(n,null),m(n,r),m(n,i),s&&s.m(i,null),m(i,o),d&&d.m(i,null),m(n,u),p&&p.m(n,null),t[37](n),a=!0,g&&c(),c=D(n,"wheel",t[21])},p(t,u){t[4].infobox.enabled?l?(l.p(t,u),16&u[0]&&nt(l,1)):((l=In(t)).c(),nt(l,1),l.m(n,e)):l&&(Q(),et(l,1,1,()=>{l=null}),tt()),t[4].navigator.enabled?f?(f.p(t,u),16&u[0]&&nt(f,1)):((f=En(t)).c(),nt(f,1),f.m(n,r)):f&&(Q(),et(f,1,1,()=>{f=null}),tt()),t[4].onlyTimePicker?s&&(Q(),et(s,1,1,()=>{s=null}),tt()):s?(s.p(t,u),16&u[0]&&nt(s,1)):((s=Fn(t)).c(),nt(s,1),s.m(i,o)),"time"===t[7]&&t[4].timePicker.enabled||t[4].onlyTimePicker?d?(d.p(t,u),144&u[0]&&nt(d,1)):((d=Bn(t)).c(),nt(d,1),d.m(i,null)):d&&(Q(),et(d,1,1,()=>{d=null}),tt()),t[4].toolbox.enabled?p?(p.p(t,u),16&u[0]&&nt(p,1)):((p=Vn(t)).c(),nt(p,1),p.m(n,null)):p&&(Q(),et(p,1,1,()=>{p=null}),tt())},i(t){a||(nt(l),nt(f),nt(s),nt(d),nt(p),a=!0)},o(t){et(l),et(f),et(s),et(d),et(p),a=!1},d(e){e&&_(n),l&&l.d(),f&&f.d(),s&&s.d(),d&&d.d(),p&&p.d(),t[37](null),c()}}}function In(t){let n;const e=new xn({props:{viewUnix:t[6],selectedUnix:t[5]}});return{c(){at(e.$$.fragment)},m(t,r){ct(e,t,r),n=!0},p(t,n){const r={};64&n[0]&&(r.viewUnix=t[6]),32&n[0]&&(r.selectedUnix=t[5]),e.$set(r)},i(t){n||(nt(e.$$.fragment,t),n=!0)},o(t){et(e.$$.fragment,t),n=!1},d(t){lt(e,t)}}}function En(t){let n;const e=new mn({props:{viewMode:t[7],viewUnix:t[6],selectedUnix:t[5]}});return e.$on("selectmode",t[20]),e.$on("today",t[17]),e.$on("next",t[18]),e.$on("prev",t[19]),{c(){at(e.$$.fragment)},m(t,r){ct(e,t,r),n=!0},p(t,n){const r={};128&n[0]&&(r.viewMode=t[7]),64&n[0]&&(r.viewUnix=t[6]),32&n[0]&&(r.selectedUnix=t[5]),e.$set(r)},i(t){n||(nt(e.$$.fragment,t),n=!0)},o(t){et(e.$$.fragment,t),n=!1},d(t){lt(e,t)}}}function Fn(t){let n,e,r,i,o="year"===t[7]&&t[4].yearPicker.enabled&&zn(t),u="month"===t[7]&&t[4].monthPicker.enabled&&Nn(t),a="day"===t[7]&&t[4].dayPicker.enabled&&Rn(t);return{c(){o&&o.c(),n=$(),u&&u.c(),e=$(),a&&a.c(),r=k()},m(t,c){o&&o.m(t,c),y(t,n,c),u&&u.m(t,c),y(t,e,c),a&&a.m(t,c),y(t,r,c),i=!0},p(t,i){"year"===t[7]&&t[4].yearPicker.enabled?o?(o.p(t,i),144&i[0]&&nt(o,1)):((o=zn(t)).c(),nt(o,1),o.m(n.parentNode,n)):o&&(Q(),et(o,1,1,()=>{o=null}),tt()),"month"===t[7]&&t[4].monthPicker.enabled?u?(u.p(t,i),144&i[0]&&nt(u,1)):((u=Nn(t)).c(),nt(u,1),u.m(e.parentNode,e)):u&&(Q(),et(u,1,1,()=>{u=null}),tt()),"day"===t[7]&&t[4].dayPicker.enabled?a?(a.p(t,i),144&i[0]&&nt(a,1)):((a=Rn(t)).c(),nt(a,1),a.m(r.parentNode,r)):a&&(Q(),et(a,1,1,()=>{a=null}),tt())},i(t){i||(nt(o),nt(u),nt(a),i=!0)},o(t){et(o),et(u),et(a),i=!1},d(t){o&&o.d(t),t&&_(n),u&&u.d(t),t&&_(e),a&&a.d(t),t&&_(r)}}}function zn(t){let n,e,r;const i=new jt({props:{viewUnix:t[6],selectedUnix:t[5]}});return i.$on("select",t[16]),{c(){n=b("div"),at(i.$$.fragment)},m(t,e){y(t,n,e),ct(i,n,null),r=!0},p(t,n){const e={};64&n[0]&&(e.viewUnix=t[6]),32&n[0]&&(e.selectedUnix=t[5]),i.$set(e)},i(o){r||(nt(i.$$.fragment,o),V(()=>{e||(e=ut(n,pt,{duration:t[8]},!0)),e.run(1)}),r=!0)},o(o){et(i.$$.fragment,o),e||(e=ut(n,pt,{duration:t[8]},!1)),e.run(0),r=!1},d(t){t&&_(n),lt(i),t&&e&&e.end()}}}function Nn(t){let n,e,r;const i=new Rt({props:{viewUnix:t[6],selectedUnix:t[5]}});return i.$on("select",t[15]),{c(){n=b("div"),at(i.$$.fragment)},m(t,e){y(t,n,e),ct(i,n,null),r=!0},p(t,n){const e={};64&n[0]&&(e.viewUnix=t[6]),32&n[0]&&(e.selectedUnix=t[5]),i.$set(e)},i(o){r||(nt(i.$$.fragment,o),V(()=>{e||(e=ut(n,pt,{duration:t[8]},!0)),e.run(1)}),r=!0)},o(o){et(i.$$.fragment,o),e||(e=ut(n,pt,{duration:t[8]},!1)),e.run(0),r=!1},d(t){t&&_(n),lt(i),t&&e&&e.end()}}}function Rn(t){let n,e,r;const i=new nn({props:{viewUnix:t[6],selectedUnix:t[5]}});return i.$on("prev",t[19]),i.$on("next",t[18]),i.$on("selectDate",t[13]),{c(){n=b("div"),at(i.$$.fragment)},m(t,e){y(t,n,e),ct(i,n,null),r=!0},p(t,n){const e={};64&n[0]&&(e.viewUnix=t[6]),32&n[0]&&(e.selectedUnix=t[5]),i.$set(e)},i(o){r||(nt(i.$$.fragment,o),V(()=>{e||(e=ut(n,pt,{duration:t[8]},!0)),e.run(1)}),r=!0)},o(o){et(i.$$.fragment,o),e||(e=ut(n,pt,{duration:t[8]},!1)),e.run(0),r=!1},d(t){t&&_(n),lt(i),t&&e&&e.end()}}}function Bn(t){let n,e,r;const i=new ln({props:{selectedUnix:t[5]}});return i.$on("selectTime",t[14]),{c(){n=b("div"),at(i.$$.fragment)},m(t,e){y(t,n,e),ct(i,n,null),r=!0},p(t,n){const e={};32&n[0]&&(e.selectedUnix=t[5]),i.$set(e)},i(o){r||(nt(i.$$.fragment,o),V(()=>{e||(e=ut(n,pt,{duration:t[8]},!0)),e.run(1)}),r=!0)},o(o){et(i.$$.fragment,o),e||(e=ut(n,pt,{duration:t[8]},!1)),e.run(0),r=!1},d(t){t&&_(n),lt(i),t&&e&&e.end()}}}function Vn(t){let n;const e=new Cn({props:{viewMode:t[7],viewUnix:t[6],selectedUnix:t[5]}});return e.$on("setcalendar",t[12]),e.$on("selectmode",t[11]),e.$on("today",t[17]),e.$on("next",t[18]),e.$on("prev",t[19]),{c(){at(e.$$.fragment)},m(t,r){ct(e,t,r),n=!0},p(t,n){const r={};128&n[0]&&(r.viewMode=t[7]),64&n[0]&&(r.viewUnix=t[6]),32&n[0]&&(r.selectedUnix=t[5]),e.$set(r)},i(t){n||(nt(e.$$.fragment,t),n=!0)},o(t){et(e.$$.fragment,t),n=!1},d(t){lt(e,t)}}}function Yn(t){let n,e,r=t[3]&&jn(t),i={plotarea:t[1],originalContainer:t[0]};const o=new An({props:i});return t[38](o),o.$on("setinitialvalue",t[10]),o.$on("setvisibility",t[9]),{c(){r&&r.c(),n=$(),at(o.$$.fragment)},m(t,i){r&&r.m(t,i),y(t,n,i),ct(o,t,i),e=!0},p(t,e){t[3]?r?(r.p(t,e),8&e[0]&&nt(r,1)):((r=jn(t)).c(),nt(r,1),r.m(n.parentNode,n)):r&&(Q(),et(r,1,1,()=>{r=null}),tt());const i={};2&e[0]&&(i.plotarea=t[1]),1&e[0]&&(i.originalContainer=t[0]),o.$set(i)},i(t){e||(nt(r),nt(o.$$.fragment,t),e=!0)},o(t){et(r),et(o.$$.fragment,t),e=!1},d(e){r&&r.d(e),e&&_(n),t[38](null),lt(o,e)}}}function Wn(t,n,e){let r,i,o,u,a,c,l;f(t,$t,t=>e(4,r=t)),f(t,Dt,t=>e(5,i=t)),f(t,St,t=>e(6,o=t)),f(t,Ut,t=>e(34,u=t)),f(t,Mt,t=>e(7,a=t));let s=!1,d=r.animate?r.animateSpeed:0,{options:p={}}=n,{originalContainer:h=null}=n,{model:v=null}=n;const g=I(),m=function(t){return n=>{if(g(t,n),p[t])return n=>p[t](n);Tt[t]&&Tt[t](n)}};let y=p;p=p?bt.merge(_t,p):_t,m("setConfig")(p);let _=i;v&&(m("setDate")(parseInt(v)),_=parseInt(v));const w=function(t){e(3,s=t.detail),l&&l.setPlotPostion(),setTimeout(()=>{c&&e(1,c.style.display=s?"block":"none",c),s?r.onShow():r.onHide()},150)};r.inline&&w({detail:!0});const b=t=>{m("onSelectNextView")(t),r.navigator.onNext(t)},x=t=>{m("onSelectPrevView")(t),r.navigator.onPrev(t)};return t.$set=t=>{"options"in t&&e(22,p=t.options),"originalContainer"in t&&e(0,h=t.originalContainer),"model"in t&&e(23,v=t.model)},t.$$.update=()=>{4194304&t.$$.dirty[0]|2&t.$$.dirty[1]&&JSON.stringify(y)!==JSON.stringify(p)&&(e(22,p=p?bt.merge(_t,p):_t),m("setConfig")(p),e(32,y=p)),8388640&t.$$.dirty[0]|4&t.$$.dirty[1]&&v&&v!==_&&(m("setDate")(parseInt(v)),e(33,_=i))},[h,c,l,s,r,i,o,a,d,w,function(t){m("setFromDefaultValue")(t.detail)},function(t){m("setViewMode")(t.detail)},function(t){m("onSetCalendar")(t.detail),r.toolbox.calendarSwitch.onSwitch(t)},function(t){m("onSelectDate")(t.detail),r.dayPicker.onSelect(t.detail),r.autoClose&&w({detail:!1}),m("onSelect")(r.altFieldFormatter(i,u))},function(t){m("onSelectTime")(t),m("onSelect")(i)},function(t){m("onSelectMonth")(t.detail),r.monthPicker.onSelect(t.detail),m("onSelect")(i)},function(t){m("onSelectYear")(t.detail),r.yearPicker.onSelect(t.detail),m("onSelect")(i)},t=>{m("onSelectToday")(t),r.toolbox.todayButton.onToday(t)},b,x,t=>{m("setViewModeToUpperAvailableLevel")(),r.navigator.onSwitch(t)},t=>{r.navigator.scroll.enabled&&setTimeout(()=>{(t.deltaY>0||t.deltaX>0)&&b(),(t.deltaY<0||t.deltaX<0)&&x()},1)},p,v,function(t){m("setDate")(t)},function(){w({detail:!0})},function(){w({detail:!1})},function(){w({detail:!s})},function(){c.parentNode&&c.parentNode.removeChild&&c.parentNode.removeChild(c)},function(){return{selected:i,view:o,config:r,dateObject:u}},function(t){m("setConfig")(bt.merge(r,t))},function(){return r},y,_,u,g,m,function(t){F[t?"unshift":"push"](()=>{e(1,c=t)})},function(t){F[t?"unshift":"push"](()=>{e(2,l=t)})}]}const Hn=document.getElementById("container").attributes;function qn(t){return t.replace(/-/,"").toUpperCase()}let Zn={};return Object.keys(Hn).forEach(t=>{let n=Hn[t].value;/^\d+$/.test(n)&&(n=parseInt(n)),"true"===n&&(n=!0),"false"===n&&(n=!1),Zn[function(t){return t.replace(/-\w/g,qn)}(Hn[t].name)]=n}),console.log(Zn),new class extends dt{constructor(t){super(),st(this,t,Wn,Yn,a,{options:22,originalContainer:0,model:23,setDate:24,show:25,hide:26,toggle:27,destroy:28,getState:29,setOptions:30,getOptions:31},[-1,-1])}get options(){return this.$$.ctx[22]}set options(t){this.$set({options:t}),H()}get originalContainer(){return this.$$.ctx[0]}set originalContainer(t){this.$set({originalContainer:t}),H()}get model(){return this.$$.ctx[23]}set model(t){this.$set({model:t}),H()}get setDate(){return this.$$.ctx[24]}get show(){return this.$$.ctx[25]}get hide(){return this.$$.ctx[26]}get toggle(){return this.$$.ctx[27]}get destroy(){return this.$$.ctx[28]}get getState(){return this.$$.ctx[29]}get setOptions(){return this.$$.ctx[30]}get getOptions(){return this.$$.ctx[31]}}({target:document.getElementById("container"),props:{options:Zn}})}();
>>>>>>> 77b0e70... fix: svelte build script issue
//# sourceMappingURL=pwt-datepicker.js.map
