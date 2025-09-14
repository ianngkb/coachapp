This is the UI breakdown of what the Homepage will look like.

{
"responsive\_spec": {
"meta": {
"page": "Coaches Home (Directory)",
"purpose": "List all available coaches with search and quick filters; allow users to view a coach profile.",
"routes": \["/", "/coaches"],
"states": \["default", "loading", "empty\_results", "error"]
},
"breakpoints": {
"mobile": {
"range": "0–767px",
"container\_width": "100% - 24px padding (12px left/right)"
},
"tablet": {
"range": "768–1023px",
"container\_width": "min(920px, 100% - 48px padding)"
},
"desktop": {
"range": ">=1024px",
"container\_width": "min(1120px, 100% - 64px padding)"
}
},
"layout": {
"type": "single\_column, card-based list",
"flow": "top\_to\_bottom",
"sections\_order": \[
"header",
"global\_search\_bar",
"demo\_mode\_banner",
"list\_header",
"coach\_card\_list"
],
"header": {
"height": "56px mobile, 64px desktop",
"content": \[
{"left": "brand\_logo (text: "base")"},
{"center": "none"},
{"right": \["profile\_icon", "filter\_icon (inside search on mobile; to the right on desktop)"]}
],
"alignment": "logo left, actions right",
"behavior": "sticky on scroll (optional)"
},
"global\_search\_bar": {
"placement": "below header, full-width inside container",
"shape": "pill/rounded-24",
"leading\_icon": "magnifier",
"trailing\_icon": "funnel",
"placeholder": "Search coaches or sport",
"desktop\_width": "fills container",
"mobile\_width": "fills container"
},
"demo\_mode\_banner": {
"placement": "below search",
"background": "soft yellow",
"content": \[""Demo Mode:" label", "button: Login as Student", "button: Login as Coach"],
"alignment\_mobile": "centered stack with inline buttons",
"alignment\_desktop": "inline row; text left, buttons right"
},
"list\_header": {
"title": "Available Coaches",
"subtitle": "4 coaches available",
"actions": \["refresh\_icon (circular arrow)"],
"alignment": "title left, action right"
},
"coach\_card\_list": {
"item\_spacing": "16px mobile, 24px desktop",
"max\_items\_per\_view": "list (1 per row on all breakpoints)",
"pagination": "scroll (infinite optional)"
}
},
"components": {
"logo": {
"type": "wordmark",
"text": "base",
"color": "{brand.red}",
"case": "lowercase",
"area": "header.left"
},
"icon": {
"style": "minimal, outline/filled mix",
"sizes": {"sm": "16px", "md": "20px", "lg": "24px"},
"set": \["star", "clock", "pin", "magnifier", "funnel", "refresh", "user/profile"]
},
"buttons": \[
{
"id": "primary\_cta",
"label": "View Profile",
"style": "filled",
"bg": "{neutral.black}",
"text\_color": "{neutral.white}",
"radius": "999px (pill)",
"padding": "8px 16px",
"placement": "card.footer.right",
"states": {
"default": {"bg": "{neutral.black}", "text": "{neutral.white}"},
"hover\_desktop": {"bg": "{neutral.black\_90}"},
"pressed": {"bg": "{neutral.black\_80}"},
"disabled": {"bg": "{neutral.black\_20}", "text": "{neutral.white\_60}"}
}
},
{
"id": "banner\_student",
"label": "Login as Student",
"style": "filled",
"bg": "{accent.yellow\_fill}",
"text\_color": "{neutral.black}",
"radius": "12px",
"padding": "8px 12px"
},
{
"id": "banner\_coach",
"label": "Login as Coach",
"style": "ghost",
"border": "1px solid {neutral.gray\_200}",
"text\_color": "{neutral.black}",
"radius": "12px",
"padding": "8px 12px"
}
],
"chips": {
"kinds": \[
{
"id": "skill\_chip",
"examples": \["Tennis", "Fitness", "Basketball", "Swimming", "Triathlon", "Golf", "Mental Coaching"],
"bg": "{neutral.gray\_100}",
"text": "{neutral.black}",
"radius": "999px",
"padding": "4px 10px",
"gap": "8px between chips",
"row\_wrap": true
},
{
"id": "facility\_chip",
"examples": \["Base Pickle and Padel", "KLCC Tennis Center", "Bangsar Sports Complex", "Olympic Sports Complex", "PJ Badminton Hall", "Fitness First", "Sunway Sports Complex", "Tropicana Golf & Country Resort", "Gleneagles Club", "The Mines Resort & Golf Club", "+1 more"],
"bg": "{neutral.gray\_050}",
"text": "{neutral.gray\_700}",
"border": "1px solid {neutral.gray\_200}",
"radius": "999px",
"padding": "4px 10px",
"row\_wrap": true
}
]
},
"rating\_inline": {
"format": "★ 4.9 (127)",
"icon": "star filled",
"icon\_color": "{accent.star}",
"text\_color": "{neutral.gray\_900}",
"size": "14px",
"placement": "next to name"
},
"availability\_row": {
"icon": "clock",
"label\_prefix": "Available:",
"value\_examples": \["Today 3–5pm", "Tomorrow 9am", "Today 6–8pm", "Wed 2–4pm"],
"size": "14px",
"color": "{neutral.gray\_800}"
},
"location\_row": {
"icon": "pin",
"values": \["Central Singapore", "East Singapore", "West Singapore", "Online"],
"size": "14px",
"color": "{neutral.gray\_800}"
},
"coach\_card": {
"container": {
"bg": "{neutral.white}",
"border": "1px solid {neutral.gray\_200}",
"radius": "16px",
"padding": "16px mobile, 20px desktop",
"shadow": "none or very subtle"
},
"structure\_order": \[
"header\_row",
"skills\_chip\_row",
"facility\_chip\_row",
"bio\_paragraph",
"availability\_row",
"location\_row",
"footer\_row"
],
"header\_row": {
"left": {
"avatar": {
"shape": "circle",
"size": "48px mobile, 56px desktop",
"border": "none"
}
},
"center": {
"name": "e.g., Sarah Chen",
"rating\_inline": true
},
"right": {
"cta": "View Profile"
}
},
"bio\_paragraph": {
"text\_examples": \[
"Professional tennis coach with 8+ years experience. Former national player specializing in technique and mental game.",
"Former professional basketball player turned coach. Focus on fundamentals and athletic development.",
"Olympic-level swimming coach with expertise in stroke technique and competitive training programs.",
"PGA-certified golf instructor focusing on short game and course management for all skill levels."
],
"max\_lines": 3
},
"footer\_row": {
"alignment": "cta right; stretches only to intrinsic width",
"spacing\_top": "12px"
}
}
},
"typography": {
"family": "system or modern sans-serif",
"scale": \[
{"token": "display", "size": "28px desktop / 22px mobile", "weight": "700"},
{"token": "h1", "size": "22px desktop / 18px mobile", "weight": "700"},
{"token": "h2", "size": "18px", "weight": "600"},
{"token": "body", "size": "16px desktop / 15px mobile", "weight": "400"},
{"token": "body-sm", "size": "14px", "weight": "400"},
{"token": "chip", "size": "13px", "weight": "500"},
{"token": "button", "size": "14px", "weight": "600"}
],
"usage": {
"header.logo": "display",
"list\_header.title": "h1",
"list\_header.subtitle": "body-sm, color {neutral.gray\_600}",
"coach\_name": "h2",
"rating": "body-sm",
"bio": "body-sm",
"meta\_rows": "body-sm"
},
"alignment": "left-aligned body; buttons and counts right-aligned where applicable",
"line\_height": "1.4–1.6"
},
"colors": {
"tokens": {
"brand.red": "#E53935",
"accent.yellow\_fill": "#FFF6CC",
"accent.star": "#F5B301",
"neutral.white": "#FFFFFF",
"neutral.black": "#000000",
"neutral.black\_90": "rgba(0,0,0,0.9)",
"neutral.black\_80": "rgba(0,0,0,0.8)",
"neutral.black\_20": "rgba(0,0,0,0.2)",
"neutral.gray\_050": "#F7F7F8",
"neutral.gray\_100": "#F1F2F4",
"neutral.gray\_200": "#E4E6EB",
"neutral.gray\_400": "#C7CBD1",
"neutral.gray\_600": "#7A8896",
"neutral.gray\_700": "#5A6470",
"neutral.gray\_800": "#3A424A",
"neutral.gray\_900": "#1F2328"
},
"application": {
"background.page": "{neutral.white}",
"banner.bg": "{accent.yellow\_fill}",
"card.border": "{neutral.gray\_200}",
"chip.skill.bg": "{neutral.gray\_100}",
"chip.facility.bg": "{neutral.gray\_050}",
"cta.primary.bg": "{neutral.black}",
"icons.default": "{neutral.gray\_700}",
"text.primary": "{neutral.gray\_900}",
"text.muted": "{neutral.gray\_700}"
}
},
"spacing\_alignment": {
"scale": {"xs": "4px", "sm": "8px", "md": "12px", "lg": "16px", "xl": "24px", "2xl": "32px"},
"page\_padding": "12px mobile, 24px tablet, 32px desktop",
"card\_padding": "lg (mobile) / xl (desktop)",
"chip\_gap": "sm",
"section\_gaps": {
"between\_header\_and\_search": "md",
"between\_search\_and\_banner": "md",
"between\_banner\_and\_list\_header": "lg",
"between\_cards": "lg mobile / xl desktop"
},
"alignment": "left-aligned content with consistent container widths; CTA buttons right-aligned within cards"
},
"images\_media": {
"avatars": {
"shape": "circular",
"sizes": {"mobile": "48px", "desktop": "56px"},
"placement": "card.header.left"
},
"icons": {
"style": "outline/filled minimalist",
"usage": \[
{"name": "star", "context": "rating"},
{"name": "clock", "context": "availability"},
{"name": "pin", "context": "location"},
{"name": "magnifier", "context": "search"},
{"name": "funnel", "context": "filters"},
{"name": "refresh", "context": "list refresh"},
{"name": "profile", "context": "account"}
]
}
},
"interaction\_cues": {
"hover\_desktop": \["button darkens", "chips raise cursor pointer (optional)"],
"focus": "visible focus ring 2px {brand.red} or {neutral.gray\_400}",
"active": "button pressed state reduces brightness",
"disabled": "lower opacity for controls",
"loading": "skeleton rows for cards; spinning refresh icon",
"empty\_results": {
"icon": "magnifier with slash",
"title": "No coaches found",
"body": "Try a different search or filters.",
"cta": "Clear search"
}
},
"special\_styling\_notes": {
"style\_identity": "clean, modern, minimalist; subtle rounded corners; airy whitespace",
"radii": {"chip": "999px", "card": "16px", "banner\_buttons": "12px", "search": "999px"},
"shadows": {"default": "none/light", "elevation\_on\_hover": "optional soft shadow for cards"},
"motion": {"button\_press": "100–150ms scale/opacity", "chip\_hover": "color fade 120ms"},
"a11y": {
"min\_touch\_target": "44x44px",
"contrast": "buttons >= 4.5:1, text on yellow banner meets AA",
"labels": "icons accompanied by text or aria-labels"
}
},
"responsive\_rules": {
"mobile": {
"cards": "stacked; CTA right-aligned in header row; chips wrap to multiple lines",
"banner": "centered content; buttons inline; text size body-sm"
},
"desktop": {
"cards": "wider content column; increased padding and whitespace; CTA stays right; text lines extend but clamp at 70ch",
"banner": "text left; buttons right; single line if space permits"
}
},
"content\_examples": {
"coaches": \[
{
"name": "Sarah Chen",
"rating": "★ 4.9 (127)",
"skills": \["Tennis", "Fitness"],
"facilities": \["Base Pickle and Padel", "KLCC Tennis Center", "Bangsar Sports Complex", "+1 more"],
"bio": "Professional tennis coach with 8+ years experience. Former national player specializing in technique and mental game.",
"availability": "Today 3–5pm",
"location": "Central Singapore",
"cta": "View Profile"
},
{
"name": "Marcus Johnson",
"rating": "★ 4.8 (93)",
"skills": \["Basketball", "Fitness"],
"facilities": \["KL Sports Center", "Olympic Sports Complex", "Sunway Sports Complex"],
"bio": "Former professional basketball player turned coach. Focus on fundamentals and athletic development.",
"availability": "Tomorrow 9am",
"location": "East Singapore",
"cta": "View Profile"
},
{
"name": "Lisa Wang",
"rating": "★ 4.9 (156)",
"skills": \["Swimming", "Triathlon"],
"facilities": \["Olympic Sports Complex", "PJ Badminton Hall", "Fitness First"],
"bio": "Olympic-level swimming coach with expertise in stroke technique and competitive training programs.",
"availability": "Today 6–8pm",
"location": "West Singapore",
"cta": "View Profile"
},
{
"name": "David Kim",
"rating": "★ 4.7 (84)",
"skills": \["Golf", "Mental Coaching"],
"facilities": \["Tropicana Golf & Country Resort", "Gleneagles Club", "The Mines Resort & Golf Club"],
"bio": "PGA-certified golf instructor focusing on short game and course management for all skill levels.",
"availability": "Wed 2–4pm",
"location": "Online",
"cta": "View Profile"
}
]
}
}
}
