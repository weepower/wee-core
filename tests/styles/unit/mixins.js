'use strict';

const expect = require('chai').expect;
const postcss = require('postcss');
const mixinsPlugin = require('postcss-js-mixins');
const variablesPlugin = require('postcss-variables');
const syntax = require('postcss-wee-syntax');
const stripIndent = require('common-tags').stripIndent;
const register = require('postcss-variables/lib/register');
const vars = register(require('../../../styles/variables'));
const variables = vars();
const mix = require('../../../styles/mixins');
const mixins = mix(variables);

function process(input, expected, opts = {}, warnings = 0, vars) {
	return postcss([
		variablesPlugin({
			globals: vars || variables
		}),
		mixinsPlugin(opts)
	]).process(input, {
		syntax: syntax
	})
		.then(result => {
			expect(result.css).to.equal(expected);
			expect(result.warnings().length).to.equal(warnings);
		});
}

describe('{ mixins: mixins }', () => {
	it('should generate a single declaration', () => {
		return process(
			`.block {
				background(#fff);
			}`,
			`.block {
				background: #fff;
			}`,
			{
				mixins: {
					background(color) {
						return { prop: 'background', value: color }
					}
				}
			}
		);
	});

	it('should generate multiple declarations from one mixin', () => {
		return process(
			`.block {
				background(#fff, no-repeat, right, top);
			}`,
			`.block {
				background-color: #fff;
				background-repeat: no-repeat;
				background-position: right top;
			}`,
			{
				mixins: {
					background(color, repeat, x = '0%', y = '0%') {
						return [
							{ prop: 'background-color', value: color },
							{ prop: 'background-repeat', value: repeat },
							{ prop: 'background-position', value: x + ' ' + y }
						];
					}
				}
			}
		);
	});

	it('should convert numbers', () => {
		return process(
			`.block {
				opacity(.4);
			}`,
			`.block {
				opacity: 0.4;
			}`,
			{ mixins: mixins }
		);
	});

	it('should throw a warning if mixin does not exist', () => {
		return process(
			`.block {
				customMixin(#fff);
			}`,
			`.block {
				customMixin(#fff);
			}`,
			{},
			1
		);
	});
});

describe('default units', () => {
	after(() => {
		return process('', '', {
			mixins: mixins,
			units: {
				default: 'rem',
				lineHeight: 'em'
			}
		});
	});

	it('should fallback to rem and em (line-height only)', () => {
		return process(
			`.block {
				font(['Open Sans', Arial, sans-serif], 5, bold, 1.2);
			}`,
			`.block {
				font-family: 'Open Sans', Arial, sans-serif;
				font-size: 5rem;
				font-weight: bold;
				line-height: 1.2em;
			}`,
			{ mixins: mixins }
		);
	});

	it('should be registered in options object', () => {
		return process(
			`.block {
				spacedBlock($block.margin.bottom, 10);
				font(Arial, 5, bold, 1.2);
			}`,
			`.block {
				display: block;
				margin-bottom: 4rem;
				width: 10px;
				font-family: Arial;
				font-size: 5px;
				font-weight: bold;
				line-height: 1.2%;
			}`,
			{
				mixins: mixins,
				units: {
					default: 'px',
					lineHeight: '%'
				}
			}
		);
	});
});

