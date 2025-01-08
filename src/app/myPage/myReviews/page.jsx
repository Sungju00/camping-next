"use client"
import { Avatar, Box, Button, Pagination, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useAuthStore from '../../../../store/authStore';
import { useRouter } from 'next/navigation';
import useApi from '../../component/useApi';
import { Image } from '@mui/icons-material';
import RatingStars from './RatingStars';

const MyReviews = () => {
  // 데이터 불러오기
  const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터
  const token = useAuthStore((state) => state.token);  // zustand에서 token 값 가져오기
  const router = useRouter();

  const {getData, postData} = useApi(token, setFilteredData); // api 요청 처리리
  // 내 리뷰뷰 가져오기
  useEffect(() => {
    getData("/myPage/getMyReviews");
  }, [])

  // 페이지
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 10; // 페이지당 아이템 수
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

    // 페이징
  // 페이지 변경 시 호출되는 함수
  const handlePageChange = (event, value) => {
    setCurrentPage(value); // 페이지 상태 업데이트
  };

  // 현재 페이지에 해당하는 데이터 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // 페이지네이션 범위 (10개씩 표시)
  const getPageNumbers = () => {
    let start = Math.max(currentPage - 4, 1); // 현재 페이지에서 왼쪽으로 최대 4개 페이지 표시
    let end = Math.min(start + 9, totalPages); // 현재 페이지에서 오른쪽으로 최대 9개 페이지 표시

    if (end - start < 9) {
      start = Math.max(end - 9, 1); // 페이지 범위가 9개 미만일 경우 조정
    }

    let pageNumbers = [];
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div>
      <Typography variant="h5">내가 작성한 후기</Typography>
        {currentData && currentData.length > 0 ? (
          currentData.map((item, index) => (
          <Paper key={index} className="camping-item" style={{width:"100%", height:"100%" , marginTop:"10px"}}>
              <Box className="camping-item-content" sx={{display:"flex", flexDirection:"row", textAlign:"left"}}>
                {/* 이미지가 없을 경우 Avatar와 기본 아이콘을 표시 */}
                {item.firstImageUrl ? (
                    <Box
                      sx={{
                        width: 300, // 틀의 너비
                        height: 200, // 틀의 높이
                        border: "2px solid #000", // 액자 스타일
                        overflow: "hidden", // 틀을 벗어나는 이미지를 숨김
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.firstImageUrl}
                        alt={item.facltNm}
                        sx={{
                          width: "100%", // 틀에 꽉 맞추기
                          height: "100%",
                          objectFit: "cover", // 이미지 비율 유지하며 틀에 맞춤
                        }}
                      />
                  </Box>
                ) : (
                  // 이미지가 없을 경우 Avatar와 기본 아이콘 표시
                  <Avatar sx={{ width: 400, height: 200 }}>
                  </Avatar>
                )}
                <Box className="camping-item-text" sx={{display:'flex', flexDirection:"column", ml:"30px"}}>
                  <h1
                    className="camping-item-title"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDetailClick(item.contentId)}
                  >
                    {item.facltNm}
                  </h1>
                  <Box sx={{display:"flex", mb:"20px"}}>
                    <Typography>내 평점 :  </Typography><RatingStars rating={4}/>
                  </Box>
                  <Typography>
                  <Typography>내 평가글 :  </Typography><Box>{item.content}</Box>
                  </Typography>
                  <p className="camping-item-address">
                    {item.addr1}
                    {item.tel}
                  </p>
                </Box>
              </Box>
            </Paper>
          ))
        ) : (
          <p style={{ color: "black" }}>조건에 맞는 캠핑장이 없습니다.</p>
        )}
        <div className="pagination">
          <Stack spacing={2}>
            <Pagination
              count={totalPages} // 전체 페이지 수
              page={currentPage} // 현재 페이지
              onChange={handlePageChange} // 페이지 변경 처리
              color="primary"
              showFirstButton
              showLastButton
              boundaryCount={2}
              siblingCount={4}
              hideNextButton={currentPage === totalPages}
              hidePrevButton={currentPage === 1} // 첫 페이지에서 '이전' 버튼 숨기기
            />
          </Stack>
        </div>
    </div>
  );
};

export default MyReviews;