import subprocess
import tempfile
import os
import logging

def render_latex_to_pdf(latex_content, output_path):
    logging.info("🛠 Rendering LaTeX to PDF...")

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "document.tex")

        # Write raw LaTeX content to temp file
        with open(tex_path, "w") as f:
            f.write(latex_content)

        # Optional debug file
        with open("/tmp/debug_generated.tex", "w") as debug_file:
            debug_file.write(latex_content)
        logging.info(f"📄 LaTeX written to: {tex_path}")
        logging.info("📁 Debug backup saved to: /tmp/debug_generated.tex")

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

        # Move resulting PDF to output_path
        generated_pdf = os.path.join(tmpdir, "document.pdf")
        if os.path.exists(generated_pdf):
            os.replace(generated_pdf, output_path)
            logging.info(f"✅ PDF successfully saved to: {output_path}")
        else:
            logging.error("❌ PDF was not generated.")
            raise RuntimeError("PDF file not found after pdflatex.")