const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, PageBreak
} = require("docx");

const path = require("path");
const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf-8"));
const letters = ["ア", "イ", "ウ", "エ"];

const totalQuestions = data.categories.reduce((s, c) => s + c.questions.length, 0);
const counts = [...new Set(data.categories.map((c) => c.questions.length))];
const subtitle =
  counts.length === 1
    ? `全${data.categories.length}カテゴリ × 各${counts[0]}問（4択・解説つき）`
    : `全${data.categories.length}カテゴリ・全${totalQuestions}問（4択・解説つき）`;

const children = [];

// Title page
children.push(
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000, after: 400 },
    children: [new TextRun({ text: data.title, bold: true, size: 44 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: subtitle, size: 24, color: "555555" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 2000 },
    children: [new TextRun({ text: "正解は各問題の選択肢のあとに【正解】として明記しています。", size: 20, color: "888888" })]
  }),
  new Paragraph({ children: [new PageBreak()] })
);

data.categories.forEach((cat, ci) => {
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2563EB", space: 4 } },
      children: [new TextRun({ text: cat.title, bold: true, color: "2563EB" })]
    })
  );

  cat.questions.forEach((q, qi) => {
    children.push(
      new Paragraph({
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({ text: `問${qi + 1}　`, bold: true, color: "2563EB", size: 24 }),
          new TextRun({ text: q.q, bold: true, size: 24 })
        ]
      })
    );

    q.choices.forEach((choice, idx) => {
      const isCorrect = idx === q.correct;
      children.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${letters[idx]}：`, bold: isCorrect, color: isCorrect ? "16A34A" : "000000" }),
            new TextRun({ text: choice, bold: isCorrect, color: isCorrect ? "16A34A" : "000000" }),
            new TextRun({ text: isCorrect ? "　【正解】" : "", bold: true, color: "16A34A" })
          ]
        })
      );
    });

    children.push(
      new Paragraph({
        indent: { left: 400 },
        spacing: { before: 100, after: 240 },
        shading: { type: "clear", fill: "F1F5F9" },
        children: [
          new TextRun({ text: "【解説】", bold: true, color: "475569", size: 20 }),
          new TextRun({ text: "  " + q.explain, color: "334155", size: 20 })
        ]
      })
    );
  });

  if (ci !== data.categories.length - 1) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
});

const doc = new Document({
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 } } // A4
      },
      children
    }
  ],
  styles: {
    default: {
      document: {
        run: { font: "Yu Gothic", size: 22 }
      }
    }
  }
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(path.join(ROOT, "dist", "GitGitHub基本操作クイズ問題集.docx"), buf);
  console.log("done");
});
