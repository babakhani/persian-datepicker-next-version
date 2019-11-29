/**
 * 
 * zerounip
 * v0.0.1
 * babakhani.reza@gmail.com
 * license MIT
 * 
 *     
 */

import React, { useRef, useState, useEffect } from 'react';

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
    if (!store || typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
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
function to_number(value) {
    return value === '' ? undefined : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
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
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}

const globals = (typeof window !== 'undefined' ? window : global);
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

var Options = {
  sampleConfig: 'This is sample default config',
  onSampleEvent: null
};

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

const time = readable(new Date(), function start (set) {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);
  return function stop () {
    clearInterval(interval);
  }
});
const start = new Date();
const elapsed = derived(time, $time =>
  Math.round(($time - start) / 1000)
);
const countable = (function () {
  const { subscribe, set, update } = writable(0);
  return {
    set: input => update(() => input),
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  }
})();

/* src/app.svelte generated by Svelte v3.15.0 */

const { Object: Object_1 } = globals;
const file = "src/app.svelte";

function create_fragment(ctx) {
	let div4;
	let h1;
	let t1;
	let div3;
	let h20;
	let t3;
	let p;
	let t4_value = ctx.dateFormatter.format(ctx.$time) + "";
	let t4;
	let t5;
	let h21;
	let t7;
	let h30;
	let t8;
	let t9;
	let h5;
	let t11;
	let h22;
	let t13;
	let h31;
	let t14;
	let t15;
	let button0;
	let t17;
	let input0;
	let input0_updating = false;
	let t18;
	let button1;
	let t20;
	let div0;
	let t21;
	let input1;
	let t22;
	let div1;
	let t23;
	let h23;
	let t25;
	let div2;
	let button2;
	let dispose;

	function input0_input_handler() {
		input0_updating = true;
		ctx.input0_input_handler.call(input0);
	}

	const block = {
		c: function create() {
			div4 = element("div");
			h1 = element("h1");
			h1.textContent = "ZeroUnip Project";
			t1 = space();
			div3 = element("div");
			h20 = element("h2");
			h20.textContent = "Store Readable demo";
			t3 = space();
			p = element("p");
			t4 = text(t4_value);
			t5 = space();
			h21 = element("h2");
			h21.textContent = "Store Derived demo";
			t7 = space();
			h30 = element("h3");
			t8 = text(ctx.$elapsed);
			t9 = space();
			h5 = element("h5");
			h5.textContent = "Elapsed time after page loading:";
			t11 = space();
			h22 = element("h2");
			h22.textContent = "Store Derived demo";
			t13 = space();
			h31 = element("h3");
			t14 = text(ctx.$countable);
			t15 = space();
			button0 = element("button");
			button0.textContent = "-";
			t17 = space();
			input0 = element("input");
			t18 = space();
			button1 = element("button");
			button1.textContent = "+";
			t20 = space();
			div0 = element("div");
			t21 = space();
			input1 = element("input");
			t22 = space();
			div1 = element("div");
			t23 = space();
			h23 = element("h2");
			h23.textContent = "Plugin Event Example";
			t25 = space();
			div2 = element("div");
			button2 = element("button");
			button2.textContent = "Add Count";
			attr_dev(h1, "class", "center");
			add_location(h1, file, 5, 2, 156);
			add_location(h20, file, 7, 4, 229);
			add_location(p, file, 8, 4, 262);
			add_location(h21, file, 9, 4, 303);
			add_location(h30, file, 10, 4, 335);
			add_location(h5, file, 11, 4, 359);
			add_location(h22, file, 12, 4, 405);
			add_location(h31, file, 13, 4, 437);
			add_location(button0, file, 14, 4, 463);
			attr_dev(input0, "type", "number");
			add_location(input0, file, 15, 4, 519);
			add_location(button1, file, 16, 4, 573);
			attr_dev(div0, "class", "spacer");
			add_location(div0, file, 17, 4, 629);
			attr_dev(input1, "type", "range");
			attr_dev(input1, "min", "0");
			attr_dev(input1, "max", "1000");
			add_location(input1, file, 18, 4, 660);
			attr_dev(div1, "class", "spacer");
			add_location(div1, file, 19, 4, 732);
			add_location(h23, file, 20, 4, 763);
			add_location(button2, file, 22, 6, 825);
			attr_dev(div2, "class", "section");
			add_location(div2, file, 21, 4, 797);
			attr_dev(div3, "class", "container");
			add_location(div3, file, 6, 2, 201);
			attr_dev(div4, "class", "plugvelte-container");
			add_location(div4, file, 4, 0, 120);

			dispose = [
				listen_dev(button0, "click", countable.decrement, false, false, false),
				listen_dev(input0, "input", input0_input_handler),
				listen_dev(button1, "click", countable.increment, false, false, false),
				listen_dev(input1, "change", ctx.input1_change_input_handler),
				listen_dev(input1, "input", ctx.input1_change_input_handler),
				listen_dev(button2, "mouseover", ctx.onSampleEventOver, false, false, false),
				listen_dev(button2, "click", ctx.onSampleEvent, false, false, false)
			];
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div4, anchor);
			append_dev(div4, h1);
			append_dev(div4, t1);
			append_dev(div4, div3);
			append_dev(div3, h20);
			append_dev(div3, t3);
			append_dev(div3, p);
			append_dev(p, t4);
			append_dev(div3, t5);
			append_dev(div3, h21);
			append_dev(div3, t7);
			append_dev(div3, h30);
			append_dev(h30, t8);
			append_dev(div3, t9);
			append_dev(div3, h5);
			append_dev(div3, t11);
			append_dev(div3, h22);
			append_dev(div3, t13);
			append_dev(div3, h31);
			append_dev(h31, t14);
			append_dev(div3, t15);
			append_dev(div3, button0);
			append_dev(div3, t17);
			append_dev(div3, input0);
			set_input_value(input0, ctx.$countable);
			append_dev(div3, t18);
			append_dev(div3, button1);
			append_dev(div3, t20);
			append_dev(div3, div0);
			append_dev(div3, t21);
			append_dev(div3, input1);
			set_input_value(input1, ctx.$countable);
			append_dev(div3, t22);
			append_dev(div3, div1);
			append_dev(div3, t23);
			append_dev(div3, h23);
			append_dev(div3, t25);
			append_dev(div3, div2);
			append_dev(div2, button2);
		},
		p: function update(changed, ctx) {
			if (changed.$time && t4_value !== (t4_value = ctx.dateFormatter.format(ctx.$time) + "")) set_data_dev(t4, t4_value);
			if (changed.$elapsed) set_data_dev(t8, ctx.$elapsed);
			if (changed.$countable) set_data_dev(t14, ctx.$countable);

			if (!input0_updating && changed.$countable) {
				set_input_value(input0, ctx.$countable);
			}

			input0_updating = false;

			if (changed.$countable) {
				set_input_value(input1, ctx.$countable);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div4);
			run_all(dispose);
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
	let $time;
	let $elapsed;
	let $countable;
	validate_store(time, "time");
	component_subscribe($$self, time, $$value => $$invalidate("$time", $time = $$value));
	validate_store(elapsed, "elapsed");
	component_subscribe($$self, elapsed, $$value => $$invalidate("$elapsed", $elapsed = $$value));
	validate_store(countable, "countable");
	component_subscribe($$self, countable, $$value => $$invalidate("$countable", $countable = $$value));
	let { options } = $$props;

	if (!options) {
		$$invalidate("options", options = Options);
	} else {
		$$invalidate("options", options = Object.assign(Options, options));
	}

	const dispatch = createEventDispatcher();

	const dispatcher = function (input) {
		if (options[input]) {
			return event => options[input](event);
		} else {
			return event => dispatch(input, event);
		}
	};

	const dateFormatter = new Intl.DateTimeFormat("en",
	{
			hour12: true,
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit"
		});

	const onSampleEventOver = function () {
		dispatcher("onSampleEventOver")();
	};

	const onSampleEvent = function () {
		countable.increment(n => n + 1);
		dispatcher("onSampleEvent")();
	};

	const writable_props = ["options"];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	function input0_input_handler() {
		$countable = to_number(this.value);
		countable.set($countable);
	}

	function input1_change_input_handler() {
		$countable = to_number(this.value);
		countable.set($countable);
	}

	$$self.$set = $$props => {
		if ("options" in $$props) $$invalidate("options", options = $$props.options);
	};

	$$self.$capture_state = () => {
		return { options, $time, $elapsed, $countable };
	};

	$$self.$inject_state = $$props => {
		if ("options" in $$props) $$invalidate("options", options = $$props.options);
		if ("$time" in $$props) time.set($time = $$props.$time);
		if ("$elapsed" in $$props) elapsed.set($elapsed = $$props.$elapsed);
		if ("$countable" in $$props) countable.set($countable = $$props.$countable);
	};

	return {
		options,
		dateFormatter,
		onSampleEventOver,
		onSampleEvent,
		$time,
		$elapsed,
		$countable,
		input0_input_handler,
		input1_change_input_handler
	};
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { options: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.options === undefined && !("options" in props)) {
			console.warn("<App> was created without expected prop 'options'");
		}
	}

	get options() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set options(value) {
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
