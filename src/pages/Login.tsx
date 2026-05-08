import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  

  try {
const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/login`,{
      name,
      password,
    });

    console.log("FULL RESPONSE 👉", res);
    console.log("DATA 👉", res.data);
    console.log("TOKEN 👉", res.data.token);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("krishi_user", res.data.user.name);

    console.log("SAVED TOKEN 👉", localStorage.getItem("token"));

    navigate("/dashboard");
  } catch (err) {
    console.log("ERROR ❌", err.response || err);
  }
};

 return (
  <form
  onSubmit={(e) => {
    e.preventDefault();
    console.log("FORM SUBMITTED ✅"); // 👈 DEBUG
    handleLogin();
  }}
>
  <h2>Login</h2>

  <input
    placeholder="Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />

  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button type="submit">Login</button>
</form>
);
};

export default Login;