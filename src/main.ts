import * as core from '@actions/core';
const {GitHub, context} = require('@actions/github')

async function run() {
  try {
      const diff = process.env.diff as string;
      var ghRepoMatch = /github.com\/(\S+)\/(\S+)/.exec(diff)
      if  ( ghRepoMatch === null ) {
	  core.setFailed("There's no repo URL in this diff")
      } else {
	  console.log(ghRepoMatch)
	  const user = ghRepoMatch[1]
	  const repo = ghRepoMatch[2]
	  console.log( "User ", user )
	  console.log( "Repo ", repo)
	  const token = core.getInput('github-token', {required: true})
	  const github = new GitHub(token, {} )
	  const milestones = await github.issues.listMilestonesForRepo( { owner: user, repo: repo } )
	  console.log(milestones)
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
