import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { routeWithIcons } from "./utils/routeWithIcons";
import { useLocation } from 'react-router-dom'
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import ProtectedRoutes from "./ProtectedRoutes";
import { IntroPage } from "./components/IntroPage";

const App = () => {
  const location = useLocation()
  const path = location.pathname
  const isLoginOrReg = path === '/' || path === '/register' ||path === '/login'
  const Token = localStorage.getItem('Token')
  const isAuthenticated = Token && Token?.length >0
  return (
    <>
      {
        isLoginOrReg && !isAuthenticated ? (
          <Routes>
            <Route path="/" element={ <IntroPage/>} />
            <Route path="/login" element={ <Login/>} />
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
