import { asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { links, profile, projects, siteSettings, skills, thoughts, timeline } from "@/db/schema";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  DEFAULT_LINKS,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  DEFAULT_SETTINGS,
  DEFAULT_SKILLS,
  DEFAULT_THOUGHTS,
  DEFAULT_TIMELINE,
} from "@/lib/defaults";
import { hashPassword } from "@/lib/auth";
import type {
  LinkItem,
  Profile,
  Project,
  SiteData,
  SiteSettings,
  Skill,
  Thought,
  TimelineItem,
} from "@/lib/types";
import { users } from "@/db/schema";

let seedChain: Promise<void> = Promise.resolve();
let seeded = false;

async function seedAll(): Promise<void> {
  const [existing] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
      if (!existing) {
        await db.insert(siteSettings).values({
          ...DEFAULT_SETTINGS,
          siteDescription: DEFAULT_SETTINGS.siteDescription,
        });
      }

      const [existingProfile] = await db.select({ id: profile.id }).from(profile).limit(1);
      if (!existingProfile) {
        await db.insert(profile).values(DEFAULT_PROFILE);
      }

      const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
      if (!existingUsers.length) {
        await db
          .insert(users)
          .values({
            email: ADMIN_EMAIL,
            username: ADMIN_USERNAME,
            passwordHash: await hashPassword(ADMIN_PASSWORD),
          })
          .onConflictDoNothing();
      }

      const existingProjects = await db.select({ id: projects.id }).from(projects).limit(1);
      if (!existingProjects.length) {
        await db.insert(projects).values(
          DEFAULT_PROJECTS.map((p, index) => ({ ...p, position: index, gallery: [], imageUrl: null })),
        );
      }

      const existingTimeline = await db.select({ id: timeline.id }).from(timeline).limit(1);
      if (!existingTimeline.length) {
        await db.insert(timeline).values(DEFAULT_TIMELINE.map((t, index) => ({ ...t, position: index })));
      }

      const existingSkills = await db.select({ id: skills.id }).from(skills).limit(1);
      if (!existingSkills.length) {
        await db.insert(skills).values(DEFAULT_SKILLS.map((s, index) => ({ ...s, position: index })));
      }

      const existingLinks = await db.select({ id: links.id }).from(links).limit(1);
      if (!existingLinks.length) {
        await db.insert(links).values(DEFAULT_LINKS.map((l, index) => ({ ...l, position: index })));
      }

      const existingThoughts = await db.select({ id: thoughts.id }).from(thoughts).limit(1);
      if (!existingThoughts.length) {
        await db.insert(thoughts).values(
          DEFAULT_THOUGHTS.map((t, index) => ({
            ...t,
            position: index,
            publishedAt: t.published ? new Date() : null,
          })),
        );
  }
}

function runSeed(): Promise<void> {
  const run = seedChain.then(seedAll, seedAll);
  seedChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  await runSeed();
  seeded = true;
}

async function reseed(): Promise<void> {
  await runSeed();
  seeded = true;
}

function mapProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    imageUrl: row.imageUrl,
    gallery: row.gallery ?? [],
    technologies: row.technologies ?? [],
    status: row.status,
    githubUrl: row.githubUrl,
    liveUrl: row.liveUrl,
    projectDate: row.projectDate,
    featured: row.featured,
    category: row.category,
    position: row.position,
  };
}

function mapThought(row: typeof thoughts.$inferSelect): Thought {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    category: row.category,
    published: row.published,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    position: row.position,
  };
}

async function loadSettings(): Promise<typeof siteSettings.$inferSelect> {
  let [row] = await db.select().from(siteSettings).limit(1);
  if (!row) {
    await reseed();
    [row] = await db.select().from(siteSettings).limit(1);
  }
  if (!row) throw new Error("Failed to load site settings");
  return row;
}

async function loadProfile(): Promise<typeof profile.$inferSelect> {
  let [row] = await db.select().from(profile).limit(1);
  if (!row) {
    await reseed();
    [row] = await db.select().from(profile).limit(1);
  }
  if (!row) throw new Error("Failed to load profile");
  return row;
}

export const getSiteData = cache(async (): Promise<SiteData> => {
  await ensureSeeded();
  const settingsRow = await loadSettings();
  const profileRow = await loadProfile();
  const projectRows = await db.select().from(projects).orderBy(asc(projects.position), asc(projects.id));
  const thoughtRows = await db
    .select()
    .from(thoughts)
    .orderBy(desc(thoughts.publishedAt), desc(thoughts.id));
  const timelineRows = await db.select().from(timeline).orderBy(asc(timeline.position), asc(timeline.id));
  const skillRows = await db.select().from(skills).orderBy(asc(skills.position), asc(skills.id));
  const linkRows = await db.select().from(links).orderBy(asc(links.position), asc(links.id));

  const settings: SiteSettings = {
    id: settingsRow.id,
    siteTitle: settingsRow.siteTitle,
    siteDescription: settingsRow.siteDescription,
    heroKicker: settingsRow.heroKicker,
    heroTitle: settingsRow.heroTitle,
    heroSubtitle: settingsRow.heroSubtitle,
    landingQuestion: settingsRow.landingQuestion,
    landingHint: settingsRow.landingHint,
    pathWork: settingsRow.pathWork,
    pathWorkHint: settingsRow.pathWorkHint,
    pathMe: settingsRow.pathMe,
    pathMeHint: settingsRow.pathMeHint,
    pathConnect: settingsRow.pathConnect,
    pathConnectHint: settingsRow.pathConnectHint,
    philosophy: settingsRow.philosophy,
    symbols: settingsRow.symbols,
    metaImage: settingsRow.metaImage,
  };

  const profileData: Profile = {
    id: profileRow.id,
    name: profileRow.name,
    tagline: profileRow.tagline,
    shortBio: profileRow.shortBio,
    bio: profileRow.bio,
    photoUrl: profileRow.photoUrl,
    learning: profileRow.learning,
    building: profileRow.building,
    goals: profileRow.goals,
    location: profileRow.location,
    email: profileRow.email,
    whatsapp: profileRow.whatsapp,
    resumeUrl: profileRow.resumeUrl,
  };

  return {
    settings,
    profile: profileData,
    projects: projectRows.map(mapProject),
    thoughts: thoughtRows.map(mapThought),
    timeline: timelineRows.map((row: typeof timeline.$inferSelect): TimelineItem => ({
      id: row.id,
      year: row.year,
      title: row.title,
      body: row.body,
      position: row.position,
    })),
    skills: skillRows.map((row: typeof skills.$inferSelect): Skill => ({
      id: row.id,
      name: row.name,
      category: row.category,
      level: row.level,
      position: row.position,
    })),
    links: linkRows.map((row: typeof links.$inferSelect): LinkItem => ({
      id: row.id,
      label: row.label,
      url: row.url,
      kind: row.kind,
      position: row.position,
    })),
  };
});

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await ensureSeeded();
  const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return row ? mapProject(row) : null;
}

export async function getThoughtBySlug(slug: string): Promise<Thought | null> {
  await ensureSeeded();
  const [row] = await db.select().from(thoughts).where(eq(thoughts.slug, slug)).limit(1);
  return row ? mapThought(row) : null;
}
