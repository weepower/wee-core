import sinon from 'sinon';
import * as key from 'routes/key';
import * as push from 'routes/push-state';

describe('Router: push-state', () => {
    beforeEach(() => {
        window.history.replaceState(0, '', '/');
    });

    it('should set key on window.history state object', done => {
        let stub = sinon.stub(key, 'genTimeKey').returns(1234);

        // Add two entries so that going back to previous route will
        // yield a generated state object
        push.pushState('/path1');
        push.pushState('/path2');

        window.addEventListener('popstate', e => {
            expect(e.state.key).to.exist;
            expect(e.state.key).to.equal(1234);
            done();
        });

        window.history.back();
        stub.restore();
    });

    it('should set window.location as fallback in case of error', () => {
        // Cause call to pushState to throw error
        const oldPush = window.history.pushState;
        window.history.pushState = undefined;

        const fakeWindow = {
            location: {
                assign: sinon.spy()
            }
        };

        push.pushState.call(fakeWindow, '/path');

        expect(fakeWindow.location.assign.called).to.be.true;
        // Restore pushState
        window.history.pushState = oldPush;
    });
});
