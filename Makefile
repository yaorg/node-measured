SHELL := /bin/bash
NPM = npm

test:
	@$(NPM) test

.PHONY: test
