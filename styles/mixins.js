const decl = require('postcss-js-mixins/lib/declaration');
const rule = require('postcss-js-mixins/lib/rule');
const { calcOpacity, hexToRgba, isColor, isEmpty, isNumber, isObject, isPercentage, isString, isUnit, prefix, toNumber, toPercentage, unit } = require('postcss-js-mixins/lib/helpers');

module.exports = (vars = {}) => {
	return {
		/**
		 * Absolute positioning
		 *
		 * @param {string|number} [top]
		 * @param {string|number} [right]
		 * @param {string|number} [bottom]
		 * @param {string|number} [left]
		 * @returns {Array}
		 */
		absolute(top, right, bottom, left) {
			let props = [
				decl('position', 'absolute')
			];

			if (top) {
				props.push(decl('top', top));
			}

			if (right) {
				props.push(decl('right', right));
			}

			if (bottom) {
				props.push(decl('bottom', bottom));
			}

			if (left) {
				props.push(decl('left', left));
			}

			return props;
		},

		/**
		 * Background
		 *
		 * @param {number|string} [color]
		 * @param {number|string} [opacity] - Opacity or filename
		 * @param {string} [repeat] - Repeat or attachment
		 * @param {number|string} [attachment] - Attachment or x
		 * @param {number|string} [x] - X or y
		 * @param {number|string} [y]
		 * @returns {Object}
		 */
		background(color = vars.colors.body.background, opacity, repeat, attachment, x, y) {
			let prop = color;

			if (prop === 0) {
				return decl('background', 'transparent');
			}

			if (opacity) {
				if (isNumber(opacity)) {
					prop = hexToRgba(prop, opacity);
				} else {
					prop += ` ${opacity}`;
				}
			}

			if (repeat) {
				prop += ` ${repeat}`;
			}

			if (attachment) {
				prop += ` ${attachment}`;
			}

			if (x) {
				prop += ` ${x}`;
			}

			if (y) {
				prop += ` ${y}`;
			}

			return decl('background', prop);
		},

		/**
		 * Background Image
		 *
		 * @param {string} filename
		 * @param {string} [repeat]
		 * @param {string} [position]
		 * @param {string} [size]
		 * @param {string} [attachment]
		 * @returns {Array}
		 */
		backgroundImage(filename, repeat = 'no-repeat', position, size, attachment) {
			let props = [
				decl('background-image', `url('${vars.image.path}${filename}')`),
				decl('background-repeat', repeat)
			];

			if (position) {
				props.push(decl('background-position', position));
			}

			if (size) {
				props.push(decl('background-size', size));
			}

			if (attachment) {
				props.push(decl('background-attachment', attachment));
			}

			return props;
		},

		/**
		 * Background gradient
		 *
		 * @param {string} [color]
		 * @param {string} [start]
		 * @param {string} [end]
		 * @param {number} [angle]
		 * @returns {Array}
		 */
		backgroundGradient(color = 'gray', start = 'rgba(0, 0, 0, .8)', end = 'rgba(0, 0, 0, .2)', angle = 180) {
			let props = [
					decl('background-color', color)
				],
				keywords = ['dark', 'light'];

			if (keywords.includes(color)) {
				let rgb = '0, 0, 0';

				if (color === 'dark') {
					props[0] = decl('background', `linear-gradient(${angle}deg, rgba(${rgb}, 0), rgba(${rgb}, 1))`);

					return props;
				}

				if (color === 'light') {
					rgb = '255, 255, 255';
					props[0] = decl('background', `linear-gradient(${angle}deg, rgba(${rgb}, 0), rgba(${rgb}, 1))`);

					return props;
				}
			}

			props.push(decl('background', `linear-gradient(${angle}deg, ${start}, ${end})`));

			return props;
		},

		/**
		 * Display block
		 *
		 * @param {number|string} [width]
		 * @param {number|string} [height]
		 * @returns {Array}
		 */
		block(width, height) {
			let props = [
				this.display('block')
			];

			if (width) {
				props.push(decl('width', width));
			}

			if (height) {
				props.push(decl('height', height));
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
		 * @param {boolean|number|string} keyword
		 * @param {number|string} [color]
		 * @param {number|string} [width]
		 * @param {string} [style]
		 * @returns {Array}
		 */
		border(keyword, color = vars.border.color, width = vars.border.width, style = vars.border.style) {
			let keywords = [
					'top',
					'right',
					'bottom',
					'left',
					'vertical',
					'horizontal'
				],
				props = [
					decl('border', `${width} ${style} ${color}`)
				];

			// If resetting
			if (keyword === 0 || keyword === false || keyword === 'none') {
				props[0] = decl('border', 'none');

				return props;
			}

			// If using keyword
			if (keyword && keywords.includes(keyword)) {
				let value = `${width} ${style} ${color}`;

				if (keyword === 'horizontal') {
					return decl.createMany([
						'border-left',
						'border-right'
					], value);
				}

				if (keyword === 'vertical') {
					return decl.createMany([
						'border-top',
						'border-bottom'
					], value);
				}

				if (keyword === 'top') {
					props[0] = decl('border-top', value);

					return props;
				}

				if (keyword === 'right') {
					props[0] = decl('border-right', value);

					return props;
				}

				if (keyword === 'bottom') {
					props[0] = decl('border-bottom', value);

					return props;
				}

				if (keyword === 'left') {
					props[0] = decl('border-left', value);

					return props;
				}
			}

			if (keyword && isColor(keyword)) {
				let args = [].slice.call(arguments);

				// Shifts arguments down
				style = args[2] || style;
				width = args[1] || width;
				color = args[0] || color;

				props[0] = decl('border', `${width} ${style} ${color}`);
			}

			return props;
		},

		/**
		 * Border image
		 *
		 * @param filename
		 * @param {number|string} [slice]
		 * @param {number|string} [width]
		 * @param {number|string} [outset]
		 * @param {string} [repeat]
		 * @returns {Object}
		 */
		borderImage(filename, slice = '100%', width = 1, outset = 0, repeat = 'stretch') {
			if (! filename) {
				return false;
			}

			return decl('border-image', `url('${vars.image.path}${filename}') ${slice} ${width} ${outset} ${repeat}`);
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
		 * Caret
		 *
		 * @param keyword
		 * @param {string} [color]
		 * @param {number|string} [size]
		 * @param {number|string} [width]
		 * @returns {Array}
		 */
		caret(keyword, color = vars.colors.darkGray, size = '5px', width = size) {
			let props = [
				this.content(),
				decl('height', 0),
				decl('width', 0)
			];

			if (keyword === 'up' || keyword === 'down') {
				props = props.concat(this.border('horizontal', 'transparent', width));

				if (keyword === 'up') {
					props = props.concat(this.border('bottom', color, size));
				} else {
					props = props.concat(this.border('top', color, size));
				}

				return props;
			}

			if (keyword === 'left' || keyword === 'right') {
				props = props.concat(this.border('vertical', 'transparent', width));

				if (keyword === 'left') {
					props = props.concat(this.border('right', color, size));
				} else {
					props = props.concat(this.border('left', color, size));
				}

				return props;
			}
		},

		/**
		 * A block level element, centered with margin
		 *
		 * @param {number|string} [maxWidth]
		 * @param {number|string} [margin]
		 * @returns {Array}
		 */
		centeredBlock(maxWidth, margin) {
			let props = [
				decl('display', 'block'),
				decl('margin-left', 'auto'),
				decl('margin-right', 'auto')
			];

			if (maxWidth) {
				props.push(decl('max-width', maxWidth));
			}

			if (margin) {
				props.push(decl('margin-bottom', margin));
			}

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
		 * @param {number|string} [keyword]
		 * @param {number} [share]
		 * @param {number} [columns]
		 * @param {string} [margin]
		 * @returns {Array}
		 */
		column(keyword, share, columns = vars.grid.columns, margin = vars.grid.margin) {
			let props = [
					decl('float', 'left')
				],
				width = (1 / parseInt(columns)) * parseInt(share);

			if (! keyword) {
				props.push(decl('width', '100%'));

				return props;
			}

			if (isPercentage(keyword)) {
				props.push(decl('width', keyword));

				return props;
			}

			if (keyword === 'spaced') {
				return props.concat([
					decl('margin-left', margin),
					decl('width', toPercentage((width) - toNumber(margin)))
				]);
			}

			// If not 'spaced', arguments are shifted
			if (isNumber(keyword)) {
				columns = share || columns;
				share = keyword;
			}

			props.push(decl('width', toPercentage((1 / parseInt(columns)) * parseInt(share))));

			return props;
		},

		/**
		 * Modify grid column
		 *
		 * @param {number|string} keyword
		 * @param {number} [share]
		 * @param {number} [columns]
		 * @param {string} [margin]
		 * @returns {Array|Object}
		 */
		columnModify(keyword, share, columns = vars.grid.columns, margin = vars.grid.margin) {
			let width = (1 / parseInt(columns)) * parseInt(share);

			if (isPercentage(keyword)) {
				return decl('width', keyword);
			}

			if (keyword === 'spaced') {
				return [
					decl('margin-left', margin),
					decl('width', toPercentage((width) - toNumber(margin)))
				];
			}

			// If not 'spaced', arguments are shifted
			if (isNumber(keyword)) {
				columns = share || columns;
				share = keyword;
			}

			return decl('width', toPercentage((1 / parseInt(columns)) * parseInt(share)));
		},

		/**
		 * Reset grid column
		 *
		 * @param {boolean} [resetMargin]
		 * @returns {Array}
		 */
		columnReset(resetMargin = false) {
			let props = [
				decl('float', 'none'),
				decl('width', 'auto')
			];

			if (resetMargin) {
				props.push(decl('margin-left', 0));
			}

			return props;
		},

		/**
		 * Pull grid column
		 *
		 * @param {number} share
		 * @param {number} [columns]
		 * @returns {Array}
		 */
		columnPull(share, columns = vars.grid.columns) {
			return [
				decl('position', 'relative'),
				decl('right', toPercentage(1 / columns * share))
			];
		},

		/**
		 * Push grid column
		 *
		 * @param {number} share
		 * @param {number} [columns]
		 * @returns {Array}
		 */
		columnPush(share, columns = vars.grid.columns) {
			return [
				decl('left', toPercentage(1 / columns * share)),
				decl('position', 'relative')
			];
		},

		/**
		 *
		 * @param {number|string} [keyword]
		 * @param {number} share
		 * @param {number} [columns]
		 * @param {number|string} [margin]
		 * @returns {Object}
		 */
		columnOffset(keyword, share, columns = vars.grid.columns, margin = (toPercentage(toNumber(vars.grid.margin) / 2))) {
			let left = (1 / columns) * share,
				spacing = toNumber(margin) * 2;

			if (keyword === 'spaced') {
				return decl('margin-left', toPercentage(left + spacing));
			}

			if (isNumber(keyword)) {
				columns = share;
				share = keyword;
			}

			return decl('margin-left', toPercentage(1 / columns * share));
		},

		/**
		 * Columns
		 *
		 * @param {number} count
		 * @param {number|string} gap
		 * @param {string} style
		 * @param {number|string} width
		 * @returns {Array}
		 */
		columns(count = 2, gap, style, width = '1px') {
			let props = [
				decl('column-count', count)
			];

			if (gap) {
				props.push(decl('column-gap', gap));
			}

			if (style) {
				props.push(decl('column-rule-style', style));
			}

			props.push(decl('column-rule-width', width));

			return props;
		},

		/**
		 * Conditionally add min-width property to both html and body elements
		 *
		 * @returns {Array|boolean}
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
		 * Filter
		 *
		 * @param {string} value
		 * @returns {Object}
		 */
		filter(value) {
			return decl('filter', value);
		},

		/**
		 * Blur
		 *
		 * @param {string} value
		 * @returns {Object}
		 */
		blur(value = '2px') {
			return this.filter(`blur(${value})`);
		},

		/**
		 * Brightness
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		brightness(value = 0.5) {
			return this.filter(`brightness(${value})`);
		},

		/**
		 * Contrast
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		contrast(value = 1.5) {
			return this.filter(`contrast(${value})`);
		},

		/**
		 * Grayscale
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		grayscale(value = 1) {
			return this.filter(`grayscale(${value})`);
		},

		/**
		 * Hue rotate
		 *
		 * @param {string} value
		 * @returns {Object}
		 */
		hueRotate(value = '180deg') {
			return this.filter(`hue-rotate(${value})`);
		},

		/**
		 * Invert
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		invert(value = 1) {
			return this.filter(`invert(${value})`);
		},

		/**
		 * Saturate
		 * @param {number} value
		 * @returns {Object}
		 */
		saturate(value = 0.5) {
			return this.filter(`saturate(${value})`);
		},

		/**
		 * Sepai
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		sepia(value = 0.5) {
			return this.filter(`sepia(${value})`);
		},

		/**
		 * Drop shadow
		 *
		 * @param {string} color
		 * @param {string} x
		 * @param {string} y
		 * @param {number} blur
		 * @param {number} opacity
		 * @returns {object}
		 */
		dropShadow(color, x = '1px', y = '1px', blur = 0, opacity = vars.default.opacity) {
			let colorResult = color;

			if (! color) {
				colorResult = `rgba(0, 0, 0, ${opacity})`;
			}

			if (color === 'light') {
				colorResult = `rgba(255, 255, 255, ${opacity})`;
			} else if (color === 'dark') {
				colorResult = `rgba(0, 0, 0, ${opacity})`;
			}

			return this.filter(`drop-shadow(${x} ${y} ${blur} ${colorResult})`);
		},

		/**
		 * Fixed positioning
		 *
		 * @param {number|string} [top]
		 * @param {number|string} [right]
		 * @param {number|string} [bottom]
		 * @param {number|string} [left]
		 * @returns {Array}
		 */
		fixed(top, right, bottom, left) {
			let props = [
				decl('position', 'fixed')
			];

			if (top) {
				props.push(decl('top', top));
			}

			if (right) {
				props.push(decl('right', right));
			}

			if (bottom) {
				props.push(decl('bottom', bottom));
			}

			if (left) {
				props.push(decl('left', left));
			}

			return props;
		},

		/**
		 * Flex
		 *
		 * @param {number} grow
		 * @param {number} shrink
		 * @param {string} basis
		 * @returns {Array}
		 */
		flex(grow = 0, shrink = 0, basis = 'auto') {
			return [
				decl('flex-grow', grow),
				decl('flex-shrink', shrink),
				decl('flex-basis', basis)
			];
		},

		/**
		 * Flex container
		 *
		 * @param {string} [direction]
		 * @param {string} [wrap]
		 * @param {string} [justify]
		 * @param {string} [align]
		 * @param {string} [alignContent]
		 * @returns {Array}
		 */
		flexContainer(direction = 'row', wrap = 'nowrap', justify = 'flex-start', align = 'stretch', alignContent = 'stretch') {
			return [
				this.display('flex'),
				decl('flex-direction', direction),
				decl('flex-wrap', wrap),
				decl('justify-content', justify),
				decl('align-items', align),
				decl('align-content', alignContent)
			];
		},

		/**
		 * Font
		 *
		 * @param {string} [family]
		 * @param {number} size
		 * @param {number|string} weight
		 * @param {string} lineHeight
		 * @param {string} style
		 * @returns {Array}
		 */
		font(family = vars.font.family, size, weight, lineHeight, style) {
			let props = [
				decl('font-family', family)
			];

			if (size) {
				props.push(decl('font-size', size));
			}

			if (weight) {
				props.push(decl('font-weight', weight));
			}

			if (lineHeight) {
				props.push(decl('line-height', lineHeight));
			}

			if (style) {
				props.push(decl('font-style', style));
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
		 * @param {number|string} [width]
		 * @param {number|string} [height]
		 * @returns {Array}
		 */
		inlineBlock(width, height) {
			let props = [
				decl('display', 'inline-block')
			];

			if (width) {
				props.push(decl('width', width));
			}

			if (height) {
				props.push(decl('height', height));
			}

			return props;
		},

		/**
		 * Inline grid row
		 *
		 * @param {string} [margin]
		 * @param {boolean} [spaceless]
		 * @returns {Array}
		 */
		inlineRow(margin = vars.grid.margin, spaceless = vars.grid.spaceless) {
			let props = [
				decl('margin-left', toPercentage(toNumber(margin) * -1)),
				decl('max-width', toPercentage(1 + toNumber(margin)))
			];

			if (! spaceless) {
				props.push(decl('letter-spacing', '-.32em'));
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
		 * Load font
		 *
		 * @param {string} name
		 * @param {string} [file]
		 * @param {string} [weight]
		 * @param {string} [style]
		 * @returns {*}
		 */
		loadFont(name, file = name, weight = 'normal', style = 'normal') {
			if (! name) {
				return false;
			}

			let props = [],
				filePath = `${vars.font.path}${file}`;

			props = props.concat(this.font(name, null, weight, null, style));
			props.push(decl('src', `url('${filePath}.woff2'), url('${filePath}.woff'), url('${filePath}.ttf')`));

			return rule('@font-face', props);
		},

		/**
		 * Margin
		 *
		 * @param {string} keyword
		 * @param {number|string} top
		 * @param {number|string} right
		 * @param {number|string} bottom
		 * @param {number|string} left
		 * @returns {Array|Object}
		 */
		margin(keyword, top, right, bottom, left) {
			let keywords = ['none', 'horizontal', 'vertical'],
				props = [];

			if (keywords.includes(keyword)) {
				let bottom = right || top,
					args = [top, bottom];

				if (keyword === 'none') {
					return decl('transition', 'none');
				}

				if (keyword === 'horizontal') {
					return decl.createMany(['left', 'right'], args, 'margin');
				}

				if (keyword === 'vertical') {
					return decl.createMany(['top', 'bottom'], args, 'margin');
				}
			}

			if (top) {
				props.push(decl('margin-top', top));
			}

			if (right) {
				props.push(decl('margin-right', right));
			}

			if (bottom) {
				props.push(this.spaced(bottom));
			}

			if (left) {
				props.push(decl('margin-left', left));
			}

			return props;
		},

		/**
		 * Output max-width and/or max-height
		 *
		 * @param {number|string} width
		 * @param {number|string} [height]
		 * @returns {Array}
		 */
		maxSize(width, height) {
			let props = [
				decl('max-width', width)
			];

			if (! height) {
				props.push(decl('max-height', width));
			} else {
				props.push(decl('max-height', height));
			}

			return props;
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
		 * Square
		 *
		 * @param {number|string} size
		 * @returns {Array}
		 */
		square(size) {
			return [
				decl('height', size),
				decl('width', size)
			];
		},

		/**
		 * Circle
		 *
		 * @param {number} diameter
		 * @param {boolean} [crop]
		 * @param {string} [display]
		 * @returns {Array}
		 */
		circle(diameter, crop, display = 'block') {
			let props = [
				decl('height', diameter),
				decl('width', diameter),
				decl('display', display)
			];

			props = props.concat(this.rounded(diameter / 2));

			if (crop) {
				props.push(decl('overflow', 'hidden'));
			}

			if (display === 'inline') {
				props[2] = decl('display', 'inline-block');
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
		padding(keyword, top, right, bottom, left) {
			let keywords = ['horizontal', 'vertical'],
				props = [];

			if (keywords.includes(keyword)) {
				let bottom = right || top,
					args = [top, bottom];

				if (keyword === 'horizontal') {
					return decl.createMany(['left', 'right'], args, 'padding');
				}

				if (keyword === 'vertical') {
					return decl.createMany(['top', 'bottom'], args, 'padding');
				}
			}

			if (top) {
				props.push(decl('padding-top', top));
			}

			if (right) {
				props.push(decl('padding-right', right));
			}

			if (bottom) {
				props.push(decl('padding-bottom', bottom));
			}

			if (left) {
				props.push(decl('padding-left', left));
			}

			return props;
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
		 * Prefix
		 *
		 * @param {string} [value]
		 * @param {number|string} [margin]
		 * @param {boolean|string} [font]
		 * @param {boolean|string} [color]
		 * @returns {Object}
		 */
		prefix(value = '-', margin = '.5em', font = false, color = false) {
			let props = [
				decl('content', `'${value}'`),
				decl('margin-right', margin)
			];

			if (value.indexOf('attr') === 0) {
				props[0] = decl('content', value);
			}

			if (font) {
				props.push(decl('font-family', font));
			}

			if (color) {
				props.push(decl('color', color));
			}

			return rule('&:before', props);
		},

		/**
		 * Suffix
		 *
		 * @param {string} [value]
		 * @param {number|string} [margin]
		 * @param {boolean|string} [font]
		 * @param {boolean|string} [color]
		 * @returns {Object}
		 */
		suffix(value = '-', margin = '.5em', font = false, color = false) {
			let props = [
				decl('content', `'${value}'`),
				decl('margin-left', margin)
			];

			if (value.indexOf('attr') === 0) {
				props[0] = decl('content', value);
			}

			if (font) {
				props.push(decl('font-family', font));
			}

			if (color) {
				props.push(decl('color', color));
			}

			return rule('&:after', props);
		},

		/**
		 * Bookends
		 *
		 * @param {string} [value]
		 * @param {number|string} [margin]
		 * @param {boolean|string} [font]
		 * @param {boolean|string} [color]
		 * @returns {Array}
		 */
		bookends(value = '-', margin = '.5em', font = false, color = false) {
			return [
				this.prefix(value, margin, font, color),
				this.suffix(value, margin, font, color)
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
		 * @param {number|string} [keyword]
		 * @param {number|string} [radius]
		 * @returns {Array}
		 */
		rounded(keyword, radius = vars.default.radius) {
			let props = [
					decl('background-clip', 'border-box')
				],
				keywords = ['top', 'right', 'bottom', 'left'];

			if (keyword === false) {
				return false;
			}

			if (keywords.includes(keyword)) {
				let corners = [];

				if (keyword === 'left' || keyword === 'right') {
					corners = [`top-${keyword}-radius`, `bottom-${keyword}-radius`];
				} else if (keyword === 'top' || keyword === 'bottom') {
					corners = [`${keyword}-left-radius`, `${keyword}-right-radius`];
				}

				props = props.concat(decl.createMany(corners, radius, 'border'));

				return props;
			}

			if (isNumber(keyword) || isUnit(keyword)) {
				radius = keyword;
			}

			props.push(decl('border-radius', radius));

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
				decl('margin-left', `${margin * -1}%`),
				decl('max-width', `${margin + 100}%`),
				this.clearfix()
			];
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

			return [
				decl('margin-left', `${margin * -1}%`),
				decl('max-width', `${margin + 100}%`)
			];
		},

		/**
		 * Grid row reset
		 *
		 * @return {Array}
		 */
		rowReset() {
			return [
				decl('margin-left', 0),
				decl('max-width', 'none')
			];
		},

		/**
		 * Box shadow
		 *
		 * @param {number|string} [keyword]
		 * @param {number} [opacity]
		 * @returns {Object}
		 */
		shadow(keyword, opacity = vars.default.opacity) {
			let keywords = ['dark', 'light'],
				rgb = '0, 0, 0';

			if (keywords.includes(keyword)) {
				if (keyword === 'light') {
					rgb = '255, 255, 255';
				}
			}

			if (isNumber(keyword)) {
				opacity = keyword;
			}

			return decl('box-shadow', `1px 1px 0 0 rgba(${rgb}, ${opacity})`);
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
		 * Add a specified margin bottom.
		 *
		 * @return {Array}
		 */
		spaced(value = vars.block.margin.bottom) {
			return decl('margin-bottom', value);
		},

		/**
		 * Spaced block
		 *
		 * @param {number|string} [margin]
		 * @param {number|string} [width]
		 * @param {number|string} [height]
		 * @returns {Array}
		 */
		spacedBlock(margin = vars.block.margin.bottom, width, height) {
			let props = [
				decl('display', 'block'),
				this.spaced(margin)
			];

			if (width) {
				props.push(decl('width', width));
			}

			if (height) {
				props.push(decl('height', height));
			}

			return props;
		},

		/**
		 * Transition shorthand declaration
		 *
		 * @param {string} [property]
		 * @param {string} [duration]
		 * @param {string} [easing]
		 * @param {string} [delay]
		 * @returns {Object}
		 */
		transition(property = 'all', duration = vars.default.duration, easing = vars.default.timing, delay = '0s') {
			if (property === false) {
				return false;
			}

			if (property === 'none') {
				return decl('transition', 'none');
			}

			return decl('transition', `${property} ${duration} ${easing} ${delay}`);
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
		 * Container padding
		 *
		 * @returns {Array|boolean}
		 * @private
		 */
		_containerPadding() {
			if (vars.bumper.enabled) {
				return this.padding('horizontal', vars.bumper.padding);
			}

			return false;
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
				props = props.concat(this.border('none'));
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