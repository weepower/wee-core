import sinon from 'sinon';
import $router from 'wee-routes';
import { history } from 'wee-routes';
import { _win } from 'core/variables';
import { parseLocation } from 'routes/location';
import setPath from '../../helpers/routes';

describe('Router: history', () => {
    after($router.reset);

    beforeEach(() => {
        $router.reset();
        _win.history.replaceState(0, '', '/');
    });

    it('should execute onReady after $router has already been initialized', done => {
        let spy = sinon.spy();
        const finish = function() {
            expect(history.ready).to.be.true;

            $router.onReady(spy);

            expect(spy.called).to.be.true;
        };

        $router.map([
            { path: '/' }
        ]).run().then(finish, finish).then(done, done);
    });

    describe('navigate', () => {
        it('should throw SameRouteError when navigating to current URL', done => {
            const resolveSpy = sinon.spy();
            const rejectSpy = sinon.spy();
            const finish = function() {
                expect(resolveSpy.called).to.be.false;
                expect(rejectSpy.called).to.be.true

                const error = rejectSpy.args[0][0];
                // Should return on first rejection
                expect(rejectSpy.args[0].length).to.equal(1);
                expect(error.errorType).to.equal('SameRouteError');
                expect(error.message).to.equal('Attempted to navigate to /');
            }

            $router.map([
                { path: '/' }
            ]).run().then(() => {
                return history.navigate('/');
            }, done).then(resolveSpy, rejectSpy).then(finish, finish).then(done, done);
        });
    });

    describe('popstate', () => {
        let stub;
        let origScrollBehavior;

        beforeEach(() => {
            stub = sinon.stub(history, 'navigate');
            origScrollBehavior = $router.settings.scrollBehavior;
            $router.settings.scrollBehavior = false;
        });

        afterEach(() => {
            stub.restore();
            $router.settings.scrollBehavior = origScrollBehavior;
            $router.reset();
        });

        it('should return early if navigating to internal link URL', (done) => {
            stub.returns(new Promise((resolve) => resolve()));

            // Set current path
            setPath('/');
            history.current = parseLocation();

            // Navigate to new page link
            setPath('/some-path');

            history.popstate(); // Should execute 'navigate'
            history.current = parseLocation();

            // Navigate to internal link
            setPath('/some-path#id');

            history.popstate(); // Should not execute 'navigate'

            setTimeout(() => {
                expect(stub.calledOnce).to.be.true;
                done();
            }, 0);
        });

        it('should execute error handlers when navigation fails', (done) => {
            let spy = sinon.spy();

            $router.onError(spy);
            stub.returns(Promise.reject(new Error()));

            history.current = parseLocation();

            setPath('/new-url');
            // Navigate should catch error and call registered onError method
            history.popstate();

            setTimeout(() => {
                expect(stub.calledOnce).to.be.true;
                expect(spy.calledOnce).to.be.true;
                done();
            }, 50);
        });
    });
});
