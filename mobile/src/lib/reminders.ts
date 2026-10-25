import * as Notifications from "expo-notifications";
import type { Conversation } from "./types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/**
 * Local notification at 9am on the follow-up's send date: "Time to follow up with Dana".
 * Replaces any earlier reminder for the same conversation. No-op if permission is denied.
 */
export async function scheduleFollowUpReminder(c: Conversation): Promise<void> {
  try {
    const id = `followup-${c.id}`;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
    if (!c.followUp || c.followUp.status === "sent") return;

    const [y, m, d] = c.followUp.sendOn.split("-").map(Number);
    let when = new Date(y, m - 1, d, 9, 0, 0);
    if (when.getTime() < Date.now() + 60_000) when = new Date(Date.now() + 60_000);

    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== "granted" && (await Notifications.requestPermissionsAsync()).status !== "granted") return;

    const who = c.recruiter.name.split(" ")[0] || "your recruiter";
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title: `Time to follow up with ${who}`, body: c.followUp.subject, data: { conversationId: c.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    // Reminders are a convenience; never block the follow-up flow.
  }
}
