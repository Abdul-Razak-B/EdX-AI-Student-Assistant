import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/recommendations", async (req, res) => {
  const students = req.body.students;
  const results = [];

  for (let student of students) {
    const prompt = `
You are an AI educational assistant for EdX for Schools, tasked with providing personalized course and skill recommendations for a student.

Student Name: ${student["Name"]}
Grade/Class: ${student["Grade"]}
Age: ${student["Age"]}
Learning Style: ${student["Learning Style"]}
Completed Courses: ${student["Completed Courses"]}
Performance Metrics: ${student["Performance Metrics"]}
Learning Goals: ${student["Learning Goals"]}
Interests: ${student["Interests"]}

Provide 3–5 EdX courses and key skills with priority (High/Medium/Low). Include rationale and prerequisites. Format as structured text suitable for teachers.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      results.push({
        name: student["Name"] || "Student",
        grade: student["Grade"] || "N/A",
        style: student["Learning Style"] || "N/A",
        recommendation: response.choices[0].message.content,
      });
    } catch (err) {
      results.push({
        name: student["Name"] || "Student",
        grade: student["Grade"] || "N/A",
        style: student["Learning Style"] || "N/A",
        recommendation:
          "Error generating recommendation. Check API key and server.",
      });
      console.error(err);
    }
  }

  res.json(results);
});

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
