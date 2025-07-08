export {};

declare global {
  /**
   * Represents an action button displayed on a notification.
   */
  interface NotificationAction {
    /** A string identifying the action. */
    action: string;
    /** Title of the action button. */
    title: string;
    /** Optional URL of the icon for the action button. */
    icon?: string;
  }

  interface NotificationOptions {
    /**
     * Vibration pattern for device vibration (durations and pauses in milliseconds).
     */
    vibrate?: number[];
    /**
     * List of action buttons to display on the notification.
     */
    actions?: NotificationAction[];
  }
}
