const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const upload = multer({ dest: "uploads/" });

// Change this to another model if needed (like "deepinsight/insightface")
const HF_MODEL = "serengil/face-recognition";

async function getEmbedding(imageBuffer) {
  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    imageBuffer,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
    }
  );
  return response.data;
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// Compare two uploaded images
router.post("/compare", upload.fields([{ name: "face1" }, { name: "face2" }]), async (req, res) => {
  try {
    const img1 = fs.readFileSync(req.files["face1"][0].path);
    const img2 = fs.readFileSync(req.files["face2"][0].path);

    const emb1 = await getEmbedding(img1);
    const emb2 = await getEmbedding(img2);

    const similarity = cosineSimilarity(emb1[0].embedding, emb2[0].embedding);

    res.json({
      similarity,
      match: similarity > 0.85 ? "✅ Faces Match" : "❌ Faces Do Not Match",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Face comparison failed" });
  }
});

module.exports = router;
