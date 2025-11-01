// ABOUTME: Program metadata definitions for curated guided journeys.

export type ProgramDay = {
  day: number;
  title: string;
  durationMinutes: number;
  beatFrequency: number;
  carrierLeft: number;
  carrierRight: number;
  intent: string;
  before: string;
  focusCue: string;
  after: string;
};

export type ProgramDefinition = {
  id: "deep-work-sprint";
  name: string;
  tagline: string;
  summary: string;
  heroCta: string;
  totalDays: number;
  days: ProgramDay[];
  disclaimer?: string;
};

export const DEEP_WORK_SPRINT: ProgramDefinition = {
  id: "deep-work-sprint",
  name: "Deep Work Sprint",
  tagline: "Seven focused sessions to sharpen your shipping cadence.",
  summary:
    "A guided week of alternating sprints and resets. Follow the daily prompts, breathe into each frequency shift, and capture one breakthrough per session.",
  heroCta: "Start Deep Work Sprint",
  totalDays: 7,
  disclaimer: "This program combines frequencies from published research (alpha, theta ranges) with experimental protocols. Individual sessions use frequencies not specifically validated in clinical studies. Designed as a productivity tool, not for clinical outcomes. Effect sizes in research are modest and individual responses vary significantly.",
  days: [
    {
      day: 1,
      title: "Prime Focus",
      durationMinutes: 20,
      beatFrequency: 15,
      carrierLeft: 200,
      carrierRight: 215,
      intent: "Kick off the sprint and lock onto a single deliverable.",
      before: "Write down the one task you will complete today. Silence notifications for 30 minutes.",
      focusCue: "Work in 10-minute micro-sprints, stand and stretch once before the midpoint.",
      after: "Capture one win and one blocker in your notes app.",
    },
    {
      day: 2,
      title: "Flow Builder",
      durationMinutes: 25,
      beatFrequency: 12,
      carrierLeft: 200,
      carrierRight: 212,
      intent: "Extend focus with a lighter cognitive load to preserve energy.",
      before: "Skim your task list, highlight the next most strategic item, and close the rest.",
      focusCue: "Stay in the chair—note any distractions on paper instead of breaking focus.",
      after: "Rate your focus from 1-5 and jot the biggest distraction.",
    },
    {
      day: 3,
      title: "Deep Dive",
      durationMinutes: 35,
      beatFrequency: 7,
      carrierLeft: 200,
      carrierRight: 207,
      intent: "Drop into sustained flow for complex problem solving.",
      before: "Take five deep breaths, slow inhales to a count of 4 and exhales to 6.",
      focusCue: "Use a notebook to diagram thoughts instead of switching tabs.",
      after: "Write one insight you want to keep exploring tomorrow.",
    },
    {
      day: 4,
      title: "Recovery Reset",
      durationMinutes: 12,
      beatFrequency: 6,
      carrierLeft: 200,
      carrierRight: 206,
      intent: "Clear mental residue and give your nervous system breathing room.",
      before: "Step away from screens for two minutes, grab water, and settle back in.",
      focusCue: "Keep eyes closed and breathe with the tempo—this is a downshift.",
      after: "Stretch shoulders and note how your energy shifted.",
    },
    {
      day: 5,
      title: "Peak Sprint",
      durationMinutes: 30,
      beatFrequency: 18,
      carrierLeft: 200,
      carrierRight: 218,
      intent: "Channel momentum into your most demanding work block.",
      before: "Outline the deliverable in three bullet points so you can execute without guessing.",
      focusCue: "Every ten minutes, glance at your outline and confirm you are still on target.",
      after: "Log the exact progress made—celebrate the tangible output.",
    },
    {
      day: 6,
      title: "Integration",
      durationMinutes: 20,
      beatFrequency: 10,
      carrierLeft: 200,
      carrierRight: 210,
      intent: "Consolidate learnings, connect threads, and prep for the final push.",
      before: "Review the notes from earlier days and highlight one insight worth amplifying.",
      focusCue: "Keep posture relaxed; this session is about clarity more than brute force.",
      after: "Journal two sentences: one about progress, one about a question that remains.",
    },
    {
      day: 7,
      title: "Sustain Habit",
      durationMinutes: 25,
      beatFrequency: 15,
      carrierLeft: 200,
      carrierRight: 215,
      intent: "Close the sprint and design how you will maintain the gains next week.",
      before: "Set a timer for 2 minutes and free-write your biggest win from the sprint.",
      focusCue: "Visualize handing off the finished work as you move through the session.",
      after: "Schedule your next deep work block on the calendar before you stand up.",
    },
  ],
};

