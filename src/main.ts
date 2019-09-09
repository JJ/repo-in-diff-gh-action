import * as core from '@actions/core';

async function run() {
  try {
      const diff = process.env.DIFF as string;
      const ghRepo = /github.com\/(\w+)\/(\w+)/.exec(diff)
      console.log( diff )
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
