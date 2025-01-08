"use client";
import React, { useEffect, useState, useRef } from "react";

const KakaoMap = ({ latitude, longitude }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const mapRef = useRef(null); // 지도 객체를 저장할 ref

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=82653f2edcf163a11fb5d8dc0dab9587&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const { kakao } = window;

        const container = document.getElementById("map");
        const options = {
          center: new kakao.maps.LatLng(latitude, longitude),
          level: 5,
        };

        const map = new kakao.maps.Map(container, options);
        mapRef.current = map;

        const campingMarkerPosition = new kakao.maps.LatLng(latitude, longitude);
        const campingMarker = new kakao.maps.Marker({
          position: campingMarkerPosition,
        });
        campingMarker.setMap(map);

        const fetchPharmacies = async () => {
          try {
            const response = await fetch(
              "https://apis.data.go.kr/B551182/pharmacyInfoService/getParmacyBasisList?serviceKey=0nU1JWq4PQ1i5sjvesSwir9C4yWQy66K695whewvIpbxtuV1H5ZU8gDIp4c0N9rL4Yt4wQU5eLviLsHKxks9rg%3D%3D&pageNo=1&numOfRows=1000&xPos=127.0965441345503&yPos=37.60765568913871&radius=470000"
            );

            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");

            // 거리 계산 함수 (Haversine Formula)
            const calculateDistance = (lat1, lon1, lat2, lon2) => {
              const R = 6371; // 지구 반지름(km)
              const dLat = ((lat2 - lat1) * Math.PI) / 180;
              const dLon = ((lon2 - lon1) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat1 * Math.PI) / 180) *
                  Math.cos((lat2 * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c; // 두 지점 간 거리(km)
            };

            // 5km 이내의 약국 필터링
            const pharmacyList = Array.from(items)
              .map((item) => {
                const yPos = parseFloat(
                  item.getElementsByTagName("YPos")[0].textContent
                );
                const xPos = parseFloat(
                  item.getElementsByTagName("XPos")[0].textContent
                );
                const yadmNm = item.getElementsByTagName("yadmNm")[0].textContent;

                const distance = calculateDistance(latitude, longitude, yPos, xPos);
                return { yPos, xPos, yadmNm, distance };
              })
              .filter((pharmacy) => pharmacy.distance <= 5); // 5km 이내 필터링

            console.log("5km 이내 약국 정보:", pharmacyList);
            setPharmacies(pharmacyList);
          } catch (error) {
            console.error("약국 정보 로딩 실패", error);
          }
        };

        fetchPharmacies();
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (pharmacies.length > 0 && mapRef.current) {
      const { kakao } = window;
      const map = mapRef.current;

      pharmacies.forEach((pharmacy) => {
        const { xPos, yPos, yadmNm } = pharmacy;
        const markerPosition = new kakao.maps.LatLng(yPos, xPos);

        const redMarkerImage = new kakao.maps.MarkerImage(
          "/images/red.png",
          new kakao.maps.Size(64, 69),
          {
            offset: new kakao.maps.Point(27, 69),
          }
        );

        const marker = new kakao.maps.Marker({
          position: markerPosition,
          image: redMarkerImage,
        });

        marker.setMap(map);

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;z-index:1;">${yadmNm}</div>`,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      });
    }
  }, [pharmacies]);

  return <div id="map" style={{ width: "100%", height: "400px" }} />;
};

export default KakaoMap;
