{
  "student-dashboard-sessions": {
    "description": "This is the student dashboard screen for viewing booked coaching sessions. It allows toggling between upcoming and past sessions and provides details for each scheduled lesson.",
    "layout": {
      "structure": "Single column, card-based layout",
      "flow": "Header → Tabs (Upcoming/Past) → Session Card(s)"
    },
    "components": {
      "header": {
        "title": "My Sessions",
        "subtitle": "Manage your bookings here"
      },
      "tabs": {
        "options": ["Upcoming", "Past"],
        "selected": "Upcoming",
        "style": "pill tabs with background highlight"
      },
      "session_card": {
        "title": "Individual Tennis Lesson",
        "coach": "with Sarah Chen",
        "details": [
          {
            "icon": "Calendar",
            "text": "Sat, Jan 20 at 2:00 PM"
          },
          {
            "icon": "Clock",
            "text": "60 minutes"
          },
          {
            "icon": "MapPin",
            "text": "Kuala Lumpur Tennis Centre"
          }
        ],
        "actions": [
          {
            "label": "Add to Calendar",
            "icon": "CalendarPlus"
          }
        ],
        "status": {
          "label": "Upcoming",
          "style": "pill",
          "color": "black"
        },
        "price": {
          "amount": "RM80",
          "placement": "bottom-right of card"
        },
        "avatar": {
          "image": "Coach Sarah Chen profile image",
          "placement": "left side of card",
          "shape": "circle"
        }
      }
    },
    "typography": {
      "headers": { "size": "lg", "weight": "semibold" },
      "card_titles": { "size": "md", "weight": "semibold" },
      "coach_name": { "size": "sm", "weight": "normal", "color": "neutral-700" },
      "details": { "size": "sm", "color": "neutral-600" }
    },
    "colors": {
      "background": "#FFFFFF",
      "card_bg": "#F9FAFB",
      "pill_active": "#111111",
      "pill_inactive": "#F3F4F6"
    },
    "spacing_alignment": {
      "page_padding": "px-6 py-4",
      "card_padding": "p-4",
      "element_gap": "mb-2",
      "tabs_gap": "space-between with horizontal padding"
    },
    "interaction_cues": {
      "tabs": "Active tab has dark background; inactive is light gray",
      "action": "Add to Calendar clickable with hover effect",
      "status_pill": "Black pill indicates session is upcoming"
    },
    "icon_map": {
      "calendar": "Calendar",
      "duration": "Clock",
      "location": "MapPin",
      "add_to_calendar": "CalendarPlus"
    },
    "a11y": {
      "tabs": { "aria_role": "tablist", "aria_selected": true },
      "session_card": { "aria_label": "Individual Tennis Lesson with Sarah Chen" },
      "buttons": { "add_to_calendar": "Adds session to user’s calendar" }
    }
  }
}
