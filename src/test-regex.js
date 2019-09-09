#!/usr/bin/env node

const diff="github.com/foo/bar";
console.log(/github.com\/(\w+)\/(\w+)/.exec(diff));
