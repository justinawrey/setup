import { Octokit } from "https://esm.sh/@octokit/core@4.0.5";
import { restEndpointMethods } from "https://esm.sh/@octokit/plugin-rest-endpoint-methods@6.6.2";
import { bold, cyan } from "https://deno.land/std@0.159.0/fmt/colors.ts";
import { bash } from "https://deno.land/x/bash@0.2.0/mod.ts";

function logHeader(message: string) {
  console.log(bold(cyan(message)));
}

if (Deno.args.length !== 1) {
  console.log("Project name must be provided");
  Deno.exit(0);
}
const project = Deno.args[0];

logHeader(`Checking if project ${bold(project)} exists on deno.land/x...`);
const response = await fetch(
  `https://cdn.deno.land/${project}/meta/versions.json`,
);

if (response.ok) {
  console.log(`Project ${bold(project)} already exists`);
  Deno.exit(0);
}

console.log("Project does not exist!\n");

const restOctokit = Octokit.plugin(restEndpointMethods);
const octokit = new restOctokit({
  auth: Deno.env.get("GITHUB_TOKEN"),
});

logHeader("Authenticating with Github...");
const { status, data: user } = await octokit.rest.users.getAuthenticated();
if (status !== 200) {
  console.log("Error: could not authenticate with Github");
  Deno.exit(0);
}
console.log(`Authenticated as ${bold(user.login)}\n`);

logHeader(`Creating project ${bold(project)} on Github...`);
const repoRes = await octokit.rest.repos.createUsingTemplate({
  template_owner: "justinawrey",
  template_repo: "boiler",
  owner: user.login,
  name: project,
});

if (repoRes.status !== 201) {
  console.log("Error: could not create project on Github");
  Deno.exit(0);
}

console.log(`Project ${bold(project)} created on Github!\n`);

logHeader("Cloning project locally...");
await bash(`git clone https://github.com/${user.login}/${project}.git`);
Deno.chdir(project);
await bash(`echo '# ${project}\n' > README.md`);
await bash(
  `echo '[![deno module](https://shield.deno.dev/x/${project})](https://deno.land/x/${project})' >> README.md`,
);
await bash(
  `echo '[![release](https://github.com/${user.login}/${project}/actions/workflows/release.yml/badge.svg)](https://github.com/${user.login}/${project}/actions/workflows/release.yml)' >> README.md`,
);
await bash("git commit -am 'commit readme'");
await bash("git push origin main");
Deno.chdir("..");
console.log(`Project cloned locally!\n`);

logHeader("Setting up webhook for syncing to deno.land/x...");
const webhookRes = await octokit.rest.repos.createWebhook({
  owner: user.login,
  repo: project,
  events: ["create", "push"],
  config: {
    url: `https://api.deno.land/webhook/gh/${project}`,
    content_type: "json",
  },
});

if (webhookRes.status !== 201) {
  console.log("Error: could not add webhook");
  Deno.exit(0);
}

console.log("Webhook sucessfully created!");
console.log(`Project ${bold(project)} set up and ready to go! 🥳`);
console.log(
  `View it here: ${bold(`https://github.com/${user.login}/${project}`)}`,
);
