{
  "coach-dashboard-create-service": {
    "description": "UI for creating a new coaching service within the coach dashboard. Uses a modal overlay on top of the existing 'My Services' screen.",
    "layout": {
      "structure": "Modal overlay centered on screen, darkened backdrop behind",
      "flow": "Header → Service form (fields for name, category, duration, price, type, max students, description) → Action buttons (Cancel, Add Service)"
    },
    "components": {
      "modal": {
        "title": "Add New Service",
        "subtitle": "Create a new coaching service for your students",
        "fields": [
          {
            "label": "Service Name",
            "type": "input",
            "placeholder": "Individual Tennis Lesson",
            "icon": "Type"
          },
          {
            "label": "Category",
            "type": "dropdown",
            "options": ["Individual", "Fitness", "Strategy"],
            "icon": "Tags"
          },
          {
            "label": "Duration (minutes)",
            "type": "input_number",
            "placeholder": "60",
            "icon": "Clock"
          },
          {
            "label": "Price (RM)",
            "type": "input_number",
            "placeholder": "50",
            "icon": "DollarSign"
          },
          {
            "label": "Service Type",
            "type": "dropdown",
            "options": ["In-Person Only", "Online & In-Person", "Online Only"],
            "icon": "Monitor"
          },
          {
            "label": "Maximum Students",
            "type": "input_number",
            "placeholder": "1",
            "icon": "Users"
          },
          {
            "label": "Description",
            "type": "textarea",
            "placeholder": "Describe what this service includes...",
            "icon": "FileText"
          }
        ],
        "actions": [
          {
            "label": "Cancel",
            "style": "outline",
            "alignment": "left"
          },
          {
            "label": "Add Service",
            "style": "primary",
            "alignment": "right"
          }
        ]
      }
    },
    "typography": {
      "modal_title": { "size": "lg", "weight": "semibold" },
      "labels": { "size": "sm", "weight": "medium" }
    },
    "colors": {
      "modal_bg": "#FFFFFF",
      "backdrop": "rgba(0,0,0,0.6)",
      "input_bg": "#F9FAFB"
    },
    "spacing_alignment": {
      "modal_padding": "p-6",
      "field_spacing": "mb-4",
      "actions_spacing": "mt-6 flex justify-between"
    },
    "interaction_cues": {
      "close": { "icon": "X", "placement": "top-right corner" },
      "dropdowns": { "chevron": "ChevronDown" },
      "numeric_inputs": { "spinner": "optional" }
    },
    "icon_map": {
      "service_name": "Type",
      "category": "Tags",
      "duration": "Clock",
      "price": "DollarSign",
      "service_type": "Monitor",
      "max_students": "Users",
      "description": "FileText",
      "close_modal": "X"
    }
  },