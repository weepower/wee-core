'use strict';

const fs = require('fs');
const { expect } = require('chai');
const path = require('path');
const sass = require('node-sass');
const stripIndent = require('common-tags').stripIndent;

let base = fs.readFileSync(path.resolve(__dirname, '../../../styles/variables.scss'))
    + fs.readFileSync(path.resolve(__dirname, '../../../styles/mixins.scss'));

function process(input, expected, vars = false) {
    let data = '';

    data += base;

    if (vars) {
        data += vars;
    }

    data += input;

    let result = sass.renderSync({
        data,
        outputStyle: 'expanded'
    });

    // TODO: Figure out whitespace issue
    expect(result.css.toString().replace(/\s/g, '')).to.equal(expected.replace(/\s/g, ''));
}

// Anything below here is a part of the mixin specific test
describe('inlineBlock', () => {
    it('should generate display: inline-block', () => {
        return process(
            `.block {
                @include inlineBlock();
            }`,
            `.block {
                display: inline-block;
            }`
        );
    });

    it('should add width with default unit', () => {
        return process(
            `.block {
                @include inlineBlock(20rem);
            }`,
            `.block {
                display: inline-block;
                width: 20rem;
            }`
        );
    });

    it('should add width and height with default unit', () => {
        return process(
            `.block {
                @include inlineBlock(20rem, 30rem);
            }`,
            `.block {
                display: inline-block;
                width: 20rem;
                height: 30rem;
            }`
        );
    });

    it('should add width and height with user-defined units', () => {
        return process(
            `.block {
                @include inlineBlock(20px, 30em);
            }`,
            `.block {
                display: inline-block;
                width: 20px;
                height: 30em;
            }`
        );
    });
});

describe('block', () => {
    it('should generate display: block', () => {
        return process(
            `.block {
                @include block();
            }`,
            `.block {
                display: block;
            }`
        );
    });

    it('should add width', () => {
        return process(
            `.block {
                @include block(20rem);
            }`,
            `.block {
                display: block;
                width: 20rem;
            }`
        );
    });

    it('should add width and height', () => {
        return process(
            `.block {
                @include block(20rem, 30rem);
            }`,
            `.block {
                display: block;
                width: 20rem;
                height: 30rem;
            }`
        );
    });

    it('should add width and height with different units', () => {
        return process(
            `.block {
                @include block(20px, 30em);
            }`,
            `.block {
                display: block;
                width: 20px;
                height: 30em;
            }`
        );
    });
});

describe('centeredBlock', () => {
    it('should generate display: block with centered margins', () => {
        return process(
            `.block {
                @include centeredBlock();
            }`,
            `.block {
                display: block;
                margin-left: auto;
                margin-right: auto;
            }`
        );
    });

    it('should add max-width', () => {
        return process(
            `.block {
                @include centeredBlock(20rem);
            }`,
            `.block {
                display: block;
                margin-left: auto;
                margin-right: auto;
                max-width: 20rem;
            }`
        );
    });

    it('should add max-width and margin', () => {
        return process(
            `.block {
                @include centeredBlock(20rem, 30rem);
            }`,
            `.block {
                display: block;
                margin-left: auto;
                margin-right: auto;
                max-width: 20rem;
                margin-bottom: 30rem;
            }`
        );
    });

    it('should add max-width and margin with different units', () => {
        return process(
            `.block {
                @include centeredBlock(20px, 30em);
            }`,
            `.block {
                display: block;
                margin-left: auto;
                margin-right: auto;
                max-width: 20px;
                margin-bottom: 30em;
            }`
        );
    });
});

describe('spacedBlock', () => {
    it('should output default value', () => {
        return process(
            `.block {
                @include spacedBlock();
            }`,
            `.block {
                display: block;
                margin-bottom: 4rem;
            }`
        );
    });

    it('should output supplied value as margin-bottom', () => {
        return process(
            `.block {
                @include spacedBlock(10rem);
            }`,
            `.block {
                display: block;
                margin-bottom: 10rem;
            }`
        );
    });

    it('should output supplied string value as margin-bottom and width', () => {
        return process(
            `.block {
                @include spacedBlock(2rem, 10rem);
            }`,
            `.block {
                display: block;
                margin-bottom: 2rem;
                width: 10rem;
            }`
        );
    });

    it('should output supplied string value as margin-bottom, width and height', () => {
        return process(
            `.block {
                @include spacedBlock(2rem, 10rem, 20rem);
            }`,
            `.block {
                display: block;
                margin-bottom: 2rem;
                width: 10rem;
                height: 20rem;
            }`
        );
    });

    it('should output supplied string value as margin-bottom and width', () => {
        return process(
            `.block {
                @include spacedBlock(2px, 10em);
            }`,
            `.block {
                display: block;
                margin-bottom: 2px;
                width: 10em;
            }`
        );
    });
});

