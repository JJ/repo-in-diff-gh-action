# Work with repo mentioned in a diff

It needs [github-pr-contains-action](https://github.com/JJ/github-pr-contains-action) first, which outputs the diff.

## Configure your repo

Add a file like this to your `.github/workflows` directory:

```
name: "Info from repo"
on: [pull_request]

jobs:
  obtain-repo:
    runs-on: ubuntu-latest
    steps:
      - name: get-diff
        uses: JJ/github-pr-contains-action@releases/v1
        with:
          github-token: ${{github.token}}
          filesChanged: 1
      - name: obtain-repo
        uses: JJ/repo-in-diff-gh-action@releases/v0
        with:
          diff: ${{steps.get-diff.outputs.diff}}
```
