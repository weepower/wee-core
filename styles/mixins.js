const decl = require('postcss-js-mixins/lib/declaration');
const rule = require('postcss-js-mixins/lib/rule');
const { calcOpacity, toRgba, isColor, isEmpty, isNumber, isObject, isPercentage, isProvided, isString, isUnit, prefix, toNumber, toDegrees, toPercentage, unit } = require('postcss-js-mixins/lib/helpers');

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

			if (isProvided(top)) {
				props.push(decl('top', top));
			}

			if (isProvided(right)) {
				props.push(decl('right', right));
			}

			if (isProvided(bottom)) {
				props.push(decl('bottom', bottom));
			}

			if (isProvided(left)) {
				props.push(decl('left', left));
			}

			return props;
		},

		/**
		 * Background
		 *
		 * @param {number|string} [color] - Hex value
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
					prop = toRgba(prop, opacity);
				} else {
					prop += opacity.indexOf('url(') >= 0 ?
						` ${opacity}` :
						` url('${vars.image.path}${opacity.replace(/'/g, '')}')`;
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
		 * @param {string} [color] - Hex value
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
					props[0] = decl('background', `linear-gradient(${toDegrees(angle)}, rgba(${rgb}, 0), rgba(${rgb}, 1))`);

					return props;
				}

				if (color === 'light') {
					rgb = '255, 255, 255';
					props[0] = decl('background', `linear-gradient(${toDegrees(angle)}, rgba(${rgb}, 0), rgba(${rgb}, 1))`);

					return props;
				}
			}

			props.push(decl('background', `linear-gradient(${toDegrees(angle)}, ${start}, ${end})`));

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
		 * Set border properties
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
		 * Sets image to element border
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
		 * Create a triangle
		 *
		 * @param keyword
		 * @param {string} [color] - hex value
		 * @param {number|string} [size]
		 * @param {number|string} [width]
		 * @returns {Array}
		 */
		triangle(keyword, color = vars.colors.darkGray, size = '5px', width = size) {
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
		 * Column Offset
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
		 * Hide overflow
		 *
		 * @param {string} [keyword]
		 * @returns {Object}
		 */
		crop(keyword) {
			let hidden = 'hidden';

			if (keyword === 'horizontal') {
				return decl('overflow-x', hidden);
			}

			if (keyword === 'vertical') {
				return decl('overflow-y', hidden);
			}

			return decl('overflow', hidden);
		},

		/**
		 * Scroll overflow
		 *
		 * @param {string} [keyword]
		 * @returns {Object}
		 */
		scroll(keyword) {
			let scroll = 'scroll';

			if (keyword === 'horizontal') {
				return decl('overflow-x', scroll);
			}

			if (keyword === 'vertical') {
				return decl('overflow-y', scroll);
			}

			return decl('overflow', scroll);
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
		 * Sets width and height to 100%
		 *
		 * @returns {Array}
		 */
		fill() {
			return [
				decl('height', '100%'),
				decl('width', '100%')
			];
		},

		/**
		 * Set element filter
		 *
		 * @param {string} value
		 * @returns {Object}
		 */
		filter(value) {
			return decl('filter', value);
		},

		/**
		 * Blur filter
		 *
		 * @param {string} value
		 * @returns {Object}
		 */
		blur(value = '2px') {
			return this.filter(`blur(${value})`);
		},

		/**
		 * Brightness filter
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		brightness(value = 0.5) {
			return this.filter(`brightness(${value})`);
		},

		/**
		 * Contrast filter
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		contrast(value = 1.5) {
			return this.filter(`contrast(${value})`);
		},

		/**
		 * Grayscale filter
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		grayscale(value = 1) {
			return this.filter(`grayscale(${value})`);
		},

		/**
		 * Hue rotate filter
		 *
		 * @param {string} value
		 * @returns {Object}
		 */
		hueRotate(value = '180deg') {
			return this.filter(`hue-rotate(${toDegrees(value)})`);
		},

		/**
		 * Invert filter
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		invert(value = 1) {
			return this.filter(`invert(${value})`);
		},

		/**
		 * Saturate filter
		 *
		 * @param {number} value
		 * @returns {Object}
		 */
		saturate(value = 0.5) {
			return this.filter(`saturate(${value})`);
		},

		/**
		 * Sepai filter
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
		 * @returns {Object}
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
		 * Ellipsis
		 *
		 * @param {boolean|number|string} [maxWidth]
		 * @returns {Array}
		 */
		ellipsis(maxWidth = false) {
			let props = [
				decl('overflow-x', 'hidden'),
				decl('text-overflow', 'ellipsis'),
				decl('white-space', 'nowrap')
			];

			if (maxWidth) {
				props.push(decl('max-width', maxWidth));
			}

			return props;
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

			if (isProvided(top)) {
				props.push(decl('top', top));
			}

			if (isProvided(right)) {
				props.push(decl('right', right));
			}

			if (isProvided(bottom)) {
				props.push(decl('bottom', bottom));
			}

			if (isProvided(left)) {
				props.push(decl('left', left));
			}

			return props;
		},

		/**
		 * Flex positioning
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
		 * Font setting
		 *
		 * @param {string} [family]
		 * @param {number} size
		 * @param {number|string} weight
		 * @param {number|string} lineHeight
		 * @param {string} style
		 * @param {number|string} spacing
		 * @returns {Array}
		 */
		font(family = vars.font.family, size, weight, lineHeight, style, spacing) {
			let props = [
				decl('font-family', family)
			];

			if (size) {
				props.push(decl('font-size', size));
			}

			if (weight) {
				props.push(decl('font-weight', weight));
			}

			if (isProvided(lineHeight)) {
				props.push(decl('line-height', lineHeight));
			}

			if (style) {
				props.push(decl('font-style', style));
			}

			if (spacing) {
				props.push(decl('letter-spacing', spacing));
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
		 * Hide text
		 *
		 * @returns {Array}
		 */
		hideText() {
			return [
				decl('overflow', 'hidden'),
				decl('text-indent', '110%'),
				decl('white-space', 'nowrap')
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
		 * Inline grid column
		 *
		 * @param {string} [keyword]
		 * @param {number} share
		 * @param {number} [columns]
		 * @param {number|string} [margin]
		 * @param {boolean} [spaceless]
		 */
		inlineColumn(keyword, share, columns = vars.grid.columns, margin = vars.grid.margin, spaceless = vars.grid.spaceless) {
			let props = [
				decl('display', 'inline-block'),
				decl('vertical-align', 'top')
			];

			if (keyword === 'spaced') {
				props = props.concat([
					decl('margin-left', margin),
					decl('width', toPercentage(((1 / columns) * share) - toNumber(margin)))
				]);

				if (! spaceless) {
					props.push(decl('letter-spacing', 'normal'));
				}

				return props;
			}

			if (keyword && isNumber(keyword)) {
				let args = [].slice.call(arguments);

				// Shifts arguments down
				// Margin is replaced by spaceless
				spaceless = args[2] || spaceless;

				// TODO: Should margin be shifted if it's no longer relevant?
				// margin = args[2] || margin;
				columns = args[1] || columns;
				share = args[0] || share;

				props.push(decl('width', toPercentage((1 / columns) * share)));

				if (! spaceless) {
					props.push(decl('margin-right', '-.32em'));
				}

				return props;
			}
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
		 * Output font icon
		 *
		 * @param {string} icon
		 * @param {number|string} [size]
		 * @param {boolean|number} [rotate]
		 * @param {number|string} [weight]
		 * @param {boolean} [sharpen]
		 * @param {string} [font]
		 * @returns {Array}
		 */
		icon(icon, size = 'inherit', rotate = false, weight = 'normal', sharpen = true, font = vars.icon.family) {
			let props = [
				decl('content', icon),
			];

			props = props.concat(
				this.font(font, size, weight, 0, 'normal'),
				this.inlineBlock()
			);

			if (rotate) {
				props.push(this.rotate(rotate));
			}

			if (sharpen) {
				props = props.concat(this.textSharpen());
			}

			return props;
		},

		/**
		 * Modify font icon
		 *
		 * @param {boolean|string} [icon]
		 * @param {boolean|number|string} [size]
		 * @param {boolean|number} [rotate]
		 * @param {boolean|number|string} [weight]
		 * @param {boolean} [sharpen]
		 * @returns {Array}
		 */
		iconModify(icon = false, size = false, rotate = false, weight = false, sharpen = false) {
			let props = [];

			if (icon) {
				props.push(decl('content', icon));
			}

			if (size) {
				props.push(decl('font-size', size));
			}

			if (rotate) {
				props.push(this.rotate(rotate));
			}

			if (weight) {
				props.push(decl('font-weight', weight));
			}

			if (sharpen) {
				props = props.concat(this.textSharpen());
			}

			return props;
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

			props = props.concat(this.font(name, false, weight, false, style));
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
			let keywords = ['horizontal', 'vertical'],
				props = [];

			if (keywords.includes(keyword)) {
				let bottom = right || top,
					args = [top, bottom];

				if (keyword === 'horizontal') {
					return decl.createMany(['left', 'right'], args, 'margin');
				}

				if (keyword === 'vertical') {
					return decl.createMany(['top', 'bottom'], args, 'margin');
				}
			}

			if (isProvided(top)) {
				props.push(decl('margin-top', top));
			}

			if (isProvided(right)) {
				props.push(decl('margin-right', right));
			}

			if (isProvided(bottom)) {
				props.push(this.spaced(bottom));
			}

			if (isProvided(left)) {
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
		 * Set image aspect ratio
		 *
		 * @param {number|string} [keyword]
		 * @param {number} [ratio]
		 * @returns {Array}
		 */
		ratio(keyword, ratio = 16 / 9) {
			if (keyword === 'embed') {
				let before = [
						this.content()
					],
					props = [];

				before = before.concat(this.ratio(ratio));
				props = props.concat([
					decl('overflow', 'hidden'),
					decl('position', 'relative')
				]);

				props.push(rule('&:before', before));

				return props;
			}

			if (isNumber(keyword)) {
				ratio = keyword;
			}

			return [
				decl('display', 'block'),
				decl('height', 0),
				decl('padding-top', toPercentage(1 / ratio))
			];
		},

		/**
		 * Creates a circle
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
		 * Hide clear/cancel button in search inputs
		 *
		 * @returns {Array}
		 */
		noClear() {
			return [
				rule('&::-ms-clear', [
					decl('display', 'none')
				]),
				rule('&::-webkit-search-cancel-button', [
					decl('-webkit-appearance', 'none')
				])
			];
		},

		/**
		 * Opacity
		 *
		 * @param {number|string} value
		 * @param {boolean} hideBackface
		 * @return {Array}
		 */
		opacity(value, hideBackface = false) {
			let props = [];

			if (hideBackface) {
				props.push(decl('-webkit-backface-visibility', 'hidden'));
			}

			props.push(decl('opacity', calcOpacity(value)));

			return props;
		},

		/**
		 * Set opacity to 1
		 *
		 * @param {boolean} hideBackface
		 * @return {Array}
		 */
		opaque(hideBackface = false) {
			return this.opacity(1, hideBackface);
		},

		/**
		 * Padding
		 *
		 * @param {string} keyword
		 * @param {number|string} top
		 * @param {number|string} right
		 * @param {number|string} bottom
		 * @param {number|string} left
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

			if (isProvided(top)) {
				props.push(decl('padding-top', top));
			}

			if (isProvided(right)) {
				props.push(decl('padding-right', right));
			}

			if (isProvided(bottom)) {
				props.push(decl('padding-bottom', bottom));
			}

			if (isProvided(left)) {
				props.push(decl('padding-left', left));
			}

			return props;
		},

		/**
		 * Styles form placeholder text
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
		 * Wraps a text element
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
		 * Sets overflow to hidden and resize to both
		 *
		 * @param {string} value
		 * @returns {Array}
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
		 * Rotate transform function
		 *
		 * @param {number} [angle]
		 * @returns {Object}
		 */
		rotate(angle = 45) {
			return decl('transform', `rotate(${toDegrees(angle)})`);
		},

		/**
		 * Scale transform function
		 *
		 * @param {number|string} [keyword]
		 * @param {number} [value]
		 * @returns {Object}
		 */
		scale(keyword, value = 1) {
			if (keyword === 'x') {
				return decl('transform', `scaleX(${value})`);
			}

			if (keyword === 'y') {
				return decl('transform', `scaleY(${value})`);
			}

			if (isNumber(keyword)) {
				value = keyword;
			}

			return decl('transform', `scale(${value})`);
		},

		/**
		 * Skew transform function
		 *
		 * @param {number|string} [keyword]
		 * @param {number|string} [x]
		 * @param {number|string} [y]
		 * @returns {Object}
		 */
		skew(keyword, x = '45deg', y = '45deg') {
			if (keyword === 'x') {
				return decl('transform', `skewX(${toDegrees(x)})`);
			}

			if (keyword === 'y') {
				y = arguments[1] || y;

				return decl('transform', `skewY(${toDegrees(y)})`)
			}

			if (isNumber(keyword)) {
				y = arguments[1] || y;
				x = keyword;
			}

			return decl('transform', `skew(${toDegrees(x)}, ${toDegrees(y)})`);
		},

		/**
		 * Translate transform function
		 *
		 * @param {number|string} [keyword]
		 * @param {number|string} [x]
		 * @param {number|string} [y]
		 * @param {number|string} [z]
		 * @returns {Object}
		 */
		translate(keyword, x = 0, y = 0, z) {
			if (keyword === 'x') {
				return decl('transform', `translateX(${x})`);
			}

			if (keyword === 'y') {
				y = arguments[1] || y;

				return decl('transform', `translateY(${y})`);
			}

			if (keyword === 'z') {
				z = arguments[1] || z;

				return decl('transform', `translateZ(${z})`);
			}

			if (isNumber(keyword) || isPercentage(keyword)) {
				x = keyword;
				y = arguments[1] || y;
				z = arguments[2] || z;
			}

			if (z) {
				return decl('transform', `translate3d(${x}, ${y}, ${z})`);
			}

			return decl('transform', `translate(${x}, ${y})`);
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
		 * Selection
		 *
		 * @param {string} [color]
		 * @param {string} [background]
		 * @returns {Object}
		 */
		selection(color = vars.selection.color, background = vars.selection.background) {
			let props = [
				decl('background', background),
				decl('color', color),
				decl('text-shadow', 'none')
			];

			return rule('&::selection', props);
		},

		/**
		 * Set box shadow to an element
		 *
		 * @param {number|string} [keyword]
		 * @param {number} [opacity]
		 * @returns {Object}
		 */
		shadow(keyword, opacity = vars.default.opacity) {
			let rgb = '0, 0, 0';

			if (keyword === 'light') {
				rgb = '255, 255, 255';
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
		 * Set width and/or height
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
		 * Add a specified margin bottom
		 *
		 * @return {Array}
		 */
		spaced(value = vars.block.margin.bottom) {
			return decl('margin-bottom', value);
		},

		/**
		 * Set bottom margin and display block
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
		 * SVG stroke color and width
		 *
		 * @param {string} [color]
		 * @param {number|string} [width]
		 * @returns {Array}
		 */
		stroke(color, width) {
			let props = [
				decl('stroke', color)
			];

			if (width) {
				props.push(decl('stroke-width', width));
			}

			return props;
		},

		/**
		 * Adds a text shadow
		 *
		 * @param {number|string} [keyword]
		 * @param {number} [opacity]
		 * @returns {Object}
		 */
		textShadow(keyword, opacity = vars.default.opacity) {
			let rgb = '0, 0, 0';

			if (keyword === 'light') {
				rgb = '255, 255, 255';
			}

			if (isNumber(keyword)) {
				opacity = keyword;
			}

			return decl('text-shadow', `1px 1px 0 0 rgba(${rgb}, ${opacity})`);
		},

		/**
		 * Sharpens text
		 *
		 * @returns {Array}
		 */
		textSharpen() {
			return [
				decl('-webkit-font-smoothing', 'antialiased'),
				decl('-moz-osx-font-smoothing', 'grayscale')
			];
		},

		/**
		 * Capitalize text
		 *
		 * @returns {Object}
		 */
		capitalize() {
			return decl('text-transform', 'capitalize');
		},

		/**
		 * Make text lowercase
		 *
		 * @returns {Object}
		 */
		lowercase() {
			return decl('text-transform', 'lowercase');
		},

		/**
		 * Make text uppercase
		 *
		 * @returns {Object}
		 */
		uppercase() {
			return decl('text-transform', 'uppercase');
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
		 * @param {boolean} hideBackface
		 * @return {Array}
		 */
		transparent(hideBackface = false) {
			return this.opacity(0, hideBackface);
		},

		/**
		 * Underline text
		 *
		 * @param {string} [style]
		 * @param {string} [color]
		 * @returns {Object}
		 */
		underline(style, color = 'inherit') {
			if (! style) {
				return decl('text-decoration', 'underline');
			}

			return decl('text-decoration', `${color} ${style} underline`);
		},

		/**
		 * Line-through text
		 *
		 * @returns {Object}
		 */
		lineThrough() {
			return decl('text-decoration', 'line-through');
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
		 * Set visibility property
		 *
		 * @param  {string} [value]
		 * @return {Object}
		 */
		visibility(value) {
			return decl('visibility', value);
		},

		/**
		 * Wrap
		 *
		 * @returns {Object}
		 */
		wrap() {
			return decl('white-space', 'normal');
		},

		/**
		 * No wrap
		 *
		 * @returns {Object}
		 */
		noWrap() {
			return decl('white-space', 'nowrap');
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