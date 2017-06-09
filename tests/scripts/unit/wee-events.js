import $ from 'wee-dom';
import $events from 'wee-events';
import { createDiv, createSingleDiv, createMultiDiv, resetDOM } from '../helpers/dom';
import { isIE } from '../helpers/browsers';

function removeEvents() {
	let elements = document.body.getElementsByTagName('*');

	for (let i = elements.length; i--;) {
		let oldElement = elements[i];
		let newElement = oldElement.cloneNode(true);

		oldElement.parentNode.replaceChild(newElement, oldElement);
	}

	$events.off();
}

function triggerEvent(el, type, bubbles = true, cancelable = true) {
	if (isIE()) {
		let e = document.createEvent('HTMLEvents');
		e.initEvent(type, bubbles, cancelable);
		el.dispatchEvent(e);
	} else {
		let e = new Event(type, {
			bubbles,
			cancelable
		});

		el.dispatchEvent(e);
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
					click(e, el) {
						el.style.backgroundColor = 'red';
					},
					mouseenter(e, el) {
						el.style.backgroundColor = 'purple';
					}
				},
				'.child': {
					click(e, el) {
						el.style.backgroundColor = 'red';
					},
					mouseenter(e, el) {
						el.style.backgroundColor = 'purple';
					}
				}
			});

			triggerEvent($('#first')[0], 'click');
			expect($('#first')[0].style.backgroundColor).to.equal('red');
			triggerEvent($('#first')[0], 'mouseenter');
			expect($('#first')[0].style.backgroundColor).to.equal('purple');

			triggerEvent($('.child')[0], 'click');
			expect($('.child')[0].style.backgroundColor).to.equal('red');
			triggerEvent($('.child')[0], 'mouseenter');
			expect($('.child')[0].style.backgroundColor).to.equal('purple');

			// Reset background color
			$('.child')[0].style.backgroundColor = '';

			triggerEvent($('.child').eq(1)[0], 'click');
			expect($('.child').eq(1)[0].style.backgroundColor).to.equal('red');
			triggerEvent($('.child').eq(1)[0], 'mouseenter');
			expect($('.child').eq(1)[0].style.backgroundColor).to.equal('purple');

		});

		it('should inject the event and element into the callback', () => {
			$events.on('.test', 'click', (e, el) => {
				expect(el.className).to.equal('test');
				expect(e.type).to.equal('click');
				el.style.backgroundColor = 'red';
			});

			triggerEvent($('.test')[0], 'click');

			expect($('.test')[0].style.backgroundColor).to.equal('red');
		});

		it('should bind multiple events to a single element selection', () => {
			$events.on('.test', {
				click() {
					$('.test')[0].style.backgroundColor = 'red';
				},
				mouseenter() {
					$('.test')[0].style.backgroundColor = 'purple';
				}
			});

			triggerEvent($('.test')[0], 'click');
			expect($('.test')[0].style.backgroundColor).to.equal('red');
			triggerEvent($('.test')[0], 'mouseenter');
			expect($('.test')[0].style.backgroundColor).to.equal('purple');
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
				let state = false;

				$events.on('.test', 'click', (e, el, arg1, arg2) => {
					expect(arg1).to.equal('arg1');
					expect(arg2).to.equal('arg2');

					state = true;
				}, {
					args: ['arg1', 'arg2']
				});

				triggerEvent($('.test')[0], 'click');
				expect(state).to.equal(true);
			});
		});

		describe('scope', () => {
			it('can change the scope of the callback', () => {
				let state = false;

				$events.on('.test', 'click', function() {
					expect(this.param).to.equal('test');
					state = true;
				}, {
					scope: {
						param: 'test'
					}
				});

				triggerEvent($('.test')[0], 'click');
				expect(state).to.equal(true);
			});
		});

		describe('delegate', () => {
			it('should delegate bound events to specified ancestor', () => {
				$events.on('ref:newEl', 'click', (e) => {
					e.target.style.backgroundColor = 'red';
				}, {
					delegate: '.parent'
				});

				$('.parent')[0].appendChild(
					createDiv({ className: 'new-el' }, { 'data-ref': 'newEl'})
				);

				triggerEvent($('.new-el')[0], 'click');

				expect($('.new-el')[0].style.backgroundColor).to.equal('red');
			});
		});

		describe('context', () => {
			it('should use provided context for selection', () => {
				let ctxOne = createDiv({
						className: 'context-one'
					}, {}, true);
				let ctxOneInner = createDiv({
						className: 'context-inner'
					});

				ctxOne.appendChild(ctxOneInner);

				let ctxTwo = createDiv({
						className: 'context-two'
					}, {}, true);
				let ctxTwoInner = createDiv({
						className: 'context-inner'
					});

				ctxTwo.appendChild(ctxTwoInner);

				$events.on('.context-inner', 'click', (e, el) => {
					el.style.backgroundColor = 'red';
				}, {
					context: '.context-two'
				});

				$events.trigger('.context-inner', 'click');

				expect($('.context-inner').eq(1)[0].style.backgroundColor).to.equal('red');
			});
		});

		describe('namespace', () => {
			it('should add a namespace to event', () => {
				$events.on('.test', 'click', function() {
					$('.test')[0].style.backgroundColor = 'red';
				}, {
					namespace: 'namespace'
				});

				triggerEvent($('.test')[0], 'click');

				expect($('.test')[0].style.backgroundColor).to.equal('red');
				expect($events.bound().length).to.equal(1);
				$events.off(null, '.namespace');
				expect($events.bound().length).to.equal(0);
			});
		});

		describe('init', () => {
			beforeEach(createSingleDiv);
			afterEach(resetDOM);

			it('should fire event immediately', () => {
				$events.on('.test', 'click', () => {
					$('.test')[0].style.backgroundColor = 'red';
				}, {
					init: true
				});

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

	describe('bound', () => {
		beforeEach(() => {
			createSingleDiv();
			createMultiDiv();
		});
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('should return an array of all matching bound events', () => {
			$events.on({
				'.test': {
					click() {
						return 'click';
					},
					mouseenter() {
						return 'mouseenter';
					}
				}
			});

			expect($events.bound()).to.be.an('array');
			expect($events.bound()[0]).to.be.an('object');
			expect($events.bound()[0].el.className).to.equal('test');
			expect($events.bound()[0].ev).to.equal('click');
			expect($events.bound()[0].evt).to.equal('click');
			expect($events.bound()[0].fn()).to.equal('click');

			expect($events.bound()[1].el.className).to.equal('test');
			expect($events.bound()[1].ev).to.equal('mouseenter');
			expect($events.bound()[1].evt).to.equal('mouseenter');
			expect($events.bound()[1].fn()).to.equal('mouseenter');
		});

		it('should inspect delegate targets', () => {
			const fn = (e) => {
				e.target.style.backgroundColor = 'red';
			};

			$events.on('.other-el', 'click', fn, {
				delegate: '.parent'
			});

			$events.on('.new-el', 'click', fn, {
				delegate: '.parent'
			});

			$('.parent')[0].appendChild(
				createDiv({ className: 'new-el' }, { 'data-ref': 'newEl'})
			);

			triggerEvent($('.new-el')[0], 'click');

			expect($('.new-el')[0].style.backgroundColor).to.equal('red');
		});
	});

	describe('off', () => {
		beforeEach(createMultiDiv);
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('should remove a bound event', () => {
			$events.on('#first', 'click', (e, el) => {
				el.style.backgroundColor = 'red';
			});

			triggerEvent($('#first')[0], 'click');

			expect($('#first')[0].style.backgroundColor).to.equal('red');

			$events.off('#first');

			expect($events.bound().length).to.equal(0);
		});

		it('should remove a bound element by namespace', () => {
			$events.on('#first', 'click.namespace', (e, el) => {
				el.style.backgroundColor = 'red';
			});

			$events.on('.parent', 'click.secondNamespace', () => {
				// ..
			});

			triggerEvent($('#first')[0], 'click');

			expect($('#first')[0].style.backgroundColor).to.equal('red');

			$events.off(null, '.namespace');

			expect($events.bound().length).to.equal(1);
		});

		it('should remove custom event', () => {
			$events.addEvent('customEvent', (el) => {
				el.style.backgroundColor = 'red';
			}, (el) => {
				el.style.backgroundColor = 'blue'
			});

			$events.on('#first', 'customEvent', () => {});

			expect($('#first')[0].backgroundColor = 'red');
			expect($events.bound().length).to.equal(1);

			$events.off('#first');

			expect($events.bound().length).to.equal(0);
			expect($('#first')[0].backgroundColor = 'blue');
		});
	});

	describe('addEvent', () => {
		beforeEach(() => {
			createSingleDiv();
			createMultiDiv();
		});
		afterEach(() => {
			resetDOM();
			removeEvents();
		});

		it('should register custom event', () => {
			$events.addEvent('customEvent', (el, fn, conf) => {
				expect(el.className).to.equal('test');
				expect(fn()).to.equal('test');
				expect(conf).to.be.an('object');
				el.style.backgroundColor = 'red';
			});

			$events.on('.test', 'customEvent', () => {
				return 'test';
			});

			expect($events.bound().length).to.equal(1);
			triggerEvent($('.test')[0], 'customEvent');
			expect($('.test')[0].style.backgroundColor).to.equal('red');
		});
	});
});