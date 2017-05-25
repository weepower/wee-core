export function createSingleDiv() {
	return createDiv({
		textContent: 'test',
		className: 'test',
		style: {
			width: '100px',
			height: '80px',
			border: '1px solid',
			padding: '15px 10px',
			margin: '10px'
		}
	}, {
		'data-ref': 'test'
	}, true);
}

export function createDiv(options, attributes, append = false) {
	let div = document.createElement('div');

	for (let option in options) {
		if (option === 'style') {
			for (let styleOption in options[option]) {
				div.style[styleOption] = options[option][styleOption];
			}
		} else {
			div[option] = options[option];
		}
	}

	for (let attribute in attributes) {
		div.setAttribute(attribute, attributes[attribute]);
	}

	if (append) {
		document.body.appendChild(div);
	}

	return div;
}

export function createMultiDiv() {
	let html = `<main class="grandparent">
					<div class="parent">
						<div id="first" class="child" data-ref="child">1</div>
						<div class="child" data-ref="child">2</div>
						<div class="child other-class" data-ref="child">3</div>
					</div>
				</main>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

export function createForm() {
	let html = `<form action="#" id="form">
					<input class="input" type="text" name="input" value="inputValue">
					<input class="checkbox" type="checkbox" name="checkbox" value="checkboxValue" checked required>
					<input class="radio" type="radio" name="radio1" value="radioValue" checked>
					<input class="array-input" type="text" name="name[]" value="name1">
					<input type="text" name="email[]" value="email1">
					<input class="array-input" type="text" name="name[]" value="name2">
					<input type="text" name="email[]" value="email2">
					<select class="select" name="select">
						<option value="selectValue1" selected>Option 1</option>
						<option value="selectValue2">Option 2</option>
					</select>
					<select class="multi-select" name="select-multiple" multiple>
						<option value="selectValue1" selected>Option 1</option>
						<option value="selectValue2" selected>Option 2</option>
					</select>
					<select class="optgroup-select" name="optgroup">
						<optgroup>
							<option value="optgroupValue1" selected>Optgroup 1</option>
							<option value="optgroupValue2">Optgroup 2</option>
						</optgroup>
					</select>
					<textarea name="textarea" class="textarea">Text Area</textarea>
				</form>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

export function createList() {
	let html = `<ul class="parent">
					<li id="first" class="child"><span>1</span></li>
					<li class="child">2</li>
					<li class="child" data-ref="last">3</li>
				</ul>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

export function resetBaseStyling() {
	let block = `<style>
					* {
						margin: 0;
						padding: 0;
						border: 0;
				</style>`,
	fragment = document.createRange().createContextualFragment(block);
	document.head.appendChild(fragment);
}

export function resetDOM() {
	let body = document.querySelector('body');

	body.innerHTML = '';
	body.style.width = '500px';
}

// Test scaffolding methods
export function isIE() {
	if (navigator.appName == 'Microsoft Internet Explorer') {
		let ua = navigator.userAgent,
			re  = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');

		return re.test(ua);
	} else if (navigator.appName == 'Netscape') {
		let ua = navigator.userAgent,
			re  = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');

		return re.test(ua);
	}

	return false;
}

export function isEdge() {
	return navigator.appName == 'Netscape' &&
		/Edge/.test(navigator.userAgent);
}