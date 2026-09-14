import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roomly",
  description: "The shared planner for your household — expenses, chores, groceries, and quiet hours.",
};

const DIRECTION_CONTRACT = `
IMPECCABLE DIRECTION CONTRACT
THESIS: Roomly reads like a shared household planner, not a fintech dashboard —
a week-view grid of colored highlighter lanes (one hue per category) refuses the
soft-card "Everyday App" template every group-expense tool already wears.
OWN-WORLD: Paper-white ground (not cream), ink-blue action color reserved for
pressable controls only, four category highlighter accents (coral expenses,
teal chores, amber groceries, indigo quiet hours), ruled planner-page lines,
Inter throughout with tabular numerals, checkbox glyphs, week-lane layout.
STORY: A roommate opens the app between classes, sees this week's planner
spread at a glance — what's owed, whose chore turn it is, what's needed at the
store, when the house is quiet — taps to log or check something, and watches
it flip into place live for everyone else.
FIRST VIEWPORT: dashboard opens on a week-view planner spread: horizontal
ruled lanes, one per category, each tinted its highlighter color, a persistent
thumb-reachable action bar pinned to the bottom, household name as page header.
FORM: Weekly Planner (grounded candidate 5), raised with bottom-bar + reserved
action-color (from Everyday App, competitive), tabular-numeral rigor (from
Ikeda Datamatics, declined-but-donated), live flip micro-interaction (from
Split-Flap Concourse, competitive), day/night horizon treatment on quiet hours
(from Cyclorama Dawn, declined-but-donated). Seed key 8fe42573.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `<!--${DIRECTION_CONTRACT}-->` }}
        />
        {children}
      </body>
    </html>
  );
}
