class ClassListMock {
	constructor(classList=[]) {
    this.classList = classList
  }

	remove(item) {
		const index = this.classList.indexOf(item);
		if (index > -1) {
			this.classList.splice(index, 1);
		}
	}

	add(item) {
		const index = this.classList.indexOf(item);
		if (index === -1) {
			this.classList.push(item);
		}
	}
}

class ElementMock {
	constructor(tagName, src, rel) {
		this.tagName = tagName;
		this.src = src;
		this.rel = rel;
		this.href = src;
		this.attributes = {};
	}

	setAttribute(key, value) {
		this.attributes[key] = value;
	}
}

class StyleSheetMock {
	constructor(href) {
		this.href = href;
	}
}

class ScriptMock {
	constructor(src) {
		this.src = src;
	}
}

class StorageMock {
	constructor(values) {
		this.values = this.values || {};
	}

	setItem(key, value) {
		this.values[key] = value;
	}

	getItem(key) {
		return this.values[key];
	}
}

class DocumentMock {
	constructor(options) {
		options = options || {};
		this.classList = options.classList || new ClassListMock();
		this.elements = options.elements || [];
		this.styleSheets = options.styleSheets || [];
		this.scripts = options.scripts || [];
		this.currentScript = options.currentScript;
		this.documentElement = {
			classList: this.classList
		}
		this.children = [];
		this.head = {};
		this.createElement = (type) => {
			return new ElementMock(type);
		};
		this.head.appendChild = (element) => {
			this.children.push(element);
			this.elements.push(element);
		};
  }

	getElementsByTagName(tagName) {
		return this.elements.filter(element => element.tagName === tagName);
	}
}

class WindowMock {
	constructor(options) {
		options = options || {};
		this.document = options.document;
		this.localStorage = options.localStorage || new StorageMock();
		this.sessionStorage = options.sessionStorage || new StorageMock();
		this.eventListeners = [];
	}
	addEventListener(event, listener) {
		this.eventListeners.push(event, listener);
	}
}

export { WindowMock, DocumentMock, ElementMock, ClassListMock, StyleSheetMock, ScriptMock, StorageMock };
