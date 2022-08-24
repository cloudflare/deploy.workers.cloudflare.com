# Adding support for "Deploy to CF Workers" to your application

1. Add a GitHub Actions workflow to your project.

Add a new file to `.github/workflows`, such as `.github/workflows/deploy.yml`, and create a GitHub workflow for deploying your project. It should include a set of `on` events, including _at least_ `repository_dispatch`, but probably `push` and maybe `schedule` as well. Add a step for publishing your project using [wrangler-action](https://github.com/cloudflare/wrangler-action):

```yaml
name: Build
on:
  push:
  pull_request:
  repository_dispatch:
deploy:
  runs-on: ubuntu-latest
  timeout-minutes: 60
  needs: test
  steps:
    - uses: actions/checkout@v2
    - name: Publish
      uses: cloudflare/wrangler-action@1.2.0
```

2. Add support for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in your workflow:

<strong>DEPRECATION</strong> notice: The Deploy to Workers will stop adding `CF_API_TOKEN` and `CF_ACCOUNT_ID` as GitHub Action secrets. Please change your repositories that use Deploy to Workers to pass `CLOUDFLARE_` prefixed secrets instead.

```yaml
# Update "Publish" step from last code snippet
- name: Publish
  uses: cloudflare/wrangler-action@1.2.0
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  env:
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

3. Add the Markdown code for your button to your project's README, replacing the example `url` parameter with your repository URL.

```md
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOURUSERNAME/YOURREPO)
```

![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)
