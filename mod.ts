import { Octokit } from "https://esm.sh/@octokit/core@4.0.5";
import { restEndpointMethods } from "https://esm.sh/@octokit/plugin-rest-endpoint-methods@6.6.2";
import { bold, cyan } from "https://deno.land/std@0.159.0/fmt/colors.ts";
import { bash } from "./bash.ts";

const logHeader: typeof console.log = (message) => {
  console.log(bold(cyan(message)));
};

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

logHeader(`Creating project ${bold(project)} on Github...`);
const repoRes = await octokit.rest.repos.createUsingTemplate({
  template_owner: "justinawrey",
  template_repo: "boiler",
  owner: "justinawrey",
  name: project,
});

if (repoRes.status !== 201) {
  console.log("Error: could not create project on Github");
  Deno.exit(0);
}

console.log(`Project ${bold(project)} created on Github!\n`);

logHeader("Cloning project locally...");
await bash(`git clone https://github.com/justinawrey/${project}.git`);
Deno.chdir(project);
await bash(`echo '# ${project}' > README.md`);
await bash("git commit -am 'commit readme'");
await bash("git push origin main");
Deno.chdir("..");
console.log(`Project cloned locally!\n`);

logHeader("Setting up webhook for syncing to deno.land/x...");
const webhookRes = await octokit.rest.repos.createWebhook({
  owner: "justinawrey",
  repo: project,
  events: ["push"],
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

// TODO: better rollbacks
// TODO: not hardcode my username
// TODO: publish bash as own project
// TODO: figure out correct webhook event