import subprocess
import tempfile
import os
import logging

def render_latex_to_pdf(latex_content, output_path):
    logging.info("🛠 Rendering LaTeX to PDF...")

    # Ensure LaTeX content is wrapped properly
    if r"\begin{document}" not in latex_content:
        latex_content = r"""\documentclass{article}
\usepackage{amsmath}
\begin{document}
""" + latex_content + r"""
\end{document}
"""

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "document.tex")
        logging.info("🔎 GPT-generated LaTeX:\n" + latex_content)

        # Write LaTeX to file
        with open(tex_path, "w") as f:
            f.write(latex_content)

        # Also save a copy for debugging
        with open("/tmp/debug_generated.tex", "w") as debug_file:
            debug_file.write(latex_content)
        logging.info(f"📄 LaTeX written to: {tex_path}")
        logging.info("📁 Backup saved to: /tmp/debug_generated.tex")

        try:
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", tex_path],
                cwd=tmpdir,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError as e:
            stderr_output = e.stderr.decode(errors="ignore") if e.stderr else "No stderr output"
            logging.error("❌ pdflatex failed. Stderr output below:")
            logging.error(stderr_output)
            raise RuntimeError("pdflatex failed", stderr_output)

        # Move PDF to target location
        generated_pdf = os.path.join(tmpdir, "document.pdf")
        if os.path.exists(generated_pdf):
            os.replace(generated_pdf, output_path)
            logging.info(f"✅ PDF successfully saved to: {output_path}")
        else:
            logging.error("❌ PDF was not generated.")
            raise RuntimeError("PDF file not found after pdflatex.")