describe('font', () => {
    it('should handle a font stack', () => {
        return process(
            `.block {
                @include font("'Open Sans', Arial, Helvetica, Banana");
            }`,
            `.block {
                font-family: 'Open Sans', Arial, Helvetica, Banana;
            }`
        );
    });

    it('should output specified values', () => {
        return process(
            `.block {
                @include font("'Open Sans', Arial", 10rem, 300, 2em, italic);
            }`,
            `.block {
                font-family: 'Open Sans', Arial;
                font-size: 10rem;
                font-weight: 300;
                line-height: 2em;
                font-style: italic;
            }`
        );
    });

    it('should output specified values by property', () => {
        return process(
            `.block {
                @include font($style: italic, $weight: 300, $spacing: 1px);
            }`,
            `.block {
                font-family: Arial, Helvetica, sans-serif;
                font-weight: 300;
                font-style: italic;
                letter-spacing: 1px;
            }`
        );
    });

    it('should output font family when passed in as variable', () => {
        return process(
            `.block {
                @include font($family, 10rem);
            }`,
            `.block {
                font-family: Helvetica, Arial, sans-serif;
                font-size: 10rem;
            }`,
            `$family: Helvetica, Arial, sans-serif;`
        );
    });
});

describe('absolute', () => {
    it('output absolute position by default', () => {
        return process(
            `.block {
                @include absolute();
            }`,
            `.block {
                position: absolute;
            }`
        );
    });

    it('output absolute position with supplied arguments', () => {
        return process(
            `.block {
                @include absolute(4rem, 3rem);
            }`,
            `.block {
                position: absolute;
                top: 4rem;
                right: 3rem;
            }`
        );
    });

    it('output absolute position with supplied arguments', () => {
        return process(
            `.block {
                @include absolute(4rem, 3rem, 2rem, 1rem);
            }`,
            `.block {
                position: absolute;
                top: 4rem;
                right: 3rem;
                bottom: 2rem;
                left: 1rem;
            }`
        );
    });

    it('output absolute position with supplied named arguments', () => {
        return process(
            `.block {
                @include absolute($bottom: 3rem, $top: 4rem);
            }`,
            `.block {
                position: absolute;
                top: 4rem;
                bottom: 3rem;
            }`
        );
    });
});

describe('fixed', () => {
    it('output fixed position by default', () => {
        return process(
            `.block {
                @include fixed();
            }`,
            `.block {
                position: fixed;
            }`,
        );
    });

    it('output fixed position with supplied arguments', () => {
        return process(
            `.block {
                @include fixed(4rem, 3rem);
            }`,
            `.block {
                position: fixed;
                top: 4rem;
                right: 3rem;
            }`
        );
    });

    it('output fixed position with supplied arguments', () => {
        return process(
            `.block {
                @include fixed(4rem, 3rem, 2rem, 1rem);
            }`,
            `.block {
                position: fixed;
                top: 4rem;
                right: 3rem;
                bottom: 2rem;
                left: 1rem;
            }`
        );
    });

    it('output fixed position with supplied named arguments', () => {
        return process(
            `.block {
                @include fixed($bottom: 3rem, $top: 4rem);
            }`,
            `.block {
                position: fixed;
                top: 4rem;
                bottom: 3rem;
            }`
        );
    });
});

describe('size', () => {
    it('should use first argument for width and height with default unit', () => {
        return process(
            `.block {
                @include size(100rem);
            }`,
            `.block {
                width: 100rem;
                height: 100rem;
            }`
        );
    });

    it('should use arguments for width and height', () => {
        return process(
            `.block {
                @include size(100%, 20%);
            }`,
            `.block {
                width: 100%;
                height: 20%;
            }`
        );
    });
});

describe('maxSize', () => {
    it('should use first argument for width and height with default unit', () => {
        return process(
            `.block {
                @include maxSize(100rem);
            }`,
            `.block {
                max-width: 100rem;
                max-height: 100rem;
            }`
        );
    });

    it('should use arguments for width and height', () => {
        return process(
            `.block {
                @include maxSize(100%, 20%);
            }`,
            `.block {
                max-width: 100%;
                max-height: 20%;
            }`
        );
    });
});

