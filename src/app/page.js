// page,js는 필수 이다. (생략 불가)
// 각 경로(/, /about. /content ..) 마다 페이지리를 랜더링 하려면 해당 경로의 page.js 파일이 반드시 필요하다

import Image from "next/image";
import img01 from "/public/images/tree-1.jpg"
import App from "./main/App";
import Map from "./map/Map";

// 자식컴포넌트
export default function Home() {
  return (
    
  <>
    <App />
    <Map />
  </>
  );
}
