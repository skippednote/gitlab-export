import { Env } from "@humanwhocodes/env";
import { request } from "undici";
import { writeToPath } from "@fast-csv/format";

const env = new Env();
const TOKEN = env.require("GITLAB_TOKEN");
const BASE_URL = env.require("BASE_URL");

let allProjects = [];
export async function getProjects(page = 1) {
  const { body, headers } = await request(
    `${BASE_URL}/api/v4/projects/?private_token=${TOKEN}&statistics=true&per_page=100&page=${page}`
  );
  const projects = await body.json();
  for (let project of projects) {
    let {
      id,
      name,
      name_with_namespace,
      path,
      path_with_namespace,
      description,
      visibility,
      avatar,
      owner,
      forked_from_project,
      created_at,
      last_activity_at,
      archived,
      http_url_to_repo,
    } = project;
    allProjects.push([
      id,
      `=HYPERLINK("${http_url_to_repo}", "${name}")`,
      name_with_namespace,
      path,
      path_with_namespace,
      description,
      visibility,
      owner?.name ?? "",
      forked_from_project?.http_url_to_repo ?? "",
      created_at,
      last_activity_at,
      archived,
      avatar,
    ]);
  }
  const nextPage = Number(headers["x-next-page"]);
  if (nextPage) {
    await getProjects(nextPage);
  } else {
    return allProjects;
  }
}

export async function exportProjects() {
  await getProjects();
  writeToPath("./data/projects.csv", allProjects, {
    headers: [
      "id",
      "name",
      "name_with_namespace",
      "path",
      "path_with_namespace",
      "description",
      "visibility",
      "owner",
      "fork of",
      "created_at",
      "last_activity_at",
      "archived",
      "avatar",
    ],
  });
}

exportProjects();
