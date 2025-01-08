"use client";

import React, { useState, useEffect } from "react";
import { getCookie, setCookie } from "./cookies";
import { fetchPopupList } from "../admin/notices/fetchPopups/page";

export default function HomePopup() {
  const [visiblePopups, setVisiblePopups] = useState([]);

  useEffect(() => {
    const cookie = getCookie("hidePopup");
    if (!cookie) {
      fetchPopupData();
    }
  }, []);

  const fetchPopupData = async () => {
    try {
      const data = await fetchPopupList();
      if (data && data.length > 0) {
        // '표시' 상태인 팝업 필터링
        const activePopups = data.filter((popup) => popup.is_hidden === "표시");
        setVisiblePopups(activePopups); // 활성 팝업 리스트 설정
      }
    } catch (error) {
      console.error("Error fetching popup data:", error);
    }
  };

  const handleClose = (popupIdx) => {
    // 특정 팝업만 닫기
    setVisiblePopups((prevPopups) =>
      prevPopups.filter((popup) => popup.popup_idx !== popupIdx)
    );
  };

  const handleDoNotShowToday = () => {
    // 모든 팝업 숨김 설정
    setCookie("hidePopup", "true", 1);
    setVisiblePopups([]);
  };

  if (visiblePopups.length === 0) return null;

  return (
    <>
      {visiblePopups.map((popup) => {
        const {
          popup_idx,
          popup_content,
          height,
          width,
          left_space,
          top_space,
          file_name,
        } = popup;

        return (
          <div
            key={popup_idx}
            style={{
              position: "fixed",
              top: `${top_space || 80}px`,
              left: `${left_space || 40}px`,
              width: `${width || 400}px`,
              height: `${height || "auto"}`,
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow
              zIndex: "1000",
            }}
          >
            <h3>캠플레이스 공지</h3>

            {/* 이미지 파일 조건부 렌더링 */}
            {file_name ? (
              <img
                src={`http://localhost:8080/uploads/${file_name}`}
                alt={file_name}
                style={{
                  width: "95%",
                  maxHeight: "300px",
                  marginBottom: "10px",
                }}
              />
            ) : null}

            <p>{popup_content || ""}</p>
            <div style={{ marginTop: "20px" }}>
              <button
                style={{
                  marginRight: "10px",
                  padding: "10px 20px",
                  backgroundColor: "gray",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={handleDoNotShowToday}
              >
                오늘 하루 보지 않기
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => handleClose(popup_idx)}
              >
                닫기
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
