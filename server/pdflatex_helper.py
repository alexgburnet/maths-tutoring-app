import subprocess
import tempfile
import os
import logging

def render_latex_to_pdf(latex_code, output_path):
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_file = os.path.join(tmpdir, "document.tex")
        with open(tex_file, "w") as f:
            f.write(latex_code)

        logging.info(f"📘 Writing LaTeX to: {tex_file}")

        try:
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", tex_file],
                cwd=tmpdir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )

            pdf_path = os.path.join(tmpdir, "document.pdf")
            os.rename(pdf_path, output_path)
            logging.info(f"✅ PDF generated at: {output_path}")

        except subprocess.CalledProcessError as e:
            stderr_output = e.stderr.decode().strip() or "No stderr output"
            logging.error("❌ pdflatex failed. Stderr output below:")
            logging.error(stderr_output)

            # Read the .log file for LaTeX-specific errors
            log_path = os.path.join(tmpdir, "document.log")
            if os.path.exists(log_path):
                with open(log_path) as log_file:
                    log_content = log_file.read()
                    logging.error("📄 LaTeX log file content:")
                    logging.error(log_content[-1000:])  # Show last part (where errors usually are)

            raise RuntimeError("pdflatex failed", stderr_output)