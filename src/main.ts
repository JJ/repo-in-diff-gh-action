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
	  const options = await github.issues.listForRepo( { owner: user, repo: repo, state: "closed" } )
	  const issues = await github.paginate( options )
          issues.forEach( async function( issue ) {
              if ( ! issue.pull_request ) {
                  const events = await github.issues.listEvents( { owner: user,
                                                                   repo: repo,
                                                                   issue_number: issue.number } )
                  console.log(events)
                  if ( !events ) {
                      core.setFailed( "Issue " + issue.number + " wasn't closed with a commit");
	          } else {
                      events.forEach( async function( event ) {
                          if ( event.event == 'closed' && ! event.commit_id ) {
                              core.setFailed( "Issue " + issue.number + " wasn't closed with a commit");
	                  }
                      })
                  }
              }
          })
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
