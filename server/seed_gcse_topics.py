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
        "name": "Structure and Calculation",
        "category": "Number",
        "weight": 1.0,
        "subtopics": [
            {
                "title": "Ordering numbers",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I cannot correctly order positive and negative numbers.",
                    "2": "I can order integers on a number line.",
                    "3": "I can order integers, decimals, and fractions.",
                    "4": "I can confidently use symbols (=, ≠, <, >, ≤, ≥) to compare numbers.",
                    "5": "I can apply ordering skills to solve complex problems."
                }
            },
            {
                "title": "Four operations with integers, decimals, fractions",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle with basic arithmetic operations.",
                    "2": "I can perform simple calculations with integers.",
                    "3": "I can perform formal written methods with integers and decimals.",
                    "4": "I can accurately calculate with fractions and mixed numbers.",
                    "5": "I can solve context-based arithmetic problems involving finance terms (profit, loss, tax, interest)."
                }
            },
            {
                "title": "Relationships and priority of operations",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I do not understand inverse operations.",
                    "2": "I can use inverse operations to simplify basic calculations.",
                    "3": "I correctly apply priority of operations (BIDMAS).",
                    "4": "I can handle calculations involving brackets, powers, and roots.",
                    "5": "I confidently apply these skills to complex multi-step problems."
                }
            },
            {
                "title": "Factors, multiples, primes",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I am unsure about prime numbers, factors, and multiples.",
                    "2": "I can identify factors and multiples of numbers.",
                    "3": "I can find highest common factors (HCF) and lowest common multiples (LCM).",
                    "4": "I can perform prime factorisation of numbers.",
                    "5": "I can confidently apply prime factorisation to solve advanced problems."
                }
            },
            {
                "title": "Systematic listing strategies",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle with listing outcomes systematically.",
                    "2": "I can create simple lists and tables.",
                    "3": "I can effectively use lists, tables, and diagrams.",
                    "4": "I understand and apply the product rule for counting.",
                    "5": "I confidently apply systematic listing strategies to complex problems."
                }
            },
            {
                "title": "Integer powers and roots",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I do not understand powers or roots.",
                    "2": "I can calculate squares and cubes of simple numbers.",
                    "3": "I can recognize powers of 2, 3, 4, and 5.",
                    "4": "I can estimate powers and roots of any positive number.",
                    "5": "I apply these skills to estimate and solve complex problems."
                }
            },
            {
                "title": "Calculating with roots and indices",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot perform calculations involving roots or indices.",
                    "2": "I can calculate with simple integer indices.",
                    "3": "I confidently calculate with integer indices and roots.",
                    "4": "I can calculate with fractional indices.",
                    "5": "I can apply these calculations in advanced mathematical contexts."
                }
            },
            {
                "title": "Exact calculations with fractions, π and surds",
                "tier": "H",
                "weight": 1.4,
                "rubrics": {
                    "1": "I cannot accurately calculate with fractions, π, or surds.",
                    "2": "I calculate exactly with fractions.",
                    "3": "I perform exact calculations involving multiples of π.",
                    "4": "I can simplify and calculate exactly with surds.",
                    "5": "I confidently rationalise denominators and simplify complex surd expressions."
                }
            },
            {
                "title": "Standard form calculations",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I do not understand standard form.",
                    "2": "I can interpret numbers written in standard form.",
                    "3": "I calculate with standard form using a calculator.",
                    "4": "I confidently calculate in standard form both with and without a calculator.",
                    "5": "I interpret and apply standard form calculations in various contexts."
                }
            }
        ]
    },
    {
        "name": "Fractions, Decimals and Percentages",
        "category": "Number",
        "weight": 1.0,
        "subtopics": [
            {
                "title": "Decimals and fractions",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I cannot convert between decimals and fractions.",
                    "2": "I can convert simple terminating decimals to fractions.",
                    "3": "I can convert between any terminating decimals and fractions.",
                    "4": "I can convert recurring decimals into fractions.",
                    "5": "I confidently use these conversions to solve complex ordering problems."
                }
            },
            {
                "title": "Fractions in ratio problems",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle to identify fractions within ratios.",
                    "2": "I can identify basic fractions in simple ratio contexts.",
                    "3": "I work accurately with fractions in typical ratio problems.",
                    "4": "I confidently interpret complex fractions in ratio contexts.",
                    "5": "I apply my understanding of fractions in advanced ratio problems."
                }
            },
            {
                "title": "Fractions and percentages as operators",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I cannot use fractions or percentages as operators.",
                    "2": "I can interpret simple percentages as multipliers.",
                    "3": "I accurately interpret and use fractions and percentages as operators.",
                    "4": "I confidently solve percentage problems using multipliers.",
                    "5": "I apply fractions and percentages as operators in complex real-world problems."
                }
            }
        ]
    },
    {
        "name": "Measures and Accuracy",
        "category": "Number",
        "weight": 1.0,
        "subtopics": [
            {
                "title": "Standard units and metric conversions",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I struggle with standard units and conversions.",
                    "2": "I can use basic standard units of mass, length, time, and money.",
                    "3": "I can confidently perform metric conversions for length, area, volume, and capacity.",
                    "4": "I accurately handle standard compound measures.",
                    "5": "I apply conversions to complex real-world measurement problems."
                }
            },
            {
                "title": "Estimation and approximation",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I cannot estimate answers effectively.",
                    "2": "I can make simple estimations.",
                    "3": "I can check calculations using basic approximation methods.",
                    "4": "I consistently verify answers using estimation, including those calculated with technology.",
                    "5": "I accurately evaluate and interpret the reliability of estimated results."
                }
            },
            {
                "title": "Rounding and error intervals",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I struggle with rounding accurately.",
                    "2": "I can round numbers to a given number of decimal places.",
                    "3": "I can round accurately using significant figures.",
                    "4": "I confidently use inequality notation to express error intervals from rounding or truncation.",
                    "5": "I consistently apply appropriate rounding in complex calculations and contextual problems."
                }
            },
            {
                "title": "Limits of accuracy and bounds",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand upper and lower bounds.",
                    "2": "I can identify basic limits of accuracy.",
                    "3": "I can calculate upper and lower bounds of simple measurements.",
                    "4": "I confidently interpret and apply limits of accuracy in calculations.",
                    "5": "I apply limits of accuracy comprehensively in advanced problem-solving scenarios."
                }
            }
        ]
    },
    {
        "name": "Notation, Vocabulary and Manipulation",
        "category": "Algebra",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Algebraic notation",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle to use basic algebraic notation.",
                    "2": "I can use simple notation like $ab$ for $a \times b$ and $a^2$ for $a \times a$.",
                    "3": "I confidently interpret notation involving coefficients as fractions and brackets.",
                    "4": "I correctly simplify algebraic expressions without needing explicit instructions.",
                    "5": "I consistently apply algebraic notation to complex and multi-step problems."
                }
            },
            {
                "title": "Substituting values into formulae",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I cannot confidently substitute values into algebraic expressions.",
                    "2": "I substitute values into simple formulae.",
                    "3": "I accurately substitute numerical values into scientific and unfamiliar formulae.",
                    "4": "I handle substitution in complex contexts consistently.",
                    "5": "I reliably interpret and solve problems involving substitution from multiple contexts."
                }
            },
            {
                "title": "Concepts and vocabulary in algebra",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle with basic algebra vocabulary.",
                    "2": "I understand terms like expressions, equations, formulae, and inequalities.",
                    "3": "I confidently identify terms, factors, and identities.",
                    "4": "I accurately use algebraic vocabulary implicitly and explicitly.",
                    "5": "I can confidently use algebraic vocabulary and concepts to solve complex problems."
                }
            },
            {
                "title": "Simplifying and manipulating algebraic expressions",
                "tier": "F",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot simplify algebraic expressions.",
                    "2": "I can collect like terms and multiply single terms over brackets.",
                    "3": "I factorise quadratic expressions such as $x^2 + bx + c$.",
                    "4": "I expand and simplify products of binomials, factorise expressions including the difference of two squares, and use laws of indices.",
                    "5": "I confidently manipulate complex algebraic expressions involving surds and algebraic fractions."
                }
            },
            {
                "title": "Rearranging and using formulae",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle to rearrange simple formulae.",
                    "2": "I rearrange basic algebraic formulae.",
                    "3": "I confidently rearrange formulae to change the subject.",
                    "4": "I rearrange formulae involving symbols from different subjects accurately.",
                    "5": "I reliably apply and rearrange standard mathematical and scientific formulae to complex problems."
                }
            },
            {
                "title": "Equations and identities",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I do not understand the difference between equations and identities.",
                    "2": "I can identify equations and identities.",
                    "3": "I confidently differentiate equations from identities.",
                    "4": "I effectively argue mathematically to show algebraic expressions are equivalent.",
                    "5": "I use algebra to construct rigorous mathematical proofs."
                }
            },
            {
                "title": "Functions and inverse functions",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I struggle to interpret algebraic expressions as functions.",
                    "2": "I interpret simple expressions as functions with inputs and outputs.",
                    "3": "I confidently interpret inverse functions and composite functions.",
                    "4": "I accurately use $f(x)$, $fg(x)$, and $f^{-1}(x)$ notation.",
                    "5": "I apply understanding of functions comprehensively to solve advanced algebraic problems."
                }
            }
        ]
    },
    {
        "name": "Graphs",
        "category": "Algebra",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Coordinates in four quadrants",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle to plot or identify coordinates accurately.",
                    "2": "I can plot points in the first quadrant.",
                    "3": "I confidently plot and interpret coordinates in all four quadrants.",
                    "4": "I accurately solve problems involving coordinates.",
                    "5": "I apply coordinate skills confidently to complex scenarios."
                }
            },
            {
                "title": "Straight-line graphs",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot plot graphs of straight lines accurately.",
                    "2": "I plot graphs from equations in the form $y=mx+c$.",
                    "3": "I identify parallel lines using equations.",
                    "4": "I find equations of lines from given points or gradients.",
                    "5": "I identify perpendicular lines algebraically and graphically."
                }
            },
            {
                "title": "Gradients and intercepts of linear graphs",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I do not understand gradients or intercepts.",
                    "2": "I can identify simple gradients and intercepts graphically.",
                    "3": "I interpret gradients and intercepts algebraically and graphically.",
                    "4": "I confidently use gradients and intercepts to solve problems.",
                    "5": "I apply these skills effectively in complex real-world contexts."
                }
            },
            {
                "title": "Quadratic graphs and functions",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot identify or interpret quadratic graphs.",
                    "2": "I identify roots and turning points graphically.",
                    "3": "I deduce roots algebraically and turning points by completing the square.",
                    "4": "I accurately interpret symmetrical properties of quadratic graphs.",
                    "5": "I confidently apply quadratic graph knowledge in advanced problem-solving."
                }
            },
            {
                "title": "Recognising and sketching graphs",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle to recognise different types of graphs.",
                    "2": "I sketch and interpret linear and quadratic functions.",
                    "3": "I sketch cubic, reciprocal, and exponential functions.",
                    "4": "I confidently sketch and interpret trigonometric graphs.",
                    "5": "I consistently apply this understanding to complex graphical scenarios."
                }
            },
            {
                "title": "Translations and reflections of graphs",
                "tier": "H",
                "weight": 1.1,
                "rubrics": {
                    "1": "I do not understand how graphs transform.",
                    "2": "I recognise simple translations of graphs.",
                    "3": "I sketch translations and reflections of linear and quadratic graphs.",
                    "4": "I confidently interpret graphical transformations.",
                    "5": "I apply graph transformations effectively to complex problems."
                }
            },
            {
                "title": "Graphs in real contexts",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot interpret graphs in real-world scenarios.",
                    "2": "I interpret simple kinematic graphs.",
                    "3": "I plot and interpret reciprocal and exponential graphs in real contexts.",
                    "4": "I solve problems requiring graphical solutions.",
                    "5": "I confidently apply graph skills to real-world and contextual scenarios involving complex data."
                }
            },
            {
                "title": "Gradients and areas under graphs",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I struggle to calculate gradients or areas under graphs.",
                    "2": "I estimate simple gradients and areas graphically.",
                    "3": "I accurately calculate gradients and areas under linear and quadratic graphs.",
                    "4": "I interpret gradients and areas under graphs in kinematic and financial contexts.",
                    "5": "I confidently solve advanced problems involving gradients and areas."
                }
            },
            {
                "title": "Equations of circles and tangents",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand the equation of a circle.",
                    "2": "I recognise the equation of a circle centred at the origin.",
                    "3": "I confidently find the equation of a tangent to a circle at a given point.",
                    "4": "I accurately interpret and use circle equations in problem-solving.",
                    "5": "I consistently apply circle and tangent equations to complex geometrical problems."
                }
            }
        ]
    },
    {
        "name": "Solving Equations and Inequalities",
        "category": "Algebra",
        "weight": 1.3,
        "subtopics": [
            {
                "title": "Solving linear equations",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I cannot confidently solve linear equations.",
                    "2": "I can solve basic linear equations.",
                    "3": "I solve equations with the unknown on both sides and involving brackets.",
                    "4": "I find approximate solutions to linear equations graphically.",
                    "5": "I confidently solve and interpret linear equations in complex contexts."
                }
            },
            {
                "title": "Solving quadratic equations",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I struggle to solve quadratic equations.",
                    "2": "I can factorise and solve simple quadratic equations.",
                    "3": "I solve quadratic equations using factorisation, completing the square, and the quadratic formula.",
                    "4": "I find approximate graphical solutions for quadratic equations.",
                    "5": "I confidently solve complex quadratic equations requiring rearrangement and interpretation."
                }
            },
            {
                "title": "Solving simultaneous equations",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot solve simultaneous equations.",
                    "2": "I solve simple simultaneous linear equations algebraically.",
                    "3": "I solve simultaneous linear equations graphically and algebraically.",
                    "4": "I find approximate solutions for linear-quadratic simultaneous equations.",
                    "5": "I confidently apply simultaneous equations to complex, contextual problems."
                }
            },
            {
                "title": "Numerical methods and iteration",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand numerical iteration methods.",
                    "2": "I can find approximate solutions using simple numerical methods.",
                    "3": "I accurately use iteration methods to find approximate solutions.",
                    "4": "I confidently interpret recursive formulae with suffix notation.",
                    "5": "I apply numerical iteration effectively to solve complex equations."
                }
            },
            {
                "title": "Deriving and solving equations from contexts",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle to translate real-world situations into equations.",
                    "2": "I translate simple scenarios into algebraic expressions.",
                    "3": "I derive and solve equations or simultaneous equations from given contexts.",
                    "4": "I interpret solutions effectively in geometrical and contextual problems.",
                    "5": "I consistently apply algebra to translate and solve complex real-world problems."
                }
            },
            {
                "title": "Linear and quadratic inequalities",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot confidently solve inequalities.",
                    "2": "I solve basic linear inequalities in one variable.",
                    "3": "I represent solutions to linear inequalities on number lines accurately.",
                    "4": "I solve quadratic inequalities and represent solutions using set notation.",
                    "5": "I confidently represent and interpret solutions to inequalities graphically and algebraically in advanced contexts."
                }
            }
        ]
    },
    {
        "name": "Sequences",
        "category": "Algebra",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Generating sequences",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I cannot generate terms of a sequence.",
                    "2": "I generate simple sequences using a term-to-term rule.",
                    "3": "I accurately generate sequences using position-to-term rules.",
                    "4": "I generate sequences from patterns and diagrams confidently.",
                    "5": "I effectively interpret and generate complex sequences from various contexts."
                }
            },
            {
                "title": "Recognising special sequences",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot identify special number sequences.",
                    "2": "I recognise basic arithmetic sequences and square numbers.",
                    "3": "I confidently use triangular, square, cube, and Fibonacci-type sequences.",
                    "4": "I accurately recognise and use simple geometric progressions and quadratic sequences.",
                    "5": "I apply understanding of complex sequences including those involving surds to solve advanced problems."
                }
            },
            {
                "title": "Nth term expressions",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I struggle to find expressions for sequences.",
                    "2": "I can find the nth term of simple linear sequences.",
                    "3": "I accurately deduce nth term expressions for linear sequences.",
                    "4": "I confidently determine nth terms for quadratic sequences.",
                    "5": "I effectively derive and apply nth term expressions to complex sequence problems."
                }
            }
        ]
    },
    {
        "name": "Ratio, Proportion and Rates of Change",
        "category": "Ratio, Proportion and Rates of Change",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Changing between standard and compound units",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle with converting standard units.",
                    "2": "I can convert between basic standard units.",
                    "3": "I accurately convert standard units and compound units like speed and rates of pay.",
                    "4": "I confidently convert complex compound units such as density and pressure.",
                    "5": "I apply these conversions in numerical and algebraic contexts effectively."
                }
            },
            {
                "title": "Scale factors and maps",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I cannot use scale factors accurately.",
                    "2": "I can interpret basic scale diagrams.",
                    "3": "I confidently use scale factors with diagrams and maps.",
                    "4": "I accurately apply scale factors to geometric problems.",
                    "5": "I effectively solve complex scale problems involving maps and diagrams."
                }
            },
            {
                "title": "Expressing quantities as fractions or ratios",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle to express quantities as fractions or ratios.",
                    "2": "I can express simple quantities as fractions less or greater than 1.",
                    "3": "I confidently express quantities using ratio notation.",
                    "4": "I accurately apply ratio and fraction notation in practical contexts.",
                    "5": "I consistently apply fractions and ratios effectively to real-world problems."
                }
            },
            {
                "title": "Dividing quantities in ratios",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot divide quantities in given ratios.",
                    "2": "I divide simple quantities into given ratios.",
                    "3": "I confidently express divisions as ratios.",
                    "4": "I accurately apply ratio division in context, including best-buy problems.",
                    "5": "I consistently solve complex real-world ratio problems effectively."
                }
            },
            {
                "title": "Percentages and percentage change",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle with percentage calculations.",
                    "2": "I interpret basic percentages as fractions and decimals.",
                    "3": "I confidently calculate percentage changes and interpret multiplicatively.",
                    "4": "I accurately solve problems involving percentage increases/decreases and financial mathematics.",
                    "5": "I consistently apply percentage concepts to complex contexts involving original value and interest problems."
                }
            },
            {
                "title": "Direct and inverse proportion",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand direct or inverse proportion.",
                    "2": "I solve basic direct proportion problems.",
                    "3": "I accurately interpret graphical and algebraic representations of direct/inverse proportions.",
                    "4": "I confidently interpret and construct equations involving direct/inverse proportion.",
                    "5": "I effectively apply these concepts to complex real-world scenarios."
                }
            },
            {
                "title": "Rates of change and gradients",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I struggle interpreting gradients as rates of change.",
                    "2": "I interpret gradients of simple straight-line graphs.",
                    "3": "I accurately interpret gradients as rates of change and solve problems involving graphs of direct/inverse proportion.",
                    "4": "I calculate instantaneous rates of change from curves confidently.",
                    "5": "I effectively apply gradient concepts to complex financial and kinematic contexts."
                }
            },
            {
                "title": "Growth, decay and iterative processes",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I struggle with growth and decay problems.",
                    "2": "I solve simple growth and decay problems involving percentages.",
                    "3": "I accurately calculate compound interest and iterative processes.",
                    "4": "I confidently set up and interpret solutions to growth and decay problems.",
                    "5": "I apply iterative and compound interest methods effectively in complex real-world contexts."
                }
            }
        ]
    },
    {
        "name": "Properties and Constructions",
        "category": "Geometry and Measures",
        "weight": 1.3,
        "subtopics": [
            {
                "title": "Geometric terminology and diagrams",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle with basic geometric terms and diagrams.",
                    "2": "I can identify and label basic geometric terms.",
                    "3": "I accurately draw diagrams from descriptions and use correct notation.",
                    "4": "I confidently use geometric terminology in varied contexts.",
                    "5": "I consistently apply geometric language and diagrams to complex problems."
                }
            },
            {
                "title": "Ruler and compass constructions",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot accurately perform ruler and compass constructions.",
                    "2": "I perform basic constructions like perpendicular bisectors.",
                    "3": "I construct angles, including 60° angles, and solve loci problems.",
                    "4": "I confidently apply constructions to complex geometric scenarios.",
                    "5": "I use geometric constructions effectively for problem-solving."
                }
            },
            {
                "title": "Angle properties and parallel lines",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I do not understand basic angle properties.",
                    "2": "I identify basic angles at a point and straight lines.",
                    "3": "I confidently use alternate and corresponding angles on parallel lines.",
                    "4": "I derive and use angle sums in triangles and polygons accurately.",
                    "5": "I consistently solve complex problems using angle properties."
                }
            },
            {
                "title": "Properties of quadrilaterals and triangles",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle with identifying quadrilaterals and triangles.",
                    "2": "I know basic types and properties of quadrilaterals and triangles.",
                    "3": "I confidently derive properties of special quadrilaterals and triangles.",
                    "4": "I apply these properties effectively in varied contexts.",
                    "5": "I consistently use geometric properties to solve advanced problems."
                }
            },
            {
                "title": "Triangle congruence and similarity",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot apply congruence or similarity.",
                    "2": "I know basic congruence criteria for triangles.",
                    "3": "I apply congruence and similarity effectively in geometric reasoning.",
                    "4": "I confidently use triangle congruence, similarity, and Pythagoras’ theorem.",
                    "5": "I rigorously prove geometric results using congruence and similarity."
                }
            },
            {
                "title": "Transformations and congruence",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle with basic transformations.",
                    "2": "I identify congruent shapes through basic transformations.",
                    "3": "I confidently perform and interpret transformations including enlargements.",
                    "4": "I accurately describe combinations of rotations, reflections, translations.",
                    "5": "I effectively apply transformations to solve complex problems."
                }
            },
            {
                "title": "Circle theorems",
                "tier": "H",
                "weight": 1.4,
                "rubrics": {
                    "1": "I cannot use circle theorems.",
                    "2": "I know basic circle definitions and properties.",
                    "3": "I confidently apply standard circle theorems.",
                    "4": "I rigorously prove circle theorems and related geometric results.",
                    "5": "I consistently apply circle theorems to advanced geometric problems."
                }
            },
            {
                "title": "3D shapes and their properties",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I struggle with properties of 3D shapes.",
                    "2": "I identify faces, edges, and vertices of basic 3D shapes.",
                    "3": "I accurately interpret and construct plans and elevations of 3D shapes.",
                    "4": "I confidently solve problems involving complex 3D shapes.",
                    "5": "I effectively apply understanding of 3D shapes to solve advanced problems."
                }
            }
        ]
    },
    {
        "name": "Mensuration and Calculation",
        "category": "Geometry and Measures",
        "weight": 1.3,
        "subtopics": [
            {
                "title": "Standard units of measure",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle to use standard units accurately.",
                    "2": "I can use basic standard units for length, area, and volume.",
                    "3": "I confidently use a variety of standard units including mass, time, and money.",
                    "4": "I accurately apply units of measure to complex contexts.",
                    "5": "I consistently apply standard units to solve advanced measurement problems."
                }
            },
            {
                "title": "Measuring lengths and angles",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I cannot measure lengths or angles accurately.",
                    "2": "I measure line segments and basic angles.",
                    "3": "I interpret maps, scale drawings, and use bearings effectively.",
                    "4": "I confidently use three-figure bearings accurately.",
                    "5": "I consistently apply precise measurements in complex scenarios."
                }
            },
            {
                "title": "Calculating area and volume",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I do not know basic area or volume formulae.",
                    "2": "I calculate areas of simple shapes and volumes of cuboids.",
                    "3": "I accurately apply formulae for areas of triangles, parallelograms, trapezia, and volumes of prisms and cylinders.",
                    "4": "I confidently solve problems involving composite shapes.",
                    "5": "I effectively apply these formulae in advanced contextual problems."
                }
            },
            {
                "title": "Circles and composite shapes",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle to calculate perimeters and areas of circles.",
                    "2": "I calculate the circumference and area of circles.",
                    "3": "I confidently calculate areas of composite shapes and surface areas and volumes of spheres, pyramids, and cones.",
                    "4": "I accurately calculate arc lengths, sector angles, and areas.",
                    "5": "I consistently solve complex circle-related problems including frustums."
                }
            },
            {
                "title": "Congruence and similarity in measurement",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot relate lengths, areas, or volumes of similar figures.",
                    "2": "I recognise congruence and basic similarity.",
                    "3": "I accurately calculate lengths, areas, and volumes in similar figures.",
                    "4": "I confidently apply similarity concepts to solve complex problems.",
                    "5": "I consistently apply congruence and similarity to advanced measurement contexts."
                }
            },
            {
                "title": "Pythagoras' theorem and trigonometry",
                "tier": "H",
                "weight": 1.4,
                "rubrics": {
                    "1": "I struggle with Pythagoras' theorem and basic trigonometry.",
                    "2": "I apply Pythagoras' theorem to basic right-angled triangles.",
                    "3": "I confidently use sine, cosine, and tangent ratios to find lengths and angles.",
                    "4": "I accurately apply these trigonometric ratios to general triangles and three-dimensional figures.",
                    "5": "I effectively solve complex trigonometric problems in varied contexts."
                }
            },
            {
                "title": "Exact trigonometric values",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot recall exact trigonometric values.",
                    "2": "I recall basic values for sin and cos at key angles.",
                    "3": "I confidently recall exact values of sin, cos, and tan for standard angles.",
                    "4": "I accurately apply these values in various contexts.",
                    "5": "I consistently use exact values in complex calculations."
                }
            },
            {
                "title": "Sine and cosine rules",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand the sine or cosine rules.",
                    "2": "I apply the sine rule for simple problems.",
                    "3": "I confidently apply the sine and cosine rules to find unknown lengths and angles.",
                    "4": "I accurately calculate the area of triangles using $\frac{1}{2}ab\sin C$.",
                    "5": "I effectively solve advanced problems involving sine and cosine rules in varied contexts."
                }
            }
        ]
    },
    {
        "name": "Vectors",
        "category": "Geometry and Measures",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Translations as vectors",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I struggle to describe translations using vectors.",
                    "2": "I can represent simple translations as vectors.",
                    "3": "I confidently use 2D vector notation to describe translations.",
                    "4": "I accurately interpret complex translations represented by vectors.",
                    "5": "I effectively apply vector notation to solve advanced translation problems."
                }
            },
            {
                "title": "Vector arithmetic and geometric proofs",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot perform basic vector arithmetic.",
                    "2": "I add and subtract vectors and multiply by scalars in simple cases.",
                    "3": "I accurately perform arithmetic with vectors using column representations.",
                    "4": "I confidently use vectors to construct geometric arguments and proofs.",
                    "5": "I consistently apply vector arithmetic in advanced geometric contexts and proofs."
                }
            }
        ]
    },
    {
        "name": "Probability",
        "category": "Probability",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Recording and analysing outcomes",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I cannot record or analyse outcomes of probability experiments.",
                    "2": "I record outcomes in basic tables.",
                    "3": "I use frequency trees and tables to describe outcomes accurately.",
                    "4": "I confidently analyse outcomes and express probabilities as fractions, decimals, or percentages.",
                    "5": "I consistently analyse outcomes and probabilities across multiple representations."
                }
            },
            {
                "title": "Randomness and expected outcomes",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I struggle with understanding randomness or fairness.",
                    "2": "I understand fairness and equally likely events.",
                    "3": "I accurately calculate expected outcomes of single events.",
                    "4": "I calculate expected outcomes over multiple experiments.",
                    "5": "I confidently apply understanding of randomness to real-world situations."
                }
            },
            {
                "title": "Theoretical probability and the probability scale",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I struggle to relate relative frequency to probability.",
                    "2": "I understand the 0 to 1 probability scale.",
                    "3": "I relate expected frequencies to theoretical probabilities.",
                    "4": "I confidently interpret and describe probabilities using appropriate language.",
                    "5": "I apply this understanding across various probability contexts."
                }
            },
            {
                "title": "Exhaustive and mutually exclusive outcomes",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I cannot apply basic probability laws.",
                    "2": "I know probabilities of all outcomes in a sample space sum to 1.",
                    "3": "I understand and apply mutually exclusive event rules.",
                    "4": "I accurately apply these rules to multi-step problems.",
                    "5": "I consistently apply the laws of probability in complex scenarios."
                }
            },
            {
                "title": "Empirical and theoretical probability",
                "tier": "H",
                "weight": 1.2,
                "rubrics": {
                    "1": "I do not understand the difference between empirical and theoretical probability.",
                    "2": "I understand unbiased samples give good approximations of probabilities.",
                    "3": "I relate sample size to accuracy of prediction.",
                    "4": "I accurately compare empirical results to theoretical expectations.",
                    "5": "I apply this concept in real-life sampling scenarios."
                }
            },
            {
                "title": "Venn diagrams and systematic listing",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle with set notation and representation.",
                    "2": "I can use basic lists and tables to show outcomes.",
                    "3": "I confidently use Venn diagrams and tables to show outcomes.",
                    "4": "I use tree diagrams and systematic listing for combined events.",
                    "5": "I consistently construct and analyse complex probability structures."
                }
            },
            {
                "title": "Possibility spaces and theoretical probabilities",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I do not understand possibility spaces.",
                    "2": "I can construct basic possibility spaces.",
                    "3": "I calculate theoretical probabilities from simple grids.",
                    "4": "I confidently construct and use possibility spaces for combined experiments.",
                    "5": "I apply possibility spaces to complex probability situations."
                }
            },
            {
                "title": "Combined events and tree diagrams",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I cannot solve combined probability problems.",
                    "2": "I solve simple independent probability problems.",
                    "3": "I use tree diagrams to solve independent and dependent events.",
                    "4": "I apply probability rules for addition and multiplication appropriately.",
                    "5": "I solve multi-step problems involving combined probabilities with confidence."
                }
            },
            {
                "title": "Conditional probability",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand conditional probability.",
                    "2": "I understand the basics of conditional relationships in tables and diagrams.",
                    "3": "I calculate conditional probabilities using tree diagrams and Venn diagrams.",
                    "4": "I interpret two-way tables for conditional problems accurately.",
                    "5": "I confidently solve advanced problems involving conditional probability."
                }
            }
        ]
    },
    {
        "name": "Statistics",
        "category": "Statistics",
        "weight": 1.2,
        "subtopics": [
            {
                "title": "Sampling and inference",
                "tier": "F",
                "weight": 1.0,
                "rubrics": {
                    "1": "I do not understand sampling or inference.",
                    "2": "I understand what a sample is.",
                    "3": "I can infer simple properties of a population from a sample.",
                    "4": "I understand the limitations of sampling and inference.",
                    "5": "I confidently apply sampling to draw conclusions about populations."
                }
            },
            {
                "title": "Tables, charts and diagrams (categorical & discrete data)",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I struggle to create or interpret statistical diagrams.",
                    "2": "I interpret frequency tables, bar charts, and pictograms.",
                    "3": "I confidently use pie charts and vertical line charts for ungrouped data.",
                    "4": "I construct and interpret line graphs for time series data.",
                    "5": "I choose appropriate diagrams for different data types."
                }
            },
            {
                "title": "Diagrams for grouped and continuous data",
                "tier": "H",
                "weight": 1.3,
                "rubrics": {
                    "1": "I do not understand how to work with grouped data.",
                    "2": "I can interpret grouped data in basic charts.",
                    "3": "I construct histograms with equal class intervals and cumulative frequency graphs.",
                    "4": "I interpret and create diagrams with unequal class widths.",
                    "5": "I confidently use grouped and continuous data diagrams to support analysis."
                }
            },
            {
                "title": "Comparing data distributions",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I cannot compare data distributions.",
                    "2": "I use the mean, mode, and range for basic comparisons.",
                    "3": "I interpret box plots and use interquartile ranges.",
                    "4": "I confidently compare datasets using multiple statistical measures.",
                    "5": "I consistently apply statistical tools to analyse and compare real data sets."
                }
            },
            {
                "title": "Describing populations with statistics",
                "tier": "F",
                "weight": 1.1,
                "rubrics": {
                    "1": "I do not use statistics to describe populations.",
                    "2": "I understand basic measures like mean and range.",
                    "3": "I accurately describe a population using statistical measures.",
                    "4": "I interpret multiple statistics to understand population structure.",
                    "5": "I confidently apply statistical techniques to real-world populations."
                }
            },
            {
                "title": "Scatter graphs and correlation",
                "tier": "F",
                "weight": 1.2,
                "rubrics": {
                    "1": "I struggle to use scatter graphs.",
                    "2": "I can plot and interpret simple scatter graphs.",
                    "3": "I recognise correlation and draw lines of best fit.",
                    "4": "I make predictions and distinguish between correlation and causation.",
                    "5": "I confidently analyse trends, using interpolation and extrapolation while understanding their risks."
                }
            }
        ]
    }


    ]

    for topic in topics:
        add_topic_with_subtopics(topic["name"], topic["category"], topic["weight"], topic["subtopics"])