import { genKey } from './key';

export default class RouteHandler {
	constructor(conf) {
		this.id = genKey();
		this.init = conf.init;
		this.beforeInit = null;
		this.beforeUpdate = null;
		this.init = null;
		this.update = null;
	}
}