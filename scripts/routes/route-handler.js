import { genKey } from './key';

export default class RouteHandler {
    constructor(conf) {
        this.id = genKey();
        this.beforeInit = conf.beforeInit || null;
        this.beforeUpdate = conf.beforeUpdate || null;
        this.init = conf.init || null;
        this.update = conf.update || null;
        this.unload = conf.unload || null;
    }
}
