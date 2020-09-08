import * as core from '@actions/core';
const semver = require('semver');
const {GitHub, context} = require('@actions/github');

async function run() {
    try {
	const diff = process.env.diff as string;
	const minVersion = process.env.minVersion as string;
	// Obtain version
	var versionMatch= /\s*v(\d+\.\d+\.\d+)/.exec(diff);
	if ( versionMatch !== null && versionMatch.length > 0 ) {
	    const version = versionMatch[0] as string;
	    if ( ! semver.valid(semver.clean(version)) ) {
		core.setFailed( version + " is not a valid semantic version ");
	    }
	    core.exportVariable('version',version);
	    core.setOutput('version',version);

	    if ( semver.gt( semver.clean(version), semver.clean(minVersion) ) ) { // Only check this after version

		// Obtain URL with MD syntax
		var ghRepoMatch = /github.com\/(\S+)\/(.+?)(:\s+|\))/.exec(diff)

		if  ( ghRepoMatch === null ) {
		    core.setFailed("There's no repo URL in this diff with required format")
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
			core.setFailed( "There should be more than " + minMilestones + " milestone(s)");
		    }
		    var totalIssues = 0
		    var totalClosedIssues = 0
		    milestones.data.forEach( async function( milestone ) {
			totalIssues += milestone.open_issues + milestone.closed_issues
			totalClosedIssues += milestone.closed_issues
		    })
		    console.log( "There are " + totalIssues + " issues in your milestones  and " + totalClosedIssues + " closed issues ")
		    if ( ! totalIssues ) {
			core.setFailed( "There are 0 issues in your milestones")
		    } else if ( ! totalClosedIssues ) {
			core.setFailed( "There are no closed issues in your milestones")
		    } else  {
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
	    }
	}
    } catch (error) {
	core.setFailed(error.message);
    }
    
}

run();
