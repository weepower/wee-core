import $router from 'wee-routes';
import Transition from 'routes/transitions';
import { $hasClass } from 'dom/index';
import setPath from '../../helpers/routes';
import sinon from 'sinon';

describe('Router: transitions', () => {
    const hideClass = '-is-hidden';

    before(() => {
        setPath('/');
    });

    beforeEach(() => {
        $router.reset();
    });

    it('should remove a class from the designated element on initial evaluation', (done) => {
        let state = false;
        const finish = function() {
            expect($hasClass(document.body, hideClass)).to.be.false;
            expect(state).to.be.true;
        }

        $router({
            transition: {
                target: 'body',
                class: hideClass,
                timeout: 200
            }
        }).map([
            {
                path: '/',
                init() {
                    // Make sure class is not added by router on initial evaluation
                    state = true;
                    expect(document.body.className).to.equal('');
                    document.body.className = hideClass;
                    expect($hasClass(document.body, hideClass)).to.be.true;
                }
            }
        ]).run().then(finish, finish).then(done, done);
    });

    describe('with history navigation', () => {
        let beforeSpy;

        beforeEach(() => {
            beforeSpy = sinon.stub();
            beforeSpy.callsArg(2);

            setPath('/');
            $router.reset();
        });

        it('should add and then remove a class on history navigation', () => {
            let bodyHadHideClass = false;
            let events = [];
            let originalAddEventListener = document.body.addEventListener;

            // Mock addEventListener on body element
            document.body.addEventListener = function(event, method) {
                events.push(method);
            };

            let finish = function() {
                expect(bodyHadHideClass).to.be.true;
                expect(beforeSpy.calledOnce).to.be.true;
                expect($hasClass(document.body, hideClass)).to.be.false;
            }

            return $router({
                transition: {
                    target: 'body',
                    class: hideClass
                }
            }).map([
                { path: '/' },
                {
                    path: '/other',
                    before: beforeSpy, // Ensure that init is getting executed
                    init() {
                        bodyHadHideClass = $hasClass(document.body, hideClass);
                    }
                }
            ]).run().then(() => {
                let promise = $router.push('/other');

                // Trigger fake events
                events.forEach(fn => fn());

                // Reset addEventListener on body
                document.body.addEventListener = originalAddEventListener;

                return promise;
            }).then(finish, finish);
        });

        it('should execute enter and leave callbacks', () => {
            let enterSpy = sinon.spy();
            let leaveSpy = sinon.stub();
            leaveSpy.callsArg(2);

            let finish = function() {
                expect(beforeSpy.callCount).to.equal(1);
                expect(enterSpy.callCount).to.equal(2); // Initial run + push
                expect(leaveSpy.callCount).to.equal(1);
            }

            return $router({
                transition: {
                    enter: enterSpy,
                    leave: leaveSpy
                }
            }).map([
                { path: '/' },
                {
                    path: '/other',
                    before: beforeSpy // Ensure that init is getting executed
                }
            ]).run().then(() => {
                return $router.push('/other');
            }).then(finish, finish);
        });
    });

    describe('enter', () => {
        it('should remove class to designated element', () => {
            document.body.className = hideClass;
            expect($hasClass(document.body, hideClass)).to.be.true;

            const transition = new Transition({
                target: 'body',
                class: hideClass
            });

            transition.enter();

            expect($hasClass(document.body, hideClass)).to.be.false;
        });

        it('should execute enter callback', () => {
            let to = {};
            let from = {};
            let spy = sinon.spy();

            const transition = new Transition({
                enter: spy
            });

            transition.enter(to, from);

            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(to, from)).to.be.true;
        });
    });

    describe('leave', () => {
        it('should add class to designated element', () => {
            const transition = new Transition({
                target: 'body',
                class: hideClass
            });

            transition.leave();

            expect($hasClass(document.body, hideClass)).to.be.true;
            document.body.className = '';
        });

        it('should execute leave callback', () => {
            let to = {};
            let from = {};
            let spy = sinon.spy();
            const transition = new Transition({
                leave: spy
            });

            transition.leave(to, from);

            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(to, from)).to.be.true;
        });
    });
});
