"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Pagination,
  Input,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation"; // Next.js useRouter
import useAuthStore from "store/authStore";
import axios from "axios";

export default function RequestPage() {
  const router = useRouter(); // useRouter 훅
  const [isWriting, setIsWriting] = useState(false);
  const [writingOption, setWritingOption] = useState(""); // 작성 옵션 상태
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const [userIdx, setUserIdx] = useState("");
  const [isBusinessUser, setIsBusinessUser] = useState(null); // 사업자 여부 (true: 사업자, false: 일반 사용자)
  const [campgrounds, setCampgrounds] = useState([]); // 캠핑장 데이터

  const handlePageChange = (event, value) => setPage(value);

  // 상세 페이지로 이동
  const handleDetailClick = (contentId) => {
    router.push(`/customer-center/request/detail/${contentId}`); // 디테일 페이지로 이동
  };

  // 캠핑장 데이터 가져오기
  const fetchCampgrounds = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/campground/sites`
      );
      setCampgrounds(response.data); // 데이터 상태에 저장
    } catch (error) {
      console.error("캠핑장 데이터를 가져오는 중 오류 발생:", error);
    }
  };
  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchCampgrounds();
  }, []);

  const handleOptionSelect = (option) => {
    if (option === "register") {
      // 캠핑장 등록 선택 시
      router.push("/customer-center/request/write");
    } else {
      // 캠핑장 수정 선택 시
      setWritingOption("modify");
    }
  };

  // 유저 ID 가져오기
  const getUserIdx = async () => {
    try {
      const response = await axios.get(`${LOCAL_API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setUserIdx(response.data.data.user_idx);
      } else {
        console.error("프로필 가져오기 실패:", response.data.message);
      }
    } catch (error) {
      console.error("프로필 요청 오류:", error);
      alert("로그인이 만료되었습니다. 로그인 후 이용해주세요.");
      router.push("/");
    }
  };
  // 사업자 여부 확인
  const checkBusinessAvailability = async (user_idx) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/member/operators/check-user?user_idx=${user_idx}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch business data");
      }
      const isBusinessExist = await response.json(); // true: 사업자, false: 일반 사용자
      setIsBusinessUser(isBusinessExist); // 사업자 여부 업데이트
    } catch (error) {
      console.error("사업자 확인 중 오류:", error);
      alert("사업자 상태 확인 중 문제가 발생했습니다.");
      setIsBusinessUser(null); // 오류 발생 시 상태 초기화
    }
  };
  const [businessIdx, setbusinessIdx] = useState("");
  // 관리자 ID 가져오기
  const getBusinessIdx = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/member/operators/check/${userIdx}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setbusinessIdx(response.data);
      } else {
        console.error("사업자 idx 가져오기 실패");
      }
    } catch (error) {
      console.error("사업자 idx 요청 오류:", error);
    }
  };

  // 초기화 작업: 유저 ID 가져오기 -> 사업자 여부 확인
  useEffect(() => {
    const initialize = async () => {
      await getUserIdx(); // 유저 ID 가져오기
    };
    initialize();
  }, []);

  useEffect(() => {
    if (userIdx !== null) {
      checkBusinessAvailability(userIdx); // 사업자 여부 확인
    }
  }, [userIdx]);
  useEffect(() => {
    if (userIdx) {
      getBusinessIdx(); // 사용자 ID가 설정된 후 사업자 ID 가져오기
    }
  }, [userIdx]);
  useEffect(() => {
    if (businessIdx) {
      console.log("업데이트된 사업자 idx :", businessIdx);
    }
  }, [businessIdx]);

  const [selectedFile, setSelectedFile] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // 선택된 파일 가져오기
    if (file) {
      const fileType = file.type; // 파일 타입 확인
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(fileType)) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      // 파일 URL 생성 및 상태 업데이트
      const fileUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        firstImageUrl: fileUrl, // 미리보기 URL 상태 저장
      }));
      setSelectedFile(file); // 실제 파일 객체 저장 (서버 업로드용)
    }
  };

  const [formData, setFormData] = useState({
    business_idx: "",
    title: "",
    content: "",
    firstImageUrl: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("business_idx", businessIdx);
    if (selectedFile) {
      data.append("file", selectedFile);
    }
    // 데이터 확인 로그 추가
    console.log("FormData 확인:");
    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }
    try {
      const response = await fetch(
        "http://localhost:8080/api/campground/sites/insert/data",
        {
          method: "POST",
          body: data,
        }
      );
      if (response.ok) {
        alert("요청사항이 등록되었습니다.");
        setFormData({
          business_idx: "",
          title: "",
          content: "",
          firstImageUrl: null,
        });
        setSelectedFile(null);
        setIsWriting(false); // 글쓰기 모드 비활성화
        setWritingOption(""); // 작성 옵션 초기화
        router.push("/customer-center/request");
      } else {
        alert("요청사항 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("등록 중 문제가 발생했습니다.");
    }
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const paginatedCampgrounds = campgrounds.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* 제목 및 밑줄 */}
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ textAlign: "center", color: "#333" }}
      >
        캠핑장 등록 및 수정 요청
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* 사업자 전용 글쓰기 버튼 */}
      {!isWriting ? (
        <>
          {isBusinessUser && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setIsWriting(true)}
                sx={{ bgcolor: "#597445", "&:hover": { bgcolor: "#486936" } }}
              >
                글쓰기
              </Button>
            </Box>
          )}

          {/* 테이블 */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>번호</TableCell>
                  <TableCell>제목</TableCell>
                  <TableCell>작성자</TableCell>
                  <TableCell>등록일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCampgrounds.length > 0 ? (
                  paginatedCampgrounds.map((campground, index) => (
                    <TableRow
                      key={campground.camp_request_idx}
                      hover
                      onClick={() =>
                        handleDetailClick(campground.camp_request_idx)
                      }
                    >
                      <TableCell>
                        {(page - 1) * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{campground.title}</TableCell>
                      <TableCell>{campground.business_idx}</TableCell>
                      <TableCell>{campground.createdtime}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 페이지네이션 */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={Math.ceil(campgrounds.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      ) : writingOption === "modify" ? (
        <>
          <Typography variant="h6" gutterBottom>
            캠핑장 수정 요청
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="제목"
              margin="normal"
              variant="outlined"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="내용"
              margin="normal"
              multiline
              rows={4}
              variant="outlined"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                이미지 업로드
              </Typography>
              <input
                type="file"
                onChange={handleFileChange} // 파일 선택 핸들러 연결
              />
              {formData.firstImageUrl && (
                <img
                  src={formData.firstImageUrl}
                  alt="Thumbnail Preview"
                  style={{
                    width: "100px",
                    height: "auto",
                    marginTop: "10px",
                  }}
                />
              )}
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                sx={{ bgcolor: "#597445", "&:hover": { bgcolor: "#486936" } }}
                onClick={handleSubmit}
              >
                제출
              </Button>
              <Button
                startIcon={<CloseIcon />}
                variant="outlined"
                onClick={() => {
                  setIsWriting(false); // 글쓰기 모드 비활성화
                  setWritingOption(""); // writingOption 초기화
                }}
              >
                취소
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            작업 선택
          </Typography>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOptionSelect("register")}
              sx={{ bgcolor: "#597445", "&:hover": { bgcolor: "#486936" } }}
            >
              캠핑장 등록
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOptionSelect("modify")}
            >
              캠핑장 수정
            </Button>
          </Box>
          <Button
            startIcon={<CloseIcon />}
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => setIsWriting(false)}
          >
            취소
          </Button>
        </>
      )}
    </Box>
  );
}
