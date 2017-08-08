import { RouteHandler } from 'wee-routes';
import Vue from 'vue';
import ${variableName} from './index.vue';

// Create component constructor
export const ${constructorName} = Vue.extend(${variableName});

// Register and mount component
export default new RouteHandler({
	init() {
		// TODO: Set mounting selector
		new ${constructorName}().$mount('.selector');
	}
});