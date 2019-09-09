import * as core from '@actions/core';

async function run() {
  try {
      const diff = core.getInput('diff');
      const ghRepo = diff.match(/github.com/(\w+)\/(\w+)/)
      console.log( ghRepo )
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
