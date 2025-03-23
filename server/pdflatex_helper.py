import os
import subprocess
import tempfile
import shutil

def render_latex_to_pdf(latex_body, output_path):
    latex_document = r"""\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{geometry}
\geometry{margin=1in}
\begin{document}
\section*{Follow-up Questions}
""" + latex_body + "\n\\end{document}"

    with tempfile.TemporaryDirectory() as tempdir:
        tex_path = os.path.join(tempdir, "document.tex")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_document)

        try:
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", tex_path],
                cwd=tempdir,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        except subprocess.CalledProcessError as e:
            raise RuntimeError("pdflatex failed", e.stderr.decode())

        generated_pdf = os.path.join(tempdir, "document.pdf")
        if os.path.exists(generated_pdf):
            shutil.move(generated_pdf, output_path)
        else:
            raise FileNotFoundError("PDF was not generated")