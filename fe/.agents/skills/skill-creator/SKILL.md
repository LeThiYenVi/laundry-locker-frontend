---
name: skill-creator
description: Guide for creating effective skills. Use when users want to create a new skill or update an existing skill that extends Kimi's capabilities with specialized knowledge, workflows, or tool integrations. Also use when explaining skill structure, anatomy, progressive disclosure patterns, or packaging skills.
---

# Skill Creator

This skill provides guidance for creating effective skills that extend Kimi's capabilities.

## Quick Start

To create a new skill, follow these steps in order:

### 1. Understand the Skill with Concrete Examples

Before building, clearly understand what the skill should do:

- Ask the user for concrete examples of how they'll use the skill
- Validate understanding of functionality scope
- Determine what makes this skill reusable

**Example questions to ask:**
- "What functionality should this skill support?"
- "Can you give examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

### 2. Plan Reusable Contents

Analyze each example to identify reusable resources:

| Resource Type | Use When | Example |
|--------------|----------|---------|
| `scripts/` | Same code rewritten repeatedly | `rotate_pdf.py` for PDF rotation |
| `references/` | Documentation needed during execution | `schema.md` for database schemas |
| `assets/` | Files used in final output | `template.pptx`, boilerplate code |

### 3. Initialize the Skill

Create the skill directory structure:

```
skill-name/
├── SKILL.md (required)
├── scripts/     # optional - executable code
├── references/  # optional - documentation to load as needed
└── assets/      # optional - templates, images, boilerplate
```

**Naming rules:**
- Use lowercase letters, digits, and hyphens only
- Max 64 characters
- Prefer verb-led phrases (e.g., `pdf-editor`, `gh-address-comments`)
- Folder name must match skill name exactly

### 4. Edit SKILL.md

Create the main skill file with:

#### Frontmatter (Required)
```yaml
---
name: skill-name
description: Clear description of what the skill does AND when to use it. Include specific triggers and contexts.
---
```

#### Body Structure
- **Quick Start**: Brief workflow overview
- **Detailed Guidance**: Step-by-step instructions
- **Bundled Resources**: How to use scripts/references/assets

### 5. Package the Skill

Validate and package:

```bash
# Navigate to skills directory
cd .agents/skills/

# Create distributable archive
zip -r skill-name.skill skill-name/
```

## Core Principles

### Concise is Key

The context window is a public good. Only add information Kimi doesn't already have.

**Challenge each piece of information:**
- "Does Kimi really need this explanation?"
- "Does this paragraph justify its token cost?"

Prefer concise examples over verbose explanations.

### Set Appropriate Degrees of Freedom

| Freedom Level | Use When | Form |
|--------------|----------|------|
| **High** | Multiple approaches valid, context-dependent decisions | Text-based instructions |
| **Medium** | Preferred pattern exists, some variation acceptable | Pseudocode or scripts with parameters |
| **Low** | Operations are fragile, consistency critical | Specific scripts with minimal parameters |

### Progressive Disclosure

Skills load in three levels to manage context efficiently:

1. **Metadata** (`name` + `description`) - Always in context (~100 words)
2. **SKILL.md body** - Loaded when skill triggers (<5k words, keep <500 lines)
3. **Bundled resources** - Loaded only as needed by Kimi (unlimited)

**Keep SKILL.md lean** - Move detailed content to references, load conditionally.

## Anatomy of a Skill

### SKILL.md (Required)

```markdown
---
name: pdf-editor
description: PDF manipulation and analysis. Use when users need to: (1) Extract text from PDFs, (2) Rotate/reorder pages, (3) Fill forms, (4) Merge/split documents.
---

# PDF Editor

## Quick Start

Extract text from a PDF:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = "\n".join(page.extract_text() for page in pdf.pages)
```

## Features

- **Text extraction**: Basic usage shown above
- **Form filling**: See [FORMS.md](references/FORMS.md)
- **Page manipulation**: See [REFERENCE.md](references/REFERENCE.md)
```

### Scripts (`scripts/`)

Executable code for deterministic tasks:

```python
#!/usr/bin/env python3
# scripts/rotate_pdf.py
import sys
from pypdf import PdfReader, PdfWriter

def rotate_pdf(input_path, output_path, rotation=90):
    reader = PdfReader(input_path)
    writer = PdfWriter()
    for page in reader.pages:
        page.rotate(rotation)
        writer.add_page(page)
    with open(output_path, 'wb') as f:
        writer.write(f)

if __name__ == "__main__":
    rotate_pdf(sys.argv[1], sys.argv[2], int(sys.argv[3]))
