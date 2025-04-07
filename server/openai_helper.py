# utils/openai_helper.py

import os
from openai import OpenAI
from dotenv import load_dotenv
import json
import logging # Added for logging errors

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
        model="gpt-4o",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    return completion.choices[0].message.content

def generate_weekly_plan_openai(user_info, topic_priorities, weeks_left):
    """
    Generates a weekly study plan using OpenAI based on user info and topic priorities.

    Args:
        user_info (dict): Contains user details like 'target_grade', 'exam_date'.
        topic_priorities (list): A list of dictionaries, each containing 'topic_id', 
                                 'topic_name', 'priority', 'category', and 'subtopics' 
                                 (a list of dicts with 'question_id', 'title').
        weeks_left (int): Number of weeks available for the plan.

    Returns:
        dict: A dictionary representing the weekly plan, parsed from OpenAI's JSON response.
              Returns None if the API call fails or returns invalid JSON.
    """
    
    # Prepare the list of topics with priorities for the prompt
    # Ensure subtopics list comprehension handles empty lists gracefully
    topics_input_lines = []
    for t in topic_priorities:
        subtopic_ids = [s['question_id'] for s in t.get('subtopics', [])]
        topics_input_lines.append(
            f"- Topic ID: {t['topic_id']}, Name: '{t['topic_name']}', Category: '{t.get('category', 'N/A')}', Priority Score: {t['priority']:.4f}, Weakest Subtopics (IDs): {subtopic_ids}"
        )
    topics_input = "\n".join(topics_input_lines)

    # Correctly formatted prompt string
    prompt = f"""You are an expert GCSE Maths tutor creating a personalized weekly study plan.

Student Information:
- Target Grade: {user_info.get('target_grade', 'Not set')}
- Exam Date: {user_info.get('exam_date', 'Not set').strftime('%Y-%m-%d') if user_info.get('exam_date') else 'Not set'}
- Weeks until exam: {weeks_left}

Available Topics and Priorities:
(Topics are ranked by priority score, highest first. Weakest subtopics within each topic are also provided based on recent assessment.)
{topics_input}

Task:
Generate a weekly study plan covering the next {weeks_left} weeks. Distribute the prioritized topics across the weeks logically. Start with higher priority topics but consider spreading the workload and revisiting topics if beneficial (though simple week-by-week allocation is acceptable). Aim to cover 1-2 main topics per week. For each topic assigned to a week, suggest 1-2 specific weakest subtopic IDs (from the provided list for that topic) to focus on.
If there are too many topics to cover in the available weeks, only include the highest priority topics and their weakest subtopics, such that the weekly content is manageable and achievable in one hour.

Output Format:
Return ONLY a JSON object representing the plan. The JSON object should have a single key "weekly_plan". The value of "weekly_plan" should be an object where keys are week numbers (as strings, e.g., "1", "2") and values are lists of topics for that week. Each topic in the list should be an object with:
- "topic_id": The integer ID of the topic.
- "focus_area": A brief string suggesting focus (e.g., the name of the highest priority subtopic), or null.
- "subtopic_ids": A list of 1-3 integer IDs for the weakest subtopics to focus on for this topic in this week.

Example JSON Output Structure:
{{{{ "weekly_plan": {{{{ "1": [ {{ "topic_id": 15, "focus_area": "Solving simultaneous equations graphically", "subtopic_ids": [151, 153] }}, {{ "topic_id": 8, "focus_area": null, "subtopic_ids": [82] }} ], "2": [ {{ "topic_id": 22, "focus_area": "Calculating area of compound shapes", "subtopic_ids": [221, 224, 225] }} ], /* ... other weeks */ }} }} }}}}

Constraints:
- Adhere strictly to the JSON output format. Do not include any explanations or introductory text outside the JSON structure.
- Use the provided Topic IDs and Subtopic (Question) IDs.
- Assign topics logically based on priority, distributing them across the {weeks_left} weeks.
- Ensure the week numbers in the JSON correspond to the weeks available ({weeks_left})."""

    try:
        logging.info("Calling OpenAI API to generate weekly plan...")
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert GCSE Maths tutor creating a personalized weekly study plan. Output ONLY the requested JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            response_format={"type": "json_object"}
        )

        response_content = completion.choices[0].message.content
        logging.info(f"Received OpenAI response: {response_content[:200]}...") # Log snippet
        plan_data = json.loads(response_content)

        # Basic validation
        if "weekly_plan" not in plan_data or not isinstance(plan_data["weekly_plan"], dict):
             logging.error("OpenAI response missing 'weekly_plan' dictionary.")
             return None
             
        logging.info("Successfully parsed weekly plan from OpenAI response.")
        return plan_data

    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON from OpenAI: {e}. Response: {response_content}")
        return None
    except Exception as e:
        logging.error(f"Error calling OpenAI API for plan generation: {e}")
        return None