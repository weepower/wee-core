const { darken, lighten } = require('postcss-js-mixins/lib/colorHelpers');
const { defer } = require('postcss-variables/lib/helpers');
const register = require('postcss-variables/lib/register');

let variables = {};

variables.unit = {
	default: 'rem',
	fontSize: 'rem',
	lineHeight: 'em'
};

variables.root = {
	fontSize: '62.5%'
};

variables.default = {
	radius: '3px',
	opacity: 0.2,
	duration: '0.2s',
	timing: 'ease-in-out',
	delay: '0s'
};

variables.width = {
	min: 0,
	max: '1280px'
};

variables.bumper = {
	enabled: true,
	padding: '6%'
};

variables.block = {
	margin: {
		bottom: '4rem'
	}
};

variables.grid = {
	margin: '5%',
	columns: 8,
	spaceless: false
};

variables.colors = {
	primary: '#349bb9',
	secondary: '#70c1b3',
	tertiary: '#f18f01',
	info: '#00f',
	success: '#008000',
	warning: '#f00',
	white: '#fff',
	lightestGray: defer(darken, ['$colors.white', 4]),
	lighterGray: defer(darken, ['$colors.white', 10]),
	lightGray: defer(darken, ['$colors.white', 25]),
	gray: defer(darken, ['$colors.white', 35]),
	darkGray: defer(darken, ['$colors.white', 55]),
	darkerGray: defer(darken, ['$colors.white', 65]),
	darkestGray: defer(darken, ['$colors.white', 75]),
	black: '#000'
};

variables.colors.body = {
	background: '$colors.white'
};

variables.font = {
	color: '$colors.darkestGray',
	family: 'Arial, Helvetica, sans-serif',
	lineHeight: '1em',
	path: '../fonts/',
	size: '1.6rem',
	weight: {
		normal: 'normal',
		bold: 'bold'
	}
};

variables.heading = {
	color: 'inherit',
	family: 'Tahoma, Geneva, sans-serif',
	weight: '$font.weight.bold',
	lineHeight: '1.4em',
	margin: {
		bottom: '2rem'
	}
};

variables.h1 = '3.6rem';
variables.h2 = '3.2rem';
variables.h3 = '2.8rem';
variables.h4 = '2.4rem';
variables.h5 = '2rem';
variables.h6 = '1.6rem';

variables.image = {
	path: '../images/',
	class: {
		left: 'img-left',
		right: 'img-right'
	},
	margin: {
		bottom: '2rem',
		side: '2rem'
	}
};

variables.mark = {
	color: '$font.color',
	background: 'yellow'
};

variables.abbr = {
	underline: 'dotted'
};

variables.border = {
	color: '$colors.lightGray',
	style: 'solid',
	width: '1px'
};

variables.paragraph = {
	color: '$font.color',
	weight: '$font.weight.normal',
	lineHeight: '1.7em',
	margin: {
		bottom: '2rem'
	}
};

variables.figure = {
	border: {
		color: false,
		radius: false
	},
	padding: '$block.margin.bottom'
};

variables.figCaption = {
	color: '$colors.darkGray',
	style: 'italic',
	lineHeight: '$paragraph.lineHeight'
};

variables.link = {
	color: '$colors.primary',
	decoration: 'none'
};

variables.link.hover = {
	color: defer(darken, ['$link.color', 10]),
	decoration: 'none'
};

variables.link.active = {
	color: defer(darken, ['$link.color', 20])
};

variables.selection = {
	color: '$colors.white',
	background: '$link.color'
};

variables.small = {
	size: '0.8em'
};

variables.quote = {
	color: '$colors.darkestGray',
	family: 'Georgia, Times, serif',
	size: '2rem',
	style: 'italic',
	weight: 'normal',
	lineHeight: '1.4em',
	padding: {
		horizontal: '2em',
		vertical: '1em'
	}
};

variables.cite = {
	color: '$colors.gray',
	family: '$font.family',
	size: '1.8rem',
	style: 'normal',
	weight: 'normal',
	lineHeight: '1.2em',
	margin: {
		top: '1.4rem'
	},
	indicator: "'\\2014\\00a0'"
};

variables.rule = {
	color: '$colors.lightGray',
	height: '1px',
	style: 'solid',
	margin: {
		vertical: '$block.margin.bottom'
	}
};

variables.address = {
	color: '$colors.darkestGray',
	family: '$font.family',
	size: '$font.size',
	weight: 'normal',
	style: 'normal',
	lineHeight: '$paragraph.lineHeight'
};

variables.list = {
	color: '$paragraph.color',
	lineHeight: '$paragraph.lineHeight',
	margin: {
		bottom: '$paragraph.margin.bottom',
		left: false
	},
	bullet: {
		style: 'disc',
		position: 'inside'
	}
};

variables.nestedList = {
	margin: {
		left: '2rem'
	}
};

variables.li = {
	margin: {
		bottom: '0.2rem'
	}
};

variables.dl = {
	margin: {
		bottom: '$block.margin.bottom'
	}
};

variables.dt = {
	color: '$colors.darkerGray',
	family: '$heading.family',
	size: '2rem',
	margin: {
		bottom: '0.2rem'
	}
};

variables.dd = {
	color: '$colors.gray',
	family: '$font.family',
	size: '$font.size',
	margin: {
		bottom: '1rem'
	}
};

