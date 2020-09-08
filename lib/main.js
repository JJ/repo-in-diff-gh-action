"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const semver = require('semver');
const { GitHub, context } = require('@actions/github');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const diff = process.env.diff;
            const minVersion = semver.clean(core.getInput("minVersion"));
            // Obtain version
            var versionMatch = /\s*v?(\d+\.\d+\.\d+)/.exec(diff);
            if (versionMatch !== null && versionMatch.length > 0) {
                const version = semver.clean(versionMatch[0]);
                if (!semver.valid(version)) {
                    core.setFailed(version + " is not a valid semantic version ");
                }
                core.exportVariable('version', version);
                core.setOutput('version', version);
                // Obtain URL with MD syntax
                var ghRepoMatch = /github.com\/(\S+)\/(.+?)(:\s+|\))/.exec(diff);
                if (ghRepoMatch === null) {
                    core.setFailed("There's no repo URL in this diff with required format");
                }
                else {
                    const user = ghRepoMatch[1];
                    const repo = ghRepoMatch[2];
                    console.log("Retrieving repo " + repo + " for user " + user);
                    const token = core.getInput('github-token', { required: true });
                    const github = new GitHub(token, {});
                    // Get PRs
                    const minPRs = +core.getInput('minPRs');
                    if (minPRs > 0) {
                        const PRs = yield github.pulls.list({ state: "closed", owner: user, repo: repo });
                        if (PRs.data.length < minPRs) {
                            core.setFailed("There should be at least " + minPRs + " closed PRs");
                        }
                    }
                    // Check milestones and issues from a certain version
                    if (semver.gt(version, minVersion)) { // Only check this if version is higher
                        const milestones = yield github.issues.listMilestonesForRepo({ owner: user, repo: repo });
                        if (!milestones.data.length) {
                            core.setFailed("There should be at least one milestone");
                        }
                        const minMilestones = +core.getInput('minMilestones');
                        if (minMilestones && milestones.data.length < minMilestones) {
                            core.setFailed("There should be more than " + minMilestones + " milestone(s)");
                        }
                        var totalIssues = 0;
                        var totalClosedIssues = 0;
                        milestones.data.forEach(function (milestone) {
                            return __awaiter(this, void 0, void 0, function* () {
                                totalIssues += milestone.open_issues + milestone.closed_issues;
                                totalClosedIssues += milestone.closed_issues;
                            });
                        });
                        console.log("There are " + totalIssues + " issues in your milestones  and " + totalClosedIssues + " closed issues ");
                        if (!totalIssues) {
                            core.setFailed("There are 0 issues in your milestones");
                        }
                        else if (!totalClosedIssues) {
                            core.setFailed("There are no closed issues in your milestones");
                        }
                        else {
                            const options = yield github.issues.listForRepo({ owner: user, repo: repo, state: "closed" });
                            const issues = yield github.paginate(options);
                            issues.forEach(function (issue) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    if (!issue.pull_request) {
                                        const events = yield github.issues.listEvents({ owner: user,
                                            repo: repo,
                                            issue_number: issue.number });
                                        if (!events.data) {
                                            core.setFailed("Issue " + issue.number + " wasn't closed with a commit");
                                        }
                                        else {
                                            events.data.forEach(function (event) {
                                                return __awaiter(this, void 0, void 0, function* () {
                                                    if (event.event == 'closed' && !event.commit_id) {
                                                        core.setFailed("Issue " + issue.number + " wasn't closed with a commit");
                                                    }
                                                });
                                            });
                                        }
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
