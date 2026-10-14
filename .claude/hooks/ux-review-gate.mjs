// Stop hook: when uncommitted UI files (.svelte/.css/.html) have changed since the
// last review, block the stop and ask Claude to run the ui-ux-reviewer subagent.
// With --mark (SubagentStop for ui-ux-reviewer): record the current changes as reviewed.
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const mark = process.argv.includes("--mark");
if (mark && input.agent_type && input.agent_type !== "ui-ux-reviewer") process.exit(0);
if (!mark && input.stop_hook_active) process.exit(0);

const opts = { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 };
const root = execSync("git rev-parse --show-toplevel", opts).trim();
const git = (args) => execSync(`git ${args}`, { ...opts, cwd: root });

const isUi = (f) => /\.(svelte|css|html)$/.test(f) && !f.startsWith(".claude/");
const changed = git("diff HEAD --name-only").split("\n").filter(isUi);
const untracked = git("ls-files --others --exclude-standard").split("\n").filter(isUi);
const files = [...new Set([...changed, ...untracked])];
if (files.length === 0) process.exit(0);

const hash = createHash("sha256");
if (changed.length) hash.update(git(`diff HEAD -- ${changed.map((f) => `"${f}"`).join(" ")}`));
for (const f of untracked) hash.update(f).update(readFileSync(join(root, f)));
const digest = hash.digest("hex");

const stateFile = join(root, ".claude", ".ux-review-state");
if (mark) {
	writeFileSync(stateFile, digest);
	process.exit(0);
}
if (existsSync(stateFile) && readFileSync(stateFile, "utf8").trim() === digest) process.exit(0);
writeFileSync(stateFile, digest);

console.log(
	JSON.stringify({
		decision: "block",
		reason:
			`UI files changed and haven't been UX/accessibility reviewed: ${files.join(", ")}. ` +
			"Run the ui-ux-reviewer subagent on these changes. Fix any Blocking findings, then briefly tell the user " +
			"what the review found, including Should fix and Polish items you didn't address."
	})
);
