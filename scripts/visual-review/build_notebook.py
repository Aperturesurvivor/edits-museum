#!/usr/bin/env python3
"""Build notebooks/review.ipynb from notebooks/review_pipeline.py ("# %%" cells). Edit the .py, then re-run this."""
import json, os, re

root = os.path.join(os.path.dirname(__file__), "..", "..")
src = open(os.path.join(root, "notebooks", "review_pipeline.py")).read()
cells = []
for chunk in re.split(r"^# %%", src, flags=re.M)[1:]:
    head, _, body = chunk.partition("\n")
    if head.strip().startswith("[markdown]"):
        md = "\n".join(l[2:] if l.startswith("# ") else l.lstrip("#") for l in body.strip("\n").split("\n"))
        cells.append({"cell_type": "markdown", "metadata": {}, "source": md.splitlines(True)})
    else:
        code = body.strip("\n") + "\n"
        cells.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": code.splitlines(True)})
nb = {
    "nbformat": 4, "nbformat_minor": 0,
    "metadata": {
        "accelerator": "GPU",
        "colab": {"provenance": [], "gpuType": "A100", "machine_shape": "hm", "name": "Edits Museum: visual review"},
        "kernelspec": {"name": "python3", "display_name": "Python 3"},
        "language_info": {"name": "python"},
    },
    "cells": cells,
}
json.dump(nb, open(os.path.join(root, "notebooks", "review.ipynb"), "w"), indent=1)
print("cells:", len(cells))
