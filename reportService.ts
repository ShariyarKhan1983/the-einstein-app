import { WeeklyReport, UserState } from "./types";

export const generateWeeklyReport = (user: UserState): WeeklyReport => {
  // Real Logic: Calculate score based on engagement
  // Base score 50. 
  // +1 point per voice minute (approx 750 chars/min)
  // +2 points per image
  // Cap at 100.
  
  const voiceMinutes = Math.floor(user.monthlyVoiceChars / 750);
  const images = user.dailyImageCount;

  let calculatedScore = 50 + (voiceMinutes * 1) + (images * 2);
  if (calculatedScore > 100) calculatedScore = 100;
  if (user.monthlyVoiceChars === 0 && user.dailyImageCount === 0 && user.monthlyVideoCount === 0) calculatedScore = 0; // Inactive

  const subjects = user.schedule.map(s => s.subject);
  const uniqueSubjects = [...new Set(subjects)];
  
  // Determine summary based on real data
  let summary = "No study activity recorded this week.";
  if (calculatedScore > 80) summary = "Outstanding engagement! You are maximizing your AI tools.";
  else if (calculatedScore > 50) summary = "Good consistency. Try using Voice Mode more for deeper retention.";
  else if (calculatedScore > 0) summary = "You started your journey. Create a schedule to stay on track.";

  // Determine strengths/weaknesses from Gaps
  const weakness = user.learningGaps.length > 0 
    ? user.learningGaps[0].topic 
    : (uniqueSubjects[0] || "None Recorded");

  const strength = user.exams.length > 0 
    ? "Exam Preparation" 
    : "General Curiosity";

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    score: Math.floor(calculatedScore),
    summary: summary,
    strength: strength,
    weakness: weakness
  };
};

export const updateReports = (currentReports: WeeklyReport[], user: UserState): WeeklyReport[] => {
  // Only generate a new report if the last one was from a previous week
  const lastReport = currentReports[0];
  const now = new Date();
  
  // If we have a report from less than 6 days ago, don't generate new one
  if (lastReport) {
      const lastDate = new Date(lastReport.date);
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays < 7) {
          return currentReports;
      }
  }

  const newReport = generateWeeklyReport(user);
  const updated = [newReport, ...currentReports];
  return updated.slice(0, 4); // Keep only 4
};
