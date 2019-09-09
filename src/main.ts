import * as core from '@actions/core';
const {GitHub, context} = require('@actions/github')

async function run() {
  try {
      const diff = process.env.diff as string;
      var ghRepoMatch = /github.com\/(\w+)\/(\w+)/.exec(diff)
      if  ( ghRepoMatch === null ) {
	  core.setFailed("There's no repo in this diff")
      } else {
	  const user = ghRepoMatch[1]
	  const repo = ghRepoMatch[2]
	  const token = core.getInput('github-token', {required: true})
	  const github = new GitHub(token, {} )
	  const ghRepo = github.repos.get( user, repo )
	  console.log(ghRepo)
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();