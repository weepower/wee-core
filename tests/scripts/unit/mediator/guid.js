import guid from 'mediator/guid';

describe('Mediator: guidGenerator', () => {
    it('should generate random string', () => {
        const id = guid();

        expect(id).to.be.string;
        expect(id.length).to.equal(36);
    });
});
