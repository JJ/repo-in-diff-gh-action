import * as core from '@actions/core';
const {GitHub, context} = require('@actions/github')

async function run() {
  try {
      const diff = process.env.diff as string;
      var ghRepoMatch = /github.com\/(\S+)\/(\S+)/.exec(diff)
      if  ( ghRepoMatch === null ) {
	  core.setFailed("There's no repo URL in this diff")
      } else {
	  const user = ghRepoMatch[1]
	  const repo = ghRepoMatch[2]
	  const token = core.getInput('github-token', {required: true})
	  const github = new GitHub(token, {} )
	  const milestones = await github.issues.listMilestonesForRepo( { owner: user, repo: repo } )
	  const minMilestones = +core.getInput('minMilestones')
	  if ( minMilestones && milestones.data.length < minMilestones ) {
              core.setFailed( "There should be at least " + minMilestones + " milestone(s)");
	  }
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
