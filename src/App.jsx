import { lazy, Suspense, useEffect } from 'react';
/// Components
import Index from './jsx/router/index';
import {  Route, Routes, useLocation , useNavigate , useParams } from 'react-router-dom';
// action
import { checkAutoLogin} from './services/AuthService';
/// Style
import 'rsuite/dist/rsuite-no-reset.min.css';
import "./assets/css/style.css";
import Home from "./jsx/pages/dashboard/Home.tsx";

const SignUp = lazy(() => import('./jsx/pages/authentication/Registration'));
const Login = lazy(() => {
    return new Promise(resolve => {
		setTimeout(() => resolve(import('./jsx/pages/authentication/Login.tsx')), 500);
	});
});

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
      let location = useLocation();
      let navigate = useNavigate();
      let params = useParams();
      
      return (
        <Component
          {...props}
          router={{ location, navigate, params }}
        />
      );
    }
  
    return ComponentWithRouterProp;
}

function App (props) {
  
    
    let routeblog = (  
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={<Login />} />
            <Route path='/page-register' element={<SignUp />} />
            <Route  path='/dashboard' element={<Home />} />    
            <Route  path='/' element={<Login />} />  
        </Routes>
    );
    if (localStorage.getItem("login")) {
		return (
			<>
                <Suspense fallback={
                    <div id="preloader">
                        <div className="sk-three-bounce">
                            <div className="sk-child sk-bounce1"></div>
                            <div className="sk-child sk-bounce2"></div>
                            <div className="sk-child sk-bounce3"></div>
                        </div>
                    </div>  
                   }
                >
                    <Index />
                </Suspense>
            </>
        );
	
	}else{
		return (
			<div className="vh-100">
                <Suspense fallback={
                    <div id="preloader">
                        <div className="sk-three-bounce">
                            <div className="sk-child sk-bounce1"></div>
                            <div className="sk-child sk-bounce2"></div>
                            <div className="sk-child sk-bounce3"></div>
                        </div>
                    </div>
                  }
                >
                    {routeblog}
                </Suspense>
			</div>
		);
	}
};

// const mapStateToProps = (state) => {
//     return {
//         isAuthenticated: isAuthenticated(state),
//     };
// };

export default App; 