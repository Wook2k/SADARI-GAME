// components/Ladder.jsx
import React, { useEffect, useRef, useState } from "react";

function Ladder({ groupId, names, results, onReset, onResultUpdate }) {
  const canvasRef = useRef(null);
  const [ladderMap, setLadderMap] = useState([]);
  const [finalResults, setFinalResults] = useState(() =>
    Array(names.length).fill("")
  );
  const [finalPositions, setFinalPositions] = useState(() =>
    Array(names.length).fill(null)
  );
  const [animating, setAnimating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const width = 500;
  const height = 400;
  const colGap = width / (names.length - 1 || 1);
  const rowCount = 10;
  const rowGap = height / rowCount;

  const generateLadder = () => {
    const map = Array.from({ length: rowCount }, () =>
      Array(names.length).fill(false)
    );
    for (let r = 0; r < rowCount; r++) {
      const col = Math.floor(Math.random() * (names.length - 1 || 1));
      if (names.length > 1) map[r][col] = true;
    }
    setLadderMap(map);
  };

  useEffect(() => {
    generateLadder();
    setFinalResults(Array(names.length).fill(""));
    setFinalPositions(Array(names.length).fill(null));
    setShowSummary(false);
  }, [names]);

  const followLadder = (startCol) => {
    let col = startCol;
    for (let r = 0; r < rowCount; r++) {
      if (col > 0 && ladderMap[r][col - 1]) col -= 1;
      else if (col < names.length - 1 && ladderMap[r][col]) col += 1;
    }
    return col;
  };

  const getPathPoints = (startCol) => {
    const points = [];
    let col = startCol;
    let x = col * colGap;
    let y = 0;
    points.push({ x, y });

    for (let r = 0; r < rowCount; r++) {
      y = r * rowGap;
      points.push({ x, y });

      if (col > 0 && ladderMap[r][col - 1]) {
        col -= 1;
        x = col * colGap;
        points.push({ x, y });
      } else if (col < names.length - 1 && ladderMap[r][col]) {
        col += 1;
        x = col * colGap;
        points.push({ x, y });
      }
    }
    points.push({ x, y: height });
    return points;
  };

  const drawLadder = () => {
    const canvas = canvasRef.current;
    if (!canvas || ladderMap.length === 0) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 세로선 그리기
    for (let i = 0; i < names.length; i++) {
      const x = i * colGap;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 가로선 그리기
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < names.length - 1; c++) {
        if (ladderMap[r][c]) {
          const x1 = c * colGap;
          const x2 = (c + 1) * colGap;
          const y = r * rowGap;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = "#888";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  };

  const animatePathAsync = (points, speed = 0.1) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve();
        return;
      }
      const ctx = canvas.getContext("2d");

      let progress = 0;
      let t = 0;

      function step() {
        drawLadder();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath();

        for (let i = 0; i < progress; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }

        if (progress < points.length - 1) {
          const p1 = points[progress];
          const p2 = points[progress + 1];
          const x = p1.x + (p2.x - p1.x) * t;
          const y = p1.y + (p2.y - p1.y) * t;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(x, y);
        }

        ctx.stroke();

        t += speed;
        if (t >= 1) {
          t = 0;
          progress++;
        }

        if (progress >= points.length - 1) {
          resolve();
          return;
        }

        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  };

  const handleClick = (index) => {
    if (animating) return;
    setAnimating(true);
    setShowSummary(false);

    const pathPoints = getPathPoints(index);

    animatePathAsync(pathPoints, 0.1).then(() => {
      const endCol = followLadder(index);
      setFinalResults((prev) => {
        const copy = [...prev];
        copy[index] = results[endCol];

        // 부모 컴포넌트에게 결과 업데이트 알림
        if (onResultUpdate) {
          onResultUpdate(groupId, copy);
        }

        return copy;
      });
      setFinalPositions((prev) => {
        const copy = [...prev];
        copy[index] = endCol;
        return copy;
      });
      setAnimating(false);
    });
  };

  const handleViewAll = async () => {
    if (animating) return;
    setAnimating(true);
    setShowSummary(false);

    for (let i = 0; i < names.length; i++) {
      const pathPoints = getPathPoints(i);
      await animatePathAsync(pathPoints, 0.15);

      const endCol = followLadder(i);
      setFinalResults((prev) => {
        const copy = [...prev];
        copy[i] = results[endCol];

        // 부모 컴포넌트에게 결과 업데이트 알림
        if (onResultUpdate) {
          onResultUpdate(groupId, copy);
        }

        return copy;
      });
      setFinalPositions((prev) => {
        const copy = [...prev];
        copy[i] = endCol;
        return copy;
      });
    }

    setAnimating(false);
  };

  const toggleSummary = () => {
    if (animating) return;
    setShowSummary((v) => !v);
  };

  useEffect(() => {
    drawLadder();
  }, [ladderMap]);

  return (
    <div style={{ position: "relative", width, margin: "auto" }}>
      <h3>사다리 결과</h3>

      <div style={{ position: "relative", height: 40, marginBottom: 10 }}>
        {names.map((name, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={animating}
            style={{
              position: "absolute",
              left: i * colGap - 20,
              top: 0,
              width: 40,
              fontSize: 12,
              padding: "6px 4px",
              whiteSpace: "nowrap",
            }}
            title={name}
          >
            {name}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid #ccc", display: "block", margin: "auto" }}
      />

      <div
        style={{
          position: "relative",
          height: 30,
          marginTop: 20,
          width,
          margin: "0 auto",
        }}
      >
        {finalResults.map((result, i) => {
          const pos = finalPositions[i];
          const leftPos = pos !== null ? pos * colGap - 25 : i * colGap - 25;
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                left: leftPos,
                width: 50,
                textAlign: "center",
                fontWeight: "700",
                fontSize: "1.1rem",
                color: result ? "#007ACC" : "#aaa",
                userSelect: "none",
              }}
              title={result}
            >
              {result || ""}
            </span>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button onClick={onReset} disabled={animating}>
          🔁 다시하기
        </button>
        <button onClick={handleViewAll} disabled={animating}>
          ▶️ 한번에보기
        </button>
        <button onClick={toggleSummary} disabled={animating}>
          📋 모아보기
        </button>
      </div>

      {showSummary && (
        <div
          style={{
            marginTop: 30,
            maxWidth: width,
            marginLeft: "auto",
            marginRight: "auto",
            border: "1px solid #ddd",
            padding: 10,
            borderRadius: 8,
            backgroundColor: "#f9f9f9",
            userSelect: "none",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 10, textAlign: "center" }}>
            결과 모아보기
          </h4>
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {names.map((name, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderBottom: "1px solid #ddd",
                  fontWeight: finalResults[i] ? "600" : "400",
                  color: finalResults[i] ? "#333" : "#999",
                }}
              >
                <span>{name}</span>
                <span>{finalResults[i] || "결과 대기중..."}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Ladder;
