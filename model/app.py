import faiss
import json
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel
from sentence_transformers import CrossEncoder
from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS, cross_origin
import os
from chatbot import load_model, predict, TransformerClassifier

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = Flask(__name__)
CORS(app)  # Cho phép CORS để frontend truy cập API

# 🔹 Load API Key của Gemini
genai.configure(api_key="AIzaSyAmLesw2keGhIrZPMEyYJUs1PUqIidIWFU")
model = genai.GenerativeModel("gemini-2.0-flash")
classify_model = load_model("model.pkl")

# 🔹 Load dữ liệu sản phẩm, thông tin cửa hàng, điều khoản
with open("data/products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

with open("data/store_info.json", "r", encoding="utf-8") as f:
    intro_info = json.load(f)

with open("data/terms.json", "r", encoding="utf-8") as f:
    terms_info = json.load(f)

# 🔹 Khởi tạo tokenizer và model embedding
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model_emb = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def encode_text(text):
    """Mã hóa văn bản thành vector embedding sử dụng token [CLS]."""
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        output = model_emb(**inputs).last_hidden_state[:, 0, :].cpu().numpy()  # Lấy token [CLS]
    return output

# 🔹 Kiểm tra và tải FAISS Index
faiss_index_path = "faiss_index.bin"

if os.path.exists(faiss_index_path):
    index = faiss.read_index(faiss_index_path)
    print("✅ FAISS Index loaded từ file.")
else:
    print("⚠️ Không tìm thấy FAISS Index. Đang tạo mới...")
    product_vectors = np.vstack([
        encode_text(f"{p['name'].lower()} {p['category'].lower()} {p['description'].lower()}")
        for p in products
    ])
    index = faiss.IndexFlatL2(product_vectors.shape[1])
    index.add(product_vectors)
    faiss.write_index(index, faiss_index_path)  # Lưu index để sử dụng lại
    print("✅ FAISS Index đã được lưu.")

print(f"📌 FAISS index size: {index.ntotal}")

def rerank_products(query, product_list):
    """Sắp xếp lại kết quả tìm kiếm dựa trên điểm số của mô hình reranker."""
    scores = reranker.predict([(query, p["name"] + " " + p["description"] + " " + p["category"]) for p in product_list])
    sorted_products = [p for _, p in sorted(zip(scores, product_list), reverse=True)]
    return sorted_products[0] if sorted_products else None  # Tránh lỗi rỗng

def search_product(query):
    """Tìm kiếm sản phẩm phù hợp với truy vấn của người dùng."""
    query_vector = encode_text(query.lower())  # CHUYỂN QUERY THÀNH CHỮ THƯỜNG
    _, top_k = index.search(query_vector, k=5)
    
    if top_k[0][0] == -1:  # Nếu không tìm thấy kết quả
        return None
    
    top_products = [products[i] for i in top_k[0]]
    return rerank_products(query, top_products)

def search_terms(query):
    """Tìm điều khoản phù hợp với câu hỏi của người dùng."""
    query_lower = query.lower()
    for term in terms_info:
        if term["title"].lower() in query_lower:
            return term
    return None

def classify_question(user_input):
    text = user_input
    result = predict(text, classify_model)
    print(result)
    return result

@app.route("/chat", methods=["POST"])
@cross_origin()
def chat():
    """Xử lý chat từ người dùng."""
    data = request.json
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "Vui lòng nhập câu hỏi!"})

    # 🔹 Phân loại câu hỏi
    category = classify_question(user_message)

    if category == "sản phẩm":
        best_match = search_product(user_message)
        if best_match:
            context = f"Sản phẩm liên quan: {best_match['name']}, Giá: {best_match['price']}, Mô tả: {best_match['description']}."
        else:
            context = "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp."
    elif category == "thông tin cửa hàng":
        context = (
            f" **{intro_info['name']}**\n"
            f" Địa chỉ: {intro_info['location']}\n"
            f" Giờ mở cửa: {intro_info['open_hours']}\n"
            f" Liên hệ: {intro_info['contact']}\n"
            f" {intro_info['description']}"
        )
    elif category == "chào hỏi":
        context = f"Xin chào! 😊 {intro_info['description']}"
    elif category == "điều khoản":
        term = search_terms(user_message)
        if term:
            context = f"📌 **{term['title']}**\n\n{term['content']}"
        else:
            context = "Xin lỗi, tôi không tìm thấy điều khoản phù hợp với câu hỏi của bạn."
    else:
        return jsonify({"reply": "Xin lỗi, câu hỏi của bạn nằm ngoài phạm vi hỗ trợ của hệ thống."})

    # 🔹 Gửi context vào Gemini API
    final_prompt = f"{context}\nCâu hỏi của khách hàng: {user_message}\nTrả lời một cách thân thiện."
    response = model.generate_content(final_prompt)

    return jsonify({"reply": response.text.replace("\n", "<br>")})

if __name__ == "__main__":
    app.run(debug=True)
