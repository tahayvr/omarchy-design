/* The desktop's parts, one page each. `sections` are the [sections] of
   Omarchy's shell.toml.tpl the part is painted from; `usage` is guidance
   for anyone theming or extending it (draft). */

export type Component = {
  id: string;
  title: string;
  sections: string[];
  blurb: string;
  usage: string[];
};

export const COMPONENTS: Component[] = [
  {
    id: "bar",
    title: "Bar",
    sections: ["bar"],
    blurb: "The strip along the screen edge: workspaces, the clock, and status.",
    usage: [
      "The bar is the theme's `background` and `foreground`, nothing else. It should disappear until something needs you.",
      "`red` is reserved for modules asking for attention — recording, an alert, updates. Anything red must be worth interrupting for.",
      "Size follows the font: at a base size of 12 the bar is 26px tall, and grows with it.",
    ],
  },
  {
    id: "launcher",
    title: "Launcher",
    sections: ["launcher"],
    blurb: "The overlay that finds apps, commands and files as you type.",
    usage: [
      "The selected row is marked three ways at once — a faint fill, an accent label and a border — so it reads in any theme, light or dark.",
      "The card sits slightly translucent over a dimmed screen, so you never lose where you were.",
      "Everything is reachable from the keyboard: type to filter, arrows to move, Enter to go.",
    ],
  },
  {
    id: "menus",
    title: "Menus",
    sections: ["menu"],
    blurb: "Omarchy's own menus, and the clipboard and emoji pickers built on them.",
    usage: [
      "Menus share the launcher's six tokens, so a theme that gets one right gets both.",
      "One level at a time. A row either acts or opens the next menu, never both.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    sections: ["notifications"],
    blurb: "Messages in the corner, framed by the active window border.",
    usage: [
      "The border matches the active window, so a notification reads as part of the desktop, not an ad.",
      "The countdown is the `accent`: a thin line that shows how long the message stays.",
      "Lead with what happened, then what to do. See [voice and tone](../../brand/voice/).",
    ],
  },
  {
    id: "popups",
    title: "Popups and tooltips",
    sections: ["popups", "tooltip"],
    blurb: "Flyouts from the bar, the on-screen display, and hover tooltips.",
    usage: [
      "Popups take the active border; tooltips take its foreground form, so they sit one step quieter.",
      "A tooltip names what something does. It never holds the only copy of important information.",
    ],
  },
  {
    id: "lock-screen",
    title: "Lock screen",
    sections: ["lock"],
    blurb: "The password field over the wallpaper.",
    usage: [
      "The field's border moves through idle, typing and wrong password. Wrong is always `red`.",
      "The card is 80% opaque, so the wallpaper shows through but never fights the text.",
      "The placeholder is `foreground` mixed a third of the way to `background` — present, not loud.",
    ],
  },
  {
    id: "password-prompt",
    title: "Password prompt",
    sections: ["polkit"],
    blurb: "The dialog that asks for your password when an app needs permission.",
    usage: [
      "It looks like the lock screen on purpose: the same field, the same states, the same red for wrong.",
      "The lock glyph is the `accent`, so it's clear this is Omarchy asking, not the app.",
    ],
  },
  {
    id: "controls",
    title: "Controls",
    sections: ["controls"],
    blurb: "Buttons, dropdowns and tabs, in every state they can be in.",
    usage: [
      "Every state is `foreground` at a different strength — 4% idle, 8% hover and focus, 18% selected, 22% pressed. That's what lets controls work in any theme.",
      "Hover, the keyboard cursor and focus look the same by default, so the mouse and the keyboard are equals.",
    ],
  },
  {
    id: "window-borders",
    title: "Window borders",
    sections: ["hyprland"],
    blurb: "The one line that tells you which window has focus.",
    usage: [
      "The active border is the theme's `hyprland_active_border`, which may be a gradient, or its `accent`.",
      "Popups, notifications and the lock screen reuse it, so focus always looks the same.",
      "Inactive windows get a neutral grey unless the theme sets `hyprland_inactive_border`.",
    ],
  },
  {
    id: "image-picker",
    title: "Image picker",
    sections: ["image-picker"],
    blurb: "The carousel for wallpapers and themes.",
    usage: [
      "No card: the images float over a dimmed screen, and the chosen one is framed in the `accent`.",
      "Slices that aren't chosen keep a faint `foreground` edge so they don't melt into the scrim.",
    ],
  },
];
