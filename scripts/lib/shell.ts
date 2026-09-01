import { spawnSync } from "node:child_process";

export function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} a echoue (code ${result.status}).`);
  }
}

export function runQuiet(command: string, args: string[]) {
  const result = spawnSync(command, args, { encoding: "utf-8" });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

export async function waitForPostgres(timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const check = runQuiet("docker", [
      "compose",
      "exec",
      "-T",
      "postgres",
      "pg_isready",
      "-U",
      "steenland",
      "-d",
      "steenland",
    ]);
    if (check.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("Postgres n'est pas disponible apres 60 secondes.");
}
