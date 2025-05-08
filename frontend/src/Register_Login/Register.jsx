import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import "./Register.css";
import Api from '../axiosconfig';
import Navbar from '../Navbar/Navbar';

const Register = () => {
  const router = useNavigate();
  const [userData, setUserData] = useState({
      name: "",
      email: "",
      password: "",
  });

  const [errors, setErrors] = useState([]);
  const [disable, setDisable] = useState(true);

  function handleChange(event) {
      setUserData({ ...userData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(e) {
      e.preventDefault();
      try {
          if (userData.name && userData.email && userData.password) {
              const response = await Api.post("/user/register", { userData });
              if (response.data.success) {
                  setUserData({
                      name: "",
                      email: "",
                      password: "",
                  });
                  router("/login");
                  toast.success(response.data.message);
              }
          } else {
              toast.error("All fields are mandatory.");
          }
      } catch (error) {
          toast.error(error.response.data.error);
      }
  }

  useEffect(() => {
      const errorsArray = [];
      if (!userData.name) {
          errorsArray.push("Name is required.");
      }
      if (!userData.email) {
          errorsArray.push("Email is required.");
      }
      if (!userData.password) {
          errorsArray.push("Password is required.");
      }
      setErrors(errorsArray);
      if (errorsArray.length === 0) {
          setDisable(false);
      } else {
          setDisable(true);
      }
  }, [userData]);

  return (
    <div>
          <Navbar/>
      <div className="register-container">
          <form className="register-form" onSubmit={handleSubmit}>
              <h1 className="register-heading">Register</h1>
              <label className="register-label">Name:</label><br />
              <input className="register-input" type='text' name='name' onChange={handleChange} value={userData.name} /><br />
              <label className="register-label">Email:</label><br />
              <input className="register-input" type='email' name='email' onChange={handleChange} value={userData.email} /><br />
              <label className="register-label">Password:</label><br />
              <input className="register-input" type='password' name='password' onChange={handleChange} value={userData.password} /><br />
              <input className="register-submit" type='submit' value="Register" disabled={disable} />
          </form>
      </div>
      </div>
  );
}

export default Register