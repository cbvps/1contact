from flask import Flask, render_template, request, redirect, url_for

import uuid

app = Flask(__name__)

# Храним визитки в памяти (для MVP). Можно заменить на базу.
cards = {}


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        card_id = str(uuid.uuid4())[:8]  # короткий ID
        data = {
            "name": request.form["name"],
            "title": request.form["title"],
            "company": request.form["company"],
            "phone": request.form["phone"],
            "email": request.form["email"],
            "city": request.form["city"],
            "slogan": request.form["slogan"],
        }
        cards[card_id] = data
        return redirect(url_for("card", card_id=card_id))
    return render_template("form.html")


@app.route("/card/<card_id>")
def card(card_id):
    data = cards.get(card_id)
    if not data:
        return "Визитка не найдена", 404
    return render_template("card.html", data=data, card_id=card_id)


@app.route("/card/<card_id>/contact.vcf")
def download_vcf(card_id):
    data = cards.get(card_id)
    if not data:
        return "Визитка не найдена", 404

    vcard = f"""BEGIN:VCARD
VERSION:3.0
N:{data['name']};;;;
FN:{data['name']}
ORG:{data['company']}
TEL:{data['phone']}
EMAIL:{data['email']}
URL:{request.url_root}card/{card_id}
END:VCARD
"""
    return app.response_class(
        vcard,
        mimetype="text/vcard",
        headers={"Content-Disposition": f"attachment; filename={card_id}.vcf"},
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
