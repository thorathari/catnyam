const assert = require("node:assert/strict");
const { Readable } = require("node:stream");
const test = require("node:test");

const scoresHandler = require("../api/scores");
const { readSignedGuestToken } = require("../server/guest-session");

function createRequest(body) {
  const request = Readable.from([Buffer.from(JSON.stringify(body), "utf8")]);
  request.method = "POST";
  request.headers = {};
  return request;
}

function createResponse() {
  return {
    headers: {},
    statusCode: 0,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

test("guest game start works without an authenticated cookie", async () => {
  const previousSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "guest-api-test-secret";

  try {
    const response = createResponse();
    await scoresHandler(createRequest({ action: "start-guest-game", gameMode: "churu" }), response);

    assert.equal(response.statusCode, 200, response.body);
    const result = JSON.parse(response.body);
    const session = result.gameSession;
    const payload = readSignedGuestToken(session.token, process.env.SESSION_SECRET);

    assert.equal(payload.id, session.id);
    assert.equal(payload.seed, session.seed);
    assert.equal(payload.gameMode, "churu");
    assert.equal(session.loadout.character, "calico");
    assert.equal(session.loadout.background, "village");
  } finally {
    if (previousSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = previousSecret;
    }
  }
});
