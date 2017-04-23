const PARAMETER_REGEXP = /([:*])(\w+)/g;
const WILDCARD_REGEXP = /\*/g;
const REPLACE_VARIABLE_REGEXP = '([^\/]+)';
const REPLACE_WILDCARD = '(?:.*)';
const FOLLOWED_BY_SLASH_REGEXP = '(?:\/$|$)';
const MATCH_REGEXP_FLAGS = '';
let _routes = [];

export function add(routes) {
	routes.forEach(route => {
		_routes.push(route);
	});
}

export default {
	map(routes) {
		add(routes);
	},
	routes(index) {
		if (index && _routes[index]) {
			return _routes[index];
		}

		return _routes;
	}
};