# Periodic Notes ⌚

The Periodic Notes plugin expands on the idea of daily notes and introduces weekly and monthly notes.

## Weekly Notes

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

If you currently use the Calendar plugin, you might be thinking "doesn't the Calendar plugin already do this?" To which the answer is: **yes**. This plugin provides the same functionality as the Calendar plugin's weekly notes. However, [weekly notes are moving away from the Calendar plugin to this one](https://github.com/liamcain/obsidian-calendar-plugin#weekly-notes-have-a-new-home).

#### Migrating

If you currently use weekly notes with the Calendar plugin, your settings will automatically be migrated over and the calendar plugin still function the same way it did before.

You can create a Daily Note either by clicking on the calendar icon in the left panel, or with the Command palette. You can also set a hotkey in Keyboard shortcuts.

### Weekly Settings

| Setting  | Description                                                                                                                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Folder   | The folder that your weekly notes go into. It can be the same or different from your daily notes. By default they are placed in your vault root.                                                     |
| Template | Configure a template for weekly notes. Weekly notes have slightly different template tags than daily notes. See here for the list of supported [weekly note template tags](#weekly-template-tags).          |
| Format   | The date format for the weekly note filename. Defaults to `gggg-[W]ww`. If you use `DD` in the week format, this will refer to first day of the week (Sunday or Monday, depending on your settings). |

### Weekly Template Tags

| Tag                                                                                    | Description                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                                                                                | Works the same as the daily note `{{title}}`. It will insert the title of the note                                                                                                                           |
| `date`, `time`                                                                         | Works the same as the daily note `{{date}}` and `{{time}}`. It will insert the date and time of the first day of the week. Useful for creating a heading (e.g. `# {{date:gggg [Week] ww}}`).                 |
| `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` | Because weekly tags refer to main days, you can refer to individual days like this `{{sunday:YYYY-MM-DD}}` to automatically insert the date for that particular day. Note, you must specify the date format! |

## Monthly Notes

### Commands

#### Open Monthly Note

Opens the monthly note for the current week. If one doesn't exist, it will create one automatically for you.

#### Next Monthly Note

Navigates to the next monthly note chronologically. Skips over weeks with no monthly note file.

> **Note:** This command is only available if the active focused note is a monthly note.

#### Previous Monthly Note

Navigates to the previous monthly note chronologically. Skips over weeks with no monthly note file.

> **Note:** This command is only available if the active focused note is a monthly note.

### Calendar Plugin Integration

Coming soon! I just have to figure out a good place to show it in the UI.

### Monthly Settings

| Setting  | Description                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Folder   | The folder that your monthly notes go into. It can be the same or different from your daily notes. By default they are placed in your vault root.                                                  |
| Template | Configure a template for monthly notes. Monthly notes have slightly different template tags than daily notes. See here for the list of supported [monthly note template tags](#monthly-template-tags).     |
| Format   | The date format for the monthly note filename. Defaults to `YYYY-MM`. If you use `DD` in the week format, this will refer to first day of the week (Sunday or Monday, depending on your settings). |

### Monthly Template Tags

| Tag            | Description                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | Works the same as the daily note `{{title}}`. It will insert the title of the note                                                                                                     |
| `date`, `time` | Works the same as the daily note `{{date}}` and `{{time}}`. It will insert the date and time of the first day of the week. Useful for creating a heading (e.g. `# {{date:MMM YYYY}}`). |

---

## FAQ

### How do I use a variable in the folder path?

If you want new daily notes to show up in the folder `Journal/2021/` for example, you can include the folder in the "Format" field. For example:
<img width="500" alt="image" src="https://user-images.githubusercontent.com/693981/111852801-c1cd8e00-88ee-11eb-9542-b7d840239037.png">

### Why the weekly note title is wrong with the week number?

Depending on your locale and operating system you are using, you may have been adopting either ISO week (first week of the year is started on the first Thursday) or Week of Year (first week of the year is started on the first day). Obsidian Periodic Notes uses Week of Year by default (ww), but you can change to ISO week by using (WW) instead. For more details, please refer to [MomentJS documentation](https://momentjs.com/docs/#/displaying/format/).

---

## Sponsors 🙏

A big thank you to everyone that has sponsored this project.

- [Carlo Zottman](https://github.com/czottmann), creator of [Actions for Obsidian](https://actions.work/actions-for-obsidian)
- [Brian Grohe](https://github.com/paxnovem)
- [Ben Hong](https://github.com/bencodezen)

