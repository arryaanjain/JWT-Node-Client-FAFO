import axios from "axios";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  //creating a new axios instance for 
  const axiosJWT = axios.create()

  //using axios interceptors to add the token to the request
  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwtDecode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { username, password });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to the <span className="text-blue-600 font-bold">{user.isAdmin ? "admin" : "user"}</span> dashboard{" "}
            <span className="text-green-600 font-bold">{user.username}</span>.
          </h2>
          <p className="mb-2 text-gray-700">Delete Users:</p>
          <div className="flex flex-col gap-2">
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
              onClick={() => handleDelete(1)}
            >
              Delete John
            </button>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
              onClick={() => handleDelete(2)}
            >
              Delete Jane
            </button>
          </div>
          {error && (
            <p className="text-red-600 mt-4 font-medium">
              You are not allowed to delete this user!
            </p>
          )}
          {success && (
            <p className="text-green-600 mt-4 font-medium">
              User has been deleted successfully...
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Lama Login</h2>
            <input
              type="text"
              placeholder="Username"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
  
}

export default App;