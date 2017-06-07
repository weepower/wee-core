// https://gist.github.com/WebReflection/1168884
export default function mockCreateElement(
	createElement, // the native one
	createResponse // the function 'in charge'
) {
	return function (nodeName) {
		let result,
			src;

		// if we are creating a script
		if (/^script$/i.test(nodeName)) {
			// result will be a place holder
			result = createElement.call(document, 'meta');

			// we need to monitor the src property
			Object.defineProperty(result, 'src', {
				get: function () {
					return src;
				},

				// when set ...
				set: function ($src) {
					// Mock failure of script tag
					if ($src.indexOf('error') > -1 && this.onerror) {
						return this.onerror();
					}

					// we can check periodically ...
					function poll() {
						// if the placeholder is in DOM
						if (result.parentNode) {
							// in this case we can put a real script
							result = result.parentNode.insertBefore(
								createElement.call(document, 'script'),
								result
							);

							// and set the encoded src
							result.src = 'data:text/javascript;base64,' +
								btoa(createResponse.call(result, src));
						} else {
							// no DOM, no loading ... try later
							setTimeout(poll, 100);
						}
					}

					// store the src
					src = $src;
					// and start checking
					poll();
				}
			});
		} else {
			// just return the element
			result = createElement.call(document, nodeName);
		}

		return result;
	};
};