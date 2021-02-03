import { outdent } from 'outdent';

/**
 * Tagged template helper for JavaScript
 *
 * Can be used by JetBrain's Language Injection capability to provide inline syntax highlighting.
 *
 * @param strings
 * @param values
 *
 * @see {@link https://www.jetbrains.com/help/idea/2020.1/language-injection-settings-generic-javascript.html}
 */
export function js(strings: TemplateStringsArray, ...values: unknown[]) {
	return outdent(strings, ...values);
}
