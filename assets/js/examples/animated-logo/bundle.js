
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
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

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
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
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut }) {
        const len = node.getTotalLength();
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }

    /* src/components/SiteLogoExample.svelte generated by Svelte v3.22.2 */
    const file = "src/components/SiteLogoExample.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (88:0) {#if visible}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let div;
    	let svg;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*animateCloud*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*paths*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if_block.c();
    			t = space();
    			div = element("div");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "height", "85.109px");
    			attr_dev(svg, "width", "141.512px");
    			attr_dev(svg, "viewBox", "-2 -1 143.512 87.109");
    			attr_dev(svg, "class", "svelte-rotu5g");
    			add_location(svg, file, 102, 4, 6497);
    			attr_dev(div, "class", "craiginiowa-logo svelte-rotu5g");
    			add_location(div, file, 101, 2, 6462);
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(t.parentNode, t);
    			}

    			if (dirty & /*paths, done*/ 24) {
    				each_value = /*paths*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
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
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(88:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (95:2) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let br2;
    	let t3;
    	let div_outro;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("developer • graphic");
    			br0 = element("br");
    			t1 = text("artist • illustrator •");
    			br1 = element("br");
    			t2 = text("copy editor • other");
    			br2 = element("br");
    			t3 = text("assorted activities");
    			add_location(br0, file, 98, 28, 6355);
    			add_location(br1, file, 98, 64, 6391);
    			add_location(br2, file, 98, 92, 6419);
    			attr_dev(div, "class", "skills-cloud");
    			add_location(div, file, 95, 2, 6227);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, br1);
    			append_dev(div, t2);
    			append_dev(div, br2);
    			append_dev(div, t3);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "outroend", /*outroend_handler_1*/ ctx[9], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, { duration: 10 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(95:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (89:2) {#if animateCloud}
    function create_if_block_3(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let br2;
    	let t3;
    	let div_outro;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("developer • graphic");
    			br0 = element("br");
    			t1 = text("artist • illustrator •");
    			br1 = element("br");
    			t2 = text("copy editor • other");
    			br2 = element("br");
    			t3 = text("assorted activities");
    			add_location(br0, file, 92, 28, 6118);
    			add_location(br1, file, 92, 64, 6154);
    			add_location(br2, file, 92, 92, 6182);
    			attr_dev(div, "class", "skills-cloud");
    			add_location(div, file, 89, 2, 5990);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, br1);
    			append_dev(div, t2);
    			append_dev(div, br2);
    			append_dev(div, t3);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "outroend", /*outroend_handler*/ ctx[8], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, { duration: 10 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(89:2) {#if animateCloud}",
    		ctx
    	});

    	return block;
    }

    // (114:6) {:else}
    function create_else_block(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[12]);
    			attr_dev(path, "class", "svelte-rotu5g");
    			add_location(path, file, 114, 6, 6944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[14] * 200,
    						duration: 1000
    					});

    					path_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(114:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (112:24) 
    function create_if_block_2(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;
    	let dispose;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[12]);
    			attr_dev(path, "class", "svelte-rotu5g");
    			add_location(path, file, 112, 6, 6826);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, path, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(path, "introend", /*introend_handler*/ ctx[10], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[14] * 200,
    						duration: 1000
    					});

    					path_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(112:24) ",
    		ctx
    	});

    	return block;
    }

    // (110:6) {#if i == 5 || i == 6}
    function create_if_block_1(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "opacity", "0.5");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[12]);
    			attr_dev(path, "class", "svelte-rotu5g");
    			add_location(path, file, 110, 6, 6717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[14] * 200,
    						duration: 1000
    					});

    					path_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(110:6) {#if i == 5 || i == 6}",
    		ctx
    	});

    	return block;
    }

    // (109:6) {#each paths as path, i}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[14] == 5 || /*i*/ ctx[14] == 6) return create_if_block_1;
    		if (/*i*/ ctx[14] == 10) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(109:6) {#each paths as path, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let label;
    	let button;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			label = element("label");
    			button = element("button");
    			button.textContent = "replay animation";
    			attr_dev(div0, "class", "billboard svelte-rotu5g");
    			toggle_class(div0, "done", /*done*/ ctx[3]);
    			add_location(div0, file, 84, 0, 5899);
    			add_location(button, file, 123, 4, 7112);
    			add_location(label, file, 122, 2, 7100);
    			attr_dev(div1, "class", "toggle-container svelte-rotu5g");
    			add_location(div1, file, 121, 0, 7067);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			if (if_block) if_block.m(div0, null);
    			/*div0_binding*/ ctx[11](div0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, button);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*replay*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*done*/ 8) {
    				toggle_class(div0, "done", /*done*/ ctx[3]);
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
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			/*div0_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			dispose();
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
    	const paths = [
    		"M20.761,31.92C18.552,34.372,15.13,36,11.24,36C4.047,36,0,30.587,0,23.268 c0-8.014,5.047-12.732,12.128-12.732c3.245,0,6.191,1.337,8.367,3.515l-1.664,2.273c-0.492,0.679-1.475,0.625-2.007,0.295 s-2.312-1.518-4.78-1.518s-5.972,1.649-5.972,8.13s3.682,8.196,5.724,8.196c2.625,0,3.875-0.883,5.185-1.872 c0.825-0.623,1.576-0.431,2.076,0.204L20.761,31.92z",
    		"M24.552,35.592V10.968h3.48c0.607,0,1.031,0.112,1.271,0.336c0.239,0.224,0.398,0.608,0.479,1.152 l0.359,2.976c0.88-1.52,1.912-2.72,3.097-3.6c1.184-0.88,2.512-1.32,3.983-1.32c1.216,0,2.224,0.28,3.023,0.84l-0.769,4.44 c-0.048,0.288-0.152,0.492-0.312,0.612c-0.16,0.12-0.376,0.18-0.647,0.18c-0.239,0-0.567-0.056-0.983-0.168 c-0.417-0.112-0.969-0.168-1.656-0.168c-1.231,0-2.288,0.34-3.168,1.02c-0.88,0.681-1.624,1.676-2.231,2.988v15.336H24.552z",
    		"M62.759,35.592h-2.663c-1.507,0-1.881-0.76-2.04-1.272l-0.527-1.752c-1.94,1.852-4.523,3.408-8.136,3.408 c-4.971,0-7.152-2.973-7.152-6.694c0-5.654,7.431-7.779,14.735-7.754v-1.451c0-3.657-2.012-4.885-4.08-4.885 c-2.391,0-4.976,1.624-5.376,1.848c-1.181,0.756-2.431,0.38-3.047-0.744l-1.08-1.896c2.832-2.592,6.248-3.888,10.248-3.888 c6.864,0,9.119,5.241,9.119,9.528L62.759,35.592L62.759,35.592z M51.239,31.896c1.599,0,3.891-0.601,5.735-2.623v-4.122 c-5.678-0.148-9.071,1.436-9.071,3.819C47.903,31.17,49.755,31.896,51.239,31.896z",
    		"M75.75,3.858c0,2.071-1.679,3.75-3.75,3.75c-2.071,0-3.75-1.679-3.75-3.75s1.679-3.75,3.75-3.75 C74.071,0.108,75.75,1.787,75.75,3.858z M68.975,10.968v24.624h5.929V10.968H68.975z",
    		"M90.12,10.536c1.672,0,4.172,0.432,5.521,1.272h7.08v2.208c0,0.672-0.403,0.961-1.272,1.296L99.24,15.72 c0.969,2.076,0.623,6.447-2.243,8.592c-2.872,2.149-7.08,2.566-9.589,1.896c-0.768,0.467-1.151,0.991-1.151,1.571 c0,1.058,1.741,1.499,2.484,1.596c0.744,0.097,4.443,0.204,5.436,0.266c2.447,0.154,7.921,0.987,7.921,6.019 c0,4.371-4.514,8.596-11.904,8.596c-7.276,0-10.992-3.045-10.992-6.503c0-2.5,2.008-4.167,3.985-4.776 c-1.353-0.724-2.017-1.849-2.017-3.528c0-1.575,1.414-3.654,3.191-4.32c-2.402-1.417-4.007-3.625-4.007-6.624 C80.354,14.503,83.542,10.536,90.12,10.536z M96.624,36.625c0-1.705-2.138-2.426-5.46-2.426c-0.744,0-1.513,0-2.305,0 s-1.556-0.088-2.292-0.264c-0.672,0.368-2.231,1.36-2.231,3.048c0,1.729,1.831,3.048,5.952,3.048 C94.875,40.031,96.624,38.336,96.624,36.625z M90.12,22.68c2.797,0,4.366-1.76,4.366-4.032c0-1.853-0.902-3.96-4.367-3.96 c-3.369,0-4.368,2.19-4.368,3.96C85.751,20.378,86.917,22.68,90.12,22.68z",
    		"M113.599,3.858c0,2.071-1.679,3.75-3.75,3.75c-2.07,0-3.75-1.679-3.75-3.75s1.68-3.75,3.75-3.75 C111.921,0.108,113.599,1.787,113.599,3.858z M106.823,10.968v24.624h5.929V10.968H106.823z",
    		"M119.447,35.592V10.968h3.624c0.768,0,1.271,0.36,1.512,1.08l0.408,1.944 c1.885-1.905,4.343-3.408,7.608-3.408c3.651,0,8.304,2.086,8.304,9.336v15.672h-5.928V19.92c0-1.504-0.35-2.668-1.044-3.492 c-0.696-0.824-1.74-1.236-3.134-1.236c-1.022,0-1.982,0.232-2.88,0.696c-0.896,0.464-1.744,1.096-2.544,1.896v17.808H119.447z",
    		"M1.821,49.195h8.521V84.59H1.821V49.195z M1.357,36.353c-1.143,2.026-0.893,5.942,2.652,7.442 c2.913,1.167,6.58-0.333,7.496-3.859C7.798,40.082,4.089,39.087,1.357,36.353z",
    		"M35.079,48.642c10.843,0,17.457,7.611,17.457,18.183c0,7.304-3.572,18.284-17.457,18.284 c-12.74,0-17.561-9.855-17.561-18.284C17.518,55.628,24.422,48.642,35.079,48.642z M35.079,78.554c7.177,0,8.659-6.426,8.659-11.661 c0-4.869-1.232-11.73-8.659-11.73c-7.823,0-8.763,7.175-8.763,11.73C26.316,72.67,28.006,78.554,35.079,78.554z",
    		"M54.882,49.195h6.764c0.644,0,1.184,0.149,1.621,0.448c0.437,0.3,0.713,0.68,0.828,1.139 c0,0,5.786,21.264,6.243,24.479c0.938-3.097,7.591-24.55,7.591-24.55c0.139-0.459,0.413-0.838,0.827-1.139 c0.414-0.298,0.897-0.447,1.449-0.447h3.761c0.621,0,1.14,0.149,1.554,0.447c0.413,0.301,0.688,0.68,0.827,1.139 c0,0,6.504,21.794,7.314,24.584c0.438-2.938,6.521-24.514,6.521-24.514c0.114-0.459,0.391-0.839,0.827-1.139 c0.438-0.299,0.942-0.448,1.519-0.448h6.452L97.766,84.59H90.9c-0.736,0-1.267-0.506-1.587-1.518c0,0-7.245-22.934-7.384-24.195 c-0.174,1.324-7.451,24.195-7.451,24.195c-0.322,1.012-0.943,1.518-1.863,1.518h-6.521L54.882,49.195z",
    		"M140.902,84.5h-3.804c-2.154,0-2.688-1.086-2.915-1.816l-0.754-2.502c-2.771,2.645-6.461,4.868-11.622,4.868 c-7.101,0-10.217-4.248-10.217-9.562c0-8.077,10.616-11.113,21.051-11.078v-2.072c0-5.224-2.876-6.979-5.83-6.979 c-3.415,0-7.107,2.321-7.679,2.642c-1.688,1.079-3.474,0.542-4.354-1.064l-1.542-2.708c4.046-3.701,8.925-5.554,14.64-5.554 c9.806,0,13.026,7.487,13.026,13.61L140.902,84.5L140.902,84.5z M124.447,79.222c2.283,0,5.557-0.858,8.192-3.746v-5.891 c-8.111-0.211-12.958,2.051-12.958,5.456C119.681,78.184,122.326,79.222,124.447,79.222z"
    	];

    	let el = null;
    	let animateSVG = false;
    	let animateCloud = false;
    	let animateAll = false;
    	let visible = false;
    	let done = false;

    	function replay() {
    		$$invalidate(3, done = false);
    		$$invalidate(2, visible = false);
    	}

    	onMount(() => {
    		animateAll = el.parentElement.classList.contains("animate-all");
    		animateSVG = animateAll || el.parentElement.classList.contains("animate-svg");
    		$$invalidate(1, animateCloud = animateAll || el.parentElement.classList.contains("animate-cloud"));
    		setTimeout(() => $$invalidate(2, visible = true), 500);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SiteLogoExample> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SiteLogoExample", $$slots, []);
    	const outroend_handler = () => $$invalidate(2, visible = true);
    	const outroend_handler_1 = () => $$invalidate(2, visible = true);
    	const introend_handler = () => $$invalidate(3, done = true);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, el = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		draw,
    		fade,
    		paths,
    		el,
    		animateSVG,
    		animateCloud,
    		animateAll,
    		visible,
    		done,
    		replay
    	});

    	$$self.$inject_state = $$props => {
    		if ("el" in $$props) $$invalidate(0, el = $$props.el);
    		if ("animateSVG" in $$props) animateSVG = $$props.animateSVG;
    		if ("animateCloud" in $$props) $$invalidate(1, animateCloud = $$props.animateCloud);
    		if ("animateAll" in $$props) animateAll = $$props.animateAll;
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*visible*/ 4) {
    			 if (!visible) {
    				$$invalidate(3, done = false);
    			}
    		}
    	};

    	return [
    		el,
    		animateCloud,
    		visible,
    		done,
    		paths,
    		replay,
    		animateSVG,
    		animateAll,
    		outroend_handler,
    		outroend_handler_1,
    		introend_handler,
    		div0_binding
    	];
    }

    class SiteLogoExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SiteLogoExample",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.22.2 */

    function create_fragment$1(ctx) {
    	let current;
    	const sitelogoexample = new SiteLogoExample({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sitelogoexample.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sitelogoexample, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sitelogoexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sitelogoexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sitelogoexample, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, SiteLogoExample });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const apps = {};

    document.querySelectorAll(".site-logo-example").forEach((target, i) => {
      apps[`logo${i}`] = new App({target});
    });

}());
//# sourceMappingURL=bundle.js.map