describe('minSize', () => {
    it('should use first argument for width and height with default unit', () => {
        return process(
            `.block {
                @include minSize(100rem);
            }`,
            `.block {
                min-width: 100rem;
                min-height: 100rem;
            }`
        );
    });

    it('should use arguments for width and height', () => {
        return process(
            `.block {
                @include minSize(100%, 20%);
            }`,
            `.block {
                min-width: 100%;
                min-height: 20%;
            }`
        );
    });
});


describe('ratio', () => {
    describe('with keyword', () => {
        it('should output default values', () => {
            return process(
                stripIndent`
                    .block {
                        @include ratio(embed);
                    }
                `,
                stripIndent`
                    .block {
                        overflow: hidden;
                        position: relative;
                    }
                    .block::before {
                        content: '';
                        display: block;
                        height: 0;
                        padding-top: 56.25%;
                    }
                `
            );
        });

        it('should handle ratio', () => {
            return process(
                stripIndent`
                    .block {
                        @include ratio(embed, 4/3);
                    }
                `,
                stripIndent`
                    .block {
                        overflow: hidden;
                        position: relative;
                    }
                    .block::before {
                        content: '';
                        display: block;
                        height: 0;
                        padding-top: 75%;
                    }
                `
            );
        });
    });

    describe('without keyword', () => {
        it('should output default values', () => {
            return process(
                `.block {
                    @include ratio();
                }`,
                `.block {
                    display: block;
                    height: 0;
                    padding-top: 56.25%;
                }`
            );
        });

        it('should handle ratio', () => {
            return process(
                `.block {
                    @include ratio(4/3);
                }`,
                `.block {
                    display: block;
                    height: 0;
                    padding-top: 75%;
                }`
            );
        });
    });
});

describe('circle', () => {
    it('should handle diameter', () => {
        return process(
            `.block {
                @include circle(.5);
            }`,
            `.block {
                background-clip: border-box;
                border-radius: 0.25rem;
                height: 0.5rem;
                width: 0.5rem;
                display: block;
            }`
        );
    });

    it('should handle diameter and crop', () => {
        return process(
            `.block {
                @include circle(.5rem, true);
            }`,
            `.block {
                background-clip: border-box;
                border-radius: 0.25rem;
                height: 0.5rem;
                width: 0.5rem;
                overflow: hidden;
                display: block;
            }`
        );
    });

    it('should handle key value pairs', () => {
        return process(
            `.block {
                @include circle(.5rem, $display: inline-block);
            }`,
            `.block {
                background-clip: border-box;
                border-radius: 0.25rem;
                height: 0.5rem;
                width: 0.5rem;
                display: inline-block;
            }`
        );
    });
});

describe('triangle', () => {
    it('should handle up keyword', () => {
        return process(
            `.block {
                @include triangle(up);
            }`,
            `.block {
                content: '';
                height: 0;
                width: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-bottom: 5px solid #737373;
            }`
        );
    });

    it('should handle left keyword with color and size values', () => {
        return process(
            `.block {
                @include triangle(left, blue, 2px);
            }`,
            `.block {
                content: '';
                height: 0;
                width: 0;
                border-bottom: 2px solid transparent;
                border-top: 2px solid transparent;
                border-right: 2px solid blue;
            }`
        );
    });

    it('should handle key value pairs', () => {
        return process(
            `.block {
                @include triangle(right, $width: 4px, $size: 3px);
            }`,
            `.block {
                content: '';
                height: 0;
                width: 0;
                border-bottom: 4px solid transparent;
                border-top: 4px solid transparent;
                border-left: 3px solid #737373;
            }`
        );
    });
});

// This is supported by the CSS spec.
describe('clearfix', () => {
    it('should output a nested selector', () => {
        return process(
            `.block { @include clearfix(); }`,
            `.block::after { clear: both; content: ''; display: block; }`,
        );
    });
});

describe('row', () => {
    it('should output margins with clearfix', () => {
        return process(
            `.block { @include row(); }`,
            `.block { margin-left: -5%; max-width: 105%; } .block::after { clear: both; content: ''; display: block; }`,
        );
    });

    it('should output margins with clearfix with override value', () => {
        return process(
            `.block { @include row(10%); }`,
            `.block { margin-left: -10%; max-width: 110%; } .block::after { clear: both; content: ''; display: block; }`,
        );
    });

    it('should handle margin of 0', () => {
        return process(
            `.block { @include row(0); }`,
            `.block { margin-left: 0; max-width: 100%; }.block::after { clear: both; content: ''; display: block; }`,
        );
    });
});

