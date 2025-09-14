{
  "screenshot_9": {
    "description": "Coach profile page displaying coach details, offered services, preferred courts, certifications, locations, reviews summary, and recent reviews.",
    "imports": {
      "shadcn": [
        "import { Avatar, AvatarImage, AvatarFallback } from \"@/components/ui/avatar\"",
        "import { Button } from \"@/components/ui/button\"",
        "import { Card, CardHeader, CardContent, CardFooter } from \"@/components/ui/card\"",
        "import { Badge } from \"@/components/ui/badge\"",
        "import { Separator } from \"@/components/ui/separator\"",
        "import { Progress } from \"@/components/ui/progress\"",
        "import { Tabs, TabsList, TabsTrigger, TabsContent } from \"@/components/ui/tabs\"",
        "import { ScrollArea } from \"@/components/ui/scroll-area\""
      ],
      "lucide": [
        "import { ArrowLeft, Star, Clock, MapPin, Dumbbell, Brain } from \"lucide-react\""
      ]
    },
    "layout": {
      "structure": "Single-column stacked layout with sections separated by whitespace",
      "flow": "Back navigation → Coach Header (avatar + info) → Services → Preferred Courts → Certifications → Locations → Reviews Summary → Recent Reviews",
      "sections": [
        "Header Navigation",
        "Coach Overview",
        "Services Offered",
        "Preferred Courts",
        "Certifications",
        "Locations",
        "Reviews Summary",
        "Recent Reviews"
      ]
    },
    "components": {
      "header_nav": {
        "back_button": {
          "icon": "ArrowLeft",
          "label": "Back",
          "type": "Text + Icon",
          "placement": "Top-left corner"
        }
      },
      "coach_overview": {
        "avatar": {
          "component": "Avatar",
          "image": "Coach profile picture",
          "fallback": "Initials SC",
          "shape": "circle",
          "size": "large"
        },
        "name": "Sarah Chen",
        "verification_badge": "Check mark (verified profile)",
        "rating": {
          "icon": "Star",
          "value": "4.9",
          "count": "127 reviews"
        },
        "experience": "8 years experience",
        "tags": [
          { "label": "Tennis", "variant": "outline" },
          { "label": "Fitness", "variant": "outline" },
          { "label": "Mental Coaching", "variant": "outline" }
        ],
        "bio": "Professional tennis coach with 8+ years experience coaching players from beginner to advanced levels. Former national player with expertise in technique refinement, mental game, and competitive strategy. I believe in personalized coaching that adapts to each student’s learning style and goals."
      },
      "services": {
        "title": "Services",
        "items": [
          {
            "title": "Individual Tennis Lesson",
            "icon": "Clock",
            "duration": "60 min",
            "mode": "Physical",
            "description": "One-on-one coaching focusing on technique, strategy, and match play",
            "price": "RM80",
            "action": "Book button (Button component)"
          },
          {
            "title": "Fitness & Conditioning",
            "icon": "Dumbbell",
            "duration": "45 min",
            "mode": "Online/Physical",
            "description": "Tennis-specific fitness training to improve agility, strength, and endurance",
            "price": "RM60"
          },
          {
            "title": "Strategy Session",
            "icon": "Brain",
            "duration": "30 min",
            "mode": "Online",
            "description": "Online session focusing on match strategy and mental game",
            "price": "RM40"
          }
        ]
      },
      "preferred_courts": {
        "title": "Preferred Courts",
        "badges": [
          "Base Pickle and Padel",
          "KLCC Tennis Center",
          "Bangsar Sports Complex",
          "Mont Kiara Country Club",
          "91 Pickle",
          "Pickle Park"
        ],
        "style": "Grid of rounded badges"
      },
      "certifications": {
        "title": "Certifications",
        "items": [
          "PTR Certified Professional",
          "Mental Performance Coach",
          "First Aid Certified"
        ],
        "style": "Bullet list with subtle dot markers"
      },
      "locations": {
        "title": "Locations",
        "badges": ["Central Singapore", "Online"],
        "style": "Badge group"
      },
      "reviews_summary": {
        "title": "Reviews",
        "rating": {
          "value": "4.9",
          "icon": "Star",
          "total_reviews": "127 reviews"
        },
        "breakdown": [
          { "stars": 5, "count": 3 },
          { "stars": 4, "count": 2 },
          { "stars": 3, "count": 0 },
          { "stars": 2, "count": 0 },
          { "stars": 1, "count": 0 }
        ],
        "visual": "Horizontal bars showing distribution"
      },
      "recent_reviews": {
        "title": "Recent Reviews",
        "reviews": [
          {
            "user": "Alex Johnson",
            "avatar": "AJ initials",
            "rating": 5,
            "date": "Jan 15, 2024",
            "text": "Sarah is an amazing tennis coach! She helped me improve my serve technique significantly in just a few sessions. Her approach is very encouraging and she explains everything clearly.",
            "tag": "Individual Tennis Lesson"
          },
          {
            "user": "Maria Rodriguez",
            "avatar": "MR initials",
            "rating": 5,
            "date": "Jan 12, 2024",
            "text": "Excellent coaching! Very professional and patient. The fitness training really helped improve my game.",
            "tag": "Fitness & Conditioning"
          },
          {
            "user": "John Smith",
            "avatar": "JS initials",
            "rating": 4,
            "date": "Jan 10, 2024",
            "text": "Great strategy session. Sarah provided valuable insights that helped me win my last tournament match.",
            "tag": "Strategy Session"
          },
          {
            "user": "Lisa Chen",
            "avatar": "LC initials",
            "rating": 5,
            "date": "Jan 8, 2024",
            "text": "Highly recommend Sarah’s coaching. Her technical knowledge and teaching style are excellent.",
            "tag": "Individual Tennis Lesson"
          },
          {
            "user": "David Wong",
            "avatar": "DW initials",
            "rating": 4,
            "date": "Jan 5, 2024",
            "text": "Good session overall. Learned a lot about mental preparation for matches.",
            "tag": "Strategy Session"
          }
        ]
      }
    },
    "typography": {
      "headers": { "size": "lg", "weight": "semibold", "color": "neutral-900" },
      "subheaders": { "size": "md", "weight": "medium", "color": "neutral-800" },
      "body": { "size": "sm", "weight": "regular", "color": "neutral-700" },
      "tags": { "size": "xs", "weight": "medium", "uppercase": false }
    },
    "colors": {
      "background": "#FFFFFF",
      "section_divider": "#E5E7EB",
      "text_primary": "#111827",
      "text_secondary": "#6B7280",
      "badge_bg": "#F9FAFB",
      "badge_border": "#D1D5DB",
      "price_text": "#111111"
    },
    "spacing_alignment": {
      "sections": "mt-8 space-y-6",
      "cards": "rounded-lg border p-4",
      "reviews": "stacked list with separators",
      "badges": "inline-flex gap-2 wrap"
    },
    "interaction_cues": {
      "back_button": "Hover underline + icon shift",
      "service_card": {
        "hover": "slight bg-gray-50 highlight",
        "click": "navigates to booking flow"
      },
      "review_item": "Non-interactive, static text"
    },
    "style_identity": {
      "overall": "Clean, professional, directory-style profile page",
      "design_system": "shadcn/ui + TailwindCSS",
      "tone": "Trustworthy, approachable, premium coaching platform"
    },
    "icon_map": {
      "header": { "back": "ArrowLeft" },
      "rating": "Star",
      "services": {
        "tennis": "Clock",
        "fitness": "Dumbbell",
        "strategy": "Brain"
      },
      "locations": { "map": "MapPin" }
    },
    "a11y": {
      "aria_labels": {
        "back_button": "Go back to previous page",
        "avatar": "Coach profile picture",
        "rating": "Average rating 4.9 out of 5 from 127 reviews"
      }
    }
  }
}

