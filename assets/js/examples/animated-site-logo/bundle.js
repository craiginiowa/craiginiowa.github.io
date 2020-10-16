
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quartOut(t) {
        return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
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
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
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

    /* src/components/AnimatedSiteLogo.svelte generated by Svelte v3.22.2 */
    const file = "src/components/AnimatedSiteLogo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (5:2) {#if visible}
    function create_if_block(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let div1_outro;
    	let t1;
    	let div2;
    	let svg;
    	let div2_outro;
    	let current;
    	let dispose;
    	let each_value_1 = wordCloud.split("");
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*paths*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div2 = element("div");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "animated-border svelte-1lluqzl");
    			toggle_class(div0, "visible", /*visible*/ ctx[1]);
    			add_location(div0, file, 5, 2, 94);
    			attr_dev(div1, "class", "skills-cloud");
    			add_location(div1, file, 6, 2, 146);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "height", "85.109px");
    			attr_dev(svg, "width", "141.512px");
    			attr_dev(svg, "viewBox", "-2 -1 143.512 87.109");
    			attr_dev(svg, "class", "svelte-1lluqzl");
    			add_location(svg, file, 20, 4, 647);
    			attr_dev(div2, "class", "craiginiowa-logo svelte-1lluqzl");
    			add_location(div2, file, 19, 2, 583);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div1, "outroend", /*outroend_handler*/ ctx[8], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*visible*/ 2) {
    				toggle_class(div0, "visible", /*visible*/ ctx[1]);
    			}

    			if (dirty & /*wordCloud*/ 0) {
    				each_value_1 = wordCloud.split("");
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*paths, done*/ 12) {
    				each_value = /*paths*/ ctx[3];
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

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			if (div1_outro) div1_outro.end(1);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (div2_outro) div2_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div1_outro = create_out_transition(div1, fade, { duration: 500 });
    			div2_outro = create_out_transition(div2, fade, { duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div2_outro) div2_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(5:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let t_value = /*letter*/ ctx[14] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 15, 4, 460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fade, {
    						delay: Math.random() * 2500 + 1000,
    						duration: 100
    					});

    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(15:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:28) 
    function create_if_block_4(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file, 13, 4, 439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(13:28) ",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if letter == "•"}
    function create_if_block_3(ctx) {
    	let span;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "•";
    			add_location(span, file, 11, 4, 320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fade, {
    						delay: Math.random() * 2500 + 1000,
    						duration: 100
    					});

    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(11:4) {#if letter == \\\"•\\\"}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#each wordCloud.split("") as letter, i}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*letter*/ ctx[14] == "•") return create_if_block_3;
    		if (/*letter*/ ctx[14] == "/") return create_if_block_4;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(10:4) {#each wordCloud.split(\\\"\\\") as letter, i}",
    		ctx
    	});

    	return block;
    }

    // (32:6) {:else}
    function create_else_block(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[11]);
    			attr_dev(path, "class", "svelte-1lluqzl");
    			add_location(path, file, 32, 6, 1091);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[13] * 200,
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
    		source: "(32:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:24) 
    function create_if_block_2(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;
    	let dispose;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[11]);
    			attr_dev(path, "class", "svelte-1lluqzl");
    			add_location(path, file, 30, 6, 976);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, path, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(path, "introend", /*introend_handler*/ ctx[9], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, { delay: 2500, duration: 1000 });
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
    		source: "(30:24) ",
    		ctx
    	});

    	return block;
    }

    // (28:6) {#if i == 5 || i == 6}
    function create_if_block_1(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "opacity", "0.5");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[11]);
    			attr_dev(path, "class", "svelte-1lluqzl");
    			add_location(path, file, 28, 6, 867);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[13] * 200,
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
    		source: "(28:6) {#if i == 5 || i == 6}",
    		ctx
    	});

    	return block;
    }

    // (27:6) {#each paths as path, i}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[13] == 5 || /*i*/ ctx[13] == 6) return create_if_block_1;
    		if (/*i*/ ctx[13] == 10) return create_if_block_2;
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
    		source: "(27:6) {#each paths as path, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "billboard svelte-1lluqzl");
    			toggle_class(div, "done", /*done*/ ctx[2]);
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[10](div);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", /*replay*/ ctx[4], false, false, false);
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
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*done*/ 4) {
    				toggle_class(div, "done", /*done*/ ctx[2]);
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
    			/*div_binding*/ ctx[10](null);
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

    const wordCloud = "developer • graphic/artist • illustrator •/copy editor • other/assorted activities";

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

    	async function replay() {
    		$$invalidate(2, done = false);
    		$$invalidate(1, visible = false);
    		await tick();
    	}

    	onMount(() => {
    		setTimeout(() => $$invalidate(1, visible = true), 500);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AnimatedSiteLogo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AnimatedSiteLogo", $$slots, []);
    	const outroend_handler = () => $$invalidate(1, visible = true);
    	const introend_handler = () => $$invalidate(2, done = true);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, el = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		draw,
    		fade,
    		quartOut,
    		paths,
    		el,
    		animateSVG,
    		animateCloud,
    		animateAll,
    		visible,
    		done,
    		wordCloud,
    		replay
    	});

    	$$self.$inject_state = $$props => {
    		if ("el" in $$props) $$invalidate(0, el = $$props.el);
    		if ("animateSVG" in $$props) animateSVG = $$props.animateSVG;
    		if ("animateCloud" in $$props) animateCloud = $$props.animateCloud;
    		if ("animateAll" in $$props) animateAll = $$props.animateAll;
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("done" in $$props) $$invalidate(2, done = $$props.done);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*visible*/ 2) {
    			 if (!visible) {
    				$$invalidate(2, done = false);
    			}
    		}
    	};

    	return [
    		el,
    		visible,
    		done,
    		paths,
    		replay,
    		animateSVG,
    		animateCloud,
    		animateAll,
    		outroend_handler,
    		introend_handler,
    		div_binding
    	];
    }

    class AnimatedSiteLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnimatedSiteLogo",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/SiteLogoExample.svelte generated by Svelte v3.22.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/SiteLogoExample.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (5:0) {#if animateAll}
    function create_if_block_6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "animated-border svelte-1qwba9b");
    			toggle_class(div, "visible", /*visible*/ ctx[3]);
    			add_location(div, file$1, 5, 2, 90);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*visible*/ 8) {
    				toggle_class(div, "visible", /*visible*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(5:0) {#if animateAll}",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if visible}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let div;
    	let svg;
    	let current;
    	const if_block_creators = [create_if_block_3$1, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*animateCloud*/ ctx[1] || /*animateAll*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*paths*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			attr_dev(svg, "class", "svelte-1qwba9b");
    			add_location(svg, file$1, 30, 4, 913);
    			attr_dev(div, "class", "craiginiowa-logo svelte-1qwba9b");
    			add_location(div, file$1, 29, 2, 878);
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

    			if (dirty & /*paths, done*/ 144) {
    				each_value = /*paths*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(8:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {:else}
    function create_else_block_2(ctx) {
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
    			add_location(br0, file$1, 26, 28, 771);
    			add_location(br1, file$1, 26, 64, 807);
    			add_location(br2, file$1, 26, 92, 835);
    			attr_dev(div, "class", "skills-cloud");
    			add_location(div, file$1, 23, 2, 643);
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
    			dispose = listen_dev(div, "outroend", /*outroend_handler_1*/ ctx[11], false, false, false);
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(23:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#if animateCloud || animateAll}
    function create_if_block_3$1(ctx) {
    	let div;
    	let div_outro;
    	let current;
    	let dispose;
    	let each_value_1 = wordCloud$1.split("");
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "skills-cloud");
    			add_location(div, file$1, 9, 2, 197);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "outroend", /*outroend_handler*/ ctx[10], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*wordCloud*/ 0) {
    				each_value_1 = wordCloud$1.split("");
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, { duration: 10 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(9:2) {#if animateCloud || animateAll}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {:else}
    function create_else_block_1$1(ctx) {
    	let span;
    	let t_value = /*letter*/ ctx[17] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$1, 18, 4, 510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fade, {
    						delay: Math.random() * 2500 + 1000,
    						duration: 100
    					});

    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(18:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:28) 
    function create_if_block_5(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file$1, 16, 4, 489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(16:28) ",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if letter == "•"}
    function create_if_block_4$1(ctx) {
    	let span;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "•";
    			add_location(span, file$1, 14, 4, 370);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fade, {
    						delay: Math.random() * 2500 + 1000,
    						duration: 100
    					});

    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(14:4) {#if letter == \\\"•\\\"}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#each wordCloud.split("") as letter, i}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*letter*/ ctx[17] == "•") return create_if_block_4$1;
    		if (/*letter*/ ctx[17] == "/") return create_if_block_5;
    		return create_else_block_1$1;
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(13:4) {#each wordCloud.split(\\\"\\\") as letter, i}",
    		ctx
    	});

    	return block;
    }

    // (42:6) {:else}
    function create_else_block$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[14]);
    			attr_dev(path, "class", "svelte-1qwba9b");
    			add_location(path, file$1, 42, 6, 1357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[16] * 200,
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:24) 
    function create_if_block_2$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;
    	let dispose;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[14]);
    			attr_dev(path, "class", "svelte-1qwba9b");
    			add_location(path, file$1, 40, 6, 1242);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, path, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(path, "introend", /*introend_handler*/ ctx[12], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, { delay: 2500, duration: 1000 });
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(40:24) ",
    		ctx
    	});

    	return block;
    }

    // (38:6) {#if i == 5 || i == 6}
    function create_if_block_1$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "opacity", "0.5");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[14]);
    			attr_dev(path, "class", "svelte-1qwba9b");
    			add_location(path, file$1, 38, 6, 1133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, {
    						delay: /*i*/ ctx[16] * 200,
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(38:6) {#if i == 5 || i == 6}",
    		ctx
    	});

    	return block;
    }

    // (37:6) {#each paths as path, i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*i*/ ctx[16] == 5 || /*i*/ ctx[16] == 6) return create_if_block_1$1;
    		if (/*i*/ ctx[16] == 10) return create_if_block_2$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(37:6) {#each paths as path, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let label;
    	let button;
    	let t2;
    	let current;
    	let dispose;
    	let if_block0 = /*animateAll*/ ctx[2] && create_if_block_6(ctx);
    	let if_block1 = /*visible*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div1 = element("div");
    			label = element("label");
    			button = element("button");
    			t2 = text(/*buttonName*/ ctx[6]);
    			attr_dev(div0, "class", "billboard svelte-1qwba9b");
    			toggle_class(div0, "done", /*done*/ ctx[4]);
    			toggle_class(div0, "expanded", /*expanded*/ ctx[5]);
    			add_location(div0, file$1, 0, 0, 0);
    			add_location(button, file$1, 51, 4, 1525);
    			add_location(label, file$1, 50, 2, 1513);
    			attr_dev(div1, "class", "toggle-container svelte-1qwba9b");
    			add_location(div1, file$1, 49, 0, 1480);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			/*div0_binding*/ ctx[13](div0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, button);
    			append_dev(button, t2);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*replay*/ ctx[8], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*animateAll*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*visible*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*visible*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*done*/ 16) {
    				toggle_class(div0, "done", /*done*/ ctx[4]);
    			}

    			if (dirty & /*expanded*/ 32) {
    				toggle_class(div0, "expanded", /*expanded*/ ctx[5]);
    			}

    			if (!current || dirty & /*buttonName*/ 64) set_data_dev(t2, /*buttonName*/ ctx[6]);
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
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*div0_binding*/ ctx[13](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			dispose();
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

    const wordCloud$1 = "developer • graphic/artist • illustrator •/copy editor • other/assorted activities";

    function instance$1($$self, $$props, $$invalidate) {
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

    	async function replay() {
    		$$invalidate(4, done = false);
    		$$invalidate(3, visible = false);
    		await tick();
    	}

    	onMount(() => {
    		console.log("mount");
    		$$invalidate(2, animateAll = el.parentElement.classList.contains("animate-all"));
    		animateSVG = animateAll || el.parentElement.classList.contains("animate-svg");
    		$$invalidate(1, animateCloud = animateAll || el.parentElement.classList.contains("animate-cloud"));
    		setTimeout(() => $$invalidate(3, visible = true), 500);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<SiteLogoExample> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SiteLogoExample", $$slots, []);
    	const outroend_handler = () => $$invalidate(3, visible = true);
    	const outroend_handler_1 = () => $$invalidate(3, visible = true);
    	const introend_handler = () => $$invalidate(4, done = true);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, el = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		draw,
    		fade,
    		quartOut,
    		paths,
    		el,
    		animateSVG,
    		animateCloud,
    		animateAll,
    		visible,
    		done,
    		wordCloud: wordCloud$1,
    		replay,
    		expanded,
    		buttonName
    	});

    	$$self.$inject_state = $$props => {
    		if ("el" in $$props) $$invalidate(0, el = $$props.el);
    		if ("animateSVG" in $$props) animateSVG = $$props.animateSVG;
    		if ("animateCloud" in $$props) $$invalidate(1, animateCloud = $$props.animateCloud);
    		if ("animateAll" in $$props) $$invalidate(2, animateAll = $$props.animateAll);
    		if ("visible" in $$props) $$invalidate(3, visible = $$props.visible);
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("expanded" in $$props) $$invalidate(5, expanded = $$props.expanded);
    		if ("buttonName" in $$props) $$invalidate(6, buttonName = $$props.buttonName);
    	};

    	let expanded;
    	let buttonName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*visible*/ 8) {
    			 if (!visible) {
    				$$invalidate(4, done = false);
    			}
    		}

    		if ($$self.$$.dirty & /*visible, done*/ 24) {
    			 $$invalidate(5, expanded = !(visible && done));
    		}

    		if ($$self.$$.dirty & /*animateAll, animateCloud*/ 6) {
    			 $$invalidate(6, buttonName = animateAll
    			? "replay all"
    			: animateCloud
    				? "replay word cloud animation"
    				: "replay site name animation");
    		}
    	};

    	return [
    		el,
    		animateCloud,
    		animateAll,
    		visible,
    		done,
    		expanded,
    		buttonName,
    		paths,
    		replay,
    		animateSVG,
    		outroend_handler,
    		outroend_handler_1,
    		introend_handler,
    		div0_binding
    	];
    }

    class SiteLogoExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SiteLogoExample",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const usoutline = `M218.53,144.79l-.43-1.31c.56-.51.21-1.45.14-1.92,1-1.72.81-7.21-1.15-9l0-.48-.74-.93-.78-1.5L214.33,128l-.84-1.35c.7-.42.63-1.73.63-1.73l-.72-.36a19.91,19.91,0,0,1-3-4c-.89-1.84-1.67-3.43-1.52-4.39l-.38-.27-.45-1.12-.24-.51v-.77a3.31,3.31,0,0,0,.56-1.19l.94-.3-.93-1.1-.06-.25.75.26-.21-1.55a1.94,1.94,0,0,0,.86-1.69s.61-.2.81-1.54l-.43-.18.25-.32a3,3,0,0,0,1.66-.41l.05-.27.46-.31,1.83.77-.73-1.73.4,0,0-.68.45-.65.87-.08.13-.83c.1-.62.41-.2.69-1.45l-.32-.57c.76-.26.69-1,.82-1.34s.49-1.16,1.14-1.36,2.82-.74,2.82-.74l.12-.73.36.1s-.14-1.61.16-2,1.74-1.87,2-2.27a10.19,10.19,0,0,0,1.61-.7,4.08,4.08,0,0,0,1.58-.11,3.3,3.3,0,0,1,0-1.4c.16-.5-.39-1.31-.85-1.54l.13-.46h1.15l.83-1.7h.77a11.28,11.28,0,0,0-.13-2.21,7.4,7.4,0,0,0-1-1.88l.41-.45-.82-.39-.71-1a2.34,2.34,0,0,0-.13-1.75,1.44,1.44,0,0,0-1.53-.87,3.25,3.25,0,0,0-.62-.92l0-.4h1.58l1.54-1.88-.39-.55a6.88,6.88,0,0,0,.41-1.4,4.94,4.94,0,0,1,.5-1.65l.56-1.05-.22-.36a1.12,1.12,0,0,0-.54-1.38c.07-.41.21-1.44.21-1.44l-1,0,.07-.35H227l1.38.38.23-2a3,3,0,0,0,.49-1.35,1.93,1.93,0,0,0,.67-2,4.45,4.45,0,0,1,.08-2.22c.34-.62-.24-1.57-.24-1.57l1.43-.77a5.65,5.65,0,0,0,1.44-.88,3.14,3.14,0,0,0,1.17-.54s.92-.07,1.15-.75c.85,0,1.45-1,1.45-1l2.5-1.31L237,50.8l0-.46,1.07-.62.17-.55,1.53.12c1.37.12,1.79-.22,1.93-.67a6.49,6.49,0,0,0,.16-1.33,5,5,0,0,0,2.44-1.89l-1.62-1.3-1.15.86-.46.09-.81-1.13-.79-1L239,43l.69-.67-1-1.55s0-.55,0-1.1a1.36,1.36,0,0,0,.22-1.42,1.72,1.72,0,0,0,.51-1.53c.42-.25.22-1,.22-1,.52.06.91-.57,1-1a1.44,1.44,0,0,0,1.37-.85,4.67,4.67,0,0,0,1.21-.7,4.23,4.23,0,0,1,.07-1.54,2.86,2.86,0,0,0,2.71-1l1.63.83-.84-2a6,6,0,0,0,1.39-1.33,4.15,4.15,0,0,0,1-.55c.59.66,1.87-.14,1.83-1.23s-1.18-1.14-1.62-1l-.08-.86-.63-.21a2.85,2.85,0,0,0-1.46-.81,7.81,7.81,0,0,1-.21-1.71l-1.71,0L244.47,19l-.72-2.34s-.1-2-1.45-2.21c-.23-.71-2.37-.82-2.37-.82L238.32,15S238.22,14,237,14s-1.61,2-1.61,2a6.76,6.76,0,0,0-.54,2.1c-.78.86-.4,2.71-.4,2.71a3.09,3.09,0,0,0-.06,3.08L234.06,25s-.74,1-.58,1.53L233,25.47l-.62,2.19-.55-.16-.57,2.12-2.93.51-2.81.79h-.5a26.18,26.18,0,0,1-3.17.93c-1.26.24-3.31.68-4.22,2s-1.7,2.07-1.74,3.2c-1,.56-1.79,1.71-1.45,2.54s.82,2,.82,2a9.2,9.2,0,0,0-1.79,1.77,4.52,4.52,0,0,0-2.19.48c-1-.71-2.6-.26-3.35,0a15.69,15.69,0,0,0-2.66,1.13,1.39,1.39,0,0,0,.27,2.41l.33.68-.82,1-1.22,1.55-1.39,1.1-.64.62a3.19,3.19,0,0,0-1.1.77,17.1,17.1,0,0,0-2.25,1.25,11.09,11.09,0,0,0-2.34,2.09l-.59-.22-1.67,1.21-1.68-.59-1.23-.8a9.78,9.78,0,0,0,.55-1.57,2.56,2.56,0,0,0,2.83-2.13l-.73-.71V50.06l.46-.63a5.58,5.58,0,0,1-1.28-2.12,9,9,0,0,0-1.57-3.56c-.85-.94-2.35-.09-2.82.5l0-.48A3.56,3.56,0,0,0,189,41.6c-.13-1.12-.13-1.71-.7-2.28a1.63,1.63,0,0,0-.21-1.68,5.51,5.51,0,0,0-3.16-1.5,3,3,0,0,0-1.76-.73l2.73,0s0-2.16-1.65-2.75a1.89,1.89,0,0,0-1.83-1.79l-.37.27-1.08.12V30a3.17,3.17,0,0,0-2-.05,5.31,5.31,0,0,1-2.69.71c-.81-.12-1.51.8-1.51.8a3.15,3.15,0,0,0-1,.73,4,4,0,0,0-2-.13c-.79-1-1.56-2-3.12-1.91,1.23-.86.95-3.23.95-3.23A4.63,4.63,0,0,0,166,29l-.47.05-.92,1.26-1.52.85-.79-.05a7,7,0,0,0-1.36,1.18l-1,.41-.58-.23a2.75,2.75,0,0,0-.58-1.8,18.14,18.14,0,0,0-2.39,1l.82-1a9.33,9.33,0,0,1,1.18-1.39c.38-.28.94-.56,1.05-.84s1.78-.39,2.2-1c1.31-.46,1.62-1.65,1.67-3.59L161.53,25a3,3,0,0,0-2.81-.36c-.84-.95-1.74-.58-2.71.38l-.57,0a1.32,1.32,0,0,0-1.1-.71c-.33-.93-1.81-.63-1.81-.63l-.12-1.2-.69.47c-1.53-.82-3.43-1-4,0-.36-.66-1.76-.66-1.76-.66s-.87-.35-1.34-.1a8,8,0,0,0-.65-2.47s-.16-1.07-1-1.06-1.82,0-1.82,0l.07,1.95h-3.38l-3.22.19-5-.26-5.06-.16-5.87-.19L113.88,20l-4.25-.37-5.77-.39-4.73-.47-5.19-.57-5.54-.72-5.09-.77-4.86-.79L73.34,15l-5-1.09-4-.55-3.9-.83-3.59-.81-3.37-.83a3.2,3.2,0,0,0-1.77-.41,2.85,2.85,0,0,0-2-.46,2.89,2.89,0,0,0-1.93-.52,9.65,9.65,0,0,0-3.14-.93A3.08,3.08,0,0,0,43,8.33c-1,.11-.63,1.33-.55,1.9s.64.87.41,1.38l-.6,1.19.19.29h-.37l-.11-.36.5-1.71-2,1.14s-.55-.49-1-.31c-.36-.6-1.33-.57-1.33-.57l0-.52a2.81,2.81,0,0,1-1.37-.71L35.32,8l-.21,1.77c-.35,0-.34.71-.34.71h-.23a7.22,7.22,0,0,0-.15,1.91,5.31,5.31,0,0,0,.48,1.45,14.52,14.52,0,0,0-.14,2,3.79,3.79,0,0,1-.27,2.41l.41.15a1.61,1.61,0,0,0,0,1.53c.28.32-.24.77.1,1.61l-1,.4s.36.32,0,1.34A5.86,5.86,0,0,0,33.63,25l-.46.77-.35.15a4.36,4.36,0,0,1-.39,2,8.69,8.69,0,0,0-1.13,3.2c-.59,1.08-.79,2.12-1.09,2.5a2.92,2.92,0,0,0-.39,1.12l-.7.76L28.3,34S28,36.53,28,37.13s-1.54,2.12-.94,3.39c-1,1.45-.31,3.83-.31,3.83-.14.9,0,2.17-.14,2.74s-.87.66-.92,2.24a3.64,3.64,0,0,0-.41.6,3.44,3.44,0,0,0-1.44,2,4.45,4.45,0,0,0,.93,3.29,2.54,2.54,0,0,1-.23,2.72c-.41.72.26,1.26-.12,2.15a2.36,2.36,0,0,0,.62,2.52,2.44,2.44,0,0,0,1,1.92l.21.7c-.25.76-.32,1.66,1.4,3.09l-.31.58s-.29.4-.07,1.66c-.63,1,.38,2.76,1.75,3.42l-.17.17-.64,0s-.82,2.26.35,3.76a2.11,2.11,0,0,0,.74,1.35,3,3,0,0,0,.85,2.21,1.76,1.76,0,0,0,.78,1.27l-.36,1.06.94.79-.45,2-1.14,1.63h1.67a1.94,1.94,0,0,0,1.33.84c.91.15,1.53.37,1.66.82.91-.21,1.61.25,2,1.39s2.21,1.56,2.93,1.68l0,.92-.15,1.42L41,94.85A18.32,18.32,0,0,0,42.79,97c.9.91.54,1.72.55,2.71a3.31,3.31,0,0,0,.25,1.43,1.2,1.2,0,0,0,.48,1.31L49,103l5,.5-.08.59,3.57,2.32,3.19,1.87,3.67,2.05,3.36,1.87,2.92,1.68,4.75.59,4.9.65,3.67.53.84-2.41,3.38.33,3.18.31a1.75,1.75,0,0,1,.74,1.68,5.64,5.64,0,0,1,2.48,2.07,3.69,3.69,0,0,0,1.87,2,6.43,6.43,0,0,1,1.36,1.15c-.19.88.51,1.15.68,1.67s-.27,1.1,0,1.78a5.09,5.09,0,0,1,.79,2.35l.94.18s1.17,1.65,2.44,1.78a4.73,4.73,0,0,0,3.83,1.78c.82-.13,1.88-1.95,1.88-1.95l1-2,1,.24.44-.62a8.05,8.05,0,0,0,3,.48l1.15,1,1.63,1.68s.54,1.09.9,1.74a10.05,10.05,0,0,0,1.2,2.19c.21,1,.21,1.75,1.32,2.26.75,1.22,1.68,2.68,1.68,2.68l.86.41a1.58,1.58,0,0,0,0,1.44c-.22.95.55,1.86,1,2.44s-.12.9.63,2.27h.19a.84.84,0,0,0,.8.66,4.14,4.14,0,0,1,1,.14l.24.76s1.14-.17,1.37,0,.79.85,1.32.89,2.22,0,2.22,0a5.45,5.45,0,0,0,2.17,1.16h1.5l-.3-.69s.61-.87,0-1.47a8.91,8.91,0,0,0-.61-2.38,3.37,3.37,0,0,0-.58-2.08l.81-1.62.87-2,.5.23-.17-1.53s.55-.4.51-.79a1.91,1.91,0,0,0,1.11-1.07c1.16,0,1.93-1.46,1.93-1.46l.63,0s1,.42,1.59,0l.07-.61.49,0,.41.09a3.36,3.36,0,0,1,.69-.72,5,5,0,0,0,1.95-2l.54-.55,1-.23-.34-1,.93-.12a2.12,2.12,0,0,0,1.47-.21,5.34,5.34,0,0,1,1.45-.58l.72-.36.49,0-.21.38,2.2-.6a18.6,18.6,0,0,0,2.24.74c.57.09,1.14.26,1.49.34a8.23,8.23,0,0,0,1.43,0l.45.33.17-.39a1.25,1.25,0,0,0,1.58,0l.79-.18.21.09a1.32,1.32,0,0,0,1,1.56l.15.88,1-.67,1.26.27.93,0,.33-1,.2.06a1.23,1.23,0,0,0,1.48.77,1.35,1.35,0,0,0,1.07-1.53l.86.27.46.27,0,.54,1.4.12,1.31.47a2.25,2.25,0,0,0,.75-1.55c.11-1.09-1.14-2-1.14-2l-.53.21-.38-.34-.17-.32.56,0a2.68,2.68,0,0,0-.3-2l.26-1-.5-.09,1.71-.52,1.49.46,0-.35.49.3.68-.5h1.79a1.52,1.52,0,0,0,2.4-.29l.59.06,0-.26h.56v.22l2.51-.75-.81.74,3-.38.62.3,1.19.16-.43.84,1.68.18,1.25,2.89.88-1.65a1.06,1.06,0,0,0,1.13-.36,1.59,1.59,0,0,0,1.52-1,2,2,0,0,0,1.43-.82l-.24-.24.22-.25s.57-.31,1.94.4c.15.74,1.13,1.17,1.13,1.17l-.26.76,1.27.32,1,.9.91.59.5,0,.87,1a22.42,22.42,0,0,1,0,2.43c-.08,1-.19,1.71-.19,1.71s-.57.59.13,2.07l.45-.07.4.15a1.82,1.82,0,0,0,1,1.87,3.94,3.94,0,0,0,2.63,2.83,2.5,2.5,0,0,0,1.44,1.66c.37,1.66,1.16,2.64,2.84,2.62l2.05,2.69.51,0,.43.93.88-.2a2,2,0,0,0,1.75-.65Z`;

    const crosshatch = [
      "M257.42,120.82l-59.23,37.67",
      "M257.42,115.8,190,158.65",
      "M257.42,110.78,182.07,158.7",
      "M257.42,105.76l-83.32,53",
      "M257.42,100.74l-90.69,57.68",
      "M257.42,95.72l-98.9,62.9",
      "M257.42,90.7l-106.87,68",
      "M257.42,85.68,143,158.45",
      "M257.42,80.66l-122.57,78",
      "M257.42,75.64l-130.18,82.8",
      "M257.42,70.62,119.15,158.56",
      "M257.42,65.6,111.54,158.39",
      "M257.42,60.58,103.21,158.66",
      "M257.42,55.56,95.25,158.71",
      "M257.42,50.54,87.75,158.46",
      "M257.42,45.53,79.66,158.58",
      "M257.42,40.51l-185.61,118",
      "M257.42,35.49,64,158.53",
      "M257.42,30.47,56.11,158.5",
      "M257.42,25.45,48.14,158.55",
      "M257.42,20.43,40.17,158.6",
      "M257.42,15.41,32.44,158.5",
      "M257.42,10.39,24.59,158.47",
      "M257.42,5.37,20.3,156.18",
      "M257.42.35,20.3,151.16",
      "M250,0,20.3,146.14",
      "M242,.13,20.3,141.12",
      "M234.1.12,20.3,136.1",
      "M226.66-.17,20.3,131.08",
      "M218.43.05,20.3,126.06",
      "M210.46.1,20.3,121",
      "M202.67,0,20.3,116",
      "M194.88,0,20.3,111",
      "M186.82.08,20.3,106",
      "M179.08,0,20.3,101",
      "M170.82.21,20.3,95.94",
      "M163.18.05,20.3,90.93",
      "M155.3.05,20.3,85.91",
      "M147.51,0,20.3,80.89",
      "M139.72-.08,20.3,75.87",
      "M131.51.12,20.3,70.85",
      "M123.78,0,20.3,65.83",
      "M115.81.06,20.3,60.81",
      "M108.14-.08,20.3,55.79",
      "M100.14,0,20.3,50.77",
      "M92.26,0l-72,45.76",
      "M84.29,0l-64,40.7",
      "M76.5,0,20.3,35.71",
      "M68.59,0,20.3,30.69",
      "M60.74,0,20.3,25.67",
      "M52.77,0,20.3,20.65",
    ];

    const draftmarks = [
      { x1: "196.19", y1: "145.7", x2: "230.53", y2: "145.7" },
      { x1: "213.36", y1: "155.62", x2: "216.21", y2: "132.39" },
      { x1: "247.06", y1: "57.74", x2: "235.4", y2: "43.44" },
      { x1: "234.58", y1: "51.69", x2: "250.57", y2: "42.4" },
      { x1: "247.06", y1: "49.42", x2: "247.06", y2: "0.48" },
      { x1: "252.65", y1: "13.51", x2: "223.77", y2: "13.51" },
      { x1: "240.15", y1: "18.61", x2: "235.75", y2: "7" },
      { x1: "222.9", y1: "31.01", x2: "202.87", y2: "36.28" },
      { x1: "217.54", y1: "29.13", x2: "211.65", y2: "37.78" },
      { x1: "192.8", y1: "18.97", x2: "120.83", y2: "18.97" },
      { x1: "136.82", y1: "14.55", x2: "137.19", y2: "21.12" },
      { x1: "70.76", y1: "8.82", x2: "5.05", y2: "8.82" },
      { x1: "29.19", y1: "3.61", x2: "30.86", y2: "18.91" },
      { x1: "48.48", y1: "11.01", x2: "35.28", y2: "6.73" },
      { x1: "21.19", y1: "23.38", x2: "21.19", y2: "122.98" },
      { x1: "15.86", y1: "85.58", x2: "31.03", y2: "90.32" },
      { x1: "17.85", y1: "101.46", x2: "27.28", y2: "86.01" },
      { x1: "90.5", y1: "123.28", x2: "108.9", y2: "138.36" },
      { x1: "95.5", y1: "137.38", x2: "104.44", y2: "128.61" },
      { x1: "143.65", y1: "153.53", x2: "101.49", y2: "140.38" },
      { x1: "123.02", y1: "154.56", x2: "118.61", y2: "140.38" },
      { x1: "130.05", y1: "143.79", x2: "133.44", y2: "157.69" },
      { x1: "150.39", y1: "130.6", x2: "180.83", y2: "130.6" },
      { x1: "161.13", y1: "134.98", x2: "156.53", y2: "128.31" },
      { x1: "173.56", y1: "134.24", x2: "167.78", y2: "124.15" },
    ];

    /* src/components/RebuildingAmericaLogo.svelte generated by Svelte v3.22.2 */
    const file$2 = "src/components/RebuildingAmericaLogo.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (4:4) {#if visible}
    function create_if_block$2(ctx) {
    	let svg;
    	let defs;
    	let clipPath;
    	let path0;
    	let g0;
    	let path1;
    	let path1_intro;
    	let g1;
    	let svg_outro;
    	let t0;
    	let h1;
    	let t1;
    	let br;
    	let t2;
    	let h1_intro;
    	let h1_outro;
    	let current;
    	let dispose;
    	let each_value_1 = crosshatch;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = draftmarks;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			path0 = svg_element("path");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			path1 = svg_element("path");
    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			h1 = element("h1");
    			t1 = text("REBUILDING");
    			br = element("br");
    			t2 = text("AMERICA");
    			attr_dev(path0, "id", "us-outline");
    			attr_dev(path0, "d", usoutline);
    			add_location(path0, file$2, 11, 10, 337);
    			attr_dev(clipPath, "id", "clip-path");
    			add_location(clipPath, file$2, 10, 8, 301);
    			add_location(defs, file$2, 9, 6, 286);
    			attr_dev(g0, "id", "crosshatch");
    			attr_dev(g0, "class", "svelte-3l3ffl");
    			add_location(g0, file$2, 14, 6, 416);
    			attr_dev(path1, "id", "us-map-outline");
    			attr_dev(path1, "d", usoutline);
    			attr_dev(path1, "class", "svelte-3l3ffl");
    			add_location(path1, file$2, 19, 6, 584);
    			attr_dev(g1, "id", "draft-marks");
    			attr_dev(g1, "transform", "translate(4.1 -0.48)");
    			attr_dev(g1, "class", "svelte-3l3ffl");
    			add_location(g1, file$2, 20, 6, 678);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 287 158");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "class", "svelte-3l3ffl");
    			add_location(svg, file$2, 4, 4, 104);
    			add_location(br, file$2, 32, 75, 1165);
    			attr_dev(h1, "class", "logo-text svelte-3l3ffl");
    			add_location(h1, file$2, 30, 4, 978);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, path0);
    			append_dev(svg, g0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append_dev(svg, path1);
    			append_dev(svg, g1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			append_dev(h1, br);
    			append_dev(h1, t2);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(svg, "outroend", /*outroend_handler*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*crosshatch*/ 0) {
    				each_value_1 = crosshatch;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*draftmarks*/ 0) {
    				each_value = draftmarks;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g1, null);
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

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			if (!path1_intro) {
    				add_render_callback(() => {
    					path1_intro = create_in_transition(path1, draw, { duration: 2700, easing: identity });
    					path1_intro.start();
    				});
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (svg_outro) svg_outro.end(1);

    			add_render_callback(() => {
    				if (h1_outro) h1_outro.end(1);

    				if (!h1_intro) h1_intro = create_in_transition(h1, scale, {
    					delay: 1200,
    					duration: 500,
    					start: 1.8,
    					opacity: 0,
    					easing: quartOut
    				});

    				h1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			svg_outro = create_out_transition(svg, fade, { delay: 250, duration: 500 });
    			if (h1_intro) h1_intro.invalidate();

    			h1_outro = create_out_transition(h1, scale, {
    				duration: 350,
    				start: 0.5,
    				easing: quartOut
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching && svg_outro) svg_outro.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_outro) h1_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(4:4) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (16:8) {#each crosshatch as hatch, i}
    function create_each_block_1$2(ctx) {
    	let path;
    	let path_d_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*hatch*/ ctx[6]);
    			attr_dev(path, "class", "svelte-3l3ffl");
    			add_location(path, file$2, 16, 8, 483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, fade, {
    						delay: 700 + /*i*/ ctx[5] * 35,
    						duration: 100
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(16:8) {#each crosshatch as hatch, i}",
    		ctx
    	});

    	return block;
    }

    // (22:8) {#each draftmarks as mark, i}
    function create_each_block$2(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let line_intro;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = /*mark*/ ctx[3].x1);
    			attr_dev(line, "y1", line_y__value = /*mark*/ ctx[3].y1);
    			attr_dev(line, "x2", line_x__value_1 = /*mark*/ ctx[3].x2);
    			attr_dev(line, "y2", line_y__value_1 = /*mark*/ ctx[3].y2);
    			add_location(line, file$2, 22, 8, 778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!line_intro) {
    				add_render_callback(() => {
    					line_intro = create_in_transition(line, draw, {
    						delay: 1000 + /*i*/ ctx[5] * 60,
    						duration: 500
    					});

    					line_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(22:8) {#each draftmarks as mark, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let button;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "replay";
    			attr_dev(div0, "class", "logo-container svelte-3l3ffl");
    			add_location(div0, file$2, 1, 0, 27);
    			attr_dev(button, "class", "replay-btn svelte-3l3ffl");
    			add_location(button, file$2, 35, 2, 1203);
    			attr_dev(div1, "class", "logo-wrapper svelte-3l3ffl");
    			add_location(div1, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t0);
    			append_dev(div1, button);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "click", /*replay*/ ctx[1], false, false, false),
    				listen_dev(button, "click", /*replay*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
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
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			run_all(dispose);
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
    	let visible = false;

    	function replay() {
    		$$invalidate(0, visible = false);
    	}

    	onMount(() => {
    		$$invalidate(0, visible = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RebuildingAmericaLogo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RebuildingAmericaLogo", $$slots, []);
    	const outroend_handler = () => $$invalidate(0, visible = true);

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		draw,
    		scale,
    		linear: identity,
    		quartOut,
    		usoutline,
    		crosshatch,
    		draftmarks,
    		visible,
    		replay
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, replay, outroend_handler];
    }

    class RebuildingAmericaLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RebuildingAmericaLogo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.22.2 */

    // (12:0) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const animatedsitelogo = new AnimatedSiteLogo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(animatedsitelogo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(animatedsitelogo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animatedsitelogo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animatedsitelogo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(animatedsitelogo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(12:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:36) 
    function create_if_block_1$2(ctx) {
    	let current;
    	const sitelogoexample = new SiteLogoExample({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sitelogoexample.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sitelogoexample, target, anchor);
    			current = true;
    		},
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(10:36) ",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if type == "rebuildingAmerica"}
    function create_if_block$3(ctx) {
    	let current;
    	const rebuildingamericalogo = new RebuildingAmericaLogo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(rebuildingamericalogo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rebuildingamericalogo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rebuildingamericalogo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rebuildingamericalogo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rebuildingamericalogo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(8:0) {#if type == \\\"rebuildingAmerica\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[0] == "rebuildingAmerica") return 0;
    		if (/*type*/ ctx[0] == "siteLogoExample") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { type = "" } = $$props;
    	const writable_props = ["type"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		AnimatedSiteLogo,
    		SiteLogoExample,
    		RebuildingAmericaLogo,
    		type
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { type: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get type() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const apps = {};

    const rebuildingAmerica = document.querySelector(".rebuilding-america");
    apps["rebuildingAmerica"] = new App({
      target: rebuildingAmerica,
      props: {
        type: "rebuildingAmerica"
      }
    });

    document.querySelectorAll(".site-logo-example").forEach((target, i) => {
      apps[`logo${i}`] = new App({
        target,
        props: {
          type: "siteLogoExample"
        }
      });
    });

    document.querySelectorAll(".animated-site-logo").forEach((target, i) => {
      apps[`logo${i}`] = new App({
        target,
        props: {
          type: "siteLogo"
        }
      });
    });

}());
//# sourceMappingURL=bundle.js.map