describe('rowModify', () => {
    it('should output override margins', () => {
        return process(
            `.block {
                @include rowModify();
            }`,
            `.block {
                margin-left: -5%;
                max-width: 105%;
            }`
        );
    });

    it('should output override margins with override value', () => {
        return process(
            `.block {
                @include rowModify(10%);
            }`,
            `.block {
                margin-left: -10%;
                max-width: 110%;
            }`
        );
    });
});

describe('rowReset', () => {
    it('should output reset', () => {
        return process(
            `.block {
                @include rowReset();
            }`,
            `.block {
                margin-left: 0;
                max-width: none;
            }`
        );
    });
});

describe('inlineColumn', () => {
    describe('with keyword', () => {
        it('should output share with default values', () => {
            return process(
                `.block {
                    @include inlineColumn(spaced, 1);
                }`,
                `.block {
                    display: inline-block;
                    vertical-align: top;
                    margin-left: 5%;
                    width: 7.5%;
                    letter-spacing: normal;
                }`
            );
        });

        it('should output provided values', () => {
            return process(
                `.block {
                    @include inlineColumn(spaced, 1, 3, 4%, true);
                }`,
                `.block {
                    display: inline-block;
                    vertical-align: top;
                    margin-left: 4%;
                    width: 29.33333%;
                }`
            );
        });

        it('should handle key value pairs', () => {
            return process(
                `.block {
                    @include inlineColumn(spaced, 1, $margin: 4%, $spaceless: true, $columns: 3);
                }`,
                `.block {
                    display: inline-block;
                    vertical-align: top;
                    margin-left: 4%;
                    width: 29.33333%;
                }`
            );
        });
    });

    describe('without keyword', () => {
        it('should output share with default values', () => {
            return process(
                `.block {
                    @include inlineColumn(1);
                }`,
                `.block {
                    display: inline-block;
                    vertical-align: top;
                    width: 12.5%;
                    margin-right: -.32em;
                }`
            );
        });

        it('should output provided values', () => {
            return process(
                `.block {
                    @include inlineColumn(1, 3, true);
                }`,
                `.block {
                    display: inline-block;
                    vertical-align: top;
                    width: 33.33333%;
                }`
            );
        });

        // TODO: Come back to this test
        it('should handle key value pairs', () => {
            return process(
                `.block {
                    @include inlineColumn(2, $columns: 4, $spaceless: true);
                }`,
                `.block {
                    display: inline-block;
                    vertical-align: top;
                    width: 50%;
                }`
            );
        });
    });
});

describe('inlineRow', () => {
    it('should output default values', () => {
        return process(
            `.block {
                @include inlineRow();
            }`,
            `.block {
                margin-left: -5%;
                max-width: 105%;
                letter-spacing: -.32em;
            }`
        );
    });

    it('should output provided values', () => {
        return process(
            `.block {
                @include inlineRow(4%, true);
            }`,
            `.block {
                margin-left: -4%;
                max-width: 104%;
            }`
        );
    });

    it('should handle key value pairs', () => {
        return process(
            `.block {
                @include inlineRow($spaceless: true, $margin: 6%);
            }`,
            `.block {
                margin-left: -6%;
                max-width: 106%;
            }`
        );
    });
});

describe('prefix', () => {
    it('should output default values', () => {
        return process(
            stripIndent`
                .block {
                    @include prefix();
                }
            `,
            stripIndent`
                .block::before {
                    content: "-";
                    margin-right: 0.5em;
                }
            `
        );
    });

    it('should output provided values', () => {
        return process(
            stripIndent`
                .block {
                    @include prefix('~', 2rem, foo, blue);
                }
            `,
            stripIndent`
                .block::before {
                    content: "~";
                    margin-right: 2rem;
                    font-family: foo;
                    color: blue;
                }
            `
        );
    });

    it('should handle attr function', () => {
        return process(
            stripIndent`
                .block {
                    @include prefix(attr(data-attr), 2rem, foo, blue);
                }
            `,
            stripIndent`
                .block::before {
                    content: attr(data-attr);
                    margin-right: 2rem;
                    font-family: foo;
                    color: blue;
                }
            `
        );
    });

    it('should handle key value pairs', () => {
        return process(
            stripIndent`
                .block {
                    @include prefix("~", $color: blue);
                }
            `,
            stripIndent`
                .block::before {
                    content: "~";
                    margin-right: 0.5em;
                    color: blue;
                }
            `
        );
    });
});

