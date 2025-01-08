"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { getCookie } from "cookies-next"; // 쿠키에서 값 가져오는 함수
import useAuthStore from "store/authStore"; // Zustand store 사용

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [loading, setLoading] = useState(true);
  const [facltNm, setFacltNm] = useState(null); // 캠핑장 이름 저장
  const [useDate, setUseDate] = useState(null); // 이용 날짜 저장
  const [checkinDate, setCheckinDate] = useState(null); // 체크인 날짜
  const [checkoutDate, setCheckoutDate] = useState(null); // 체크아웃 날짜

  const router = useRouter();
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기

  const LOCAL_API_BASE_URL =
    process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080/api/camping";

  useEffect(() => {
    const fetchUserInfoAndSendPaymentData = async () => {
      // 토큰이 없으면 로그인 페이지로 리디렉션
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login"); // 로그인 페이지 경로로 수정하세요.
        return;
      }

      try {
        // 사용자 정보 가져오기
        const API_URL = `${LOCAL_API_BASE_URL}/users/profile`;
        console.log("유저 정보 요청 URL:", API_URL);

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 사용
          },
        });

        console.log("유저 정보 응답 데이터:", response.data);

        if (response.data.success) {
          const fetchedUserIdx = response.data.data.user_idx; // user_idx 추출
          const fetchedUserName = response.data.data.username;
          console.log("user_idx:", fetchedUserIdx, "userName:", fetchedUserName);

          // 2. 결제 데이터 가져오기
          const paymentDataString = localStorage.getItem("paymentData");
          const campingInfoString = localStorage.getItem("campingInfo");

          if (!paymentDataString || !campingInfoString) {
            console.error("로컬 스토리지에 결제 데이터 또는 캠핑장 정보가 없습니다.");
            alert("결제 데이터 또는 캠핑장 정보가 존재하지 않습니다.");
            router.push("/"); // 적절한 페이지로 리디렉션
            return;
          }

          const paymentData = JSON.parse(paymentDataString);
          const campingInfo = JSON.parse(campingInfoString);

          // 3. 캠핑장 이름과 이용 날짜 설정
          setFacltNm(campingInfo.facltNm);
          setUseDate(campingInfo.useDate);

          // 4. 체크인/체크아웃 날짜 계산 (useDate가 "YYYY-MM-DD ~ YYYY-MM-DD" 형태라고 가정)
          if (campingInfo.useDate) {
            const dateRange = campingInfo.useDate.split(" ~ ");
            if (dateRange.length === 2) {
              setCheckinDate(dateRange[0]);
              setCheckoutDate(dateRange[1]);
            }
          }

          // 5. 결제 데이터 백엔드로 전송
          if (orderId && amount && fetchedUserIdx) {
            // 결제 데이터에 필요한 필드를 추가적으로 설정
            paymentData.user_idx = fetchedUserIdx;
            paymentData.action_type = "예약";
  
            // 결제 데이터에 필요한 checkinDate와 checkoutDate만 포함
            if (checkinDate && checkoutDate) {
              console.log("체크인 날짜:", checkinDate, "체크아웃 날짜:", checkoutDate); // 설정되는 날짜 확인
              paymentData.checkin = checkinDate; // 체크인 날짜
              paymentData.checkout = checkoutDate; // 체크아웃 날짜
            }
  
            console.log("백엔드로 전송할 결제 데이터:", paymentData);
  
            const paymentResponse = await axios.post(
              `${LOCAL_API_BASE_URL}/camping/payments`,
              paymentData,
              {
                headers: {
                  Authorization: `Bearer ${token}`, // JWT 토큰 포함
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("서버 응답 성공:", paymentResponse.data);

            if (paymentResponse.status === 200) {
              console.log("결제 데이터가 성공적으로 백엔드에 저장되었습니다.");
              // 결제 데이터 전송 후 로컬 스토리지에서 삭제
              localStorage.removeItem("paymentData");
            } else {
              console.error("서버 응답 오류:", paymentResponse.data);
            }
          } else {
            console.error("orderId 또는 amount 또는 userIdx가 누락되었습니다.");
          }
        } else {
          console.error("유저 정보 가져오기 실패:", response.data.message);
        }
      } catch (error) {
        console.error("유저 정보 가져오기 또는 결제 데이터 전송 실패:", error.response || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && amount) {
      fetchUserInfoAndSendPaymentData();
    } else {
      setLoading(false);
    }
  }, [orderId, amount, token, router, LOCAL_API_BASE_URL]);

  if (loading) {
    return <div>결제 처리 중...</div>;
  }

  if (!orderId || !amount) {
    return <div>결제 정보가 부족합니다.</div>;
  }

  return (
    <div>
      <h1>결제 성공!</h1>
      <p>주문 번호: {orderId}</p>
      <p>결제 금액: {parseInt(amount, 10).toLocaleString()}원</p>
      {facltNm && <p>캠핑장: {facltNm}</p>} {/* 캠핑장 이름 추가 */}
      {checkinDate && <p>체크인 날짜: {checkinDate} </p>} {/* 체크인 날짜 추가 */}
      {checkoutDate && <p>체크아웃 날짜: {checkoutDate}</p>} {/* 체크아웃 날짜 추가 */}
    </div>
  );
};

export default SuccessPage;
