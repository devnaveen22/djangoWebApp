import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { routeWithIcons } from "./utils/routeWithIcons";
import { useLocation } from 'react-router-dom'
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import ProtectedRoutes from "./ProtectedRoutes";

const App = () => {
  const location = useLocation()
  const path = location.pathname
  const isLoginOrReg = path === '/' || path === '/register'
  return (
    <>
      {
        isLoginOrReg ? (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        )
          : (
            <Navbar
              content={
                <Routes>
                  <Route element={<ProtectedRoutes/>}>
                    {routeWithIcons.map((r, index) => (
                      <Route
                        key={index}
                        path={r.path}
                        element={<r.component />}
                      />
                    ))}
                  </Route>
                </Routes>
              }
            />
          )
      }
    </>
  );
};

export default App;
