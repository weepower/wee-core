/**
 * Copyright (c) 2015, Patrick Steele-Idem
 * https://github.com/patrick-steele-idem/morphdom
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

(function(W, D) {
	// Create a range object for efficently rendering strings to elements.
	var range,
		toElement = function(str) {
			var fragment;

			if (! range && ! W._legacy) {
				range = D.createRange();
				range.selectNode(D.body);
			}

			if (range && range.createContextualFragment) {
				fragment = range.createContextualFragment(str);
			} else {
				fragment = D.createElement('body');
				fragment.innerHTML = str;
			}

			return fragment.childNodes[0];
		},
		specialElHandlers = {
			/**
			 * Needed for IE. Apparently IE doesn't think
			 * that "selected" is an attribute when reading
			 * over the attributes using selectEl.attributes
			 */
			OPTION: function(fromEl, toEl) {
				if ((fromEl.selected = toEl.selected)) {
					fromEl.setAttribute('selected', '');
				} else {
					fromEl.removeAttribute('selected', '');
				}
			},

			/**
			 * The "value" attribute is special for the <input> element
			 * since it sets the initial value. Changing the "value"
			 * attribute without changing the "value" property will have
			 * no effect since it is only used to the set the initial value.
			 * Similar for the "checked" attribute.
			 */
			INPUT: function(fromEl, toEl) {
				fromEl.checked = toEl.checked;

				if (fromEl.value != toEl.value) {
					fromEl.value = toEl.value;
				}

				if (! toEl.hasAttribute('checked')) {
					fromEl.removeAttribute('checked');
				}

				if (! toEl.hasAttribute('value')) {
					fromEl.removeAttribute('value');
				}
			},

			TEXTAREA: function(fromEl, toEl) {
				var newValue = toEl.value;

				if (fromEl.value != newValue) {
					fromEl.value = newValue;
				}

				if (fromEl.firstChild) {
					fromEl.firstChild.nodeValue = newValue;
				}
			}
		},
		noop = function() {};

	/**
	 * Loop over all of the attributes on the target node and make sure the
	 * original DOM node has the same attributes. If an attribute
	 * found on the original node is not on the new node then remove it from
	 * the original node
	 * @param  {HTMLElement} fromNode
	 * @param  {HTMLElement} toNode
	 */
	var morphAttrs = function(fromNode, toNode) {
		var attrs = toNode.attributes,
			foundAttrs = {},
			attr,
			attrName,
			attrValue,
			i;

		for (i = attrs.length - 1; i >= 0; i--) {
			attr = attrs[i];

			if (attr.specified !== false) {
				attrName = attr.name;
				attrValue = attr.value;
				foundAttrs[attrName] = true;

				if (fromNode.getAttribute(attrName) !== attrValue) {
					fromNode.setAttribute(attrName, attrValue);
				}
			}
		}

		// Delete any extra attributes found on the original DOM element that
		// weren't found on the target element.
		attrs = fromNode.attributes;

		for (i = attrs.length - 1; i >= 0; i--) {
			attr = attrs[i];

			if (attr.specified !== false) {
				attrName = attr.name;

				if (! foundAttrs.hasOwnProperty(attrName)) {
					fromNode.removeAttribute(attrName);
				}
			}
		}
	};

	/**
	 * Copies the children of one DOM element to another DOM element
	 */
	var moveChildren = function(fromEl, toEl) {
		var curChild = fromEl.firstChild;

		while (curChild) {
			var nextChild = curChild.nextSibling;

			toEl.appendChild(curChild);

			curChild = nextChild;
		}

		return toEl;
	};

	W.view.diff = function(fromNode, toNode, options) {
		if (! options) {
			options = {};
		}

		if (typeof toNode === 'string') {
			toNode = toElement(toNode);
		}

		// Used to save off DOM elements with IDs
		var savedEls = {},
			unmatchedEls = {},
			onNodeDiscarded = options.onNodeDiscarded || noop,
			onBeforeMorphEl = options.onBeforeMorphEl || noop,
			onBeforeMorphElChildren = options.onBeforeMorphElChildren || noop,
			onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop,
			childrenOnly = options.childrenOnly === true;

		var removeNodeHelper = function(node, nestedInSavedEl) {
			var id = node.id;

			// If the node has an ID then save it off since we will want
			// to reuse it in case the target DOM tree has a DOM element
			// with the same ID
			if (id) {
				savedEls[id] = node;
			} else if (! nestedInSavedEl) {
				// If we are not nested in a saved element then we know that this node has been
				// completely discarded and will not exist in the final DOM.
				onNodeDiscarded(node);
			}

			if (node.nodeType === 1) {
				var curChild = node.firstChild;

				while (curChild) {
					removeNodeHelper(curChild, nestedInSavedEl || id);

					curChild = curChild.nextSibling;
				}
			}
		};

		var walkDiscardedChildNodes = function(node) {
			if (node.nodeType === 1) {
				var curChild = node.firstChild;

				while (curChild) {
					if (! curChild.id) {
						// We only want to handle nodes that don't have an ID to avoid double
						// walking the same saved element.
						onNodeDiscarded(curChild);

						// Walk recursively
						walkDiscardedChildNodes(curChild);
					}

					curChild = curChild.nextSibling;
				}
			}
		};

		var removeNode = function(node, parentNode, alreadyVisited) {
			if (onBeforeNodeDiscarded(node) === false) {
				return;
			}

			parentNode.removeChild(node);

			if (alreadyVisited) {
				if (! node.id) {
					onNodeDiscarded(node);
					walkDiscardedChildNodes(node);
				}
			} else {
				removeNodeHelper(node);
			}
		};

		var morphEl = function(fromEl, toEl, alreadyVisited, childrenOnly) {
			if (toEl.id) {
				// If an element with an ID is being morphed then it is will be in the final
				// DOM so clear it out of the saved elements collection
				delete savedEls[toEl.id];
			}

			if (! childrenOnly) {
				if (onBeforeMorphEl(fromEl, toEl) === false) {
					return;
				}

				morphAttrs(fromEl, toEl);

				if (onBeforeMorphElChildren(fromEl, toEl) === false) {
					return;
				}
			}

			if (fromEl.tagName != 'TEXTAREA') {
				var curToNodeChild = toEl.firstChild;
				var curFromNodeChild = fromEl.firstChild;
				var curToNodeId;

				var fromNextSibling;
				var toNextSibling;
				var savedEl;
				var unmatchedEl;

				outer: while (curToNodeChild) {
					toNextSibling = curToNodeChild.nextSibling;
					curToNodeId = curToNodeChild.id;

					while (curFromNodeChild) {
						var curFromNodeId = curFromNodeChild.id;
						fromNextSibling = curFromNodeChild.nextSibling;

						if (! alreadyVisited) {
							if (curFromNodeId && (unmatchedEl = unmatchedEls[curFromNodeId])) {
								unmatchedEl.parentNode.replaceChild(curFromNodeChild, unmatchedEl);
								morphEl(curFromNodeChild, unmatchedEl, alreadyVisited);
								curFromNodeChild = fromNextSibling;

								continue;
							}
						}

						var curFromNodeType = curFromNodeChild.nodeType;

						if (curFromNodeType === curToNodeChild.nodeType) {
							var isCompatible = false;

							if (curFromNodeType === 1) {
								// Both nodes being compared are Element nodes
								if (curFromNodeChild.tagName === curToNodeChild.tagName) {
									// We have compatible DOM elements
									if (curFromNodeId || curToNodeId) {
										// If either DOM element has an ID then we handle
										// those differently since we want to match up
										// by ID
										if (curToNodeId === curFromNodeId) {
											isCompatible = true;
										}
									} else {
										isCompatible = true;
									}
								}

								if (isCompatible) {
									// We found compatible DOM elements so transform the current "from" node
									// to match the current target DOM node.
									morphEl(curFromNodeChild, curToNodeChild, alreadyVisited);
								}
							} else if (curFromNodeType === 3) {
								// Both nodes being compared are Text nodes
								isCompatible = true;
								// Simply update nodeValue on the original node to change the text value
								curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
							}

							if (isCompatible) {
								curToNodeChild = toNextSibling;
								curFromNodeChild = fromNextSibling;

								continue outer;
							}
						}

						// No compatible match so remove the old node from the DOM and continue trying
						// to find a match in the original DOM
						removeNode(curFromNodeChild, fromEl, alreadyVisited);
						curFromNodeChild = fromNextSibling;
					}

					if (curToNodeId) {
						if ((savedEl = savedEls[curToNodeId])) {
							morphEl(savedEl, curToNodeChild, true);
							curToNodeChild = savedEl;
							// We want to append the saved element instead
						} else {
							// The current DOM element in the target tree has an ID
							// but we did not find a match in any of the corresponding
							// siblings. We just put the target element in the old DOM tree
							// but if we later find an element in the old DOM tree that has
							// a matching ID then we will replace the target element
							// with the corresponding old element and morph the old element
							unmatchedEls[curToNodeId] = curToNodeChild;
						}
					}

					// If we got this far then we did not find a candidate match for our "to node"
					// and we exhausted all of the children "from" nodes. Therefore, we will just
					// append the current "to node" to the end
					fromEl.appendChild(curToNodeChild);

					curToNodeChild = toNextSibling;
					curFromNodeChild = fromNextSibling;
				}

				// We have processed all of the "to nodes". If curFromNodeChild is non-null then
				// we still have some from nodes left over that need to be removed
				while (curFromNodeChild) {
					fromNextSibling = curFromNodeChild.nextSibling;
					removeNode(curFromNodeChild, fromEl, alreadyVisited);
					curFromNodeChild = fromNextSibling;
				}
			}

			var specialElHandler = specialElHandlers[fromEl.tagName];

			if (specialElHandler && ! fromEl.hasAttribute('data-persist')) {
				specialElHandler(fromEl, toEl);
			}
		};

		var morphedNode = fromNode,
			morphedNodeType = morphedNode.nodeType,
			toNodeType = toNode.nodeType;

		if (! childrenOnly) {
			// Handle the case where we are given two DOM nodes that are not
			// compatible (e.g. <div> --> <span> or <div> --> TEXT)
			if (morphedNodeType === 1) {
				if (toNodeType === 1) {
					if (fromNode.tagName !== toNode.tagName) {
						onNodeDiscarded(fromNode);
						morphedNode = moveChildren(fromNode, D.createElement(toNode.tagName));
					}
				} else {
					// Going from an element node to a text node
					morphedNode = toNode;
				}
			} else if (morphedNodeType === 3) {
				// Text node
				if (toNodeType === 3) {
					morphedNode.nodeValue = toNode.nodeValue;
					return morphedNode;
				} else {
					// Text node to something else
					morphedNode = toNode;
				}
			}
		}

		if (morphedNode === toNode) {
			// The "to node" was not compatible with the "from node"
			// so we had to toss out the "from node" and use the "to node"
			onNodeDiscarded(fromNode);
		} else {
			morphEl(morphedNode, toNode, false, childrenOnly);

			// Fire the "onNodeDiscarded" event for any saved elements
			// that never found a new home in the morphed DOM
			for (var savedElId in savedEls) {
				if (savedEls.hasOwnProperty(savedElId)) {
					var savedEl = savedEls[savedElId];
					onNodeDiscarded(savedEl);
					walkDiscardedChildNodes(savedEl);
				}
			}
		}

		if (! childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
			// If we had to swap out the from node with a new node because the old
			// node was not compatible with the target node then we need to
			// replace the old DOM node in the original DOM tree. This is only
			// possible if the original DOM node was part of a DOM tree which
			// we know is the case if it has a parent node.
			fromNode.parentNode.replaceChild(morphedNode, fromNode);
		}

		return morphedNode;
	};
})(Wee, document);