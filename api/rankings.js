const { requireMethod, sendJson, supabaseRequest } = require("../server/db");

const MAX_RANKINGS = 10;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getKstDayRange(now = new Date()) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const startAsUtc = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - KST_OFFSET_MS;

  return {
    start: new Date(startAsUtc).toISOString(),
    end: new Date(startAsUtc + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function mapAllTimeRanking(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    bestScore: user.best_score || 0,
    gamesPlayed: user.games_played || 0,
  };
}

function buildDailyRankings(scores, users) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const bestByUser = new Map();

  scores.forEach((scoreRow) => {
    const user = usersById.get(scoreRow.user_id);

    if (!user) {
      return;
    }

    const score = scoreRow.score || 0;
    const previous = bestByUser.get(scoreRow.user_id);

    if (!previous || score > previous.score || (score === previous.score && scoreRow.created_at < previous.createdAt)) {
      bestByUser.set(scoreRow.user_id, {
        id: user.id,
        username: user.username,
        role: user.role,
        score,
        bestScore: score,
        createdAt: scoreRow.created_at,
      });
    }
  });

  return Array.from(bestByUser.values())
    .sort((left, right) => right.score - left.score || left.username.localeCompare(right.username, "ko"))
    .slice(0, MAX_RANKINGS)
    .map(({ createdAt, ...ranking }) => ranking);
}

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "GET")) return;

    const { start, end } = getKstDayRange();
    const users = await supabaseRequest("users?select=id,username,role,best_score,games_played&order=best_score.desc,username.asc", {
      prefer: "",
    });
    const scores = await supabaseRequest(`scores?select=user_id,score,created_at&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=score.desc,created_at.asc&limit=200`, {
      prefer: "",
    });
    const dailyRankings = buildDailyRankings(scores, users);
    const allTimeRankings = users.slice(0, MAX_RANKINGS).map(mapAllTimeRanking);

    sendJson(res, 200, { dailyRankings, allTimeRankings });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
