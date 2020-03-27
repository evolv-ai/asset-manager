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
	}
}

class DocumentMock {
	constructor(elements=[] ,classList=new ClassListMock()) {
		this.classList = classList;
		this.elements = elements;
		this.documentElement = {
			classList: this.classList
		}
  }

	getElementsByTagName(tagName) {
		return this.elements.filter(element => element.tagName === tagName);
	}
}

export { DocumentMock, ElementMock, ClassListMock };
