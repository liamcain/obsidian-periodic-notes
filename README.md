# Periodic Notes

Create and manage all of your time-based notes within Obsidian.

This plugin allows you to:

- Create notes for any periodic of time (daily, weekly, monthly, etc)
- Jump to any time-based notes using natural language (requires NL Dates plugin)
- Easily orient yourself in a sea of `202204101611 Zettelkasten Prefixed notes`

## Features

### Calendar sets

A **calendar set** describes a collection of periodic notes. Now you no longer need to have a single Daily Note, instead you can have one for each pillar of your life. Have a clean break between Personal and Work. Track a project. Track client work. Organize your school work. Calendar sets offer _flexibility_ for you to live more strict.

### Date switcher

Two of the biggest pain points in workflows involving Periodic notes and Zettelkasten-ish notes are **note recall** and **navigation**. The date switcher attempts to solve both of these issues. Use natural language to quickly find periodic notes and other date-related notes. Looking for a meeting note from last week? Just search: `last week ⇥ meeting`. It's my proudest feature of this release and I really hope you love it.

### Timeline complication

The date switcher will have you zipping around from note to note so fast you might start getting a bit lost. But don't fret! There is now a timeline "complication" on the top-right of your periodic notes that shows you in natural language exactly where you are.

## Configuring

### Date Index

Periodic Notes searches within the specified folders and indexes all types of time-related files.

- Notes matching **exactly** the date format specified in the settings. So if the format is `YYYY-MM-DD`, it will find and index `2022-04-10.md`
- Notes with dates in the filename. This includes Zettelkasten-prefixed notes (e.g. `202204101611 Meeting Notes.md`) but also files like `Budget cuts made in 2021.md`.

It will also check the frontmatter of all files looking for the following keys with their corresponding values:

| Frontmatter Key | Format       |
| --------------- | ------------ |
| day             | `YYYY-MM-DD` |
| week            | `GGGG-[W]WW` |
| month           | `YYYY-MM`    |
| quater          | `YYYY-[Q]Q`  |
| year            | `YYYY`       |

Using frontmatter to identify the notes gives you maximum flexibility to name your notes however you want, meaning you're no longer restricted to the fixed formats that Moment.js can parse.

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

The plugin also looks at frontmatter to identify periodic notes. Currently it only uses frontmatter to identify exact matches:

For example:

```
---
day: 2022-01-12`
---
```

## FAQ

### How do I use a variable in the folder path?

If you want new daily notes to show up in the folder `Journal/2021/` for example, you can include the folder in the "Format" field. For example:

<img width="500" alt="image" src="https://user-images.githubusercontent.com/693981/111852801-c1cd8e00-88ee-11eb-9542-b7d840239037.png">

## Say Thanks 🙏

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/liamcain)

Like my work and want to see more like it? You can sponsor me.

[![GitHub Sponsors](https://img.shields.io/github/sponsors/liamcain?style=social)](https://github.com/sponsors/liamcain)
