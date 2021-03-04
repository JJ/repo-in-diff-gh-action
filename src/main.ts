import * as core from '@actions/core';
const semver = require('semver');
const {GitHub, context} = require('@actions/github');

async function run() {
    try {
	const diff = process.env.diff as string;
	const minVersion = semver.clean(core.getInput("minVersion")) as string;
	// Obtain version
	var versionMatch= /\s*v?(\d+\.\d+\.\d+)/.exec(diff);

	if ( versionMatch !== null && versionMatch.length > 0 ) {
	    const version = semver.clean(versionMatch[0]) as string;
	    if ( ! semver.valid(version ) ) {
		core.setFailed( "❌ " + version + " is not a valid semantic version ");
	    }
	    core.exportVariable('version',version);
	    core.setOutput('version',version);

	    // Obtain URL with MD syntax
	    var ghRepoMatch = /github.com\/(\S+)\/(.+?)(:\s+|\))/.exec(diff)

	    if  ( ghRepoMatch === null ) {
		core.setFailed("❌ There's no repo URL in this diff with required format")
	    } else {
		const user = ghRepoMatch[1]
		const repo = ghRepoMatch[2]
		console.log( "» Retrieving repo " + repo + " for user " + user )
		const token = core.getInput('github-token', {required: true})
		const github = new GitHub(token, {} )
                core.exportVariable('user',user);
                core.exportVariable('repo',repo);
                core.setOutput('user',user);
                core.setOutput('repo',repo);

		// Get PRs
		const minPRs = +core.getInput('minPRs')
		console.log("::debug:: " + minPRs);
		if ( minPRs > 0 ) {
		    const PRs = await github.pulls.list( { state: "closed", owner: user, repo: repo } )
		    console.log("::debug:: " + PRs.data )
		    if (  PRs.data.length < minPRs ) {
			core.setFailed("❌ There should be at least " + minPRs + " closed PRs")
		    } else {
                        console.log( "✅ There are " + minPRs + " issues or more ")
                    }
		}

		// Check milestones and issues from a certain version
		if ( semver.gt( version, minVersion ) ) { // Only check this if version is higher
                    console.log( "✅ Checks for version " + version + " >  " + minVersion )
		    const milestones = await github.issues.listMilestonesForRepo( { owner: user, repo: repo } )
		    if ( ! milestones.data.length ) {
			core.setFailed("❌ There should be at least one milestone")
		    }
		    const minMilestones = +core.getInput('minMilestones')
		    if ( minMilestones && milestones.data.length < minMilestones ) {
			core.setFailed( "❌ There should be more than " + minMilestones + " milestone(s)");
		    } else {
                        console.log( "✅ There are " + minMilestones + " milestones or more ")
                    }

		    var totalIssues = 0
		    var totalClosedIssues = 0
		    milestones.data.forEach( async function( milestone ) {
			totalIssues += milestone.open_issues + milestone.closed_issues
			totalClosedIssues += milestone.closed_issues
		    })
		    console.log( "✅ There are " + totalIssues + " issues in your milestones  and " + totalClosedIssues + " closed issues ")
		    if ( ! totalIssues ) {
			core.setFailed( "❌ There are 0 issues in your milestones")
		    } else if ( ! totalClosedIssues ) {
			core.setFailed( "❌ There are no closed issues in your milestones")
		    } else  {
			const options = await github.issues.listForRepo( { owner: user, repo: repo, state: "closed" } )
			const issues = await github.paginate( options )
			issues.forEach( async function( issue ) {
			    if ( ! issue.pull_request ) {
				const events = await github.issues.listEvents( { owner: user,
										 repo: repo,
										 issue_number: issue.number } )
				if ( !events.data ) {
				    core.setFailed( "❌ Issue " + issue.number + " wasn't closed with a commit");
				} else {
                                    const last_event = events.data[events.data.length-1]
				    if ( last_event.event == 'closed' && ! last_event.commit_id ) {
					core.setFailed( "❌ Issue " + issue.number + " wasn't closed with a commit");
				    }
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
