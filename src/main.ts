import * as core from '@actions/core';

async function run() {
  try {
    const diff = core.getInput('diff');
    core.debug(`Got ${diff}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
