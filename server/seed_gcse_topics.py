# scripts/seed_gcse_topics.py

from app import db, Topic, TopicQuestion, ConfidenceDescriptor

def add_topic_with_subtopics(topic_name, category, weight, subtopics):
    topic = Topic(name=topic_name, category=category, weight=weight)
    db.session.add(topic)
    db.session.flush()

    for sub in subtopics:
        question = TopicQuestion(
            topic_id=topic.id,
            title=sub["title"],
            tier=sub["tier"],
            weight=sub["weight"]
        )
        db.session.add(question)
        db.session.flush()

        for score, description in sub["rubrics"].items():
            db.session.add(ConfidenceDescriptor(
                question_id=question.id,
                score=score,
                description=description
            ))

    db.session.commit()
    print(f"✅ Added topic: {topic_name} ({category})")


def populate_gcse_topics():
    topics = [
        {
            "name": "Linear Equations",
            "category": "Algebra",
            "weight": 1.0,
            "subtopics": [
                {
                    "title": "Solve one-step linear equations",
                    "tier": "F",
                    "weight": 1.0,
                    "rubrics": {
                        1: "I cannot solve even basic equations.",
                        2: "I can solve one-step equations like $x + 3 = 7$.",
                        3: "I can solve equations with negative numbers.",
                        4: "I can check my answers by substitution.",
                        5: "I can apply this skill to word problems."
                    }
                },
                {
                    "title": "Solve two-step linear equations",
                    "tier": "F",
                    "weight": 1.1,
                    "rubrics": {
                        1: "I struggle with multiple steps.",
                        2: "I can isolate variables in simple equations.",
                        3: "I can solve equations like $2x + 3 = 7$.",
                        4: "I can work with brackets or negatives.",
                        5: "I can explain the steps and reasoning."
                    }
                }
            ]
        },
        {
            "name": "Inequalities",
            "category": "Algebra",
            "weight": 1.0,
            "subtopics": [
                {
                    "title": "Solve linear inequalities",
                    "tier": "F",
                    "weight": 1.0,
                    "rubrics": {
                        1: "I do not understand what inequalities mean.",
                        2: "I can solve inequalities like $x < 5$.",
                        3: "I can solve two-step inequalities.",
                        4: "I can represent solutions on a number line.",
                        5: "I can apply inequalities in worded contexts."
                    }
                },
                {
                    "title": "Solve quadratic inequalities",
                    "tier": "H",
                    "weight": 1.4,
                    "rubrics": {
                        1: "I cannot interpret quadratic inequalities.",
                        2: "I can sketch simple quadratic graphs.",
                        3: "I can solve inequalities like $x^2 - 4 < 0$.",
                        4: "I can find solution intervals.",
                        5: "I can apply this to context-based problems."
                    }
                }
            ]
        },
        {
            "name": "Graphs and Functions",
            "category": "Algebra",
            "weight": 1.1,
            "subtopics": [
                {
                    "title": "Plot linear graphs",
                    "tier": "F",
                    "weight": 1.0,
                    "rubrics": {
                        1: "I cannot plot graphs from equations.",
                        2: "I can find coordinates from a table of values.",
                        3: "I can plot graphs like $y = 2x + 1$.",
                        4: "I understand gradient and intercept.",
                        5: "I can solve problems using line graphs."
                    }
                },
                {
                    "title": "Recognise and plot quadratic graphs",
                    "tier": "H",
                    "weight": 1.3,
                    "rubrics": {
                        1: "I don’t understand quadratic shapes.",
                        2: "I can plot points from $y = x^2$.",
                        3: "I can complete a table and sketch curves.",
                        4: "I can identify turning points and symmetry.",
                        5: "I can interpret graphs to solve problems."
                    }
                }
            ]
        },
        {
            "name": "Quadratic Equations and Graphs",
            "category": "Algebra",
            "weight": 1.2,
            "subtopics": [
                {
                    "title": "Solve quadratics by factorising",
                    "tier": "H",
                    "weight": 1.0,
                    "rubrics": {
                        1: "I cannot factorise simple quadratics.",
                        2: "I can factorise quadratics like $x^2 + 5x + 6$.",
                        3: "I can solve quadratic equations by factorising.",
                        4: "I can check solutions by substitution.",
                        5: "I can apply factorisation to problem-solving contexts."
                    }
                },
                {
                    "title": "Solve quadratics using the quadratic formula",
                    "tier": "H",
                    "weight": 1.2,
                    "rubrics": {
                        1: "I do not know the quadratic formula.",
                        2: "I can recall the quadratic formula.",
                        3: "I can use it with positive discriminants.",
                        4: "I can use it with negative or zero discriminants.",
                        5: "I can interpret roots and apply them to context problems."
                    }
                },
                {
                    "title": "Complete the square",
                    "tier": "H",
                    "weight": 1.3,
                    "rubrics": {
                        1: "I don’t know what completing the square means.",
                        2: "I can complete the square for $x^2 + bx$.",
                        3: "I can complete the square for $x^2 + bx + c$.",
                        4: "I can solve quadratics using completing the square.",
                        5: "I can find the vertex and interpret completed form."
                    }
                }
            ]
        }
    ]

    for topic in topics:
        add_topic_with_subtopics(topic["name"], topic["category"], topic["weight"], topic["subtopics"])