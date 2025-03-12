import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { MainComponent } from './Home.tsx';

const DashboardDark = () => {
	const { changeBackground } = useContext(ThemeContext);
	useEffect(() => {
		changeBackground({ value: "dark", label: "Dark" });
	}, []);
	
	return(
		<>			
			<MainComponent />			
		</>		
		
	)
}
export default DashboardDark;