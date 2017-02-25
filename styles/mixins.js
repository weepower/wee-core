const decl = require('postcss-js-mixins/lib/declaration');
const rule = require('postcss-js-mixins/lib/rule');
const { isObject, isEmpty, isPercentage, isColor, prefix, isNumber, hexToRgba, calcOpacity, isString, unit } = require('postcss-js-mixins/lib/helpers');


module.exports = (vars = {}) => {
	return {
		/**
		 * Absolute positioning
		 *
		 * @param {string|number|Object} [args[]] - top or object of positions
		 *	 @param {string|number} [args[].top]
		 *	 @param {string|number} [args[].right]
		 *	 @param {string|number} [args[].bottom]
		 *	 @param {string|number} [args[].left]
		 * @param {string|number} [args[]] - right
		 * @param {string|number} [args[]] - bottom
		 * @param {string|number} [args[]] - left
		 * @return {Array}
		 */
		absolute(...args) {
			let props = [
				decl('position', 'absolute')
			];

			if (isObject(args[0])) {
				props = props.concat(decl.createManyFromObj(args[0]));
			} else if (! isEmpty(args)) {
				props = props.concat(decl.createMany([
					'top',
					'right',
					'left',
					'bottom'
				], args));
			}

			return props;
		},

		/**
		 * Background
		 *
		 * @param  {Array} args
		 *	 @param {string} [args[]] - color
		 *	 @param {string} [args[]] - opacity or URL
		 *	 @param {number|string} [args[]] - repeat or attachment
		 *	 @param {number|string} [args[]] - attachment or position x
		 *	 @param {number|string} [args[]] - position x or position y
		 *	 @param {number|string} [args[]] - position y
		 * @return {Array}
		 */
		background(...args) {
			let props = [
					decl('background', '')
				],
				color = args[0];

			// TODO: Allow for object params? Shorthand needs to be in specific order.
			if (color) {
				if (args[1] && isNumber(args[1])) {
					args[0] = hexToRgba(color, args[1]);
					args.splice(1, 1);
				}

				args.forEach(function(arg, i) {
					if (i) {
						arg = ' ' + arg;
					}

					props[0].value += arg;
				});
			}

			return props;
		},

		/**
		 * Display block
		 *
		 * @param {Array} args
		 * @param {string|number|Object} [args[]] - width or object of properties
		 *	 @param {string|number} [args[].width]
		 *	 @param {string|number} [args[].height]
		 * @param {string|number} [args[]] - height
		 * @returns {Array}
		 */
		block(...args) {
			let props = [
				this.display('block')
			];

			if (isObject(args[0])) {
				props = props.concat(decl.createManyFromObj(args[0]));
			} else if (! isEmpty(args)) {
				props.push(decl('width', args[0]));

				if (args[1]) {
					props.push(decl('height', args[1]));
				}
			}

			return props;
		},

		/**
		 * Font weight bold
		 *
		 * @returns {Object}
		 */
		bold() {
			return decl('font-weight', vars.font.weight.bold);
		},

		/**
		 * Border
		 *
		 * @param args
		 * @returns {*}
		 */
		border(...args) {
			let keywords = [
					'top',
					'right',
					'bottom',
					'left',
					'vertical',
					'horizontal'
				],
				defaultValues = [
					vars.border.width,
					vars.border.style,
					vars.border.color
				],
				borders = [],
				keyword = null,
				values = [];

			if (args[0] === false || args[0] === 0 || args[0] === 'none') {
				return decl('border', 'none');
			}

			// Default border
			if (isEmpty(args)) {
				return decl('border', defaultValues.join(' '));
			}

			if (keywords.includes(args[0])) {
				keyword = args[0];
				args.splice(0, 1);
			}

			values.push(unit(args[1] || defaultValues[0], 'border-width'));
			values.push(unit(args[2] || defaultValues[1], 'border-style'));
			values.push(unit(args[0] || defaultValues[2], 'border-color'));

			if (keyword == 'vertical') {
				borders = [
					'border-top',
					'border-bottom'
				];
			} else if (keyword == 'horizontal') {
				borders = [
					'border-left',
					'border-right'
				];
			} else if (keyword) {
				borders.push(prefix(keyword, 'border'));
			}

			if (borders.length) {
				return decl.createMany(borders, values.join(' '));
			}

			return decl('border', values.join(' '));
		},

		/**
		 * Apply default value to box sizing
		 *
		 * @param {string} value
		 * @returns {Declaration}
		 */
		boxSizing(value = 'border-box') {
			return decl('box-sizing', value);
		},

		/**
		 * A block level element, centered with margin
		 *
		 * @param  {Array} [args] - Reference 'block' function for param details
		 * @return {Array}
		 */
		centeredBlock(...args) {
			let props = this.block(...args);

			props = props.concat(this.margin(
				{ left: 'auto', right: 'auto' }
			));

			return props;
		},

		/**
		 * Clear left, right, or both
		 *
		 * @param {string} [value=both]
		 * @returns {Object}
		 */
		clear(value = 'both') {
			return decl('clear', value);
		},

		/**
		 * Clearfix
		 *
		 * @return {Object}
		 */
		clearfix() {
			return rule('&:after', [
				this.clear(),
				this.content(),
				this.display('block')
			]);
		},

		/**
		 * Color
		 *
		 * @param  {string} value
		 * @return {Object}
		 */
		color(value) {
			return decl('color', value);
		},

		/**
		 * Grid column
		 *
		 * @param {Array} args
		 * @param {Array} [args[]] - spaced key word or column share
		 * @param {Array} [args[]] - column share or grid columns
		 * @param {Array} [args[]] - grid columns
		 * @return {Array}
		 */
		column(...args) {
			let props = [
				decl('float', 'left')
			];

			if (! isEmpty(args)) {
				if (isPercentage(args[0])) {
					props.push(decl('width', args[0]));
				} else if (args[0] === 'spaced') {
					let columns = isEmpty(args[2]) ? vars.grid.columns : args[2],
						margin = isEmpty(args[3]) ? vars.grid.margin : args[3];

					props.push(decl('width', (100 / columns) * args[1] + '%'));

					props = props.concat(this.margin({ left: margin }));
				} else {
					let columns = isEmpty(args[1]) ? vars.grid.columns : args[1];

					props.push(decl('width', (100 / columns) * args[0] + '%'));
				}
			} else {
				props.push(decl('width', '100%'));
			}

			return props;
		},

		/**
		 * Conditionally add min-width property to both html and body elements
		 *
		 * @returns {*}
		 */
		containerMinWidth() {
			let minWidth = vars.width.min;

			if (minWidth !== 0) {
				return rule('html, body', [
					decl('min-width', minWidth)
				]);
			}

			return false;
		},

		/**
		 * Empty content block
		 *
		 * @returns {Declaration}
		 */
		content() {
			return decl('content', '\'\'');
		},

		/**
		 * Set display
		 *
		 * @param  {string} value
		 * @return {Object}
		 */
		display(value) {
			return decl('display', value);
		},

		/**
		 * Fixed positioning
		 *
		 * @param {string|number|Object} [args[]] - top or object of positions
		 *	 @param {string|number} [args[].top]
		 *	 @param {string|number} [args[].right]
		 *	 @param {string|number} [args[].bottom]
		 *	 @param {string|number} [args[].left]
		 * @param {string|number} [args[]] - right
		 * @param {string|number} [args[]] - bottom
		 * @param {string|number} [args[]] - left
		 * @return {Array}
		 */
		fixed(...args) {
			props = [
				decl('position', 'fixed')
			];

			if (isObject(args[0])) {
				props = props.concat(decl.createManyFromObj(args[0]));
			} else if (! isEmpty(args)) {
				props = props.concat(decl.createMany([
					'top',
					'right',
					'left',
					'bottom'
				], args));
			}

			return props;
		},

		/**
		 * Font
		 *
		 * @param {Array} [args]
		 * @param {string|number|Object} [args[]] - font-family or object of properties
		 *	 @param {string|number} [args[].family]
		 *	 @param {string|number} [args[].size]
		 *	 @param {string|number} [args[].weight]
		 *	 @param {string|number} [args[].lineHeight]
		 *	 @param {string|number} [args[].style]
		 * @param {string|number} [args[]] - font-size
		 * @param {string|number} [args[]] - font-weight
		 * @param {string|number} [args[]] - line-height
		 * @param {string|number} [args[]] - font-style
		 * @return {Array}
		 */
		font(...args) {
			props = [];

			if (isObject(args[0])) {
				props = props.concat(decl.createManyFromObj(args[0], 'font', ['lineHeight']));
			} else if (! isEmpty(args)) {
				props.push(decl('font-family', args[0]));

				if (args[1]) {
					props.push(decl('font-size', args[1]));
				}

				if (args[2]) {
					props.push(decl('font-weight', args[2]));
				}

				if (args[3]) {
					props.push(decl('line-height', args[3]));
				}

				if (args[4]) {
					props.push(decl('font-style', args[4]));
				}
			}

			return props;
		},

		/**
		 * Default styling for headings
		 *
		 * @returns {Array}
		 */
		heading() {
			return [
				decl('color', vars.heading.color),
				decl('font-family', vars.heading.family),
				decl('font-weight', vars.heading.weight),
				decl('line-height', vars.heading.lineHeight),
				decl('margin-bottom', vars.heading.margin.bottom),
				rule('small', [
					decl('font-weight', 'normal')
				])
			];
		},

		/**
		 * Display inline
		 *
		 * @return {Object}
		 */
		inline() {
			return this.display('inline');
		},

		/**
		 * Display inline block
		 *
		 * @param  {Array} [args[]] - width
		 * @param  {Array} [args[]] - height
		 * @return {Array}
		 */
		inlineBlock(...args) {
			let props = [
				this.display('inline-block')
			];

			if (isObject(args[0])) {
				props = props.concat(decl.createManyFromObj(args[0]));
			} else if (! isEmpty(args)) {
				props.push(decl('width', args[0]));

				if (args[1]) {
					props.push(decl('height', args[1]));
				}
			}

			return props;
		},

		/**
		 * Font style italic
		 *
		 * @return {Object}
		 */
		italic() {
			return decl('font-style', 'italic');
		},

		/**
		 * Float left or position left
		 *
		 * @param {string} [value]
		 * @return {Object}
		 */
		left(value) {
			if (isEmpty(value)) {
				return decl('float', 'left');
			}

			return decl('left', value);
		},

		/**
		 * Show element
		 *
		 * @return {Object}
		 */
		hidden() {
			return this.visibility('hidden');
		},

		/**
		 * Hide element
		 *
		 * @return {Object}
		 */
		hide() {
			return this.display('none');
		},

		/**
		 * Margin
		 *
		 * @param {Array} args
		 * @returns {Array|boolean}
		 */
		margin(...args) {
			let keywords = ['horizontal', 'vertical'],
				result = false;

			if (isObject(args[0])) {
				return decl.createManyFromObj(args[0], 'margin');
			}

			if (keywords.includes(args[0])) {
				let keyword = args.shift();

				if (args.length < 2) {
					args.push(args[0]);
				}

				if (keyword === 'horizontal') {
					result = decl.createMany(['left', 'right'], args, 'margin');
				} else if (keyword === 'vertical') {
					result = decl.createMany(['top', 'bottom'], args, 'margin');
				}
			}

			return result;
		},

		/**
		 * Output min-width and/or min-height
		 *
		 * @param {string|number} width
		 * @param {string|number} height
		 * @return {Array}
		 */
		minSize(width, height) {
			let props = [
				decl('min-width', width)
			];

			if (! height) {
				props.push(decl('min-height', width));
			} else {
				props.push(decl('min-height', height));
			}

			return props;
		},

		/**
		 * Opacity
		 *
		 * @param  {string} value
		 * @return {Object}
		 */
		opacity(value) {
			return decl('opacity', calcOpacity(value));
		},

		/**
		 * Set opacity to 1
		 *
		 * @return {Object}
		 */
		opaque() {
			return this.opacity(1);
		},

		/**
		 * Padding
		 *
		 * @param {Array} args
		 * @returns {Array|boolean}
		 */
		padding(...args) {
			let keywords = ['horizontal', 'vertical'],
				result = false;

			if (isObject(args[0])) {
				return decl.createManyFromObj(args[0], 'padding');
			}

			if (keywords.includes(args[0])) {
				let keyword = args.shift();

				if (args.length < 2) {
					args.push(args[0]);
				}

				if (keyword === 'horizontal') {
					result = decl.createMany(['left', 'right'], args, 'padding');
				} else if (keyword === 'vertical') {
					result = decl.createMany(['top', 'bottom'], args, 'padding');
				}
			}

			return result;
		},

		/**
		 * Placeholder
		 *
		 * @param color
		 * @returns {*[]}
		 */
		placeholder(color = vars.input.placeholder.color) {
			let props = [
				decl('color', color)
			];

			return [
				rule('&:-moz-placeholder', props),
				rule('&::-moz-placeholder', props),
				rule('&:-ms-input-placeholder', props),
				rule('&::-webkit-input-placeholder', props)
			];
		},

		/**
		 *
		 * @param {string} value
		 * @returns {array}
		 */
		resizable(value = 'both') {
			return [
				decl('overflow', 'hidden'),
				decl('resize', value)
			];
		},

		/**
		 * Float right or position right
		 *
		 * @param {string} [value]
		 * @return {Object}
		 */
		right(value) {
			if (isEmpty(value)) {
				return decl('float', 'right');
			}

			return decl('right', value);
		},

		/**
		 * Border radius
		 *
		 * @param args
		 */
		rounded(...args) {
			let props = [
					decl('background-clip', 'border-box')
				],
				keywords = ['top', 'right', 'bottom', 'left'],
				radius = vars.default.radius,
				keyword = args[0],
				corners = [];

			if (isEmpty(args)) {
				props.push(decl('border-radius', radius));
			} else if (args[0] === false) {
				return false;
			} else if (! keywords.includes(args[0])) {
				props.push(decl('border-radius', args[0]));
			} else {
				if (keyword === 'top') {
					corners = ['top-left-radius', 'top-right-radius'];
				} else if (keyword === 'right') {
					corners = ['top-right-radius', 'bottom-right-radius'];
				} else if (keyword === 'bottom') {
					corners = ['bottom-left-radius', 'bottom-right-radius'];
				} else if (keyword === 'left') {
					corners = ['top-left-radius', 'bottom-left-radius'];
				}

				props = props.concat(decl.createMany(corners, args[1] || radius, 'border'));
			}

			return props;
		},

		/**
		 * Grid row
		 *
		 * @param  {string|number} margin
		 * @return {Array}
		 */
		row(margin) {
			margin = margin || vars.grid.margin.replace('%', '');
			margin = parseInt(margin);

			return [
				this.margin({ left: (margin * -1) + '%' })[0],
				decl('max-width', (100 + margin) + '%'),
				this.clearfix()
			]
		},

		/**
		 * Grid row modify
		 *
		 * @param  {string|number} margin
		 * @return {Array}
		 */
		rowModify(margin) {
			margin = margin || vars.grid.margin.replace('%', '');
			margin = parseInt(margin);

			return this.margin({ left: (margin * -1) + '%' })
				.concat(decl('max-width', (100 + margin) + '%'));
		},

		/**
		 * Grid row reset
		 *
		 * @return {Array}
		 */
		rowReset() {
			return this.margin({ left: 0 })
				.concat(decl('max-width', 'none'));
		},

		/**
		 * Output width and/or height
		 *
		 * @param  {string} width
		 * @param  {string} height
		 * @return {Array}
		 */
		size(width, height) {
			let props = [
				decl('width', width)
			];

			if (! height) {
				props.push(decl('height', width));
			} else {
				props.push(decl('height', height));
			}

			return props;
		},

		/**
		 * Show element
		 *
		 * @return {Object}
		 */
		show() {
			return this.display('inherit');
		},

		/**
		 * Add a specified margin bottom.
		 *
		 * @return {Array}
		 */
		spaced(value) {
			if (isEmpty(value) || isObject(value)) {
				value = vars.block.margin.bottom;
			}

			return this.margin({ bottom: value });
		},

		/**
		 * Add a specified margin bottom, width, height, and display block
		 *
		 * @param {Array} [args]
		 * @param {string|number|Object} [args[]] - spaced value or object of width/height
		 *	 @param {string|number} [args[].width]
		 *	 @param {string|number} [args[].height]
		 * @param {string|number} [args[]] - width
		 * @param {string|number} [args[]] - height
		 * @return {Array}
		 */
		spacedBlock(...args) {
			let props = this.spaced(...args);

			if (isObject(args[0])) {
				props = props.concat(decl.createManyFromObj(args[0]));
				props = props.concat(this.block());
			} else if (args.length > 1) {
				args.shift();
				props = props.concat(this.block(...args));
			} else {
				props = props.concat(this.block());
			}

			return props;
		},

		/**
		 * Transition shorthand declaration
		 *
		 * @param {Array} [args]
		 * @param {string|Object} [args[]] - transition property or object
		 *	 @param {string} [args[].property]
		 *	 @param {string} [args[].duration]
		 *	 @param {string} [args[].timing]
		 *	 @param {string} [args[].delay]
		 * @param {string} [args[]] - transition duration
		 * @param {string} [args[]] - transition timing
		 * @param {string} [args[]] - transition delay
		 * @returns {Declaration}
		 */
		transition(...args) {
			let defaults = {
					property: 'all',
					duration: vars.default.duration,
					timing: vars.default.timing,
					delay: vars.default.delay
				},
				property, duration, timing, delay;

			if (args[0] === false) {
				return false;
			}

			if (args[0] === 'none') {
				return decl('transition', 'none');
			}

			if (isObject(args[0])) {
				let config = Object.assign(defaults, args[0]);

				return decl('transition', `${config.property} ${config.duration} ${config.timing} ${config.delay}`);
			}

			property = args[0] || defaults.property;
			duration = args[1] || defaults.duration;
			timing = args[2] || defaults.timing;
			delay = args[3] || defaults.delay;

			return decl('transition', `${property} ${duration} ${timing} ${delay}`);
		},

		/**
		 * Set opacity to 0
		 *
		 * @return {Object}
		 */
		transparent() {
			return this.opacity(0);
		},

		/**
		 * List style: none
		 *
		 * @return {Object}
		 */
		unstyled() {
			return decl('list-style', 'none');
		},

		/**
		 * Show element
		 *
		 * @return {Object}
		 */
		visible() {
			return this.visibility('visible');
		},

		/**
		 * Visibility
		 *
		 * @param  {string} [value]
		 * @return {Object}
		 */
		visibility(value) {
			return decl('visibility', value);
		},

		/**
		 * Code block defaults
		 *
		 * @param {string|boolean} borderColor
		 * @param {boolean} blockWrap
		 * @returns {Array}
		 * @private
		 */
		_codeBlockDefaults(borderColor, blockWrap) {
			let props = [];

			if (borderColor && borderColor !== false) {
				props.push(this.border('none'));
			}

			if (blockWrap) {
				props.push(decl('white-space', 'pre-wrap'));
				props.push(decl('word-wrap', 'break-word'));
			} else {
				props.push(decl('overflow', 'auto'));
				props.push(decl('white-space', 'pre'));
			}

			return props;
		}
	};
};