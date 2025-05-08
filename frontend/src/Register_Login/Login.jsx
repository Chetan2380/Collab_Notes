import React, { useContext, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import Api from '../axiosconfig';
import { AuthContext } from '../context/user.context';
import Navbar from '../Navbar/Navbar';

const Login = () => {
    const {state,dispatch}=useContext(AuthContext);

    const router=useNavigate();
    const[userData, setUserData]=useState({
        email:"",
        password:"",
    });

    console.log(userData,"userData");
    function handleChange(event){
        setUserData({ ...userData, [event.target.name]: event.target.value});
    }
    async function handleSubmit(e) {
        e.preventDefault();
        try {
          if (userData.email && userData.password) {
              const response = await Api.post("/user/login" , {userData});
            if (response.data.success) {
              dispatch({ type: "LOGIN", payload: response.data.userData });
              setUserData({
                email: "",
                password: "",
              });
              router("/");
              toast.success(response.data.message);
            } else {
              toast.error(response?.data?.error)
            }
          } else {
            throw Error("All fields are mandatory.");
          }
        } catch (error) {
          console.log(error, "error");
          toast.error(error?.response?.data?.error);
        }
      }
      return (
        <div>
          <Navbar/>
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1 className="login-heading">Login</h1>
                <label className="login-label">Email:</label><br />
                <input className="login-input" type='email' name='email' onChange={handleChange} value={userData.email} /><br />
                <label className="login-label">Password:</label><br />
                <input className="login-input" type='password' name='password' onChange={handleChange} value={userData.password} /><br />
                <input className="login-submit" type='submit' value="Login" />
                <p>Don't have account. <span onClick={()=>router("/register")}><b><u>Create Account</u></b></span></p>
            </form>
        </div>
        </div>
    );
}

export default Login