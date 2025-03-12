import React, { useContext, useEffect } from 'react';
import {Link, useLocation} from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';

//Import 
import { SVGICON } from '../../constant/theme';
import MainSlider from '../../elements/dashboard/MainSlider';
import StatisticsBlog from '../../elements/dashboard/StatisticsBlog';
import MarketOverViewBlog from '../../elements/dashboard/MarketOverViewBlog';
import RecentTransaction from '../../elements/dashboard/RecentTransaction';
import { ThemeContext } from '../../../context/ThemeContext';

export function MainComponent(){
	return(
		<Row>
			<Col xl={12}>			
				<div className="row main-card">
					<MainSlider />
				</div>
				<Row>
					<div className="col-xl-6">
						<div className="card crypto-chart">
							<div className="card-header pb-0 border-0 flex-wrap">
								<div className="mb-0">
									<h4 className="card-title">Crypto Statistics</h4>
									<p>Lorem ipsum dolor sit amet, consectetur</p>
								</div>
								<div className="d-flex mb-2">
									<div className="form-check form-switch toggle-switch me-3">
										<label className="form-check-label" htmlFor="flexSwitchCheckChecked1">Date</label>
										<input className="form-check-input custome" type="checkbox" id="flexSwitchCheckChecked1" defaultChecked />
									</div>
									<div className="form-check form-switch toggle-switch">
										<label className="form-check-label" htmlFor="flexSwitchCheckChecked2">Value</label>
										<input className="form-check-input custome" type="checkbox" id="flexSwitchCheckChecked2" defaultChecked />
									</div>
								</div>
							</div>
							<StatisticsBlog />
						</div>
					</div>
					<div className="col-xl-6">
						<div className="card market-chart">
							<div className="card-header border-0 pb-0 flex-wrap">
								<div className="mb-0">
									<h4 className="card-title">Market Overview</h4>
									<p>Lorem ipsum dolor sit amet, consectetur</p>
								</div>
								<Link to={"#"} className="btn-link text-primary get-report mb-2">
									{SVGICON.GetReportIcon}
									Get Report
								</Link>
							</div>
							<MarketOverViewBlog />
						</div>
					</div>
				</Row>
				<Col lg={12}>
					<RecentTransaction /> 
				</Col>
			</Col>
		</Row>
	)
}

const Home = () => {	
	const { changeBackground } = useContext(ThemeContext);
	useEffect(() => {
		changeBackground({ value: "light", label: "Light" });
	}, []);	
	return(
		<>
			<MainComponent />
		</>
	)
}
 
export default Home ;