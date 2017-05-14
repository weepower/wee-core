import { match } from './route-matcher';

let current = match();

export function getCurrent() {
	return current;
}

export function setCurrent() {
	current = match();
}