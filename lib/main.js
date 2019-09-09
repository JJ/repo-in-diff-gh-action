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
            var ghRepoMatch = /github.com\/(\S+)\/(\S+)/.exec(diff);
            if (ghRepoMatch === null) {
                core.setFailed("There's no repo in this diff");
            }
            else {
                console.log(ghRepoMatch);
                const user = ghRepoMatch[1];
                const repo = ghRepoMatch[2];
                console.log("User ", user);
                console.log("Repo ", repo);
                const token = core.getInput('github-token', { required: true });
                const github = new GitHub(token, {});
                const ghRepo = yield github.repos.get(user, repo);
                console.log(ghRepo);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
