import axios from 'axios';
import { useCallback } from 'react';

function useApi(token, setData) {
    const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

    // GET 요청 함수
    const getData = useCallback(async (url, params = {}, onSuccess = () => {}, onError = () => {}) => {
        const API_URL = `${LOCAL_API_BASE_URL}${url}`;
        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params, // 쿼리 파라미터 추가
            });

            if (response.data.success) {
                setData(response.data.data);
                console.log(response.data.data);
            }

            // 성공했을 때 실행할 함수 (onSuccess)
            onSuccess(response.data); // 여기서 전달된 콜백 실행
        } catch (error) {
            console.error('Error fetching data:', error);

            // 실패했을 때 실행할 함수 (onError)
            onError(error); // 여기서 전달된 콜백 실행
        }
    }, [LOCAL_API_BASE_URL, token, setData]);

    // POST 요청 함수
    const postData = useCallback(async (url, params = {}, onSuccess = () => {}, onError = () => {}) => {
        const API_URL = `${LOCAL_API_BASE_URL}${url}`;
        try {
            const response = await axios.post(API_URL, params, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(response.data.success);
            if (response.data.success == true) {
                setData(response.data.data);
                console.log(response.data.data);
                // 성공했을 때 실행할 함수 (onSuccess)
                onSuccess(); // 여기서 전달된 콜백 실행
            }

        } catch (error) {
            console.error('Error posting data:', error);

            // 실패했을 때 실행할 함수 (onError)
            onError(error); // 여기서 전달된 콜백 실행
        }
    }, [LOCAL_API_BASE_URL, token, setData]);

    return { getData, postData };
}

export default useApi;
