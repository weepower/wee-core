export default class RouteHandler {
	constructor(conf) {
		this.processed = false;
		this.init = conf.init;
		this.beforeInit = null;
		this.beforeUpdate = null;
		this.init = null;
		this.update = null;
	}
}