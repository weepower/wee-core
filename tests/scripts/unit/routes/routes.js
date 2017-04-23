import router from 'routes';

const basicRoutes = [
	{
		path: '/',
		handler() {
			//
		}
	},
	{
		path: '/about',
		handler() {
			//
		}
	}
];

describe('Routes', () => {
	describe('map', () => {
		it('should accept an array of objects', () => {
			router.map(basicRoutes);

			expect(router.routes()).to.be.an('array');
		});
	});

	describe('routes', () => {
		it('should return route array', () => {
			router.map(basicRoutes);

			expect(router.routes()).to.be.an('array');
		});

		it('should return the route at indicated index', () => {
			router.map(basicRoutes);

			expect(router.routes(1)).to.be.an('object');
			expect(router.routes(2).path).to.equal('/');
		});
	});
});