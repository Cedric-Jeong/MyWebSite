// ─────────────────────────────────────────────────────────────────
//  주영이의 일기 - 프론트엔드 (App.jsx)
//  React + Tailwind CSS + 백엔드 AI 요약 연동
//
//  설치 방법:
//    npx create-react-app cedric-frontend
//    cd cedric-frontend
//    npm install
//    npm start
//
//  ※ Tailwind 설치는 하단 주석 참고
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";

// ── API 베이스 URL (백엔드 주소) ──────────────────────────────────
const API_BASE = "http://localhost:4000";

// ── 색상 테마 (인라인 스타일용) ──────────────────────────────────
const C = {
  green: "#2F5D50",
  greenLight: "#6FAF7B",
  ivory: "#F5F1E8",
  brown: "#8B6B4A",
  text: "#2B2B2B",
  cardGreen: "#EFF7F0",
  border: "rgba(111,175,123,0.25)",
};

// ────────────────────────────────────────────────────────────────
//  훅: AI 요약 호출
// ────────────────────────────────────────────────────────────────
function useAISummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 개인 생각 요약
  async function summarizeThought(text) {
    if (!text || text.trim().length < 10) {
      setError("텍스트가 너무 짧습니다. 조금 더 써주세요.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "서버 오류가 발생했습니다.");
      return data.summary;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // 방문자 메시지 일괄 요약
  async function summarizeVisitors(messages) {
    if (!messages || messages.length === 0) {
      setError("요약할 방문자 메시지가 없습니다.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/summarize-visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "서버 오류가 발생했습니다.");
      return data.summary;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, summarizeThought, summarizeVisitors };
}

// ────────────────────────────────────────────────────────────────
//  컴포넌트: 네비게이션
// ────────────────────────────────────────────────────────────────
function Nav({ currentPage, setPage }) {
  const links = [
    { id: "home", label: "홈" },
    { id: "thoughts", label: "내 생각" },
    { id: "visitors", label: "방명록" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(245,241,232,0.94)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 2rem",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* 로고 */}
      <div
        onClick={() => setPage("home")}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
      >
        <span
          style={{
            width: 18, height: 18,
            background: C.green,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            display: "inline-block",
          }}
        />
        <span style={{ fontFamily: "Georgia, serif", fontSize: 20, color: C.green }}>
          주영이의 일기
        </span>
      </div>

      {/* 메뉴 */}
      <div style={{ display: "flex", gap: 4 }}>
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setPage(link.id)}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontFamily: "inherit",
              background: currentPage === link.id ? C.green : "transparent",
              color: currentPage === link.id ? "white" : C.text,
              opacity: currentPage === link.id ? 1 : 0.65,
              transition: "all 0.2s",
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────────
//  컴포넌트: 진행도 바
// ────────────────────────────────────────────────────────────────
function ProgressBar({ icon, label, percent, note }) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
          <span
            style={{
              width: 28, height: 28,
              background: C.cardGreen,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15,
            }}
          >
            {icon}
          </span>
          {label}
        </div>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600, color: C.green }}>
          {percent}%
        </span>
      </div>
      <div style={{ background: C.cardGreen, borderRadius: 8, height: 8, overflow: "hidden" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 8,
            background: `linear-gradient(90deg, ${C.greenLight}, ${C.green})`,
          }}
        />
      </div>
      {note && (
        <p style={{ fontSize: 11.5, color: C.brown, opacity: 0.7, marginTop: 6 }}>{note}</p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  페이지: 홈
// ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem 3rem" }}>

      {/* 히어로 */}
      <div style={{ textAlign: "center", padding: "68px 1rem 52px" }}>
        <span
          style={{
            display: "inline-block", fontSize: 11.5, color: C.brown,
            background: "rgba(139,107,74,0.1)", padding: "4px 14px",
            borderRadius: 20, marginBottom: 20,
          }}
        >
          ✦ 오늘의 생각
        </span>
        <h1
          style={{
            fontFamily: "Georgia, serif", fontSize: "clamp(24px, 4vw, 38px)",
            lineHeight: 1.5, color: C.green, marginBottom: 16, wordBreak: "keep-all",
          }}
        >
          "나만의 웹사이트 만들기"
        </h1>
        <p style={{ fontSize: 14.5, color: C.brown, opacity: 0.85, marginBottom: 28, wordBreak: "keep-all" }}>
          이곳은 당신의 조용한 성장 공간입니다.
        </p>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 18px", borderRadius: 20,
            background: C.cardGreen, border: `1px solid ${C.border}`,
            fontSize: 13, color: C.green,
          }}
        >
          <span
            style={{
              width: 7, height: 7, background: C.greenLight,
              borderRadius: "50%", animation: "pulse 2s infinite",
            }}
          />
          {today}
        </div>
      </div>

      {/* 삶의 진행도 */}
      <SectionTitle>삶의 진행도</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 48 }}>
        <ProgressBar icon="🙏" label="신앙" percent={74} note="아침 묵상 연속 18일째" />
        <ProgressBar icon="📖" label="공부" percent={61} note="올해 3권 완독 · 2권 읽는 중" />
        <ProgressBar icon="🤝" label="관계" percent={83} note="이번 달 깊은 대화 7번" />
        <ProgressBar icon="🌱" label="자기계발" percent={55} note="습관 4개 추적 중" />
      </div>

      {/* AI 요약 카드 */}
      <SectionTitle>AI 요약</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 48 }}>
        <AISummaryCard
          title="내 생각 요약"
          content="이번 주 글에는 깊은 집중에 대한 조용한 갈망이 담겨 있습니다. 산만함과 씨름하면서도 감사함으로 돌아오는 흐름이 반복됩니다."
        />
        <AISummaryCard
          title="방문자 요약"
          content="이번 주 세 분이 따뜻한 말을 남겨 주셨습니다. 신앙과 창조성의 주제가 많이 공명됐습니다."
        />
      </div>

      {/* 카테고리 */}
      <SectionTitle>카테고리</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 13 }}>
        {[
          { icon: "🎸", name: "어쿠스틱 기타", count: "12개의 기록" },
          { icon: "📜", name: "성경", count: "34개의 기록" },
          { icon: "✍️", name: "글쓰기", count: "27개의 기록" },
          { icon: "💻", name: "컴퓨터", count: "19개의 기록" },
        ].map((cat) => (
          <CategoryCard key={cat.name} {...cat} onClick={() => setPage("thoughts")} />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  페이지: 내 생각 (AI 요약 기능 핵심 페이지)
// ────────────────────────────────────────────────────────────────
function ThoughtsPage() {
  const [inputText, setInputText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [savedThoughts, setSavedThoughts] = useState(SAMPLE_THOUGHTS);

  const { loading, error, summarizeThought } = useAISummary();

  // AI 요약 버튼 클릭
  async function handleSummarize() {
    setAiResult(null);
    const summary = await summarizeThought(inputText);
    if (summary) setAiResult(summary);
  }

  // 저장 버튼 클릭
  function handleSave() {
    if (!inputText.trim()) return;
    const newThought = {
      id: Date.now(),
      text: inputText.trim(),
      date: new Date().toLocaleString("ko-KR"),
      tag: "새 기록",
      summary: aiResult || null,
    };
    setSavedThoughts([newThought, ...savedThoughts]);
    setInputText("");
    setAiResult(null);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 2rem 3rem" }}>
      <SectionTitle>내 생각</SectionTitle>

      {/* 입력 카드 */}
      <div
        style={{
          background: "white", border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 22, marginBottom: 22,
        }}
      >
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="자유롭게 생각을 써 내려가세요... 판단 없이, 있는 그대로."
          rows={6}
          style={{
            width: "100%", border: "none", outline: "none", resize: "vertical",
            fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.8,
            color: C.text, background: "transparent",
          }}
        />

        {/* AI 결과 표시 영역 */}
        {(loading || error || aiResult) && (
          <div
            style={{
              marginTop: 12, padding: "12px 16px",
              background: C.cardGreen, borderLeft: `3px solid ${C.greenLight}`,
              borderRadius: "0 12px 12px 0",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.brown, fontSize: 13 }}>
                <Spinner />
                AI가 생각을 정리하고 있어요...
              </div>
            )}
            {error && !loading && (
              <p style={{ color: "#c0392b", fontSize: 13 }}>⚠️ {error}</p>
            )}
            {aiResult && !loading && (
              <p style={{ fontSize: 13.5, color: C.green, lineHeight: 1.75 }}>
                ✦ {aiResult}
              </p>
            )}
          </div>
        )}

        <div style={{ height: 1, background: C.border, margin: "14px 0" }} />

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={handleSummarize}
            disabled={loading || !inputText.trim()}
            style={{
              background: "transparent", color: loading ? "#aaa" : C.green,
              border: `1.5px solid ${loading ? "#ccc" : C.green}`,
              padding: "10px 20px", borderRadius: 12,
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 500,
              cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "요약 중..." : "✦ AI로 요약하기"}
          </button>
          <button
            onClick={handleSave}
            disabled={!inputText.trim()}
            style={{
              background: inputText.trim() ? C.green : "#aaa",
              color: "white", border: "none",
              padding: "11px 22px", borderRadius: 12,
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 500,
              cursor: inputText.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            저장하기 →
          </button>
        </div>
      </div>

      {/* 이전 기록 목록 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 13.5, color: C.brown, opacity: 0.8 }}>이전 기록들</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {savedThoughts.map((thought) => (
        <ThoughtItem key={thought.id} thought={thought} />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  페이지: 방명록
// ────────────────────────────────────────────────────────────────
function VisitorsPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [visitors, setVisitors] = useState(SAMPLE_VISITORS);
  const [visitorSummary, setVisitorSummary] = useState(null);

  const { loading, error, summarizeVisitors } = useAISummary();

  function handleSubmit() {
    if (!name.trim() || !message.trim()) return;
    const newVisitor = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      time: "방금 전",
    };
    setVisitors([newVisitor, ...visitors]);
    setName("");
    setMessage("");
  }

  // 방문자 전체 메시지 AI 요약
  async function handleSummarizeAll() {
    setVisitorSummary(null);
    const messages = visitors.map((v) => v.message);
    const summary = await summarizeVisitors(messages);
    if (summary) setVisitorSummary(summary);
  }

  const avatarColors = ["#6FAF7B", "#8B6B4A", "#2F5D50", "#5C7A5A", "#4A8C6F"];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 2rem 3rem" }}>
      <SectionTitle>방명록</SectionTitle>

      {/* 메시지 입력 카드 */}
      <div
        style={{
          background: "white", border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 22, marginBottom: 26,
        }}
      >
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, color: C.green, marginBottom: 14 }}>
          메시지를 남겨주세요
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (닉네임도 좋아요)"
          style={inputStyle}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="이 공간이 당신에게 어떤 의미인지 편하게 적어주세요..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", justifyContent: "space-end" }}>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !message.trim()}
            style={{
              background: name.trim() && message.trim() ? C.green : "#aaa",
              color: "white", border: "none",
              padding: "11px 22px", borderRadius: 12,
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 500,
              cursor: name.trim() && message.trim() ? "pointer" : "not-allowed",
            }}
          >
            메시지 남기기 →
          </button>
        </div>
      </div>

      {/* 방문자 AI 요약 버튼 */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={handleSummarizeAll}
          disabled={loading || visitors.length === 0}
          style={{
            background: "transparent", color: loading ? "#aaa" : C.green,
            border: `1.5px solid ${loading ? "#ccc" : C.green}`,
            padding: "9px 18px", borderRadius: 12,
            fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "요약 중..." : `✦ 방문자 ${visitors.length}명 메시지 AI 요약`}
        </button>

        {(visitorSummary || error) && (
          <div
            style={{
              marginTop: 12, padding: "12px 16px",
              background: C.cardGreen, borderLeft: `3px solid ${C.greenLight}`,
              borderRadius: "0 12px 12px 0",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {error && <p style={{ color: "#c0392b", fontSize: 13 }}>⚠️ {error}</p>}
            {visitorSummary && (
              <p style={{ fontSize: 13.5, color: C.green, lineHeight: 1.75 }}>
                ✦ {visitorSummary}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 방문자 목록 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 13.5, color: C.brown, opacity: 0.8 }}>방문해주신 분들</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {visitors.map((v, i) => (
        <div
          key={v.id}
          style={{
            background: "white", border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "15px 18px", marginBottom: 11,
            display: "flex", gap: 13, alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: avatarColors[i % avatarColors.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}
          >
            {v.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>{v.name}</div>
            <div style={{ fontSize: 13, opacity: 0.72, lineHeight: 1.6, wordBreak: "keep-all" }}>
              {v.message}
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.brown, opacity: 0.6, whiteSpace: "nowrap" }}>
            {v.time}
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  소형 컴포넌트들
// ────────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 600, color: C.green, whiteSpace: "nowrap" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function AISummaryCard({ title, content }) {
  return (
    <div
      style={{
        background: "white", border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 22, position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.greenLight}, ${C.green})` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: C.green, background: C.cardGreen, padding: "3px 10px", borderRadius: 12, border: `1px solid ${C.border}` }}>
          ✦ AI
        </span>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 15, color: C.green }}>{title}</h3>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.75, opacity: 0.8, wordBreak: "keep-all" }}>{content}</p>
    </div>
  );
}

function CategoryCard({ icon, name, count, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.green : "white",
        border: `1px solid ${hovered ? C.green : C.border}`,
        borderRadius: 18, padding: "20px 14px", textAlign: "center",
        cursor: "pointer", transition: "all 0.22s",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      <div style={{ width: 44, height: 44, background: hovered ? "rgba(255,255,255,0.2)" : C.cardGreen, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 10px" }}>
        {icon}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: hovered ? "white" : C.text, marginBottom: 3 }}>{name}</div>
      <div style={{ fontSize: 11.5, color: hovered ? "rgba(255,255,255,0.8)" : C.brown }}>{count}</div>
    </div>
  );
}

function ThoughtItem({ thought }) {
  return (
    <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 11.5, color: C.brown, opacity: 0.7 }}>{thought.date}</span>
        <span style={{ fontSize: 11, color: C.green, background: C.cardGreen, padding: "2px 10px", borderRadius: 10, border: `1px solid ${C.border}` }}>
          {thought.tag}
        </span>
      </div>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 14.5, lineHeight: 1.8, opacity: 0.85, wordBreak: "keep-all" }}>
        {thought.text}
      </p>
      {thought.summary && (
        <div style={{ background: C.cardGreen, borderLeft: `3px solid ${C.greenLight}`, borderRadius: "0 12px 12px 0", padding: "9px 13px", marginTop: 10, fontSize: 12.5, color: C.green, lineHeight: 1.65, wordBreak: "keep-all" }}>
          ✦ {thought.summary}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 14, height: 14,
        border: "2px solid #ddd",
        borderTopColor: C.green,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────────
//  공유 스타일
// ────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "11px 15px",
  fontFamily: "inherit",
  fontSize: 13.5,
  color: C.text,
  background: C.ivory,
  outline: "none",
  marginBottom: 10,
  display: "block",
};

// ────────────────────────────────────────────────────────────────
//  샘플 데이터
// ────────────────────────────────────────────────────────────────
const SAMPLE_THOUGHTS = [
  {
    id: 1,
    text: "오늘은 평소보다 더 오래 빈 페이지와 마주 앉아 있었다. 서두르지 않았다. 글을 쓰기 전의 침묵도 글쓰기의 일부라는 걸 깨달았다.",
    date: "2026년 4월 4일 · 오후 10:32",
    tag: "글쓰기",
    summary: "창작의 고요함을 생산적인 공간으로 받아들이는 법을 배우고 있습니다.",
  },
  {
    id: 2,
    text: "오늘 아침 시편 23편을 읽었다. '잔잔한 물가'라는 구절이 마음에 걸렸다. 요즘 너무 불안했는데, 그런 고요함이 그립다.",
    date: "2026년 4월 3일 · 오전 7:18",
    tag: "신앙",
    summary: "영적 갈망에 뿌리를 둔 내면의 평화에 대한 소망이 담겨 있습니다.",
  },
];

const SAMPLE_VISITORS = [
  { id: 1, name: "지연", message: "고요함에 대한 글이 정말 감동이었어요. 저도 요즘 소음 속에서 조용함을 찾으려 애쓰고 있거든요.", time: "2시간 전" },
  { id: 2, name: "민호", message: "이 페이지 때문에 저도 일기를 시작했어요. 진행도 바가 특히 동기부여가 됐습니다!", time: "어제" },
  { id: 3, name: "서영", message: "기타 이야기 읽고 오랫동안 손도 안 댔던 우쿨렐레를 꺼냈어요. 계속 써주세요.", time: "2일 전" },
];

// ────────────────────────────────────────────────────────────────
//  CSS 애니메이션 (전역)
// ────────────────────────────────────────────────────────────────
const globalStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  body { background: #F5F1E8; margin: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
  * { box-sizing: border-box; }
  textarea, input { font-family: inherit; }
`;

// ────────────────────────────────────────────────────────────────
//  메인 App 컴포넌트
// ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <>
      <style>{globalStyles}</style>
      <Nav currentPage={currentPage} setPage={setCurrentPage} />
      {currentPage === "home" && <HomePage setPage={setCurrentPage} />}
      {currentPage === "thoughts" && <ThoughtsPage />}
      {currentPage === "visitors" && <VisitorsPage />}
    </>
  );
}
