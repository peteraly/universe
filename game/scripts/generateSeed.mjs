import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

// ---------- CLI ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const NUM_USERS = parseInt(args.users ?? "150", 10);
const NUM_EVENTS = parseInt(args.events ?? "200", 10);
const CITY = String(args.city ?? "NYC");
const SEED = args.seed ? Number(args.seed) : undefined;

// ---------- Seedable RNG (so runs are reproducible) ----------
if (SEED !== undefined) faker.seed(SEED);
const rand = (min = 0, max = 1) => min + Math.random() * (max - min);

// ---------- Helpers ----------
const now = dayjs();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, k) => {
  if (k >= arr.length) return arr.slice();
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, k);
};
const weightedPick = (items, weightFn) => {
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const id = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

// ---------- Enhanced Domain: More Sports & Activities ----------
const SPORTS = [
  // Team Sports
  { key: "basketball", cap: [8, 24], durMin: 90, venues: ["Chelsea Rec", "PS 41 Gym", "Brooklyn Bridge Park", "Riverside Park Courts"] },
  { key: "soccer", cap: [10, 22], durMin: 90, venues: ["Pier 40", "Prospect Park Long Meadow", "Randall's Island", "Flushing Meadows"] },
  { key: "volleyball", cap: [8, 14], durMin: 90, venues: ["West Side Courts", "Domino Park", "LIC Courts", "Brooklyn Bridge Park"] },
  { key: "ultimate", cap: [12, 28], durMin: 90, venues: ["Prospect Park", "Central Park Great Lawn", "Randall's Island"] },
  
  // Racket Sports
  { key: "tennis", cap: [4, 8], durMin: 90, venues: ["Central Park Courts", "Riverside Courts", "Fort Greene", "Prospect Park"] },
  { key: "pickleball", cap: [4, 8], durMin: 60, venues: ["Central Park Courts", "McCarren Courts", "Brooklyn Bridge Park"] },
  { key: "badminton", cap: [4, 8], durMin: 60, venues: ["Chelsea Rec", "PS 41 Gym", "LIC Courts"] },
  
  // Fitness & Movement
  { key: "running", cap: [6, 30], durMin: 60, venues: ["Hudson River Greenway", "Central Park Loop", "Brooklyn Bridge", "Prospect Park"] },
  { key: "cycling", cap: [4, 20], durMin: 120, venues: ["Hudson River Greenway", "Central Park Loop", "Brooklyn Bridge", "Queensboro Bridge"] },
  { key: "yoga", cap: [8, 25], durMin: 60, venues: ["Central Park Great Lawn", "Prospect Park", "Brooklyn Bridge Park", "Domino Park"] },
  { key: "pilates", cap: [6, 15], durMin: 60, venues: ["Chelsea Rec", "PS 41 Gym", "LIC Courts"] },
  
  // Social & Creative
  { key: "board_games", cap: [4, 12], durMin: 120, venues: ["Central Park", "Prospect Park", "Brooklyn Bridge Park", "Domino Park"] },
  { key: "photography", cap: [4, 15], durMin: 90, venues: ["Brooklyn Bridge", "Central Park", "Prospect Park", "High Line"] },
  { key: "painting", cap: [4, 12], durMin: 120, venues: ["Central Park", "Prospect Park", "Brooklyn Bridge Park", "High Line"] },
  
  // Water Sports
  { key: "kayaking", cap: [4, 12], durMin: 120, venues: ["Hudson River", "East River", "Brooklyn Bridge Park"] },
  { key: "paddleboarding", cap: [4, 10], durMin: 90, venues: ["Hudson River", "Brooklyn Bridge Park"] },
  
  // Winter Sports
  { key: "ice_skating", cap: [4, 20], durMin: 90, venues: ["Bryant Park", "Central Park", "Prospect Park"] },
  { key: "sledding", cap: [4, 15], durMin: 60, venues: ["Central Park", "Prospect Park", "Fort Greene"] },
];

const CITY_CLUSTERS = {
  NYC: ["Manhattan", "Brooklyn", "Queens", "Harlem", "Lower East Side", "Upper West Side", "Williamsburg", "LIC", "Astoria", "Bushwick", "Park Slope", "Fort Greene"],
  ATL: ["Midtown", "Inman Park", "Old Fourth Ward", "Piedmont Park", "Westside", "Buckhead", "Virginia Highlands", "Little Five Points"],
  LA: ["Venice", "Santa Monica", "Hollywood", "Silver Lake", "Echo Park", "Griffith Park", "Malibu", "Manhattan Beach"],
  CHI: ["Lincoln Park", "Wicker Park", "Lakeview", "Bucktown", "Millennium Park", "Grant Park", "River North", "West Loop"],
  MIA: ["South Beach", "Wynwood", "Brickell", "Coconut Grove", "Key Biscayne", "Miami Beach", "Downtown"],
};

// ---------- Enhanced User Generation ----------
function makeUsers(n = 150) {
  const users = [];
  for (let i = 0; i < n; i++) {
    const uId = `user_${(i + 1).toString().padStart(3, "0")}`;
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0], lastName: name.split(" ").slice(-1)[0] }).toLowerCase();
    const avatarUrl = faker.image.avatar();

    // Enhanced sports affinity with more variety
    const sportsPrimary = sample(SPORTS.map((s) => s.key), 2 + Math.floor(Math.random() * 3));
    const sportsAffinity = {};
    
    // Primary sports get high affinity
    for (const s of sportsPrimary) {
      sportsAffinity[s] = +(0.7 + rand(0, 0.3)).toFixed(2);
    }
    
    // Secondary sports (1-2 more)
    const remainingSports = SPORTS.map((s) => s.key).filter((k) => !sportsAffinity[k]);
    const secondaryCount = Math.floor(Math.random() * 2) + 1;
    const secondarySports = sample(remainingSports, Math.min(secondaryCount, remainingSports.length));
    
    for (const s of secondarySports) {
      sportsAffinity[s] = +(0.3 + rand(0, 0.4)).toFixed(2);
    }

    // Enhanced user attributes
    const reliability = +(0.4 + rand(0, 0.59)).toFixed(2);
    const activityLevel = pick(['low', 'medium', 'high']);
    const joinFrequency = pick(['rarely', 'sometimes', 'often', 'very_often']);
    
    users.push({
      id: uId,
      displayName: name,
      email,
      avatarUrl,
      bio: faker.lorem.sentence(),
      friends: [], // filled later
      sportsAffinity,
      reliability,
      activityLevel,
      joinFrequency,
      superHost: false, // filled later
      createdAt: faker.date.past({ years: 2 }),
      location: pick(CITY_CLUSTERS[CITY] || CITY_CLUSTERS.NYC),
      timezone: 'America/New_York',
    });
  }

  // Enhanced social graph with clustering
  const targetAvgDeg = 8;
  const targetEdges = Math.floor((n * targetAvgDeg) / 2);
  const edges = new Set();

  const degree = Array(n).fill(0);
  const nodeIdx = (uid) => parseInt(uid.split("_")[1], 10) - 1;

  // Create initial clusters for better connectivity
  const clusterSize = 8;
  for (let cluster = 0; cluster < Math.floor(n / clusterSize); cluster++) {
    const start = cluster * clusterSize;
    const end = Math.min(start + clusterSize, n);
    
    // Connect within cluster
    for (let i = start; i < end - 1; i++) {
      const a = `user_${String(i + 1).padStart(3, "0")}`;
      const b = `user_${String(i + 2).padStart(3, "0")}`;
      edges.add(a + "|" + b);
      degree[i]++; degree[i + 1]++;
    }
    
    // Connect clusters with bridges
    if (cluster < Math.floor(n / clusterSize) - 1) {
      const bridgeA = `user_${String(end).padStart(3, "0")}`;
      const bridgeB = `user_${String(end + 1).padStart(3, "0")}`;
      edges.add(bridgeA + "|" + bridgeB);
      degree[end - 1]++; degree[end]++;
    }
  }

  // Fill remaining edges with preferential attachment
  while (edges.size < targetEdges) {
    const aIdx = Math.floor(Math.random() * n);
    const bIdx = weightedPick([...Array(n).keys()].filter((j) => j !== aIdx), (j) => degree[j] + 1);
    const a = users[aIdx].id;
    const b = users[bIdx].id;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!edges.has(key)) {
      edges.add(key);
      degree[aIdx]++; degree[bIdx]++;
    }
  }

  // Assign friends arrays
  for (const e of edges) {
    const [a, b] = e.split("|");
    users[nodeIdx(a)].friends.push(b);
    users[nodeIdx(b)].friends.push(a);
  }

  // Designate super-hosts: 15% with activity level boost
  const numSuper = Math.floor(n * 0.15);
  const superHostCandidates = users
    .filter(u => u.activityLevel === 'high' || u.joinFrequency === 'very_often')
    .sort((a, b) => b.friends.length - a.friends.length);
  
  for (let i = 0; i < Math.min(numSuper, superHostCandidates.length); i++) {
    superHostCandidates[i].superHost = true;
  }

  return users;
}

