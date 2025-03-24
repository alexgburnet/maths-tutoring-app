# utils/openai_helper.py

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load the .env file (must contain OPENAI_API_KEY)
load_dotenv()

# Instantiate client – will auto-use OPENAI_API_KEY from env
client = OpenAI()

def generate_followup_questions_latex(latex_input):
    prompt = f"""
You are a helpful maths tutor. Based on the session notes below (in LaTeX), generate the content for a worksheet **only inside** the document — do not include \\documentclass, \\begin{{document}}, or \\end{{document}}.

The session notes were hand written by me, and converted to Latex. Bear in mind that the notes are not perfect, and may contain errors or omissions.
Given the following session notes, generate around 10 new GCSE-level maths exam style practice questions for each concept, that reinforce the concepts discussed.
The questions should be:
- new
- similar difficulty to the material in the notes
- similar to past paper questions on the topic.

Here is how I would like you to structure it:
- Question sections for each topic discussed, progressing from easier to harder
- Bonus question for each topic (harder question)
- Answers section, with working out for each question
- Use clean, valid LaTeX (no explanations, only the worksheet body)
- Use only basic math packages (like amsmath), and avoid packages like tikz or fancyhdr.

Please return only the LaTeX *body content* (e.g., questions in LaTeX), without wrapping it in \documentclass or \begin document...\end document . I will wrap it myself.

Session Notes:
{latex_input}
"""

    completion = client.chat.completions.create(
        model="gpt-4o",  # You can change this to gpt-4 or gpt-3.5-turbo
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    return completion.choices[0].message.content