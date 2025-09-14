{
  "coach-edit-profile": {
    "description": "This is the coach profile editing screen where a coach can manage their personal and professional information, certifications, specializations, and preview how their profile appears to students.",
    "layout": {
      "structure": "Single column, scrollable form layout with grouped sections inside rounded cards",
      "flow": "Header → Profile Photo → Basic Information → Professional Details → About Me → Profile Preview → Save Changes"
    },
    "components": {
      "header": {
        "title": "My Profile",
        "subtitle": "Edit your coaching profile",
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
        "helper_text": "Upload a professional photo (max 5MB)",
        "avatar": { "size": "lg", "shape": "circle" }
      },
      "basic_information": {
        "title": "Basic Information",
        "fields": [
          {
            "label": "Full Name",
            "type": "input",
            "value": "Sarah Chen"
          },
          {
            "label": "Email Address",
            "type": "input_disabled",
            "value": "sarah.chen@example.com",
            "helper": "Email cannot be changed for security reasons"
          },
          {
            "label": "Phone Number",
            "type": "input",
            "placeholder": "+60 XX-XXX XXXX",
            "value": "+60 12-345 6789",
            "helper": "Malaysian phone numbers only"
          },
          {
            "label": "Location",
            "type": "dropdown",
            "value": "Kuala Lumpur"
          },
          {
            "label": "City",
            "type": "dropdown",
            "value": "Kuala Lumpur City Centre"
          }
        ]
      },
      "professional_details": {
        "title": "Professional Details",
        "sports": {
          "label": "Sports",
          "type": "checkbox_group",
          "options": [
            "Basketball",
            "Badminton",
            "Football",
            "Table Tennis",
            "Boxing",
            "Tennis",
            "Swimming",
            "Volleyball",
            "Golf",
            "Muay Thai"
          ],
          "selected": ["Tennis"]
        },
        "years_experience": {
          "label": "Years of Experience",
          "type": "number_input",
          "value": "8"
        },
        "certifications": {
          "label": "Certifications (optional)",
          "type": "input",
          "value": "ITT Level 2, Fitness Training Certified"
        },
        "languages": {
          "label": "Languages (optional)",
          "type": "input",
          "value": "English, Mandarin"
        },
        "specialties": {
          "label": "Specialties (optional)",
          "type": "input",
          "value": "Technique, Strategy, Fitness"
        },
        "preferred_courts": {
          "label": "Preferred Courts (optional)",
          "type": "checkbox_group",
          "options": [
            "Base Pickle and Padel",
            "91 Pickle",
            "Pickle Social Club",
            "KL Sports Center",
            "Olympic Sports Complex",
            "The Curve Sports Center",
            "Mid Valley Sports Center",
            "Acadium Badminton Hall",
            "SU Survanay Sports Complex",
            "Utama Sports Center",
            "Bangsar Sports Complex"
          ],
          "selected": ["Base Pickle and Padel", "KLCC Tennis Centre"]
        }
      },
      "about_me": {
        "title": "About Me",
        "bio": {
          "type": "textarea",
          "value": "Professional tennis coach with over 8 years of experience. Specialized in technique improvement and match strategy for players of all levels.",
          "character_count": "145/500"
        }
      },
      "profile_preview": {
        "title": "Profile Preview",
        "description": "This is how your profile will appear to students",
        "card": {
          "name": "Sarah Chen",
          "location": "Kuala Lumpur City Centre, Kuala Lumpur",
          "tags": ["Tennis", "Fitness"],
          "bio_snippet": "Professional tennis coach with over 8 years of experience. Specialized in technique improvement and match strategy for players of all levels.",
          "rates": "RM80 - 1h / 8 years experience"
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
      "badge_bg": "#E5E7EB",
      "button_primary": "#111111"
    },
    "spacing_alignment": {
      "page_padding": "px-6 py-4",
      "section_spacing": "mb-8",
      "field_spacing": "mb-4",
      "input_padding": "p-2"
    },
    "interaction_cues": {
      "checkbox_group": "Tick marks with filled backgrounds when selected",
      "dropdowns": "ChevronDown icon indicates expand/collapse",
      "save_button": "Top-right Save Changes button becomes active on edit"
    },
    "icon_map": {
      "profile_photo": "Camera",
      "phone": "Phone",
      "location": "MapPin",
      "dropdown_chevron": "ChevronDown",
      "sports_checkbox": "CheckSquare",
      "bio": "FileText",
      "save_changes": "Save"
    },
    "a11y": {
      "labels": "Each input linked with <label for>",
      "profile_preview": { "aria_label": "Student-facing preview of coach profile" },
      "checkboxes": { "aria_role": "checkbox group" }
    }
  }
}
