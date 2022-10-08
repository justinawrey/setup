export async function bash(cmd: string): Promise<string> {
  const process = Deno.run({
    cmd: ["bash", "-c", cmd],
    stdout: "piped",
    stderr: "piped",
  });

  const [status, stdout, stderr] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
  ]);

  if (status.code === 0) {
    return new TextDecoder().decode(stdout);
  } else {
    throw new Error(
      `bash invocation failed with error:` +
        new TextDecoder().decode(stderr),
    );
  }
}
