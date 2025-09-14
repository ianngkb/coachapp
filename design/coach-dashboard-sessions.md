"coach-dashboard-sessions": {
    "description": "Coach dashboard > Sessions tab. Displays all booked, upcoming, completed, and cancelled sessions with filters.",
    "layout": {
      "structure": "Stacked layout with header stats, tabs, summary metrics, filters, and session list.",
      "flow": "Header (stats) → Tab Navigation (Sessions | Schedule | Blocked) → Session summary (counts + earnings) → Filters → List of booked sessions."
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
        "active": "Sessions",
        "indicator": "Black pill highlight"
      },
      "session_summary": {
        "metrics": [
          { "label": "Upcoming", "value": 3 },
          { "label": "Completed", "value": 1 },
          { "label": "Earned", "value": "RM80" }
        ]
      },
      "filters": {
        "search": { "placeholder": "Search by student name or sport…" },
        "dropdowns": [
          { "label": "All Sessions", "options": ["All", "Upcoming", "Completed", "Cancelled"] },
          { "label": "Filter by date", "options": ["Date picker"] }
        ]
      },
      "session_list": [
        {
          "student": "David Kim",
          "avatar": "DK",
          "sport": "Tennis · Individual",
          "date": "Oct 18, 2024",
          "time": "10:00 (60min)",
          "location": "Online",
          "tag": "Strategy and mental game session",
          "status": "upcoming",
          "price": "RM80",
          "actions": ["Reschedule", "WhatsApp Student"]
        },
        {
          "student": "Marcus Johnson",
          "avatar": "MJ",
          "sport": "Tennis · Individual",
          "date": "Oct 18, 2024",
          "time": "14:30 (60min)",
          "location": "Courts at Marina Bay",
          "status": "upcoming",
          "price": "RM120",
          "actions": ["Reschedule", "WhatsApp Student"]
        },
        {
          "student": "Sarah Chen",
          "avatar": "SC",
          "sport": "Tennis · Individual",
          "date": "Oct 18, 2024",
          "time": "16:00 (60min)",
          "location": "Courts at Marina Bay",
          "tag": "Focus on backhand technique",
          "status": "upcoming",
          "price": "RM80",
          "actions": ["Reschedule", "WhatsApp Student"]
        },
        {
          "student": "Emily Wong",
          "avatar": "EW",
          "sport": "Tennis · Individual",
          "date": "Oct 14, 2024",
          "time": "16:00 (60min)",
          "location": "Court 5-6",
          "status": "completed",
          "price": "RM80",
          "actions": ["WhatsApp Student"]
        },
        {
          "student": "Lisa Park",
          "avatar": "LP",
          "sport": "Tennis · Individual",
          "date": "Oct 12, 2024",
          "time": "10:00 (60min)",
          "location": "Courts at Marina Bay",
          "status": "cancelled",
          "price": "RM80",
          "actions": []
        }
      ]
    },
    "icon_map": {
      "header_stats": { "sessions": "Calendar", "students": "Users" },
      "filters": { "search": "Search", "dropdown": "ChevronDown", "date": "Calendar" },
      "session_list": {
        "status_upcoming": "Clock",
        "status_completed": "CheckCircle",
        "status_cancelled": "XCircle",
        "actions": { "reschedule": "RotateCcw", "whatsapp": "MessageSquare" }
      }
    }
  }
}