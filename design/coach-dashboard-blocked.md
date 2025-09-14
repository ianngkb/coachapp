{
  "coach-dashboard-blocked": {
    "description": "Coach dashboard > Blocked tab. Allows coaches to manage unavailable dates.",
    "layout": {
      "structure": "Single-column stacked layout with header stats, tab navigation, calendar, and blocked periods list.",
      "flow": "Header (stats) → Tab Navigation (Sessions | Schedule | Blocked) → Blocked Dates section → Calendar Overview → Blocked Periods list."
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
        "active": "Blocked",
        "indicator": "Black pill highlight"
      },
      "blocked_dates": {
        "title": "Blocked Dates",
        "subtitle": "Manage dates when you're unavailable",
        "calendar": {
          "month": "September 2025",
          "blocked_dates_color": "black"
        },
        "actions": [
          { "type": "Button", "variant": "default", "icon": "Plus", "label": "Block Dates" }
        ]
      },
      "blocked_periods": {
        "title": "Blocked Periods",
        "items": [
          { "title": "Family vacation", "type": "Date range", "date_range": "Dec 20 – Dec 31, 2024", "actions": ["Delete"] },
          { "title": "Annual checkup", "type": "Single day", "date": "Oct 15, 2024", "actions": ["Delete"] }
        ]
      }
    },
    "icon_map": {
      "header_stats": { "sessions": "Calendar", "students": "Users" },
      "blocked_dates": "Calendar",
      "actions": { "block_dates": "Plus", "delete": "Trash" }
    }
      },