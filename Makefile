install:
	npm ci
lint:
	npx eslint .
push:
	git push -u origin main
build:
	NODE_ENV=production npx webpack
