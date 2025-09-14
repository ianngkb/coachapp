{
  "screenshot_5": {
    "imports": {
      "shadcn": [
        "import { Button } from \"@/components/ui/button\"",
        "import { Card, CardHeader, CardContent, CardFooter } from \"@/components/ui/card\"",
        "import { Input } from \"@/components/ui/input\"",
        "import { Label } from \"@/components/ui/label\"",
        "import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from \"@/components/ui/form\"",
        "import { Alert, AlertTitle, AlertDescription } from \"@/components/ui/alert\"",
        "import { Separator } from \"@/components/ui/separator\""
      ],
      "lucide": [
        "import { ArrowLeft, Mail, CircleAlert } from \"lucide-react\""
      ]
    },
    "layout": {
      "structure": "Centered sign-in card on light gray background",
      "flow": "Header navigation (back) → Sign-in Card (icon, title, subtitle, form, error state, secondary CTA, footer legal text)",
      "sections": [
        "Header Back Link",
        "Sign-in Card"
      ]
    },
    "components": {
      "header": {
        "back_link": {
          "type": "Inline link with icon",
          "icon": "ArrowLeft",
          "label": "Back",
          "placement": "Top left corner"
        }
      },
      "sign_in_card": {
        "type": "Card",
        "style": "Rounded-lg, shadow, white background, centered",
        "header": {
          "icon": {
            "icon": "Mail",
            "size": "lg",
            "color": "gray-500",
            "container": "circular light-gray bg"
          },
          "title": "Sign In",
          "subtitle": "We'll send you a secure link to sign in. No password needed."
        },
        "form": {
          "fields": [
            {
              "name": "email",
              "label": "Email address",
              "placeholder": "your@email.com",
              "value_example": "asd@mail.com",
              "state": "error",
              "component": "Input",
              "shadcn_import": "Input",
              "lucide_icon": "Mail",
              "error": {
                "component": "Alert",
                "variant": "destructive",
                "icon": "CircleAlert",
                "title": "Account not found",
                "description": "No account exists with this email address."
              }
            }
          ],
          "primary_button": {
            "label": "Send magic link",
            "variant": "default",
            "disabled": true,
            "style": "Gray background with white text when active, disabled muted gray when inactive"
          },
          "secondary_cta": {
            "label": "Create new account",
            "variant": "outline",
            "size": "lg",
            "placement": "Below disabled button",
            "note": "Provides alternative path for new users"
          },
          "supporting_text": {
            "text": "Don't have an account yet?",
            "style": "Muted small text above secondary CTA"
          }
        },
        "footer": {
          "legal_text": "By continuing, you agree to our Terms of Service and Privacy Policy. We use passwordless authentication for your security.",
          "links": ["Terms of Service", "Privacy Policy"],
          "style": "Muted, small, center-aligned text"
        }
      }
    },
    "typography": {
      "titles": {
        "main": { "size": "lg", "weight": "semibold", "color": "neutral-900" },
        "subtitle": { "size": "sm", "weight": "regular", "color": "neutral-600" }
      },
      "labels": {
        "size": "sm",
        "weight": "medium",
        "color": "neutral-800"
      },
      "error": {
        "title": { "size": "sm", "weight": "medium", "color": "red-600" },
        "description": { "size": "xs", "weight": "regular", "color": "red-600" }
      },
      "footer_text": {
        "size": "xs",
        "color": "neutral-500"
      }
    },
    "colors": {
      "background": "#F9FAFB",
      "card_bg": "#FFFFFF",
      "text_primary": "#111827",
      "text_secondary": "#6B7280",
      "input_border_error": "#EF4444",
      "alert_bg": "#FEE2E2",
      "alert_icon": "#DC2626",
      "button_disabled_bg": "#E5E7EB",
      "button_active_bg": "#111111",
      "button_outline_border": "#111111"
    },
    "spacing_alignment": {
      "card_padding": "p-6 md:p-8",
      "form_spacing": "space-y-4",
      "error_margin": "mt-2 mb-4",
      "cta_spacing": "mt-6 space-y-3",
      "footer_margin": "mt-6"
    },
    "interaction_cues": {
      "input": {
        "error_state": "Red border, inline Alert with icon + message",
        "focus": "Focus ring",
        "hover": "Border highlight"
      },
      "button_primary": {
        "disabled": "Gray background, cursor not-allowed",
        "active": "Black background, hover darkens"
      },
      "button_secondary": {
        "hover": "Border darkens, background subtle hover",
        "active": "Pressed style"
      }
    },
    "style_identity": {
      "overall": "Modern, professional, trustworthy",
      "design_system": "shadcn/ui + TailwindCSS",
      "tone": "Secure and user-friendly"
    },
    "icon_map": {
      "header": { "back": "ArrowLeft" },
      "sign_in_header": { "mail": "Mail" },
      "form": { "email_field": "Mail" },
      "error_alert": { "icon": "CircleAlert" },
      "buttons": { "primary": null, "secondary": null }
    },
    "a11y": {
      "error": {
        "aria_role": "alert",
        "aria_live": "assertive",
        "aria_description": "Account not found error message appears below email input"
      },
      "form": {
        "aria_labels": { "email": "Email address input field" },
        "button": { "aria_label": "Send magic link to email" }
      }
    }
  }
}
