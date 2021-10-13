import { Env } from "@humanwhocodes/env";
import { request } from "undici";
import { writeToPath } from "@fast-csv/format";

const env = new Env();
const TOKEN = env.require("GITLAB_TOKEN");
const BASE_URL = env.require("BASE_URL");

let allGroups = [];
export async function getGroups() {
  const { body } = await request(
    `${BASE_URL}/api/v4/groups/?private_token=${TOKEN}&statistics=true&per_page=100`
  );
  const groups = await body.json();

  for (const group of groups) {
    const {
      id,
      name,
      path,
      description,
      avatar,
      full_name,
      full_path,
      visibility,
    } = group;
    allGroups.push([
      id,
      name,
      path,
      description,
      visibility,
      avatar,
      full_name,
      full_path,
    ]);
  }
}
export async function exportGroups() {
  await getGroups();
  writeToPath("./data/groups.csv", allGroups, {
    headers: [
      "id",
      "name",
      "path",
      "description",
      "visibility",
      "avatar",
      "full_name",
      "full_path",
    ],
  });
}

exportGroups();
