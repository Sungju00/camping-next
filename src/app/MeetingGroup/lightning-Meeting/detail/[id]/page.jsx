"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Avatar,
  Pagination,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import { motion, AnimatePresence } from "framer-motion";
import Picker from "emoji-picker-react";

// Styled Components
const CommentContainer = styled(Box)(({ theme }) => ({
  padding: "5px 0",
}));

const CommentContent = styled(Box)(({ theme, depth }) => ({
  display: "flex",
  alignItems: "flex-start",
  marginLeft: depth > 0 ? `${depth * 20}px` : "0px",
  backgroundColor: depth === 0 ? "#ffffff" : "#f5f5f5",
  padding: "8px",
  borderRadius: "4px",
  fontSize: "0.85rem",
  transition: "background-color 0.3s ease",
}));

const CommentDetails = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ActionsBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  marginTop: "4px",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#aaa",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
}));

const StyledSendButton = styled(IconButton)(({ theme }) => ({
  color: "#1976d2",
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
  },
}));

export default function MeetingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [userIdx, setUserIdx] = useState(null);
  const [userId, setUserId] = useState("Unknown");
  const [meeting, setMeeting] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReplies, setNewReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const COMMENTS_PER_PAGE = 5;

  // 수정/삭제 다이얼로그 상태
  const [editDialog, setEditDialog] = useState({ open: false, comment: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, comment: null });

  // 댓글 입력 참조
  const commentInputRef = useRef(null);

  // Menu 상태
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentComment, setCurrentComment] = useState(null);
  const openMenu = Boolean(anchorEl);

  // 이모티콘 피커 상태 (메인 댓글)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 이모티콘 피커 상태 (대댓글) - comment_idx를 키로 사용
  const [replyEmojiPickers, setReplyEmojiPickers] = useState({});

  // 댓글의 대댓글 및 입력창 표시 상태 관리
  const [isRepliesOpen, setIsRepliesOpen] = useState({});

  // 컴포넌트 마운트 시 auth-storage에서 user_idx 및 user_id 가져오기
  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    let storedUserIdx = null;
    let storedUserId = "Unknown";
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        storedUserIdx = authData?.state?.user?.user_idx;
        storedUserId = authData?.state?.user?.id || "Unknown";
        console.log("Extracted user_idx from auth-storage:", storedUserIdx);
        console.log("Extracted user_id from auth-storage:", storedUserId);
      } catch (error) {
        console.error("Failed to parse auth-storage:", error);
      }
    }

    if (storedUserIdx) {
      setUserIdx(parseInt(storedUserIdx, 10));
      setUserId(storedUserId);
    } else {
      alert("로그인이 필요합니다.");
      router.push("/authentication/signIn");
    }
  }, [router]);

  // 작성자 아이디를 마스킹하는 함수
  const maskId = (id) => {
    if (!id || id.length < 4) return id;
    const visibleStart = 2;
    const visibleEnd = 2;
    const maskedLength = id.length - visibleStart - visibleEnd;
    return `${id.slice(0, visibleStart)}${"*".repeat(maskedLength)}${id.slice(-visibleEnd)}`;
  };

  // 서버에서 댓글/게시글 데이터 가져오기
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for meeting ID:", id);

      if (!id) {
        throw new Error("모임 ID가 정의되지 않았습니다.");
      }

      const authStorage = localStorage.getItem("auth-storage");
      let token = "";
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.user?.token || "";
      }

      // 모임 상세 정보 가져오기
      const meetingResponse = await fetch(`http://localhost:8080/api/meetings/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!meetingResponse.ok) throw new Error("모임 데이터를 가져오지 못했습니다.");
      const meetingData = await meetingResponse.json();
      console.log("서버에서 받은 모임 데이터:", meetingData);
      setMeeting(meetingData);

      // 댓글 데이터 가져오기
      const commentsResponse = await fetch(`http://localhost:8080/api/meetings/${id}/comments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!commentsResponse.ok) throw new Error("댓글 데이터를 가져오지 못했습니다.");
      const commentsData = await commentsResponse.json();
      console.log("서버에서 받은 댓글 데이터 (원본):", commentsData);

      // 트리 구조로 변환하지 않고 바로 상태에 설정
      setComments(commentsData);
    } catch (err) {
      console.error("데이터 가져오기 실패:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userIdx) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userIdx]);

  // === 대댓글 전송 로직 ===
  const handleReplySubmit = async (parentId) => {
    if (!parentId || typeof parentId !== "number" || parentId <= 0) {
      console.error("유효하지 않은 parentId 값입니다:", parentId);
      return;
    }

    if (!newReplies[parentId]?.trim()) {
      console.error("대댓글 내용이 비어 있습니다.");
      return;
    }

    const replyContent = newReplies[parentId].trim();

    const replyData = {
      content: replyContent,
      parent_id: parentId,
      writer_idx: userIdx,
    };

    console.log("전송할 대댓글 데이터:", replyData);

    try {
      const authStorage = localStorage.getItem("auth-storage");
      let token = "";
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.user?.token || "";
      }

      const response = await fetch(`http://localhost:8080/api/meetings/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`대댓글 작성에 실패했습니다: ${errorData.error || "알 수 없는 오류"}`);
      }

      const responseData = await response.json(); // {message: '댓글 작성 성공', comment_idx: ...}

      console.log("대댓글 작성 성공:", responseData);

      // 대댓글을 상태에 직접 추가
      const newReply = {
        comment_idx: parseInt(responseData.comment_idx, 10),
        content: replyContent,
        parent_id: parentId,
        writer_idx: userIdx,
        writer_id: userId,
        created_at: new Date().toISOString(),
        children: [],
      };

      // 부모 댓글을 찾아 대댓글 추가
      setComments((prevComments) => {
        const addReply = (commentsList) => {
          return commentsList.map((comment) => {
            if (comment.comment_idx === parentId) {
              return {
                ...comment,
                children: [...comment.children, newReply],
              };
            } else if (comment.children && comment.children.length > 0) {
              return {
                ...comment,
                children: addReply(comment.children),
              };
            }
            return comment;
          });
        };

        return addReply(prevComments);
      });

      setNewReplies((prev) => ({ ...prev, [parentId]: "" }));
    } catch (err) {
      console.error("대댓글 작성 오류:", err.message);
      alert("대댓글을 작성하는데 실패했습니다. 나중에 다시 시도해주세요.");
    }
  };

  // === 최상위 댓글 전송 로직 ===
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      console.error("댓글 내용이 비어 있습니다.");
      return;
    }

    const commentData = {
      content: newComment.trim(),
      parent_id: null,
      writer_idx: userIdx,
      post_idx: parseInt(id, 10),
    };

    console.log("전송할 댓글 데이터:", commentData);

    try {
      const authStorage = localStorage.getItem("auth-storage");
      let token = "";
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.user?.token || "";
      }

      const response = await fetch(`http://localhost:8080/api/meetings/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`댓글 작성에 실패했습니다: ${errorData.message || "알 수 없는 오류"}`);
      }

      const responseData = await response.json(); // {message: '댓글 작성 성공', comment_idx: ...}

      console.log("댓글 작성 성공:", responseData);

      // 댓글을 상태에 직접 추가
      const newCommentObj = {
        comment_idx: parseInt(responseData.comment_idx, 10),
        content: newComment.trim(),
        parent_id: null,
        writer_idx: userIdx,
        writer_id: userId,
        created_at: new Date().toISOString(),
        children: [],
      };

      setComments((prevComments) => [...prevComments, newCommentObj]);

      setNewComment("");

      // 포커스 이동
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (err) {
      console.error("댓글 작성 오류:", err.message);
      alert("댓글을 작성하는데 실패했습니다. 나중에 다시 시도해주세요.");
    }
  };

  // === 댓글 수정 핸들러 ===
  const handleEditSubmit = async (comment_idx, newContent) => {
    if (!newContent.trim()) {
      console.error("수정된 내용이 비어 있습니다.");
      return;
    }

    try {
      const authStorage = localStorage.getItem("auth-storage");
      let token = "";
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.user?.token || "";
      }

      const response = await fetch(`http://localhost:8080/api/meetings/${id}/comments/${comment_idx}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`댓글 수정에 실패했습니다: ${errorData.message || "알 수 없는 오류"}`);
      }

      console.log("댓글 수정 성공");

      // 댓글 내용 업데이트
      setComments((prevComments) => {
        const updateComment = (commentsList) => {
          return commentsList.map((comment) => {
            if (comment.comment_idx === comment_idx) {
              return { ...comment, content: newContent };
            } else if (comment.children && comment.children.length > 0) {
              return { ...comment, children: updateComment(comment.children) };
            }
            return comment;
          });
        };
        return updateComment(prevComments);
      });

      setEditDialog({ open: false, comment: null });
    } catch (err) {
      console.error("댓글 수정 오류:", err.message);
      alert("댓글을 수정하는데 실패했습니다. 나중에 다시 시도해주세요.");
    }
  };

  // === 댓글 삭제 핸들러 ===
  const handleDelete = async (comment_idx) => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      let token = "";
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.user?.token || "";
      }

      const response = await fetch(`http://localhost:8080/api/meetings/${id}/comments/${comment_idx}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`댓글 삭제에 실패했습니다: ${errorData.message || "알 수 없는 오류"}`);
      }

      console.log("댓글 삭제 성공");

      // 댓글 상태에서 삭제
      setComments((prevComments) => {
        const removeComment = (commentsList) => {
          return commentsList
            .filter((comment) => comment.comment_idx !== comment_idx)
            .map((comment) => {
              if (comment.children && comment.children.length > 0) {
                return { ...comment, children: removeComment(comment.children) };
              }
              return comment;
            });
        };
        return removeComment(prevComments);
      });

      setDeleteDialog({ open: false, comment: null });
    } catch (err) {
      console.error("댓글 삭제 오류:", err.message);
      alert("댓글을 삭제하는데 실패했습니다. 나중에 다시 시도해주세요.");
    }
  };

  // === 페이지네이션 핸들러 ===
  const handlePageChange = (event, value) => {
    console.log("페이지 변경:", value);
    setPage(value);
  };

  // === 멘션 삽입 함수 ===
  const handleMention = (username, isReply = false, comment_idx = null) => {
    const mention = `@${username} `;
    if (isReply && comment_idx !== null) {
      setNewReplies((prev) => ({
        ...prev,
        [comment_idx]: (prev[comment_idx] || "") + mention, // 수정된 부분
      }));

      // 포커스 이동
      const replyInput = document.getElementById(`reply-input-${comment_idx}`);
      if (replyInput) {
        replyInput.focus();
      }
    } else {
      setNewComment((prev) => prev + mention);

      // 포커스 이동
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }
  };

  // === "..." 버튼 클릭 핸들러 ===
  const handleMenuClick = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setCurrentComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentComment(null);
  };

  // === 이모티콘 선택 핸들러 (메인 댓글) ===
  const onMainEmojiClick = (emojiData) => {
    if (emojiData && emojiData.emoji) {
      setNewComment((prev) => prev + emojiData.emoji);
    } else {
      console.error("선택된 이모티콘이 없습니다:", emojiData);
    }
    setShowEmojiPicker(false);
  };

  // === 이모티콘 선택 핸들러 (대댓글) ===
  const onReplyEmojiClick = (commentIdx, emojiData) => {
    if (emojiData && emojiData.emoji) {
      setNewReplies((prev) => ({
        ...prev,
        [commentIdx]: (prev[commentIdx] || "") + emojiData.emoji, // 수정된 부분
      }));
    } else {
      console.error("선택된 이모티콘이 없습니다:", emojiData);
    }
    setReplyEmojiPickers((prev) => ({
      ...prev,
      [commentIdx]: false,
    }));
  };

  // === 댓글/대댓글 재귀 렌더링 ===
  const renderComments = (commentList, depth = 0) => {
    if (!Array.isArray(commentList)) {
      console.error("댓글 데이터가 배열이 아닙니다:", commentList);
      return null;
    }

    return commentList.map((comment, index) => {
      if (!comment.comment_idx || typeof comment.comment_idx !== "number") {
        console.warn("유효하지 않은 comment_idx 값:", comment);
        return null;
      }

      // 대댓글은 depth가 1까지만 허용
      if (depth > 1) return null;

      const uniqueKey = `${comment.comment_idx}-${depth}-${index}`;
      const isReply = depth === 1;

      const replyCount = comment.children ? comment.children.length : 0;

      return (
        <AnimatePresence key={uniqueKey}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CommentContainer>
              <CommentContent depth={depth}>
                {!isReply && (
                  // 메인 댓글 입력창의 프로필 사진 추가
                  <Avatar
                    sx={{
                      marginRight: "16px",
                      bgcolor: "#1976d2",
                      cursor: "pointer",
                    }}
                    onClick={() => handleMention(comment.writer_id, false)}
                    aria-label="프로필 이미지 사용자"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleMention(comment.writer_id, false);
                      }
                    }}
                  >
                    {comment.writer_id.charAt(0).toUpperCase()}
                  </Avatar>
                )}
                {isReply && (
                  // 대댓글 아바타 크기 조절 및 아이콘 추가
                  <Avatar
                    sx={{
                      marginRight: "12px",
                      bgcolor: "#1976d2",
                      width: 32,
                      height: 32,
                      opacity: 0.8,
                      cursor: "pointer",
                    }}
                    onClick={() => handleMention(comment.writer_id, isReply, comment.comment_idx)}
                    aria-label={`프로필 이미지 ${comment.writer_id}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleMention(comment.writer_id, isReply, comment.comment_idx);
                      }
                    }}
                  >
                    {comment.writer_id.charAt(0).toUpperCase()}
                  </Avatar>
                )}
                {isReply && <ArrowRightIcon sx={{ marginTop: "8px", marginRight: "8px" }} />} {/* 대댓글 아이콘 추가 */}
                <CommentDetails>
                  {/* 작성자 이름과 날짜 */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        handleMention(comment.writer_id, isReply, comment.comment_idx)
                      }
                      aria-label={`작성자 ${comment.writer_id}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleMention(comment.writer_id, isReply, comment.comment_idx);
                        }
                      }}
                    >
                      {maskId(comment.writer_id)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ marginLeft: "8px", fontSize: "0.875rem" }}>
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "날짜 정보 없음"}
                    </Typography>
                    {/* "..." 메뉴 버튼 */}
                    <IconButton
                      size="small"
                      sx={{ marginLeft: "auto" }}
                      onClick={(e) => handleMenuClick(e, comment)}
                      aria-label="댓글 옵션"
                    >
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* 댓글 내용 */}
                  <Typography variant="body1" sx={{ marginTop: "4px", fontSize: "0.85rem" }}>
                    {comment.content || "댓글 내용이 없습니다."}
                  </Typography>

                  {/* 수정/삭제/답글 버튼 */}
                  <ActionsBox>
                    {/* 답글 버튼은 최상위 댓글에만 표시 */}
                    {!isReply && (
                      <Button
                        size="small"
                        onClick={() => {
                          console.log("클릭된 댓글 ID:", comment.comment_idx);
                          setIsRepliesOpen((prev) => ({
                            ...prev,
                            [comment.comment_idx]: !prev[comment.comment_idx],
                          }));
                        }}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }} // 폰트 크기 축소
                        aria-label="답글 작성"
                      >
                        {replyCount > 0 ? `답글(${replyCount})` : "답글"}
                      </Button>
                    )}
                  </ActionsBox>

                  {/* 대댓글 및 입력창 토글 */}
                  {!isReply && (
                    <Collapse in={isRepliesOpen[comment.comment_idx]} timeout="auto" unmountOnExit>
                      <Box sx={{ marginTop: "8px" }}>
                        {/* 대댓글 입력창 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                            position: "relative", // 부모 Box에 position: relative 추가
                          }}
                        >
                          <Avatar
                            sx={{
                              marginRight: "16px",
                              bgcolor: "#ffffff",
                              border: "1px solid #ccc",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleMention(comment.writer_id, true, comment.comment_idx)
                            }
                            aria-label={`프로필 이미지 ${comment.writer_id}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleMention(comment.writer_id, true, comment.comment_idx);
                              }
                            }}
                          >
                            {userId.charAt(0).toUpperCase()}
                          </Avatar>
                          <TextField
                            id={`reply-input-${comment.comment_idx}`}
                            fullWidth
                            variant="outlined"
                            placeholder="답글을 입력하세요"
                            value={newReplies[comment.comment_idx] || ""}
                            onChange={(e) =>
                              setNewReplies((prev) => ({
                                ...prev,
                                [comment.comment_idx]: e.target.value,
                              }))
                            }
                            multiline
                            rows={1}
                            size="small"
                            aria-label="대댓글 입력"
                          />
                          <IconButton
                            onClick={() =>
                              setReplyEmojiPickers((prev) => ({
                                ...prev,
                                [comment.comment_idx]: !prev[comment.comment_idx],
                              }))
                            }
                            sx={{ marginLeft: "8px" }}
                            aria-label="이모티콘 선택"
                          >
                            <EmojiEmotionsIcon />
                          </IconButton>
                          <StyledSendButton
                            onClick={() => handleReplySubmit(comment.comment_idx)}
                            disabled={!newReplies[comment.comment_idx]?.trim()}
                            aria-label="대댓글 전송"
                          >
                            <SendIcon />
                          </StyledSendButton>

                          {/* 이모티콘 선택창 위치 조정: 오른쪽에 나타나도록 수정 */}
                          {replyEmojiPickers[comment.comment_idx] && (
                            <Box sx={{ position: "absolute", zIndex: 1000, top: "0px", left: "100%", marginLeft: "8px" }}>
                              <Picker
                                onEmojiClick={(emojiData) =>
                                  onReplyEmojiClick(comment.comment_idx, emojiData)
                                }
                                disableSearchBar
                              />
                            </Box>
                          )}
                        </Box>
                        {/* 대댓글 목록 */}
                        {comment.children && comment.children.length > 0 && (
                          <Box sx={{ marginTop: "8px" }}>
                            {renderComments(comment.children, depth + 1)}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  )}
                </CommentDetails>
              </CommentContent>
            </CommentContainer>
          </motion.div>
        </AnimatePresence>
            );
          });
        };

    // === 로딩 상태 ===
    if (loading) {
      return (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      );
    }

    // === 에러 상태 ===
    if (error) {
      return (
        <Box textAlign="center" mt={4}>
          <Typography color="error">오류 발생: {error}</Typography>
        </Box>
      );
    }

    // === 모임 데이터 없는 경우 ===
    if (!meeting) {
      return (
        <Box textAlign="center" mt={4}>
          <Typography>모임 데이터를 로드 중입니다...</Typography>
        </Box>
      );
    }

    // === 페이지네이션: 댓글 리스트 분할 ===
    const paginatedComments = Array.isArray(comments)
      ? comments.slice((page - 1) * COMMENTS_PER_PAGE, page * COMMENTS_PER_PAGE)
      : [];

    // === 댓글 수 계산 ===
    const mainCommentsCount = Array.isArray(comments) ? comments.length : 0;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
        }}
      >
        {/* 주요 콘텐츠 영역 */}
        <Box sx={{ paddingBottom: "80px" }}>
          {/* 모임 상세 정보 */}
          <Paper
            sx={{
              padding: { xs: "16px", md: "24px" },
              marginBottom: "16px",
              backgroundColor: "#ffffff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "none",
              minHeight: "300px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 2, md: 4 },
              }}
            >
              {/* 모임 이미지 */}
              {meeting.image_url && (
                <Box sx={{ flex: "1 1 40%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img
                    src={meeting.image_url}
                    alt="모임 이미지"
                    style={{ width: "100%", maxWidth: "300px", borderRadius: "8px" }}
                  />
                </Box>
              )}

              {/* 모임 상세 정보 */}
              <Box sx={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: 2 }}>
                {/* 모임 제목 */}
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  {meeting.title || "제목 없음"}
                </Typography>

                {/* 모임 정보 아이콘 및 텍스트 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon color="action" />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.875rem", md: "1rem" },
                    }}
                  >
                    <strong>장소:</strong>{" "}
                    {meeting.meeting_location ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          meeting.meeting_location
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        {meeting.meeting_location}
                      </a>
                    ) : (
                      "장소 정보 없음"
                    )}
                  </Typography>
                </Box>

                {/* 날짜 표시 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EventIcon color="action" />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.875rem", md: "1rem" },
                    }}
                  >
                    <strong>날짜:</strong>{" "}
                    {meeting.meeting_date
                      ? new Date(meeting.meeting_date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "날짜 정보 없음"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon color="action" />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.875rem", md: "1rem" },
                    }}
                  >
                    <strong>정원:</strong> {meeting.personnel || "정원 정보 없음"}
                  </Typography>
                </Box>

                <Divider sx={{ marginY: "12px" }} />

                {/* 모임 소개 */}
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    wordWrap: "break-word",
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    marginTop: "8px",
                  }}
                >
                  {meeting.content || "내용이 없습니다."}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* 메인 댓글 입력창 */}
          <Box sx={{ marginBottom: "16px", position: "relative" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* 메인 댓글 입력창의 프로필 사진 다시 표시 */}
              <Avatar
                sx={{
                  marginRight: "16px",
                  bgcolor: "#1976d2",
                  cursor: "pointer",
                }}
                onClick={() => handleMention(userId, false)}
                aria-label="프로필 이미지 사용자"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleMention(userId, false);
                  }
                }}
              >
                {userId.charAt(0).toUpperCase()}
              </Avatar>
              <StyledTextField
                fullWidth
                variant="outlined"
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                maxRows={4}
                inputRef={commentInputRef}
                aria-label="새 댓글 입력"
              />
              <IconButton
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                sx={{ marginLeft: "8px" }}
                aria-label="이모티콘 선택"
              >
                <EmojiEmotionsIcon />
              </IconButton>
              <StyledSendButton
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                aria-label="댓글 전송"
              >
                <SendIcon />
              </StyledSendButton>
            </Box>
            {showEmojiPicker && (
              <Box sx={{ position: "absolute", zIndex: 1000, top: "60px", right: "0px" }}>
                <Picker onEmojiClick={onMainEmojiClick} disableSearchBar />
              </Box>
            )}
          </Box>

          {/* 댓글 목록 */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <Typography variant="h5" fontWeight="bold">
                댓글
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ marginLeft: "8px" }}>
                ({mainCommentsCount})
              </Typography>
            </Box>
            {paginatedComments.length > 0 ? (
              renderComments(paginatedComments, 0)
            ) : (
              <Typography>댓글이 없습니다.</Typography>
            )}
            <Pagination
              count={Math.ceil(mainCommentsCount / COMMENTS_PER_PAGE)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
              aria-label="댓글 페이지네이션"
            />
          </Box>
        </Box>

        {/* 댓글 수정 다이얼로그 */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, comment: null })}
          fullWidth
          maxWidth="sm"
          aria-labelledby="edit-comment-dialog"
        >
          <DialogTitle id="edit-comment-dialog">댓글 수정</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              defaultValue={editDialog.comment?.content || ""}
              onChange={(e) => {
                const updatedContent = e.target.value;
                setEditDialog((prev) => ({
                  ...prev,
                  comment: { ...prev.comment, content: updatedContent },
                }));
              }}
              multiline
              rows={4}
              sx={{ marginTop: "10px" }}
              aria-label="수정된 댓글 내용"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, comment: null })} aria-label="취소">
              취소
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                handleEditSubmit(editDialog.comment.comment_idx, editDialog.comment.content)
              }
              disabled={!editDialog.comment?.content?.trim()}
              aria-label="댓글 저장"
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 댓글 삭제 다이얼로그 */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, comment: null })}
          fullWidth
          maxWidth="xs"
          aria-labelledby="delete-comment-dialog"
        >
          <DialogTitle id="delete-comment-dialog">댓글 삭제</DialogTitle>
          <DialogContent>
            <Typography>이 댓글을 정말 삭제하시겠습니까?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, comment: null })} aria-label="취소">
              취소
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(deleteDialog.comment.comment_idx)}
              aria-label="댓글 삭제"
            >
              삭제
            </Button>
          </DialogActions>
        </Dialog>

        {/* "..." 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={() => {
              setEditDialog({ open: true, comment: currentComment });
              handleMenuClose();
            }}
            aria-label="댓글 수정 메뉴"
          >
            <EditIcon fontSize="small" sx={{ marginRight: "8px" }} />
            수정
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialog({ open: true, comment: currentComment });
              handleMenuClose();
            }}
            aria-label="댓글 삭제 메뉴"
          >
            <DeleteIcon fontSize="small" sx={{ marginRight: "8px" }} />
            삭제
          </MenuItem>
        </Menu>
      </Box>
    );
}