variables.print = {
	page: {
		margin: '2cm .5cm'
	}
};

variables.button = {
	color: '$colors.white',
	family: '$font.family',
	size: '$font.size',
	weight: 'normal',
	padding: {
		horizontal: '3rem',
		vertical: '1.3rem'
	},
	margin: {
		bottom: 0
	},
	transition: {
		property: 'background-color',
		duration: '0.2s'
	},
	background: '$colors.darkGray',
	border: {
		color: false,
		radius: '$default.radius',
		width: 0
	}
};

variables.button.hover = {
	background: defer(darken, ['$button.background', 5])
};

variables.button.active = {
	background: defer(darken, ['$button.background', 10]),
	transition: {
		property: 'none'
	}
};

variables.coloredButton = {
	class: '.colored-button',
	color: '$colors.white',
	background: '$link.color',
	border: {
		color: false,
		radius: '$button.border.radius',
		width: '$button.border.width'
	}
};

variables.coloredButton.hover = {
	background: defer(darken, ['$coloredButton.background', 5])
};

variables.coloredButton.active = {
	background: defer(darken, ['$coloredButton.background', 10])
};

variables.button.disabled = {
	modifier: '.-disabled',
	color: '$colors.darkGray',
	background: '$colors.lightGray',
	border: {
		color: false
	},
	cursor: 'not-allowed'
};

variables.code = {
	color: '$colors.darkestGray',
	family: 'monospace',
	size: '$font.size',
	lineHeight: '1.4em',
	background: '$colors.lighterGray',
	border: {
		color: false,
		radius: false
	},
	padding: {
		horizontal: '0.5em',
		vertical: '0.2em'
	}
};

variables.code.block = {
	color: '$colors.lightestGray',
	family: '$code.family',
	size: '1.3rem',
	lineHeight: '$paragraph.lineHeight',
	tabSize: 4,
	wrap: false,
	margin: {
		bottom: '$block.margin.bottom'
	},
	background: '$colors.darkestGray',
	border: {
		color: '$code.border.color',
		radius: false
	},
	padding: {
		horizontal: '2rem',
		vertical: '1.4rem'
	}
};

variables.input = {
	background: '$colors.white',
	color: '$colors.darkerGray',
	family: '$font.family',
	minHeight: '3rem', // false to disable
	minWidth: '20rem', // false to disable
	size: '$font.size',
	weight: '$font.weight',
	border: {
		color: '$colors.lighterGray',
		radius: '$default.radius', // false to disable
		width: '1px'
	},
	margin: {
		bottom: '2rem'
	},
	padding: {
		horizontal: '1.6rem',
		vertical: '1rem'
	},
	placeholder: {
		color: defer(lighten, ['$input.color', 40])
	}
};

variables.input.hover = {
	border: {
		color: defer(darken, ['$input.border.color', 10])
	}
};

variables.input.focus = {
	border: {
		color: defer(darken, ['$input.border.color', 20])
	}
};

variables.input.invalid = {
	background: '$colors.white',
	color: defer(darken, ['$input.invalid.border.color', 10]),
	border: {
		color: '#a41818',
		width: '1px' // false to disable
	}
};

variables.input.invalid.hover = {
	border: {
		color: defer(darken, ['$input.invalid.border.color', 10])
	}
};

variables.input.invalid.focus = {
	border: {
		color: defer(darken, ['$input.invalid.border.color', 20])
	}
};

variables.input.required = {
	background: '$colors.white',
	color: defer(darken, ['$input.required.border.color', 10]),
	border: {
		color: '$colors.darkGray',
		width: '1px' // false to disable
	}
};

variables.input.required.hover = {
	border: {
		color: defer(darken, ['$input.required.border.color', 10])
	}
};

variables.input.required.focus = {
	border: {
		color: defer(darken, ['$input.required.border.color', 20])
	}
};

variables.input.disabled = {
	background: '$colors.lightestGray',
	color: '$colors.darkGray',
	cursor: 'not-allowed',
	modifier: '.-disabled',
	border: {
		width: false // false to disable
	}
};

variables.multiSelect = {
	minHeight: '8rem'
};

variables.checkbox = {
	margin: {
		bottom: '1rem',
		right: '0.5rem'
	}
};

variables.textarea = {
	lineHeight: '1.3em',
	minHeight: '8rem',
	resize: 'vertical',
	padding: {
		horizontal: '1.6rem',
		vertical: '1rem'
	}
};

variables.legend = {
	color: '$colors.darkerGray',
	family: '$font.family',
	size: '1.8rem',
	margin: {
		bottom: '1.4rem'
	}
};

variables.label = {
	weight: 'normal',
	lineHeight: '1.3em',
	margin: {
		bottom: '0.4rem',
		right: '1rem'
	}
};

variables.table = {
	size: '$font.size',
	bordered : {
		modifier: '.-bordered'
	},
	caption: {
		background: '$colors.lightestGray',
		style: 'italic',
		padding: {
			horizontal: '$table.cell.padding.horizontal',
			vertical: '1.2rem'
		}
	},
	cell: {
		border: {
			color: '$colors.lighterGray'
		},
		lineHeight: '$paragraph.lineHeight',
		padding: {
			horizontal: '1.6rem',
			vertical: '0.6rem'
		}
	},
	striped: {
		background: '$colors.lightestGray',
		modifier: '.-striped',
		position: 'odd'
	}
};

module.exports = register(variables);