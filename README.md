# setup :volleyball:

[![deno module](https://shield.deno.dev/x/setup)](https://deno.land/x/setup)
[![release](https://github.com/justinawrey/setup/actions/workflows/release.yml/badge.svg)](https://github.com/justinawrey/setup/actions/workflows/release.yml)

Quickly set up a Deno project.

## Summary

`setup` is a script that will do everything you need to quickly start a new Deno
project:

- Checks if the supplied name already exists on `deno.land/x`
- Authenticates with Github, using the `GITHUB_TOKEN` environment variable
- Creates a new repository on Github, using a
  [sensible boilerplate](https://github.com/justinawrey/boiler). This minimal
  boilerplate includes VSCode settings and a basic release GHA workflow.
- Clones the project locally
- Sets up the webhook for publishing to `deno.land/x`

## Usage

Run the remote script:

```sh
deno run --allow-net --allow-env --allow-run --allow-read https://deno.land/x/setup/setup.ts <name>
```

Or install it locally:

```sh
deno install --allow-net --allow-env --allow-run --allow-read https://deno.land/x/setup/setup.ts
```

Then run it:

```sh
setup <name>
```

The repository will be cloned in the current directory, so make sure you're in
the right place first.

## Authenticating with Github

`setup` authenticates with Github by looking for an environment variable called
`GITHUB_TOKEN`. This should be set to a personal access token generated from
your account.

## Granting permissions

`setup` requires a number of permissions to run. These are:

- `--allow-net`: to make outgoing network requests to both `deno.land/x` and
  Github
- `--allow-env`: to read the `GITHUB_TOKEN` environment variable
- `--allow-run`: to run the `git` command in order to locally clone the repo
- `--allow-read`: to use the `Deno.chdir()` api
