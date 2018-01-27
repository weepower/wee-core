export default class StoreError extends Error {
    constructor(message) {
        super(message);

        this.errorType = 'StoreError';
    }
}
