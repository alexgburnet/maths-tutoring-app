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
You are a helpful maths tutor. Based on the session notes below (in LaTeX), generate a worksheet in LaTeX format.

Requirements:
- Around 10 GCSE-style exam questions that reinforce the concepts covered
- Group questions by topic, progressing from easier to harder
- Add a 'Bonus Question' for each topic
- Include an 'Answers' section at the end
- Use clean, valid LaTeX (no explanations, only the worksheet)
- Make sure the output compiles (e.g. use \\usepackage{{amsmath}})

Session Notes:
{latex_input}
"""

    completion = client.chat.completions.create(
        model="gpt-4o",  # You can change this to gpt-4 or gpt-3.5-turbo
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )

    return completion.choices[0].message.content