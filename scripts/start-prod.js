const { spawn } = require("node:child_process");
const path = require("node:path");

const port = process.env.PORT || "3000";
const distPath = path.join(__dirname, "..", "dist", "vhodly-app", "browser");

const child = spawn(
  "serve",
  [distPath, "-s", "-l", port],
  { stdio: "inherit", shell: true }
);

child.on("exit", (code) => process.exit(code ?? 0));
