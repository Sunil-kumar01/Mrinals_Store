import os
import sqlite3
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "mrinals.db"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

DEFAULT_SETTINGS = {
    "email": "admin@mrinalscreations.com",
    "password": "mrinal123",
    "name": "Mrinal's",
    "brand": "Creations",
    "upi": "14bbt1019@okicici",
    "contact": "14bbt1019@gmail.com",
    "cod": True,
}


def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_db()
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            short TEXT NOT NULL,
            long TEXT NOT NULL,
            image TEXT NOT NULL,
            upi TEXT NOT NULL
        );
        """
    )
    if connection.execute("SELECT COUNT(*) FROM settings").fetchone()[0] == 0:
        connection.executemany("INSERT INTO settings(key, value) VALUES (?, ?)", DEFAULT_SETTINGS.items())
    if connection.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
        source = BASE_DIR / "products.json"
        if source.exists():
            import json
            products = json.loads(source.read_text())
            connection.executemany(
                "INSERT INTO products(id, name, price, short, long, image, upi) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [(p["id"], p["name"], p["price"], p["short"], p["long"], p["image"], p.get("upi", DEFAULT_SETTINGS["upi"])) for p in products],
            )
    connection.commit()
    connection.close()


def settings_dict(connection):
    result = DEFAULT_SETTINGS.copy()
    result.update({row["key"]: row["value"] for row in connection.execute("SELECT key, value FROM settings")})
    result["cod"] = result["cod"] == "True" or result["cod"] == "true"
    return result


def product_dict(row):
    return dict(row)


@app.get("/api/products")
def products():
    connection = get_db()
    result = [product_dict(row) for row in connection.execute("SELECT * FROM products ORDER BY id")]
    connection.close()
    return jsonify(result)


@app.post("/api/login")
def login():
    payload = request.get_json(silent=True) or {}
    connection = get_db()
    current = settings_dict(connection)
    connection.close()
    return (jsonify({"ok": True}), 200) if payload.get("email") == current["email"] and payload.get("password") == current["password"] else (jsonify({"ok": False, "error": "Invalid login"}), 401)


@app.get("/api/settings")
def get_settings():
    connection = get_db()
    result = settings_dict(connection)
    connection.close()
    result.pop("password", None)
    return jsonify(result)


@app.put("/api/settings")
def update_settings():
    payload = request.get_json(silent=True) or {}
    connection = get_db()
    current = settings_dict(connection)
    for key in DEFAULT_SETTINGS:
        if key in payload and payload[key] != "":
            value = str(payload[key])
            connection.execute("INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)", (key, value))
    connection.commit()
    result = settings_dict(connection)
    connection.close()
    result.pop("password", None)
    return jsonify(result)


@app.post("/api/products")
@app.put("/api/products/<int:product_id>")
def save_product(product_id=None):
    data = request.form if request.form else (request.get_json(silent=True) or {})
    image = data.get("image", "")
    upload = request.files.get("imageFile")
    if upload and upload.filename:
        extension = Path(secure_filename(upload.filename)).suffix.lower() or ".jpg"
        filename = f"{uuid4().hex}{extension}"
        upload.save(UPLOAD_DIR / filename)
        image = f"/uploads/{filename}"
    if not image:
        image = "https://placehold.co/600x400?text=New+Creation"
    connection = get_db()
    values = (data.get("name", "New Creation"), int(data.get("price", 0)), data.get("short", ""), data.get("long", ""), image, data.get("upi", DEFAULT_SETTINGS["upi"]))
    if product_id:
        connection.execute("UPDATE products SET name=?, price=?, short=?, long=?, image=?, upi=? WHERE id=?", (*values, product_id))
    else:
        product_id = connection.execute("INSERT INTO products(name, price, short, long, image, upi) VALUES (?, ?, ?, ?, ?, ?)", values).lastrowid
    connection.commit()
    row = connection.execute("SELECT * FROM products WHERE id=?", (product_id,)).fetchone()
    connection.close()
    return jsonify(product_dict(row))


@app.delete("/api/products/<int:product_id>")
def delete_product(product_id):
    connection = get_db()
    connection.execute("DELETE FROM products WHERE id=?", (product_id,))
    connection.commit()
    connection.close()
    return ("", 204)


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
