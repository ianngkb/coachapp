{
  "screenshot_7": {
    "description": "Post-submit success state for the Create Account / Sign In flow (passwordless). Displays confirmation, the email used, instructions, and secondary actions.",
    "imports": {
      "shadcn": [
        "import { Button } from \"@/components/ui/button\"",
        "import { Card, CardHeader, CardContent, CardFooter } from \"@/components/ui/card\"",
        "import { Separator } from \"@/components/ui/separator\"",
        "import { Alert, AlertTitle, AlertDescription } from \"@/components/ui/alert\"",
        "import { Progress } from \"@/components/ui/progress\"",
        "import { Tooltip, TooltipTrigger, TooltipContent } from \"@/components/ui/tooltip\""
      ],
      "lucide": [
        "import { ArrowLeft, CheckCircle2, MailCheck, Mail, Timer, RotateCcw, Copy, Edit3, ExternalLink } from \"lucide-react\""
      ]
    },
    "layout": {
      "structure": "Centered confirmation card on muted gray background",
      "flow": "Back link → Confirmation Card (success icon, title, subtitle with user email, next steps) → Primary/secondary actions → Tips/Alert → Footer links",
      "sections": [
        "Header (Back link)",
        "Confirmation Card"
      ]
    },
    "components": {
      "header": {
        "back_link": {
          "icon": "ArrowLeft",
          "label": "Back",
          "placement": "Top-left",
          "type": "Text + Icon",
          "style": "Subtle link"
        }
      },
      "confirmation_card": {
        "type": "Card",
        "elevation": "shadow-md",
        "radius": "rounded-xl",
        "header": {
          "icon": {
            "icon": "MailCheck",
            "accent_icon": "CheckCircle2",
            "style": "Green accent within a soft circular background",
            "size": "lg"
          },
          "title": "Check your email",
          "subtitle": "We sent a secure magic link to complete your sign-in."
        },
        "content": {
          "email_row": {
            "label": "Sent to",
            "value_binding": "userEmail",
            "value_example": "alex@example.com",
            "actions": [
              { "type": "Button", "variant": "ghost", "size": "sm", "icon": "Copy", "label": "Copy" },
              { "type": "Button", "variant": "ghost", "size": "sm", "icon": "Edit3", "label": "Change email" }
            ]
          },
          "next_steps_list": [
            "Open your email app and find the message from us.",
            "Tap the link on the device where you want to stay signed in.",
            "If you don’t see it, check spam or promotions."
          ],
          "resend_block": {
            "timer": {
              "icon": "Timer",
              "label": "You can resend in",
              "countdown_binding": "resendSeconds",
              "example": 48,
              "progress_binding": "resendProgress (0–100)",
              "shadcn": "Progress"
            },
            "button": {
              "label": "Resend link",
              "icon": "RotateCcw",
              "variant": "outline",
              "state": { "disabled_until_timer_zero": true }
            }
          },
          "open_email_cta": {
            "label": "Open email app",
            "icon": "ExternalLink",
            "variant": "default",
            "size": "lg",
            "note": "Optional deep links for popular providers (mailto:, gmail://, message:// on iOS)"
          },
          "tips_alert": {
            "component": "Alert",
            "variant": "default",
            "icon": "Mail",
            "title": "Didn’t get the email?",
            "description": "Confirm you entered the correct address, check spam, or try resending after the timer ends."
          }
        },
        "footer": {
          "links": [
            { "label": "Terms of Service", "href": "/legal/terms" },
            { "label": "Privacy Policy", "href": "/legal/privacy" }
          ],
          "style": "Muted, xs, center-aligned"
        }
      }
    },
    "typography": {
      "title": { "size": "xl", "weight": "semibold", "color": "neutral-900" },
      "subtitle": { "size": "sm", "color": "neutral-600" },
      "labels": { "size": "sm", "weight": "medium", "color": "neutral-800" },
      "list_items": { "size": "sm", "color": "neutral-700" },
      "tips_title": { "size": "sm", "weight": "medium" },
      "footer": { "size": "xs", "color": "neutral-500" }
    },
    "colors": {
      "background": "#F9FAFB",
      "card_bg": "#FFFFFF",
      "success_accent": "#16A34A",
      "text_primary": "#111827",
      "text_secondary": "#6B7280",
      "button_primary_bg": "#111111",
      "button_primary_fg": "#FFFFFF",
      "button_outline_border": "#111111",
      "progress_track": "#E5E7EB",
      "progress_indicator": "#111111"
    },
    "spacing_alignment": {
      "card_padding": "p-6 md:p-8",
      "stack_gaps": "space-y-4",
      "actions_gap": "mt-4 flex items-center gap-2",
      "resend_gap": "mt-4 space-y-2",
      "footer_margin": "mt-6"
    },
    "interaction_cues": {
      "copy_email": { "tooltip": "Copied!", "icon": "Copy" },
      "change_email": { "navigates_to": "Create Account / Sign In email entry", "icon": "Edit3" },
      "resend": { "disabled_until_timer_zero": true, "loading_state": "spinner on button", "icon": "RotateCcw" },
      "open_email": { "hover": "slight darken", "icon": "ExternalLink" }
    },
    "state_management": {
      "bindings": {
        "userEmail": "string (email used in previous step)",
        "resendSeconds": "number (counts down from e.g., 60 to 0)",
        "resendProgress": "number 0–100 for Progress component"
      },
      "transitions": {
        "onResend": "Reset timer to 60, call backend to send new magic link, show toast confirmation",
        "onChangeEmail": "Route to email entry with current email prefilled"
      }
    },
    "icon_map": {
      "header": { "back": "ArrowLeft" },
      "success": { "mail_check": "MailCheck", "confirmed": "CheckCircle2" },
      "email_row": { "copy": "Copy", "edit": "Edit3" },
      "resend": { "timer": "Timer", "button": "RotateCcw" },
      "tips": { "mail": "Mail" },
      "open_email": { "external": "ExternalLink" }
    },
    "a11y": {
      "roles": {
        "success_region": { "role": "status", "aria_live": "polite" },
        "resend_timer": { "role": "progressbar", "aria_valuemin": 0, "aria_valuemax": 60, "aria_valuenow_binding": "resendSeconds" }
      },
      "labels": {
        "open_email": "Open your email application",
        "resend": "Resend magic link",
        "copy_email": "Copy email address",
        "change_email": "Change the email address"
      }
    },
    "style_identity": {
      "overall": "Friendly, reassuring, trustworthy",
      "design_system": "shadcn/ui + TailwindCSS",
      "tone": "Clear confirmation with actionable follow-ups"
    }
  }
}
