import { Env } from "@humanwhocodes/env";
import { request } from "undici";
import { writeToPath } from "@fast-csv/format";

const env = new Env();
const TOKEN = env.require("GITLAB_TOKEN");
const BASE_URL = env.require("BASE_URL");

let allUsers = [];
export async function getUsers(page = 1) {
  const { body, headers } = await request(
    `${BASE_URL}/api/v4/users/?private_token=${TOKEN}&per_page=100&page=${page}`
  );
  const users = await body.json();
  for (let user of users) {
    let {
      id,
      name,
      username,
      state,
      is_admin,
      confirmed_at,
      last_sign_in_at,
      last_activity_on,
      avatar_url,
      external,
      web_url,
    } = user;
    allUsers.push([
      id,
      name,
      username,
      state,
      is_admin,
      confirmed_at,
      last_sign_in_at,
      last_activity_on,
      avatar_url,
      external,
      web_url,
    ]);
  }
  allUsers = allUsers.concat(users);
  const nextPage = Number(headers["x-next-page"]);
  if (nextPage) {
    await getUsers(nextPage);
  } else {
    return allUsers;
  }
}

export async function exportUsers() {
  await getUsers();
  writeToPath("./data/users.csv", allUsers, {
    headers: [
      "id",
      "name",
      "username",
      "state",
      "is_admin",
      "confirmed_at",
      "last_sign_in_at",
      "last_activity_on",
      "avatar_url",
      "external",
      "web_url",
    ],
  });
}

exportUsers();
