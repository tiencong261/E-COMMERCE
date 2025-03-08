# intent_classifier.py
import torch
import torch.nn as nn
import torch.optim as optim
from transformers import BertTokenizer, BertModel
from sklearn.preprocessing import LabelEncoder
import pickle

# Khởi tạo các biến toàn cục
labels = ["sản phẩm", "điều khoản", "thông tin cửa hàng", "khác"]
label_encoder = LabelEncoder()
label_encoder.fit(labels)  # Fit label encoder với các nhãn

MODEL_NAME = "bert-base-uncased"
tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Hàm token hóa
def tokenize_texts(texts):
    tokens = tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt")
    del tokens["token_type_ids"]  # Bỏ `token_type_ids` để tránh lỗi
    return tokens

# Định nghĩa mô hình
class TransformerClassifier(nn.Module):
    def __init__(self, num_classes):
        super(TransformerClassifier, self).__init__()
        self.bert = BertModel.from_pretrained(MODEL_NAME)
        self.attention = nn.MultiheadAttention(embed_dim=768, num_heads=8)
        self.fc = nn.Linear(768, num_classes)
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_embedding = outputs.last_hidden_state[:, 0, :].unsqueeze(0)
        attn_output, _ = self.attention(cls_embedding, cls_embedding, cls_embedding)
        output = self.fc(self.dropout(attn_output.squeeze(0)))
        return output

# Hàm lưu và tải mô hình
def save_model(model, filename="model.pkl"):
    with open(filename, "wb") as f:
        pickle.dump(model, f)

def load_model(filename="model.pkl"):
    with open(filename, "rb") as f:
        model = pickle.load(f)
    return model.to(device)  # Đảm bảo mô hình được tải lên đúng thiết bị (CPU/GPU)

# Hàm dự đoán
def predict(text, model):
    model.eval()
    inputs = tokenize_texts([text])
    inputs = {key: val.to(device) for key, val in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_label = torch.argmax(outputs, dim=1).item()
    return label_encoder.inverse_transform([predicted_label])[0]