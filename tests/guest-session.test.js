const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createSignedGuestToken,
  readSignedGuestToken,
} = require("../server/guest-session");

const SECRET = "test-secret-with-enough-entropy";
const PAYLOAD = {
  version: 1,
  id: "4f4ed72b-a667-4b06-9280-53d70b1ce0bd",
  seed: "abc123",
  gameMode: "churu",
  startedAt: "2026-08-26T00:00:00.000Z",
  expiresAt: "2026-08-26T03:00:00.000Z",
};

test("signed guest token preserves its payload", () => {
  const token = createSignedGuestToken(PAYLOAD, SECRET);

  assert.deepEqual(readSignedGuestToken(token, SECRET), PAYLOAD);
});

test("tampered guest token is rejected", () => {
  const token = createSignedGuestToken(PAYLOAD, SECRET);
  const [payload, signature] = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ ...PAYLOAD, seed: "changed" })).toString("base64url");
  const tamperedSignature = `${signature[0] === "0" ? "1" : "0"}${signature.slice(1)}`;

  assert.equal(readSignedGuestToken(`${tamperedPayload}.${signature}`, SECRET), null);
  assert.equal(readSignedGuestToken(`${payload}.${tamperedSignature}`, SECRET), null);
});

test("guest token cannot be verified with a different secret", () => {
  const token = createSignedGuestToken(PAYLOAD, SECRET);

  assert.equal(readSignedGuestToken(token, "different-secret"), null);
});
