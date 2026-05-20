from flask import Flask, render_template, request, jsonify
from supabase import create_client # type: ignore
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

app = Flask(__name__)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
PRODUCT_BUCKET = os.getenv("PRODUCT_BUCKET")
CATEGORY_BUCKET = os.getenv("CATEGORY_BUCKET")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# ---------------------------
# HOME PAGE
# ---------------------------
@app.route('/')
def home():

    products_response = (
        supabase
        .table("products")
        .select("*, categories(name)")
        .order("id", desc=True)
        .execute()
    )

    categories_response = (
        supabase
        .table("categories")
        .select("*")
        .order("id", desc=True)
        .execute()
    )

    products = products_response.data
    categories = categories_response.data

    return render_template(
        "index.html",
        products=products,
        categories=categories
    )


# ---------------------------
# ADD CATEGORY
# ---------------------------
@app.route('/add-category', methods=['POST'])
def add_category():

    try:

        name = request.form.get("name")
        slug = request.form.get("slug")

        image = request.files.get("image")

        image_url = None

        if image:

            image_name = f"category-{uuid.uuid4()}-{image.filename}"

            supabase.storage.from_(CATEGORY_BUCKET).upload(
                image_name,
                image.read(),
                {"content-type": image.content_type}
            )

            image_url = (
                f"{SUPABASE_URL}/storage/v1/object/public/"
                f"{CATEGORY_BUCKET}/{image_name}"
            )

        supabase.table("categories").insert({
            "name": name,
            "slug": slug,
            "image_url": image_url
        }).execute()

        return jsonify({
            "success": True,
            "message": "Category added successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })


# ---------------------------
# ADD PRODUCT
# ---------------------------
@app.route('/add-product', methods=['POST'])
def add_product():

    try:

        title = request.form.get('title')
        description = request.form.get('description')
        price = request.form.get('price')
        discount_price = request.form.get('discount_price')
        category_id = request.form.get('category_id')

        image = request.files.get('image')

        image_name = f"{uuid.uuid4()}-{image.filename}"

        supabase.storage.from_(PRODUCT_BUCKET).upload(
            image_name,
            image.read(),
            {"content-type": image.content_type}
        )

        image_url = (
            f"{SUPABASE_URL}/storage/v1/object/public/"
            f"{PRODUCT_BUCKET}/{image_name}"
        )

        supabase.table("products").insert({
            "title": title,
            "description": description,
            "price": price,
            "discont_price": discount_price,
            "image_url": image_url,
            "category_id": category_id
        }).execute()

        return jsonify({
            "success": True,
            "message": "Product added successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })


# ---------------------------
# DELETE PRODUCT
# ---------------------------
@app.route('/delete-product/<int:id>', methods=['DELETE'])
def delete_product(id):

    try:

        supabase.table("products").delete().eq("id", id).execute()

        return jsonify({
            "success": True
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)