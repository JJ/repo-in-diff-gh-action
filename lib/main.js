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
const { GitHub, context } = require('@actions/github');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const diff = process.env.diff;
            var ghRepoMatch = /github.com\/(\S+)\/(\S+)\)?/.exec(diff);
            if (ghRepoMatch === null) {
                core.setFailed("There's no repo URL in this diff");
            }
            else {
                const user = ghRepoMatch[1];
                const repo = ghRepoMatch[2];
                const token = core.getInput('github-token', { required: true });
                const github = new GitHub(token, {});
                const milestones = yield github.issues.listMilestonesForRepo({ owner: user, repo: repo });
                const minMilestones = +core.getInput('minMilestones');
                if (minMilestones && milestones.data.length < minMilestones) {
                    core.setFailed("There should be at least " + minMilestones + " milestone(s)");
                }
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
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
