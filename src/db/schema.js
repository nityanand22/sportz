import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const matchStatus = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

// Define the 'demo_users' table
export const demoUsers = pgTable("demo_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matches table (DB table name: matches)
// Variable names use camelCase; column names use snake_case
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sport: text("sport").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  status: matchStatus("status").notNull().default("scheduled"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Commentary table (DB table name: commentary)
// - matchId references matches.id
// - metadata stores JSONB match metadata
// - tags stored as JSONB array of strings
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id),
  minute: integer("minute"),
  sequence: integer("sequence"),
  period: text("period"),
  eventType: text("event_type"),
  actor: text("actor"),
  team: text("team"),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  tags: jsonb("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
