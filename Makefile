install:
	npm install

start:
	npm run babel-node -- src/bin/index.js

publish:
	npm publish

lint:
	npm run eslint .

test:
	npm test

watch:
	npm test -- --watch

build:
	rm -rf dist
	npm run build
	chmod +x dist/bin/*

clear:
	rm -rf dist
	rm -rf node_modules