describe('suffix', () => {
    it('should output default values', () => {
        return process(
            stripIndent`
                .block {
                    @include suffix();
                }
            `,
            stripIndent`
                .block::after {
                    content: "-";
                    margin-left: 0.5em;
                }
            `
        );
    });

    it('should output provided values', () => {
        return process(
            stripIndent`
                .block {
                    @include suffix('~', 2rem, foo, blue);
                }
            `,
            stripIndent`
                .block::after {
                    content: "~";
                    margin-left: 2rem;
                    font-family: foo;
                    color: blue;
                }
            `
        );
    });

    it('should handle attr function', () => {
        return process(
            stripIndent`
                .block {
                    @include suffix(attr(data-attr), 2rem, foo, blue);
                }
            `,
            stripIndent`
                .block::after {
                    content: attr(data-attr);
                    margin-left: 2rem;
                    font-family: foo;
                    color: blue;
                }
            `
        );
    });

    it('should handle key value pairs', () => {
        return process(
            stripIndent`
                .block {
                    @include suffix('~', $color: blue);
                }
            `,
            stripIndent`
                .block::after {
                    content: "~";
                    margin-left: 0.5em;
                    color: blue;
                }
            `
        );
    });
});

describe('bookends', () => {
    it('should output default values', () => {
        return process(
            stripIndent`
                .block {
                    @include bookends();
                }
            `,
            stripIndent`
                .block::before {
                    content: "-";
                    margin-right: 0.5em;
                }
                .block::after {
                    content: "-";
                    margin-left: 0.5em;
                }
            `
        );
    });

    it('should output provided values', () => {
        return process(
            stripIndent`
                .block {
                    @include bookends('~', 2rem, foo, blue);
                }
            `,
            stripIndent`
                .block::before {
                    content: "~";
                    margin-right: 2rem;
                    font-family: foo;
                    color: blue;
                }
                .block::after {
                    content: "~";
                    margin-left: 2rem;
                    font-family: foo;
                    color: blue;
                }
            `
        );
    });

    it('should handle attr function', () => {
        return process(
            stripIndent`
                .block {
                    @include bookends(attr(data-attr));
                }
            `,
            stripIndent`
                .block::before {
                    content: attr(data-attr);
                    margin-right: 0.5em;
                }
                .block::after {
                    content: attr(data-attr);
                    margin-left: 0.5em;
                }
            `
        );
    });

    it('should handle key value pairs', () => {
        return process(
            stripIndent`
                .block {
                    @include bookends('~', $color: blue);
                }
            `,
            stripIndent`
                .block::before {
                    content: "~";
                    margin-right: 0.5em;
                    color: blue;
                }
                .block::after {
                    content: "~";
                    margin-left: 0.5em;
                    color: blue;
                }
            `
        );
    });
});

describe('column', () => {
    it('should output default width', () => {
        return process(
            `.block {
                @include column();
            }`,
            `.block {
                float: left;
                width: 100%;
            }`
        );
    });

    it('should output override width', () => {
        return process(
            `.block {
                @include column(50%);
            }`,
            `.block {
                float: left;
                width: 50%;
            }`
        );
    });

    it('should output column share', () => {
        return process(
            `.block {
                @include column(1);
            }`,
            `.block {
                float: left;
                width: 12.5%;
            }`
        );
    });

    it('should output column share with grid column count', () => {
        return process(
            `.block {
                @include column(1, 2);
            }`,
            `.block {
                float: left;
                width: 50%;
            }`
        );
    });

    it('should output column share with grid column count with default grid margin', () => {
        return process(
            `.block {
                @include column(spaced, 1, 2);
            }`,
            `.block {
                float: left;
                margin-left: 5%;
                width: 45%;
            }`
        );
    });

    it('should output column share with grid column count with override grid margin', () => {
        return process(
            `.block {
                @include column(spaced, 1, 2, 10%);
            }`,
            `.block {
                float: left;
                margin-left: 10%;
                width: 40%;
            }`
        );
    });
});

describe('columnModify', () => {
    describe('with keyword', () => {
        it('should handle share amount', () => {
            return process(
                `.block {
                    @include columnModify(spaced, 2);
                }`,
                `.block {
                    margin-left: 5%;
                    width: 20%;
                }`
            );
        });

        it('should handle share and columns count', () => {
            return process(
                `.block {
                    @include columnModify(spaced, 2, 4);
                }`,
                `.block {
                    margin-left: 5%;
                    width: 45%;
                }`
            );
        });

        it('should handle key value pairs', () => {
            return process(
                `.block {
                    @include columnModify(spaced, 3, $margin: 4%);
                }`,
                `.block {
                    margin-left: 4%;
                    width: 33.5%;
                }`
            );
        });
    });

    describe('without keyword', () => {
        it('should handle share and columns count', () => {
            return process(
                `.block {
                    @include columnModify(2, 4);
                }`,
                `.block {
                    width: 50%;
                }`
            );
        });
    });
});

