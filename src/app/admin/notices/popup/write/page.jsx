"use client";

import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "store/authStore";

function Page() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

  // State 초기화
  const [userIdx, setUserIdx] = useState("");
  const [adminIdx, setAdminIdx] = useState("");
  const [popupName, setPopupName] = useState(""); // 팝업 이름
  const [popupContent, setPopupContent] = useState(""); // 팝업 내용
  const [width, setWidth] = useState(""); // 가로 크기
  const [height, setHeight] = useState(""); // 세로 크기
  const [topSpace, setTopSpace] = useState(""); // 윗 간격
  const [leftSpace, setLeftSpace] = useState(""); // 왼쪽 간격
  const [isHidden, setIsHidden] = useState("표시"); // 숨김 여부 기본값 "표시"
  const [selectedFile, setSelectedFile] = useState(null); // 파일 상태

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // 입력값 변경 핸들러
  const handleChange = (setter) => (e) => setter(e.target.value);

  // Checkbox 상태 변경 핸들러
  const handleCheckboxChange = (e) => {
    setIsHidden(e.target.checked ? "숨김" : "표시"); // 체크되면 "숨김", 아니면 "표시"
  };

  // 팝업 등록 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileIdx = null;
      // 파일 업로드
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", selectedFile);
        const fileResponse = await axios.post(
          `http://localhost:8080/api/files/admin/upload`,
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fileIdx = fileResponse.data.file_idx;
      }

      // 팝업 등록 요청
      const formData = new FormData();
      formData.append("admin_idx", adminIdx);
      formData.append("popup_name", popupName);
      formData.append("popup_content", popupContent);
      formData.append("width", width);
      formData.append("height", height);
      formData.append("top_space", topSpace);
      formData.append("left_space", leftSpace);
      formData.append("is_hidden", isHidden); // "숨김" 또는 "표시"
      if (fileIdx) formData.append("file_idx", fileIdx);

      const response = await axios.post(
        `http://localhost:8080/api/notice/popup/insert`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert("팝업 등록 성공!");
        router.push("/admin/notices");
      } else {
        alert("팝업 등록 실패");
      }
    } catch (error) {
      console.error("등록 중 오류:", error);
      alert("등록 중 문제가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchUserIdx = async () => {
      try {
        const response = await axios.get(
          `${LOCAL_API_BASE_URL}/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserIdx(response.data.data.user_idx);
      } catch (error) {
        console.error("유저 ID 가져오기 실패:", error);
        router.push("/");
      }
    };

    if (token) fetchUserIdx();
  }, [token]);

  useEffect(() => {
    const fetchAdminIdx = async () => {
      try {
        const response = await axios.get(
          `${LOCAL_API_BASE_URL}/admin/admins/check-type?user_idx=${userIdx}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAdminIdx(response.data.admin_idx);
      } catch (error) {
        console.error("관리자 ID 가져오기 실패:", error);
      }
    };

    if (userIdx) fetchAdminIdx();
  }, [userIdx]);

  return (
    <Box sx={{ minHeight: "100vh", p: 4, backgroundColor: "grey" }}>
      <Box
        sx={{
          maxWidth: 600,
          margin: "0 auto",
          p: 4,
          backgroundColor: "#fff",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>팝업 등록하기</h2>
        <Link
          href="/admin/notices"
          passHref
          style={{ textDecoration: "none", color: "black" }}
        >
          <Typography variant="body1" mb={2}>
            [목록으로 돌아가기]
          </Typography>
        </Link>
        <hr />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>팝업 이름</TableCell>
                <TableCell>
                  <TextField
                    value={popupName}
                    onChange={handleChange(setPopupName)}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>내용</TableCell>
                <TableCell>
                  <textarea
                    value={popupContent}
                    onChange={handleChange(setPopupContent)}
                    style={{ width: "100%", height: "80px" }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>가로x세로 크기</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      placeholder="가로"
                      value={width}
                      onChange={handleChange(setWidth)}
                      type="number"
                      sx={{ width: "50%" }}
                    />
                    <TextField
                      placeholder="세로"
                      value={height}
                      onChange={handleChange(setHeight)}
                      type="number"
                      sx={{ width: "50%" }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>위치 간격 (위x왼쪽)</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      placeholder="윗 간격"
                      value={topSpace}
                      onChange={handleChange(setTopSpace)}
                      type="number"
                      sx={{ width: "50%" }}
                    />
                    <TextField
                      placeholder="왼쪽 간격"
                      value={leftSpace}
                      onChange={handleChange(setLeftSpace)}
                      type="number"
                      sx={{ width: "50%" }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>파일 첨부</TableCell>
                <TableCell>
                  <input type="file" onChange={handleFileChange} />
                  {selectedFile && (
                    <Typography>선택된 파일: {selectedFile.name}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>숨김 여부</TableCell>
                <TableCell>
                  <Checkbox
                    checked={isHidden === "숨김"}
                    onChange={handleCheckboxChange}
                  />{" "}
                  숨김
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={() => router.push("/admin/notices")}
          >
            취소
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            등록하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Page;
