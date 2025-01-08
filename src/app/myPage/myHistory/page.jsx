"use client"
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Stack, Pagination } from '@mui/material';
import axios from 'axios';
import useAuthStore from '../../../../store/authStore';
import useApi from '../../component/useApi';

function MyUsageHistory() {
  const token = useAuthStore((state) => state.token);  // zustand에서 token 값 가져오기
  const [data, setData] = useState([]);
  const { getData, postData } = useApi(token, setData);

  // 페이지
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 10; // 페이지당 아이템 수

  // 페이징
  // 페이지 변경 시 호출되는 함수
  const handlePageChange = (event, value) => {
    setCurrentPage(value); // 페이지 상태 업데이트
  };
  // 현재 페이지에 해당하는 데이터 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(data.length / itemsPerPage);
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
  // 예시 데이터
  const reservationData = [
    {
      campground: '해수욕장 캠핑장',
      period: '2024-12-01 ~ 2024-12-05',
      price: '120,000원',
      action_type: '예약',
    },
    {
      campground: '산속 캠핑장',
      period: '2024-12-10 ~ 2024-12-12',
      price: '80,000원',
      action_type: '장박',
    },
    {
      campground: '숲속 캠핑장',
      period: '2024-12-15 ~ 2024-12-20',
      price: '150,000원',
      action_type: '이용완료',
    },
  ];
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

  useEffect(() => {
    getData("/myPage/getUsageHistory");
  }, [])

  // const getData = async () => {
  //   const API_URL = `${LOCAL_API_BASE_URL}/myPage/getUsageHistory`;
  //   try {
  //     const response = await axios.get(API_URL, {
  //       headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json', // JSON 형식 명시
  //       }
  //     })
  //     if(response.data.success){
  //       setData(response.data.data);
  //       console.log(response.data.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }


  // // 후기쓰기 버튼 클릭 핸들러
  // const handleReviewClick = (campground) => {
  //   alert(`${campground}에 대한 후기를 작성할 수 있습니다.`);
  // };

  return (
    <div>
    <Typography sx={{
      fontSize : "30px",
      ml:"15px",
      textAlign: "center",
      
    }}>
      예약/이용 내역
    </Typography>

      <TableContainer component={Paper}
        sx={{
          textAlign: "center"
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="예약/이용 내역 표">
          <TableHead>
            <TableRow>
              <TableCell>캠핑장 이름</TableCell>
              <TableCell  align="center">이용 기간</TableCell>
              <TableCell align="left">결제 금액</TableCell>
              <TableCell align="center">상태</TableCell>
              <TableCell align="center">후기</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.facltNm}
                </TableCell>
                <TableCell align="center">{row.checkin} ~ {row.checkout}</TableCell>
                <TableCell align="left">{row.payment_amount}</TableCell>
                <TableCell align="center">{row.action_type}</TableCell>
                <TableCell align="center">
                  {
                    row.action_type == "이용" ? <Button variant='contained'>후기작성</Button> : ""
                  }

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
}

export default MyUsageHistory;


