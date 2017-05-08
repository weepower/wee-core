import $ from 'wee-dom';
import $events from 'wee-events';
import { createDiv, createSingleDiv, createMultiDiv, resetDOM } from '../helpers/dom';

function removeEvents() {
	let elements = document.body.getElementsByTagName('*');

	for (let i = elements.length; i--;) {
		let oldElement = elements[i];
		let newElement = oldElement.cloneNode(true);

		oldElement.parentNode.replaceChild(newElement, oldElement);
	}
}

function triggerEvent(el, type) {
   if ('createEvent' in document) {
        // modern browsers, IE9+
        let e = document.createEvent('HTMLEvents');
        e.initEvent(type, false, true);
        el.dispatchEvent(e);
    } else {
        // IE 8
        let e = document.createEventObject();
        e.eventType = type;
        el.fireEvent('on' + e.eventType, e);
    }
}

describe('Events', () => {
	describe('on', () => {
		beforeEach(() => {
			createSingleDiv();
			createMultiDiv();
		});
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('should bind a single event to a single element', () => {
			$events.on('.test', 'click', () => {
				$('.test')[0].style.backgroundColor = 'red';
			});

			triggerEvent($('.test')[0], 'click');

			expect($('.test')[0].style.backgroundColor).to.equal('red');
		});

		it('should bind multiple events to a single element', () => {
			$events.on({
				'.test': {
					click() {
						$('.test')[0].style.backgroundColor = 'red';
					},
					mouseenter() {
						$('.test')[0].style.backgroundColor = 'purple';
					}
				}
			});

			triggerEvent($('.test')[0], 'click');
			expect($('.test')[0].style.backgroundColor).to.equal('red');
			triggerEvent($('.test')[0], 'mouseenter');
			expect($('.test')[0].style.backgroundColor).to.equal('purple');
		});

		it('should bind multiple events to multiple elements', () => {
			$events.on({
				'#first': {
					click() {
						$('#first')[0].style.backgroundColor = 'red';
					},
					mouseenter() {
						$('#first')[0].style.backgroundColor = 'purple';
					}
				},
				'.other-class': {
					click() {
						$('.other-class')[0].style.backgroundColor = 'red';
					},
					mouseenter() {
						$('.other-class')[0].style.backgroundColor = 'purple';
					}
				}
			});

			triggerEvent($('#first')[0], 'click');
			expect($('#first')[0].style.backgroundColor).to.equal('red');
			triggerEvent($('#first')[0], 'mouseenter');
			expect($('#first')[0].style.backgroundColor).to.equal('purple');
			triggerEvent($('.other-class')[0], 'click');
			expect($('.other-class')[0].style.backgroundColor).to.equal('red');
			triggerEvent($('.other-class')[0], 'mouseenter');
			expect($('.other-class')[0].style.backgroundColor).to.equal('purple');
		});

		it('should inject the event and element into the callback', () => {
			$events.on('.test', 'click', (e, el) => {
				expect(el.className).to.equal('test');
				expect(e.type).to.equal('click');
			});

			triggerEvent($('.test')[0], 'click');
		})

		describe('once', () => {
			it('should bind an event that fires only once', () => {
				$events.on('.test', 'click', () => {
					let bgColor = $('.test')[0].style.backgroundColor;

					$('.test')[0].style.backgroundColor =
						bgColor === 'red' ? 'purple' : 'red';
				}, {
					once: true
				});

				triggerEvent($('.test')[0], 'click');
				triggerEvent($('.test')[0], 'click');

				expect($('.test')[0].style.backgroundColor).to.equal('red');
			});
		});

		describe('args', () => {
			it('can add injected arguments', () => {
				$events.on('.test', 'click', (e, el, arg1, arg2) => {
					expect(arg1).to.equal('arg1');
					expect(arg2).to.equal('arg2');
				}, {
					args: ['arg1', 'arg2']
				});

				triggerEvent($('.test')[0], 'click');
			});
		});

		describe('scope', () => {
			it('can add change the scope of the callback', () => {
				let test = {
					param: 'test',
					bind() {
						$events.on('.test', 'click', function() {
							expect(this.param).to.equal('test');
						}, {
							scope: this
						});
					}
				}

				test.bind();

				triggerEvent($('.test')[0], 'click');
			});
		});

		describe('delegate', () => {
			it('should delegate bound events to specified ancestor', () => {
				$events.on('.new-el', 'click', (e, el) => {
					el.style.backgroundColor = 'red';
				}, {
					delegate: 'body'
				});

				document.body.appendChild(createDiv({ className: 'new-el' }));

				triggerEvent($('.new-el')[0], 'click');
			});
		});

		describe('context', () => {
			it('should use provided context for selection', () => {
				// TODO: figure out the best way to test that it's actually
				// TODO: using provided context
				$events.on('.test', 'click', () => {
					$('.test')[0].style.backgroundColor = 'red';
				}, {
					context: 'body'
				});

				triggerEvent($('.test')[0], 'click');

				expect($('.test')[0].style.backgroundColor).to.equal('red');
			});
		});

		describe('namespace', () => {
			it('should add a namespace to event', () => {
				// TODO: find the best way to test for namespace existence
				$events.on('.test', 'click', function() {
					$('.test')[0].style.backgroundColor = 'red';
				}, {
					namespace: 'namespace'
				});

				triggerEvent($('.test')[0], 'click');

				expect($('.test')[0].style.backgroundColor).to.equal('red');
			});
		});
	});

	describe('trigger', () => {
		beforeEach(createSingleDiv);
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('should trigger event for matching selection', () => {
			$events.on('.test', 'click', () => {
				$('.test')[0].style.backgroundColor = 'red';
			});

			$events.trigger('.test', 'click');

			expect($('.test')[0].style.backgroundColor).to.equal('red');
		});
	});

	describe('touch', () => {
		beforeEach(createSingleDiv);
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('should bind touch event', () => {
			$events.on('.test', 'swipeLeft', () => {
				$('.test')[0].style.backgroundColor = 'red';
			}, {
				distance: 150,
				movement: 20
			});

			$events.trigger('.test', 'swipeLeft');

			expect($('.test')[0].style.backgroundColor).to.equal('red');
		});
	});

	describe('bound', () => {
		beforeEach(createSingleDiv);
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('it should return an array of all bound events', () => {
			$events.on({
				'.test': {
					click() {
						//
					},
					mouseenter() {
						//
					}
				}
			});

			expect($events.bound()).to.be.an('array');
			expect($events.bound()[0]).to.be.an('object');
			expect($events.bound()[0].el.className).to.equal('test');
			expect($events.bound()[0].ev).to.equal('click');
			expect($events.bound()[0].evt).to.equal('click');
		});
	});
});