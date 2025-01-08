// LightningMeetingPage.jsx
"use client";

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
  IconButton,
  Fab,
  Link,
  Pagination,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TableSortLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

export default function LightningMeetingPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]); // 서버에서 가져온 전체 데이터
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 표시할 아이템 수
  const [userIdx, setUserIdx] = useState(null); // 로그인 사용자 ID 관리
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [deleteDialog, setDeleteDialog] = useState({ open: false, meetingId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // 정렬 상태
  const [order, setOrder] = useState("desc"); // 초기 정렬 방향을 내림차순으로 설정
  const [orderBy, setOrderBy] = useState("post_idx"); // 초기 정렬 기준을 post_idx로 설정

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
      alert("로그인이 필요합니다.");
      router.push("/authentication/login");
    }
  }, [router]);

  // 서버에서 데이터 가져오기
  useEffect(() => {
    if (userIdx !== null) { // userIdx가 null이 아닌 경우에만 데이터 fetch
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/meetings", {
            headers: {
              "Content-Type": "application/json",
              // "Authorization": `Bearer ${token}`, // 필요 시 JWT 토큰 추가
            },
          });
          if (!response.ok) throw new Error("데이터를 가져오지 못했습니다.");
          const data = await response.json();
          console.log("Fetched meeting data:", data); // 데이터 확인용 로그
          setRows(data);
          setFilteredRows(data); // 초기에는 전체 데이터를 보여줌
        } catch (error) {
          console.error("데이터 로드 오류:", error.message);
          alert("데이터를 가져오는 데 실패했습니다.");
        } finally {
          setLoading(false); // 데이터 로드 완료
        }
      };
      fetchData();
    }
  }, [userIdx]);

  // 정렬된 행 데이터
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === "asc" ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRows, order, orderBy]);

  // 페이지네이션을 위한 정렬된 행 데이터
  const paginatedRows = useMemo(() => {
    return sortedRows.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedRows, currentPage, itemsPerPage]);

  // 삭제 다이얼로그 열기
  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, meetingId: id });
  };

  // 삭제 다이얼로그 닫기
  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, meetingId: null });
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    const { meetingId } = deleteDialog;
    if (!meetingId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // 필요 시 JWT 토큰 추가
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "삭제에 실패했습니다.");
      }

      // 삭제가 성공하면 상태에서 해당 게시물 제거
      setRows((prevRows) => prevRows.filter((row) => row.post_idx !== meetingId));
      setFilteredRows((prevRows) => prevRows.filter((row) => row.post_idx !== meetingId));
      setSnackbar({ open: true, message: "게시물이 성공적으로 삭제되었습니다.", severity: "success" });
    } catch (error) {
      console.error("삭제 오류:", error.message);
      setSnackbar({ open: true, message: `삭제 실패: ${error.message}`, severity: "error" });
    } finally {
      handleDeleteClose();
    }
  };

  // 수정 버튼 클릭 시
  const handleEditClick = (id) => {
    router.push(`/MeetingGroup/lightning-Meeting/edit/${id}`);
  };

  // 검색 버튼 / 날짜 검색 버튼
  const handleSearch = () => {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    // 제목 또는 장소 검색
    const searchTermFilter = lowerSearchTerm
      ? (row) =>
          row.title.toLowerCase().includes(lowerSearchTerm) ||
          row.meeting_location.toLowerCase().includes(lowerSearchTerm)
      : () => true;

    // 날짜 검색
    const dateFilter = selectedDate
      ? (row) => row.meeting_date === selectedDate
      : () => true;

    const filtered = rows.filter((row) => searchTermFilter(row) && dateFilter(row));
    setFilteredRows(filtered);
    setCurrentPage(1); // 검색 후 첫 페이지로 이동
  };

  // 게시물 클릭
  const handleTitleClick = (row) => {
    console.log("Row clicked:", row);
    console.log("Row ID (post_idx):", row.post_idx);
    if (!row.post_idx) {
      console.error("Invalid row.post_idx:", row);
      return alert("유효하지 않은 게시물입니다.");
    }
    router.push(`/MeetingGroup/lightning-Meeting/detail/${row.post_idx}`);
  };

  // 페이지네이션
  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // 스낵바 닫기
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 정렬 핸들러
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Hydration 에러 해결을 위해 로딩 상태에서 일단 로딩 스피너를 반환
  if (loading) { // 로딩 상태일 때 로딩 스피너 표시
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

  // 작성자 아이디 마스킹 함수
  const maskId = (id) => {
    if (!id || id.length < 4) return id;
    const visibleStart = 2;
    const visibleEnd = 2;
    const maskedLength = id.length - visibleStart - visibleEnd;
    return `${id.slice(0, visibleStart)}${"*".repeat(maskedLength)}${id.slice(-visibleEnd)}`;
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: "20px",
        paddingTop: "80px",
        margin: "0 auto",
        width: { xs: "95%", sm: "90%", md: "80%", lg: "70%" }, // 반응형 너비
      }}
    >
      {/* 상단 타이틀 + 글쓰기 버튼 */}
      <Box sx={{ "& > :not(style)": { m: 1 } }}>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: "bold", marginBottom: "20px" }}
        >
          <Link
            href="/MeetingGroup/lightning-Meeting"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            번개모임&nbsp;
          </Link>
          {userIdx && (
            <Fab
              size="small"
              color="secondary"
              aria-label="add"
              href="/MeetingGroup/lightning-Meeting/create"
              sx={{ backgroundColor: "#597445" }}
            >
              <AddIcon />
            </Fab>
          )}
        </Typography>
      </Box>

      {/* 검색 박스 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          marginBottom: "20px",
        }}
      >
        <TextField
          variant="outlined"
          placeholder="검색어를 입력하세요"
          sx={{ width: { xs: "100%", sm: "300px" } }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          aria-label="검색어 입력"
        />
        <IconButton color="primary" size="large" onClick={handleSearch} aria-label="검색 버튼">
          <SearchIcon sx={{ color: "green" }} />
        </IconButton>
      </Box>

      {/* 날짜 필터 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          marginBottom: "20px",
          justifyContent: { xs: "center", sm: "flex-end" },
        }}
      >
        <TextField
          label="날짜 검색"
          type="date"
          variant="outlined"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ width: { xs: "100%", sm: "180px" } }}
          InputLabelProps={{ shrink: true }}
          aria-label="날짜 검색"
        />
        <IconButton color="primary" size="large" onClick={handleSearch} aria-label="날짜 검색 버튼">
          <SearchIcon sx={{ color: "green" }} />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "post_idx"}
                  direction={orderBy === "post_idx" ? order : "asc"}
                  onClick={() => handleRequestSort("post_idx")}
                >
                  No
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "title"}
                  direction={orderBy === "title" ? order : "asc"}
                  onClick={() => handleRequestSort("title")}
                >
                  제목
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "writer_id"}
                  direction={orderBy === "writer_id" ? order : "asc"}
                  onClick={() => handleRequestSort("writer_id")}
                >
                  아이디
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "meeting_location"}
                  direction={orderBy === "meeting_location" ? order : "asc"}
                  onClick={() => handleRequestSort("meeting_location")}
                >
                  장소
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "meeting_date"}
                  direction={orderBy === "meeting_date" ? order : "asc"}
                  onClick={() => handleRequestSort("meeting_date")}
                >
                  일정 날짜
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <TableRow
                  key={`${row.post_idx}-${index}`}
                  hover
                  onClick={() => handleTitleClick(row)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{row.post_idx}</TableCell>
                  <TableCell>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTitleClick(row);
                      }}
                      color="primary"
                      sx={{ color: "inherit", textDecoration: "none" }}
                      aria-label={`제목 ${row.title}`}
                    >
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell>{maskId(row.writer_id) || "아이디"}</TableCell>
                  <TableCell>{row.meeting_location || "미정"}</TableCell>
                  <TableCell>{row.meeting_date || "미정"}</TableCell>
                  <TableCell align="center">
                    {/* 작성자일 경우에만 수정 및 삭제 버튼 표시 */}
                    {userIdx === row.writer_idx && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // 클릭 이벤트 전파 방지
                            handleEditClick(row.post_idx);
                          }}
                          aria-label="수정 버튼"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation(); // 클릭 이벤트 전파 방지
                            handleDeleteClick(row.post_idx);
                          }}
                          aria-label="삭제 버튼"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">게시물 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말 이 게시물을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} aria-label="취소">
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" aria-label="삭제 확인">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 추가 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 페이지네이션 */}
      <Box sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          siblingCount={2}
          boundaryCount={1}
          sx={{
            "& .MuiPaginationItem-root": {
              color: "black",
              "&:hover": {
                backgroundColor: "rgba(0, 128, 0, 0.6)",
              },
            },
            "& .Mui-selected": {
              backgroundColor: "rgba(0, 128, 0)",
              color: "white",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "rgba(0, 128, 0, 1)",
              },
            },
          }}
          aria-label="페이지네이션"
        />
      </Box>
    </Box>
  );
}