describe('columnOffset', () => {
    describe('with keyword', () => {
        it('should handle share amount', () => {
            return process(
                `.block {
                    @include columnOffset(spaced, 1);
                }`,
                `.block {
                    margin-left: 17.5%;
                }`
            );
        });

        it('should handle share and margin', () => {
            return process(
                `.block {
                    @include columnOffset(spaced, 1, $margin: 6%);
                }`,
                `.block {
                    margin-left: 24.5%;
                }`
            );
        });

        it('should handle key value pairs', () => {
            return process(
                `.block {
                    @include columnOffset(spaced, $columns: 3, $share: 1);
                }`,
                `.block {
                    margin-left: 38.33333%;
                }`
            );
        });
    });

    describe('without keyword', () => {
        it('should handle share and column', () => {
            return process(
                `.block {
                    @include columnOffset(3, 4);
                }`,
                `.block {
                    margin-left: 75%;
                }`
            );
        });

        it('should handle key value pairs', () => {
            return process(
                `.block {
                    @include columnOffset($columns: 3, $share: 1);
                }`,
                `.block {
                    margin-left: 33.33333%;
                }`
            );
        });
    });
});

describe('columnPull', () => {
    it('should handle share amount', () => {
        return process(
            `.block {
                @include columnPull(2);
            }`,
            `.block {
                position: relative;
                right: 25%;
            }`
        );
    });

    it('should handle key value pairs', () => {
        return process(
            `.block {
                @include columnPull($columns: 4, $share: 2);
            }`,
            `.block {
                position: relative;
                right: 50%;
            }`
        );
    });
});

describe('columnPush', () => {
    it('should handle share amount', () => {
        return process(
            `.block {
                @include columnPush(2);
            }`,
            `.block {
                left: 25%;
                position: relative;
            }`
        );
    });

    it('should handle key value pairs', () => {
        return process(
            `.block {
                @include columnPush($columns: 4, $share: 2);
            }`,
            `.block {
                left: 50%;
                position: relative;
            }`
        );
    });
});

describe('columnReset', () => {
    it('should output declaration with default values', () => {
        return process(
            `.block {
                @include columnReset();
            }`,
            `.block {
                float: none;
                width: auto;
            }`
        );
    });

    it('should handle resetting margin', () => {
        return process(
            `.block {
                @include columnReset(true);
            }`,
            `.block {
                float: none;
                width: auto;
                margin-left: 0;
            }`
        );
    });
});

// TODO: Do we need this mixin?
// describe('columns', () => {
// 	it('should output declaration with default values', () => {
// 		return process(
// 			`.block {
// 				columns();
// 			}`,
// 			`.block {
// 				column-count: 2;
// 				column-rule-width: 1px;
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should output declaration with provided arguments', () => {
// 		return process(
// 			`.block {
// 				columns(3, 3px, hidden, medium);
// 			}`,
// 			`.block {
// 				column-count: 3;
// 				column-gap: 3px;
// 				column-rule-style: hidden;
// 				column-rule-width: medium;
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should handle key value pairs', () => {
// 		return process(
// 			`.block {
// 				columns(gap: 3px, count: 3);
// 			}`,
// 			`.block {
// 				column-count: 3;
// 				column-gap: 3px;
// 				column-rule-width: 1px;
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should handle different argument types', () => {
// 		return process(
// 			`.block {
// 				columns(3, style: dotted);
// 			}`,
// 			`.block {
// 				column-count: 3;
// 				column-rule-style: dotted;
// 				column-rule-width: 1px;
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
// });

