{
  "student-edit-profile": {
    "description": "This is the student profile editing screen where a student can manage their personal details and preview how their profile will appear to coaches when booking sessions.",
    "layout": {
      "structure": "Single column, scrollable form layout with sections inside rounded cards",
      "flow": "Header → Profile Photo → Basic Information → Profile Preview → Save Changes"
    },
    "components": {
      "header": {
        "title": "My Profile",
        "subtitle": "Manage your personal information",
        "action_button": {
          "label": "Save Changes",
          "style": "primary",
          "placement": "top-right",
          "icon": "Save"
        }
      },
      "profile_photo": {
        "title": "Profile Photo",
        "upload_button": {
          "label": "Change Photo",
          "style": "outline",
          "icon": "Camera"
        },
        "helper_text": "Upload a profile photo (max 5MB)",
        "avatar": { "size": "lg", "shape": "circle" }
      },
      "basic_information": {
        "title": "Basic Information",
        "fields": [
          {
            "label": "Full Name *",
            "type": "input",
            "value": "Alex Johnson"
          },
          {
            "label": "Email Address",
            "type": "input_disabled",
            "value": "alex.johnson@example.com",
            "helper": "Email cannot be changed for security reasons"
          },
          {
            "label": "Mobile Number *",
            "type": "input",
            "value": "+60 12-345 6789",
            "helper": "Required – This will be shared with coaches when you book sessions"
          },
          {
            "label": "Age",
            "type": "input_number",
            "value": "28"
          }
        ]
      },
      "profile_preview": {
        "title": "Profile Preview",
        "description": "This is how your profile will appear to coaches when you book sessions",
        "card": {
          "avatar": { "size": "sm", "shape": "circle" },
          "name": "Alex Johnson",
          "details": ["Age 28", "+60 12-345 6789"]
        }
      }
    },
    "typography": {
      "headers": { "size": "lg", "weight": "semibold" },
      "labels": { "size": "sm", "weight": "medium" },
      "inputs": { "size": "sm", "color": "neutral-700" }
    },
    "colors": {
      "background": "#FFFFFF",
      "card_bg": "#F9FAFB",
      "input_bg": "#FFFFFF",
      "button_primary": "#111111"
    },
    "spacing_alignment": {
      "page_padding": "px-6 py-4",
      "section_spacing": "mb-8",
      "field_spacing": "mb-4",
      "input_padding": "p-2"
    },
    "interaction_cues": {
      "save_button": "Top-right Save Changes button becomes active when edits are made",
      "disabled_field": "Email address is shown grayed-out, not editable"
    },
    "icon_map": {
      "profile_photo": "Camera",
      "phone": "Phone",
      "save_changes": "Save"
    },
    "a11y": {
      "labels": "Each input linked with <label for>",
      "profile_preview": { "aria_label": "Preview of student profile as seen by coaches" }
    }
  }
}
