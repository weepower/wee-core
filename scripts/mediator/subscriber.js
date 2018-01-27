import guid from './guid';

export default class Subscriber {
    constructor(fn) {
        this.id = guid();
        this.fn = fn;
        this.topic = null;
    }
}