// ---------- Enhanced Event Generation ----------
function capForSport(sKey) {
  const sp = SPORTS.find((s) => s.key === sKey);
  const [lo, hi] = sp.cap;
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

function durationForSport(sKey) {
  const sp = SPORTS.find((s) => s.key === sKey);
  const base = sp.durMin;
  return base + Math.floor(rand(-20, 20)); // ±20 min variation
}

function timeBucket() {
  // Enhanced distribution for more realistic event timing
  const r = Math.random();
  if (r < 0.15) return "pastWeek";      // 15% past week
  if (r < 0.25) return "pastMonth";     // 10% past month
  if (r < 0.85) return "nextMonth";     // 60% next month
  if (r < 0.95) return "nextQuarter";   // 10% next quarter
  return "farFuture";                   // 5% far future
}

function startTimeByBucket(bucket) {
  const baseHour = 18 + Math.floor(rand(-3, 3)); // 3pm-9pm range
  
  if (bucket === "pastWeek") return now.subtract(Math.floor(rand(0, 6)), "day").hour(baseHour).minute(0);
  if (bucket === "pastMonth") return now.subtract(Math.floor(rand(7, 30)), "day").hour(baseHour).minute(0);
  if (bucket === "nextMonth") return now.add(Math.floor(rand(0, 30)), "day").hour(baseHour).minute(0);
  if (bucket === "nextQuarter") return now.add(Math.floor(rand(31, 90)), "day").hour(baseHour).minute(0);
  // farFuture
  return now.add(Math.floor(rand(91, 180)), "day").hour(baseHour).minute(0);
}

function makeEvents(users, m = 200, city = "NYC") {
  const avgDeg = users.reduce((a, u) => a + u.friends.length, 0) / users.length || 1;

  const events = [];
  for (let i = 0; i < m; i++) {
    // Enhanced host selection with activity level boost
    const host = weightedPick(users, (u) => {
      const superHostBoost = u.superHost ? 3 : 1;
      const socialBoost = 1 + u.friends.length / avgDeg;
      const activityBoost = u.activityLevel === 'high' ? 2 : u.activityLevel === 'medium' ? 1.5 : 1;
      return superHostBoost * socialBoost * activityBoost;
    });

    // Sport based on host affinity (weighted)
    const sports = Object.entries(host.sportsAffinity);
    const sport = weightedPick(sports, ([, w]) => Number(w))[0];

    const capacityMax = capForSport(sport);

    const bucket = timeBucket();
    const startAt = startTimeByBucket(bucket);
    const endAt = startAt.add(durationForSport(sport), "minute");
    const locksAt = startAt.subtract(30, "minute"); // joins lock 30m prior

    const cluster = pick(CITY_CLUSTERS[city] ?? CITY_CLUSTERS.NYC);
    const sportMeta = SPORTS.find((s) => s.key === sport);
    const venue = pick(sportMeta.venues);

    // Enhanced visibility distribution
    const visibility = weightedPick(
      ["public", "invite_auto", "invite_manual"],
      (x) => (x === "public" ? 70 : x === "invite_auto" ? 20 : 10)
    );

    // Enhanced event titles
    const titleTemplates = [
      `${sport.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} @ ${venue}`,
      `${sport.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} in ${cluster}`,
      `${faker.company.catchPhrase()} ${sport.replace('_', ' ')}`,
      `${sport.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Meetup`,
      `${cluster} ${sport.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Group`,
    ];

    const e = {
      id: `event_${(i + 1).toString().padStart(3, "0")}`,
      sport,
      title: pick(titleTemplates),
      description: faker.lorem.paragraph(),
      city,
      neighborhood: cluster,
      hostId: host.id,
      visibility,
      status: "confirmed", // derived later
      maxSlots: capacityMax,
      attendeeCount: 0,
      waitlistCount: 0,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes: durationForSport(sport),
      cutoffMinutes: 30,
      tz: 'America/New_York',
      location: `${venue}, ${cluster}`,
      createdBy: host.id,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: now.toISOString(),
      cancelled: false,
      attendees: [],
      currentUserAttendee: null,
      currentUserWaitlist: null,
      memberships: [],
      waitlist: [],
      requests: [],
    };

    // Host is attending by default
    e.attendees.push({ userId: host.id, user: host });
    e.attendeeCount = e.attendees.length;

    events.push(e);
  }
  return events;
}

// ---------- Enhanced Relationship Building ----------
function buildRelationships(users, events) {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const invites = [];
  const requests = [];
  const memberships = [];

  const friendsOf = (uid) => userMap.get(uid)?.friends ?? [];

  for (const e of events) {
    const host = userMap.get(e.hostId);

    // Enhanced fill rate based on sport and visibility
    const sportFillRate = e.sport.includes('team') ? 0.8 : 0.6;
    const visibilityFillRate = e.visibility === 'public' ? 1.0 : 0.7;
    const targetFill = sportFillRate * visibilityFillRate;
    const targetAttending = clamp(Math.floor(e.maxSlots * targetFill), 1, e.maxSlots);

    const hostFriends = friendsOf(host.id);
    const others = users.map((u) => u.id).filter((uid) => uid !== host.id && !hostFriends.includes(uid));

    // Enhanced scoring function
    const eventScore = (uid) => {
      const u = userMap.get(uid);
      const affinity = u?.sportsAffinity[e.sport] ?? 0;
      const proximity = hostFriends.includes(uid) ? 1 : 0.3;
      const reliability = u?.reliability ?? 0.5;
      const activity = u?.activityLevel === 'high' ? 1.2 : u?.activityLevel === 'medium' ? 1.0 : 0.8;
      return 0.5 * affinity + 0.3 * proximity + 0.1 * reliability + 0.1 * activity;
    };

    // Visibility-specific logic
    if (e.visibility === "public") {
      const candidates = [...hostFriends, ...others];
      const sorted = candidates.sort((a, b) => eventScore(b) - eventScore(a));
      
      for (const uid of sorted) {
        if (e.attendeeCount >= targetAttending) break;
        const user = userMap.get(uid);
        e.attendees.push({ userId: uid, user });
        e.attendeeCount++;
      }
      
      // Enhanced waitlist logic
      if (e.attendeeCount >= e.maxSlots) {
        const more = sorted.filter((uid) => !e.attendees.some(a => a.userId === uid));
        const waitlistSize = Math.floor(rand(2, Math.min(8, more.length)));
        for (const uid of more.slice(0, waitlistSize)) {
          const user = userMap.get(uid);
          e.waitlist.push({ userId: uid, user, position: e.waitlist.length + 1 });
          e.waitlistCount++;
        }
      }
    }

    if (e.visibility === "invite_auto") {
      const friendPool = hostFriends.length ? hostFriends : users.map((u) => u.id).filter((id) => id !== host.id);
      const inviteCount = clamp(Math.floor(rand(20, 60)), 10, friendPool.length);
      const invited = sample(friendPool, inviteCount);
      
      for (const uid of invited) {
        invites.push({ 
          id: id("invite"), 
          eventId: e.id, 
          userId: uid,
          status: 'pending',
          createdAt: faker.date.past({ days: 7 }),
          expiresAt: dayjs(e.startAt).subtract(1, 'day').toISOString()
        });
      }

      const sorted = invited.sort((a, b) => eventScore(b) - eventScore(a));
      for (const uid of sorted) {
        if (e.attendeeCount >= targetAttending) break;
        const user = userMap.get(uid);
        e.attendees.push({ userId: uid, user });
        e.attendeeCount++;
      }
      
      if (e.attendeeCount >= e.maxSlots) {
        const more = sorted.filter((uid) => !e.attendees.some(a => a.userId === uid));
        const waitlistSize = Math.floor(rand(2, Math.min(6, more.length)));
        for (const uid of more.slice(0, waitlistSize)) {
          const user = userMap.get(uid);
          e.waitlist.push({ userId: uid, user, position: e.waitlist.length + 1 });
          e.waitlistCount++;
        }
      }
    }

    if (e.visibility === "invite_manual") {
      const candidatePool = [...hostFriends, ...users.map((u) => u.id)].filter(
        (uid, i, a) => uid !== host.id && a.indexOf(uid) === i
      );
      const reqCount = clamp(Math.floor(rand(15, 35)), 10, candidatePool.length);
      const requesters = sample(candidatePool, reqCount);

      for (const uid of requesters) {
        const r = Math.random();
        let status = "pending";
        if (r < 0.20) status = "denied";
        else if (r < 0.20 + 0.40) status = "approved";
        
        requests.push({ 
          id: id("req"), 
          eventId: e.id, 
          userId: uid, 
          status,
          requestedAt: faker.date.past({ days: 14 }),
          respondedAt: status !== 'pending' ? faker.date.past({ days: 7 }) : null
        });

        if (status === "approved" && e.attendeeCount < e.maxSlots) {
          if (e.attendeeCount < Math.min(targetAttending, e.maxSlots)) {
            const user = userMap.get(uid);
            e.attendees.push({ userId: uid, user });
            e.attendeeCount++;
          } else if (Math.random() < 0.3) {
            const user = userMap.get(uid);
            e.waitlist.push({ userId: uid, user, position: e.waitlist.length + 1 });
            e.waitlistCount++;
          }
        }
      }
    }

    // Create memberships
    for (const attendee of e.attendees) {
      memberships.push({
        id: id("mem"),
        eventId: e.id,
        userId: attendee.userId,
        status: "attending",
        joinedAt: faker.date.past({ days: 30 }),
        user: attendee.user
      });
    }
    
    for (const waitlisted of e.waitlist) {
      memberships.push({
        id: id("mem"),
        eventId: e.id,
        userId: waitlisted.userId,
        status: "waitlisted",
        waitlistedAt: faker.date.past({ days: 30 }),
        waitlistOrder: waitlisted.position,
        user: waitlisted.user
      });
    }
  }

  return { invites, requests, memberships };
}

// ---------- Enhanced Finalization ----------
function finalize(events) {
  for (const e of events) {
    const n = now;
    const startTime = dayjs(e.startAt);
    const endTime = dayjs(e.endAt);
    
    // Enhanced status derivation
    if (e.cancelled) {
      e.status = "cancelled";
    } else if (endTime.isBefore(n)) {
      e.status = "ended";
    } else if (startTime.subtract(30, 'minute').isBefore(n) && startTime.isAfter(n)) {
      e.status = "locked";
    } else {
      e.status = e.attendeeCount > 0 ? "confirmed" : "pending";
    }
    
    e.updatedAt = now.toISOString();
  }

  // Enhanced validation
  for (const e of events) {
    if (e.attendeeCount !== e.attendees.length) {
      throw new Error(`attendeeCount mismatch for ${e.id}`);
    }
    if (e.waitlistCount !== e.waitlist.length) {
      throw new Error(`waitlistCount mismatch for ${e.id}`);
    }
    
    const attendeeIds = e.attendees.map(a => a.userId);
    const waitlistIds = e.waitlist.map(w => w.userId);
    const overlap = attendeeIds.filter(id => waitlistIds.includes(id));
    
    if (overlap.length) {
      throw new Error(`attendee/waitlist overlap in ${e.id}: ${overlap.join(",")}`);
    }
  }
}

// ---------- Output Writers ----------
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeJSONL(filename, arr) {
  const stream = fs.createWriteStream(filename);
  for (const obj of arr) stream.write(JSON.stringify(obj) + "\n");
  stream.end();
}

function writeAll({ users, events, memberships, invites, requests }) {
  const outDir = path.join(process.cwd(), "seed");
  ensureDir(outDir);

  writeJSONL(path.join(outDir, "users.jsonl"), users);
  writeJSONL(path.join(outDir, "events.jsonl"), events);
  writeJSONL(path.join(outDir, "memberships.jsonl"), memberships);
  writeJSONL(path.join(outDir, "invites.jsonl"), invites);
  writeJSONL(path.join(outDir, "requests.jsonl"), requests);

  // Create combined dataset
  const dataset = { users, events, memberships, invites, requests };
  fs.writeFileSync(
    path.join(outDir, "dataset.json"),
    JSON.stringify(dataset, null, 2)
  );

  // Enhanced summary
  const pct = (x) => (x * 100).toFixed(1) + "%";
  const visCount = events.reduce((acc, e) => ((acc[e.visibility] = (acc[e.visibility] || 0) + 1), acc), {});
  const sportCount = events.reduce((acc, e) => ((acc[e.sport] = (acc[e.sport] || 0) + 1), acc), {});
  
  console.log("\n🎉 Seed generated successfully!");
  console.log("📁 Output directory: ./seed/");
  console.log("\n📊 Summary:");
  console.log(`👥 Users: ${users.length}`);
  console.log(`🎯 Events: ${events.length}`);
  console.log(`🔗 Memberships: ${memberships.length}`);
  console.log(`📨 Invites: ${invites.length}`);
  console.log(`📝 Requests: ${requests.length}`);
  
  console.log("\n🎯 Event Distribution:");
  console.log(`   Visibility:`, visCount);
  console.log(`   Sports:`, sportCount);
  
  const full = events.filter((e) => e.attendeeCount >= e.maxSlots).length;
  const confirmed = events.filter((e) => e.status === 'confirmed').length;
  const pending = events.filter((e) => e.status === 'pending').length;
  
  console.log(`\n📈 Event Status:`);
  console.log(`   Full events: ${full} (${pct(full / events.length)})`);
  console.log(`   Confirmed: ${confirmed} (${pct(confirmed / events.length)})`);
  console.log(`   Pending: ${pending} (${pct(pending / events.length)})`);
  
  const avgFriends = users.reduce((sum, u) => sum + u.friends.length, 0) / users.length;
  console.log(`\n👥 Social Graph:`);
  console.log(`   Average friends per user: ${avgFriends.toFixed(1)}`);
  console.log(`   Super hosts: ${users.filter(u => u.superHost).length}`);
}

// ---------- Main ----------
function main() {
  console.log(`🚀 Generating GameOn seed data...`);
  console.log(`   Users: ${NUM_USERS}`);
  console.log(`   Events: ${NUM_EVENTS}`);
  console.log(`   City: ${CITY}`);
  if (SEED !== undefined) console.log(`   Seed: ${SEED}`);

  const users = makeUsers(NUM_USERS);
  const events = makeEvents(users, NUM_EVENTS, CITY);
  const { memberships, invites, requests } = buildRelationships(users, events);

  finalize(events);

  writeAll({ users, events, memberships, invites, requests });
}

main();
