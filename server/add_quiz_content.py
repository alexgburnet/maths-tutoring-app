from app import db, Topic, TopicQuestion, ConfidenceDescriptor

def add_quadratics_topic():
    topic = Topic(
        name="Quadratic Equations and Graphs",
        category="Algebra",
        weight=1.2
    )
    db.session.add(topic)
    db.session.flush()  # Get topic.id

    subtopics = [
        {
            "title": "Solve quadratics by factorising",
            "tier": "H",
            "weight": 1.0,
            "rubrics": {
                1: "I cannot factorise simple quadratics.",
                2: "I can factorise quadratics like $x^2 + 5x + 6$",
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
                2: "I can complete the square for $x^2 + bx$",
                3: "I can complete the square for $x^2 + bx + c$",
                4: "I can solve quadratics using completing the square.",
                5: "I can find the vertex and interpret completed form."
            }
        }
    ]

    for sub in subtopics:
        question = TopicQuestion(
            topic_id=topic.id,
            title=sub["title"],
            tier=sub["tier"],
            weight=sub["weight"]
        )
        db.session.add(question)
        db.session.flush()  # Get question.id

        for score, description in sub["rubrics"].items():
            db.session.add(ConfidenceDescriptor(
                question_id=question.id,
                score=score,
                description=description
            ))

    db.session.commit()
    print("✅ Quadratic topic, subtopics, and rubrics added.")

if __name__ == "__main__":
    with db.app.app_context():
        add_quadratics_topic()