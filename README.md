# Revue.io

[revue.io](https://revue.io) is the github code presetation - review tool based on the idea of @thejameskyle library [spectacle-code-slide](https://github.com/thejameskyle/spectacle-code-slide)

It allows you to create, edit and share nice looking descriptive reviews of any code published on github.

Use arrow keys or spacebar (shift spacebar) to navigate.   
Click on edit button (in one of top corners) to start edit.

Please use [permalinks](https://help.github.com/articles/getting-permanent-links-to-files/) to [code lines](https://blog.mariusschulz.com/2015/07/25/sharing-line-highlights-in-github-files)
(_[revue.io](https://revue.io) caches github files to avoid overrate [github api](https://developer.github.com/v3/rate_limit/)_)

# Languages support

For now it supports languages I selected - Javascript, Typescript, Sass, Scss, C++ etc...   
But it could support any language supported by [Prism](http://prismjs.com/).
Add language you need [here](https://github.com/istarkov/revue/blob/master/src/prism/utils/languages.js) and
provide a PR.

# Awesome reviews

(_Here could be your code review link_)

# Install

```bash
npm install
# dev version
PORT=3000 npm run start
# open browser at localhost:3000
# dev version but with NODE_ENV=production
PORT=3000 npm run start:prod
# ---------------------------------------
# production version build and server
npm run build
PORT=3000 npm run start:server
```

# How to use with private repos

To use with private repositaries you need to create your github personal access token https://github.com/settings/tokens

Then start production or development version of this repo with `GITHUB_USER_AUTH_TOKEN` env variable defined as `${USERNAME}:${TOKEN}`.

Example

```shell
GITHUB_USER_AUTH_TOKEN='vasyapupkin:e3150a4dca108b' PORT=3000 npm run start:prod
```

One problem you could get with this solution, that the code description (_not the code itself_) will be published on a public `goo.gl` server, so if your security does not allow you to publish something like this

```markdown
https://github.com/istarkov/google-map-react/blob/master/src/google_map.js#L154-158

# Super code
Lorem ipsum dolor sit amet, consectetur adipiscing elit
...
```

you could provide a PR to this project with your `save/load` api solution.

(_For now this project uses goo.gl url shortener as a free high availability database_)
