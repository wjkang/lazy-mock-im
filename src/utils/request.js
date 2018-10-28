import axios from 'axios';
import { getToken } from '@/utils/auth';
import baseUrl from '../baseUrl';

// create an axios instance
const service = axios.create({
  baseURL: baseUrl.API, // api的base_url
  timeout: 20000 // request timeout
})

// request interceptor
service.interceptors.request.use(config => {
  // Do something before request is sent
  let token = getToken()
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token// 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
  }
  return config
}, error => {
  // Do something with request error
  //console.log(error) // for debug
  Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.statusCode !== 200) {
      return Promise.reject(res.msg);
    } else {
      return res;
    }
  },
  error => {
    return Promise.reject(error)

  })

export default service



