// src/app/MeetingGroup/lightning-Meeting/edit/page.jsx
"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { styled } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";

// Styled Components
const StyledSendButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isFormValid",
})(({ theme, isFormValid }) => ({
  borderRadius: "20px",
  padding: "10px 20px",
  color: "#fff",
  backgroundColor: isFormValid ? theme.palette.primary.main : "#9E9E9E",
  textTransform: "none",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: isFormValid ? theme.palette.primary.dark : "#9E9E9E",
  },
  cursor: isFormValid ? "pointer" : "not-allowed",
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  padding: "10px 20px",
  color: "#fff",
  backgroundColor: "#D32F2F", // 빨간색
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#C62828", // 더 진한 빨간색
  },
}));

// 커스텀 스타일을 적용한 TextField
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "success",
})(({ theme, success }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: success ? "#AED581" : "#ccc",
    },
    "&.Mui-focused fieldset": {
      borderColor: success ? "#AED581" : "#8BC34A",
    },
    "&.Mui-error fieldset": {
      borderColor: "red", // 빨간색 테두리
    },
  },
  "& .MuiFormHelperText-root": {
    color: "red",
    fontSize: "0.75rem", // 오류 메시지 크기 조정
  },
}));

export default function EditMeetingPage() {
  const router = useRouter();
  const { id } = useParams(); // URL에서 id 추출
  const [userIdx, setUserIdx] = useState(null); // 로그인 사용자 ID 관리
  const [title, setTitle] = useState("");
  const [meetingLocation, setMeetingLocation] = useState(""); // 만날 장소
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false); // 전송 시도 여부
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(false); // 폼 제출 로딩 상태
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar 열기
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar 메시지
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar 종류

  // 컴포넌트 마운트 시 auth-storage에서 user_idx 가져오기
  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    let storedUserIdx = null;
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        storedUserIdx = authData?.state?.user?.user_idx;
        console.log("Extracted user_idx from auth-storage:", storedUserIdx); // 디버깅용 로그
      } catch (error) {
        console.error("Failed to parse auth-storage:", error);
      }
    }

    if (storedUserIdx) {
      setUserIdx(parseInt(storedUserIdx, 10));
    } else {
      // user_idx가 없을 경우 로그인 페이지로 리다이렉트
      setSnackbarMessage("로그인이 필요합니다.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push("/authentication/signIn");
      }, 2000);
    }
  }, [router]);

  // 해당 게시물 데이터 가져오기
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const authStorage = localStorage.getItem("auth-storage");
        let token = "";
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          token = authData?.state?.user?.token || "";
        }

        const response = await fetch(`http://localhost:8080/api/meetings/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
          },
        });

        if (!response.ok) {
          throw new Error("게시물 데이터를 가져오지 못했습니다.");
        }

        const data = await response.json();
        console.log("Fetched meeting data for editing:", data);

        // 작성자 확인 (본인 게시물인지)
        if (data.writer_idx !== userIdx) {
          setSnackbarMessage("본인이 작성한 게시물만 수정할 수 있습니다.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setTimeout(() => {
            router.push("/MeetingGroup/lightning-Meeting");
          }, 2000);
          return;
        }

        // 폼 필드 채우기
        setTitle(data.title || "");
        setMeetingLocation(data.meeting_location || "");
        setDate(data.meeting_date || "");
        setDescription(data.content || "");
        setCapacity(data.personnel || "");
      } catch (error) {
        console.error("게시물 로드 오류:", error.message);
        setSnackbarMessage(`게시물 로드 실패: ${error.message}`);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    if (id && userIdx !== null) {
      fetchMeeting();
    }
  }, [id, userIdx, router]);

  // 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};

    // 제목 유효성 검사: 비어있지 않고, 특수 문자 제한
    if (!title.trim()) {
      newErrors.title = "모임 제목을 입력하세요.";
    } else if (/[^a-zA-Z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/.test(title)) {
      newErrors.title = "모임 제목에 특수 문자를 사용할 수 없습니다.";
    }

    // 장소 유효성 검사: 비어있지 않고, 특수 문자 제한
    if (!meetingLocation.trim()) {
      newErrors.meetingLocation = "만날 장소를 입력하세요.";
    } else if (/[^a-zA-Z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/.test(meetingLocation)) {
      newErrors.meetingLocation = "만날 장소에 특수 문자를 사용할 수 없습니다.";
    }

    // 날짜 유효성 검사: 비어있지 않음
    if (!date.trim()) {
      newErrors.date = "날짜를 선택하세요.";
    }

    // 날짜의 유효성 검사: 현재 이후
    if (date.trim()) {
      const selectedDate = new Date(date);
      const today = new Date();
      // 시간을 00:00:00으로 설정하여 날짜만 비교
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      console.log("Selected Date:", selectedDate);
      console.log("Today's Date:", today);
      if (selectedDate < today) {
        newErrors.date = "날짜는 오늘 이후여야 합니다.";
      }
    }

    // 설명 유효성 검사: 비어있지 않음
    if (!description.trim()) {
      newErrors.description = "간단한 설명을 입력하세요.";
    }

    // 정원 유효성 검사: 1 이상 1000 이하
    if (!capacity || parseInt(capacity) <= 0) {
      newErrors.capacity = "정원은 1명 이상이어야 합니다.";
    } else if (parseInt(capacity) > 1000) {
      newErrors.capacity = "정원은 1000명을 초과할 수 없습니다.";
    }

    console.log("Validation Errors:", newErrors); // 디버깅용 로그
    return newErrors;
  };

  // 입력 값이 변경될 때마다 유효성 검증 (실시간 검증)
  useEffect(() => {
    if (isSubmitted) {
      const validationErrors = validateForm();
      setErrors(validationErrors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, meetingLocation, date, description, capacity, isSubmitted]);

  // 제출 핸들러
  const handleSubmit = async () => {
    console.log("handleSubmit called");
    setIsSubmitted(true); // 오류 메시지 표시
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // 필수 입력 항목이 비어 있을 경우
      setSnackbarMessage("필수 입력 칸을 확인하세요.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (!userIdx) {
      setSnackbarMessage("로그인이 필요합니다.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push("/authentication/signIn");
      }, 2000);
      return;
    }

    const updatedMeeting = {
      title: title.trim(),
      meeting_location: meetingLocation.trim(),
      meeting_date: date, // 시간 관련 부분 제거
      content: description.trim(),
      personnel: parseInt(capacity),
      writer_idx: userIdx, // 로그인 사용자 ID 사용
    };

    console.log("수정할 데이터:", updatedMeeting); // 데이터 확인

    setIsLoading(true); // 로딩 시작

    try {
      const authStorage = localStorage.getItem("auth-storage");
      let token = "";
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.user?.token || "";
      }

      const response = await fetch(`http://localhost:8080/api/meetings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // JWT 토큰 추가
        },
        body: JSON.stringify(updatedMeeting),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "번개 모임 수정에 실패했습니다.");
      }

      setSnackbarMessage("번개 모임이 성공적으로 수정되었습니다.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // 폼 초기화
      setTitle("");
      setMeetingLocation("");
      setDate("");
      setDescription("");
      setCapacity("");
      setErrors({});
      setIsSubmitted(false);

      // 리다이렉트 (Snackbar가 표시된 후 이동)
      setTimeout(() => {
        router.push("/MeetingGroup/lightning-Meeting");
      }, 2000);
    } catch (error) {
      console.error("번개 모임 수정 오류:", error.message);
      setSnackbarMessage(`수정 실패: ${error.message}`);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    router.push("/MeetingGroup/lightning-Meeting");
  };

  // 버튼 비활성화 여부
  const isFormValid = Object.keys(validateForm()).length === 0;

  // Snackbar 닫기 핸들러
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  // 디버깅을 위한 콘솔 로그 (렌더링 시)
  console.log("Render - isSubmitted:", isSubmitted, "errors:", errors);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        paddingTop: "80px",
      }}
    >
      <Paper
        elevation={0} // 그림자 제거
        sx={{
          padding: "30px",
          borderRadius: "8px",
          backgroundColor: "#ffffff", // 흰색 배경 적용
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", marginBottom: "30px", textAlign: "center" }}
        >
          번개 모임 수정하기
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="모임 제목"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={isSubmitted && !!errors.title}
              helperText={isSubmitted && errors.title}
              required
              success={!errors.title && isSubmitted && title.trim() !== ""}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="만날 장소"
              variant="outlined"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              error={isSubmitted && !!errors.meetingLocation}
              helperText={isSubmitted && errors.meetingLocation}
              required
              success={!errors.meetingLocation && isSubmitted && meetingLocation.trim() !== ""}
            />
          </Grid>

          {/* 날짜 선택과 정원 입력을 같은 행에 배치 */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* 날짜 선택 필드 */}
              <Grid item xs={12} sm={8}>
                <StyledTextField
                  fullWidth
                  label="날짜 선택"
                  type="date"
                  variant="outlined"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  error={isSubmitted && !!errors.date}
                  helperText={isSubmitted && errors.date}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0], // 오늘 날짜 이후도 선택 가능
                  }}
                  required
                  success={!errors.date && isSubmitted && date.trim() !== ""}
                />
              </Grid>

              {/* 정원 입력 필드 */}
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  fullWidth
                  label="정원"
                  type="number"
                  variant="outlined"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  error={isSubmitted && !!errors.capacity}
                  helperText={isSubmitted && errors.capacity}
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: 1000, // 최대 정원 제한
                    },
                  }}
                  required
                  success={
                    !errors.capacity &&
                    isSubmitted &&
                    parseInt(capacity) >= 1 &&
                    parseInt(capacity) <= 1000
                  }
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="간단한 설명"
              variant="outlined"
              multiline
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={isSubmitted && !!errors.description}
              helperText={isSubmitted && errors.description}
              required
              success={!errors.description && isSubmitted && description.trim() !== ""}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            marginTop: "30px",
          }}
        >
          <StyledSendButton
            onClick={handleSubmit}
            isFormValid={isFormValid}
            aria-label="수정 버튼"
            variant="contained"
            startIcon={<SendIcon />} // 아이콘을 텍스트 왼쪽에 위치
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "수정"}
          </StyledSendButton>
          <StyledCancelButton
            variant="contained"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
            aria-label="취소 버튼"
            disabled={isLoading}
          >
            취소
          </StyledCancelButton>
        </Box>
      </Paper>

      {/* Snackbar 컴포넌트 추가 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // 위치 수정: 상단 중앙
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
