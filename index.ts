import { existsSync, mkdirSync } from "fs";
import { exportGroups, exportProjects, exportUsers } from "./lib";

async function main() {
  try {
    if (!existsSync("./data")) {
      mkdirSync("./data");
    }
    await Promise.allSettled([exportGroups(), exportProjects(), exportUsers()]);
  } catch (err) {
    console.error(err);
  }
}

main();
