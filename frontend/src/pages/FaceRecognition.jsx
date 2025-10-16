import React, { useState } from "react";
import axios from "axios";

const FaceRecognition = () => {
  const [face1, setFace1] = useState(null);
  const [face2, setFace2] = useState(null);
  const [result, setResult] = useState("");

  const handleCompare = async () => {
    if (!face1 || !face2) return alert("Please upload both images");

    const formData = new FormData();
    formData.append("face1", face1);
    formData.append("face2", face2);

    try {
      const res = await axios.post("http://localhost:5002/api/face/compare", formData);
      setResult(`Similarity: ${res.data.similarity.toFixed(3)} → ${res.data.match}`);
    } catch (err) {
      console.error(err);
      setResult("Error comparing faces.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Face Recognition Test</h2>
      <div>
        <p>Upload Face 1:</p>
        <input type="file" accept="image/*" onChange={(e) => setFace1(e.target.files[0])} />
        {face1 && <img src={URL.createObjectURL(face1)} alt="face1" width="100" />}
      </div>
      <div>
        <p>Upload Face 2:</p>
        <input type="file" accept="image/*" onChange={(e) => setFace2(e.target.files[0])} />
        {face2 && <img src={URL.createObjectURL(face2)} alt="face2" width="100" />}
      </div>
      <button onClick={handleCompare}>Compare Faces</button>
      <p><strong>{result}</strong></p>
    </div>
  );
};

export default FaceRecognition;
