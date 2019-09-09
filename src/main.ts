import * as core from '@actions/core';

async function run() {
  try {
      const diff = core.getInput('diff');
      const ghRepo = /github.com\/(\w+)\/(\w+)/.exec(diff)
      console.log( ghRepo )
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
