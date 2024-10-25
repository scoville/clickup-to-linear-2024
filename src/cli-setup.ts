import { cli, command } from "cleye";

import { updateIssue } from "./linear/issues";
import { viewLabels } from "./linear/labels";
import { viewProjects } from "./linear/projects";
import { viewStates } from "./linear/states";
import { getCurrentUser, viewUsers } from "./linear/users";
import { viewCycles } from "./linear/cycles";
import { argv } from "bun";

cli({
  name: "setup.ts",
  description: "CLI app setup JSON files used later when importing thr CSV",
  commands: [
    command(
      {
        name: "me",
        help: { description: "Get current user" },
      },
      getCurrentUser
    ),
    command(
      {
        name: "cycles",
        help: { description: "Output the list of cycles (sprints)" },
      },
      viewCycles
    ),
    command(
      {
        name: "users",
        help: { description: "Output the list of users" },
      },
      viewUsers
    ),
    command(
      {
        name: "update-issue",
        help: { description: "Update an issue" },
        parameters: ["<issueId>"],
      },
      async (argv) => {
        await updateIssue(argv._.issueId);
      }
    ),
    command(
      {
        name: "labels",
        help: { description: "View labels" },
      },
      viewLabels
    ),
    command(
      {
        name: "projects",
        help: { description: "View projects" },
      },
      viewProjects
    ),
    command(
      {
        name: "states",
        help: { description: "View states" },
      },
      viewStates
    ),
  ],
});