---
name: pdf-ats
description: Expert in generating ATS-friendly PDF documents. Specializes in clean, scannable resumes that pass applicant tracking systems while remaining readable for humans.
license: MIT
metadata:
  author: Mindrally
  version: '1.0.0'
---

# PDF ATS (Applicant Tracking System) Generation

Expert in creating PDF documents optimized for ATS systems while maintaining human readability.

## ATS-Friendly PDF Principles

### Layout Requirements

- **Single column format**: Never use multi-column layouts (ATS cannot read them)
- **Standard margins**: 0.5-1 inch (1.27-2.54 cm) on all sides
- **No tables**: ATS cannot parse table structures
- **No headers/footers**: Important info gets lost
- **No images/graphics**: Logos, photos not readable by ATS
- **No columns**: Single stream of text only
- **No text boxes**: Use plain paragraphs

### Font Requirements

- **Font size**: 10-12pt for body, 14-16pt for name
- **Font family**: Use standard fonts only
  - ✅ Arial, Helvetica, Times New Roman, Courier
  - ❌ Decorative fonts (cannot be read)
- **No fancy formatting**: Bold, italics can cause issues
- **Underlines**: Avoid, use spacing instead

### Content Structure

```
[Name - Large]
[Email | Phone | Location | LinkedIn]

[SUMMARY/OBJECTIVE]
Brief 2-3 sentence summary highlighting key qualifications.

[EXPERIENCE]
Job Title | Company | Dates
- Bullet point 1 (start with action verbs)
- Bullet point 2
- Bullet point 3

[EDUCATION]
Degree | School | Year

[SKILLS]
List of technical and soft skills, separated by commas or pipes
```

### File Format

- **Format**: PDF (not DOCX, not RTF)
- **File name**: `FirstName_LastName_Resume.pdf`
- **Content type**: Plain text embedded as PDF (not scanned image)
- **Encoding**: UTF-8

## HTML to PDF Conversion Rules

### DO

```html
<!-- ✅ GOOD: Simple, linear HTML -->
<div style="font-family: Arial, sans-serif; font-size: 11pt; margin: 1in;">
  <h1 style="font-size: 16pt; margin-bottom: 0;">John Doe</h1>
  <p style="margin-top: 0;">john@email.com | (555) 123-4567</p>

  <h2 style="font-size: 12pt; border-bottom: 1px solid #000; margin-top: 12pt;">EXPERIENCE</h2>
  <p><strong>Software Engineer</strong> | ABC Corp | 2020-Present</p>
  <ul>
    <li>Developed microservices architecture using Node.js</li>
    <li>Implemented CI/CD pipelines reducing deployment time by 50%</li>
  </ul>
</div>
```

### DON'T

```html
<!-- ❌ BAD: Complex layout -->
<div style="display: flex; columns: 2;">
  <table>
    <tr>
      <td>...</td>
    </tr>
  </table>
</div>
```

## CSS Properties to Avoid

| Avoid                | Reason                    |
| -------------------- | ------------------------- |
| `float`              | Breaks parsing            |
| `position: absolute` | Text gets lost            |
| `columns: 2+`        | Multi-column not readable |
| `display: grid`      | ATS cannot parse          |
| `display: flex`      | Can cause issues          |
| `page-break-*`       | Avoid for ATS             |

## CSS Properties That Work

| Use Instead     | Example                         |
| --------------- | ------------------------------- |
| `margin`        | `margin: 1in`                   |
| `padding`       | `padding: 12pt`                 |
| `font-size`     | `font-size: 11pt`               |
| `font-weight`   | `font-weight: bold`             |
| `border-bottom` | `border-bottom: 1px solid #000` |

## Print Media Query

Always wrap your styles in print media:

```css
@media print {
  body {
    margin: 0.5in;
  }
  .no-print {
    display: none;
  }
}
```

## Best Practices for ATS Score

1. **Keywords**: Match job description keywords naturally
2. **Quantify**: Use numbers (50%, $1M, 100+ users)
3. **Action verbs**: Led, Developed, Implemented, Created
4. **Clean format**: Simple > Fancy
5. **File size**: Under 500KB

## JavaScript Print Function

```javascript
function printCV() {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
```

## Common ATS Systems

- Workday
- Greenhouse
- Lever
- Taleo
- iCIMS
- BrassRing

All prefer: Simple, text-based PDFs with standard formatting
