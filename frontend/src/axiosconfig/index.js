import axios from "axios";

const Api = axios.create({
    baseURL: "https://collab-notes-d3ni.onrender.com/api/v1",
    withCredentials: true,
  });
  
  export default Api;