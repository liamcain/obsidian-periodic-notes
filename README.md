# Periodic Notes

Create and manage all of your time-based notes within Obsidian.

This plugin allows you to:

- Create notes for any periodic of time (daily, weekly, monthly, etc)
- Jump to any time-based notes using natural language (requires [NL Dates plugin](https://github.com/argenos/nldates-obsidian))
- Easily orient yourself in a sea of `202204101611 Zettelkasten Prefixed notes`

## Features

### 📆 Calendar sets

A **calendar set** describes a collection of periodic notes. Now you no longer need to have a single daily note; instead, you can have one for each pillar of your life. Have a clean break between personal and work. Track a project. Track client work. Organize your school work. Calendar sets offer _flexibility_ for you to live more strict.

### ⚡️ Date switcher

Two of the biggest pain points in workflows involving Periodic notes and Zettelkasten-ish notes are **note recall** and **navigation**. The date switcher attempts to solve both of these issues. Use natural language to quickly find periodic notes and other date-related notes.

Looking for a meeting note from last week? Just search: `last week ⇥ meeting`.

### ⌚️ Timeline complication

The date switcher will have you zipping around from note to note so fast you might start getting a bit lost. But don't fret! There is now a timeline "complication" on the top-right of your periodic notes that shows you in natural language exactly where you are.

## Usage

### Setting up your first calendar set

In the Periodic Notes settings, you will start with a "Default" calendar set. Click on it to open the Calendar set details view.

From here, you can choose which **note types** you want to enable. To get started, you might want to enable: **Daily**, **Weekly**, **Monthly**, and **Yearly**.

Each note type has the same configuration options:

- **Format:** The
- **Base Folder:** The folder that will hold all the periodic notes for this calendar set. For personal daily notes, you might choose to select a `Journal/` folder, for example.
- **Template location:**: The path to your note template. See

### Using the date switcher

Access the date switcher using the command "Periodic Notes: Show date switcher...". Upon opening it, the date switcher will show a collection of quick date entries.

<img width="754" alt="image" src="https://user-images.githubusercontent.com/693981/163502230-b26950b2-be74-4e77-a823-cc4d599b8e33.png">

On each entry, it shows either or not the active calendar set has a corresponding note, the path for that note, as well as the number of related notes for that time period. Selecting an entry will open the existing note or create a new one if one does not exist. You can select a note by clicking or with <kbd>Enter</kbd>. Holding down <kbd>ctrl</kbd> while selecting an entry will open that note in a new pane.

##### Related Notes

Pressing <kbd>Tab</kbd> will open the Related Notes view for the highlighted entry. This will show all non-exact matches corresponding to that time period. On the "today" entry, it would show all notes where today's date appears in the filename. For the "this month" entry, it will show all the notes prefixed with `YYYY-MM`.

##### Extended Search

From the related notes view, you can press `*` to expand the search. Expanding a search means that the list will include all the entries _within_ that period. So the "this month" entry will include all the weekly and daily notes of that month.

This becomes especially powerful when looking for a particular Zettlekasten note and you remember that it was from last week, but maybe not the particular day.

### Using the timeline complication

The complication will show the relative date for the open note.

| Note                            | Appearance                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `2022-04-14.md`                 | <img width="104" alt="image" src="https://user-images.githubusercontent.com/693981/163503952-a8619a42-a91a-43ea-af49-eb77744c5048.png"> |
| `202204141213 Meeting Notes.md` | <img width="100" alt="image" src="https://user-images.githubusercontent.com/693981/163503975-7a8f9798-5644-4d3d-8eeb-49c2e07d0884.png"> |

#### Weekly Calendar

Clicking on the timeline complication will toggle the weekly inline calendar.

![timeline](https://user-images.githubusercontent.com/693981/163504193-064dbb30-0890-4708-86c8-49b50e86da35.gif)

## Configuring

### Classifying Dates

Periodic Notes searches within the specified folders and indexes all types of time-related files.

- Notes with filenames matching **exactly** the date format specified in the settings. So if the format is `YYYY-MM-DD`, it will find and index `2022-04-10.md`
- Notes with dates in the filename. This includes Zettelkasten-prefixed notes (e.g. `202204101611 Meeting Notes.md`) but also files like `Budget cuts made in 2021.md`.
- Notes [identified as periodic notes according to frontmatter](#parsing-frontmatter)

Using frontmatter to identify the notes gives you maximum flexibility to name your notes however you want, meaning you're no longer restricted to the fixed formats that Moment.js can parse.

When opening a note for a particular day, the algorithm always looks for exact matches and it prefers frontmatter matches over filename matches.

#### Parsing filenames

Periodic Notes will look at all the files nested within the **folder** that you configure.

So you can have:

```
- daily_notes/
  # all-notes within one folder
  - 2022-04-01.md

  # or nested within separate folders
  - 2020/
    - 03/
      - 2022-03-01.md
    - 04/
      - 2022-04-02.md
```

Periodic Notes also indexes any filename that contains a date-like pattern. This means it will capture:

- 202204101611 Meeting Notes
- 2021.02.04 Workout Log
- 2001 A Space Odyssey
- Best video games of 1995

#### Parsing frontmatter

You can also use frontmatter to classify notes as periodic notes. It will check the frontmatter of all files looking for the following keys with their corresponding values:

| Frontmatter Key | Format       |
| --------------- | ------------ |
| day             | `YYYY-MM-DD` |
| week            | `GGGG-[W]WW` |
| month           | `YYYY-MM`    |
| quater          | `YYYY-[Q]Q`  |
| year            | `YYYY`       |

For example:

```
---
day: 2022-01-12`
---
```

Notes with these frontmatter keys will be classified as an **exact match**. This means that commands that open periodic notes will open the note with corresponding frontmatter.

#### Reconsoling multiple **exact** matches

For commands that expect a single **exact match**, such as "Open today's daily note," the plugin will favor "frontmatter"-matched notes over notes that match by filename.

### Template Tags

| Tag                                                                                    | Supported Note Types | Description                                                                                                  | Accepts date calculations |
| -------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `title`                                                                                | _All_                | It will insert the title of the note                                                                         | ❌                        |
| `date`, `time`                                                                         | _All_                | It will insert current date/time. Optionally accepts a format. e.g. `{{date:YYYY-MM-DD}}`                    | ✅                        |
| `yesterday`, `tomorrow`                                                                | Daily                | Inserts the corresponding date. Optionally accepts a format. e.g. `{{tomorrow:YYYY-MM-DD}}`                  | ✅                        |
| `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` | Weekly               | Refers to the particular day in the week `{{sunday:gggg-MM-DD}}` Note, you **must** specify the date format! | ✅                        |
| `month`                                                                                | Monthly              | Refers to the first day of the month. Optionally accepts a format. e.g. `{{month:YYYY-MM}}`                  | ✅                        |
| `quarter`                                                                              | Quarterly            | Refers to the first day of the quarter. Optionally accepts a format. e.g. `{{quarter:YYYY-[Q]Q}}`            | ✅                        |
| `year`                                                                                 | Yearly               | Refers to the first day of the year. Optionally accepts a format. e.g. `{{year:YYYY}}`                       | ✅                        |

## Related Plugins

- [Natural Language Dates plugin](https://github.com/argenos/nldates-obsidian) by [Argentina Ortega Sáinz](https://github.com/argenos)
- [Calendar plugin](https://github.com/liamcain/obsidian-calendar-plugin)

## FAQ

### How do I have week numbers match the week numbers in Google Calendar, Outlook, Fantastical?

Those programs conform to the **ISO-8601** specification for week numbering. To follow this standard, make sure you're using the `GGGG` and `WW` tokens in your specified format.

<img width="864" alt="image" src="https://user-images.githubusercontent.com/693981/163471298-5c63da1b-7cba-4c94-b0e9-c54818703889.png">

### I want new notes to be created within a subfolder of my periodic note folder. How do I do that?

If you want new daily notes to show up in the folder `Journal/2022/` for example, you can include the sub-folder in the "Format" field. For example:

<img width="868" alt="image" src="https://user-images.githubusercontent.com/693981/163474542-f20c469d-95a1-4e7f-afbb-6f858a9aff32.png">

**Important:** Notice that the plugin will look at all files within the **Folder** that you provide. So even if you want your journal segmented into subfolders, the **Folder** should refer to the base folder only.

```
journal
  ├── 2021
  │   ├── 2021-12-30.md
  │   └── 2021-12-31.md
  └── 2022
      ├── 2022-04-01.md
      └── 2022-04-02.md
```

For this configuration, the **Folder** should be `journal/` and the **Format** should be `YYYY/YYYY-MM-DD`.

---

## 🎞 Credits

A big things to everyone that helped test new features and reported bugs. And a special thank you to Argentina Ortega Sáinz for the [Natural Language Dates plugin](https://github.com/argenos/nldates-obsidian) which powers the date switcher.

## Say Thanks 🙏

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/liamcain)

Like my work and want to see more like it? You can sponsor me.

[![GitHub Sponsors](https://img.shields.io/github/sponsors/liamcain?style=social)](https://github.com/sponsors/liamcain)