// TODO: anything below here is a part of the mixin specific test
describe('left', () => {
	it('should generate float left by default', () => {
		return process(
			`.block {
				left();
			}`,
			`.block {
				float: left;
			}`,
			{ mixins: mixins }
		);
	});

	it('should generate position left', () => {
		return process(
			`.block {
				left(10);
			}`,
			`.block {
				left: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should override default value', () => {
		return process(
			`.block {
				left(10px);
			}`,
			`.block {
				left: 10px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('right', () => {
	it('should generate float right', () => {
		return process(
			`.block {
				right();
			}`,
			`.block {
				float: right;
			}`,
			{ mixins: mixins }
		);
	});

	it('should generate position right', () => {
		return process(
			`.block {
				right(10);
			}`,
			`.block {
				right: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should override default value', () => {
		return process(
			`.block {
				right(10px);
			}`,
			`.block {
				right: 10px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('clear', () => {
	it('should generate clear both by default', () => {
		return process(
			`.block {
				clear();
			}`,
			`.block {
				clear: both;
			}`,
			{ mixins: mixins }
		);
	});

	it('should clear left', () => {
		return process(
			`.block {
				clear(left);
			}`,
			`.block {
				clear: left;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('inline', () => {
	it('should generate display: inline', () => {
		return process(
			`.block {
				inline();
			}`,
			`.block {
				display: inline;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('inlineBlock', () => {
	it('should generate display: inline-block', () => {
		return process(
			`.block {
				inlineBlock();
			}`,
			`.block {
				display: inline-block;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width with default unit', () => {
		return process(
			`.block {
				inlineBlock(20);
			}`,
			`.block {
				display: inline-block;
				width: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				inlineBlock(20, 30);
			}`,
			`.block {
				display: inline-block;
				width: 20rem;
				height: 30rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width and height with user-defined units', () => {
		return process(
			`.block {
				inlineBlock(20px, 30em);
			}`,
			`.block {
				display: inline-block;
				width: 20px;
				height: 30em;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width and height with default unit in object syntax', () => {
		return process(
			`.block {
				inlineBlock(width: 20, height: 20);
			}`,
			`.block {
				display: inline-block;
				width: 20rem;
				height: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add height with default unit in object syntax', () => {
		return process(
			`.block {
				inlineBlock(height: 20);
			}`,
			`.block {
				display: inline-block;
				height: 20rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('block', () => {
	it('should generate display: block', () => {
		return process(
			`.block {
				block();
			}`,
			`.block {
				display: block;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width with default unit', () => {
		return process(
			`.block {
				block(20);
			}`,
			`.block {
				display: block;
				width: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				block(20, 30);
			}`,
			`.block {
				display: block;
				width: 20rem;
				height: 30rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width and height with override unit', () => {
		return process(
			`.block {
				block(20px, 30em);
			}`,
			`.block {
				display: block;
				width: 20px;
				height: 30em;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				block(width: 20, height: 20);
			}`,
			`.block {
				display: block;
				width: 20rem;
				height: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add specified parameters', () => {
		return process(
			`.block {
				block(height: 20);
			}`,
			`.block {
				display: block;
				height: 20rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('centeredBlock', () => {
	it('should generate display: block with centered margins', () => {
		return process(
			`.block {
				centeredBlock();
			}`,
			`.block {
				display: block;
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add max-width with default unit', () => {
		return process(
			`.block {
				centeredBlock(20);
			}`,
			`.block {
				display: block;
				margin-left: auto;
				margin-right: auto;
				max-width: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add max-width and margin with default unit', () => {
		return process(
			`.block {
				centeredBlock(20, 30);
			}`,
			`.block {
				display: block;
				margin-left: auto;
				margin-right: auto;
				max-width: 20rem;
				margin-bottom: 30rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add max-width and margin with override unit', () => {
		return process(
			`.block {
				centeredBlock(20px, 30em);
			}`,
			`.block {
				display: block;
				margin-left: auto;
				margin-right: auto;
				max-width: 20px;
				margin-bottom: 30em;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add max-width and margin with default unit', () => {
		return process(
			`.block {
				centeredBlock(maxWidth: $width.max, margin: 20);
			}`,
			`.block {
				display: block;
				margin-left: auto;
				margin-right: auto;
				max-width: 1280px;
				margin-bottom: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should add specified parameters', () => {
		return process(
			`.block {
				centeredBlock(margin: 20);
			}`,
			`.block {
				display: block;
				margin-left: auto;
				margin-right: auto;
				margin-bottom: 20rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('display', () => {
	it('should output supplied display value', () => {
		return process(
			`.block {
				display(block);
			}`,
			`.block {
				display: block;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('hide', () => {
	it('should output display: none', () => {
		return process(
			`.block {
				hide();
			}`,
			`.block {
				display: none;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('show', () => {
	it('should output display: inherit', () => {
		return process(
			`.block {
				show();
			}`,
			`.block {
				display: inherit;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('visibility', () => {
	it('should output supplied visibility value ', () => {
		return process(
			`.block {
				visibility(hidden);
			}`,
			`.block {
				visibility: hidden;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('visible', () => {
	it('should output visibility: visible ', () => {
		return process(
			`.block {
				visible();
			}`,
			`.block {
				visibility: visible;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('hidden', () => {
	it('should output visibility: hidden', () => {
		return process(
			`.block {
				hidden();
			}`,
			`.block {
				visibility: hidden;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('spaced', () => {
	it('should output default value as margin-bottom', () => {
		return process(
			`.block {
				spaced();
			}`,
			`.block {
				margin-bottom: 4rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied value as margin-bottom', () => {
		return process(
			`.block {
				spaced(10);
			}`,
			`.block {
				margin-bottom: 10rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('spacedBlock', () => {
	it('should output default value', () => {
		return process(
			`.block {
				spacedBlock();
			}`,
			`.block {
				display: block;
				margin-bottom: 4rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied value as margin-bottom', () => {
		return process(
			`.block {
				spacedBlock(10);
			}`,
			`.block {
				display: block;
				margin-bottom: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied string value as margin-bottom and width', () => {
		return process(
			`.block {
				spacedBlock(2, 10);
			}`,
			`.block {
				display: block;
				margin-bottom: 2rem;
				width: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied string value as margin-bottom, width and height', () => {
		return process(
			`.block {
				spacedBlock(2, 10, 20);
			}`,
			`.block {
				display: block;
				margin-bottom: 2rem;
				width: 10rem;
				height: 20rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied string value as margin-bottom and width with override unit', () => {
		return process(
			`.block {
				spacedBlock(2px, 10em);
			}`,
			`.block {
				display: block;
				margin-bottom: 2px;
				width: 10em;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied values', () => {
		return process(
			`.block {
				spacedBlock(width: 10);
			}`,
			`.block {
				display: block;
				margin-bottom: 4rem;
				width: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied values with override unit', () => {
		return process(
			`.block {
				spacedBlock(width: 10px);
			}`,
			`.block {
				display: block;
				margin-bottom: 4rem;
				width: 10px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('opacity', () => {
	it('should output provided value', () => {
		return process(
			`.block {
				opacity(.5);
			}`,
			`.block {
				opacity: 0.5;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle backface visibility', () => {
		return process(
			`.block {
				opacity(.5, true);
			}`,
			`.block {
				-webkit-backface-visibility: hidden;
				opacity: 0.5;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('opaque', () => {
	it('should output opacity: 1', () => {
		return process(
			`.block {
				opaque();
			}`,
			`.block {
				opacity: 1;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle backface visibility', () => {
		return process(
			`.block {
				opaque(true);
			}`,
			`.block {
				-webkit-backface-visibility: hidden;
				opacity: 1;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('transparent', () => {
	it('should output opacity: 0', () => {
		return process(
			`.block {
				transparent();
			}`,
			`.block {
				opacity: 0;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle backface visibility', () => {
		return process(
			`.block {
				transparent(true);
			}`,
			`.block {
				-webkit-backface-visibility: hidden;
				opacity: 0;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('font', () => {
	it('should handle a font stack', () => {
		return process(
			`.block {
				font(['Open Sans', Arial, Helvetica, Banana]);
			}`,
			`.block {
				font-family: 'Open Sans', Arial, Helvetica, Banana;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output specified values', () => {
		return process(
			`.block {
				font(['Open Sans', Arial], 10, 300, 2, italic);
			}`,
			`.block {
				font-family: 'Open Sans', Arial;
				font-size: 10rem;
				font-weight: 300;
				line-height: 2em;
				font-style: italic;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output specified values by property', () => {
		return process(
			`.block {
				font(style: italic, weight: 300, spacing: 1px);
			}`,
			`.block {
				font-family: Arial, Helvetica, sans-serif;
				font-weight: 300;
				font-style: italic;
				letter-spacing: 1px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output font family when passed in as variable', () => {
		return process(
			`.block {
				font($font.family, 10);
			}`,
			`.block {
				font-family: 'Open Sans', Arial, sans-serif;
				font-size: 10rem;
			}`,
			{ mixins: mixins },
			0,
			{ font: { family: "'Open Sans', Arial, sans-serif" } }
		);
	});
});

describe('unstyled', () => {
	it('output list-style: none', () => {
		return process(
			`.block {
				unstyled();
			}`,
			`.block {
				list-style: none;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('absolute', () => {
	it('output absolute position by default', () => {
		return process(
			`.block {
				absolute();
			}`,
			`.block {
				position: absolute;
			}`,
			{ mixins: mixins }
		);
	});

	it('output absolute position with supplied arguments', () => {
		return process(
			`.block {
				absolute(4, 3);
			}`,
			`.block {
				position: absolute;
				top: 4rem;
				right: 3rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('output absolute position with supplied arguments', () => {
		return process(
			`.block {
				absolute(4, 3, 2, 1);
			}`,
			`.block {
				position: absolute;
				top: 4rem;
				right: 3rem;
				bottom: 2rem;
				left: 1rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('output absolute position with supplied arguments with override unit', () => {
		return process(
			`.block {
				absolute(4px, 3em, 2pt, 1mm);
			}`,
			`.block {
				position: absolute;
				top: 4px;
				right: 3em;
				bottom: 2pt;
				left: 1mm;
			}`,
			{ mixins: mixins }
		);
	});

	it('output absolute position with supplied object arguments', () => {
		return process(
			`.block {
				absolute(bottom: 3, top: 4);
			}`,
			`.block {
				position: absolute;
				top: 4rem;
				bottom: 3rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('output absolute position with supplied object arguments with override unit', () => {
		return process(
			`.block {
				absolute(bottom: 3px, top: 4in);
			}`,
			`.block {
				position: absolute;
				top: 4in;
				bottom: 3px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('fixed', () => {
	it('output fixed position by default', () => {
		return process(
			`.block {
				fixed();
			}`,
			`.block {
				position: fixed;
			}`,
			{ mixins: mixins }
		);
	});

	it('output fixed position with supplied arguments', () => {
		return process(
			`.block {
				fixed(4, 3);
			}`,
			`.block {
				position: fixed;
				top: 4rem;
				right: 3rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('output fixed position with supplied arguments', () => {
		return process(
			`.block {
				fixed(4, 3, 2, 1);
			}`,
			`.block {
				position: fixed;
				top: 4rem;
				right: 3rem;
				bottom: 2rem;
				left: 1rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('output fixed position with supplied arguments with override unit', () => {
		return process(
			`.block {
				fixed(4px, 3em, 2pt, 1mm);
			}`,
			`.block {
				position: fixed;
				top: 4px;
				right: 3em;
				bottom: 2pt;
				left: 1mm;
			}`,
			{ mixins: mixins }
		);
	});

	it('output fixed position with supplied object arguments', () => {
		return process(
			`.block {
				fixed(bottom: 3, top: 4);
			}`,
			`.block {
				position: fixed;
				top: 4rem;
				bottom: 3rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('output fixed position with supplied object arguments with override unit', () => {
		return process(
			`.block {
				fixed(bottom: 3px, top: 4in);
			}`,
			`.block {
				position: fixed;
				top: 4in;
				bottom: 3px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('size', () => {
	it('should use first argument for width and height with default unit', () => {
		return process(
			`.block {
				size(100);
			}`,
			`.block {
				width: 100rem;
				height: 100rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use first argument for width and height with override unit', () => {
		return process(
			`.block {
				size(100%);
			}`,
			`.block {
				width: 100%;
				height: 100%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use arguments for width and height', () => {
		return process(
			`.block {
				size(100%, 20%);
			}`,
			`.block {
				width: 100%;
				height: 20%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('maxSize', () => {
	it('should use first argument for width and height with default unit', () => {
		return process(
			`.block {
				maxSize(100);
			}`,
			`.block {
				max-width: 100rem;
				max-height: 100rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use first argument for width and height with override unit', () => {
		return process(
			`.block {
				maxSize(100%);
			}`,
			`.block {
				max-width: 100%;
				max-height: 100%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use arguments for width and height', () => {
		return process(
			`.block {
				maxSize(100%, 20%);
			}`,
			`.block {
				max-width: 100%;
				max-height: 20%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('minSize', () => {
	it('should use first argument for width and height with default unit', () => {
		return process(
			`.block {
				minSize(100);
			}`,
			`.block {
				min-width: 100rem;
				min-height: 100rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use first argument for width and height with override unit', () => {
		return process(
			`.block {
				minSize(100%);
			}`,
			`.block {
				min-width: 100%;
				min-height: 100%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use arguments for width and height', () => {
		return process(
			`.block {
				minSize(100%, 20%);
			}`,
			`.block {
				min-width: 100%;
				min-height: 20%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('square', () => {
	it('should use argument for width and height', () => {
		return process(
			`.block {
				square(100px);
			}`,
			`.block {
				height: 100px;
				width: 100px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use argument for width and height with default unit', () => {
		return process(
			`.block {
				square(10);
			}`,
			`.block {
				height: 10rem;
				width: 10rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('ratio', () => {
	describe('with keyword', () => {
		it('should output default values', () => {
			return process(
				stripIndent`
					.block {
						ratio(embed);
					}
				`,
				stripIndent`
					.block {
						overflow: hidden;
						position: relative;
						&:before {
							content: '';
							display: block;
							height: 0;
							padding-top: 56.25%
						}
					}
				`,
				{ mixins: mixins }
			);
		});

		it('should handle ratio', () => {
			return process(
				stripIndent`
					.block {
						ratio(embed, 4/3);
					}
				`,
				stripIndent`
					.block {
						overflow: hidden;
						position: relative;
						&:before {
							content: '';
							display: block;
							height: 0;
							padding-top: 75%
						}
					}
				`,
				{ mixins: mixins }
			);
		});
	});

	describe('without keyword', () => {
		it('should output default values', () => {
			return process(
				`.block {
					ratio();
				}`,
				`.block {
					display: block;
					height: 0;
					padding-top: 56.25%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle ratio', () => {
			return process(
				`.block {
					ratio(4/3);
				}`,
				`.block {
					display: block;
					height: 0;
					padding-top: 75%;
				}`,
				{ mixins: mixins }
			);
		});
	});
});

describe('circle', () => {
	it('should handle diameter', () => {
		return process(
			`.block {
				circle(.5);
			}`,
			`.block {
				height: 0.5rem;
				width: 0.5rem;
				display: block;
				background-clip: border-box;
				border-radius: 0.25rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle diameter and crop', () => {
		return process(
			`.block {
				circle(.5, true);
			}`,
			`.block {
				height: 0.5rem;
				width: 0.5rem;
				display: block;
				background-clip: border-box;
				border-radius: 0.25rem;
				overflow: hidden;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				circle(.5, display: inline);
			}`,
			`.block {
				height: 0.5rem;
				width: 0.5rem;
				display: inline-block;
				background-clip: border-box;
				border-radius: 0.25rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('bold', () => {
	it('should output font-weight with default bold font weight', () => {
		return process(
			`.block {
				bold();
			}`,
			`.block {
				font-weight: bold;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('italic', () => {
	it('should output italic font', () => {
		return process(
			`.block {
				italic();
			}`,
			`.block {
				font-style: italic;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('background', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				background();
			}`,
			`.block {
				background: #fff;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output a string', () => {
		return process(
			`.block {
				background('this is a string');
			}`,
			`.block {
				background: 'this is a string';
			}`,
			{ mixins: mixins }
		);
	});

	it('should output opacity as second parameter', () => {
		return process(
			`.block {
				background(#fff, .4);
				background(blue, .5);
			}`,
			`.block {
				background: rgba(255, 255, 255, 0.4);
				background: rgba(0, 0, 255, 0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output opacity as second parameter as a percentage', () => {
		return process(
			`.block {
				background(#fff, 40%);
			}`,
			`.block {
				background: rgba(255, 255, 255, 0.4);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output url() as second parameter', () => {
		return process(
			`.block {
				background(#fff, url('../path/file.ext'));
			}`,
			`.block {
				background: #fff url('../path/file.ext');
			}`,
			{ mixins: mixins }
		);
	});

	it('should output url() as second parameter with default file path', () => {
		return process(
			`.block {
				background(#fff, 'test.jpg');
			}`,
			`.block {
				background: #fff url('../images/test.jpg');
			}`,
			{ mixins: mixins }
		);
	});

	it('should output x position as third parameter', () => {
		return process(
			`.block {
				background(#fff, 'test.jpg', center);
			}`,
			`.block {
				background: #fff url('../images/test.jpg') center;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output y position as forth parameter', () => {
		return process(
			`.block {
				background(#fff, 'test/test.jpg', center, center);
			}`,
			`.block {
				background: #fff url('../images/test/test.jpg') center center;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output repeat as fifth parameter', () => {
		return process(
			`.block {
				background(#fff, 'test.jpg', center, center, no-repeat);
			}`,
			`.block {
				background: #fff url('../images/test.jpg') center center no-repeat;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output attachment as sixth parameter', () => {
		return process(
			`.block {
				background(#fff, 'test.jpg', center, center, no-repeat, fixed);
			}`,
			`.block {
				background: #fff url('../images/test.jpg') center center no-repeat fixed;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('backgroundGradient', () => {
	describe('with keyword', () => {
		it('should handle dark', () => {
			return process(
				`.block {
					backgroundGradient(dark);
				}`,
				`.block {
					background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle light with angle', () => {
			return process(
				`.block {
					backgroundGradient(light, angle: 45);
				}`,
				`.block {
					background: linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
				}`,
				{ mixins: mixins }
			);
		});
	});

	describe('without keyword', () => {
		it('should output default values', () => {
			return process(
				`.block {
				backgroundGradient();
			}`,
				`.block {
				background-color: gray;
				background: linear-gradient(180deg, rgba(0, 0, 0, .8), rgba(0, 0, 0, .2));
			}`,
				{ mixins: mixins }
			);
		});

		it('should handle color and angle', () => {
			return process(
				`.block {
					backgroundGradient(blue, angle: 90);
				}`,
				`.block {
					background-color: blue;
					background: linear-gradient(90deg, rgba(0, 0, 0, .8), rgba(0, 0, 0, .2));
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle key value pairs', () => {
			return process(
				`.block {
					backgroundGradient(angle: 90, end: rgba(0, 0, 0, 0));
				}`,
				`.block {
					background-color: gray;
					background: linear-gradient(90deg, rgba(0, 0, 0, .8), rgba(0, 0, 0, 0));
				}`,
				{ mixins: mixins }
			);
		});
	});
});

describe('backgroundImage', () => {
	it('should handle filename', () => {
		return process(
			`.block {
				backgroundImage(foo.jpg);
			}`,
			`.block {
				background-image: url('../images/foo.jpg');
				background-repeat: no-repeat;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle filename with position', () => {
		return process(
			`.block {
				backgroundImage(foo.jpg, position: 10% 25%);
			}`,
			`.block {
				background-image: url('../images/foo.jpg');
				background-repeat: no-repeat;
				background-position: 10% 25%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle filename with size', () => {
		return process(
			`.block {
				backgroundImage(foo.jpg, size: cover);
			}`,
			`.block {
				background-image: url('../images/foo.jpg');
				background-repeat: no-repeat;
				background-size: cover;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				backgroundImage(size: cover, foo.jpg, repeat-x, attachment: fixed);
			}`,
			`.block {
				background-image: url('../images/foo.jpg');
				background-repeat: repeat-x;
				background-size: cover;
				background-attachment: fixed;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('border', () => {
	it('should output default properties if no args are supplied', () => {
		return process(
			`.block {
				border();
			}`,
			`.block {
				border: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output default properties with supplied color', () => {
		return process(
			`.block {
				border(#000);
			}`,
			`.block {
				border: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle width, style, and color arguments', () => {
		return process(
			`.block {
				border(black, 1px, solid);
			}`,
			`.block {
				border: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top border with default properties', () => {
		return process(
			`.block {
				border(top);
			}`,
			`.block {
				border-top: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left border with default properties', () => {
		return process(
			`.block {
				border(left);
			}`,
			`.block {
				border-left: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output horizontal borders with default properties', () => {
		return process(
			`.block {
				border(horizontal);
			}`,
			`.block {
				border-left: 1px solid #bfbfbf;
				border-right: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output vertical borders with default properties', () => {
		return process(
			`.block {
				border(vertical);
			}`,
			`.block {
				border-top: 1px solid #bfbfbf;
				border-bottom: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left border with supplied color', () => {
		return process(
			`.block {
				border(left, #000);
			}`,
			`.block {
				border-left: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top border with supplied color', () => {
		return process(
			`.block {
				border(top, #000);
			}`,
			`.block {
				border-top: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output horizontal border with supplied color', () => {
		return process(
			`.block {
				border(horizontal, #000);
			}`,
			`.block {
				border-left: 1px solid #000;
				border-right: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top border with supplied parameters', () => {
		return process(
			`.block {
				border(top, black, 1px, solid);
			}`,
			`.block {
				border-top: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top and bottom border with supplied parameters', () => {
		return process(
			`.block {
				border(vertical, black, 1px, solid);
			}`,
			`.block {
				border-top: 1px solid black;
				border-bottom: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top and bottom border with supplied parameters', () => {
		return process(
			`.block {
				border(black, style: dotted);
			}`,
			`.block {
				border: 1px dotted black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output default params when not provided', () => {
		return process(
			`.block {
				border(blue);
				border(width: $border.width, style: dotted);
			}`,
			`.block {
				border: 1px solid blue;
				border: 1px dotted #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should return border: none if first param is false, 0, none', () => {
		return process(
			`.block {
				border(false);
				border(0);
				border(none);
			}`,
			`.block {
				border: none;
				border: none;
				border: none;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('borderImage', () => {
	it('should output filename with default values', () => {
		return process(
			`.block {
				borderImage(foo.jpg);
			}`,
			`.block {
				border-image: url('../images/foo.jpg') 100% 1 0 stretch;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output nothing when no values are passed', () => {
		return process(
			`.block {
				borderImage();
			}`,
			`.block {
			}`,
			{ mixins: mixins }
		);
	});

	it('should output provided values', () => {
		return process(
			`.block {
				borderImage(foo.jpg, 50%, 3);
			}`,
			`.block {
				border-image: url('../images/foo.jpg') 50% 3 0 stretch;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				borderImage(foo.jpg, outset: 1.5, repeat: round);
			}`,
			`.block {
				border-image: url('../images/foo.jpg') 100% 1 1.5 round;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('triangle', () => {
	it('should handle up keyword', () => {
		return process(
			`.block {
				triangle(up);
			}`,
			`.block {
				content: '';
				height: 0;
				width: 0;
				border-left: 5px solid transparent;
				border-right: 5px solid transparent;
				border-bottom: 5px solid #737373;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle left keyword with color and size values', () => {
		return process(
			`.block {
				triangle(left, blue, 2px);
			}`,
			`.block {
				content: '';
				height: 0;
				width: 0;
				border-top: 2px solid transparent;
				border-bottom: 2px solid transparent;
				border-right: 2px solid blue;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				triangle(right, size: 3px, width: 4px);
			}`,
			`.block {
				content: '';
				height: 0;
				width: 0;
				border-top: 4px solid transparent;
				border-bottom: 4px solid transparent;
				border-left: 3px solid #737373;
			}`,
			{ mixins: mixins }
		);
	});
});

// Note: Generated rules will not add semi-colon to last declaration.
// This is supported by the CSS spec.
describe('clearfix', () => {
	it('should output a nested selector', () => {
		return process(
			`.block { clearfix(); }`,
			`.block { &:after { clear: both; content: ''; display: block } }`,
			{ mixins: mixins }
		);
	});
});

describe('row', () => {
	it('should output margins with clearfix', () => {
		return process(
			`.block { row(); }`,
			`.block { margin-left: -5%; max-width: 105%; &:after { clear: both; content: ''; display: block } }`,
			{ mixins: mixins }
		);
	});

	it('should output margins with clearfix with override value', () => {
		return process(
			`.block { row(10%); }`,
			`.block { margin-left: -10%; max-width: 110%; &:after { clear: both; content: ''; display: block } }`,
			{ mixins: mixins }
		);
	});
});

describe('rowModify', () => {
	it('should output override margins', () => {
		return process(
			`.block {
				rowModify();
			}`,
			`.block {
				margin-left: -5%;
				max-width: 105%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output override margins with override value', () => {
		return process(
			`.block {
				rowModify(10);
			}`,
			`.block {
				margin-left: -10%;
				max-width: 110%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('rowReset', () => {
	it('should output reset', () => {
		return process(
			`.block {
				rowReset();
			}`,
			`.block {
				margin-left: 0;
				max-width: none;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('inlineColumn', () => {
	describe('with keyword', () => {
		it('should output share with default values', () => {
			return process(
				`.block {
					inlineColumn(spaced, 1);
				}`,
				`.block {
					display: inline-block;
					vertical-align: top;
					margin-left: 5%;
					width: 7.5%;
					letter-spacing: normal;
				}`,
				{ mixins: mixins }
			);
		});

		it('should output provided values', () => {
			return process(
				`.block {
					inlineColumn(spaced, 1, 3, 4%, true);
				}`,
				`.block {
					display: inline-block;
					vertical-align: top;
					margin-left: 4%;
					width: 29.333333333333332%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle key value pairs', () => {
			return process(
				`.block {
					inlineColumn(spaced, 1, margin: 4%, spaceless: true, columns: 3);
				}`,
				`.block {
					display: inline-block;
					vertical-align: top;
					margin-left: 4%;
					width: 29.333333333333332%;
				}`,
				{ mixins: mixins }
			);
		});
	});

	describe('without keyword', () => {
		it('should output share with default values', () => {
			return process(
				`.block {
					inlineColumn(1);
				}`,
				`.block {
					display: inline-block;
					vertical-align: top;
					width: 12.5%;
					margin-right: -.32em;
				}`,
				{ mixins: mixins }
			);
		});

		it('should output provided values', () => {
			return process(
				`.block {
					inlineColumn(1, 3, true);
				}`,
				`.block {
					display: inline-block;
					vertical-align: top;
					width: 33.33333333333333%;
				}`,
				{ mixins: mixins }
			);
		});

		// TODO: This test passes despite the value of spaceless
		it('should handle key value pairs', () => {
			return process(
				`.block {
					inlineColumn(2, columns: 4, spaceless: false);
				}`,
				`.block {
					display: inline-block;
					vertical-align: top;
					width: 50%;
				}`,
				{ mixins: mixins }
			);
		});
	});
});

describe('inlineRow', () => {
	it('should output default values', () => {
		return process(
			`.block {
				inlineRow();
			}`,
			`.block {
				margin-left: -5%;
				max-width: 105%;
				letter-spacing: -.32em;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output provided values', () => {
		return process(
			`.block {
				inlineRow(4%, true);
			}`,
			`.block {
				margin-left: -4%;
				max-width: 104%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				inlineRow(spaceless: true, margin: 6%);
			}`,
			`.block {
				margin-left: -6%;
				max-width: 106%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('prefix', () => {
	it('should output default values', () => {
		return process(
			stripIndent`
				.block {
					prefix();
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: '-';
						margin-right: .5em
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should output provided values', () => {
		return process(
			stripIndent`
				.block {
					prefix(~, 2, foo, blue);
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: '~';
						margin-right: 2rem;
						font-family: foo;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle attr function', () => {
		return process(
			stripIndent`
				.block {
					prefix(attr(data-attr), 2, foo, blue);
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: attr(data-attr);
						margin-right: 2rem;
						font-family: foo;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			stripIndent`
				.block {
					prefix(~, color: blue);
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: '~';
						margin-right: .5em;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('suffix', () => {
	it('should output default values', () => {
		return process(
			stripIndent`
				.block {
					suffix();
				}
			`,
			stripIndent`
				.block {
					&:after {
						content: '-';
						margin-left: .5em
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should output provided values', () => {
		return process(
			stripIndent`
				.block {
					suffix(~, 2, foo, blue);
				}
			`,
			stripIndent`
				.block {
					&:after {
						content: '~';
						margin-left: 2rem;
						font-family: foo;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle attr function', () => {
		return process(
			stripIndent`
				.block {
					suffix(attr(data-attr), 2, foo, blue);
				}
			`,
			stripIndent`
				.block {
					&:after {
						content: attr(data-attr);
						margin-left: 2rem;
						font-family: foo;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			stripIndent`
				.block {
					suffix(~, color: blue);
				}
			`,
			stripIndent`
				.block {
					&:after {
						content: '~';
						margin-left: .5em;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('bookends', () => {
	it('should output default values', () => {
		return process(
			stripIndent`
				.block {
					bookends();
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: '-';
						margin-right: .5em
					}
					&:after {
						content: '-';
						margin-left: .5em
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should output provided values', () => {
		return process(
			stripIndent`
				.block {
					bookends(~, 2, foo, blue);
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: '~';
						margin-right: 2rem;
						font-family: foo;
						color: blue
					}
					&:after {
						content: '~';
						margin-left: 2rem;
						font-family: foo;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle attr function', () => {
		return process(
			stripIndent`
				.block {
					bookends(attr(data-attr));
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: attr(data-attr);
						margin-right: .5em
					}
					&:after {
						content: attr(data-attr);
						margin-left: .5em
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			stripIndent`
				.block {
					bookends(~, color: blue);
				}
			`,
			stripIndent`
				.block {
					&:before {
						content: '~';
						margin-right: .5em;
						color: blue
					}
					&:after {
						content: '~';
						margin-left: .5em;
						color: blue
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('column', () => {
	it('should output default width', () => {
		return process(
			`.block {
				column();
			}`,
			`.block {
				float: left;
				width: 100%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output override width', () => {
		return process(
			`.block {
				column(50%);
			}`,
			`.block {
				float: left;
				width: 50%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share', () => {
		return process(
			`.block {
				column(1);
			}`,
			`.block {
				float: left;
				width: 12.5%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share with grid column count', () => {
		return process(
			`.block {
				column(1, 2);
			}`,
			`.block {
				float: left;
				width: 50%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share with grid column count with default grid margin', () => {
		return process(
			`.block {
				column(spaced, 1, 2);
			}`,
			`.block {
				float: left;
				margin-left: 5%;
				width: 45%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share with grid column count with override grid margin', () => {
		return process(
			`.block {
				column(spaced, 1, 2, 10%);
			}`,
			`.block {
				float: left;
				margin-left: 10%;
				width: 40%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('columnModify', () => {
	describe('with keyword', () => {
		it('should handle share amount', () => {
			return process(
				`.block {
					columnModify(spaced, 2);
				}`,
				`.block {
					margin-left: 5%;
					width: 20%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle share and columns count', () => {
			return process(
				`.block {
					columnModify(spaced, 2, 4);
				}`,
				`.block {
					margin-left: 5%;
					width: 45%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle key value pairs', () => {
			return process(
				`.block {
					columnModify(spaced, 3, margin: 4%);
				}`,
				`.block {
					margin-left: 4%;
					width: 33.5%;
				}`,
				{ mixins: mixins }
			);
		});
	});

	describe('without keyword', () => {
		it('should handle share and columns count', () => {
			return process(
				`.block {
					columnModify(2, 4);
				}`,
				`.block {
					width: 50%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle key value pairs', () => {
			return process(
				`.block {
					columnModify(columns: 3, 2);
				}`,
				`.block {
					width: 66.66666666666666%;
				}`,
				{ mixins: mixins }
			);
		});
	});
});

describe('columnOffset', () => {
	describe('with keyword', () => {
		it('should handle share amount', () => {
			return process(
				`.block {
					columnOffset(spaced, 1);
				}`,
				`.block {
					margin-left: 17.5%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle share and margin', () => {
			return process(
				`.block {
					columnOffset(spaced, 1, margin: 6%);
				}`,
				`.block {
					margin-left: 24.5%;
				}`,
				{ mixins: mixins }
			);
		});

		it('should handle key value pairs', () => {
			return process(
				`.block {
					columnOffset(spaced, columns: 3, share: 1);
				}`,
				`.block {
					margin-left: 38.33333333333333%;
				}`,
				{ mixins: mixins }
			);
		});
	});

	describe('without keyword', () => {
		it('should handle share and column', () => {
			return process(
				`.block {
				columnOffset(3, 4);
			}`,
				`.block {
				margin-left: 75%;
			}`,
				{ mixins: mixins }
			);
		});

		it('should handle key value pairs', () => {
			return process(
				`.block {
					columnOffset(columns: 3, share: 1);
				}`,
				`.block {
					margin-left: 33.33333333333333%;
				}`,
				{ mixins: mixins }
			);
		});
	});
});

describe('columnPull', () => {
	it('should handle share amount', () => {
		return process(
			`.block {
				columnPull(2);
			}`,
			`.block {
				position: relative;
				right: 25%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				columnPull(columns: 4, share: 2);
			}`,
			`.block {
				position: relative;
				right: 50%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('columnPush', () => {
	it('should handle share amount', () => {
		return process(
			`.block {
				columnPush(2);
			}`,
			`.block {
				left: 25%;
				position: relative;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				columnPush(columns: 4, share: 2);
			}`,
			`.block {
				left: 50%;
				position: relative;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('columnReset', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				columnReset();
			}`,
			`.block {
				float: none;
				width: auto;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle resetting margin', () => {
		return process(
			`.block {
				columnReset(true);
			}`,
			`.block {
				float: none;
				width: auto;
				margin-left: 0;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('boxSizing', () => {
	it('should output default value', () => {
		return process(
			`.block {
				boxSizing();
			}`,
			`.block {
				box-sizing: border-box;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('columns', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				columns();
			}`,
			`.block {
				column-count: 2;
				column-rule-width: 1px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided arguments', () => {
		return process(
			`.block {
				columns(3, 3px, hidden, medium);
			}`,
			`.block {
				column-count: 3;
				column-gap: 3px;
				column-rule-style: hidden;
				column-rule-width: medium;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			`.block {
				columns(gap: 3px, count: 3);
			}`,
			`.block {
				column-count: 3;
				column-gap: 3px;
				column-rule-width: 1px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle different argument types', () => {
		return process(
			`.block {
				columns(3, style: dotted);
			}`,
			`.block {
				column-count: 3;
				column-rule-style: dotted;
				column-rule-width: 1px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('containerMinWidth', () => {
	it('should add min-width to html and body if min width not 0', () => {
		let newVars = vars();

		newVars.width.min = '100px';

		return process(
			`containerMinWidth();`,
			`html, body {\n    min-width: 100px\n}`,
			{ mixins: mix(newVars) }
		);
	});

	it('should not add anything if min width is 0', () => {
		let newVars = vars();

		newVars.width.min = 0;

		return process(`containerMinWidth();`, ``, { mixins: mix(newVars) });
	});
});

describe('rounded', () => {
	it('should set border radius to default value', () => {
		return process(
			`.block {
				rounded();
			}`,
			`.block {
				background-clip: border-box;
				border-radius: 3px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set border radius', () => {
		return process(
			`.block {
				rounded(4px);
			}`,
			`.block {
				background-clip: border-box;
				border-radius: 4px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set top corners to default value', () => {
		return process(
			`.block {
				rounded(top);
			}`,
			`.block {
				background-clip: border-box;
				border-top-left-radius: 3px;
				border-top-right-radius: 3px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set left border radius', () => {
		return process(
			`.block {
				rounded(left, 4px);
			}`,
			`.block {
				background-clip: border-box;
				border-top-left-radius: 4px;
				border-bottom-left-radius: 4px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set right border radius to default', () => {
		return process(
			`.block {
				rounded(right);
			}`,
			`.block {
				background-clip: border-box;
				border-top-right-radius: 3px;
				border-bottom-right-radius: 3px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should not add any declarations', () => {
		return process(
			`.block {
				rounded(false);
			}`,
			`.block {
			}`,
			{ mixins: mixins }
		);
	});

	it('should set bottom border radius', () => {
		return process(
			`.block {
				rounded(bottom);
			}`,
			`.block {
				background-clip: border-box;
				border-bottom-left-radius: 3px;
				border-bottom-right-radius: 3px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('padding', () => {
	it('should set horizontal padding', () => {
		return process(
			`.block {
				padding(horizontal, 10, 50px);
			}`,
			`.block {
				padding-left: 10rem;
				padding-right: 50px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set horizontal padding with single value provided', () => {
		return process(
			`.block {
				padding(horizontal, 10);
			}`,
			`.block {
				padding-left: 10rem;
				padding-right: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set vertical padding', () => {
		return process(
			`.block {
				padding(vertical, 5, 50px);
			}`,
			`.block {
				padding-top: 5rem;
				padding-bottom: 50px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should accept key: value pairs', () => {
		return process(
			`.block {
				padding(left: 20px, top: 5);
			}`,
			`.block {
				padding-top: 5rem;
				padding-left: 20px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('margin', () => {
	it('should set horizontal margins', () => {
		return process(
			`.block {
				margin(horizontal, 10, 50px);
			}`,
			`.block {
				margin-left: 10rem;
				margin-right: 50px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set horizontal margins with single value provided', () => {
		return process(
			`.block {
				margin(horizontal, 10);
			}`,
			`.block {
				margin-left: 10rem;
				margin-right: 10rem;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set vertical margin', () => {
		return process(
			`.block {
				margin(vertical, 5, 50px);
			}`,
			`.block {
				margin-top: 5rem;
				margin-bottom: 50px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should accept key: value pairs', () => {
		return process(
			`.block {
				margin(left: 20px, top: 5);
			}`,
			`.block {
				margin-top: 5rem;
				margin-left: 20px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('heading', () => {
	it('should generate base styling for headings', () => {
		return process(
			stripIndent`
				.block {
					heading();
				}
			`,
			stripIndent`
				.block {
					color: inherit;
					font-family: Tahoma, Geneva, sans-serif;
					font-weight: bold;
					line-height: 1.4em;
					margin-bottom: 2rem;
					small {
						font-weight: normal
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('placeholder', () => {
	it('should output declaration with default value', () => {
		return process(
			stripIndent`
				.block {
					placeholder();
				}
			`,
			stripIndent`
				.block {
					&:-moz-placeholder {
						color: #bfbfbf
					}
					&::-moz-placeholder {
						color: #bfbfbf
					}
					&:-ms-input-placeholder {
						color: #bfbfbf
					}
					&::-webkit-input-placeholder {
						color: #bfbfbf
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should set placeholder color to value', () => {
		return process(
			stripIndent`
				.block {
					placeholder(#fff);
				}
			`,
			stripIndent`
				.block {
					&:-moz-placeholder {
						color: #fff
					}
					&::-moz-placeholder {
						color: #fff
					}
					&:-ms-input-placeholder {
						color: #fff
					}
					&::-webkit-input-placeholder {
						color: #fff
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('resizable', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				resizable();
			}`,
			`.block {
				overflow: hidden;
				resize: both;
			}`,
			{ mixins: mixins }
		);
	});

	it('should set resize to value provided', () => {
		return process(
			`.block {
				resizable(vertical);
			}`,
			`.block {
				overflow: hidden;
				resize: vertical;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('transition', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				transition();
			}`,
			`.block {
				transition: all 0.2s ease-in-out 0s;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle ordered input [property, duration, timing, delay]', () => {
		return process(
			`.block {
				transition(background-color, 0.1s, ease-in, 1s);
			}`,
			`.block {
				transition: background-color 0.1s ease-in 1s;
			}`,
			{ mixins: mixins }
		);
	});

	it('should use default values when partial ordered input is provided', () => {
		return process(
			`.block {
				transition(background-color);
			}`,
			`.block {
				transition: background-color 0.2s ease-in-out 0s;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle key: value pairs', () => {
		return process(
			`.block {
				transition(easing: linear, duration: 0.3s);
			}`,
			`.block {
				transition: all 0.3s linear 0s;
			}`,
			{ mixins: mixins }
		);
	});

	it('should not output when first argument is false', () => {
		return process(
			`.block {
				transition(false);
			}`,
			`.block {
			}`,
			{ mixins: mixins }
		);
	});

	it('should output transition: none when first argument is none', () => {
		return process(
			`.block {
				transition(none);
			}`,
			`.block {
				transition: none;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('_codeBlockDefaults', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				_codeBlockDefaults();
			}`,
			`.block {
				overflow: auto;
				white-space: pre;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output border: none when first argument is not false', () => {
		return process(
			`.block {
				_codeBlockDefaults('#fff');
			}`,
			`.block {
				border: none;
				overflow: auto;
				white-space: pre;
			}`,
			{ mixins: mixins }
		);
	});

	it('should not output border: none when first argument is false', () => {
		return process(
			`.block {
				_codeBlockDefaults(false);
			}`,
			`.block {
				overflow: auto;
				white-space: pre;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output alternate properties when second argument is true', () => {
		return process(
			`.block {
				_codeBlockDefaults('#fff', true);
			}`,
			`.block {
				border: none;
				white-space: pre-wrap;
				word-wrap: break-word;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('_containerPadding', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				_containerPadding();
			}`,
			`.block {
				padding-left: 6%;
				padding-right: 6%;
			}`,
			{mixins: mixins}
		);
	});

	it('should not output when bumper.enabled is false', () => {
		let newVars = vars();
		newVars.bumper.enabled = false;

		return process(
			`.block {
				_containerPadding();
			}`,
			`.block {
			}`,
			{mixins: mix(newVars)}
		);
	});
});

describe('columns', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				columns();
			}`,
			`.block {
				column-count: 2;
				column-rule-width: 1px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('shadow', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				shadow();
			}`,
			`.block {
				box-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.2);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output a dark shadow using the provided opacity when using the dark keyword', () => {
		return process(
			`.block {
				shadow(dark, 0.5);
			}`,
			`.block {
				box-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output a light shadow using the provided opacity when using the light keyword', () => {
		return process(
			`.block {
				shadow(light, 0.5);
			}`,
			`.block {
				box-shadow: 1px 1px 0 0 rgba(255, 255, 255, 0.5);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('textShadow', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				textShadow();
			}`,
			`.block {
				text-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.2);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output a dark text-shadow using the provided opacity when using the dark keyword', () => {
		return process(
			`.block {
				textShadow(dark, 0.5);
			}`,
			`.block {
				text-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output a light text-shadow using the provided opacity when using the light keyword', () => {
		return process(
			`.block {
				textShadow(light, 0.5);
			}`,
			`.block {
				text-shadow: 1px 1px 0 0 rgba(255, 255, 255, 0.5);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('flex', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				flex();
			}`,
			`.block {
				flex-grow: 0;
				flex-shrink: 0;
				flex-basis: auto;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('flexContainer', () => {
	it('should output declaration with default values', () => {
		return process(
			`.block {
				flexContainer();
			}`,
			`.block {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				justify-content: flex-start;
				align-items: stretch;
				align-content: stretch;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('filter', () => {
	it('should output declaration with provided value', () => {
		return process(
			`.block {
				filter(blur(2px));
			}`,
			`.block {
				filter: blur(2px);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('blur', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				blur();
			}`,
			`.block {
				filter: blur(2px);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				blur(5px);
			}`,
			`.block {
				filter: blur(5px);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('brightness', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				brightness();
			}`,
			`.block {
				filter: brightness(0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				brightness(0.2);
			}`,
			`.block {
				filter: brightness(0.2);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('contrast', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				contrast();
			}`,
			`.block {
				filter: contrast(1.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				contrast(1.25);
			}`,
			`.block {
				filter: contrast(1.25);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('grayscale', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				grayscale();
			}`,
			`.block {
				filter: grayscale(1);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				grayscale(0.6);
			}`,
			`.block {
				filter: grayscale(0.6);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('hueRotate', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				hueRotate();
			}`,
			`.block {
				filter: hue-rotate(180deg);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				hueRotate(90deg);
			}`,
			`.block {
				filter: hue-rotate(90deg);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('invert', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				invert();
			}`,
			`.block {
				filter: invert(1);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				invert(0.8);
			}`,
			`.block {
				filter: invert(0.8);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('saturate', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				saturate();
			}`,
			`.block {
				filter: saturate(0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				saturate(0.8);
			}`,
			`.block {
				filter: saturate(0.8);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('sepia', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				sepia();
			}`,
			`.block {
				filter: sepia(0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided value', () => {
		return process(
			`.block {
				sepia(0.8);
			}`,
			`.block {
				filter: sepia(0.8);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('dropShadow', () => {
	it('should output declaration with default value', () => {
		return process(
			`.block {
				dropShadow();
			}`,
			`.block {
				filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.2));
			}`,
			{ mixins: mixins }
		);
	});

	it('should output declaration with provided object values', () => {
		return process(
			`.block {
				dropShadow(color: blue, x: 2px, blur: 1px);
			}`,
			`.block {
				filter: drop-shadow(2px 1px 1px blue);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('loadFont', () => {
	it('should output declaration with provided object values', () => {
		return process(
			stripIndent`
				.block {
					loadFont(foo);
				}
			`,
			stripIndent`
				.block {
					@font-face {
						font-family: foo;
						font-weight: normal;
						font-style: normal;
						src: url('../fonts/foo.woff2'), url('../fonts/foo.woff'), url('../fonts/foo.ttf')
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('ellipsis', () => {
	it('should output default values', () => {
		return process(
			`.block {
				ellipsis();
			}`,
			`.block {
				overflow-x: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle max-width', () => {
		return process(
			`.block {
				ellipsis(800px);
			}`,
			`.block {
				overflow-x: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 800px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle max-width with default unit', () => {
		return process(
			`.block {
				ellipsis(80);
			}`,
			`.block {
				overflow-x: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 80rem;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('noClear', () => {
	it('should output default values', () => {
		return process(
			stripIndent`
				.block {
					noClear();
				}
			`,
			stripIndent`
				.block {
					&::-ms-clear {
						display: none
					}
					&::-webkit-search-cancel-button {
						-webkit-appearance: none
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('fill', () => {
	it('should output default values', () => {
		return process(
			`.block {
				fill();
			}`,
			`.block {
				height: 100%;
				width: 100%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('hideText', () => {
	it('should output default values', () => {
		return process(
			`.block {
				hideText();
			}`,
			`.block {
				overflow: hidden;
				text-indent: 110%;
				white-space: nowrap;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('selection', () => {
	it('should output default values', () => {
		return process(
			stripIndent`
				.block {
					selection();
				}
			`,
			stripIndent`
				.block {
					&::selection {
						background: #349bb9;
						color: #fff;
						text-shadow: none
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle color and background', () => {
		return process(
			stripIndent`
				.block {
					selection(#000, #fff);
				}
			`,
			stripIndent`
				.block {
					&::selection {
						background: #fff;
						color: #000;
						text-shadow: none
					}
				}
			`,
			{ mixins: mixins }
		);
	});

	it('should handle key value pairs', () => {
		return process(
			stripIndent`
				.block {
					selection(background: #fff, color: #000);
				}
			`,
			stripIndent`
				.block {
					&::selection {
						background: #fff;
						color: #000;
						text-shadow: none
					}
				}
			`,
			{ mixins: mixins }
		);
	});
});

describe('crop', () => {
	it('should output default value', () => {
		return process(
			`.block {
				crop();
			}`,
			`.block {
				overflow: hidden;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle horizontal keyword', () => {
		return process(
			`.block {
				crop(horizontal);
			}`,
			`.block {
				overflow-x: hidden;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle vertical keyword', () => {
		return process(
			`.block {
				crop(vertical);
			}`,
			`.block {
				overflow-y: hidden;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('scroll', () => {
	it('should output default value', () => {
		return process(
			`.block {
				scroll();
			}`,
			`.block {
				overflow: scroll;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle horizontal keyword', () => {
		return process(
			`.block {
				scroll(horizontal);
			}`,
			`.block {
				overflow-x: scroll;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle vertical keyword', () => {
		return process(
			`.block {
				scroll(vertical);
			}`,
			`.block {
				overflow-y: scroll;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('rotate', () => {
	it('should output default value', () => {
		return process(
			`.block {
				rotate();
			}`,
			`.block {
				transform: rotate(45deg);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle numbers', () => {
		return process(
			`.block {
				rotate(90);
				rotate(-90);
			}`,
			`.block {
				transform: rotate(90deg);
				transform: rotate(-90deg);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('scale', () => {
	it('should output default value', () => {
		return process(
			`.block {
				scale();
			}`,
			`.block {
				transform: scale(1);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle numbers', () => {
		return process(
			`.block {
				scale(.5);
			}`,
			`.block {
				transform: scale(0.5);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle keywords', () => {
		return process(
			`.block {
				scale(x);
				scale(y, .5);
			}`,
			`.block {
				transform: scaleX(1);
				transform: scaleY(0.5);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('skew', () => {
	it('should handle keywords with default values', () => {
		return process(
			`.block {
				skew(x);
				skew(y);
			}`,
			`.block {
				transform: skewX(45deg);
				transform: skewY(45deg);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle keywords with provided values', () => {
		return process(
			`.block {
				skew(x, 60);
				skew(y, 60deg);
			}`,
			`.block {
				transform: skewX(60deg);
				transform: skewY(60deg);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle x and y values', () => {
		return process(
			`.block {
				skew(45, 60);
			}`,
			`.block {
				transform: skew(45deg, 60deg);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('translate', () => {
	it('should output default values', () => {
		return process(
			`.block {
				translate();
			}`,
			`.block {
				transform: translate(0, 0);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle keywords', () => {
		return process(
			`.block {
				translate(x, 50%);
				translate(x, -50%);
				translate(y, 5rem);
				translate(z, 15px);
			}`,
			`.block {
				transform: translateX(50%);
				transform: translateX(-50%);
				transform: translateY(5rem);
				transform: translateZ(15px);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle provided values', () => {
		return process(
			`.block {
				translate(25%);
				translate(-50%, -50%);
				translate(10%, 10%, 10%);
			}`,
			`.block {
				transform: translate(25%, 0);
				transform: translate(-50%, -50%);
				transform: translate3d(10%, 10%, 10%);
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle named arguments', () => {
		return process(
			`.block {
				translate(x: 5%);
				translate(y: 5%);
				translate(z: 5%);
				translate(z: 3%, x: 1%);
				translate(y: 2%, x: 1%);
				translate(y: 2%, x: 1%, z: 3%);
			}`,
			`.block {
				transform: translate(5%, 0);
				transform: translate(0, 5%);
				transform: translate3d(0, 0, 5%);
				transform: translate3d(1%, 0, 3%);
				transform: translate(1%, 2%);
				transform: translate3d(1%, 2%, 3%);
			}`,
			{ mixins: mixins }
		);
	});
});

describe('underline', () => {
	it('should output default value', () => {
		return process(
			`.block {
				underline();
			}`,
			`.block {
				text-decoration: underline;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle style with default color', () => {
		return process(
			`.block {
				underline(wavy);
			}`,
			`.block {
				text-decoration: inherit wavy underline;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle style with color', () => {
		return process(
			`.block {
				underline(wavy, red);
			}`,
			`.block {
				text-decoration: red wavy underline;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle named arguments', () => {
		return process(
			`.block {
				underline(color: red, style: wavy);
			}`,
			`.block {
				text-decoration: red wavy underline;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('lineThrough', () => {
	it('should output default values', () => {
		return process(
			`.block {
				lineThrough();
			}`,
			`.block {
				text-decoration: line-through;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('wrap', () => {
	it('should output default value', () => {
		return process(
			`.block {
				wrap();
			}`,
			`.block {
				white-space: normal;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('noWrap', () => {
	it('should output default value', () => {
		return process(
			`.block {
				noWrap();
			}`,
			`.block {
				white-space: nowrap;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('stroke', () => {
	it('should handle provided values', () => {
		return process(
			`.block {
				stroke(blue);
				stroke(red, 2px);
			}`,
			`.block {
				stroke: blue;
				stroke: red;
				stroke-width: 2px;
			}`,
			{ mixins: mixins }
		);
	});

	it('should handle named arguments', () => {
		return process(
			`.block {
				stroke(width: 2px, color: blue);
			}`,
			`.block {
				stroke: blue;
				stroke-width: 2px;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('textSharpen', () => {
	it('should output default value', () => {
		return process(
			`.block {
				textSharpen();
			}`,
			`.block {
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('capitalize', () => {
	it('should output default value', () => {
		return process(
			`.block {
				capitalize();
			}`,
			`.block {
				text-transform: capitalize;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('lowercase', () => {
	it('should output default value', () => {
		return process(
			`.block {
				lowercase();
			}`,
			`.block {
				text-transform: lowercase;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('uppercase', () => {
	it('should output default value', () => {
		return process(
			`.block {
				uppercase();
			}`,
			`.block {
				text-transform: uppercase;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('icon', () => {
	it('should output icon with default values', () => {
		return process(
			`.block {
				icon('\\e800');
			}`,
			`.block {
				content: '\\e800';
				font-family: fontello;
				font-size: inherit;
				font-weight: normal;
				line-height: 0;
				font-style: normal;
				display: inline-block;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output icon with provided values', () => {
		return process(
			`.block {
				icon('\\e800', 1.5, 90deg, 300);
			}`,
			`.block {
				content: '\\e800';
				font-family: fontello;
				font-size: 1.5rem;
				font-weight: 300;
				line-height: 0;
				font-style: normal;
				display: inline-block;
				transform: rotate(90deg);
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}`,
			{ mixins: mixins }
		);
	});

	it('should update font-family when passing font argument', () => {
		return process(
			`.block {
				icon('\\e800', font: 'test');
			}`,
			`.block {
				content: '\\e800';
				font-family: 'test';
				font-size: inherit;
				font-weight: normal;
				line-height: 0;
				font-style: normal;
				display: inline-block;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('iconModify', () => {
	it('should output new icon', () => {
		return process(
			`.block {
				iconModify('\\e801');
			}`,
			`.block {
				content: '\\e801';
			}`,
			{ mixins: mixins }
		);
	});

	it('should output provided values', () => {
		return process(
			`.block {
				iconModify('\\e801', 1.8, 45deg, 700);
			}`,
			`.block {
				content: '\\e801';
				font-size: 1.8rem;
				transform: rotate(45deg);
				font-weight: 700;
			}`,
			{ mixins: mixins }
		);
	});
});