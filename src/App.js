// App.js
import React, { useState } from "react";
import InputGroupForm from "./components/InputGroupForm";
import Ladder from "./components/Ladder";
import "./App.css";

function App() {
  const [groups, setGroups] = useState([
    { id: 1, names: ["", "", ""], results: ["", "", ""] },
  ]);
  const [started, setStarted] = useState(false);
  const [showAllSummary, setShowAllSummary] = useState(false);

  // 각 그룹별 개별 결과 저장용 상태 (인덱스별 결과)
  const [allFinalResults, setAllFinalResults] = useState({});

  const updateGroup = (id, updatedGroup) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedGroup } : g))
    );
  };

  const handleAddGroup = () => {
    setGroups((prev) => [
      ...prev,
      { id: Date.now(), names: [""], results: [""] },
    ]);
  };

  const handleRemoveGroup = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const allReady = groups.every(
    (g) => g.names.length && g.names.every(Boolean) && g.results.every(Boolean)
  );

  const handleStart = () => {
    setStarted(true);
    setShowAllSummary(false);
    setAllFinalResults({}); // 시작시 결과 초기화
  };

  const handleReset = () => {
    setGroups([
      { id: 1, names: ["", "", ""], results: ["", "", ""] },
    ]);
    setStarted(false);
    setShowAllSummary(false);
    setAllFinalResults({});
  };

  // 각 Ladder에서 결과를 전달받는 콜백 함수 (Ladder 컴포넌트에 props로 전달 예정)
  const handleGroupResultUpdate = (groupId, finalResults) => {
    setAllFinalResults((prev) => ({
      ...prev,
      [groupId]: finalResults,
    }));
  };

  return (
    <div className="app-container">
      {!started ? (
        <>
          <h2 className="app-title">그룹별 참가자와 결과 입력</h2>
          <div className="group-list">
            {groups.map((group) => (
              <InputGroupForm
                key={group.id}
                group={group}
                onUpdate={(updated) => updateGroup(group.id, updated)}
                onRemove={() => handleRemoveGroup(group.id)}
                canRemove={groups.length > 1}
              />
            ))}
          </div>
          <div className="buttons-row">
            <button onClick={handleAddGroup}>➕ 그룹 추가</button>
            <button onClick={handleStart} disabled={!allReady}>
              ▶️ 전체 사다리 시작
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="buttons-row" style={{ marginBottom: 30 }}>
            <button onClick={handleReset}>🔁 다시하기</button>
            <button onClick={() => setShowAllSummary((v) => !v)}>
              📋 그룹별 결과 {showAllSummary ? "숨기기" : "모아보기"}
            </button>
          </div>

          {!showAllSummary ? (
            groups.map((group, i) => (
              <div key={group.id} className="group-section">
                <h3 className="group-title">그룹 {i + 1}</h3>
                <Ladder
                  names={group.names}
                  results={group.results}
                  groupId={group.id}
                  onReset={handleReset}
                  onResultUpdate={handleGroupResultUpdate}
                />
              </div>
            ))
          ) : (
            <div className="summary-container">
              <h3 className="summary-title">전체 그룹 결과 모아보기</h3>
              {groups.map((group, i) => (
                <div key={group.id} className="summary-group">
                  <h4>그룹 {i + 1}</h4>
                  <ul className="summary-list">
                    {(allFinalResults[group.id] ?? []).length === 0 && (
                      <li className="empty">
                        사다리 실행 후 결과가 표시됩니다.
                      </li>
                    )}
                    {(allFinalResults[group.id] ?? []).map((res, idx) => (
                      <li key={idx}>
                        <span>{group.names[idx]}</span>
                        <span>{res || "결과 대기중..."}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