describe('rounded', () => {
    it('should set border radius to default value', () => {
        return process(
            `.block {
                @include rounded();
            }`,
            `.block {
                background-clip: border-box;
                border-radius: 3px;
            }`
        );
    });

    it('should set border radius', () => {
        return process(
            `.block {
                @include rounded(4px);
            }`,
            `.block {
                background-clip: border-box;
                border-radius: 4px;
            }`
        );
    });

    it('should set top corners to default value', () => {
        return process(
            `.block {
                @include rounded(top);
            }`,
            `.block {
                background-clip: border-box;
                border-top-left-radius: 3px;
                border-top-right-radius: 3px;
            }`
        );
    });

    it('should set left border radius', () => {
        return process(
            `.block {
                @include rounded(left, 4px);
            }`,
            `.block {
                background-clip: border-box;
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }`
        );
    });

    it('should set right border radius to default', () => {
        return process(
            `.block {
                @include rounded(right);
            }`,
            `.block {
                background-clip: border-box;
                border-top-right-radius: 3px;
                border-bottom-right-radius: 3px;
            }`
        );
    });

    it('should set bottom border radius', () => {
        return process(
            `.block {
                @include rounded(bottom);
            }`,
            `.block {
                background-clip: border-box;
                border-bottom-left-radius: 3px;
                border-bottom-right-radius: 3px;
            }`
        );
    });
});

describe('heading', () => {
    it('should generate base styling for headings', () => {
        return process(
            stripIndent`
                .block {
                    @include heading();
                }
            `,
            stripIndent`
                .block {
                    font-family: Tahoma, Geneva, sans-serif;
                    font-weight: bold;
                    line-height: 1.4em;
                    color: inherit;
                    margin-bottom: 2rem;

                }
                .block small {
                    font-weight: normal;
                }
            `
        );
    });
});

describe('placeholder', () => {
    it('should output declaration with default value', () => {
        return process(
            stripIndent`
                .block {
                    @include placeholder();
                }
            `,
            stripIndent`
                .block::-webkit-input-placeholder {
                    color: #bfbfbf;
                }
                .block:-moz-placeholder {
                    color: #bfbfbf;
                }
                .block::-moz-placeholder {
                    color: #bfbfbf;
                }
                .block:-ms-input-placeholder {
                    color: #bfbfbf;
                }
            `
        );
    });

    it('should set placeholder color to value', () => {
        return process(
            stripIndent`
                .block {
                    @include placeholder(#fff);
                }
            `,
            stripIndent`
                .block::-webkit-input-placeholder {
                    color: #fff;
                }
                .block:-moz-placeholder {
                    color: #fff;
                }
                .block::-moz-placeholder {
                    color: #fff;
                }
                .block:-ms-input-placeholder {
                    color: #fff;
                }
            `
        );
    });
});

describe('resizable', () => {
    it('should output declaration with default values', () => {
        return process(
            `.block {
                @include resizable();
            }`,
            `.block {
                overflow: hidden;
                resize: both;
            }`
        );
    });

    it('should set resize to value provided', () => {
        return process(
            `.block {
                @include resizable(vertical);
            }`,
            `.block {
                overflow: hidden;
                resize: vertical;
            }`
        );
    });
});

// TODO: Do we need this mixin?
// describe('columns', () => {
// 	it('should output declaration with default values', () => {
// 		return process(
// 			`.block {
// 				columns();
// 			}`,
// 			`.block {
// 				column-count: 2;
// 				column-rule-width: 1px;
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
// });
//
// describe('shadow', () => {
// 	it('should output declaration with default values', () => {
// 		return process(
// 			`.block {
// 				shadow();
// 			}`,
// 			`.block {
// 				box-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.2);
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should output a dark shadow using the provided opacity when using the dark keyword', () => {
// 		return process(
// 			`.block {
// 				shadow(dark, 0.5);
// 			}`,
// 			`.block {
// 				box-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.5);
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should output a light shadow using the provided opacity when using the light keyword', () => {
// 		return process(
// 			`.block {
// 				shadow(light, 0.5);
// 			}`,
// 			`.block {
// 				box-shadow: 1px 1px 0 0 rgba(255, 255, 255, 0.5);
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
// });
//
// describe('textShadow', () => {
// 	it('should output declaration with default values', () => {
// 		return process(
// 			`.block {
// 				textShadow();
// 			}`,
// 			`.block {
// 				text-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.2);
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should output a dark text-shadow using the provided opacity when using the dark keyword', () => {
// 		return process(
// 			`.block {
// 				textShadow(dark, 0.5);
// 			}`,
// 			`.block {
// 				text-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.5);
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
//
// 	it('should output a light text-shadow using the provided opacity when using the light keyword', () => {
// 		return process(
// 			`.block {
// 				textShadow(light, 0.5);
// 			}`,
// 			`.block {
// 				text-shadow: 1px 1px 0 0 rgba(255, 255, 255, 0.5);
// 			}`,
// 			{ mixins: mixins }
// 		);
// 	});
// });

describe('flex', () => {
    it('should output declaration with default values', () => {
        return process(
            `.block {
                @include flex();
            }`,
            `.block {
                flex-grow: 0;
                flex-shrink: 0;
                flex-basis: auto;
            }`
        );
    });
});