```

### References (`references/`)

Documentation loaded as needed:

```markdown
# Database Schema

## users table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique, indexed |
```

**Guidelines:**
- Include grep search patterns for large files (>10k words)
- Structure files >100 lines with table of contents
- Don't duplicate content between SKILL.md and references

### Assets (`assets/`)

Files used in output (not loaded into context):

```
assets/
├── logo.png          # Brand assets
├── template.pptx     # PowerPoint template
├── boilerplate/      # Code templates
│   ├── react-app/
│   └── nextjs-app/
└── sample.docx       # Sample documents to modify
```

## Progressive Disclosure Patterns

### Pattern 1: High-Level Guide with References

```markdown
## Quick start

Basic usage here.

## Advanced features

- **Complex feature A**: See [A.md](references/A.md)
- **Complex feature B**: See [B.md](references/B.md)
```

### Pattern 2: Domain-Specific Organization

```
skill/
├── SKILL.md
└── references/
    ├── finance.md    # Finance-specific
    ├── sales.md      # Sales-specific
    └── product.md    # Product-specific
```

Kimi only loads the relevant domain file.

### Pattern 3: Conditional Details

```markdown
## Basic usage

Simple approach here.

**For advanced scenario X**: See [ADVANCED.md](references/ADVANCED.md)
**For detailed API**: See [API.md](references/API.md)
```

## What NOT to Include

A skill should only contain essential files. Do NOT create:

- ❌ README.md
- ❌ INSTALLATION_GUIDE.md
- ❌ QUICK_REFERENCE.md
- ❌ CHANGELOG.md
- ❌ Any auxiliary documentation

The skill should only help an AI agent do the job. No user-facing docs, no process documentation.

## Skill Locations

Kimi loads skills in layers:

1. **Built-in** (system level)
2. **User level** (first existing):
   - `~/.config/agents/skills/` ← recommended
   - `~/.kimi/skills/`
   - `~/.claude/skills/`
3. **Project level**:
   - `.agents/skills/`

Use `--skills-dir` to override and load only from a specific directory.

## Examples

### Example 1: Simple Skill with Script

**skill-name:** `pdf-rotator`

```
pdf-rotator/
├── SKILL.md
└── scripts/
    └── rotate.py
```

**SKILL.md:**
```yaml
---
name: pdf-rotator
description: Rotate PDF pages. Use when users need to rotate PDF documents by 90, 180, or 270 degrees.
---

# PDF Rotator

Rotate PDF pages using the provided script.

## Usage

```bash
python scripts/rotate.py input.pdf output.pdf [degrees]
```

Default rotation is 90 degrees clockwise.
```

### Example 2: Skill with References

**skill-name:** `bigquery-analyst`

```
bigquery-analyst/
├── SKILL.md
└── references/
    ├── schema.md
    └── common-queries.md
```

**SKILL.md:**
```yaml
---
name: bigquery-analyst
description: Query BigQuery databases. Use when users need to: (1) Run SQL queries, (2) Analyze data, (3) Generate reports from BigQuery.
---

# BigQuery Analyst

## Quick Start

```python
from google.cloud import bigquery
client = bigquery.Client()
query = "SELECT * FROM `project.dataset.table` LIMIT 10"
df = client.query(query).to_dataframe()
```

## References

- **Schema documentation**: See [references/schema.md](references/schema.md)
- **Common query patterns**: See [references/common-queries.md](references/common-queries.md)
```

### Example 3: Skill with Assets

**skill-name:** `presentation-creator`

```
presentation-creator/
├── SKILL.md
└── assets/
    └── template.pptx
```

**SKILL.md:**
```yaml
---
name: presentation-creator
description: Create PowerPoint presentations. Use when users need to create slides, presentations, or pitch decks.
---

# Presentation Creator

## Quick Start

Use the template in `assets/template.pptx` as the starting point for new presentations.

## Usage

1. Copy the template
2. Modify slides using python-pptx
3. Save with new filename
```

## Validation Checklist

Before packaging a skill, verify:

- [ ] YAML frontmatter has `name` and `description`
- [ ] Skill name follows conventions (lowercase, hyphens, ≤64 chars)
- [ ] Description includes both "what it does" and "when to use"
- [ ] Description mentions specific triggers/contexts
- [ ] Directory name matches skill name
- [ ] No extraneous files (README, CHANGELOG, etc.)
- [ ] SKILL.md body is <500 lines (use references for detailed content)
- [ ] Scripts are tested and executable
- [ ] Reference files are linked from SKILL.md with clear usage guidance

## Template SKILL.md

See [assets/SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md) for a starter template.
