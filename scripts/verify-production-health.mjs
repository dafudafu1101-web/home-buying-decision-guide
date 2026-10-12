#!/usr/bin/env node

const url = process.env.PRODUCTION_HEALTH_URL || "https://home-buying-decision-guide.vercel.app/api/health";

async function main() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "user-agent": "sakai-production-health-check/1.0" },
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) {
      console.error(`✗ Production health check failed (${response.status})`);
      if (body) console.error(JSON.stringify(body));
      process.exitCode = 1;
      return;
    }

    console.log(`✓ Production healthy: ${body.service}`);
    console.log(`✓ Environment: ${body.environment}`);
    console.log(`✓ Commit: ${body.commit || "unavailable"}`);
    console.log("✓ No Vercel CLI authentication was required");
  } finally {
    clearTimeout(timeout);
  }
}

main().catch((error) => {
  console.error(`✗ Production health check error: ${error.message}`);
  process.exit(1);
});
