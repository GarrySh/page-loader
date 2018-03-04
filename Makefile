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

debug: build
	mkdir /tmp/el11t
	DEBUG="page-loader:*" dist/bin/page-loader-garrysh.js https://htmlacademy.ru -o /tmp/el11t
	rm -rf /tmp/el11t