Mobile version
{
  "screenshot_9_mobile_variant": {
    "description": "Mobile-responsive interpretation of the coach profile screen. Sections reorganized into stacked cards with collapsible or scrollable patterns for constrained width.",
    "layout": {
      "structure": "Single-column scrollable layout",
      "flow": "Back navigation → Coach Overview → Services → Preferred Courts (horizontal scroll) → Certifications → Locations (horizontal scroll) → Reviews Summary → Collapsible Recent Reviews",
      "responsive_patterns": [
        "Use collapsible accordions for long sections like Certifications and Recent Reviews",
        "Convert Preferred Courts and Locations into horizontally scrollable badge rows",
        "Service items stack vertically with larger tap targets",
        "Rating distribution uses condensed stacked bars"
      ]
    },
    "components": {
      "header_nav": {
        "back_button": {
          "icon": "ArrowLeft",
          "label": "Back",
          "placement": "Sticky top-left",
          "touch_target": "44px",
          "a11y": "Accessible label 'Go back'"
        }
      },
      "coach_overview": {
        "avatar": {
          "size": "md",
          "placement": "Centered above name"
        },
        "name": "Sarah Chen",
        "rating_inline": {
          "star_icon": "Star",
          "text": "4.9 (127 reviews)",
          "placement": "Below name, inline with years experience"
        },
        "tags": {
          "layout": "Wrap into multiple rows if needed",
          "scroll": "Optional horizontal scroll for overflow"
        },
        "bio": {
          "size": "sm",
          "line_clamp": "Clamp to 3–4 lines with 'Read more' expander"
        }
      },
      "services": {
        "title": "Services",
        "items": [
          {
            "title": "Individual Tennis Lesson",
            "duration": "60 min",
            "price": "RM80",
            "layout": "Card with stacked content; action button spans full width"
          },
          {
            "title": "Fitness & Conditioning",
            "duration": "45 min",
            "price": "RM60",
            "layout": "Card"
          },
          {
            "title": "Strategy Session",
            "duration": "30 min",
            "price": "RM40",
            "layout": "Card"
          }
        ]
      },
      "preferred_courts": {
        "title": "Preferred Courts",
        "badges": [
          "Base Pickle and Padel",
          "KLCC Tennis Center",
          "Bangsar Sports Complex",
          "Mont Kiara Country Club",
          "91 Pickle",
          "Pickle Park"
        ],
        "layout": "Horizontal scroll row of rounded badges"
      },
      "certifications": {
        "title": "Certifications",
        "layout": "Accordion (expand/collapse list)",
        "items": [
          "PTR Certified Professional",
          "Mental Performance Coach",
          "First Aid Certified"
        ]
      },
      "locations": {
        "title": "Locations",
        "badges": ["Central Singapore", "Online"],
        "layout": "Horizontal scroll row of badges"
      },
      "reviews_summary": {
        "title": "Reviews",
        "rating_inline": {
          "value": "4.9",
          "star_icon": "Star",
          "total": "127 reviews"
        },
        "distribution": "Condensed stacked bars; percentage text shown inline"
      },
      "recent_reviews": {
        "title": "Recent Reviews",
        "layout": "Accordion (collapsible list)",
        "items": [
          {
            "user": "Alex Johnson",
            "rating": 5,
            "snippet": "Improved serve technique significantly...",
            "expandable": "Tap to view full text"
          },
          {
            "user": "Maria Rodriguez",
            "rating": 5,
            "snippet": "Very professional and patient...",
            "expandable": true
          },
          {
            "user": "John Smith",
            "rating": 4,
            "snippet": "Great strategy session...",
            "expandable": true
          }
        ]
      }
    },
    "typography": {
      "headers": { "size": "md", "weight": "semibold" },
      "body": { "size": "sm", "color": "neutral-700" },
      "price": { "size": "md", "weight": "medium", "color": "#111111" },
      "review_snippets": { "size": "sm", "line_clamp": "2 lines" }
    },
    "colors": {
      "background": "#FFFFFF",
      "card_bg": "#F9FAFB",
      "badge_bg": "#F3F4F6",
      "divider": "#E5E7EB"
    },
    "spacing_alignment": {
      "page_padding": "px-4",
      "section_gap": "mt-6",
      "card_padding": "p-4",
      "touch_targets": "min-height 44px"
    },
    "interaction_cues": {
      "accordions": "Chevron icons rotate when expanded",
      "horizontal_scroll": "Subtle gradient fade on edges indicates overflow",
      "tap_targets": "Services and buttons have full-width click/tap areas"
    },
    "style_identity": {
      "overall": "Mobile-first, thumb-friendly UI",
      "design_system": "shadcn/ui + TailwindCSS",
      "tone": "Professional, clean, but optimized for small screens"
    },
    "icon_map": {
      "header": { "back": "ArrowLeft" },
      "rating": "Star",
      "services": { "tennis": "Clock", "fitness": "Dumbbell", "strategy": "Brain" },
      "locations": "MapPin",
      "accordion_chevron": "ChevronDown"
    },
    "a11y": {
      "accordions": { "aria_role": "region", "aria_expanded": true },
      "badges_scroll": { "aria_label": "Preferred courts list" },
      "review_expand": { "aria_label": "Expand to read full review" }
    }
  }
}
