import React from "react";
import "./InputGroupForm.css";

function InputGroupForm({ group, onUpdate, onRemove, canRemove }) {
  const { names, results } = group;

  const handleChange = (index, value, isName = true) => {
    const list = isName ? [...names] : [...results];
    list[index] = value;
    if (isName) {
      onUpdate({ names: list });
    } else {
      onUpdate({ results: list });
    }
  };

  const handleAdd = () => {
    onUpdate({
      names: [...names, ""],
      results: [...results, ""],
    });
  };

  const handleRemove = (index) => {
    const newNames = [...names];
    const newResults = [...results];
    newNames.splice(index, 1);
    newResults.splice(index, 1);
    onUpdate({ names: newNames, results: newResults });
  };

  const isReady =
    names.length > 0 &&
    names.every(Boolean) &&
    results.every(Boolean);

  return (
    <div className="input-group-wrapper">
      {canRemove && (
        <button
          onClick={onRemove}
          className="input-group-remove-btn"
          title="그룹 삭제"
        >
          ❌
        </button>
      )}

      <h4>참가자와 결과 입력</h4>

      {names.map((_, i) => (
        <div key={i} className="input-row">
          <input
            placeholder={`참가자 ${i + 1}`}
            value={names[i]}
            onChange={(e) => handleChange(i, e.target.value, true)}
            className="input-text"
          />
          <input
            placeholder={`결과 ${i + 1}`}
            value={results[i]}
            onChange={(e) => handleChange(i, e.target.value, false)}
            className="input-text"
          />
          {names.length > 1 && (
            <button
              onClick={() => handleRemove(i)}
              className="input-remove-btn"
              title="참가자 삭제"
            >
              ❌
            </button>
          )}
        </div>
      ))}

      <button
        onClick={handleAdd}
        disabled={!isReady}
        className="btn-add-participant"
      >
        ➕ 참가자 추가
      </button>
    </div>
  );
}

export default InputGroupForm;
