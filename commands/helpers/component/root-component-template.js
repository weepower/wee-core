import { RouteHandler } from 'wee-routes';
import Vue from 'vue';
import ${variableName}Options from './index.vue';

// Create component constructor
export const ${constructorName} = Vue.extend(${variableName}Options);

let ${variableName};

// Register and mount component
export default new RouteHandler({
    init() {
        // TODO: Set mounting selector
        ${variableName} = new ${constructorName}().$mount('.js-${fileName}');
    },
    unload() {
        ${variableName}.$destroy();
    },
});
