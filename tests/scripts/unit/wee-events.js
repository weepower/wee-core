import $ from 'wee-dom';
import $events from 'wee-events';
import { createSingleDiv, resetDOM } from '../helpers/dom';

describe('Events', () => {
	describe('on', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should bind an event to selected element', () => {
			$events.on('click', '.test', () => {
				$('.test')[0].style.backgroundColor = 'red';
			});

			$('.test')[0].click();

			expect($('.test')[0].style.backgroundColor).to.equal('red');
		})
	});
});