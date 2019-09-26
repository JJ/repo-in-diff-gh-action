import * as core from '@actions/core';
const {GitHub, context} = require('@actions/github')

async function run() {
  try {
      const diff = process.env.diff as string;
      var ghRepoMatch = /github.com\/(\S+)\/(\S+)\b/.exec(diff)
      if  ( ghRepoMatch === null ) {
	  core.setFailed("There's no repo URL in this diff")
      } else {
	  const user = ghRepoMatch[1]
	  const repo = ghRepoMatch[2]
          console.log( "Retrieving repo " + repo + " for user " + user )
	  const token = core.getInput('github-token', {required: true})
	  const github = new GitHub(token, {} )
	  const milestones = await github.issues.listMilestonesForRepo( { owner: user, repo: repo } )
          if ( ! milestones.data.length ) {
              core.setFailed("There should be at least one milestone")
          }
	  const minMilestones = +core.getInput('minMilestones')
	  if ( minMilestones && milestones.data.length < minMilestones ) {
              core.setFailed( "There should be at least " + minMilestones + " milestone(s)");
	  }
	  console.log(milestones)
	  var totalIssues
	  milestones.data.forEach( async function( milestone ) {
	      totalIssues += milestone.open_issues + milestone.closed_issues
	  })
	  console.log( "There are " + totalIssues + " in your repository ")
	  if ( ! totalIssues ) {
	      core.setFailed( "There are 0 issues in your repository")
	  } else {
	      const options = await github.issues.listForRepo( { owner: user, repo: repo, state: "closed" } )
	      const issues = await github.paginate( options )
              issues.forEach( async function( issue ) {
		  if ( ! issue.pull_request ) {
                      const events = await github.issues.listEvents( { owner: user,
                                                                   repo: repo,
                                                                       issue_number: issue.number } )
                      if ( !events.data ) {
			  core.setFailed( "Issue " + issue.number + " wasn't closed with a commit");
	              } else {
			  events.data.forEach( async function( event ) {
                          if ( event.event == 'closed' && ! event.commit_id ) {
                              core.setFailed( "Issue " + issue.number + " wasn't closed with a commit");
	                  }
			  })
                      }
		  }
              })
	  }
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
