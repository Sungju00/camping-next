"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { Button, TextField} from "@mui/material";
import { useRouter } from "next/navigation"; // 라우터 사용

import "./styles.css";
// import { useRouter } from "next/navigation";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddToHomeScreenIcon from "@mui/icons-material/AddToHomeScreen";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import {
  SportsSoccer,
  Wifi,
  LocalFireDepartment,
  Pool,
  ChildCare,
  ShoppingCart,
  Store,
} from "@mui/icons-material";
import HikingIcon from "@mui/icons-material/Hiking";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { fetchCampgroundById } from "../../fetchCampgroundById/page";

import dynamic from 'next/dynamic';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'),{
  ssr: false});
import "easymde/dist/easymde.min.css";
import { PiStarFill } from 'react-icons/pi'
import axios from "axios";
  
import KakaoMap from "@/app/kakaoMap/page";
import Weather from "@/app/weather/page";
import useAuthStore from "store/authStore";
import Image from "next/image";
import { red } from "@mui/material/colors";


export default function CampingDetail({ params }) {
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const { id } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 캠핑장 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [reviewLoading, setReviewLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const router = useRouter();
  const [isWriteVisible, setIsWriteVisible] = useState(false); // 글쓰기 화면의 표시 여부
  const [isUpdateVisible, setIsUpdateVisible] = useState(false); // 수정 화면의 표시 여부
  const [list, setList] = useState([]);
  const [formData, setFormData] = useState({
      title : '',
      user_idx : '',
      rating : '',
      content : '',
      file : null
  });
  const [rating, setRating] = useState(1)
  // 추천 여부 및 저장 상태 관리
  const [isSaved, setIsSaved] = useState(null);
  const LOCAL_IMG_URL = process.env.NEXT_PUBLIC_LOCAL_IMG_URL
  const [sortOrder, setSortOrder] = useState("latest"); // 정렬 기준
  const [isActive, setIsActive] = useState("latest"); // 버튼 클릭 상태를 관리
  const { isAuthenticated} = useAuthStore();
  const [logInIdx, setlogInIdx] = useState(null);  // 로그인한 user_idx 관리
  const [logInName, setlogInName] = useState(null);  // 로그인한 username 관리
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  
  const [userIdx, setUserIdx] = useState(null);
  const [userName, setUserName] = useState("");

  
  // 리뷰 이미지 상태
  const [selectedFile, setSelectedFile] = useState(null); // 파일 상태 추가
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState({});
  const fileInputRef = useRef(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleImageClick = (reviewIdx) => {
    if (fileInputRef.current) {
        fileInputRef.current.click(); // 숨겨진 input 요소를 클릭
    }
  };
  const onFileChange = (event, reviewIdx) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage((prev) => ({ ...prev, [reviewIdx]: previewUrl }));

        // formData에 파일 업데이트
        setFormData((prev) => ({
            ...prev,
            [reviewIdx]: { ...prev[reviewIdx], file: file}
        }));
        setIsImageVisible(true);
        setSelectedFile(file);
    }
};


  // 초기 찜 상태 확인
  useEffect(() => {
    const fetchSavedState = async () => {
      try {
        setLoading(true); // 데이터 로드 시작
        const response = await axios.get(`http://localhost:8080/api/like/status`, {
          params: { contentId: id, user_idx: logInIdx },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          if(response.data.data === "true"){
            setIsSaved(true);
          }else{
            setIsSaved(false);
          }
        }
      } catch (error) {
        console.error("찜 상태를 불러오는 중 오류 발생:", error);
        setIsSaved(false); // 오류 시 기본값 설정
      }finally {
        setLoading(false); // 데이터 로드 완료
      }
    };

    if (id && logInIdx && token) {
      fetchSavedState();
    }
  }, [id, logInIdx, token]);

  
  // 로그인
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      getUserIdx(token); // 토큰이 있으면 사용자 user_idx 가져오기
    }
  }, []);

