export function toContextKey(value) {
	return value.replace(/^evolv_/, '').replace(/_/g, '.');
}
