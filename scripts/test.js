const start = Date.now();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulated downstream service used by the integration test. It starts quickly and
// deterministically, so the integration test always passes.
function startMockService() {
  const startupMs = 10;

  const service = { ready: false };
  const readyPromise = wait(startupMs).then(() => {
    service.ready = true;
  });
  service.whenReady = () => readyPromise;
  return service;
}

async function integrationTest() {
  const service = startMockService();

  // Give the service a moment to come up before connecting.
  await wait(100);

  if (!service.ready) {
    console.error(
      "Integration test failed: connection refused - service on port 8080 was not ready after 100ms."
    );
    process.exit(1);
  }

  console.log("Integration test complete (service ready)");
}

async function main() {
  console.log("Test suite started...");
  const totalShards = Number(process.env.TOTAL_SHARDS || 1);
  const shard = Number(process.env.SHARD || 1);

  for (let i = 1; i <= 6; i += 1) {
    const shouldRun = ((i - 1) % totalShards) === (shard - 1);
    if (!shouldRun) {
      continue;
    }
    await wait(650);
    console.log(`Test shard ${i}/6 complete (${shard}/${totalShards})`);
  }

  await integrationTest();

  console.log(`Tests complete in ${Date.now() - start}ms`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
