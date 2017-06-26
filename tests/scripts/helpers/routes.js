export default function setPath(path) {
	window.history.replaceState(0, '', path);
}