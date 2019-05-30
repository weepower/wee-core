import { parseLocation } from 'routes/location';
import { createRoute, isRedirect, isSameRoute } from 'routes/route';

describe('Router: route', () => {
    describe('isSameRoute', () => {
        it('should determine equality of simple paths', () => {
            let route = createRoute(parseLocation('/path'));
            let test1 = createRoute(parseLocation('/path'));
            let test2 = createRoute(parseLocation('/path/'));
            let test3 = createRoute(parseLocation('/path2'));

            expect(isSameRoute(route, test1)).to.be.true;
            expect(isSameRoute(route, test2)).to.be.true;
            expect(isSameRoute(route, test3)).to.be.false;
        });

        it('should determine equality of URL with query string', () => {
            let route = createRoute(parseLocation('/path?some=value'));
            let test1 = createRoute(parseLocation('/path?some=value'));
            let test2 = createRoute(parseLocation('/path/?some=value'));
            let test3 = createRoute(parseLocation('/path?some=value&other=value'));

            expect(isSameRoute(route, test1)).to.be.true;
            expect(isSameRoute(route, test2)).to.be.true;
            expect(isSameRoute(route, test3)).to.be.false;
        });

        it('should determine equality of URL with hash', () => {
            let route = createRoute(parseLocation('/path#section-a'));
            let test1 = createRoute(parseLocation('/path#section-a'));
            let test2 = createRoute(parseLocation('/path/#section-a'));
            let test3 = createRoute(parseLocation('/path#section-b'));

            expect(isSameRoute(route, test1)).to.be.true;
            expect(isSameRoute(route, test2)).to.be.true;
            expect(isSameRoute(route, test3)).to.be.false;
        });

        it('should determine equality of URL with hash and query string', () => {
            let route = createRoute(parseLocation('/path?some=value#section-a'));
            let test1 = createRoute(parseLocation('/path?some=value#section-a'));
            let test2 = createRoute(parseLocation('/path/?some=value#section-a'));
            let test3 = createRoute(parseLocation('/path?some=value#section-b'));
            let test4 = createRoute(parseLocation('/path?some=value&other=value#section-a'));

            expect(isSameRoute(route, test1)).to.be.true;
            expect(isSameRoute(route, test2)).to.be.true;
            expect(isSameRoute(route, test3)).to.be.false;
            expect(isSameRoute(route, test4)).to.be.false;
        });
    });

    describe('isRedirect', () => {
        it('should determine if value could be redirect input', () => {
            expect(isRedirect('/path')).to.be.true;
            expect(isRedirect({ path: '/path' })).to.be.true;
            expect(isRedirect({ name: 'routeName' })).to.be.true;
            expect(isRedirect({})).to.be.false;
        });
    });
});
