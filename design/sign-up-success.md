{
  "screenshot_8_variant_resend_active": {
    "description": "Create Account success screen AFTER countdown reaches 0. Resend is enabled; clicking triggers API, shows loading, success toast, and restarts timer.",
    "imports": {
      "shadcn": [
        "import { Button } from \"@/components/ui/button\"",
        "import { Card, CardHeader, CardContent, CardFooter } from \"@/components/ui/card\"",
        "import { Alert, AlertTitle, AlertDescription } from \"@/components/ui/alert\"",
        "import { Progress } from \"@/components/ui/progress\"",
        "import { Toast, ToastProvider, ToastTitle, ToastDescription, ToastViewport } from \"@/components/ui/toast\"",
        "import { Tooltip, TooltipTrigger, TooltipContent } from \"@/components/ui/tooltip\""
      ],
      "lucide": [
        "import { ArrowLeft, Mail, RefreshCcw, Loader2, CheckCircle2 } from \"lucide-react\""
      ]
    },
    "layout": {
      "structure": "Centered card on muted background with global toast in bottom-right (same as screenshot_8)",
      "sections": [
        "Header (Back)",
        "Confirmation Card (enabled resend)",
        "Toast Notification"
      ]
    },
    "components": {
      "header": {
        "back_link": {
          "icon": "ArrowLeft",
          "label": "Back",
          "placement": "Top-left",
          "type": "Text + Icon"
        }
      },
      "confirmation_card": {
        "type": "Card",
        "header": {
          "logo": "Base brand",
          "icon": { "icon": "Mail", "style": "circular dark background" },
          "title": "Check your email",
          "subtitle": "We sent a magic link to your address. It expires in 10 minutes."
        },
        "content": {
          "tip_alert": {
            "component": "Alert",
            "variant": "default",
            "title": "Tip:",
            "description": "If you don’t see the email, check spam or promotions."
          },
          "resend_block": {
            "button": {
              "label": "Resend link",
              "icon_default": "RefreshCcw",
              "icon_loading": "Loader2",
              "variant": "outline",
              "size": "default",
              "state": {
                "enabled": true,
                "loading": false,
                "disabled": false
              }
            },
            "progress": {
              "component": "Progress",
              "binding": "resendProgress (0–100, reset to 0 on click)",
              "visibility": "hidden until countdown restarts"
            }
          },
          "secondary_action": {
            "label": "Use different email",
            "variant": "link",
            "size": "sm"
          }
        },
        "footer": {
          "legal_text": "The link works for 10 minutes and can only be used once.",
          "style": "Muted, xs, center-aligned"
        }
      },
      "toast": {
        "success": {
          "component": "Toast",
          "icon": "CheckCircle2",
          "title": "Magic link sent",
          "description": "We’ve emailed you a fresh sign-in link.",
          "placement": "Bottom-right"
        }
      }
    },
    "interaction_cues": {
      "resend_enabled": {
        "button": {
          "hover": "bg-gray-50",
          "focus": "ring-2 ring-offset-2",
          "active": "scale-98"
        },
        "tooltip": "Send a new magic link now"
      },
      "resend_loading": {
        "button": {
          "content": "Loader2 icon spins (animate-spin) + 'Sending…'",
          "disabled": true
        }
      },
      "resend_after_click": {
        "behavior": [
          "Disable button",
          "Show loading state",
          "Call resend endpoint",
          "On success: show success toast, restart 30s countdown, swap to disabled timer variant (as in screenshot_8), reveal Progress and set to 0 then animate to 100 over 30s",
          "On error: show destructive toast with retry hint; keep button enabled"
        ]
      }
    },
    "state_management": {
      "bindings": {
        "resendEnabled": "boolean (true when secondsRemaining === 0)",
        "secondsRemaining": "number (0 when enabled; set to 30 after resend)",
        "isResending": "boolean for loading state",
        "resendProgress": "number 0–100 for Progress"
      },
      "transitions": {
        "onClickResend": [
          "set(isResending=true, resendEnabled=false)",
          "await api.auth.sendMagicLink(email)",
          "toast.success('Magic link sent')",
          "set(isResending=false, secondsRemaining=30)",
          "startCountdownTimer(30s) → updates secondsRemaining/resendProgress each second"
        ],
        "onCountdownFinish": [
          "set(resendEnabled=true, resendProgress=100)"
        ]
      }
    },
    "typography": {
      "button_label": { "size": "sm/md", "weight": "medium" },
      "toast": { "title": { "size": "sm", "weight": "semibold" }, "description": { "size": "xs" } }
    },
    "colors": {
      "button_outline_border": "#111111",
      "button_hover_bg": "#F3F4F6",
      "toast_success_bg": "#F0FDF4",
      "toast_success_icon": "#16A34A"
    },
    "icon_map": {
      "header": { "back": "ArrowLeft" },
      "resend": { "idle": "RefreshCcw", "loading": "Loader2" },
      "toast": { "success": "CheckCircle2" }
    },
    "a11y": {
      "resend_button": {
        "aria_label": "Resend magic sign-in link",
        "aria_busy_binding": "isResending"
      },
      "toast": { "role": "status", "aria_live": "polite" }
    },
    "style_identity": {
      "overall": "Consistent with screenshot_8; adds clear enabled/loading affordances",
      "design_system": "shadcn/ui + TailwindCSS"
    }
  }
}