const getUserIdx = async (token) => {
  try {
    const API_URL = `${LOCAL_API_BASE_URL}/users/profile`;
    console.log("유저 정보 요청 URL:", API_URL);

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰 사용
      },
    });

    console.log("유저 정보 응답 데이터:", response.data);

    if (response.data.success) {
      const userIdx = response.data.data.user_idx; // user_idx 추출
      const userName = response.data.data.username;
      setlogInName(userName);
      setlogInIdx(userIdx); // response에서 받아온 userIdx를 설정
      console.log("user_idx:", userIdx, "userName:", userName);
    }
  } catch (error) {
    console.error("유저 정보 가져오기 실패:", error.message || error);
  }
};

  // 예약하기 버튼 클릭 처리
const reserveClick = (id) => {

  const token = getCookie("token"); // 쿠키에서 토큰 가져오기
  const user = getCookie("user");  // 쿠키에서 사용자 정보 가져오기

  if (!token || !user) {
    alert("로그인이 필요합니다."); // 로그인 상태가 아닐 경우 알림 표시
    
    return;
  }


  // 예약 페이지로 이동하거나 예약 API 호출
  console.log("예약하기 버튼 클릭");
  alert("예약 페이지로 이동합니다."); 
  // 예: 예약 페이지로 이동
  
  router.push(`/reservation?id=${id}&name=${encodeURIComponent(data?.facltNm)}&price=${data?.price}`);
};

  // 캠핑장 위치 정보로 지역명 생성
  const region = `${data?.doNm} ${data?.sigunguNm}`;

  // 리뷰 작성후 바로 리뷰탭으로 이동
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    const savedOrder = localStorage.getItem("sortReviews");
    if (savedTab) {
      setActiveTab(savedTab);
      localStorage.removeItem("activeTab"); // 일회성 사용 후 삭제
    }
    if(savedOrder) {
      sortReviews(savedOrder);
      localStorage.removeItem("sortRevies")
    }
  }, []); 

  // 찜하기 버튼 클릭 처리
  const saveClick = async () => {
    if (!logInIdx) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      return;
    }
  
    const reviewLike = new FormData();
    reviewLike.append("contentId", id);
    reviewLike.append("user_idx", logInIdx);
  
    try {
      const response = await axios.post("http://localhost:8080/api/like/update", reviewLike, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        setIsSaved((prevState) => !prevState); // 상태 반전
        alert(isSaved ? "찜하기 취소" : "찜하기 추가");
      } else {
        alert("오류발생");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    }
  };
  // 리뷰 목록
  useEffect(() => {
    // 리뷰 데이터를 가져오는 함수
    const getList = async () => {
      try {
          const response = await axios.get(`http://localhost:8080/api/review/list/${id}`); // axios를 사용한 API 호출
          setList(response.data);
      } catch (err2) {
          console.error("Error fetching data:", err2);
          setError(err2.message);
      } finally {
          setReviewLoading(false); // 로딩 상태 종료
      }
  };
    getList(); // 데이터 가져오기
  }, [id]); // id가 변경되면 데이터 다시 가져오기
   // 탭 상태 관리
   const [activeTab, setActiveTab] = useState("intro");

  // 리뷰 정렬 함수
  const sortReviews = (order) => {
    let sortedReviews = [...list];
    if (order === "latest") {
      sortedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 최신순
      setIsActive(order);
    } else if (order === "highRating") {
      sortedReviews.sort((a, b) => b.rating - a.rating); // 평점 높은 순
      setIsActive(order);
    } else if (order === "lowRating") {
      sortedReviews.sort((a, b) => a.rating - b.rating); // 평점 낮은 순
      setIsActive(order);
    }
    setList(sortedReviews);
    setSortOrder(order); // 정렬 기준 업데이트
  };

  const handleUpdate = (id, item) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        title: item.title,        
        rating: item.rating,
        content: item.content,
        review_idx: item.review_idx,
        user_idx: item.user_idx,
        file: item.filename
      },
    }));

    setIsUpdateVisible((prev) => ({ ...prev, [id]: !prev[id] }));
    if(item.filename !== null){
      setIsImageVisible((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };
  
  // 리뷰 삭제
  const handleDelete = async (review_idx) => {
    const API_URL = `${LOCAL_API_BASE_URL}/review/delete/${review_idx}`;
    console.log(review_idx)
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            alert(response.data.message);
            localStorage.setItem("activeTab", "reviews");
            localStorage.setItem("sortReviews", "latest");
            window.location.reload();
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error("delete error");
    }
}

  useEffect(() => {
    // 데이터를 가져오는 함수
    const fetchData = async () => {
      try {
        const campground = await fetchCampgroundById(id); // fetchCampgroundById 호출
        if (!campground) {
          throw new Error("캠핑장 데이터를 찾을 수 없습니다.");
        }
        setData(campground); // 데이터 설정
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("데이터를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };
    
    fetchData(); // 데이터 가져오기
  }, [id]); // id가 변경되면 데이터 다시 가져오기

  //  새로 넣은거
  const handleButtonClick = () => {
    setActiveTab("location");
  };

  if (reviewLoading || loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  // 주요 시설 정보 매핑
  const getFacilityInfo = () => {
    if (!data || !data.induty) return []; // 방어 코드 추가
    const facilities = [];
    if (data.induty?.includes("일반야영장")) {
      facilities.push({ name: "일반 야영장", value: data.gnrlSiteCo });
    }
    if (data.induty?.includes("자동차야영장")) {
      facilities.push({ name: "자동차 야영장", value: data.autoSiteCo });
    }
    if (data.induty?.includes("글램핑")) {
      facilities.push({ name: "글램핑", value: data.glampSiteCo });
    }
    if (data.induty?.includes("카라반")) {
      facilities.push({ name: "카라반", value: data.caravSiteCo });
    }
    if (data.induty?.includes("개인 카라반")) {
      facilities.push({ name: "개인 카라반", value: data.indvdlCaravSiteCo });
    }
    return facilities;
  };
  const facilityInfo = getFacilityInfo();

  // 별점 선택 
  const MAX_RATING = 5;
  const handleRatingClick = (newRating) => {
    setRating(newRating); // 현재 별점을 업데이트
    console.log(`새로운 별점: ${newRating}`);
  };

  // 글쓰기 버튼 클릭 시 화면 토글
  const toggleWriteScreen = () => {
    setIsWriteVisible(!isWriteVisible);
  };
  
  const handleChange = (e) => {
      const {name, value} = e.target;
      setFormData((prev) => ({
          ...prev, [name]:value
      }));
  }
  // 파일 전송 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          file: file, // 파일명 저장
          imagePreview: reader.result, // 이미지 미리보기 저장
        }));
      };
      reader.readAsDataURL(file); // 파일을 Data URL로 읽어 이미지 미리보기 가능하게 함
    }
    setSelectedFile(file);
  };
  // 리뷰 글쓰기 전송
  const handleSubmit = async() => {
    try{
      let fileIdx = null;
      // 1. 파일 업로드 (선택된 파일이 있는 경우)
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", selectedFile);
        const fileResponse = await axios.post(
          `http://localhost:8080/api/review/review/upload`,
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (fileResponse.status === 200) {
          fileIdx = fileResponse.data.file_idx; // 서버에서 반환된 file_idx
          console.log("파일 업로드 성공: file_idx =", fileIdx); // 확인용 로그
        } else {
          throw new Error("파일 업로드 실패");
        }
      }
      // 2. 리뷰 등록
      const API_URL = `${LOCAL_API_BASE_URL}/review/write`;
      const formdata = new FormData();
      formdata.append("title", formData.title)
      formdata.append("user_idx", logInIdx)
      formdata.append("username", logInName)
      formdata.append("rating", rating)
      formdata.append("contentId", id)
      formdata.append("content", formData.content)
      if (fileIdx) {
        formdata.append("file_idx", fileIdx); // 업로드된 파일 ID 추가
      }
      const response = await axios.post(API_URL, formdata, {
          headers:{
              Authorization: `Bearer ${token}`,
              "Content-Type" : "multipart/form-data"
          }
          });
      const newReview = response.data.review;
          setList((prevList) => [...prevList, newReview]);
          if (response.data.success) {
              alert(response.data.message);
          }else{
              alert(response.data.message);
          }
      } catch (error){
          alert("오류발생")
          console.log(error);
      } finally{
          localStorage.setItem("activeTab", "reviews");
          window.location.reload();
      }
  }
  // 리뷰 업데이트 전송
  const handleUpdateSubmit = async(review_idx, file_idx) => {
    const fileUrl = `http://localhost:8080/api/review/review/update-file/${file_idx}`;
    if (selectedFile) {
      console.log("파일 업데이트 시작...");
      const fileFormData = new FormData();
      fileFormData.append("file", selectedFile);

      const fileResponse = await fetch(fileUrl, {
        method: "POST",
        body: fileFormData,
      });

      if (!fileResponse.ok) {
        const error = await fileResponse.text();
        console.error("파일 업데이트 실패:", error);
        alert(`파일 업데이트 실패: ${error}`);
        return;
      }

      console.log("파일 업데이트 성공");
    }
    
    const API_URL = `${LOCAL_API_BASE_URL}/review/update/${review_idx}`;
      const formdata = formData[review_idx];
      console.log(formdata);
      try{
          const response = await axios.post(API_URL, formdata, {
              headers:{
                  Authorization: `Bearer ${token}`,
                  "Content-Type" : "multipart/form-data"
              }
          });
          if (response.data.success) {
              alert(response.data.message);
          }else{
              alert(response.data.message);
          }
      } catch (error){
          alert("오류발생")
          console.log(error);
      } finally{
          localStorage.setItem("activeTab", "reviews");
          window.location.reload();
      }
  }
  const prepareFormData = (id, updates) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}), // 기존 데이터 유지
        ...updates,          // 새로운 데이터 병합
      },
    }));
  };
  const updateRatingClick = (id, rating) => {
    prepareFormData(id, { rating });
  };
  const updateChange = (e, id) => {
    const { name, value } = e.target;
    prepareFormData(id, { [name]: value });
  };
    // 로딩 중에는 버튼 비활성화
    if (loading) {
      return <Button disabled>로딩 중...</Button>;
    }

  return (
    <div>
  
      {data ? (
        <>
          <div
            id="camping-inner"
            style={{
              width: "100%",
              backgroundColor: "#f9f9f5",
              color: "black",
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundImage: "url(/images/cam1.webp)", // 배경 이미지
                backgroundSize: "cover", // 이미지 크기 조정
                backgroundPosition: "center",
                height: "250px",
                flexDirection: "column", // 세로로 정렬
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  height: "150px",
                  width: "800px",
                  marginTop: "70px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <p style={{ fontSize: "2rem" }}>{data.facltNm}</p>
                  <p style={{ fontSize: "20px" }}>{data.lineIntro}</p>
                </div>
              </div>
            </div>
            <div className="camping_layout">
              <div className="camping_info_box">
                <div className="img_b">
                  <img src={data.firstImageUrl} alt="" />
                </div>
                <div
                  className="content_tb"
                  style={{ backgroundColor: "white", padding: "5px" }}
                >
                  <table className="table">
                    <colgroup>
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "70%" }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th scope="col">주소</th>
                        <td>{data.addr1}</td>
                      </tr>
                      <tr>
                        <th scope="col">문의처</th>
                        <td>{data.tel}</td>
                      </tr>
                      <tr>
                        <th scope="col">캠핑장 유형</th>
                        <td>{data.induty}</td>
                      </tr>
                      <tr>
                        <th scope="col">가격</th>
                        <td>{data.price}원</td>
                      </tr>
                      <tr>
                        <th scope="col">캠핑장 시설정보</th>
                        <td>{data.sbrsCl}</td>
                      </tr>
                      <tr>
                        <th scope="col">홈페이지</th>
                        <td>
                          <a
                            href={data.homepage}
                            target="_BLANK"
                            title="새창열림"
                          >
                            홈페이지 바로가기
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="col">주변이용가능시설</th>
                        <td>{data.posblFcltyCl}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="btn">
                    <Button
                      type="button"
                      className="reserve"
                      onClick={() => reserveClick(data.contentId)}
                    >
                      <AddToHomeScreenIcon />
                      예약하기
                    </Button>
                    <Button type="button" className="save" onClick={saveClick}>
                      {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      찜하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="camping-info">
            <div className="tabs">
              <Button
                className={`tab-button ${
                  activeTab === "intro" ? "active" : ""
                }`}
                onClick={() => setActiveTab("intro")}
                sx={{ color: "black" }}
              >
                캠핑장 소개
              </Button>
              <Button
                className={`tab-button ${
                  activeTab === "usage" ? "active" : ""
                }`}
                onClick={() => setActiveTab("usage")}
                sx={{ color: "black" }}
              >
                이용안내
              </Button>
              <Button
                className={`tab-button ${activeTab === "location" ? "active" : ""}`}
                onClick={handleButtonClick}
                sx={{ color: "black" }}
              >
                날씨/위치정보
              </Button>
              <Button
                className={`tab-button ${
                  activeTab === "reviews" ? "active" : ""
                }`}
                onClick={() => setActiveTab("reviews")}
                sx={{ color: "black" }}
              >
                캠핑&여행후기
              </Button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === "intro" && (
              <div id="intro">
                <div>
                  <p>{data.intro}</p>
                </div>
                {/* 시설 아이콘 */}
                <div>
                  <h2 className="camping-info-list">
                    <ChevronRightIcon className="rightIcon" /> 캠핑장 시설 정보
                  </h2>
                  <div
                    className="camping-item-facilities"
                    style={{
                      display: "flex",
                      gap: "50px",
                      paddingTop: "20px",
                      paddingLeft: "20px",
                      border: "1px solid #fff",
                      backgroundColor: "#f1f1f1",
                    }}
                  >
                    {data.sbrsCl &&
                      data.sbrsCl.split(",").map((facility, idx) => {
                        switch (facility.trim()) {
                          case "운동시설":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <FitnessCenterIcon
                                  style={{ fontSize: "30px", color: "#3f51b5" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  운동시설
                                </p>
                              </div>
                            );
                          case "전기":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <ElectricBoltIcon
                                  style={{
                                    fontSize: "30px",
                                    color: "#FADA7A",
                                  }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  전기
                                </p>
                              </div>
                            );
                          case "무선인터넷":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Wifi
                                  style={{ fontSize: "30px", color: "#00bcd4" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  무선인터넷
                                </p>
                              </div>
                            );
                          case "장작판매":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <ShoppingCart
                                  style={{ fontSize: "30px", color: "#8bc34a" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  장작판매
                                </p>
                              </div>
                            );
                          case "온수":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <LocalFireDepartment
                                  style={{ fontSize: "30px", color: "#ff5722" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  온수
                                </p>
                              </div>
                            );
                          case "트렘폴린":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <ChildCare
                                  style={{ fontSize: "30px", color: "#EE66A6" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  트렘폴린
                                </p>
                              </div>
                            );
                          case "물놀이장":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Pool
                                  style={{ fontSize: "30px", color: "#009688" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  물놀이장
                                </p>
                              </div>
                            );
                          case "놀이터":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <ChildCare
                                  style={{ fontSize: "30px", color: "#673ab7" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  놀이터
                                </p>
                              </div>
                            );
                          case "산책로":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <HikingIcon
                                  style={{ fontSize: "30px", color: "#4caf50" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  산책로
                                </p>
                              </div>
                            );
                          case "운동장":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <SportsSoccer
                                  style={{ fontSize: "30px", color: "#ff5722" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  운동장
                                </p>
                              </div>
                            );
                          case "마트":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Store
                                  style={{ fontSize: "30px", color: "#9e9e9e" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  마트
                                </p>
                              </div>
                            );
                          case "편의점":
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Store
                                  style={{ fontSize: "30px", color: "#607d8b" }}
                                />
                                <p
                                  style={{
                                    marginTop: "5px",
                                    textAlign: "center",
                                    color: "black",
                                  }}
                                >
                                  편의점
                                </p>
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                  </div>
                </div>
                <div>
                  <h2 className="camping-info-list">
                    <ChevronRightIcon className="rightIcon" /> 기타 주요 시설
                  </h2>
                  <div className="etc-table">
                    <table className="table">
                      <colgroup>
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "70%" }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="col">주요시설</th>
                          <td>
                            {facilityInfo.map((facility, index) => (
                              <span key={index}>
                                {facility.name}({facility.value}면)
                                {index < facilityInfo.length - 1 && " ● "}
                              </span>
                            ))}
                          </td>
                        </tr>      
                        <tr>
                          <th scope="col">기타 부대시설</th>
                          <td>{data.sbrsEtc != "" ? data.sbrsEtc : '정보 없음'}</td>
                        </tr>
                        {data.induty &&
                      data.induty.split(",").map((facility, idx) => {
                        switch (facility.trim()) {
                          case "카라반":
                            return (
                              <tr key={idx}>
                               <th scope="col">카라반 내부시설</th>
                               <td>{data.caravInnerFclty}</td>
                              </tr>
                            );
                          case "글램핑":
                            return (
                              <tr key={idx}>
                               <th scope="col">{data.induty} 내부시설</th>
                               <td>{data.glampInnerFclty}</td>
                              </tr>
                            )
                          default:
                            return null;
                        }
                      })}
                        <tr>
                          <th scope="col">입지 구분</th>
                          <td>{data.lctCl}</td>
                        </tr>
                        <tr>
                          <th scope="col">반려동물 출입</th>
                          <td>{data.animalCmgCl}</td>
                        </tr>
                        <tr>
                          <th scope="col">화로대</th>
                          <td>{data.brazierCl}</td>
                        </tr>
                        <tr>
                          <th scope="col">안전시설현황</th>
                          <td>
                            <a
                              href={data.homepage}
                              target="_BLANK"
                              title="새창열림"
                            >
                              홈페이지 바로가기
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div></div>
              </div>
            )}

            {activeTab === "usage" && (
              <div id="usage">
                <h2>이용안내</h2>
                <ul>
                  <li>예약은 온라인으로만 가능합니다.</li>
                  <li>체크인은 오후 3시, 체크아웃은 오전 11시입니다.</li>
                  <li>애완동물은 동반이 불가합니다.</li>
                </ul>
              </div>
            )}

            {activeTab === "location" && (
              <div id="location">
                 <h1>지도</h1>
                 <KakaoMap
                latitude={data.mapY} // DB에서 불러온 위도
                 longitude={data.mapX} // DB에서 불러온 경도
                />
                <p>{data.addr1}</p>
                <p>{data.direction}</p>
                <h1>날씨</h1>
                <Weather region={region} />
              </div>
            )}

            {activeTab === "reviews" && (
              <div id="reviews" style={{position:"relative", overflow:"hidden"}}>
                <div className="review-option">
                <h2>캠핑이용후기</h2>
                <div className="sort-buttons">
                  <Button
                    className={sortOrder === "latest" ? "active" : ""}
                    onClick={() => sortReviews("latest")}
                    style={{
                      border: "none", /* 테두리 제거 */
                      background: "none", /* 배경 제거 (선택 사항) */
                      padding: "10px", /* 패딩 제거 (선택 사항) */
                      outline: "none", /* 포커스 시 생기는 외곽선 제거 */
                      color: "#000",
                      fontWeight: isActive === "latest" ? 'bold' : 'normal'  
                    }}
                  >
                    최신순
                  </Button>
                  <Button
                    className={sortOrder === "highRating" ? "active" : ""}
                    onClick={() => sortReviews("highRating")}
                    style={{
                      border: "none", /* 테두리 제거 */
                      background: "none", /* 배경 제거 (선택 사항) */
                      padding: "10px", /* 패딩 제거 (선택 사항) */
                      outline: "none", /* 포커스 시 생기는 외곽선 제거 */
                      color: "#000",
                      fontWeight: isActive === "highRating"? 'bold' : 'normal'  
                    }}
                  >
                    평점 높은 순
                  </Button>
                  <Button
                    className={sortOrder === "lowRating" ? "active" : ""}
                    onClick={() => sortReviews("lowRating")}
                    style={{
                      border: "none", /* 테두리 제거 */
                      background: "none", /* 배경 제거 (선택 사항) */
                      padding: "10px", /* 패딩 제거 (선택 사항) */
                      outline: "none", /* 포커스 시 생기는 외곽선 제거 */
                      color: "#000",
                      fontWeight: isActive === "lowRating"? 'bold' : 'normal'  
                    }}
                  >
                    평점 낮은 순
                  </Button>
                </div>
                </div>
                        {list.length === 0 ?
                            <div>
                                <h3>등록된 리뷰가 없습니다. 첫번째 리뷰의 주인공이 되어보세요!</h3>
                            </div>
                            : list.map((item) => (
                                <div key={item.review_idx} className="review-box">
                                   
                                      <div className="review-stars">
                                          {[...Array(MAX_RATING)].map((_, i) => (
                                            <PiStarFill
                                              key={i}
                                              className={i < `${item.rating}` ? "yellow-star" : "svg"}
                                            />
                                          ))}
                                          <span className="review-rating">{item.rating}/{MAX_RATING}</span>
                                      </div>
                              
                                    <div className="review-writer">
                                      {item.username} {item.created_at}
                                    </div>
                                    <div className="review-body">
                                          <div className="title-content">
                                            <h3 className="review-title">
                                              {item.title}
                                            </h3>
                                            
                                            <div className="review-content">
                                              {item.content}
                                            </div>
                                          </div>
                                          <div className="review-img">
                                            {item.file_name ? (
                                              <img src={`http://localhost:8080/images/${item.file_name}`} alt="uploaded image"/>
                                            ) : (
                                              // 파일이 없으면 이미지 부분을 아예 렌더링하지 않음
                                              <p></p> // 이 부분은 선택 사항입니다. 파일이 없을 때의 대체 콘텐츠를 추가할 수 있습니다.
                                            )}
                                          </div>
                                    </div>
                                      <div className="update-delete">
                                        {logInIdx === item.user_idx && (
                                            <>
                                              <Button
                                                variant="contained"
                                                style={{backgroundColor:"#375b9c", margin : "5px"}}
                                                onClick={() => handleUpdate(item.review_idx, item)}
                                              >
                                                수정
                                              </Button>
                                              <Button
                                                variant="contained"
                                                style={{backgroundColor:"#e87373"}}
                                                onClick={() => handleDelete(item.review_idx)}
                                              >
                                                삭제
                                              </Button>
                                            </>
                                          )}
                                      </div>
                                    <div>
                                      {isUpdateVisible[item.review_idx] && (
                                        <div className="review-write">
                                          <h2 className="write-title">
                                            <div><ChevronRightIcon className="rightIcon" /> 캠핑/여행후기 수정</div>
                                            {/* 별점 표시 */}
                                            <div className="stars">
                                              {[...Array(MAX_RATING)].map((_, i) => (
                                                <PiStarFill
                                                  key={i}
                                                  className={i < (formData[item.review_idx]?.rating || 0) ? "yellow-star" : "svg"}
                                                  onClick={() => updateRatingClick(item.review_idx, i + 1)}
                                                />
                                              ))}
                                              {formData[item.review_idx]?.rating || 0}/{MAX_RATING}
                                            </div>
                                          </h2>
                                          <TextField
                                            label="제목"
                                            name="title"
                                            value={formData[item.review_idx]?.title || ""}
                                            onChange={(e) => updateChange(e, item.review_idx)}
                                            fullWidth
                                            margin="normal"
                                          />
                                         
                                          <div>
                                              <label
                                                  htmlFor="file"
                                                  style={{
                                                      display: 'block',
                                                      marginBottom: '10px',
                                                      cursor: 'pointer',
                                                  }}
                                              >
                                                  사진 첨부(클릭하시오)
                                              </label>
                                              <div onClick={() => handleImageClick(item.review_idx)} style={{ cursor: 'pointer' }}>
                                                  {previewImage[item.review_idx] || item.file_name ? (
                                                  <Image
                                                      src={previewImage[item.review_idx] || `http://localhost:8080/images/${item.file_name}`}
                                                      alt="Uploaded Image"
                                                      width={300}
                                                      height={200}
                                                  />
                                              ) :(
                                                <div style={{
                                                  width: "300px",
                                                  height: "200px",
                                                  backgroundColor: "#ffffff",
                                                  textAlign: "center",
                                                  lineHeight: "200px",
                                                  color: "#888"
                                                }}>
                                                  ### 사진 첨부 가능 ###
                                                </div>
                                              )}
                                              </div>
                                              <input
                                                  id="file"
                                                  type="file"
                                                  className="none"
                                                  ref={fileInputRef}
                                                  onChange={(e) => onFileChange(e, item.review_idx)}
                                                  style={{ display: 'none', marginBottom: '10px' }}
                                              />
                                          </div>
                                          <SimpleMDE 
                                            value={formData[item.review_idx]?.content || ""}
                                            onChange={(value) =>
                                              prepareFormData(item.review_idx, { content: value })
                                            }
                                          />
                                          <Button 
                                            variant="contained" 
                                            style={{ marginTop: "20px", float : "right", margin : "10px"}} 
                                            onClick={() => handleUpdateSubmit(item.review_idx, item.file_idx)}
                                          >
                                            저장
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                </div>
                                // 수정 페이지 들어갈곳
                                        
                            ))}
              {isAuthenticated && (
              <Button 
                  onClick={toggleWriteScreen}
                  variant="contained" 
                  className="write-button"
                  style={{float:"right", margin : "10px", backgroundColor:"#375b9c"}}
                >
                글쓰기
              </Button>
              )}
              {isWriteVisible && (
                <div className="review-write">
                  <h2 className="write-title">
                    <div><ChevronRightIcon className="rightIcon" /> 캠핑/여행후기</div>
                    {/* 별점 표시 */}
                    <div className="stars">
                      {[...Array(MAX_RATING)].map((_, i) => (
                        <PiStarFill
                          key={i}
                          className={i < rating ? "yellow-star" : "svg"}
                          onClick={() => 
                            handleRatingClick(i+1)
                          }
                        />
                      ))}
                      {rating}/{MAX_RATING}
                    </div>
                  </h2>
                  <TextField
                    label="제목"
                    name="title"
                    value={formData.title}
                    onChange={handleChange} // 값 처리 예시
                    fullWidth
                    margin="normal"
                  />
                  {/* 파일 선택 후 미리보기 표시 */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ marginBottom: "10px" }}
                  />
                  {formData.imagePreview && (
                    <div>
                      <img
                        src={formData.imagePreview} // 미리보기 이미지
                        alt="Image Preview"
                        style={{ width: "150px", height: "100px", marginTop: "10px" }}
                      />
                    </div>
                  )}
                  <SimpleMDE 
                    value={formData.content}
                    onChange={(value)=>setFormData((prev)=>({...prev, content:value}))}
                  />
                  <Button variant="contained" color="primary" style={{ marginTop: "20px", float:"right" }} onClick={handleSubmit} >
                    저장
                  </Button>
                </div>
              )}
              </div>
            )}
          </div>
        </>
      ) : (
        <p>로딩 중...</p>
      )}
      
    </div>
  );
}
