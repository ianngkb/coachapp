"coach-dashboard-schedule": {
    "description": "Coach dashboard > Schedule tab. Lets coaches manage availability and Google Calendar sync.",
    "layout": {
      "structure": "Stacked layout with header stats, tabs, Google Calendar integration card, and weekly availability editor.",
      "flow": "Header (stats) → Tab Navigation (Sessions | Schedule | Blocked) → Google Calendar Integration → Conflict warnings → Weekly Availability by day."
    },
    "components": {
      "header_stats": {
        "cards": [
          { "icon": "Calendar", "label": "This Week", "value": "12", "subtext": "Booked sessions" },
          { "icon": "Users", "label": "Students", "value": "8", "subtext": "Active students" }
        ]
      },
      "tabs": {
        "items": ["Sessions", "Schedule", "Blocked"],
        "active": "Schedule",
        "indicator": "Black pill highlight"
      },
      "google_calendar": {
        "title": "Google Calendar Integration",
        "status": "Connected",
        "last_synced": "02:47 pm",
        "actions": ["Sync", "Disconnect"],
        "details": {
          "conflict_message": "Scheduling Conflicts Detected",
          "conflicts": [
            {
              "title": "Tennis Lesson with Sarah Chen",
              "time": "15 Aug, 02:00 pm",
              "badge": "Conflict (red)"
            }
          ]
        }
      },
      "weekly_availability": {
        "title": "Weekly Availability",
        "subtitle": "Set your available hours for each day",
        "days": [
          { "day": "Monday", "time_slots": [{ "start": "09:00", "end": "17:00" }], "toggle": true },
          { "day": "Tuesday", "time_slots": [{ "start": "09:00", "end": "17:00" }], "toggle": true },
          { "day": "Wednesday", "time_slots": [{ "start": "09:00", "end": "17:00" }], "toggle": true },
          { "day": "Thursday", "time_slots": [{ "start": "09:00", "end": "17:00" }], "toggle": true },
          { "day": "Friday", "time_slots": [{ "start": "09:00", "end": "17:00" }], "toggle": true },
          { "day": "Saturday", "time_slots": [], "toggle": false },
          { "day": "Sunday", "time_slots": [], "toggle": false }
        ],
        "actions": ["Add time slot per day", "Save Changes button"]
      }
    },
    "icon_map": {
      "header_stats": { "sessions": "Calendar", "students": "Users" },
      "tabs": "Calendar",
      "google_calendar": { "status": "CheckCircle", "conflict": "AlertTriangle" },
      "weekly_availability": { "time": "Clock", "add": "Plus", "toggle": "Switch" }
    }
  },