describe('flexContainer', () => {
    it('should output declaration with default values', () => {
        return process(
            `.block {
                @include flexContainer();
            }`,
            `.block {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: flex-start;
                align-items: stretch;
                align-content: stretch;
            }`
        );
    });
});

describe('loadFont', () => {
    it('should output declaration with provided object values', () => {
        return process(
            stripIndent`
                @include loadFont(foo);
            `,
            stripIndent`
                @font-face {
                    font-family: foo;
                    font-weight: normal;
                    font-style: normal;
                    src: url("../fonts/foo.woff2") format("woff2"), url("../fonts/foo.woff") format("woff"), url("../fonts/foo.ttf") format("truetype");
                }
            `
        );
    });
});

describe('ellipsis', () => {
    it('should output default values', () => {
        return process(
            `.block {
                @include ellipsis();
            }`,
            `.block {
                overflow-x: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }`
        );
    });

    it('should handle max-width', () => {
        return process(
            `.block {
                @include ellipsis(800px);
            }`,
            `.block {
                overflow-x: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 800px;
            }`
        );
    });

    it('should handle max-width with default unit', () => {
        return process(
            `.block {
                @include ellipsis(80rem);
            }`,
            `.block {
                overflow-x: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 80rem;
            }`
        );
    });
});

describe('noClear', () => {
    it('should output default values', () => {
        return process(
            stripIndent`
                .block {
                    @include noClear();
                }
            `,
            stripIndent`
                .block::-ms-clear {
                    display: none;
                }
                .block::-webkit-search-cancel-button {
                    -webkit-appearance: none;
                }
            `
        );
    });
});

describe('hideText', () => {
    it('should output default values', () => {
        return process(
            `.block {
                @include hideText();
            }`,
            `.block {
                overflow: hidden;
                text-indent: 110%;
                white-space: nowrap;
            }`,
        );
    });
});

describe('selection', () => {
    it('should output default values', () => {
        return process(
            stripIndent`
                .block {
                    @include selection();
                }
            `,
            stripIndent`
                .block::selection {
                    background: #5789ff;
                    color: #fff;
                    text-shadow: none;
                }
            `
        );
    });

    it('should handle color and background', () => {
        return process(
            stripIndent`
                .block {
                    @include selection(#000, #fff);
                }
            `,
            stripIndent`
                .block::selection {
                    background: #fff;
                    color: #000;
                    text-shadow: none;
                }
            `
        );
    });

    it('should handle key value pairs', () => {
        return process(
            stripIndent`
                .block {
                    @include selection($background: #fff, $color: #000);
                }
            `,
            stripIndent`
                .block::selection {
                    background: #fff;
                    color: #000;
                    text-shadow: none;
                }
            `
        );
    });
});

describe('textSharpen', () => {
    it('should output default value', () => {
        return process(
            `.block {
                @include textSharpen();
            }`,
            `.block {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }`
        );
    });
});

describe('icon', () => {
    it('should output icon with default values', () => {
        return process(
            `.block {
                @include icon(e800);
            }`,
            `.block {
                font-family: icons;
                font-size: inherit;
                font-weight: normal;
                line-height: 0;
                font-style: normal;
                content: "\e800";
                display: inline-block;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }`
        );
    });

    it('should output icon with provided values', () => {
        return process(
            `.block {
                @include icon(e800, 1.5rem, 90deg, 300);
            }`,
            `.block {
                font-family: icons;
                font-size: 1.5rem;
                font-weight: 300;
                line-height: 0;
                font-style: normal;
                content: "\e800";
                display: inline-block;
                transform: rotate(90deg);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }`
        );
    });

    it('should update font-family when passing font argument', () => {
        return process(
            `.block {
                @include icon(e800, $font: 'test');
            }`,
            `.block {
                font-family: test;
                font-size: inherit;
                font-weight: normal;
                line-height: 0;
                font-style: normal;
                content: "\e800";
                display: inline-block;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }`
        );
    });
});

describe('iconModify', () => {
    it('should output new icon', () => {
        return process(
            `.block {
                @include iconModify(\e801);
            }`,
            `.block {
                content: "\e801";
            }`
        );
    });

    it('should output provided values', () => {
        return process(
            `.block {
                @include iconModify(\e801, 1.8rem, 45deg, 700);
            }`,
            `.block {
                content: "\e801";
                font-size: 1.8rem;
                transform: rotate(45deg);
                font-weight: 700;
            }`
        );
    });
});
