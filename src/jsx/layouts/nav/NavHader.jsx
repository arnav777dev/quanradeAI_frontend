import React, { useContext } from "react";
/// React router dom
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";

const NavHader = () => {
  const {  openMenuToggle } = useContext( ThemeContext
  );

 
  return (
    <div className="nav-header">
      	<Link to="/dashboard" className="brand-logo">
          <h3 style={{color:'white'}}>  Quantrade AI </h3>

      </Link>

      <div
        className="nav-control"
        onClick={() => {        
         
          openMenuToggle(); 
        }}
      >
        <div className={`hamburger is-active`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
