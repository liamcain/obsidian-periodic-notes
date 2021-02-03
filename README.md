# Weekly Notes

The Weekly Notes plugin mirrors the functionality of the Daily Notes plugin with one noteable difference: it's weekly!

## Features

### Commands

#### Open Weekly Note

Opens the weekly note for the current week. If one doesn't exist, it will create one automatically for you.

#### Next Weekly Note

Navigates to the next weekly note chronologically. Skips over weeks with no weekly note file.

> **Note:** This command is only available if the active focused note is a weekly note.

#### Previous Weekly Note

Navigates to the previous weekly note chronologically. Skips over weeks with no weekly note file.

> **Note:** This command is only available if the active focused note is a weekly note.

### Calendar Plugin Integration

If you have "Week numbers" enabled from the Calendar plugin, the calendar will automatically use your weekly note settings to create a seamless experience.

#### Weekly Notes are moving

If you currently use the Calendar plugin, you might be thinking "doesn't the Calendar plugin already do this?" To which the answer is: **yes**. This plugin provides the same functionality as the Calendar plugin's weekly notes. However, [weekly notes are moving](https://github.com/liamcain/obsidian-calendar-plugin#weekly-notes-have-a-new-home).

#### Migrating

If you currently use weekly notes with the Calendar plugin, your settings will automatically be migrated over and the calendar plugin still function the same way it did before.

You can create a Daily Note either by clicking on the calendar icon in the left panel, or with the Command palette. You can also set a hotkey in Keyboard shortcuts.

## Settings

| Setting  | Description                                                                                                                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Folder   | The folder that your weekly notes go into. It can be the same or different from your daily notes. By default they are placed in your vault root.                                                     |
| Template | Configure a template for weekly notes. Weekly notes have slightly different template tags than daily notes. See here for the list of supported [weekly note template tags](#template-tags).          |
| Format   | The date format for the weekly note filename. Defaults to `gggg-[W]ww`. If you use `DD` in the week format, this will refer to first day of the week (Sunday or Monday, depending on your settings). |

### Template Tags

| Tag                                                                                    | Description                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                                                                                | Works the same as the daily note `{{title}}`. It will insert the title of the note                                                                                                                           |
| `date`, `time`                                                                         | Works the same as the daily note `{{date}}` and `{{time}}`. It will insert the date and time of the first day of the week. Useful for creating a heading (e.g. `# {{date:gggg [Week] ww}}`).                 |
| `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` | Because weekly tags refer to main days, you can refer to individual days like this `{{sunday:gggg-MM-DD}}` to automatically insert the date for that particular day. Note, you must specify the date format! |

---

## Say Thanks 🙏

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/liamcain)

Like my work and want to see more like it? You can sponsor me.

[![GitHub Sponsors](https://img.shields.io/github/sponsors/liamcain?style=social)](https://github.com/sponsors/liamcain)
