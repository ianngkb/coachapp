"coach-dashboard-services": {
    "description": "UI for listing and managing existing coaching services. Each service appears as a card with details and action buttons.",
    "layout": {
      "structure": "Single-column list of service cards under header",
      "flow": "Header → Add Service button → Service Cards"
    },
    "components": {
      "header": {
        "title": "My Services",
        "subtitle": "Manage your coaching services",
        "action_button": {
          "label": "Add Service",
          "style": "primary",
          "icon": "Plus"
        }
      },
      "service_cards": [
        {
          "title": "Individual Tennis Lesson",
          "tag": "Individual",
          "description": "One-on-one coaching focusing on technique, strategy, and match play",
          "duration": "60 minutes",
          "type": "In-Person Only",
          "price": "RM80",
          "max_students": "1 student",
          "icons": { "duration": "Clock", "type": "MapPin", "price": "DollarSign", "students": "Users" },
          "actions": [
            { "label": "Edit", "icon": "Pencil" },
            { "label": "Delete", "icon": "Trash2", "style": "danger" }
          ]
        },
        {
          "title": "Fitness & Conditioning",
          "tag": "Fitness",
          "description": "Tennis-specific fitness training to improve agility, strength, and endurance",
          "duration": "45 minutes",
          "type": "Online & In-Person",
          "price": "RM60",
          "max_students": "4 students",
          "icons": { "duration": "Clock", "type": "Monitor", "price": "DollarSign", "students": "Users" },
          "actions": [
            { "label": "Edit", "icon": "Pencil" },
            { "label": "Delete", "icon": "Trash2" }
          ]
        },
        {
          "title": "Strategy Session",
          "tag": "Strategy",
          "description": "Online session focusing on match strategy and mental game",
          "duration": "30 minutes",
          "type": "Online Only",
          "price": "RM40",
          "max_students": "1 student",
          "icons": { "duration": "Clock", "type": "Monitor", "price": "DollarSign", "students": "Users" },
          "actions": [
            { "label": "Edit", "icon": "Pencil" },
            { "label": "Delete", "icon": "Trash2" }
          ]
        }
      ]
    },
    "typography": {
      "headers": { "size": "lg", "weight": "semibold" },
      "card_titles": { "size": "md", "weight": "semibold" },
      "tags": { "size": "xs", "weight": "medium", "style": "badge" }
    },
    "colors": {
      "background": "#FFFFFF",
      "card_bg": "#F9FAFB",
      "badge_bg": "#E5E7EB",
      "danger": "#EF4444"
    },
    "spacing_alignment": {
      "page_padding": "px-6 py-4",
      "card_spacing": "mb-4 p-4 rounded-lg shadow-sm",
      "icon_text_gap": "ml-2"
    },
    "interaction_cues": {
      "edit": "Pencil icon suggests editable content",
      "delete": "Trash2 icon with red hover state",
      "add_service": "Plus icon button triggers modal"
    },
    "icon_map": {
      "duration": "Clock",
      "type_in_person": "MapPin",
      "type_online": "Monitor",
      "price": "DollarSign",
      "students": "Users",
      "edit": "Pencil",
      "delete": "Trash2",
      "add_service": "Plus"
    }
  }
}