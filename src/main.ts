import * as core from '@actions/core';
const {GitHub, context} = require('@actions/github')

async function run() {
  try {
      const diff = process.env.diff as string;
      var ghRepoMatch = /github.com\/(\S+)\/(\S+)/.exec(diff)
      if  ( ghRepoMatch === null ) {
	  core.setFailed("There's no repo in this diff")
      } else {
	  console.log(ghRepoMatch)
	  const user = ghRepoMatch[1]
	  const repo = ghRepoMatch[2]
	  console.log( "User ", user )
	  console.log( "Repo ", repo)
	  const token = core.getInput('github-token', {required: true})
	  const github = new GitHub(token, {} )
	  const ghRepo = await github.repos.get( user, repo )
	  console.log(ghRepo)
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
